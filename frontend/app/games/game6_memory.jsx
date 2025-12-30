'use client';

import { useState, useEffect } from 'react';

const CARDS = ['🌟', '🌈', '🌸', '🦋', '🌺', '🍀', '🌙', '☀️'];

export default function MemoryMatch({ onComplete }) {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const shuffled = [...CARDS, ...CARDS]
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({ id: index, value: card }));
        setCards(shuffled);
    }, []);

    useEffect(() => {
        if (flipped.length === 2) {
            const [first, second] = flipped;
            if (cards[first].value === cards[second].value) {
                setMatched([...matched, first, second]);
            }
            setTimeout(() => setFlipped([]), 1000);
        }
    }, [flipped]);

    useEffect(() => {
        if (matched.length === cards.length && cards.length > 0) {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            const score = Math.max(0, 100 - moves * 2);
            onComplete({ score, duration, errorRate: moves / 16 });
        }
    }, [matched]);

    const handleClick = (index) => {
        if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(index)) {
            setFlipped([...flipped, index]);
            if (flipped.length === 1) setMoves(m => m + 1);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Memory Match</h2>
                <p className="text-gray-600">Find matching pairs to clear the board</p>
            </div>

            <div className="glass-apple p-8 rounded-2xl">
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {cards.map((card, index) => (
                        <button
                            key={index}
                            onClick={() => handleClick(index)}
                            className={`w-20 h-20 text-4xl rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm ${flipped.includes(index) || matched.includes(index)
                                    ? 'bg-white/80 text-gray-900 transform rotate-y-180'
                                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-transparent'
                                }`}
                        >
                            {flipped.includes(index) || matched.includes(index) ? card.value : '?'}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center text-gray-900 font-medium px-4">
                    <div>Moves: <span className="font-bold">{moves}</span></div>
                    <div>Matched: <span className="font-bold">{matched.length / 2}</span>/8</div>
                </div>
            </div>
        </div>
    );
}
