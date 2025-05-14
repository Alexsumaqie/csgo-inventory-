import React, { useEffect, useRef, useState } from 'react';
import CrosshairOverlay from './CrosshairOverlay';
import { getBestScore, setBestScore } from './localScores';
import './TrackingMode.css';

const TrackingMode: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [target, setTarget] = useState({ x: 100, y: 100, dx: 3, dy: 2 });
    const [hitTime, setHitTime] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [best, setBest] = useState(0);
    const [xp, setXP] = useState(0);
    const [level, setLevel] = useState(1);
    const [particles, setParticles] = useState<{ x: number; y: number; alpha: number }[]>([]);
    const [countdown, setCountdown] = useState(3);
    const [floatingTexts, setFloatingTexts] = useState<{ x: number; y: number; text: string; alpha: number }[]>([]);
    const [powerup, setPowerup] = useState<{ x: number; y: number } | null>(null);
    const [obstacleX, setObstacleX] = useState(200);
    const [freezeUntil, setFreezeUntil] = useState(0);
    const obstacleDirectionRef = useRef(1);
    const duration = 30000;
    const radius = 30;
    const headerHeight = 60;
    const HIT_BUFFER = 6;

    const restart = () => {
        setTarget({ x: 100, y: 100, dx: 3, dy: 2 });
        setHitTime(0);
        setGameOver(false);
        setCountdown(3);
        setPowerup(null);
        setFloatingTexts([]);
        setParticles([]);
        setFreezeUntil(0);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (countdown > 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        setBest(getBestScore('tracking'));
        let animationFrame: number;
        let lastTime = performance.now();
        let speedIncreaseTimer = 0;
        let powerupTimer = 0;


        const drawParticles = () => {
            setParticles(prev => prev.map(p => ({ ...p, alpha: p.alpha - 0.02 })).filter(p => p.alpha > 0));
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = 'cyan';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        };

        const drawFloatingTexts = () => {
            setFloatingTexts(prev =>
                prev.map(t => ({ ...t, y: t.y - 0.5, alpha: t.alpha - 0.01 })).filter(t => t.alpha > 0)
            );
            floatingTexts.forEach(t => {
                ctx.save();
                ctx.globalAlpha = t.alpha;
                ctx.fillStyle = 'lime';
                ctx.font = 'bold 16px monospace';
                ctx.fillText(t.text, t.x, t.y);
                ctx.restore();
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw obstacle
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(obstacleX, canvas.height / 3, 20, canvas.height / 3);

            // Draw target
            ctx.save();
            ctx.translate(target.x, target.y);
            ctx.rotate(performance.now() / 500);
            ctx.fillStyle = 'orange';
            ctx.shadowColor = 'gold';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Draw powerup
            if (powerup) {
                ctx.fillStyle = 'deepskyblue';
                ctx.beginPath();
                ctx.arc(powerup.x, powerup.y, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.stroke();
            }

            // HUD
            const timeLeft = duration - hitTime;
            ctx.fillStyle = '#444';
            ctx.fillRect(20, 20, 300, 10);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(20, 20, (timeLeft / duration) * 300, 10);
            ctx.fillStyle = 'white';
            ctx.font = '16px monospace';
            ctx.fillText(`Time: ${(hitTime / 1000).toFixed(1)}s`, 20, 50);
            ctx.fillText(`Best: ${(best / 1000).toFixed(1)}s`, 20, 70);
            ctx.fillText(`XP: ${xp} | Level: ${level}`, 20, 90);

            drawParticles();
            drawFloatingTexts();

            animationFrame = requestAnimationFrame(tick);
        };

        const update = (delta: number) => {
            const now = performance.now();
            const isFrozen = now < freezeUntil;
            const speedFactor = isFrozen ? 0.2 : 1;

            setTarget(prev => {
                let { x, y, dx, dy } = prev;
                x += dx * speedFactor;
                y += dy * speedFactor;

                if (x < radius || x > canvas.width - radius) dx = -dx;
                if (y < radius + headerHeight || y > canvas.height - radius) dy = -dy;

                // Bounce off obstacle
                if (x + radius > obstacleX && x - radius < obstacleX + 20 &&
                    y > canvas.height / 3 && y < (2 * canvas.height) / 3) {
                    dx = -dx;
                }

                return { x, y, dx, dy };
            });

            // Move obstacle
            setObstacleX(prev => {
                let next = prev + obstacleDirectionRef.current * 2;
                if (next < 0 || next > canvas.width - 20) {
                    obstacleDirectionRef.current *= -1;
                    next = prev + obstacleDirectionRef.current * 2; // reflect immediately
                }
                return next;
            });


            // Spawn powerup
            powerupTimer += delta;
            if (powerupTimer > 10000 && !powerup) {
                setPowerup({
                    x: Math.random() * (canvas.width - 60) + 30,
                    y: Math.random() * (canvas.height - 60) + 30
                });
                powerupTimer = 0;
            }
        };

        const tick = (time: number) => {
            const delta = time - lastTime;
            lastTime = time;
            update(delta);
            draw();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const dx = mouseX - target.x;
            const dy = mouseY - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Hit detection
            if (dist < radius + HIT_BUFFER) {
                setHitTime(prev => prev + 16);
                setParticles(prev => [...prev, { x: mouseX, y: mouseY, alpha: 1 }]);
                setFloatingTexts(prev => [...prev, { x: mouseX, y: mouseY, text: '+1', alpha: 1 }]);
                setXP(prev => {
                    const newXP = prev + 1;
                    if (newXP >= level * 100) {
                        setLevel(level + 1);
                        return 0;
                    }
                    return newXP;
                });
            }

            // Powerup detection
            if (powerup) {
                const dxP = mouseX - powerup.x;
                const dyP = mouseY - powerup.y;
                if (Math.sqrt(dxP * dxP + dyP * dyP) < 20) {
                    setFreezeUntil(performance.now() + 3000);
                    setFloatingTexts(prev => [...prev, { x: mouseX, y: mouseY, text: '🧊 Freeze!', alpha: 1 }]);
                    setPowerup(null);
                }
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        animationFrame = requestAnimationFrame(tick);

        const timer = setTimeout(() => {
            setGameOver(true);
            canvas.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
            if (hitTime > getBestScore('tracking')) {
                setBestScore('tracking', hitTime);
            }
            setBest(getBestScore('tracking'));
        }, duration);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
            clearTimeout(timer);
        };
    }, [countdown, target]);

    const accuracy = Math.floor((hitTime / duration) * 100);

    return (
        <div className="tracking-container">
            <canvas ref={canvasRef} className="tracking-canvas" />
            {countdown > 0 && (
                <div className="tracking-overlay">
                    <h1>Get Ready</h1>
                    <p>{countdown}</p>
                </div>
            )}
            {gameOver && (
                <div className="tracking-overlay zoom-in">
                    <h1>🎯 Tracking Complete</h1>
                    <p>Time on Target: {(hitTime / 1000).toFixed(1)}s</p>
                    <p>Accuracy: {accuracy}%</p>
                    <p>Best: {(best / 1000).toFixed(1)}s</p>
                    <p>Level: {level}</p>
                    <button className="retry-button" onClick={restart}>Retry</button>
                </div>
            )}
        </div>
    );
};

export default TrackingMode;
