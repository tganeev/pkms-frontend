import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StandardModal from './StandardModal';

function CategoryTable({ category }) {
  const [tableData, setTableData] = useState(null);
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'бессрочно';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU');
  };

  const getStatusBadge = (standard) => {
    const today = new Date().toISOString().split('T')[0];
    const isActive = (!standard.endDate || standard.endDate >= today) && 
                     standard.startDate <= today;
    
    return isActive ? 
      <span className="status-badge active">Действующий</span> : 
      <span className="status-badge inactive">Недействующий</span>;
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
      <div className="category-actions">
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

      {standards.length > 0 && (
        <div className="standards-list">
          <h4>Стандарты категории</h4>
          <div className="standards-grid">
            {standards.map(standard => (
              <div key={standard.id} className="standard-card">
                <div className="standard-card-header">
                  <h5>{standard.name}</h5>
                  <div className="standard-actions">
                    <button 
                      className="edit-btn small"
                      onClick={() => {
                        setEditingStandard(standard);
                        setShowStandardModal(true);
                      }}
                      title="Редактировать стандарт"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn small"
                      onClick={() => handleDeleteStandard(standard.id, standard.name)}
                      title="Удалить стандарт"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {getStatusBadge(standard)}
                
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
                
                <div className="standard-practices">
                  {standard.practices.map(p => (
                    <div key={p.id} className="standard-practice-item">
                      <span className="practice-name">{p.practiceName}:</span>
                      <span className="practice-value">{p.targetValue} {p.unitType === 'minutes' ? 'мин' : p.unitType === 'times' ? 'раз' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="table-controls">
        <div className="date-range">
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
      </div>

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