import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function YearView({ date, onSelectMonth }) {
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const year = date.getFullYear();

  // Загружаем данные за год
  useEffect(() => {
    loadYearEntries();
  }, [date]);

  const loadYearEntries = async () => {
    setLoading(true);
    try {
      // Здесь нужно сделать API запрос за весь год
      // Пока используем заглушку
      const mockData = {};
      for (let month = 0; month < 12; month++) {
        mockData[month] = Math.floor(Math.random() * 30); // Случайные данные
      }
      setEntries(mockData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const months = [];
  for (let i = 0; i < 12; i++) {
    months.push(new Date(year, i, 1));
  }

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const handlePrevYear = () => {
    onSelectMonth(new Date(year - 1, 0, 1));
  };

  const handleNextYear = () => {
    onSelectMonth(new Date(year + 1, 0, 1));
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="year-view">
      <div className="month-header">
        <button onClick={handlePrevYear} className="nav-btn">←</button>
        <h2>{year} год</h2>
        <button onClick={handleNextYear} className="nav-btn">→</button>
      </div>
      
      <div className="months-grid">
        {months.map((monthDate, index) => {
          const monthEntries = entries[index] || 0;
          
          return (
            <div 
              key={index} 
              className="month-card"
              onClick={() => onSelectMonth(monthDate)}
            >
              <h3>{monthNames[index]}</h3>
              
              {monthEntries > 0 ? (
                <div className="month-stats">
                  <p>📝 {monthEntries} записей</p>
                  <div className="activity-bars">
                    {[...Array(31)].map((_, i) => (
                      <div 
                        key={i}
                        className={`activity-bar ${i < monthEntries ? 'active' : ''}`}
                        style={{ 
                          opacity: i < monthEntries ? 
                            0.3 + (i / monthEntries) * 0.7 : 0.1 
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-entries">Нет записей</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default YearView;