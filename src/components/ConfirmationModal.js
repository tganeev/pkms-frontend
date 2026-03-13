import React from 'react';

function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  warning, 
  consequences = [], 
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirmation-modal" onClick={e => e.stopPropagation()}>
        <div className="confirmation-icon">⚠️</div>
        <h3>{title}</h3>
        
        <p className="confirmation-message">{message}</p>
        
        {warning && <p className="confirmation-warning">{warning}</p>}
        
        {consequences.length > 0 && (
          <div className="confirmation-consequences">
            <ul>
              {consequences.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        <p className="confirmation-question">Это действие нельзя отменить. Продолжить?</p>
        
        <div className="confirmation-actions">
          <button className="confirm-delete-btn" onClick={onConfirm}>
            Да, удалить
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;