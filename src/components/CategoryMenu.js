import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CategoryTable from './CategoryTable';
import CategoryManagement from './CategoryManagement';
import ConfirmationModal from './ConfirmationModal';

function CategoryMenu() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showManagement, setShowManagement] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

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
      
      if (selectedCategory && selectedCategory.id === categoryToDelete.id) {
        setSelectedCategory(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setCategoryToDelete(null);
  };

  const getCategoryColor = (color) => {
    return color || '#667eea';
  };

  if (loading) return <div className="loading">Загрузка категорий...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="category-menu">
      {!selectedCategory && (
        <div className="category-menu-header">
          <h2>Категории</h2>
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
      )}
      
      {!selectedCategory ? (
        <div className="categories-grid">
          {categories.map(category => (
            <div
              key={category.id}
              className="category-card"
              style={{ backgroundColor: getCategoryColor(category.color) }}
            >
              <div className="category-card-content" onClick={() => setSelectedCategory(category)}>
                <span className="category-icon">{category.icon || '📊'}</span>
                <span className="category-name">{category.name}</span>
                {category.description && (
                  <span className="category-description">{category.description}</span>
                )}
              </div>
              <div className="category-card-actions">
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setEditingCategory(category);
                    setShowManagement(true);
                  }}
                  title="Редактировать категорию"
                >
                  ✏️
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteClick(category)}
                  title="Удалить категорию"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CategoryTable 
          category={selectedCategory} 
          onBack={() => setSelectedCategory(null)}
          onEditCategory={(cat) => {
            setEditingCategory(cat);
            setShowManagement(true);
          }}
        />
      )}

      {showManagement && (
        <CategoryManagement
          category={editingCategory}
          onClose={() => {
            setShowManagement(false);
            setEditingCategory(null);
          }}
          onUpdate={() => {
            loadCategories();
            if (selectedCategory) {
              api.getCategory(selectedCategory.id).then(setSelectedCategory);
            }
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

export default CategoryMenu;