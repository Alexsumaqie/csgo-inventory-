// App.tsx - Main wrapper for the CS:GO Hub

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import InventoryGrid from './components/InventoryGrid';
import { ThemeProvider, useTheme } from './theme/useTheme';
import Header from './components/Header';
import Marketplace from './pages/Marketplace';
import News from './pages/News';
import Preview from './pages/PreviewLab';
import Trivia from './pages/Trivia';
import Wishlist from './pages/Wishlist';
import AchievementsPage from './pages/Achievements'; // renamed to avoid conflict
import { AchievementsProvider } from './pages/Achievements'; // provide the global achievement context
import AimTrainer from './aimtrainer/Aimtrainer';
import FlickMode from './aimtrainer/FlickMode';
import TrackingMode from './aimtrainer/TrackingMode';
import SpeedClickMode from './aimtrainer/SpeedClickMode';


import './components/ui/Theme.css';

const AppContent = () => {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/inventory" element={<InventoryGrid />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/news" element={<News />} />
        <Route path="/preview-lab" element={<Preview />} />
        <Route path="/trivia" element={<Trivia />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/aimtrainer" element={<AimTrainer />} />
        <Route path="/aimtrainer/flick" element={<FlickMode />} />
        <Route path="/aimtrainer/tracking" element={<TrackingMode />} />
        <Route path="/aimtrainer/speed" element={<SpeedClickMode />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AchievementsProvider>
          <AppContent />
        </AchievementsProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
