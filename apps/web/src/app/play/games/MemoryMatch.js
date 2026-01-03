'use client'
import { useState, useEffect } from 'react'

const CARDS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🥝', '🍒']

export default function MemoryMatchGame({ onComplete }) {
    const [cards, setCards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [matched, setMatched] = useState([])
    const [moves, setMoves] = useState(0)
    const [startTime] = useState(Date.now())

    useEffect(() => {
        // Create pairs and shuffle
        const pairs = [...CARDS, ...CARDS]
        const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji, idx) => ({
            id: idx,
            emoji,
            isFlipped: false,
            isMatched: false
        }))
        setCards(shuffled)
    }, [])

    useEffect(() => {
        if (matched.length === CARDS.length * 2 && matched.length > 0) {
            const duration = (Date.now() - startTime) / 1000
            onComplete({
                score: Math.max(0, 100 - moves * 2),
                duration
            })
        }
    }, [matched, moves, startTime, onComplete])

    const handleCardClick = (id) => {
        if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) {
            return
        }

        const newFlipped = [...flipped, id]
        setFlipped(newFlipped)

        if (newFlipped.length === 2) {
            setMoves(moves + 1)
            const [first, second] = newFlipped
            if (cards[first].emoji === cards[second].emoji) {
                setMatched([...matched, first, second])
                setFlipped([])
            } else {
                setTimeout(() => setFlipped([]), 1000)
            }
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
            <h2 className="text-3xl font-bold mb-2 gradient-text">🧠 Memory Match</h2>
            <p className="text-text-muted mb-4 font-semibold">Moves: {moves}</p>

            <div className="grid grid-cols-4 gap-3 max-w-md">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-4xl cursor-pointer transition-all border-2 ${flipped.includes(card.id) || matched.includes(card.id)
                                ? 'bg-primary/20 border-primary shadow-md shadow-primary/20'
                                : 'bg-secondary/20 hover:bg-secondary/30 border-secondary hover:border-secondary hover:shadow-md'
                            }`}
                    >
                        {(flipped.includes(card.id) || matched.includes(card.id)) ? card.emoji : '?'}
                    </div>
                ))}
            </div>
        </div>
    )
}
