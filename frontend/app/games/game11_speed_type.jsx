'use client';

import { useState, useEffect, useRef } from 'react';

export default function SpeedType({ onComplete }) {
    const [words, setWords] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [isActive, setIsActive] = useState(false);
    const inputRef = useRef(null);

    const WORD_LIST = [
        'calm', 'peace', 'breath', 'relax', 'focus', 'gentle', 'cloud', 'river',
        'ocean', 'forest', 'breeze', 'quiet', 'still', 'soft', 'light', 'warm',
        'create', 'grow', 'bloom', 'shine', 'dream', 'smile', 'happy', 'joy'
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
        // Generate random word list
        const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
        setWords(shuffled);
        setCurrentWordIndex(0);
        setInputValue('');
        setScore(0);
        setTimeLeft(45);
        setIsActive(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const endGame = () => {
        setIsActive(false);
        onComplete({
            score: score * 10,
            duration: 45,
            errorRate: 0,
            focusScore: 90
        });
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setInputValue(val);

        if (val.trim().toLowerCase() === words[currentWordIndex]) {
            // Word completed
            setScore(prev => prev + 1);
            setInputValue('');
            setCurrentWordIndex(prev => (prev + 1) % words.length);
        }
    };

    if (!isActive) {
        return (
            <div className="text-center p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Calming Words</h3>
                <p className="mb-6 text-gray-600">
                    Type the words shown on the screen.
                    Focus on accuracy and rhythm, not just speed.
                </p>
                <button
                    onClick={startGame}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors"
                >
                    Start Typing
                </button>
            </div>
        );
    }

    return (
        <div className="text-center p-8 max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-12">
                <div className="text-lg font-semibold text-gray-700">Score: {score}</div>
                <div className="text-xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
                    {timeLeft}s
                </div>
            </div>

            <div className="mb-12">
                <div className="text-4xl font-bold text-gray-800 mb-2">
                    {words[currentWordIndex]}
                </div>
                {/* Next word preview */}
                <div className="text-sm text-gray-400">
                    next: {words[(currentWordIndex + 1) % words.length]}
                </div>
            </div>

            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInput}
                className="w-full text-center text-2xl p-4 border-2 border-indigo-100 rounded-xl focus:border-indigo-500 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-300"
                placeholder="type here..."
                autoFocus
                autoComplete="off"
            />
        </div>
    );
}
