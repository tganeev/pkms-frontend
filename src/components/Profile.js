import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Profile({ profile, setProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    preferences: {
      categories: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Защита от undefined profile
  const safeProfile = profile || {
    name: '',
    email: '',
    avatar: '',
    preferences: { categories: [] }
  };

  useEffect(() => {
    setFormData({
      name: safeProfile.name || '',
      email: safeProfile.email || '',
      avatar: safeProfile.avatar || '',
      preferences: {
        categories: safeProfile.preferences?.categories || []
      }
    });
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePreferenceChange = (category) => {
    const currentCategories = formData.preferences.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        categories: newCategories
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await api.updateProfile(formData);
      setProfile(formData);
      setSuccess('Профиль успешно обновлен');
      setTimeout(() => setSuccess(null), 3000);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Yoga', 'Boxing', 'SoftDev', 'MBA', 'English', 
    'Oratory', 'Math', 'Chinise', 'Finance', 'Chess', 'Business'
  ];

  // Используем safeProfile для отображения
  return (
    <div className="profile-container">
      <h2>Профиль пользователя</h2>
      
      {!isEditing ? (
        <div className="profile-view">
          <div className="avatar">
            {safeProfile.avatar ? (
              <img src={safeProfile.avatar} alt="avatar" />
            ) : (
              <div className="avatar-placeholder">
                {safeProfile.name ? safeProfile.name[0] : '👤'}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <p><strong>Имя:</strong> {safeProfile.name || 'Не указано'}</p>
            <p><strong>Email:</strong> {safeProfile.email || 'Не указан'}</p>
            
            <div className="preferred-categories">
              <h4>Любимые категории:</h4>
              {safeProfile.preferences?.categories?.length > 0 ? (
                <div className="categories-tags">
                  {safeProfile.preferences.categories.map(cat => (
                    <span key={cat} className="category-tag">{cat}</span>
                  ))}
                </div>
              ) : (
                <p>Не выбраны</p>
              )}
            </div>
          </div>
          
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            Редактировать
          </button>
        </div>
      ) : (
        <div className="profile-edit">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Имя:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>URL аватара:</label>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            
            <div className="form-group">
              <label>Любимые категории:</label>
              <div className="categories-checkboxes">
                {categories.map(category => (
                  <label key={category} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(formData.preferences?.categories || []).includes(category)}
                      onChange={() => handlePreferenceChange(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="edit-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;