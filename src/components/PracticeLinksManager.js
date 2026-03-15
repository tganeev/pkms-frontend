import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function PracticeLinksManager({ practice, category, onClose }) {
  const [links, setLinks] = useState([]);
  const [allPractices, setAllPractices] = useState([]);
  const [selectedSourcePractice, setSelectedSourcePractice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadLinks();
    loadAllPractices();
  }, [practice]);

  const loadLinks = async () => {
    try {
      const data = await api.getPracticeLinks(practice.id);
      setLinks(data);
    } catch (err) {
      setError('Ошибка загрузки связей: ' + err.message);
    }
  };

  const loadAllPractices = async () => {
    try {
      const data = await api.getAllPractices();
      // Исключаем текущую практику и практики из той же категории
      const filtered = data.filter(p => 
        p.id !== practice.id && 
        p.categoryId !== practice.categoryId
      );
      setAllPractices(filtered);
    } catch (err) {
      setError('Ошибка загрузки практик: ' + err.message);
    }
  };

  const handleAddLink = async () => {
    if (!selectedSourcePractice) {
      setError('Выберите практику-источник');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.addPracticeLink(selectedSourcePractice, practice.id);
      setSuccess('Связь успешно добавлена');
      await loadLinks();
      setSelectedSourcePractice('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка добавления связи: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm('Удалить эту связь?')) return;

    try {
      await api.deletePracticeLink(linkId);
      setSuccess('Связь удалена');
      await loadLinks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка удаления связи: ' + err.message);
    }
  };

  const getPracticeFullName = (p) => {
    return `${p.categoryName} - ${p.name}`;
  };

  return (
    <div className="practice-links-manager">
      <div className="links-header">
        <h4>Связанные практики для "{practice.name}"</h4>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="add-link-section">
        <h5>Добавить источник данных</h5>
        <p className="link-description">
          Значения из выбранной практики будут автоматически добавляться к текущей
        </p>
        
        <div className="add-link-form">
          <select
            value={selectedSourcePractice}
            onChange={(e) => setSelectedSourcePractice(e.target.value)}
            className="practice-select"
          >
            <option value="">Выберите практику-источник</option>
            {allPractices.map(p => (
              <option key={p.id} value={p.id}>
                {getPracticeFullName(p)}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleAddLink}
            disabled={loading || !selectedSourcePractice}
            className="add-link-btn"
          >
            {loading ? 'Добавление...' : 'Добавить источник'}
          </button>
        </div>
      </div>

      <div className="existing-links-section">
        <h5>Текущие источники</h5>
        {links.length === 0 ? (
          <p className="empty-links">Нет связанных практик</p>
        ) : (
          <ul className="links-list">
            {links.map(link => (
              <li key={link.id} className="link-item">
                <div className="link-info">
                  <span className="source-practice">
                    {link.sourcePractice?.categoryName} - {link.sourcePractice?.name}
                  </span>
                  <span className="link-arrow">→</span>
                  <span className="target-practice">
                    {link.targetPractice?.categoryName} - {link.targetPractice?.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="delete-link-btn"
                  title="Удалить связь"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="info-box">
        <h5>Как это работает?</h5>
        <ul>
          <li>Когда вы отмечаете выполнение в практике-источнике, значение автоматически добавляется к целевой практике</li>
          <li>Например, если вы добавили Core.Meditation как источник для Yoga.Meditation, то при выполнении Core.Meditation на 30 мин, Yoga.Meditation получит +30 мин</li>
          <li>Одна практика может иметь несколько источников</li>
          <li>Значения суммируются</li>
        </ul>
      </div>
    </div>
  );
}

// ВАЖНО: именно так должен выглядеть экспорт
export default PracticeLinksManager;