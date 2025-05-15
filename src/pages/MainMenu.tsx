// pages/MainMenu.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainMenu.css';

const particlesOptions = {
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  emitters: {
    direction: 'top',
    rate: {
      delay: 0.2,
      quantity: 3,
    },
    size: {
      width: 100,
      height: 0,
    },
    position: {
      x: 50,
      y: 100,
    },
  },
  particles: {
    number: {
      value: 0,
    },
    color: {
      value: ['#00ffff', '#ff00ff', '#ffffff'],
    },
    shape: {
      type: 'circle',
    },
    opacity: {
      value: 0.7,
      animation: {
        enable: true,
        speed: 0.5,
        minimumValue: 0.3,
        sync: false,
      },
    },
    size: {
      value: 6,
      random: { enable: true, minimumValue: 3 },
      animation: {
        enable: true,
        speed: 5,
        minimumValue: 1,
        sync: false,
      },
    },
    life: {
      duration: {
        sync: true,
        value: 4,
      },
      count: 1,
    },
    move: {
      enable: true,
      gravity: {
        enable: true,
        acceleration: 5,
      },
      speed: { min: 5, max: 20 },
      decay: 0.1,
      direction: 'top',
      straight: false,
      outModes: {
        default: 'destroy',
        bottom: 'none',
      },
    },
  },
};

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const currentIndex = buttonRefs.current.findIndex(btn => btn === active);
      if (e.key === 'ArrowDown') {
        const next = (currentIndex + 1) % buttonRefs.current.length;
        buttonRefs.current[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        const prev = (currentIndex - 1 + buttonRefs.current.length) % buttonRefs.current.length;
        buttonRefs.current[prev]?.focus();
      } else if (e.key === 'Enter' && currentIndex >= 0) {
        buttonRefs.current[currentIndex]?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const toggleTerminal = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        document.body.classList.toggle('terminal-mode');
      }
    };
    window.addEventListener('keydown', toggleTerminal);
    return () => window.removeEventListener('keydown', toggleTerminal);
  }, []);

  const menuItems: [string, string][] = [
    ['🎒 My Inventory', '/inventory'],
    ['🛒 Marketplace', '/marketplace'],
    ['📰 News', '/News'],
    ['🧪 Skin Preview Lab', '/preview-lab'],
    ['🎲 CS2 Trivia', '/Trivia'],
    ['🎯 Aim Trainer', '/Aimtrainer'],
    ['💾 Wishlist', '/wishlist'],
    ['🏆 Achievements', '/achievements'],
    ['🎧 Music Kits Coming soon...', '/music-kits'],
    ['🧰 Utilities Coming soon ...', '/utilities'],
  ];

  return (
    <div className="main-menu-container">
      <div className="main-menu-overlay" />
      <div className="main-menu-wrapper">
        <div className="changelog-panel">
          <h2 className="changelog-title neon-text">🛠️ Version Log</h2>
          <ul className="changelog-list">
            <li className="changelog-entry"><span className="version-tag">v1.0.1</span> Fixed News carousel parsing (Steam CDN support)</li>
            <li className="changelog-entry"><span className="version-tag">v1.0.0</span> Initial hub launch: Inventory, News, Marketplace</li>
            <li className="changelog-entry"><span className="version-tag">v0.9.0</span> Layout prototyping and UI design tests</li>
          </ul>
        </div>
      </div>

      <div className="main-menu-inner">
        <h1 className="main-title">💎 Saphira's CS Hub</h1>
        <p className="terminal-hint">💻 Press <b>Ctrl + Shift + T</b> to enter Terminal Mode</p>

        <div className="menu-buttons">
          {menuItems.map(([label, path], idx) => (
            <button
              key={path}
              ref={(el) => { if (el) buttonRefs.current[idx] = el; }}
              tabIndex={0}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
                navigate(path);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
