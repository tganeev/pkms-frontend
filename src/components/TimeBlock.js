import React, { useState } from 'react';

function TimeBlock({ timeRange, period, items = [], onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPractice, setSelectedPractice] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('30 мин');
  const [repeatInterval, setRepeatInterval] = useState('');

  const categories = [
    {
      name: 'Yoga',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'Boxing',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'SoftDev',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'MBA',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'English',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'Oratory',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'Math',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'Chinise',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'Finance',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'Chess',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    },
    {
      name: 'Business',
      practices: ['Ядро', 'Стандарт 1', 'Стандарт 2', 'Стандарт 3']
    }
  ];

  const timeOptions = [
    '5 мин', '10 мин', '15 мин', '30 мин', '31 мин',
    '60 мин', '90 мин', '120 мин', '180 мин'
  ];

  const repeatOptions = [
    'Не повторять',
    'Каждый день',
    'Каждую неделю',
    'Каждый месяц',
    'Каждый год'
  ];

  const addItem = () => {
    if (selectedCategory && selectedPractice) {
      const newItem = {
        id: Date.now(),
        category: selectedCategory,
        practice: selectedPractice,
        duration: selectedDuration,
        repeat: repeatInterval,
        period: period,
        timeRange: timeRange
      };
      onUpdate([...items, newItem]);

      // Сброс формы
      setSelectedCategory('');
      setSelectedPractice('');
      setSelectedDuration('30 мин');
      setRepeatInterval('');
      setIsEditing(false);
    }
  };

  const removeItem = (itemId) => {
    onUpdate(items.filter(item => item.id !== itemId));
  };

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

  const getCurrentCategory = () => {
    return categories.find(c => c.name === selectedCategory);
  };

  // Получить фоновый цвет в зависимости от периода
  const getPeriodBackground = () => {
    switch(period) {
      case 'утро': return 'linear-gradient(135deg, #fff9e6, #ffe0b2)';
      case 'день': return 'linear-gradient(135deg, #e6f3ff, #b3e0ff)';
      case 'вечер': return 'linear-gradient(135deg, #e6e6fa, #d1c4e9)';
      default: return 'white';
    }
  };

  return (
    <div
      className="time-block"
      style={{
        borderColor: getCategoryColor(items[0]?.category),
        background: getPeriodBackground()
      }}
    >
      <div className="block-content">
        {items.length > 0 ? (
          <ul className="items-list">
            {items.map(item => (
              <li key={item.id} className="item">
                <span
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                >
                  {item.category}
                </span>
                <span className="practice-text">{item.practice}</span>
                <span className="duration-badge">⏱️ {item.duration}</span>
                {item.repeat && item.repeat !== 'Не повторять' && (
                  <span className="repeat-badge">🔄 {item.repeat}</span>
                )}
                <button onClick={() => removeItem(item.id)} className="remove-btn">✕</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">Нет записей</p>
        )}

        {isEditing && (
          <div className="add-item-form">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedPractice('');
              }}
            >
              <option value="">Выберите категорию</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {selectedCategory && (
              <select
                value={selectedPractice}
                onChange={(e) => setSelectedPractice(e.target.value)}
              >
                <option value="">Выберите практику</option>
                {getCurrentCategory()?.practices.map(practice => (
                  <option key={practice} value={practice}>{practice}</option>
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
                disabled={!selectedCategory || !selectedPractice}
              >
                Добавить
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="cancel-btn"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="toggle-edit-btn"
          >
            + Добавить
          </button>
        )}
      </div>
    </div>
  );
}

export default TimeBlock;
