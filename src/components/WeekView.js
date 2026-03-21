import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import EntryStatusModal from './EntryStatusModal';

function WeekView({ date, setDate }) {  // Добавляем setDate в пропсы
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedStandardId, setSelectedStandardId] = useState(null);
  const [repeatInterval, setRepeatInterval] = useState('');
  const [weekData, setWeekData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryStandards, setCategoryStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [standardsLoading, setStandardsLoading] = useState(false);

  const repeatOptions = ['Не повторять', 'Каждый день', 'Каждую неделю', 'Каждый месяц', 'Каждый год'];

  // Загружаем категории при монтировании компонента
  useEffect(() => {
    loadCategories();
  }, []);

  // Загружаем данные недели при изменении даты
  useEffect(() => {
    loadWeekData();
  }, [date]);

  // Загружаем стандарты при выборе категории
  useEffect(() => {
    if (selectedCategoryId) {
      loadCategoryStandards(selectedCategoryId);
    } else {
      setCategoryStandards([]);
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

const loadCategoryStandards = async (categoryId) => {
  setStandardsLoading(true);
  try {
    const standards = await api.getCategoryStandards(categoryId);
    
    // Фильтруем стандарты по статусу, а не по дате
    const activeStandards = standards.filter(standard => {
      // Используем поле active из ответа API
      // Если API не возвращает active, вычисляем сами
      if (standard.active !== undefined) {
        return standard.active === true;
      } else {
        // Если active нет, вычисляем по датам
        const today = new Date().toISOString().split('T')[0];
        return !standard.endDate || standard.endDate >= today;
      }
    });
    
    console.log('Active standards:', activeStandards);
    setCategoryStandards(activeStandards);
  } catch (err) {
    console.error('Error loading standards:', err);
    setError('Ошибка загрузки стандартов');
  } finally {
    setStandardsLoading(false);
  }
};

  const loadWeekData = async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const data = await api.getWeekEntries(formattedDate, 'test');
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
    setSelectedStandard('');
    setSelectedStandardId(null);
  };

  const handleStandardChange = (e) => {
    const standardName = e.target.value;
    const standard = categoryStandards.find(s => s.name === standardName);
    
    setSelectedStandard(standardName);
    setSelectedStandardId(standard?.id || null);
  };

  const handleSlotClick = (day, periodId) => {
    setSelectedDay(day);
    setSelectedPeriod(periodId);
    setIsEditing(true);
  };

  const addItem = async () => {
    if (!selectedCategory || !selectedStandard || !selectedDay || !selectedPeriod) return;

    try {
      const newEntry = {
        category: selectedCategory,
        practice: selectedStandard,
        period: selectedPeriod,
        repeatInterval: repeatInterval,
        entryDate: selectedDay.toISOString().split('T')[0]
      };

      await api.createEntry(newEntry, 'test');
      await loadWeekData();
      
      setSelectedCategory('');
      setSelectedCategoryId(null);
      setSelectedStandard('');
      setSelectedStandardId(null);
      setRepeatInterval('');
      setIsEditing(false);
      setSelectedDay(null);
      setSelectedPeriod(null);
      setCategoryStandards([]);
    } catch (err) {
      setError(err.message);
      console.error('Error creating entry:', err);
    }
  };

  const removeItem = async (dateKey, period, entryId) => {
    if (!window.confirm('Удалить запись?')) return;

    try {
      await api.deleteEntry(entryId, 'test');
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

  // Исправленные функции навигации
  const handlePrevWeek = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 7);
    setDate(newDate); // Используем setDate из пропсов
  };

  const handleNextWeek = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 7);
    setDate(newDate); // Используем setDate из пропсов
  };

  const handleToday = () => {
    setDate(new Date()); // Устанавливаем текущую дату
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryClick(entry);
                    }}
                  >
                    {getStatusIcon(entry.status)}
                    <div className="entry-category">{entry.category}</div>
                    <div className="entry-practice">{entry.practice}</div>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryClick(entry);
                    }}
                  >
                    {getStatusIcon(entry.status)}
                    <div className="entry-category">{entry.category}</div>
                    <div className="entry-practice">{entry.practice}</div>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryClick(entry);
                    }}
                  >
                    {getStatusIcon(entry.status)}
                    <div className="entry-category">{entry.category}</div>
                    <div className="entry-practice">{entry.practice}</div>
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
          setSelectedStandard('');
          setSelectedStandardId(null);
          setCategoryStandards([]);
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
                  value={selectedStandard}
                  onChange={handleStandardChange}
                  disabled={standardsLoading}
                >
                  <option value="">
                    {standardsLoading ? 'Загрузка стандартов...' : 'Выберите стандарт'}
                  </option>
                  {categoryStandards.map(standard => (
                    <option key={standard.id} value={standard.name}>
                      {standard.name}
                    </option>
                  ))}
                </select>
              )}

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
                  disabled={!selectedCategory || !selectedStandard || standardsLoading}
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
                    setSelectedStandard('');
                    setSelectedStandardId(null);
                    setCategoryStandards([]);
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