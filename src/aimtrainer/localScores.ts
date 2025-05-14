const KEY_PREFIX = 'aimtrainer-best-';

// localScores.ts

// Best score handling
export const getBestScore = (mode: string): number => {
    return parseInt(localStorage.getItem(`${mode}_best`) || '0');
};

export const setBestScore = (mode: string, score: number): void => {
    localStorage.setItem(`${mode}_best`, String(score));
};

// 🆕 Session logging
export const logSession = (mode: string, score: number): void => {
    const logs = JSON.parse(localStorage.getItem(`${mode}_logs`) || '[]');
    logs.push({
        score,
        timestamp: new Date().toISOString(),
    });
    localStorage.setItem(`${mode}_logs`, JSON.stringify(logs));
};

export const getSessionLogs = (mode: string): { score: number; timestamp: string }[] => {
    return JSON.parse(localStorage.getItem(`${mode}_logs`) || '[]');
};
