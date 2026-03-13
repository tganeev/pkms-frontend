import React, { useState } from 'react';
import { api } from '../services/api';

function EntryStatusModal({ entry, onClose, onStatusUpdate }) {
  const [status, setStatus] = useState('completed');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content status-modal" onClick={e => e.stopPropagation()}>
        <h3>Статус выполнения</h3>
        
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
          <button 
            onClick={onClose} 
            className="cancel-btn"
            disabled={loading}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default EntryStatusModal;