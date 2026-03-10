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
    const response = await fetch(
      `${API_BASE_URL}/entries/week?date=${date}&username=${USERNAME}`
    );
    return handleResponse(response);
  },

  // Создать новую запись
  createEntry: async (entryData) => {
    const response = await fetch(`${API_BASE_URL}/entries?username=${USERNAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entryData),
    });
    return handleResponse(response);
  },

  // Удалить запись
  deleteEntry: async (entryId) => {
    const response = await fetch(`${API_BASE_URL}/entries/${entryId}?username=${USERNAME}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Ошибка удаления');
    }
    return true;
  },

  // Получить список категорий (добавим позже)
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
  }
};
