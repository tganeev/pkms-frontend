import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function MonthView({ date, onSelectDate, setActiveView }) {
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Получаем день недели первого дня месяца (понедельник = 1, воскресенье = 7)
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7; // Преобразуем воскресенье (0) в 7
  
  const daysInMonth = lastDay.getDate();

  // Загружаем данные за месяц
  useEffect(() => {
    loadMonthEntries();
  }, [date]);

  const loadMonthEntries = async () => {
    setLoading(true);
    try {
      // Получаем начало и конец месяца
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      console.log('Loading entries for month:', startDate, 'to', endDate);
      
      // Создаем массив дат для каждой недели месяца
      const entriesMap = {};
      
      // Проходим по всем неделям месяца
      let currentDate = new Date(firstDay);
      while (currentDate <= lastDay) {
        // Для каждой недели загружаем данные
        const weekStart = new Date(currentDate);
        // Находим понедельник текущей недели
        const day = weekStart.getDay() || 7;
        weekStart.setDate(weekStart.getDate() - day + 1);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Загружаем данные за неделю
        const formattedWeekStart = weekStart.toISOString().split('T')[0];
        const weekData = await api.getWeekEntries(formattedWeekStart, 'test');
        
        console.log('Week data for', formattedWeekStart, ':', weekData);
        
        // Добавляем данные в общую карту
        if (weekData && weekData.days) {
          weekData.days.forEach(day => {
            // Проверяем, что день принадлежит текущему месяцу
            const dayDate = new Date(day.date);
            if (dayDate.getMonth() === month && dayDate.getFullYear() === year) {
              const totalEntries = (day.morning?.length || 0) + (day.day?.length || 0) + (day.evening?.length || 0);
              entriesMap[day.date] = totalEntries;
              console.log('Added entry for', day.date, 'total:', totalEntries);
            }
          });
        }
        
        // Переходим к следующей неделе
        currentDate.setDate(currentDate.getDate() + 7);
      }
      
      console.log('Final entries map:', entriesMap);
      setEntries(entriesMap);
    } catch (err) {
      setError(err.message);
      console.error('Error loading month entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysArray = () => {
    const days = [];
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 1; i < startDay; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getDayEntries = (date) => {
    if (!date) return 0;
    const dateKey = date.toISOString().split('T')[0];
    return entries[dateKey] || 0;
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const days = getDaysArray();

  const handlePrevMonth = () => {
    onSelectDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onSelectDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    onSelectDate(new Date());
  };

  // Проверка, является ли день сегодняшним
  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  if (loading) return <div className="loading">Загрузка календаря...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="month-view">
      <div className="month-header">
        <button onClick={handlePrevMonth} className="nav-btn">←</button>
        <div className="month-title">
          <h2>
            {date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleToday} className="today-btn">
            Сегодня
          </button>
        </div>
        <button onClick={handleNextMonth} className="nav-btn">→</button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="week-day">{day}</div>
        ))}
        
        {days.map((day, index) => {
          const entriesCount = day ? getDayEntries(day) : 0;
          const isCurrentDay = day ? isToday(day) : false;
          
          return (
            <div 
              key={index} 
              className={`calendar-day 
                ${!day ? 'empty' : ''} 
                ${entriesCount > 0 ? 'has-entries' : ''}
                ${isCurrentDay ? 'today' : ''}
              `}
              onClick={() => {
                if (day) {
                  onSelectDate(day);
                  setActiveView('week');
                }
              }}
            >
              {day && (
                <>
                  <span className="day-number">{day.getDate()}</span>
                  {entriesCount > 0 && (
                    <span className="entries-count">
                      {entriesCount} {entriesCount === 1 ? 'запись' : 'записей'}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView;