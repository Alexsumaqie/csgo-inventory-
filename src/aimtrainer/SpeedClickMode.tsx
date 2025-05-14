import React, { useEffect, useRef, useState } from 'react';
import './SpeedClickMode.css';

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  id: number;
};

const TargetRushMode: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [remaining, setRemaining] = useState(30000);
  const [gameOver, setGameOver] = useState(false);
  const ballId = useRef(0);

  const spawnBall = () => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver || ballsRef.current.length >= 12) return;

    const radius = 18 + Math.random() * 10;
    const margin = 100;
    const x = Math.random() * (canvas.width - margin * 2) + margin;
    const y = Math.random() * (canvas.height - margin * 2) + margin;

    const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const speed = 2 + Math.random() * 1.5;
    const angle = direction === 'horizontal' ? 0 : Math.PI / 2;

    const ball: Ball = {
      x,
      y,
      vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
      vy: Math.sin(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
      radius,
      id: ballId.current++,
    };

    ballsRef.current.push(ball);
    setBalls([...ballsRef.current]);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hit = false;
    ballsRef.current = ballsRef.current.filter((ball) => {
      const dx = clickX - ball.x;
      const dy = clickY - ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ball.radius) {
        hit = true;
        return false;
      }
      return true;
    });

    if (hit) setScore((prev) => prev + 1);
    setShots((prev) => prev + 1);
    setBalls([...ballsRef.current]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const spawnInterval = setInterval(() => {
      spawnBall();
    }, 600);

    const logicInterval = setInterval(() => {
      ballsRef.current = ballsRef.current
        .map((ball) => ({
          ...ball,
          x: ball.x + ball.vx,
          y: ball.y + ball.vy,
        }))
        .filter(
          (ball) =>
            ball.x > -ball.radius &&
            ball.x < canvas.width + ball.radius &&
            ball.y > -ball.radius &&
            ball.y < canvas.height + ball.radius
        );
      setBalls([...ballsRef.current]);
    }, 16);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ballsRef.current.forEach((ball) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.fill();
      });
      if (!gameOver) requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    const countdown = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(spawnInterval);
          clearInterval(logicInterval);
          clearInterval(countdown);
          setGameOver(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(logicInterval);
      clearInterval(countdown);
    };
  }, [gameOver]);

  const accuracy = shots > 0 ? ((score / shots) * 100).toFixed(1) : '0.0';

  return (
    <div className="rush-container">
      <canvas ref={canvasRef} onClick={handleClick} />
      {!gameOver ? (
        <div className="info-panel">
          <div>⏳ {remaining / 1000}s</div>
          <div>💥 {score}</div>
          <div>🌟 {accuracy}%</div>
        </div>
      ) : (
        <div className="rush-overlay">
          <h1>🌟 Game Over</h1>
          <p>Score: {score}</p>
          <p>Accuracy: {accuracy}%</p>
          <button onClick={() => window.location.reload()}>🔁 Retry</button>
        </div>
      )}
    </div>
  );
};

export default TargetRushMode;