import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const WeekContext = createContext();

export const useWeek = () => {
  const context = useContext(WeekContext);
  if (!context) {
    throw new Error('useWeek must be used within WeekProvider');
  }
  return context;
};

export const WeekProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWeek = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const data = await api.getWeekEntries(formattedDate);
      setWeekData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
    loadWeek(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
    loadWeek(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    loadWeek(today);
  };

  const value = {
    currentDate,
    weekData,
    loading,
    error,
    loadWeek,
    nextWeek,
    prevWeek,
    goToToday
  };

  return (
    <WeekContext.Provider value={value}>
      {children}
    </WeekContext.Provider>
  );
};
