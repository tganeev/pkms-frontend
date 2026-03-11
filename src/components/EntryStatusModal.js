import React, { useState } from 'react';
import { api } from '../services/api';

function EntryStatusModal({ entry, onClose, onStatusUpdate }) {
  const [status, setStatus] = useState('completed');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    try {
      await api.updateEntryStatus(entry.id, {
        entryId: entry.id,
        status: status,
        notes: notes
      });

      // Если статус "completed" и это Yoga практика,
      // данные автоматически запишутся в yoga_practices
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Статус выполнения</h3>
        <p>{entry.category} - {entry.practice}</p>

        <div className="status-options">
          <label>
            <input
              type="radio"
              value="completed"
              checked={status === 'completed'}
              onChange={(e) => setStatus(e.target.value)}
            />
            ✅ Выполнено полностью
          </label>

          <label>
            <input
              type="radio"
              value="partial"
              checked={status === 'partial'}
              onChange={(e) => setStatus(e.target.value)}
            />
            ⚡ Выполнено частично
          </label>

          <label>
            <input
              type="radio"
              value="failed"
              checked={status === 'failed'}
              onChange={(e) => setStatus(e.target.value)}
            />
            ❌ Не выполнено
          </label>
        </div>

        <textarea
          placeholder="Заметки (необязательно)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="3"
        />

        <div className="form-actions">
          <button onClick={handleSubmit} className="save-btn">
            Сохранить
          </button>
          <button onClick={onClose} className="cancel-btn">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default EntryStatusModal;
