'use client';

import { useState, useEffect } from 'react';

export default function PatternMemory({ onComplete }) {
    const [level, setLevel] = useState(1);
    const [grid, setGrid] = useState(Array(9).fill(false)); // 3x3 grid
    const [pattern, setPattern] = useState([]);
    const [userPattern, setUserPattern] = useState([]);
    const [gameState, setGameState] = useState('IDLE'); // IDLE, SHOWING, PLAYING, FAILED
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (gameState === 'SHOWING') {
            showPattern();
        }
    }, [gameState, level]);

    const startGame = () => {
        setLevel(1);
        setPattern([]);
        setGameState('SHOWING');
        setMessage('Watch the pattern...');
    };

    const showPattern = async () => {
        // Generate new step
        const newStep = Math.floor(Math.random() * 9);
        const newPattern = [...pattern, newStep];
        setPattern(newPattern);
        setUserPattern([]);

        // Display pattern sequence
        for (let i = 0; i < newPattern.length; i++) {
            await new Promise(r => setTimeout(r, 500)); // Wait before highlighting
            highlightCell(newPattern[i]);
            await new Promise(r => setTimeout(r, 500)); // Highlight duration
        }

        setGameState('PLAYING');
        setMessage('Your turn!');
    };

    const highlightCell = (index) => {
        const newGrid = Array(9).fill(false);
        newGrid[index] = true;
        setGrid(newGrid);
        setTimeout(() => setGrid(Array(9).fill(false)), 300);
    };

    const handleCellClick = (index) => {
        if (gameState !== 'PLAYING') return;

        // Flash clicked cell
        highlightCell(index);

        const expectedIndex = pattern[userPattern.length];

        if (index === expectedIndex) {
            const newUserPattern = [...userPattern, index];
            setUserPattern(newUserPattern);

            if (newUserPattern.length === pattern.length) {
                // Round complete
                setMessage('Correct!');
                setGameState('WAITING');
                setTimeout(() => {
                    setLevel(l => l + 1);
                    setGameState('SHOWING');
                }, 1000);
            }
        } else {
            // Wrong move
            setGameState('FAILED');
            setMessage('Game Over!');
            setTimeout(() => {
                onComplete({
                    score: (level - 1) * 100,
                    duration: level * 5,
                    errorRate: 0,
                    focusScore: 80
                });
            }, 1000);
        }
    };

    if (gameState === 'IDLE') {
        return (
            <div className="text-center p-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Pattern Memory</h3>
                <p className="mb-6 text-gray-600">
                    Watch the pattern light up, then repeat it.
                    The pattern gets longer each round.
                </p>
                <button
                    onClick={startGame}
                    className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors"
                >
                    Start Game
                </button>
            </div>
        );
    }

    return (
        <div className="text-center p-4">
            <div className="flex justify-between items-center mb-8 max-w-sm mx-auto">
                <div className="text-lg font-semibold text-gray-700">Level: {level}</div>
                <div className="text-lg text-blue-600 font-medium">{message}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-8">
                {grid.map((active, index) => (
                    <button
                        key={index}
                        onClick={() => handleCellClick(index)}
                        disabled={gameState !== 'PLAYING'}
                        className={`w-20 h-20 rounded-xl transition-all duration-200 ${active
                                ? 'bg-blue-500 shadow-lg scale-95'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                    />
                ))}
            </div>

            {gameState === 'FAILED' && (
                <button
                    onClick={startGame}
                    className="bg-gray-800 text-white px-6 py-2 rounded-lg"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
