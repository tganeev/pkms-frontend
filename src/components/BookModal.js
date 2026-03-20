import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function BookModal({ book, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'In plan',
    totalPages: '',
    language: 'Русский',
    categoryId: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        status: book.status || 'In plan',
        totalPages: book.totalPages || '',
        language: book.language || 'Русский',
        categoryId: book.categoryId || ''
      });
    }
  }, [book]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Ошибка загрузки категорий');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (book) {
        await api.updateBook(book.id, formData);
      } else {
        await api.createBook(formData);
      }
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'In plan', label: '📋 В планах' },
    { value: 'In process', label: '📖 Читается' },
    { value: 'Stopped', label: '⏸️ Отложена' },
    { value: 'Completed', label: '✅ Завершена' },
    { value: 'Loading', label: '📥 Загрузка...' }
  ];

  const languageOptions = [
    'Русский', 'Английский', 'Немецкий', 'Французский', 'Испанский', 'Другой'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{book ? 'Редактировать книгу' : 'Добавить книгу'}</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Автор</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Статус</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Всего страниц</label>
              <input
                type="number"
                name="totalPages"
                value={formData.totalPages}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Язык</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                {languageOptions.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Категория</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Без категории</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
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

export default BookModal;