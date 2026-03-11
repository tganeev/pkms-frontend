// Базовый URL API
const API_BASE_URL = 'http://localhost:8080/api';
const USERNAME = 'test'; // Пока используем тестового пользователя

// Вспомогательная функция для обработки ответов
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Ошибка запроса');
  }
  return response.json();
};

// API методы
export const api = {
  // Получить записи за неделю
  getWeekEntries: async (date) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/calendar/week?date=${date}&username=${USERNAME}`
      );
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getWeekEntries):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Создать новую запись
  createEntry: async (entryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar?username=${USERNAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (createEntry):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Удалить запись
  deleteEntry: async (entryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/${entryId}?username=${USERNAME}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }
      return true;
    } catch (error) {
      console.error('API Error (deleteEntry):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Получить список категорий
  getCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getCategories):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Обновить статус записи
  updateEntryStatus: async (entryId, statusData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/${entryId}/status?username=${USERNAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (updateEntryStatus):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Получить стандарты для категории
  getStandards: async (category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/standards?category=${category}`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getStandards):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Получить данные Yoga практики за дату
  getYogaPractice: async (date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/yoga/${date}`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getYogaPractice):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  }
}; // <-- Здесь закрываем объект
