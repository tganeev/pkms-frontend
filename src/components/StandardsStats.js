import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function StandardsStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAllStandardsStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(stats.map(s => s.categoryName))];
    return categories;
  };

  const filteredStats = selectedCategory === 'all' 
    ? stats 
    : stats.filter(s => s.categoryName === selectedCategory);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'бессрочно';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU');
  };

  const getStatusBadge = (standard) => {
    return standard.active ? 
      <span className="status-badge active">Действующий</span> : 
      <span className="status-badge inactive">Недействующий</span>;
  };

  if (loading) return <div className="loading">Загрузка статистики...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="standards-stats-container">
      <div className="stats-header">
        <h2>Статистика стандартов</h2>
        <div className="category-filter">
          <label>Категория:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Все категории</option>
            {getUniqueCategories().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredStats.length === 0 ? (
        <p className="empty-message">Нет данных о стандартах</p>
      ) : (
        <div className="stats-grid">
          {filteredStats.map(stat => (
            <div key={stat.standardId} className="stat-card">
              <div className="stat-card-header">
                <h3>{stat.standardName}</h3>
                {getStatusBadge(stat)}
              </div>
              
              <div className="stat-category">
                Категория: <strong>{stat.categoryName}</strong>
              </div>
              
              <div className="stat-dates">
                <div className="date-item">
                  <span>📅 Ввод:</span>
                  <span>{formatDate(stat.startDate)}</span>
                </div>
                <div className="date-item">
                  <span>📅 Вывод:</span>
                  <span>{formatDate(stat.endDate)}</span>
                </div>
              </div>
              
              <div className="stat-counters">
                <div className="counter-item">
                  <span className="counter-label">Всего дней:</span>
                  <span className="counter-value">{stat.totalDays}</span>
                </div>
                <div className="counter-item">
                  <span className="counter-label">Макс. серия:</span>
                  <span className="counter-value">{stat.maxConsecutiveDays}</span>
                </div>
              </div>
              
              <div className="stat-practices">
                <h4>Практики в стандарте:</h4>
                {stat.practices.map(p => (
                  <div key={p.id} className="practice-stat-item">
                    <span className="practice-name">{p.practiceName}:</span>
                    <span className="practice-target">{p.targetValue} {p.unitType === 'minutes' ? 'мин' : p.unitType === 'times' ? 'раз' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StandardsStats;