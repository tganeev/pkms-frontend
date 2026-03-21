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
      
      // Загружаем полные данные для каждой категории (с практиками)
      const categoriesWithPractices = await Promise.all(
        data.map(async (cat) => {
          const fullCategory = await api.getCategory(cat.id);
          return fullCategory;
        })
      );
      
      setCategories(categoriesWithPractices);
      loadZonesFromStorage(categoriesWithPractices);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadZonesFromStorage = (categoriesData = categories) => {
    const savedZones = localStorage.getItem('operational_model_zones');
    if (savedZones) {
      const parsedZones = JSON.parse(savedZones);
      // Обновляем категории в зонах свежими данными (с практиками)
      Object.keys(parsedZones).forEach(zoneKey => {
        parsedZones[zoneKey].categories = parsedZones[zoneKey].categories.map(savedCat => {
          const freshCat = categoriesData.find(c => c.id === savedCat.id);
          return freshCat || savedCat;
        });
      });
      setZones(parsedZones);
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

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowManagement(true);
  };

  const handleDeleteCategory = (category, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    handleDeleteClick(category);
  };

  if (loading) return <div className="loading">Загрузка операционной модели...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  if (selectedCategory) {
    return (
      <div className="category-view-wrapper">
        <CategoryTable
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          onEditCategory={(cat) => {
            setEditingCategory(cat);
            setShowManagement(true);
          }}
        />
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
                      <div className="category-actions">
                        <button
                          className="category-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(category);
                            setShowManagement(true);
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

                      <div className="category-top">
                        <h3 className="category-title">{category.name}</h3>
                      </div>

                      <div className="category-horizontal-divider"></div>

                      <div className="category-bottom">
                        <div className="category-cell left-cell">
                          <span className="cell-text">Практик:</span>
                        </div>
                        <div className="category-vertical-divider"></div>
                        <div className="category-cell right-cell">
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

      {showDeleteConfirmation && (
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
      )}
    </div>
  );
}

export default OperationalModel;