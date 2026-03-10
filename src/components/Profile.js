import React, { useState } from 'react';

function Profile({ profile, setProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const categories = [
    { name: 'Yoga', subcategories: ['Концентрация', 'Медитация', 'Пранаяма', 'Кумбхака', 'Олень'] },
    { name: 'Boxing', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'SoftDev', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'MBA', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'English', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'Oratory', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'Math', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'Chinise', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'Finance', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'Chess', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] },
    { name: 'Business', subcategories: ['Стандарт 1', 'Стандарт 2', 'Стандарт 3'] }
  ];

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <h2>Профиль пользователя</h2>

      {!isEditing ? (
        <div className="profile-view">
          <div className="avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" />
            ) : (
              <div className="avatar-placeholder">
                {profile.name ? profile.name[0] : '👤'}
              </div>
            )}
          </div>

          <div className="profile-info">
            <p><strong>Имя:</strong> {profile.name || 'Не указано'}</p>
            <p><strong>Email:</strong> {profile.email || 'Не указан'}</p>

            <div className="preferred-categories">
              <h4>Любимые практики:</h4>
              {profile.preferences?.categories?.length > 0 ? (
                <div className="categories-tags">
                  {profile.preferences.categories.map(cat => (
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
          <div className="form-group">
            <label>Имя:</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>URL аватара:</label>
            <input
              type="text"
              value={formData.avatar || ''}
              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Любимые практики:</label>
            <div className="categories-checkboxes">
              {categories.map(category => (
                <label key={category.name} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.preferences?.categories?.includes(category.name) || false}
                    onChange={(e) => {
                      const prefs = formData.preferences || {};
                      const cats = prefs.categories || [];
                      const newCats = e.target.checked
                        ? [...cats, category.name]
                        : cats.filter(c => c !== category.name);

                      setFormData({
                        ...formData,
                        preferences: { ...prefs, categories: newCats }
                      });
                    }}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Сохранить</button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
