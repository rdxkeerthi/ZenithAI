'use client'
import { useState, useEffect } from 'react'

const PATTERNS = [
    [1, 2, 3],
    [0, 1, 2, 3],
    [2, 3, 6, 7],
    [0, 4, 8],
    [1, 5, 9, 13]
]

export default function PatternRecognitionGame({ onComplete }) {
    const [pattern, setPattern] = useState([])
    const [userPattern, setUserPattern] = useState([])
    const [showPattern, setShowPattern] = useState(true)
    const [round, setRound] = useState(0)
    const [score, setScore] = useState(0)
    const [startTime] = useState(Date.now())
    const totalRounds = 5

    useEffect(() => {
        showNewPattern()
    }, [])

    const showNewPattern = () => {
        const newPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
        setPattern(newPattern)
        setUserPattern([])
        setShowPattern(true)
        setTimeout(() => setShowPattern(false), 2000)
    }

    const handleCellClick = (index) => {
        if (showPattern) return

        const newUserPattern = [...userPattern, index]
        setUserPattern(newUserPattern)

        // Check if pattern matches
        if (newUserPattern.length === pattern.length) {
            const isCorrect = newUserPattern.every((val, idx) => val === pattern[idx])
            if (isCorrect) {
                setScore(score + 20)
            }

            if (round < totalRounds - 1) {
                setRound(round + 1)
                setTimeout(showNewPattern, 1000)
            } else {
                const duration = (Date.now() - startTime) / 1000
                onComplete({ score: score + (isCorrect ? 20 : 0), duration })
            }
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
            <h2 className="text-3xl font-bold mb-2 gradient-text">🔷 Pattern Recognition</h2>
            <p className="text-text-muted mb-4 font-semibold">Round {round + 1} of {totalRounds} | Score: {score}</p>

            {showPattern && (
                <p className="text-lg mb-4 text-warning font-bold">Memorize the pattern!</p>
            )}

            <div className="grid grid-cols-4 gap-2 max-w-sm">
                {Array.from({ length: 16 }).map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleCellClick(idx)}
                        className={`aspect-square rounded-xl cursor-pointer transition-all border-2 ${(showPattern && pattern.includes(idx)) || userPattern.includes(idx)
                                ? 'bg-primary/30 border-primary animate-glow shadow-lg shadow-primary/30'
                                : 'bg-secondary/20 hover:bg-secondary/30 border-secondary hover:border-primary'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
