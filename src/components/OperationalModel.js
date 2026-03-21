import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CategoryManagement from './CategoryManagement';
import CategoryTable from './CategoryTable';
import ConfirmationModal from './ConfirmationModal';

function OperationalModel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showManagement, setShowManagement] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [zones, setZones] = useState({
    selfDiscovery: {
      id: 'selfDiscovery',
      name: 'Самопознание',
      categories: []
    },
    selfRealization: {
      id: 'selfRealization',
      name: 'Самореализация',
      categories: []
    },
    service: {
      id: 'service',
      name: 'Служение',
      categories: []
    }
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      loadZonesFromStorage();
    }
  }, [categories]);

  useEffect(() => {
    if (categories.length > 0 && zones) {
      localStorage.setItem('operational_model_zones', JSON.stringify(zones));
    }
  }, [zones]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadZonesFromStorage = () => {
    const savedZones = localStorage.getItem('operational_model_zones');
    if (savedZones) {
      const parsedZones = JSON.parse(savedZones);
      setZones(parsedZones);
    } else {
      const initialZones = {
        selfDiscovery: {
          id: 'selfDiscovery',
          name: 'Самопознание',
          categories: categories.filter(c => 
            ['Yoga', 'Math', 'Chinise', 'Oratory'].includes(c.name)
          )
        },
        selfRealization: {
          id: 'selfRealization',
          name: 'Самореализация',
          categories: categories.filter(c => 
            ['SoftDev', 'MBA', 'Finance', 'Chess', 'Business', 'English'].includes(c.name)
          )
        },
        service: {
          id: 'service',
          name: 'Служение',
          categories: categories.filter(c => 
            ['Boxing', 'Core'].includes(c.name)
          )
        }
      };
      setZones(initialZones);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await api.deleteCategory(categoryToDelete.id);
      await loadCategories();
      setShowDeleteConfirmation(false);
      setCategoryToDelete(null);
      
      const updatedZones = { ...zones };
      Object.keys(updatedZones).forEach(zoneKey => {
        updatedZones[zoneKey].categories = updatedZones[zoneKey].categories.filter(
          c => c.id !== categoryToDelete.id
        );
      });
      setZones(updatedZones);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setCategoryToDelete(null);
  };

  const handleDragStart = (e, category, sourceZoneId) => {
    setDraggedCategory({ category, sourceZoneId });
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ category, sourceZoneId }));
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
    setIsDragging(false);
    setDragOverZone(null);
  };

  const handleDragOver = (e, zoneId) => {
    e.preventDefault();
    if (!isDragging) return;
    setDragOverZone(zoneId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (e, targetZoneId) => {
    e.preventDefault();
    setDragOverZone(null);
    
    if (!draggedCategory) return;
    
    const { category, sourceZoneId } = draggedCategory;
    
    if (sourceZoneId === targetZoneId) return;
    
    const updatedZones = { ...zones };
    updatedZones[sourceZoneId].categories = updatedZones[sourceZoneId].categories.filter(
      c => c.id !== category.id
    );
    updatedZones[targetZoneId].categories.push(category);
    
    setZones(updatedZones);
    setIsDragging(false);
    setDraggedCategory(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleEditCategory = (category, e) => {
    e.stopPropagation();
    setEditingCategory(category);
    setShowManagement(true);
  };

  const handleDeleteCategory = (category, e) => {
    e.stopPropagation();
    handleDeleteClick(category);
  };

  if (loading) return <div className="loading">Загрузка операционной модели...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  if (selectedCategory) {
    return (
      <div className="category-view-wrapper">
        <div className="category-view-header">
          <button className="back-btn" onClick={() => setSelectedCategory(null)}>
            ← Назад
          </button>
          <h2>{selectedCategory.name}</h2>
          <button 
            className="edit-btn"
            onClick={() => handleEditCategory(selectedCategory, { stopPropagation: () => {} })}
          >
            ✏️ Редактировать
          </button>
        </div>
        <CategoryTable 
          category={selectedCategory} 
          onBack={() => setSelectedCategory(null)}
          onEditCategory={handleEditCategory}
        />
      </div>
    );
  }

  return (
    <div className="operational-model">
      <div className="model-header">
        <h2>🏛️ Операционная модель</h2>
        <button 
          className="add-category-btn"
          onClick={() => {
            setEditingCategory(null);
            setShowManagement(true);
          }}
        >
          + Добавить категорию
        </button>
      </div>

      <div className="model-zones-vertical">
        {Object.values(zones).map(zone => (
          <div
            key={zone.id}
            className={`model-zone-vertical ${dragOverZone === zone.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, zone.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, zone.id)}
          >
            <div className="zone-header-vertical">
              <h3>{zone.name}</h3>
              <span className="zone-count-badge">{zone.categories.length}</span>
            </div>
            
            <div className="zone-categories-vertical">
              {zone.categories.length === 0 ? (
                <div className="empty-zone-vertical">
                  <p>Перетащите категорию сюда</p>
                </div>
              ) : (
                <div className="categories-grid-vertical">
                  {zone.categories.map(category => (
                    <div
                      key={category.id}
                      className="category-card"
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, category, zone.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {/* Кнопки действий */}
                      <div className="category-actions">
                        <button 
                          className="category-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category, e);
                          }}
                          title="Редактировать категорию"
                        >
                          ✏️
                        </button>
                        <button 
                          className="category-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category, e);
                          }}
                          title="Удалить категорию"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      {/* Верхняя часть - название категории */}
                      <div className="category-top">
                        <h3 className="category-title">{category.name}</h3>
                      </div>
                      
                      {/* Горизонтальная разделительная линия */}
                      <div 
                        className="category-horizontal-divider"
                        style={{ 
                          height: '1px', 
                          background: '#e0e0e0', 
                          width: '100%', 
                          margin: 0,
                          flexShrink: 0
                        }}
                      ></div>
                      
                      {/* Нижняя часть - статистика */}
                      <div 
                        className="category-bottom"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'stretch', 
                          minHeight: '50px',
                          background: 'white',
                          margin: 0,
                          padding: 0
                        }}
                      >
                        <div 
                          className="category-cell left-cell"
                          style={{ 
                            flex: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            padding: '12px 8px',
                            background: 'white',
                            margin: 0
                          }}
                        >
                          <span className="cell-text">Кол-во практик</span>
                        </div>
                        <div 
                          className="category-vertical-divider"
                          style={{ 
                            width: '1px', 
                            background: '#e0e0e0', 
                            flexShrink: 0,
                            margin: 0,
                            height: '100%'
                          }}
                        ></div>
                        <div 
                          className="category-cell right-cell"
                          style={{ 
                            flex: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            padding: '12px 8px',
                            background: 'white',
                            margin: 0
                          }}
                        >
                          <span className="cell-text count">{category.practices?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showManagement && (
        <CategoryManagement
          category={editingCategory}
          onClose={() => {
            setShowManagement(false);
            setEditingCategory(null);
          }}
          onUpdate={() => {
            loadCategories();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Удаление категории"
        message={`Вы уверены, что хотите удалить категорию "${categoryToDelete?.name}"?`}
        warning="Это действие также удалит:"
        consequences={[
          "Все практики в этой категории",
          "Таблицу с данными категории",
          "Все связанные записи в календаре"
        ]}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default OperationalModel;