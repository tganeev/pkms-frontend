import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function CategoryManagement({ category, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#667eea',
    icon: '📊',
    practices: []
  });
  const [editingPractice, setEditingPractice] = useState(null);
  const [practiceForm, setPracticeForm] = useState({
    name: '',
    description: '',
    unitType: 'minutes',
    displayOrder: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Загружаем данные при монтировании или изменении category.id
  useEffect(() => {
    if (category && category.id) {
      loadCategoryData(category.id);
    } else {
      // Если это создание новой категории, просто устанавливаем пустую форму
      setFormData({
        name: '',
        description: '',
        color: '#667eea',
        icon: '📊',
        practices: []
      });
    }
  }, [category?.id]);

  const loadCategoryData = async (categoryId) => {
    try {
      const data = await api.getCategory(categoryId);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        color: data.color || '#667eea',
        icon: data.icon || '📊',
        practices: data.practices || []
      });
    } catch (err) {
      setError('Ошибка загрузки данных категории: ' + err.message);
    }
  };

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePracticeChange = (e) => {
    setPracticeForm({
      ...practiceForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let savedCategory;
      if (category && category.id) {
        savedCategory = await api.updateCategory(category.id, formData);
        setSuccess('Категория успешно обновлена');
      } else {
        savedCategory = await api.createCategory(formData);
        setSuccess('Категория успешно создана');
      }
      
      // Обновляем formData с полученными данными, включая id
      setFormData({
        name: savedCategory.name || '',
        description: savedCategory.description || '',
        color: savedCategory.color || '#667eea',
        icon: savedCategory.icon || '📊',
        practices: savedCategory.practices || []
      });
      
      // Если это создание новой категории, обновляем category в родителе
      if (!category && savedCategory.id) {
        // Вызываем onUpdate чтобы родитель обновил список категорий
        onUpdate();
      }
      
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPractice = async () => {
    if (!practiceForm.name) {
      setError('Введите название практики');
      return;
    }
    
    if (!category || !category.id) {
      setError('Сначала сохраните категорию');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let savedPractice;
      if (editingPractice) {
        savedPractice = await api.updatePractice(editingPractice.id, practiceForm);
        setSuccess('Практика успешно обновлена');
      } else {
        savedPractice = await api.addPractice(category.id, practiceForm);
        setSuccess('Практика успешно добавлена');
      }
      
      // Обновляем список практик в formData
      const updatedPractices = editingPractice 
        ? formData.practices.map(p => p.id === editingPractice.id ? savedPractice : p)
        : [...formData.practices, savedPractice];
      
      setFormData({
        ...formData,
        practices: updatedPractices
      });
      
      // Сбрасываем форму
      setPracticeForm({ name: '', description: '', unitType: 'minutes', displayOrder: 0 });
      setEditingPractice(null);
      
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPractice = (practice) => {
    setEditingPractice(practice);
    setPracticeForm({
      name: practice.name,
      description: practice.description || '',
      unitType: practice.unitType || 'minutes',
      displayOrder: practice.displayOrder || 0
    });
  };

  const handleDeletePractice = async (practiceId) => {
    if (!window.confirm('Удалить эту практику?')) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await api.deletePractice(practiceId);
      
      // Удаляем практику из списка
      const updatedPractices = formData.practices.filter(p => p.id !== practiceId);
      setFormData({
        ...formData,
        practices: updatedPractices
      });
      
      setSuccess('Практика удалена');
      setTimeout(() => setSuccess(null), 2000);
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
        <h3>{category?.id ? 'Редактировать категорию' : 'Создать категорию'}</h3>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmitCategory}>
          <div className="form-group">
            <label>Название категории *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleCategoryChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleCategoryChange}
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Цвет</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleCategoryChange}
              />
            </div>
            
            <div className="form-group">
              <label>Иконка (emoji)</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleCategoryChange}
                maxLength="2"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить категорию'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>

        {category?.id && (
          <div className="practices-section">
            <h4>Практики</h4>
            
            <div className="practice-form">
              <h5>{editingPractice ? 'Редактировать практику' : 'Добавить практику'}</h5>
              <div className="form-group">
                <label>Название практики *</label>
                <input
                  type="text"
                  name="name"
                  value={practiceForm.name}
                  onChange={handlePracticeChange}
                  placeholder="например: Концентрация"
                />
              </div>
              
              <div className="form-group">
                <label>Описание</label>
                <input
                  type="text"
                  name="description"
                  value={practiceForm.description}
                  onChange={handlePracticeChange}
                  placeholder="Описание практики"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Тип единиц</label>
                  <select
                    name="unitType"
                    value={practiceForm.unitType}
                    onChange={handlePracticeChange}
                  >
                    {unitTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Порядок отображения</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={practiceForm.displayOrder}
                    onChange={handlePracticeChange}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-actions small">
                <button 
                  type="button" 
                  className="add-btn"
                  onClick={handleAddPractice}
                  disabled={!practiceForm.name || loading}
                >
                  {editingPractice ? 'Обновить' : 'Добавить'} практику
                </button>
                {editingPractice && (
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setEditingPractice(null);
                      setPracticeForm({ name: '', description: '', unitType: 'minutes', displayOrder: 0 });
                    }}
                  >
                    Отмена
                  </button>
                )}
              </div>
            </div>
            
            <div className="practices-list">
              {formData.practices && formData.practices.length > 0 ? (
                <table className="practices-table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Описание</th>
                      <th>Тип</th>
                      <th>Порядок</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...formData.practices]
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map(practice => (
                        <tr key={practice.id}>
                          <td>{practice.name}</td>
                          <td>{practice.description || '-'}</td>
                          <td>
                            {unitTypeOptions.find(opt => opt.value === practice.unitType)?.label || practice.unitType}
                          </td>
                          <td>{practice.displayOrder}</td>
                          <td className="actions">
                            <button 
                              className="edit-btn small"
                              onClick={() => handleEditPractice(practice)}
                              title="Редактировать"
                            >
                              ✏️
                            </button>
                            <button 
                              className="delete-btn small"
                              onClick={() => handleDeletePractice(practice.id)}
                              title="Удалить"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-message">Нет практик. Добавьте первую практику.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryManagement;