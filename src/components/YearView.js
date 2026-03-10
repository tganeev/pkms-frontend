import React from 'react';

function YearView({ date, entries, onSelectMonth }) {
  const year = date.getFullYear();
  const months = [];

  for (let i = 0; i < 12; i++) {
    months.push(new Date(year, i, 1));
  }

  const getMonthStats = (monthDate) => {
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalEntries = 0;
    let daysWithEntries = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateKey = currentDate.toDateString();
      const dayEntry = entries[dateKey];

      if (dayEntry) {
        const dayTotal = (dayEntry.morning?.length || 0) +
                        (dayEntry.day?.length || 0) +
                        (dayEntry.evening?.length || 0);

        if (dayTotal > 0) {
          totalEntries += dayTotal;
          daysWithEntries++;
        }
      }
    }

    return { totalEntries, daysWithEntries };
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className="year-view">
      <h2>{year} год</h2>

      <div className="months-grid">
        {months.map((monthDate, index) => {
          const stats = getMonthStats(monthDate);

          return (
            <div
              key={index}
              className="month-card"
              onClick={() => onSelectMonth(monthDate)}
            >
              <h3>{monthNames[index]}</h3>

              {stats.daysWithEntries > 0 ? (
                <div className="month-stats">
                  <p>📝 {stats.totalEntries} записей</p>
                  <p>📅 {stats.daysWithEntries} дней</p>
                  <div className="activity-bars">
                    {[...Array(31)].map((_, i) => (
                      <div
                        key={i}
                        className={`activity-bar ${i < stats.daysWithEntries ? 'active' : ''}`}
                        style={{
                          opacity: i < stats.daysWithEntries ?
                            0.3 + (i / stats.daysWithEntries) * 0.7 : 0.1
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
