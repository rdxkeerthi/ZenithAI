'use client'
import { useState, useEffect } from 'react'

export default function WhackAMoleGame({ onComplete }) {
    const [activeMole, setActiveMole] = useState(null)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [startTime] = useState(Date.now())

    useEffect(() => {
        const moleInterval = setInterval(() => {
            setActiveMole(Math.floor(Math.random() * 9))
        }, 800)

        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(moleInterval)
                    clearInterval(timerInterval)
                    const duration = (Date.now() - startTime) / 1000
                    onComplete({ score, duration })
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            clearInterval(moleInterval)
            clearInterval(timerInterval)
        }
    }, [score, startTime, onComplete])

    const handleHit = (index) => {
        if (index === activeMole) {
            setScore(score + 10)
            setActiveMole(null)
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
            <h2 className="text-3xl font-bold mb-2 gradient-text">🔨 Whack-a-Mole</h2>
            <p className="text-text-muted mb-4 font-semibold">Score: {score} | Time: {timeLeft}s</p>

            <div className="grid grid-cols-3 gap-4 max-w-md">
                {Array.from({ length: 9 }).map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleHit(idx)}
                        className={`aspect-square rounded-full flex items-center justify-center text-5xl cursor-pointer transition-all border-2 ${idx === activeMole
                                ? 'bg-warning/30 border-warning animate-pulse shadow-lg shadow-warning/40'
                                : 'bg-secondary/20 border-secondary/40 hover:border-secondary'
                            }`}
                    >
                        {idx === activeMole && '🐹'}
                    </div>
                ))}
            </div>
        </div>
    )
}
