// Базовый URL API
const API_BASE_URL = 'http://localhost:8080/api';
const USERNAME = 'test'; // Пока используем тестового пользователя

// Вспомогательная функция для обработки ответов
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Ошибка запроса');
  }
  
  const text = await response.text();
  if (!text) {
    return null;
  }
  
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Invalid JSON response:', text);
    throw new Error('Сервер вернул некорректные данные');
  }
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

  // Получить категорию по ID
  getCategory: async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getCategory):', error);
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
  },

  // Получить таблицу категории
  getCategoryTable: async (categoryName, startDate, endDate) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories/${categoryName}/table?startDate=${startDate}&endDate=${endDate}`
      );
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getCategoryTable):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Управление категориями
  createCategory: async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (createCategory):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (updateCategory):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

deleteCategory: async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Ошибка удаления категории');
    }
    return true;
  } catch (error) {
    console.error('API Error (deleteCategory):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

  // Управление практиками
  addPractice: async (categoryId, practiceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/practices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(practiceData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (addPractice):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },
  // Получить практики категории по ID
getCategoryPractices: async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
    const categoryData = await handleResponse(response);
    return categoryData.practices || [];
  } catch (error) {
    console.error('API Error (getCategoryPractices):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

  updatePractice: async (practiceId, practiceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/practices/${practiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(practiceData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (updatePractice):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  deletePractice: async (practiceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/practices/${practiceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления практики');
      }
      return true;
    } catch (error) {
      console.error('API Error (deletePractice):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  }
};