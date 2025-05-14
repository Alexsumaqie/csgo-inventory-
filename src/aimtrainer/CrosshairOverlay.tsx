import React from 'react';
import './CrosshairOverlay.css';

const CrosshairOverlay: React.FC = () => {
  return (
    <div className="crosshair-overlay">
      <div className="crosshair-vertical" />
      <div className="crosshair-horizontal" />
    </div>
  );
};

export default CrosshairOverlay;
