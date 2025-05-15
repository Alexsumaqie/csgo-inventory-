import React, { useEffect, useState } from 'react';
import './Trivia.css';
import { useAchievements } from '../pages/Achievements'; // path to your Achievements.tsx

interface Question {
    question: string;
    options: string[];
    answer: string;
}

export default function Trivia() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [mode, setMode] = useState<'easy' | 'medium' | 'hard' | null>(null);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'win' | 'lose'>('idle');
    const [showAnswer, setShowAnswer] = useState(false);

    const questionCount = mode === 'easy' ? 5 : mode === 'medium' ? 10 : 20;
    const [inputLocked, setInputLocked] = useState(false);

    useEffect(() => {
        fetch('/csgo_quiz_questions.json')
            .then((res) => res.json())
            .then((data) => setQuestions(data.sort(() => 0.5 - Math.random())));
    }, []);

    const handleModeSelect = (m: typeof mode) => {
        setMode(m);
        setCurrent(0);
        setStatus('idle');
        setSelected(null);
        setShowAnswer(false);

        // re-randomize question order so it's not the same
        setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
    };


    const handleAnswer = (option: string) => {
        if (showAnswer || status !== 'idle' || inputLocked) return;
        setInputLocked(true);


        setSelected(option);
        setShowAnswer(true);
const { increment } = useAchievements();
        const correct = questions[current].answer;
        if (option !== correct) {
            increment('trivia_5');
            setTimeout(() => setInputLocked(false), 1200);
            setStatus('lose');
        } else if (current + 1 === questionCount) {
            setTimeout(() => setInputLocked(false), 1200);
            setStatus('win');
        } else {
            setTimeout(() => {
                setCurrent((c) => c + 1);
                setSelected(null);
                setShowAnswer(false);
                setInputLocked(false); 
            }, 1200);
        }

    };

    if (!mode) {
        return (
            <div className="trivia-wrapper">
                <h2>🎯 Choose Difficulty</h2>
                <div className="mode-buttons">
                    <button onClick={() => handleModeSelect('easy')}>🟢 Easy (5)</button>
                    <button onClick={() => handleModeSelect('medium')}>🟡 Medium (10)</button>
                    <button onClick={() => handleModeSelect('hard')}>🔴 Hard (20)</button>
                </div>
            </div>
        );
    }

    if (status === 'win' || status === 'lose') {
        return (
            <div className="trivia-wrapper">
                <h2>{status === 'win' ? '🏆 You Win!' : '💀 You Lost'}</h2>
                <p>{status === 'win' ? 'Perfect run!' : `You made it to ${current}/${questionCount}`}</p>
                <button onClick={() => setMode(null)}>↩ Retry</button>
            </div>
        );
    }

    const q = questions[current];

    const progress = ((current + (showAnswer ? 1 : 0)) / questionCount) * 100;

    return (
        <div className="trivia-wrapper fade-in">
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }} />
            </div>
            <p className="tracker">Question {current + 1} / {questionCount}</p>

            <div className="question-card bounce">
                <p className="question">{q.question}</p>
                <div className="options">
                    {q.options.map((opt) => (
                        <button
                            key={opt}
                            className={`option-btn ${showAnswer
                                ? opt === q.answer
                                    ? 'correct'
                                    : opt === selected
                                        ? 'wrong'
                                        : ''
                                : ''
                                }`}
                            onClick={() => handleAnswer(opt)}
                            disabled={showAnswer}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
