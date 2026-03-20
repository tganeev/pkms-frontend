import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function ReadingStatModal({ book, date, stat, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    pagesRead: 0,
    hoursRead: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stat) {
      setFormData({
        pagesRead: stat.pagesRead || 0,
        hoursRead: stat.hoursRead || 0
      });
    }
  }, [stat]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.addReadingStat(book.id, {
        bookId: book.id,
        date: date,
        pagesRead: formData.pagesRead,
        hoursRead: formData.hoursRead
      });
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить запись о чтении?')) return;
    
    setLoading(true);
    try {
      await api.deleteReadingStat(book.id, date);
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>📖 Статистика чтения</h3>
        
        <div className="book-info">
          <div className="book-title">{book.title}</div>
          <div className="reading-date">{formatDate(date)}</div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Прочитано страниц</label>
              <input
                type="number"
                name="pagesRead"
                value={formData.pagesRead}
                onChange={handleChange}
                min="0"
                step="1"
              />
            </div>
            
            <div className="form-group">
              <label>Потрачено часов</label>
              <input
                type="number"
                name="hoursRead"
                value={formData.hoursRead}
                onChange={handleChange}
                min="0"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            {stat && (
              <button 
                type="button" 
                className="delete-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                Удалить запись
              </button>
            )}
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReadingStatModal;