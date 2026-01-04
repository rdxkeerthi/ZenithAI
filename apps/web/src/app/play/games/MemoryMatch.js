'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const CARDS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🥝', '🍒']

export default function MemoryMatchGame({ onComplete }) {
    const [gameState, setGameState] = useState('intro')
    const [cards, setCards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [matched, setMatched] = useState([])
    const [moves, setMoves] = useState(0)
    const [startTime, setStartTime] = useState(null)

    const startGame = () => {
        const pairs = [...CARDS, ...CARDS]
        const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji, idx) => ({
            id: idx,
            emoji
        }))
        setCards(shuffled)
        setFlipped([])
        setMatched([])
        setMoves(0)
        setGameState('playing')
        setStartTime(Date.now())
    }

    useEffect(() => {
        if (gameState === 'playing' && matched.length === CARDS.length * 2 && matched.length > 0) {
            setGameState('complete')
            const duration = (Date.now() - startTime) / 1000
            // Score based on moves (perfect is 8 moves)
            // Penalty for extra moves
            const penalty = Math.max(0, (moves - 8) * 5)
            const score = Math.max(0, 100 - penalty)

            setTimeout(() => {
                onComplete({ score, duration })
            }, 1500)
        }
    }, [matched, gameState])

    const handleCardClick = (id) => {
        if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return

        const newFlipped = [...flipped, id]
        setFlipped(newFlipped)

        if (newFlipped.length === 2) {
            setMoves(m => m + 1)
            const [first, second] = newFlipped
            if (cards[first].emoji === cards[second].emoji) {
                setMatched(prev => [...prev, first, second])
                setFlipped([])
            } else {
                setTimeout(() => setFlipped([]), 1000)
            }
        }
    }

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6">
                <div className="text-6xl text-indigo-500">🧠</div>
                <h2 className="text-3xl font-bold text-slate-800">Memory Matrix</h2>
                <p className="text-slate-500 max-w-md">
                    Test your working memory. Find all matching pairs with as few moves as possible.
                </p>
                <Button onClick={startGame} size="lg" className="w-48">START</Button>
            </div>
        )
    }

    if (gameState === 'complete') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Memory Cleared</h2>
                <div className="text-4xl font-mono font-bold text-indigo-600">{moves} Moves</div>
                <p className="text-slate-500">Perfect recall requires 8 moves</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="mb-6 flex justify-between w-full max-w-md text-sm font-medium text-slate-400 uppercase tracking-wider">
                <span>Moves: {moves}</span>
                <span>Matches: {matched.length / 2}/{CARDS.length}</span>
            </div>

            <div className="grid grid-cols-4 gap-3 max-w-md w-full">
                {cards.map((card) => {
                    const isFlipped = flipped.includes(card.id) || matched.includes(card.id)
                    const isMatched = matched.includes(card.id)

                    return (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className={cn(
                                "aspect-square rounded-xl flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 transform preserve-3d",
                                isFlipped ? "bg-white border-2 border-indigo-200 shadow-lg rotate-y-180" : "bg-slate-100 border-2 border-slate-200 hover:bg-slate-200",
                                isMatched && "bg-emerald-50 border-emerald-200 shadow-none opacity-50"
                            )}
                        >
                            <span className={cn("transition-opacity duration-200", isFlipped ? "opacity-100" : "opacity-0")}>
                                {card.emoji}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
