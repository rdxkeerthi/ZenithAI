'use client';

import { useState, useEffect } from 'react';

export default function ReactionTest({ onComplete }) {
    const [waiting, setWaiting] = useState(true);
    const [reactionTimes, setReactionTimes] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [gameStartTime] = useState(Date.now());

    useEffect(() => {
        if (waiting) {
            const delay = Math.random() * 3000 + 1000;
            const timer = setTimeout(() => {
                setWaiting(false);
                setStartTime(Date.now());
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [waiting, reactionTimes.length]);

    useEffect(() => {
        if (reactionTimes.length >= 5) {
            const avgReaction = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
            const score = Math.max(0, 100 - avgReaction / 10);
            const duration = Math.floor((Date.now() - gameStartTime) / 1000);
            onComplete({ score: Math.floor(score), duration, reactionTime: avgReaction / 1000 });
        }
    }, [reactionTimes]);

    const handleClick = () => {
        if (!waiting && startTime) {
            const reactionTime = Date.now() - startTime;
            setReactionTimes([...reactionTimes, reactionTime]);
            setWaiting(true);
            setStartTime(null);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Reaction Test</h2>
                <p className="text-gray-600">Click as fast as you can when the color changes!</p>
            </div>

            <div className="glass-apple p-12 rounded-2xl flex flex-col items-center">
                <button
                    onClick={handleClick}
                    className={`w-64 h-64 rounded-full text-white text-2xl font-bold transition-all duration-200 transform shadow-lg flex items-center justify-center ${waiting
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600 scale-105 animate-pulse'
                        }`}
                >
                    {waiting ? 'Wait...' : 'CLICK!'}
                </button>

                <div className="mt-8 grid grid-cols-2 gap-8 text-center p-4 bg-white/50 rounded-xl w-full">
                    <div>
                        <div className="text-sm text-gray-500">Round</div>
                        <div className="text-xl font-bold text-gray-900">{reactionTimes.length + 1} / 5</div>
                    </div>
                    {reactionTimes.length > 0 && (
                        <div>
                            <div className="text-sm text-gray-500">Last Time</div>
                            <div className="text-xl font-bold text-gray-900">{reactionTimes[reactionTimes.length - 1]}ms</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
