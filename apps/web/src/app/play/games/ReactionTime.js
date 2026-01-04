'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function ReactionTimeGame({ onComplete }) {
    const [gameState, setGameState] = useState('intro') // intro, waiting, active, result, complete
    const [startTime, setStartTime] = useState(null)
    const [reactionTime, setReactionTime] = useState(null)
    const [attempts, setAttempts] = useState([])
    const [round, setRound] = useState(0)

    const TOTAL_ROUNDS = 5

    useEffect(() => {
        let timeout
        if (gameState === 'waiting') {
            const delay = 2000 + Math.random() * 3000
            timeout = setTimeout(() => {
                setGameState('active')
                setStartTime(Date.now())
            }, delay)
        }
        return () => clearTimeout(timeout)
    }, [gameState])

    const handleStart = () => {
        setGameState('waiting')
        setRound(0)
        setAttempts([])
    }

    const handleClick = () => {
        if (gameState === 'active') {
            const time = Date.now() - startTime
            const newAttempts = [...attempts, time]
            setReactionTime(time)
            setAttempts(newAttempts)

            if (round < TOTAL_ROUNDS - 1) {
                setGameState('result')
            } else {
                setGameState('complete')
                finishGame(newAttempts)
            }
        } else if (gameState === 'waiting') {
            // Early click penalty? For now just ignore or reset
            setGameState('too-early')
        } else if (gameState === 'result' || gameState === 'too-early') {
            setRound(r => r + 1)
            setGameState('waiting')
        }
    }

    const finishGame = (finalAttempts) => {
        const avgTime = finalAttempts.reduce((a, b) => a + b, 0) / finalAttempts.length
        // Score calculation: <200ms = 100, 500ms = 0
        const score = Math.max(0, Math.min(100, 100 - (avgTime - 200) / 3))

        // Small delay to show complete state
        setTimeout(() => {
            onComplete({
                score: score,
                duration: (Date.now() - startTime) / 1000 // Approximate total duration
            })
        }, 1500)
    }

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6">
                <div className="text-6xl text-indigo-500">⚡</div>
                <h2 className="text-3xl font-bold text-slate-800">Reaction Velocity</h2>
                <p className="text-slate-500 max-w-md">
                    Test your neural processing speed. Wait for the box to turn <span className="text-emerald-600 font-bold">GREEN</span>, then click immediately.
                </p>
                <Button onClick={handleStart} size="lg" className="w-48">START TEST</Button>
            </div>
        )
    }

    if (gameState === 'complete') {
        const avg = attempts.reduce((a, b) => a + b, 0) / attempts.length
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Test Complete</h2>
                <div className="text-4xl font-mono font-bold text-indigo-600">{avg.toFixed(0)} ms</div>
                <p className="text-slate-500">Average Reaction Time</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 select-none">
            <div className="mb-6 flex justify-between w-full max-w-md text-sm font-medium text-slate-400 uppercase tracking-wider">
                <span>Round {round + 1}/{TOTAL_ROUNDS}</span>
                <span>{attempts.length > 0 ? `Last: ${attempts[attempts.length - 1]}ms` : 'Ready'}</span>
            </div>

            <div
                onMouseDown={handleClick}
                className={cn(
                    "w-full max-w-md aspect-square max-h-80 rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-xl",
                    gameState === 'waiting' && "bg-slate-100 border-4 border-slate-200 hover:bg-slate-200",
                    gameState === 'active' && "bg-emerald-500 border-4 border-emerald-600 scale-105 shadow-emerald-200",
                    gameState === 'result' && "bg-indigo-50 border-4 border-indigo-100",
                    gameState === 'too-early' && "bg-red-50 border-4 border-red-100"
                )}
            >
                <div className="text-center p-4">
                    {gameState === 'waiting' && (
                        <div>
                            <p className="text-3xl font-bold text-slate-400">WAIT...</p>
                            <p className="text-sm text-slate-400 mt-2">Focus...</p>
                        </div>
                    )}
                    {gameState === 'active' && (
                        <p className="text-4xl font-black text-white tracking-widest animate-pulse">CLICK!</p>
                    )}
                    {gameState === 'result' && (
                        <div>
                            <p className="text-5xl font-bold text-indigo-600 mb-2">{reactionTime}<span className="text-lg text-indigo-400">ms</span></p>
                            <p className="text-slate-400 text-sm">Click to continue</p>
                        </div>
                    )}
                    {gameState === 'too-early' && (
                        <div className="text-red-500">
                            <p className="text-2xl font-bold mb-2">Too Early!</p>
                            <p className="text-sm">Click to try again</p>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-8 text-slate-400 text-sm">
                {gameState === 'waiting' ? "Wait for the color change..." : "Tap the box or click anywhere"}
            </p>
        </div>
    )
}
