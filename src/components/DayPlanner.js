import React, { useState } from 'react';
import TimeBlock from './TimeBlock';

function DayPlanner({ date, entries, setEntries }) {
  const dateKey = date.toDateString();
  const dayEntry = entries[dateKey] || { morning: [], day: [], evening: [] };

  const timeBlocks = [
    {
      id: 'morning',
      timeRange: '06:00 - 12:00',
      period: 'утро'
    },
    {
      id: 'day',
      timeRange: '12:00 - 18:00',
      period: 'день'
    },
    {
      id: 'evening',
      timeRange: '18:00 - 00:00',
      period: 'вечер'
    }
  ];

  const handleBlockUpdate = (blockId, items) => {
    setEntries({
      ...entries,
      [dateKey]: {
        ...dayEntry,
        [blockId]: items
      }
    });
  };

  const handlePrevDay = () => {
    const prevDay = new Date(date);
    prevDay.setDate(date.getDate() - 1);
    window.location.reload();
  };

  const handleNextDay = () => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    window.location.reload();
  };

  const handleToday = () => {
    window.location.reload();
  };

  return (
    <div className="day-planner">
      <div className="day-navigation">
        <button onClick={handlePrevDay} className="nav-btn">←</button>
        <div className="day-title">
          <h2>
            {date.toLocaleDateString('ru-RU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <button onClick={handleToday} className="today-btn">
            Сегодня
          </button>
        </div>
        <button onClick={handleNextDay} className="nav-btn">→</button>
      </div>

      <div className="vertical-schedule">
        {/* Левая колонка с временными промежутками */}
        <div className="time-labels-column">
          <div className="time-labels-header">Время</div>
          <div className="time-label morning-label">06:00 - 12:00</div>
          <div className="time-label day-label">12:00 - 18:00</div>
          <div className="time-label evening-label">18:00 - 00:00</div>
        </div>

        {/* Правая колонка с блоками (без заголовков) */}
        <div className="blocks-column">
          {timeBlocks.map(block => (
            <TimeBlock
              key={block.id}
              id={block.id}
              timeRange={block.timeRange}
              period={block.period}
              items={dayEntry[block.id]}
              onUpdate={(items) => handleBlockUpdate(block.id, items)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DayPlanner;
