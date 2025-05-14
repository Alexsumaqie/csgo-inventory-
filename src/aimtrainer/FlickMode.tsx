import React, { useEffect, useRef, useState, useCallback } from 'react';
import CrosshairOverlay from './CrosshairOverlay';
import { getBestScore, setBestScore } from './localScores';
import './FlickMode.css';

const DIFFICULTY = {
    Easy: 50,
    Medium: 30,
    Hard: 20,
};

const XP_GOAL = 20;

const FlickMode: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [duration, setDuration] = useState(60000);
    const [score, setScore] = useState(0);
    const [shots, setShots] = useState(0);
    const [best, setBest] = useState(0);
    const [target, setTarget] = useState({ x: 100, y: 100 });
    const [remaining, setRemaining] = useState(duration);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [scoreHistory, setScoreHistory] = useState<number[]>([]);
    const radius = DIFFICULTY[difficulty];
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const spawnTarget = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const padding = radius + 10;
        const x = Math.random() * (canvas.width - padding * 2) + padding;
        const y = Math.random() * (canvas.height - padding * 2) + padding;
        setTarget({ x, y });
    }, [radius]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - target.x;
        const dy = y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        setShots(prev => prev + 1);
        if (dist < radius) {
            setScore(prev => prev + 1);
            spawnTarget();
        }
    };
    const startGame = () => {
        const container = document.documentElement;
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
            (container as any).webkitRequestFullscreen();
        }

        setScore(0);
        setShots(0);
        setRemaining(duration);
        setGameOver(false);
        setGameStarted(true);
        setBest(getBestScore('flick'));
        spawnTarget();

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1000) {
                    clearInterval(intervalRef.current!);
                    setGameOver(true);
                    const newBest = Math.max(score, best);
                    setBestScore('flick', newBest);
                    setBest(newBest);
                    const prevHistory = JSON.parse(localStorage.getItem('flickHistory') || '[]');
                    const updated = [score, ...prevHistory].slice(0, 5);
                    localStorage.setItem('flickHistory', JSON.stringify(updated));
                    setScoreHistory(updated);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);
    };


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || gameOver || !gameStarted) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        const draw = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
            ctx.fill();
        };

        draw();
    }, [target, gameStarted, gameOver, radius, score]);

    const accuracy = shots > 0 ? ((score / shots) * 100).toFixed(1) : '0.0';
    const xpPercent = Math.min(100, (score / XP_GOAL) * 100);

    return (
        <div className="flick-fullscreen crosshair">
            {!gameStarted ? (
                <div className="flick-overlay">
                    <h1 className="glow-text">🎯 Flick Trainer</h1>
                    <div className="menu-buttons" style={{ maxWidth: '400px' }}>
                        <label>
                            Difficulty:
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </label>
                        <label>
                            Time:
                            <select value={duration} onChange={e => setDuration(+e.target.value)}>
                                <option value={30000}>30 seconds</option>
                                <option value={60000}>1 minute</option>
                                <option value={120000}>2 minutes</option>
                            </select>
                        </label>
                        <button onClick={startGame}>🚀 Start Training</button>
                    </div>
                </div>
            ) : !gameOver ? (
                <>
                    <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full block" />
                    <div className="info-panel">
                        <div>⏳ {remaining / 1000}s</div>
                        <div>🎯 {score}</div>
                        <div>📈 Accuracy: {accuracy}%</div>
                    </div>
                    <div className="xp-bar-wrapper">
                        <div className="xp-bar-fill" style={{ height: `${xpPercent}%` }}></div>
                    </div>
                </>
            ) : (
                <div className="flick-overlay">
                    <h1>🎯 Game Over</h1>
                    <p>Score: {score}</p>
                    <p>Best: {best}</p>
                    <p>Accuracy: {accuracy}%</p>
                    <h3>📊 Recent Scores:</h3>
                    <ul>
                        {scoreHistory.map((s, i) => (
                            <li key={i}>Run {i + 1}: {s}</li>
                        ))}
                    </ul>
                    <button onClick={() => setGameStarted(false)}>🔁 Try Again</button>
                </div>
            )}
        </div>
    );
};

export default FlickMode;
