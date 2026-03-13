import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import EntryStatusModal from './EntryStatusModal';

function WeekView({ date }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('30 мин');
  const [repeatInterval, setRepeatInterval] = useState('');
  const [weekData, setWeekData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryPractices, setCategoryPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [practicesLoading, setPracticesLoading] = useState(false);

  const timeOptions = ['5 мин', '10 мин', '15 мин', '30 мин', '31 мин', '60 мин', '90 мин', '120 мин', '180 мин'];
  const repeatOptions = ['Не повторять', 'Каждый день', 'Каждую неделю', 'Каждый месяц', 'Каждый год'];

  // Загружаем категории при монтировании компонента
  useEffect(() => {
    loadCategories();
  }, []);

  // Загружаем данные недели при изменении даты
  useEffect(() => {
    loadWeekData();
  }, [date]);

  // Загружаем практики при выборе категории
  useEffect(() => {
    if (selectedCategoryId) {
      loadCategoryPractices(selectedCategoryId);
    } else {
      setCategoryPractices([]);
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadCategoryPractices = async (categoryId) => {
    setPracticesLoading(true);
    try {
      const practices = await api.getCategoryPractices(categoryId);
      setCategoryPractices(practices);
    } catch (err) {
      console.error('Error loading practices:', err);
      setError('Ошибка загрузки практик');
    } finally {
      setPracticesLoading(false);
    }
  };

  const loadWeekData = async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const data = await api.getWeekEntries(formattedDate);
      setWeekData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading week data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#667eea';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <span className="status-icon completed">✅</span>;
      case 'partial':
        return <span className="status-icon partial">⚠️</span>;
      case 'failed':
        return <span className="status-icon failed">❌</span>;
      default:
        return null;
    }
  };

  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    const category = categories.find(c => c.name === categoryName);
    
    setSelectedCategory(categoryName);
    setSelectedCategoryId(category?.id || null);
    setSelectedPractice('');
  };

  const handleSlotClick = (day, periodId) => {
    setSelectedDay(day);
    setSelectedPeriod(periodId);
    setIsEditing(true);
  };

  const addItem = async () => {
    if (!selectedCategory || !selectedPractice || !selectedDay || !selectedPeriod) return;

    try {
      const newEntry = {
        category: selectedCategory,
        practice: selectedPractice,
        duration: selectedDuration,
        period: selectedPeriod,
        repeatInterval: repeatInterval,
        entryDate: selectedDay.toISOString().split('T')[0]
      };

      await api.createEntry(newEntry);
      await loadWeekData();
      
      // Сброс формы
      setSelectedCategory('');
      setSelectedCategoryId(null);
      setSelectedPractice('');
      setSelectedDuration('30 мин');
      setRepeatInterval('');
      setIsEditing(false);
      setSelectedDay(null);
      setSelectedPeriod(null);
      setCategoryPractices([]);
    } catch (err) {
      setError(err.message);
      console.error('Error creating entry:', err);
    }
  };

  const removeItem = async (dateKey, period, entryId) => {
    if (!window.confirm('Удалить запись?')) return;

    try {
      await api.deleteEntry(entryId);
      await loadWeekData();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting entry:', err);
    }
  };

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
  };

  const handleStatusUpdate = () => {
    loadWeekData();
    setSelectedEntry(null);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][d.getMonth()]}`;
  };

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const handlePrevWeek = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 7);
    window.location.reload();
  };

  const handleNextWeek = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 7);
    window.location.reload();
  };

  const handleToday = () => {
    window.location.reload();
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!weekData) return <div className="error">Нет данных</div>;

  return (
    <div className="week-view">
      <div className="week-navigation">
        <button onClick={handlePrevWeek} className="nav-btn">←</button>
        <div className="week-title">
          <h2>
            Неделя {formatDate(weekData.startDate)} - {formatDate(weekData.endDate)}
          </h2>
          <button onClick={handleToday} className="today-btn">Сегодня</button>
        </div>
        <button onClick={handleNextWeek} className="nav-btn">→</button>
      </div>

      <div className="week-schedule">
        {/* Левая колонка с временными промежутками */}
        <div className="week-time-labels">
          <div className="time-labels-header">Время</div>
          <div className="time-label morning-label">06:00 - 12:00</div>
          <div className="time-label day-label">12:00 - 18:00</div>
          <div className="time-label evening-label">18:00 - 00:00</div>
        </div>

        {/* Колонки дней недели */}
        {weekData.days.map((day, dayIndex) => (
          <div key={day.date} className="week-day-column">
            <div className="week-day-header">
              <div className="day-name">{day.dayName}</div>
              <div className="day-date">{formatDate(day.date)}</div>
            </div>
            
            <div className="week-periods">
              {/* Утро */}
              <div 
                className="week-period morning-period"
                onClick={() => handleSlotClick(new Date(day.date), 'morning')}
              >
                {day.morning && day.morning.map(entry => (
                  <div 
                    key={entry.id} 
                    className={`week-entry ${entry.status ? `status-${entry.status}` : ''}`}
                    style={{ backgroundColor: getCategoryColor(entry.category) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryClick(entry);
                    }}
                  >
                    {getStatusIcon(entry.status)}
                    <div className="entry-category">{entry.category}</div>
                    <div className="entry-practice">{entry.practice}</div>
                    <div className="entry-duration">⏱️ {entry.duration}</div>
                    {entry.repeatInterval && entry.repeatInterval !== 'Не повторять' && (
                      <div className="entry-repeat">🔄</div>
                    )}
                  </div>
                ))}
              </div>

              {/* День */}
              <div 
                className="week-period day-period"
                onClick={() => handleSlotClick(new Date(day.date), 'day')}
              >
                {day.day && day.day.map(entry => (
                  <div 
                    key={entry.id} 
                    className={`week-entry ${entry.status ? `status-${entry.status}` : ''}`}
                    style={{ backgroundColor: getCategoryColor(entry.category) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryClick(entry);
                    }}
                  >
                    {getStatusIcon(entry.status)}
                    <div className="entry-category">{entry.category}</div>
                    <div className="entry-practice">{entry.practice}</div>
                    <div className="entry-duration">⏱️ {entry.duration}</div>
                    {entry.repeatInterval && entry.repeatInterval !== 'Не повторять' && (
                      <div className="entry-repeat">🔄</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Вечер */}
              <div 
                className="week-period evening-period"
                onClick={() => handleSlotClick(new Date(day.date), 'evening')}
              >
                {day.evening && day.evening.map(entry => (
                  <div 
                    key={entry.id} 
                    className={`week-entry ${entry.status ? `status-${entry.status}` : ''}`}
                    style={{ backgroundColor: getCategoryColor(entry.category) }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryClick(entry);
                    }}
                  >
                    {getStatusIcon(entry.status)}
                    <div className="entry-category">{entry.category}</div>
                    <div className="entry-practice">{entry.practice}</div>
                    <div className="entry-duration">⏱️ {entry.duration}</div>
                    {entry.repeatInterval && entry.repeatInterval !== 'Не повторять' && (
                      <div className="entry-repeat">🔄</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно для добавления события */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => {
          setIsEditing(false);
          setSelectedDay(null);
          setSelectedPeriod(null);
          setSelectedCategory('');
          setSelectedCategoryId(null);
          setSelectedPractice('');
          setCategoryPractices([]);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Добавить событие</h3>
            <div className="selected-info">
              {selectedDay && (
                <p>
                  {selectedDay.toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              )}
              {selectedPeriod && (
                <p className="period-info">
                  {selectedPeriod === 'morning' && '🌅 Утро (06:00 - 12:00)'}
                  {selectedPeriod === 'day' && '☀️ День (12:00 - 18:00)'}
                  {selectedPeriod === 'evening' && '🌙 Вечер (18:00 - 00:00)'}
                </p>
              )}
            </div>
            
            <div className="add-item-form">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              
              {selectedCategory && (
                <select
                  value={selectedPractice}
                  onChange={(e) => setSelectedPractice(e.target.value)}
                  disabled={practicesLoading}
                >
                  <option value="">
                    {practicesLoading ? 'Загрузка практик...' : 'Выберите практику'}
                  </option>
                  {categoryPractices.map(practice => (
                    <option key={practice.id} value={practice.name}>
                      {practice.name}
                    </option>
                  ))}
                </select>
              )}
              
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>

              <select
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(e.target.value)}
              >
                {repeatOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              
              <div className="form-actions">
                <button 
                  onClick={addItem} 
                  className="add-btn"
                  disabled={!selectedCategory || !selectedPractice || practicesLoading}
                >
                  Добавить
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedDay(null);
                    setSelectedPeriod(null);
                    setSelectedCategory('');
                    setSelectedCategoryId(null);
                    setSelectedPractice('');
                    setCategoryPractices([]);
                  }} 
                  className="cancel-btn"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для статуса выполнения */}
      {selectedEntry && (
        <EntryStatusModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

export default WeekView;