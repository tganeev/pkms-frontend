import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PracticeLinksManager from './PracticeLinksManager';

function CategoryManagement({ category, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#667eea',
    icon: '📊',
    practices: [],
    zone: 'selfDiscovery'
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
  const [managingLinksPractice, setManagingLinksPractice] = useState(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [practiceLinks, setPracticeLinks] = useState({}); // Храним связи для каждой практики

  // Загружаем связи для практик
  useEffect(() => {
    if (category?.id && formData.practices.length > 0) {
      loadAllPracticeLinks();
    }
  }, [category?.id, formData.practices]);

  const loadAllPracticeLinks = async () => {
    const linksMap = {};
    for (const practice of formData.practices) {
      try {
        const links = await api.getPracticeLinks(practice.id);
        linksMap[practice.id] = links.length > 0;
      } catch (err) {
        console.error('Error loading links for practice:', practice.id);
        linksMap[practice.id] = false;
      }
    }
    setPracticeLinks(linksMap);
  };

  const loadPracticeLinks = async (practiceId) => {
    try {
      const links = await api.getPracticeLinks(practiceId);
      setPracticeLinks(prev => ({ ...prev, [practiceId]: links.length > 0 }));
    } catch (err) {
      console.error('Error loading links:', err);
    }
  };

  // Зоны для выбора
  const zones = [
    { id: 'selfDiscovery', name: 'Самопознание' },
    { id: 'selfRealization', name: 'Самореализация' },
    { id: 'service', name: 'Служение' }
  ];

  // Загружаем данные при монтировании или изменении category.id
  useEffect(() => {
    if (category && category.id) {
      loadCategoryData(category.id);
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#667eea',
        icon: '📊',
        practices: [],
        zone: 'selfDiscovery'
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
        practices: data.practices || [],
        zone: data.zone || 'selfDiscovery'
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
        
        const savedZones = localStorage.getItem('operational_model_zones');
        if (savedZones) {
          const zonesData = JSON.parse(savedZones);
          if (zonesData[formData.zone]) {
            zonesData[formData.zone].categories.push(savedCategory);
            localStorage.setItem('operational_model_zones', JSON.stringify(zonesData));
          }
        }
      }
      
      setFormData({
        name: savedCategory.name || '',
        description: savedCategory.description || '',
        color: savedCategory.color || '#667eea',
        icon: savedCategory.icon || '📊',
        practices: savedCategory.practices || [],
        zone: formData.zone
      });
      
      if (!category && savedCategory.id) {
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
      
      const updatedPractices = editingPractice 
        ? formData.practices.map(p => p.id === editingPractice.id ? savedPractice : p)
        : [...formData.practices, savedPractice];
      
      setFormData({
        ...formData,
        practices: updatedPractices
      });
      
      setPracticeForm({ name: '', description: '', unitType: 'minutes', displayOrder: 0 });
      setEditingPractice(null);
      
      // Загружаем связи для новой практики
      if (!editingPractice) {
        loadPracticeLinks(savedPractice.id);
      }
      
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
    
    const updatedPractices = formData.practices.filter(p => p.id !== practiceId);
    setFormData({
      ...formData,
      practices: updatedPractices
    });
    
    setSuccess('Практика удалена');
    setTimeout(() => setSuccess(null), 2000);
  } catch (err) {
    console.error('Delete practice error:', err);
    
    // Получаем текст ошибки из разных источников
    let errorText = '';
    
    if (typeof err === 'string') {
      errorText = err;
    } else if (err.message) {
      errorText = err.message;
    } else if (err.response?.data) {
      // Если ошибка от axios/fetch
      errorText = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
    } else if (err.toString) {
      errorText = err.toString();
    }
    
    console.log('Error text:', errorText);
    
    // Проверяем разные варианты сообщений об ошибке внешнего ключа
    if (errorText.includes('violates foreign key') || 
        errorText.includes('referenced') ||
        errorText.includes('constraint') ||
        errorText.includes('still referenced') ||
        errorText.includes('foreign key constraint') ||
        errorText.includes('23503')) {  // SQL state код для foreign key violation
      setError('❌ Нельзя удалить практику, которая используется в стандартах. Сначала удалите стандарты, использующие эту практику.');
    } else {
      setError('Ошибка удаления: ' + errorText);
    }
  } finally {
    setLoading(false);
  }
};
  const handleManageLinks = (practice) => {
    setManagingLinksPractice(practice);
    setShowLinksModal(true);
  };

  const handleLinksUpdated = async (practiceId) => {
    await loadPracticeLinks(practiceId);
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

          <div className="form-group">
            <label>Секция операционной модели</label>
            <select
              name="zone"
              value={formData.zone}
              onChange={handleCategoryChange}
            >
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
            <small className="field-hint">
              Выберите, в какой секции будет отображаться категория
            </small>
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
          <>
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
                      
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Тип</th>
                        <th>Порядок</th>
                        <th>Действия</th>
                      </thead>
                    
                    <tbody>
                      {[...formData.practices]
                        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                        .map(practice => {
                          const hasLinks = practiceLinks[practice.id];
                          return (
                            <tr key={practice.id}>
                              <td>{practice.name}</td>
                              <td>{practice.description || '-'}</td>
                              <td>
                                {unitTypeOptions.find(opt => opt.value === practice.unitType)?.label || practice.unitType}
                              </td>
                              <td>{practice.displayOrder}</td>
                              <td className="actions">
                                <button 
                                  className="edit-btn"
                                  onClick={() => handleEditPractice(practice)}
                                  title="Редактировать"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className={`link-btn ${hasLinks ? 'has-links' : ''}`}
                                  onClick={() => handleManageLinks(practice)}
                                  title={hasLinks ? 'Управлять связанными практиками (есть связи)' : 'Управлять связанными практиками'}
                                >
                                  🔗
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={() => handleDeletePractice(practice.id)}
                                  title="Удалить"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-message">Нет практик. Добавьте первую практику.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Модальное окно для управления связанными практиками */}
      {showLinksModal && managingLinksPractice && (
        <div className="modal-overlay" onClick={() => {
          setShowLinksModal(false);
          setManagingLinksPractice(null);
        }}>
          <div className="modal-content practice-links-modal" onClick={e => e.stopPropagation()}>
            <PracticeLinksManager
              practice={managingLinksPractice}
              category={category}
              onClose={() => {
                setShowLinksModal(false);
                setManagingLinksPractice(null);
                // Обновляем статус связей после закрытия
                loadPracticeLinks(managingLinksPractice.id);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryManagement;