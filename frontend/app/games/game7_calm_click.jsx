'use client';

import { useState, useEffect } from 'react';

export default function CalmClick({ onComplete }) {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            if (bubbles.length < 10) {
                setBubbles(prev => [...prev, {
                    id: Date.now(),
                    x: Math.random() * 90,
                    y: Math.random() * 90,
                    size: Math.random() * 40 + 40
                }]);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [bubbles]);

    useEffect(() => {
        if (score >= 100) {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            onComplete({ score, duration, focusScore: 0.92 });
        }
    }, [score]);

    const popBubble = (id) => {
        setBubbles(bubbles.filter(b => b.id !== id));
        setScore(s => s + 10);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Calm Click</h2>
                <p className="text-gray-600">Pop the bubbles to relax</p>
            </div>

            <div className="glass-apple p-8 rounded-2xl w-full max-w-2xl">
                <div className="relative w-full h-96 bg-gradient-to-b from-blue-50/50 to-purple-50/50 rounded-xl overflow-hidden border border-white/20 shadow-inner">
                    {bubbles.map(bubble => (
                        <button
                            key={bubble.id}
                            onClick={() => popBubble(bubble.id)}
                            className="absolute rounded-full bg-blue-400/20 backdrop-blur-sm border border-white/50 hover:bg-blue-400/40 transition-all duration-300 animate-float"
                            style={{
                                left: `${bubble.x}%`,
                                top: `${bubble.y}%`,
                                width: `${bubble.size}px`,
                                height: `${bubble.size}px`
                            }}
                        />
                    ))}
                </div>

                <div className="mt-6 flex justify-center">
                    <div className="bg-white/50 px-6 py-3 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-gray-500 mr-2">Score</span>
                        <span className="text-2xl font-bold text-gray-900">{score}</span>
                        <span className="text-gray-400 text-sm ml-1">/ 100</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
