'use client';

import { useState, useEffect } from 'react';

export default function RelaxFlow({ onComplete }) {
    const [pattern, setPattern] = useState([]);
    const [userPattern, setUserPattern] = useState([]);
    const [score, setScore] = useState(0);
    const [showing, setShowing] = useState(false);
    const [startTime] = useState(Date.now());

    const colors = ['red', 'blue', 'green', 'yellow'];

    useEffect(() => {
        if (pattern.length === 0) {
            nextRound();
        }
    }, []);

    useEffect(() => {
        if (score >= 100) {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            onComplete({ score, duration, focusScore: 0.94 });
        }
    }, [score]);

    const nextRound = () => {
        const newPattern = [...pattern, colors[Math.floor(Math.random() * 4)]];
        setPattern(newPattern);
        setUserPattern([]);
        showPattern(newPattern);
    };

    const showPattern = async (pat) => {
        setShowing(true);
        for (let color of pat) {
            await new Promise(resolve => setTimeout(resolve, 600));
            // Visual feedback would go here
        }
        setShowing(false);
    };

    const handleColorClick = (color) => {
        if (showing) return;

        const newUserPattern = [...userPattern, color];
        setUserPattern(newUserPattern);

        if (newUserPattern[newUserPattern.length - 1] !== pattern[newUserPattern.length - 1]) {
            setScore(0);
            setPattern([]);
            nextRound();
        } else if (newUserPattern.length === pattern.length) {
            setScore(s => s + 10);
            setTimeout(nextRound, 1000);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Relax Flow</h2>
                <p className="text-gray-600">Remember and repeat the pattern</p>
            </div>

            <div className="glass-apple p-8 rounded-2xl w-full max-w-lg">
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {colors.map(color => (
                        <button
                            key={color}
                            onClick={() => handleColorClick(color)}
                            disabled={showing}
                            className={`h-32 rounded-2xl font-bold text-white text-xl transition-all duration-200 shadow-sm ${showing ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                                }`}
                            style={{
                                backgroundColor:
                                    color === 'red' ? 'rgba(239, 68, 68, 0.8)' :
                                        color === 'blue' ? 'rgba(59, 130, 246, 0.8)' :
                                            color === 'green' ? 'rgba(16, 185, 129, 0.8)' :
                                                'rgba(245, 158, 11, 0.8)'
                            }}
                        >
                            {/* Empty for clean look, or icon */}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center px-4 bg-white/50 rounded-xl py-4 backdrop-blur-sm">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase">Score</span>
                        <span className="text-2xl font-bold text-gray-900">{score}</span>
                    </div>

                    {showing && (
                        <div className="flex items-center text-amber-600 font-medium animate-pulse">
                            <span className="mr-2">●</span> Watch...
                        </div>
                    )}

                    <div className="flex flex-col text-right">
                        <span className="text-xs text-gray-500 uppercase">Level</span>
                        <span className="text-2xl font-bold text-gray-900">{pattern.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
