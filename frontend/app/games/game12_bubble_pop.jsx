'use client';

import { useState, useEffect } from 'react';

export default function BubblePop({ onComplete }) {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let timer;
        let spawner;

        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);

            spawner = setInterval(addBubble, 800);
        } else if (timeLeft === 0 && isActive) {
            endGame();
        }

        return () => {
            clearInterval(timer);
            clearInterval(spawner);
        };
    }, [isActive, timeLeft]);

    const startGame = () => {
        setBubbles([]);
        setScore(0);
        setTimeLeft(30);
        setIsActive(true);
    };

    const endGame = () => {
        setIsActive(false);
        onComplete({
            score: score * 5,
            duration: 30,
            errorRate: 0,
            focusScore: 60
        });
    };

    const addBubble = () => {
        const id = Date.now();
        const size = Math.random() * 40 + 40; // 40-80px
        const left = Math.random() * 80 + 10; // 10-90%
        const color = ['#60a5fa', '#a78bfa', '#34d399', '#f472b6'][Math.floor(Math.random() * 4)];

        setBubbles(prev => [...prev, { id, size, left, color }]);

        // Remove bubble after 3s if not clicked
        setTimeout(() => {
            setBubbles(prev => prev.filter(b => b.id !== id));
        }, 3000);
    };

    const popBubble = (id) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        setScore(prev => prev + 1);
    };

    if (!isActive) {
        return (
            <div className="text-center p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Bubble Pop</h3>
                <p className="mb-6 text-gray-600">
                    Pop as many bubbles as you can before time runs out.
                    Simple and satisfying.
                </p>
                <button
                    onClick={startGame}
                    className="bg-pink-500 text-white px-8 py-3 rounded-full hover:bg-pink-600 transition-colors"
                >
                    Start Popping
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-96 overflow-hidden bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100">
            <div className="absolute top-4 left-0 right-0 flex justify-between px-6 z-10">
                <div className="text-lg font-semibold text-gray-700">Bubbles: {score}</div>
                <div className="text-xl font-mono font-bold text-gray-900 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                    {timeLeft}s
                </div>
            </div>

            {bubbles.map(bubble => (
                <button
                    key={bubble.id}
                    onClick={() => popBubble(bubble.id)}
                    className="absolute rounded-full shadow-lg border-2 border-white/50 animate-float"
                    style={{
                        width: bubble.size,
                        height: bubble.size,
                        left: `${bubble.left}%`,
                        backgroundColor: bubble.color,
                        bottom: '-20px', // Start below
                        animation: 'floatUp 4s linear forwards',
                        cursor: 'pointer'
                    }}
                />
            ))}

            <style jsx>{`
                @keyframes floatUp {
                    0% { bottom: -100px; transform: translateX(0); }
                    33% { transform: translateX(10px); }
                    66% { transform: translateX(-10px); }
                    100% { bottom: 120%; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
