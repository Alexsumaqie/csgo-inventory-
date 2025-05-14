import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import './Achievements.css';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  rewardXP?: number;
};

type AchievementContextType = {
  unlock: (id: string) => void;
  increment: (id: string, amt?: number) => void;
  xp: number;
  achievements: Achievement[];
};

const AchievementsContext = createContext<AchievementContextType | undefined>(
  undefined
);

export const useAchievements = (): AchievementContextType => {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievements must be inside AchievementsProvider');
  return ctx;
};

export const AchievementsProvider = ({ children }: { children: ReactNode }) => {
  const [xp, setXP] = useState(0);
  const [popup, setPopup] = useState<Achievement | null>(null);
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('achievementsData');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAchievements(parsed.achievements || []);
      setXP(parsed.xp || 0);
    }
  }, []);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'welcome',
      title: 'Welcome Operator',
      description: 'Open the app for the first time',
      category: 'General',
      unlocked: true,
      rewardXP: 100,
    },
    {
      id: 'market_cart_10',
      title: 'Collector',
      description: 'Add 10 skins to your cart',
      category: 'Marketplace',
      unlocked: false,
      progress: 0,
      target: 10,
      rewardXP: 250,
    },
    {
      id: 'preview_first',
      title: 'Lab Technician',
      description: 'Preview a skin in 3D',
      category: 'Inventory',
      unlocked: false,
      rewardXP: 150,
    },
    {
      id: 'trivia_5',
      title: 'Know It All',
      description: 'Answer 5 trivia questions correctly',
      category: 'Trivia',
      unlocked: false,
      progress: 0,
      target: 5,
      rewardXP: 200,
    },
    {
      id: 'wishlist_save',
      title: 'Dream Loadout',
      description: 'Save a wishlist',
      category: 'Wishlist',
      unlocked: false,
      rewardXP: 100,
    },
    {
      id: 'wishlist_5',
      title: 'Wishlist Architect',
      description: 'Create 5 wishlists',
      category: 'Wishlist',
      unlocked: false,
      progress: 0,
      target: 5,
      rewardXP: 300,
    },
  ]);

  const unlock = (id: string) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          if (ach.rewardXP) setXP((xp) => xp + ach.rewardXP);
          setPopup(ach);
          return { ...ach, unlocked: true };
        }
        return ach;
      })
    );
  };
  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      'achievementsData',
      JSON.stringify({ achievements, xp })
    );
  }, [achievements, xp]);

  const increment = (id: string, amt = 1) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === id && !ach.unlocked && ach.target) {
          const next = (ach.progress || 0) + amt;
          if (next >= ach.target) {
            if (ach.rewardXP) setXP((xp) => xp + ach.rewardXP);
            setPopup(ach);
            return { ...ach, unlocked: true, progress: ach.target };
          }
          return { ...ach, progress: next };
        }
        return ach;
      })
    );
  };

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);
  useEffect(() => {
    localStorage.setItem(
      'achievementsData',
      JSON.stringify({ achievements, xp })
    );
  }, [achievements, xp]);
  useEffect(() => {
    localStorage.setItem(
      'achievementsData',
      JSON.stringify({ achievements, xp })
    );
  }, [achievements, xp]);

  return (
    <AchievementsContext.Provider
      value={{ unlock, increment, xp, achievements }}
    >
      {children}

      {popup && (
        <div className="achievement-popup">
          <h3>🎉 Achievement Unlocked!</h3>
          <p>{popup.title}</p>
        </div>
      )}
    </AchievementsContext.Provider>
  );
};

// 👇 This is the actual UI page route
const AchievementsPage: React.FC = () => {
  const { achievements, xp } = useAchievements();

  return (
    <div className="achievements-container">
      <h1>Achievements</h1>
      <div className="xp-bar">XP: {xp}</div>
      <div className="achievements-grid">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
          >
            <h2>{ach.title}</h2>
            <p>{ach.description}</p>
            <p className="category">{ach.category}</p>
            {ach.target && (
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{
                    width: `${((ach.progress || 0) / ach.target) * 100}%`,
                  }}
                />
              </div>
            )}
            {ach.rewardXP && <div className="reward">+{ach.rewardXP} XP</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;
