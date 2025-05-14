import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AimTrainer.css';

const AimTrainer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="aimtrainer-menu">
      <h1>🎯 Aim Trainer</h1>
      <p>Sharpen your flicks and reaction time. Choose a mode below to begin:</p>

      <div className="aimtrainer-buttons">
        <button className="aimtrainer-flick" onClick={() => navigate('/aimtrainer/flick')}>
          Flick Mode
        </button>
        <button className="aimtrainer-tracking" onClick={() => navigate('/aimtrainer/tracking')}>
          Tracking Mode
        </button>
        <button className="aimtrainer-speed" onClick={() => navigate('/aimtrainer/speed')}>
          Speed Click Mode
        </button>
      </div>
    </div>
  );
};

export default AimTrainer;
