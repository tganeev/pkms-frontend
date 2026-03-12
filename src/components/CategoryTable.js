import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function CategoryTable({ category }) {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTableData();
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
              {/* Удалена колонка "Стандарт" */}
              {tableData.practices.map(practice => (
                <th key={practice}>{practice}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map(row => (
              <tr key={row.date}>
                <td>{new Date(row.date).toLocaleDateString('ru-RU')}</td>
                {/* Удалена ячейка стандарта */}
                {tableData.practices.map(practice => (
                  <td key={practice} className="practice-value">
                    {row.values[practice] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CategoryTable;