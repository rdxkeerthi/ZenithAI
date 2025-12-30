'use client';

import { useState, useEffect } from 'react';

export default function ColorMatch({ onComplete }) {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);

    // Game state
    const [targetColorName, setTargetColorName] = useState('');
    const [targetColorValue, setTargetColorValue] = useState('');
    const [options, setOptions] = useState([]);
    const [message, setMessage] = useState('');

    const COLORS = [
        { name: 'RED', value: '#ef4444' },
        { name: 'BLUE', value: '#3b82f6' },
        { name: 'GREEN', value: '#22c55e' },
        { name: 'YELLOW', value: '#eab308' },
        { name: 'PURPLE', value: '#a855f7' },
        { name: 'ORANGE', value: '#f97316' },
    ];

    useEffect(() => {
        let timer;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            endGame();
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setIsActive(true);
        generateRound();
        setMessage('');
    };

    const endGame = () => {
        setIsActive(false);
        onComplete({
            score: score * 10, // Scale score
            duration: 30,
            errorRate: 0,
            focusScore: Math.min(score * 5, 100)
        });
    };

    const generateRound = () => {
        // Pick a color name
        const nameIdx = Math.floor(Math.random() * COLORS.length);
        const name = COLORS[nameIdx].name;

        // Pick a color value (sometimes matches name, sometimes different)
        // For "Stroop Effect" game, we want the USER to match the TEXT MEANING, not ink color?
        // Let's make it simple: "Select the color that matches the WORD"

        // Actually, let's do simple matching: "Select the box that is [COLOR_NAME]"
        setTargetColorName(name);

        // Generate options
        const shuffled = [...COLORS].sort(() => 0.5 - Math.random()).slice(0, 3);

        // Ensure the correct answer is in options
        if (!shuffled.find(c => c.name === name)) {
            shuffled[0] = COLORS[nameIdx];
        }

        setOptions(shuffled.sort(() => 0.5 - Math.random()));
    };

    const handleOptionClick = (color) => {
        if (!isActive) return;

        if (color.name === targetColorName) {
            setScore(prev => prev + 1);
            setMessage('Correct!');
            setTimeout(() => setMessage(''), 500);
            generateRound();
        } else {
            setMessage('Try Again');
        }
    };

    if (!isActive) {
        return (
            <div className="text-center p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Color Match</h3>
                <p className="mb-6 text-gray-600">
                    Click the color that matches the word shown.
                    Focus on accuracy and speed.
                </p>
                <button
                    onClick={startGame}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="text-center p-4">
            <div className="flex justify-between items-center mb-8">
                <div className="text-lg font-semibold text-gray-700">Score: {score}</div>
                <div className="text-xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
                    {timeLeft}s
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-xl mb-4 text-gray-500">Find the color:</h2>
                <div className="text-5xl font-black mb-8 tracking-wider" style={{ color: '#1d1d1f' }}>
                    {targetColorName}
                </div>
            </div>

            <div className="flex justify-center gap-6">
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="w-24 h-24 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:scale-105 border border-gray-100"
                        style={{ backgroundColor: option.value }}
                        aria-label={option.name}
                    />
                ))}
            </div>

            <div className="h-8 mt-8 text-blue-600 font-semibold">
                {message}
            </div>
        </div>
    );
}
