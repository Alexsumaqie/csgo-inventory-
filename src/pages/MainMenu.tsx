// pages/MainMenu.tsx

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadSlim } from 'tsparticles-slim'; // ✅ smaller + works
import './Marketplace.css';
import type { ISourceOptions } from 'tsparticles-engine';
import type { Engine } from 'tsparticles-engine';
import Particles from 'react-tsparticles';


const particlesInit = async (engine: Engine) => {
  await loadSlim(engine);
};


const particlesOptions: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  particles: {
    number: {
      value: 20,
      density: { enable: true, area: 700 },
    },
    shape: {
      type: 'char',
      character: [
        { value: '💎', font: 'Verdana', style: '', weight: '400' },
        { value: '🔫', font: 'Verdana', style: '', weight: '400' },
        { value: '❤️', font: 'Verdana', style: '', weight: '400' },
        { value: '🎲', font: 'Verdana', style: '', weight: '400' },
      ],
    },
    color: { value: ['#ffffff', '#ff00c8', '#00ffff', '#f472b6'] },
    opacity: {
      value: 0.9,
      random: true,
      animation: { enable: true, speed: 0.6, minimumValue: 0.3, sync: false },
    },
    size: {
      value: 24,
      random: { enable: true, minimumValue: 18 },
    },
    move: {
      enable: true,
      speed: 0.6,
      direction: 'none' as const,
      outModes: { default: 'out' },
    },
  },
};

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  // 🎮 Arrow key navigation
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

  // 💻 Terminal mode easter egg: Ctrl+Shift+T
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
    [' 📰 News', '/News'],
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

        <Particles
          id="changelog-particles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false },
            background: { color: 'transparent' },
            fpsLimit: 60,
            interactivity: {
              events: {
                onClick: { enable: true, mode: 'repulse' },
                onHover: { enable: true, mode: 'grab' },
                resize: true,
              },
              modes: {
                grab: { distance: 120, links: { opacity: 0.5 } },
                repulse: { distance: 150 },
              },
            },
            particles: {
              number: { value: 15 },
              shape: {
                type: 'char',
                character: [
                  { value: '💎', font: 'Verdana', weight: '400' },
                  { value: '🎯', font: 'Verdana', weight: '400' },
                  { value: '🔫', font: 'Verdana', weight: '400' },
                  { value: '❤️', font: 'Verdana', weight: '400' },
                ],
              },
              color: { value: ['#00ffff', '#ff00ff', '#ffffff'] },
              size: {
                value: 16,
                random: { enable: true, minimumValue: 12 },
              },
              opacity: {
                value: 0.7,
                random: true,
                animation: { enable: true, speed: 0.4, minimumValue: 0.3 },
              },
              move: {
                enable: true,
                speed: 0.6,
                direction: 'none',
                outModes: { default: 'bounce' },
              },
            },
            detectRetina: true,
          }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'auto',
          }}
        />
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
                // ripple (optional)
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
