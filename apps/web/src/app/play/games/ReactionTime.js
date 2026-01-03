'use client'
import { useState, useEffect } from 'react'

export default function ReactionTimeGame({ onComplete }) {
    const [gameState, setGameState] = useState('waiting') // waiting, ready, active, result
    const [startTime, setStartTime] = useState(null)
    const [reactionTime, setReactionTime] = useState(null)
    const [attempts, setAttempts] = useState([])
    const [round, setRound] = useState(0)
    const totalRounds = 5

    useEffect(() => {
        if (gameState === 'waiting') {
            const delay = 2000 + Math.random() * 3000
            const timer = setTimeout(() => {
                setGameState('active')
                setStartTime(Date.now())
            }, delay)
            return () => clearTimeout(timer)
        }
    }, [gameState])

    const handleClick = () => {
        if (gameState === 'active') {
            const time = Date.now() - startTime
            setReactionTime(time)
            setAttempts([...attempts, time])
            setGameState('result')
        } else if (gameState === 'result') {
            if (round < totalRounds - 1) {
                setRound(round + 1)
                setGameState('waiting')
                setReactionTime(null)
            } else {
                // Game complete
                const avgTime = attempts.reduce((a, b) => a + b, 0) / attempts.length
                onComplete({
                    score: Math.max(0, 100 - avgTime / 10),
                    duration: (Date.now() - attempts[0]) / 1000
                })
            }
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-3xl font-bold mb-4">⚡ Reaction Time Test</h2>
            <p className="text-muted mb-8">Round {round + 1} of {totalRounds}</p>

            <div
                onClick={handleClick}
                className={`w-full max-w-md h-64 rounded-lg flex items-center justify-center cursor-pointer transition-all ${gameState === 'waiting' ? 'bg-danger' :
                        gameState === 'active' ? 'bg-success animate-glow' :
                            'bg-primary'
                    }`}
            >
                <div className="text-center">
                    {gameState === 'waiting' && (
                        <p className="text-2xl font-bold">Wait for green...</p>
                    )}
                    {gameState === 'active' && (
                        <p className="text-3xl font-bold">CLICK NOW!</p>
                    )}
                    {gameState === 'result' && (
                        <div>
                            <p className="text-4xl font-bold mb-2">{reactionTime}ms</p>
                            <p className="text-lg">Click to continue</p>
                        </div>
                    )}
                </div>
            </div>

            {attempts.length > 0 && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted">
                        Average: {(attempts.reduce((a, b) => a + b, 0) / attempts.length).toFixed(0)}ms
                    </p>
                </div>
            )}
        </div>
    )
}
