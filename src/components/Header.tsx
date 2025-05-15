// src/components/Header.tsx

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import { useTheme } from '../theme/useTheme';
import { useAchievements } from '../pages/Achievements';
import YouTube from 'react-youtube';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { xp } = useAchievements();
  const [musicOn, setMusicOn] = useState(true);
  const [player, setPlayer] = useState<any>(null);
const themes = [
  { label: 'Magenta', value: 'magenta' },
  { label: 'Retro CRT', value: 'retro' },
];
  const MUSIC_VIDEO_ID = 'loaEWumssns'; // 👈 change to any YT video ID

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setDropdownOpen(false);
  };

  const toggleMusic = () => {
    if (player) {
      const currentTime = player.getCurrentTime();
      localStorage.setItem('music-time', currentTime.toString());
      if (musicOn) {
        player.pauseVideo();
      } else {
        const storedTime = parseFloat(localStorage.getItem('music-time') || '0');
        player.seekTo(storedTime, true);
        player.playVideo();
      }
    }
    setMusicOn(!musicOn);
  };

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 0,
      modestbranding: 1,
      loop: 1,
      playlist: MUSIC_VIDEO_ID,
    },
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

        {/* 🎵 Music Player Toggle */}
        <button className={`music-toggle ${musicOn ? 'playing' : ''}`} onClick={toggleMusic}>
          {musicOn ? '🔊 Music On' : '🔇 Music Off'}
          <div className="glow-bar" />
        </button>

        <YouTube
          videoId={MUSIC_VIDEO_ID}
          opts={opts}
          onReady={(e) => {
            const stored = parseFloat(localStorage.getItem('music-time') || '0');
            setPlayer(e.target);
            e.target.seekTo(stored, true);
            if (musicOn) e.target.playVideo();
            else e.target.pauseVideo();
          }}
          className="yt-player"
        />
      </div>
    </header>
  );
};

export default Header;
