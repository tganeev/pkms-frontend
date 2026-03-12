import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CategoryTable from './CategoryTable';
import CategoryManagement from './CategoryManagement';

function CategoryMenu() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showManagement, setShowManagement] = useState(false);
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

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Удалить категорию "${categoryName}"? Это также удалит все связанные практики.`)) {
      return;
    }
    
    try {
      await api.deleteCategory(categoryId);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const getCategoryColor = (color) => {
    return color || '#667eea';
  };

  if (loading) return <div className="loading">Загрузка категорий...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="category-menu">
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
                >
                  ✏️
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="category-view">
          <div className="category-header">
            <button 
              className="back-btn"
              onClick={() => setSelectedCategory(null)}
            >
              ← Назад
            </button>
            <h3>{selectedCategory.name}</h3>
            <button 
              className="edit-btn"
              onClick={() => {
                setEditingCategory(selectedCategory);
                setShowManagement(true);
              }}
            >
              ✏️ Редактировать
            </button>
          </div>
          <CategoryTable category={selectedCategory} />
        </div>
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
              // Если мы сейчас просматриваем категорию, обновим ее данные
              api.getCategory(selectedCategory.id).then(updatedCategory => {
      setSelectedCategory(updatedCategory);
    });
            }
          }}
        />
      )}
    </div>
  );
}

export default CategoryMenu;