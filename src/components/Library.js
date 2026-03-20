import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import BookModal from './BookModal';
import ReadingStatModal from './ReadingStatModal';

function Library() {
  const [libraryData, setLibraryData] = useState(null);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const saved = localStorage.getItem('library_left_panel_width');
    return saved ? parseInt(saved, 10) : 500;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Рефы
  const leftContainerRef = useRef(null);
  const rightContainerRef = useRef(null);
  const leftHeaderRef = useRef(null);
  const rightHeaderRef = useRef(null);
  const rightBodyRef = useRef(null);
  const dividerRef = useRef(null);

  // Сохранение ширины
  useEffect(() => {
    localStorage.setItem('library_left_panel_width', leftPanelWidth.toString());
  }, [leftPanelWidth]);

  // Загрузка данных
  useEffect(() => {
    loadLibraryData();
  }, [dateRange.startDate, dateRange.endDate]);

  // Фильтрация книг при изменении поискового запроса или данных
  useEffect(() => {
    if (libraryData) {
      const filtered = libraryData.books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, libraryData]);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const data = await api.getLibraryView(dateRange.startDate, dateRange.endDate);
      setLibraryData(data);
      setFilteredBooks(data.books);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Синхронизация вертикальной прокрутки
  useEffect(() => {
    const leftContainer = leftContainerRef.current;
    const rightContainer = rightContainerRef.current;

    if (!leftContainer || !rightContainer || !filteredBooks.length) return;

    const handleLeftScroll = () => {
      rightContainer.scrollTop = leftContainer.scrollTop;
    };

    const handleRightScroll = () => {
      leftContainer.scrollTop = rightContainer.scrollTop;
    };

    leftContainer.addEventListener('scroll', handleLeftScroll);
    rightContainer.addEventListener('scroll', handleRightScroll);

    return () => {
      leftContainer.removeEventListener('scroll', handleLeftScroll);
      rightContainer.removeEventListener('scroll', handleRightScroll);
    };
  }, [filteredBooks]);

  // Синхронизация горизонтальной прокрутки
  const handleBodyScroll = useCallback((e) => {
    if (rightHeaderRef.current) {
      rightHeaderRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  // Синхронизация высоты заголовков
  useEffect(() => {
    const syncHeaderHeights = () => {
      if (leftHeaderRef.current && rightHeaderRef.current) {
        const maxHeight = Math.max(
          leftHeaderRef.current.offsetHeight,
          rightHeaderRef.current.offsetHeight
        );
        leftHeaderRef.current.style.height = `${maxHeight}px`;
        rightHeaderRef.current.style.height = `${maxHeight}px`;
      }
    };

    if (filteredBooks.length) {
      syncHeaderHeights();
    }
    window.addEventListener('resize', syncHeaderHeights);
    return () => window.removeEventListener('resize', syncHeaderHeights);
  }, [filteredBooks]);

  // Логика изменения ширины
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      const minWidth = 300;
      const maxWidth = window.innerWidth - 400;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const startResizing = () => {
    setIsResizing(true);
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setShowBookModal(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowBookModal(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Удалить книгу?')) return;
    
    try {
      await api.deleteBook(bookId);
      await loadLibraryData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCellClick = (book, date) => {
    setSelectedBook(book);
    setSelectedDate(date);
    setShowStatModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Completed': { color: '#28a745', text: '✅ Завершена' },
      'In process': { color: '#ffc107', text: '📖 Читается' },
      'In plan': { color: '#6c757d', text: '📋 В планах' },
      'Stopped': { color: '#dc3545', text: '⏸️ Отложена' },
      'Loading': { color: '#17a2b8', text: '📥 Загрузка...' }
    };
    return statusMap[status] || { color: '#6c757d', text: status };
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const getStatValue = (bookId, date) => {
    if (!libraryData?.stats) return { pagesRead: 0, hoursRead: '0.0' };
    
    const stat = libraryData.stats[bookId]?.[date];
    
    return {
      pagesRead: (stat?.pagesRead !== undefined && stat?.pagesRead !== null) ? stat.pagesRead : 0,
      hoursRead: (stat?.hoursRead !== undefined && stat?.hoursRead !== null) ? stat.hoursRead.toFixed(1) : '0.0'
    };
  };

  if (loading) return <div className="loading">Загрузка библиотеки...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!libraryData) return <div className="error">Нет данных</div>;

  const columnWidth = 80;
  const totalWidth = libraryData.dates.length * columnWidth;
  const totalBooks = libraryData.books.length;
  const filteredCount = filteredBooks.length;

  return (
    <div className="library-container">
      <div className="library-header">
        <h2>📚 Библиотека</h2>
        <div className="library-controls">
          <button onClick={handleAddBook} className="add-book-btn">
            + Добавить книгу
          </button>
          <div className="date-range-selector">
            <label>
              С:
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </label>
            <label>
              По:
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </label>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Поиск по названию книги..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <span className="search-results-count">
                Найдено: {filteredCount} из {totalBooks}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="library-content" style={{ display: 'flex' }}>
        {/* Левая область */}
        <div className="left-panel" style={{ width: leftPanelWidth }}>
          <div className="left-header" ref={leftHeaderRef}>
            <div className="book-number">№</div>
            <div className="book-title">Название</div>
            <div className="book-author">Автор</div>
            <div className="book-status">Статус</div>
            <div className="book-category">Категория</div>
            <div className="book-actions">Действия</div>
          </div>
          <div className="left-body" ref={leftContainerRef}>
            {filteredBooks.length === 0 ? (
              <div className="no-results">
                📭 Книги "{searchQuery}" не найдены
              </div>
            ) : (
              filteredBooks.map((book, index) => (
                <div key={book.id} className="book-row">
                  <div className="book-number">{index + 1}</div>
                  <div className="book-title" title={book.title}>
                    {book.title.length > 30 
                      ? book.title.substring(0, 30) + '…' 
                      : book.title}
                  </div>
                  <div className="book-author">{book.author || '—'}</div>
                  <div className="book-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusBadge(book.status).color }}
                    >
                      {getStatusBadge(book.status).text}
                    </span>
                  </div>
                  <div className="book-category">{book.categoryName || '—'}</div>
                  <div className="book-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditBook(book)}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteBook(book.id)}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Разделительная линия */}
        <div 
          ref={dividerRef}
          className="panel-divider"
          onMouseDown={startResizing}
          style={{ cursor: 'col-resize' }}
        >
          <div className="divider-grip"></div>
        </div>

        {/* Правая область */}
        <div className="right-panel">
          <div 
            className="right-header" 
            ref={rightHeaderRef}
            style={{ overflowX: 'hidden' }}
          >
            <div className="dates-header" style={{ width: totalWidth }}>
              {libraryData.dates.map(date => (
                <div key={date} className="date-column">
                  <div className="date-label">{formatDate(date)}</div>
                  <div className="date-subheader">
                    <span className="pages-label">стр</span>
                    <span className="hours-label">ч</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div 
            className="right-body" 
            ref={rightBodyRef}
            onScroll={handleBodyScroll}
            style={{ overflowX: 'auto', overflowY: 'auto' }}
          >
            {filteredBooks.length === 0 ? (
              <div className="no-results-stats">
                <div className="empty-stats-message">
                  📭 Нет данных для отображения
                </div>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <div 
                  key={book.id} 
                  className="stats-row" 
                  style={{ width: totalWidth }}
                >
                  {libraryData.dates.map(date => {
                    const { pagesRead, hoursRead } = getStatValue(book.id, date);
                    return (
                      <div 
                        key={date} 
                        className="stat-cell"
                        onClick={() => handleCellClick(book, date)}
                      >
                        <div className="pages-value">{pagesRead}</div>
                        <div className="hours-value">{hoursRead}</div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Итоги за период */}
      <div className="library-footer">
        <div className="period-totals">
          <span className="total-label">Итого за период:</span>
          <span className="total-pages">📄 {libraryData.totalPagesAll} стр</span>
          <span className="total-hours">⏱️ {libraryData.totalHoursAll.toFixed(1)} ч</span>
        </div>
      </div>

      {/* Модальные окна */}
      {showBookModal && (
        <BookModal
          book={editingBook}
          onClose={() => setShowBookModal(false)}
          onUpdate={() => {
            loadLibraryData();
            setShowBookModal(false);
          }}
        />
      )}

      {showStatModal && selectedBook && selectedDate && (
        <ReadingStatModal
          book={selectedBook}
          date={selectedDate}
          stat={libraryData.stats[selectedBook.id]?.[selectedDate]}
          onClose={() => {
            setShowStatModal(false);
            setSelectedBook(null);
            setSelectedDate(null);
          }}
          onUpdate={() => {
            loadLibraryData();
            setShowStatModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Library;