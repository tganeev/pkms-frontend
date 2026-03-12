import React, { useState } from 'react';
import './App.css';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import YearView from './components/YearView';
import Profile from './components/Profile';
import CategoryMenu from './components/CategoryMenu';
import { WeekProvider } from './context/WeekContext';

function App() {
  const [activeView, setActiveView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const renderView = () => {
    switch(activeView) {
      case 'week':
        return (
          <WeekProvider>
            <WeekView date={selectedDate} />
          </WeekProvider>
        );
      case 'month':
        return <MonthView 
          date={selectedDate}
          onSelectDate={setSelectedDate}
          setActiveView={setActiveView}
        />;
      case 'year':
        return <YearView 
          date={selectedDate}
          onSelectMonth={(date) => {
            setSelectedDate(date);
            setActiveView('month');
          }}
        />;
      case 'categories':
        return <CategoryMenu />;
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📅 PKMS Planner</h1>
        <nav className="main-nav">
          <button 
            className={activeView === 'week' ? 'active' : ''}
            onClick={() => setActiveView('week')}
          >
            Неделя
          </button>
          <button 
            className={activeView === 'month' ? 'active' : ''}
            onClick={() => setActiveView('month')}
          >
            Месяц
          </button>
          <button 
            className={activeView === 'year' ? 'active' : ''}
            onClick={() => setActiveView('year')}
          >
            Год
          </button>
          <button 
            className={activeView === 'categories' ? 'active' : ''}
            onClick={() => setActiveView('categories')}
          >
            📊 Категории
          </button>
          <button 
            className={activeView === 'profile' ? 'active' : ''}
            onClick={() => setActiveView('profile')}
          >
            👤 Профиль
          </button>
        </nav>
      </header>
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;