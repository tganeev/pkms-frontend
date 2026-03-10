import React, { useState } from 'react';
import TimeBlock from './TimeBlock';

function TimelineView({ date, entries, setEntries }) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [showWeek, setShowWeek] = useState(false);

  // Генерация временных слотов с 6 утра до 24 ночи
  const timeSlots = [];
  for (let hour = 6; hour < 24; hour++) {
    const start = hour.toString().padStart(2, '0') + ':00';
    const end = (hour + 1).toString().padStart(2, '0') + ':00';
    timeSlots.push({
      hour,
      label: `${start} - ${end}`,
      period: hour < 12 ? 'morning' : hour < 18 ? 'day' : 'evening'
    });
  }

  // Получение дней для отображения
  const getDaysToShow = () => {
    if (!showWeek) {
      return [selectedDate];
    }

    const days = [];
    const current = new Date(selectedDate);
    const day = current.getDay() || 7;
    current.setDate(current.getDate() - day + 1);

    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const daysToShow = getDaysToShow();
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  // Получение записей для конкретного дня и часа
  const getEntriesForTime = (date, hour) => {
    const dateKey = date.toDateString();
    const dayEntry = entries[dateKey];
    if (!dayEntry) return [];

    const period = hour < 12 ? 'morning' : hour < 18 ? 'day' : 'evening';
    return (dayEntry[period] || []).filter(item => {
      // Если у записи есть указание часа, фильтруем по нему
      if (item.hour !== undefined) {
        return item.hour === hour;
      }
      // Иначе показываем в соответствующем временном блоке
      return true;
    });
  };

  // Функция для добавления записи с указанием часа
  const addEntryWithTime = (date, hour, entry) => {
    const dateKey = date.toDateString();
    const period = hour < 12 ? 'morning' : hour < 18 ? 'day' : 'evening';

    const newEntry = {
      ...entry,
      id: Date.now(),
      hour: hour,
      date: dateKey
    };

    // Если есть повтор, создаем записи для будущих дней
    if (entry.repeat && entry.repeat !== 'Не повторять') {
      const futureEntries = generateFutureEntries(date, entry);

      setEntries(prev => ({
        ...prev,
        ...futureEntries,
        [dateKey]: {
          ...prev[dateKey],
          [period]: [...(prev[dateKey]?.[period] || []), newEntry]
        }
      }));
    } else {
      setEntries(prev => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [period]: [...(prev[dateKey]?.[period] || []), newEntry]
        }
      }));
    }
  };

  // Генерация будущих записей на основе интервала повтора
  const generateFutureEntries = (startDate, entry) => {
    const futureEntries = {};
    const maxFutureDays = 30; // Максимум на месяц вперед

    for (let i = 1; i <= maxFutureDays; i++) {
      const nextDate = new Date(startDate);

      switch(entry.repeat) {
        case 'Каждый день':
          nextDate.setDate(startDate.getDate() + i);
          break;
        case 'Каждую неделю':
          nextDate.setDate(startDate.getDate() + (i * 7));
          break;
        case 'Каждый месяц':
          nextDate.setMonth(startDate.getMonth() + i);
          break;
        case 'Каждый год':
          nextDate.setFullYear(startDate.getFullYear() + i);
          break;
        default:
          continue;
      }

      const nextDateKey = nextDate.toDateString();
      const period = entry.hour < 12 ? 'morning' : entry.hour < 18 ? 'day' : 'evening';

      const futureEntry = {
        ...entry,
        id: Date.now() + i,
        hour: entry.hour,
        date: nextDateKey,
        originalDate: startDate.toDateString()
      };

      if (!futureEntries[nextDateKey]) {
        futureEntries[nextDateKey] = { morning: [], day: [], evening: [] };
      }

      futureEntries[nextDateKey][period].push(futureEntry);
    }

    return futureEntries;
  };

  // Удаление записи
  const removeEntry = (dateKey, entryId) => {
    setEntries(prev => {
      const newEntries = { ...prev };
      if (newEntries[dateKey]) {
        ['morning', 'day', 'evening'].forEach(period => {
          newEntries[dateKey][period] = newEntries[dateKey][period].filter(
            item => item.id !== entryId
          );
        });
      }
      return newEntries;
    });
  };

  // Форматирование даты для заголовка
  const formatDate = (date) => {
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  // Проверка, является ли день сегодняшним
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Навигация по дням/неделям
  const navigate = (direction) => {
    const newDate = new Date(selectedDate);
    if (showWeek) {
      newDate.setDate(selectedDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(selectedDate.getDate() + direction);
    }
    setSelectedDate(newDate);
  };

  // Получение цвета для категории
  const getCategoryColor = (category) => {
    const colors = {
      'Yoga': '#ff6b6b',
      'Boxing': '#4ecdc4',
      'SoftDev': '#45b7d1',
      'MBA': '#96ceb4',
      'English': '#ffeaa7',
      'Oratory': '#ff9ff3',
      'Math': '#feca57',
      'Chinise': '#ffb8b8',
      'Finance': '#c56cf0',
      'Chess': '#ffcccc',
      'Business': '#a8e6cf'
    };
    return colors[category] || '#ddd';
  };

  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <div className="navigation">
          <button onClick={() => navigate(-1)}>←</button>
          <h2>
            {showWeek ? (
              <>
                {formatDate(daysToShow[0])} - {formatDate(daysToShow[6])}
              </>
            ) : (
              selectedDate.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            )}
          </h2>
          <button onClick={() => navigate(1)}>→</button>
        </div>

        <div className="view-toggle">
          <button
            className={!showWeek ? 'active' : ''}
            onClick={() => setShowWeek(false)}
          >
            День
          </button>
          <button
            className={showWeek ? 'active' : ''}
            onClick={() => setShowWeek(true)}
          >
            Неделя
          </button>
        </div>
      </div>

      <div className="timeline-grid">
        <div className="time-column">
          <div className="time-header">Время</div>
          {timeSlots.map(slot => (
            <div key={slot.hour} className={`time-slot ${slot.period}`}>
              {slot.label}
            </div>
          ))}
        </div>

        {daysToShow.map((day, dayIndex) => (
          <div key={dayIndex} className={`day-column ${isToday(day) ? 'today' : ''}`}>
            <div className="day-header">
              <div className="day-name">{showWeek ? dayNames[dayIndex] : ''}</div>
              <div className="day-date">{formatDate(day)}</div>
            </div>

            {timeSlots.map(slot => {
              const entries = getEntriesForTime(day, slot.hour);

              return (
                <div
                  key={slot.hour}
                  className={`day-time-slot ${slot.period}`}
                  onClick={() => {
                    // Здесь можно открыть форму добавления для конкретного времени
                    const newEntry = prompt('Введите категорию и практику (например: Yoga, Ядро)');
                    if (newEntry) {
                      const [category, practice] = newEntry.split(',').map(s => s.trim());
                      addEntryWithTime(day, slot.hour, {
                        category,
                        practice,
                        duration: '30 мин',
                        repeat: 'Не повторять'
                      });
                    }
                  }}
                >
                  {entries.map(entry => (
                    <div
                      key={entry.id}
                      className="timeline-entry"
                      style={{ backgroundColor: getCategoryColor(entry.category) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Удалить запись?')) {
                          removeEntry(day.toDateString(), entry.id);
                        }
                      }}
                    >
                      <div className="entry-category">{entry.category}</div>
                      <div className="entry-practice">{entry.practice}</div>
                      <div className="entry-duration">⏱️ {entry.duration}</div>
                      {entry.repeat && entry.repeat !== 'Не повторять' && (
                        <div className="entry-repeat">🔄</div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimelineView;
