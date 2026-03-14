import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function StandardModal({ category, standard, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    practices: []
  });
  const [categoryPractices, setCategoryPractices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategoryPractices();
    if (standard) {
      setFormData({
        name: standard.name || '',
        description: standard.description || '',
        startDate: standard.startDate || new Date().toISOString().split('T')[0],
        endDate: standard.endDate || '',
        practices: standard.practices || []
      });
    }
  }, [category, standard]);

  const loadCategoryPractices = async () => {
    try {
      const data = await api.getCategory(category.id);
      setCategoryPractices(data.practices || []);
      
      // Если это новый стандарт, инициализируем практики с пустыми значениями
      if (!standard) {
        const initialPractices = (data.practices || []).map(p => ({
          practiceId: p.id,
          practiceName: p.name,
          targetValue: null,
          unitType: p.unitType || 'minutes',
          isActive: false
        }));
        setFormData(prev => ({ ...prev, practices: initialPractices }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePracticeChange = (practiceId, field, value) => {
    setFormData(prev => ({
      ...prev,
      practices: prev.practices.map(p => 
        p.practiceId === practiceId ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleTogglePractice = (practiceId) => {
    setFormData(prev => ({
      ...prev,
      practices: prev.practices.map(p => 
        p.practiceId === practiceId ? { ...p, isActive: !p.isActive } : p
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Фильтруем только активные практики с заполненными значениями
      const activePractices = formData.practices
        .filter(p => p.isActive && p.targetValue && p.targetValue > 0)
        .map(p => ({
          practiceId: p.practiceId,
          targetValue: p.targetValue,
          unitType: p.unitType,
          isActive: true
        }));
      
      const standardData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        practices: activePractices
      };
      
      if (standard) {
        await api.updateStandard(standard.id, standardData);
      } else {
        await api.createStandard(category.id, standardData);
      }
      
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const unitTypeOptions = [
    { value: 'minutes', label: 'Минуты' },
    { value: 'times', label: 'Количество раз' },
    { value: 'time', label: 'Время (часы:минуты)' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <h3>{standard ? 'Редактировать стандарт' : 'Создать новый стандарт'}</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название стандарта *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="например: Ядро, Стандарт 1"
            />
          </div>
          
          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Описание стандарта"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Дата ввода стандарта *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Дата вывода стандарта</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
              />
              <small className="field-hint">Оставьте пустым, если стандарт действует бессрочно</small>
            </div>
          </div>
          
          <h4>Практики в стандарте</h4>
          <div className="practices-standard-list">
            {categoryPractices.length === 0 ? (
              <p className="empty-message">Сначала добавьте практики в категорию</p>
            ) : (
              <table className="standard-practices-table">
                <thead>
                  <tr>
                    <th>Включить</th>
                    <th>Практика</th>
                    <th>Значение</th>
                    <th>Тип</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPractices.map(practice => {
                    const practiceData = formData.practices.find(p => p.practiceId === practice.id) || {
                      practiceId: practice.id,
                      practiceName: practice.name,
                      targetValue: null,
                      unitType: practice.unitType || 'minutes',
                      isActive: false
                    };
                    
                    return (
                      <tr key={practice.id}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={practiceData.isActive}
                            onChange={() => handleTogglePractice(practice.id)}
                          />
                        </td>
                        <td>{practice.name}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={practiceData.targetValue || ''}
                            onChange={(e) => handlePracticeChange(
                              practice.id, 
                              'targetValue', 
                              e.target.value ? parseInt(e.target.value) : null
                            )}
                            disabled={!practiceData.isActive}
                            placeholder="0"
                            className="value-input"
                          />
                        </td>
                        <td>
                          <select
                            value={practiceData.unitType}
                            onChange={(e) => handlePracticeChange(practice.id, 'unitType', e.target.value)}
                            disabled={!practiceData.isActive}
                          >
                            {unitTypeOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading || !formData.name || categoryPractices.length === 0}
            >
              {loading ? 'Сохранение...' : (standard ? 'Сохранить изменения' : 'Создать стандарт')}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StandardModal;