import React from 'react';

function MonthView({ date, entries, onSelectDate, setActiveView }) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay() || 7;
  const daysInMonth = lastDay.getDate();

  const getDaysArray = () => {
    const days = [];

    for (let i = 1; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getDayEntries = (date) => {
    if (!date) return { total: 0 };
    const dateKey = date.toDateString();
    const dayEntry = entries[dateKey];

    if (!dayEntry) return { total: 0 };

    const total = (dayEntry.morning?.length || 0) +
                  (dayEntry.day?.length || 0) +
                  (dayEntry.evening?.length || 0);

    return { total };
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const days = getDaysArray();

  const handlePrevMonth = () => {
    onSelectDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onSelectDate(new Date(year, month + 1, 1));
  };

return (
    <div className="month-view">
      <div className="month-header">
        <button onClick={handlePrevMonth}>←</button>
        <h2>
          {date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={handleNextMonth}>→</button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="week-day">{day}</div>
        ))}

        {days.map((day, index) => {
          const entries = day ? getDayEntries(day) : null;

          return (
            <div
              key={index}
              className={`calendar-day ${!day ? 'empty' : ''} ${entries?.total > 0 ? 'has-entries' : ''}`}
              onClick={() => {
                if (day) {
                  onSelectDate(day);
                  setActiveView('timeline'); // Изменено с 'day' на 'timeline'
                }
              }}
            >
              {day && (
                <>
                  <span className="day-number">{day.getDate()}</span>
                  {entries?.total > 0 && (
                    <span className="entries-count">
                      {entries.total} {entries.total === 1 ? 'запись' : 'записей'}
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
