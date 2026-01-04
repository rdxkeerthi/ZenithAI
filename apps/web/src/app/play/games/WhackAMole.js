'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function WhackAMoleGame({ onComplete }) {
    const [gameState, setGameState] = useState('intro') // intro, playing, complete
    const [activeMole, setActiveMole] = useState(null)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [startTime, setStartTime] = useState(Date.now())

    const startGame = () => {
        setGameState('playing')
        setScore(0)
        setTimeLeft(30)
    }

    useEffect(() => {
        if (gameState !== 'playing') return

        const moleInterval = setInterval(() => {
            setActiveMole(Math.floor(Math.random() * 9))
        }, 800)

        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(moleInterval)
                    clearInterval(timerInterval)
                    finishGame()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            clearInterval(moleInterval)
            clearInterval(timerInterval)
        }
    }, [gameState])

    const handleHit = (index) => {
        if (gameState !== 'playing') return
        if (index === activeMole) {
            setScore(score + 10)
            setActiveMole(null)
        }
    }

    const finishGame = () => {
        setGameState('complete')
        const duration = 30
        onComplete({ score: Math.min(100, Math.floor((score / 300) * 100)), duration })
    }

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6">
                <div className="text-6xl text-indigo-500">🔨</div>
                <h2 className="text-3xl font-bold text-slate-800">Target Response</h2>
                <p className="text-slate-500 max-w-md">
                    Test your reflexes. Tap the active targets as quickly as they appear. Precision counts.
                </p>
                <Button onClick={startGame} size="lg" className="w-48">START</Button>
            </div>
        )
    }

    if (gameState === 'complete') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Session Complete</h2>
                <div className="text-4xl font-mono font-bold text-indigo-600">{score} pts</div>
                <p className="text-slate-500">Reflex Score</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="mb-6 flex justify-between w-full max-w-md text-sm font-medium text-slate-400 uppercase tracking-wider">
                <span className={cn("font-mono", timeLeft < 5 ? "text-red-500 font-bold" : "")}>{timeLeft}s</span>
                <span>Score: {score}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md w-full">
                {Array.from({ length: 9 }).map((_, idx) => (
                    <div
                        key={idx}
                        onMouseDown={() => handleHit(idx)}
                        className={cn(
                            "aspect-square rounded-full flex items-center justify-center text-5xl cursor-pointer transition-all duration-100 border-4",
                            idx === activeMole
                                ? "bg-indigo-500 border-indigo-600 shadow-lg shadow-indigo-300 scale-105"
                                : "bg-slate-100 border-slate-200"
                        )}
                    >
                        {idx === activeMole && (
                            <div className="w-8 h-8 rounded-full bg-white animate-pulse" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
