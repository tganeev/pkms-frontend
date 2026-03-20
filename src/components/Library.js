import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import BookModal from './BookModal';
import ReadingStatModal from './ReadingStatModal';

function Library() {
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Refs для синхронизации прокрутки
  const leftContainerRef = useRef(null);
  const rightContainerRef = useRef(null);
  const rightHeaderRef = useRef(null);

  // Синхронизация вертикальной прокрутки
  useEffect(() => {
    const leftContainer = leftContainerRef.current;
    const rightContainer = rightContainerRef.current;

    if (!leftContainer || !rightContainer) return;

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
  }, [libraryData]);

  useEffect(() => {
    loadLibraryData();
  }, [dateRange]);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const data = await api.getLibraryView(dateRange.startDate, dateRange.endDate);
      setLibraryData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
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

  if (loading) return <div className="loading">Загрузка библиотеки...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;
  if (!libraryData) return <div className="error">Нет данных</div>;

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
          <input
            type="text"
            placeholder="🔍 Поиск книг..."
            className="search-input"
          />
        </div>
      </div>

      <div className="library-content">
        {/* Левая область - фиксированная */}
        <div className="left-panel" ref={leftContainerRef}>
          <div className="left-header">
            <div className="book-number">№</div>
            <div className="book-title">Название</div>
            <div className="book-author">Автор</div>
            <div className="book-status">Статус</div>
            <div className="book-category">Категория</div>
            <div className="book-actions">Действия</div>
          </div>
          <div className="left-body">
            {libraryData.books.map((book, index) => (
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
            ))}
          </div>
        </div>

        {/* Разделитель */}
        <div className="panel-divider"></div>

        {/* Правая область - с горизонтальной прокруткой */}
        <div className="right-panel">
          <div className="right-header" ref={rightHeaderRef}>
            <div className="dates-header">
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
          <div className="right-body" ref={rightContainerRef}>
            {libraryData.books.map((book) => (
              <div key={book.id} className="stats-row">
                {libraryData.dates.map(date => {
                  const stat = libraryData.stats[book.id]?.[date];
                  return (
                    <div 
                      key={date} 
                      className="stat-cell"
                      onClick={() => handleCellClick(book, date)}
                    >
                      <div className="pages-value">
                        {stat?.pagesRead || 0}
                      </div>
                      <div className="hours-value">
                        {stat?.hoursRead?.toFixed(1) || '0'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
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