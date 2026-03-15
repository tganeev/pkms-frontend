import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import StandardModal from './StandardModal';

function CategoryTable({ category, onBack, onEditCategory }) {
  const [tableData, setTableData] = useState(null);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [archivingStandardId, setArchivingStandardId] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTableData();
    loadStandards();
  }, [category, dateRange]);

  const loadTableData = async () => {
    setLoading(true);
    try {
      const data = await api.getCategoryTable(
        category.name,
        dateRange.startDate,
        dateRange.endDate
      );
      setTableData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStandards = async () => {
    try {
      const data = await api.getCategoryStandards(category.id);
      console.log('Loaded standards:', data); // Для отладки
      setStandards(data);
    } catch (err) {
      console.error('Error loading standards:', err);
    }
  };

  const handleDeleteStandard = async (standardId, standardName) => {
    if (!window.confirm(`Удалить стандарт "${standardName}"?`)) return;
    
    try {
      await api.deleteStandard(standardId);
      await loadStandards();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleArchiveStandard = async (standard) => {
    if (!window.confirm(`Отправить стандарт "${standard.name}" в архив?`)) return;
    
    setArchivingStandardId(standard.id);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Создаем объект для обновления
      const updatedStandard = {
        id: standard.id,
        name: standard.name,
        description: standard.description,
        categoryId: standard.categoryId,
        startDate: standard.startDate,
        endDate: today,
        practices: standard.practices || []
      };
      
      console.log('Sending update with endDate:', today);
      
      // Отправляем запрос на обновление
      const response = await api.updateStandard(standard.id, updatedStandard);
      console.log('Update response:', response);
      
      // Принудительно перезагружаем стандарты
      await loadStandards();
      
    } catch (err) {
      console.error('Archive error:', err);
      setError(err.message);
    } finally {
      setArchivingStandardId(null);
    }
  };

const isStandardActive = (standard) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Если нет endDate - стандарт действует
  if (!standard.endDate) {
    console.log(standard.name, 'no endDate -> active');
    return true;
  }
  
  // Если endDate есть, стандарт НЕ действует (даже если endDate === today)
  // При установке endDate = today, стандарт сразу становится недействующим
  const isActive = false;
  console.log(standard.name, 'has endDate:', standard.endDate, '-> inactive');
  return false;
};

  const formatDate = (dateStr) => {
    if (!dateStr) return 'бессрочно';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU');
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading">Загрузка данных...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!tableData) return <div className="error">Нет данных</div>;

  return (
    <div className="category-table-container">
      {/* Верхняя панель с навигацией и заголовком */}
      <div className="category-header-panel">
        <button className="back-btn" onClick={onBack}>
          ← Назад
        </button>
        
        <h2 className="category-title">{category.name}</h2>
        
        <button 
          className="add-standard-btn"
          onClick={() => {
            setEditingStandard(null);
            setShowStandardModal(true);
          }}
        >
          + Добавить стандарт
        </button>
      </div>

      {/* Все карточки стандартов в одном ряду */}
      {standards.length > 0 && (
        <div className="standards-row">
          {standards.map(standard => {
            const isActive = isStandardActive(standard);
            
            return (
              <div key={standard.id} className={`standard-card ${isActive ? 'active-standard' : 'archived-standard'}`}>
                <div className="standard-card-header">
                  <h4>{standard.name}</h4>
                  <div className="standard-actions">
                    {isActive && (
                      <button 
                        className="archive-btn"
                        onClick={() => handleArchiveStandard(standard)}
                        disabled={archivingStandardId === standard.id}
                        title="Отправить в архив"
                      >
                        {archivingStandardId === standard.id ? '⏳' : '📦'}
                      </button>
                    )}
                    <button 
                      className="edit-btn"
                      onClick={() => {
                        setEditingStandard(standard);
                        setShowStandardModal(true);
                      }}
                      title="Редактировать стандарт"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteStandard(standard.id, standard.name)}
                      title="Удалить стандарт"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="status-container">
                  {isActive ? (
                    <span className="status-badge active">Действующий</span>
                  ) : (
                    <span className="status-badge inactive">Недействующий</span>
                  )}
                </div>
                
                {standard.description && (
                  <p className="standard-description">{standard.description}</p>
                )}
                
                <div className="standard-dates">
                  <div className="date-item">
                    <span className="date-label">Ввод:</span>
                    <span className="date-value">{formatDate(standard.startDate)}</span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">Вывод:</span>
                    <span className="date-value">{formatDate(standard.endDate)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Панель с диапазоном дат и кнопкой редактирования */}
      <div className="date-controls-panel">
        <div className="date-range-controls">
          <label>
            С:
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </label>
          <label>
            По:
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </label>
        </div>
        
        <button 
          className="edit-category-btn"
          onClick={() => onEditCategory(category)}
        >
          Редактировать
        </button>
      </div>

      {/* Таблица с данными */}
      <div className="table-wrapper">
        <table className="category-table">
          <thead>
            <tr>
              <th>Дата</th>
              {tableData.practices.map(practice => (
                <th key={practice}>{practice}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map(row => {
              const formattedDate = new Date(row.date).toLocaleDateString('ru-RU');
              return (
                <tr key={row.date}>
                  <td>{formattedDate}</td>
                  {tableData.practices.map(practice => (
                    <td key={practice} className="practice-value">
                      {row.values[practice] || '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showStandardModal && (
        <StandardModal
          category={category}
          standard={editingStandard}
          onClose={() => {
            setShowStandardModal(false);
            setEditingStandard(null);
          }}
          onUpdate={() => {
            loadStandards();
          }}
        />
      )}
    </div>
  );
}

export default CategoryTable;