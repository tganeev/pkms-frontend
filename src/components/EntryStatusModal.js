import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function EntryStatusModal({ entry, onClose, onStatusUpdate }) {
  const [status, setStatus] = useState(entry.status || 'completed');
  const [notes, setNotes] = useState(entry.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Определяем, был ли уже установлен статус
  const hasExistingStatus = entry.status && entry.status !== '';

  useEffect(() => {
    if (hasExistingStatus) {
      setStatus(entry.status);
      setNotes(entry.notes || '');
    }
  }, [entry]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await api.updateEntryStatus(entry.id, {
        entryId: entry.id,
        status: status,
        notes: notes
      });
      
      onStatusUpdate();
      onClose();
    } catch (error) {
      setError(error.message);
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
  setLoading(true);
  try {
    await api.deleteEntry(entry.id);
    onStatusUpdate();
    onClose();
  } catch (error) {
    // Если ошибка связана с тем, что запись не найдена (404), все равно закрываем
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.log('Entry was already deleted');
      onStatusUpdate();
      onClose();
    } else {
      setError(error.message);
    }
  } finally {
    setLoading(false);
  }
};

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setStatus(entry.status);
    setNotes(entry.notes || '');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content status-modal" onClick={e => e.stopPropagation()}>
        {/* Кнопка закрытия в виде крестика */}
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <h3>{hasExistingStatus && !isEditing ? 'Просмотр статуса' : 'Статус выполнения'}</h3>
        
        <div className="entry-info">
          <div className="entry-category-badge" style={{ backgroundColor: entry.color || '#667eea' }}>
            {entry.category}
          </div>
          <div className="entry-details">
            <span className="entry-practice-name">{entry.practice}</span>
            <span className="entry-duration-badge">⏱️ {entry.duration}</span>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {hasExistingStatus && !isEditing ? (
          // Режим просмотра
          <div className="status-view-mode">
            <div className="current-status">
              <span className="status-label">Текущий статус:</span>
              <span className={`status-badge-large ${entry.status}`}>
                {entry.status === 'completed' && '✅ Выполнено полностью'}
                {entry.status === 'partial' && '⚠️ Выполнено частично'}
                {entry.status === 'failed' && '❌ Не выполнено'}
              </span>
            </div>
            
            {entry.notes && (
              <div className="status-notes">
                <span className="notes-label">Заметки:</span>
                <p className="notes-text">{entry.notes}</p>
              </div>
            )}
            
            <div className="view-actions">
              <button onClick={handleEdit} className="edit-btn">
                ✏️ Изменить статус
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="delete-btn"
              >
                🗑️ Удалить событие
              </button>
            </div>
          </div>
        ) : (
          // Режим редактирования/создания
          <>
            <div className="status-options-vertical">
              <label className={`status-option ${status === 'completed' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <span className="status-indicator completed">✅</span>
                <span className="status-text">Выполнено полностью</span>
              </label>
              
              <label className={`status-option ${status === 'partial' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="partial"
                  checked={status === 'partial'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <span className="status-indicator partial">⚠️</span>
                <span className="status-text">Выполнено частично</span>
              </label>
              
              <label className={`status-option ${status === 'failed' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="failed"
                  checked={status === 'failed'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <span className="status-indicator failed">❌</span>
                <span className="status-text">Не выполнено</span>
              </label>
            </div>

            <div className="form-group">
              <label>Заметки (необязательно)</label>
              <textarea
                placeholder="Добавьте заметки..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button 
                onClick={handleSubmit} 
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              {isEditing && (
                <button onClick={handleCancelEdit} className="cancel-btn">
                  Отмена
                </button>
              )}
            </div>
          </>
        )}

        {/* Модальное окно подтверждения удаления */}
        {showDeleteConfirm && (
          <div className="confirm-delete-modal">
            <div className="confirm-content">
              <h4>Подтверждение удаления</h4>
              <p>Вы уверены, что хотите удалить это событие?</p>
              <p className="warning">Все связанные данные будут безвозвратно удалены!</p>
              <div className="confirm-actions">
                <button onClick={handleDelete} className="delete-btn" disabled={loading}>
                  {loading ? 'Удаление...' : 'Да, удалить'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EntryStatusModal;