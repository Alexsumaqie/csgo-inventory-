// src/components/Header.tsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import { useTheme } from '../theme/useTheme';
import { useAchievements } from '../pages/Achievements';
const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { xp } = useAchievements();

  const themes = [
    { label: 'Magenta', value: 'magenta' },
    { label: 'Retro CRT', value: 'retro' },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setDropdownOpen(false);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h2 className="header-title">Saphira's CS Hub</h2>
        <div className="xp-label">XP: {xp}</div>
        <nav className="nav-links">
          <NavLink to="/" end>🏠 Home</NavLink>
          <NavLink to="/inventory">🎒 Inventory</NavLink>
          <NavLink to="/Marketplace">🛒 Skin Ideas</NavLink>
          <NavLink to="/News">📰 News</NavLink>
          <NavLink to="/preview-lab">🧪 Preview Lab</NavLink>
          <NavLink to="/trivia">🧠 Trivia</NavLink>
          <NavLink to="/Aimtrainer">🎯 AimTrainer</NavLink>
          <NavLink to="/WishList">💾 WishList</NavLink>
          <NavLink to="/Achievements">🏆 Achievements</NavLink>

        </nav>
      </div>

      <div className="header-right">
        <button className="theme-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
          🎨 Theme
        </button>
        {dropdownOpen && (
          <div className="theme-dropdown">
            {themes.map((t) => (
              <div
                key={t.value}
                className={`theme-option ${theme === t.value ? 'active' : ''}`}
                onClick={() => handleThemeChange(t.value)}
              >
                {t.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;