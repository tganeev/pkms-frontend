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
      console.log(`Deleting entry with ID: ${entryId}`);
      const response = await fetch(`${API_BASE_URL}/calendar/${entryId}?username=${USERNAME}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Delete failed with status ${response.status}: ${errorText}`);
        throw new Error(`Ошибка удаления: ${response.status} - ${errorText}`);
      }
      
      console.log(`Successfully deleted entry ${entryId}`);
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
  },

  // Скопировать практики из другой категории
  copyPracticesFromCategory: async (targetCategoryId, sourceCategoryId, practiceIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${targetCategoryId}/copy-practices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCategoryId: sourceCategoryId,
          practiceIds: practiceIds
        }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (copyPracticesFromCategory):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Получить все связанные практики для данной практики
  getPracticeLinks: async (practiceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/practices/${practiceId}/links`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getPracticeLinks):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Добавить связь между практиками
  addPracticeLink: async (sourcePracticeId, targetPracticeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/practices/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourcePracticeId: sourcePracticeId,
          targetPracticeId: targetPracticeId
        }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (addPracticeLink):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Удалить связь между практиками
  deletePracticeLink: async (linkId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/practices/links/${linkId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления связи');
      }
      return true;
    } catch (error) {
      console.error('API Error (deletePracticeLink):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Получить все практики для выбора источника
  getAllPractices: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/practices/all`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getAllPractices):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Стандарты - статистика
  getAllStandardsStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/standards/stats`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getAllStandardsStats):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Получить стандарты категории
  getCategoryStandards: async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/standards`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (getCategoryStandards):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Создать стандарт
  createStandard: async (categoryId, standardData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/standards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(standardData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (createStandard):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Обновить стандарт
  updateStandard: async (standardId, standardData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/standards/${standardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(standardData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Error (updateStandard):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  },

  // Library
getLibraryView: async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/library?startDate=${startDate}&endDate=${endDate}`
    );
    return handleResponse(response);
  } catch (error) {
    console.error('API Error (getLibraryView):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

getAllBooks: async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/library/books`);
    return handleResponse(response);
  } catch (error) {
    console.error('API Error (getAllBooks):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

createBook: async (bookData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/library/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error (createBook):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

updateBook: async (bookId, bookData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/library/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error (updateBook):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

deleteBook: async (bookId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/library/books/${bookId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Ошибка удаления книги');
    }
    return true;
  } catch (error) {
    console.error('API Error (deleteBook):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

updateProfile: async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error (updateProfile):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

addReadingStat: async (bookId, statData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/library/books/${bookId}/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('API Error (addReadingStat):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

deleteReadingStat: async (bookId, date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/library/books/${bookId}/stats/${date}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Ошибка удаления статистики');
    }
    return true;
  } catch (error) {
    console.error('API Error (deleteReadingStat):', error);
    throw new Error(`Ошибка подключения к серверу: ${error.message}`);
  }
},

  // Удалить стандарт
  deleteStandard: async (standardId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/standards/${standardId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления стандарта');
      }
      return true;
    } catch (error) {
      console.error('API Error (deleteStandard):', error);
      throw new Error(`Ошибка подключения к серверу: ${error.message}`);
    }
  }
};