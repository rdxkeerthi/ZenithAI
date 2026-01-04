'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const GRID_SIZE = 4
const TOTAL_ROUNDS = 5

export default function PatternRecognitionGame({ onComplete }) {
    const [gameState, setGameState] = useState('intro') // intro, memory, recall, result, complete
    const [pattern, setPattern] = useState([])
    const [userPattern, setUserPattern] = useState([])
    const [round, setRound] = useState(0)
    const [score, setScore] = useState(0)
    const [startTime, setStartTime] = useState(null)

    const startGame = () => {
        setRound(0)
        setScore(0)
        setStartTime(Date.now())
        startRound(1) // Start with 1, increase difficulty
    }

    const startRound = (difficulty) => {
        setGameState('memory')
        setUserPattern([])

        // Generate random pattern based on difficulty (game gets harder)
        const numCells = Math.min(8, 3 + difficulty)
        const newPattern = []
        while (newPattern.length < numCells) {
            const idx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE))
            if (!newPattern.includes(idx)) newPattern.push(idx)
        }
        setPattern(newPattern)

        // Show pattern for 2 seconds then hide
        setTimeout(() => {
            setGameState('recall')
        }, 1500)
    }

    const handleCellClick = (index) => {
        if (gameState !== 'recall') return

        const newUserPattern = [...userPattern, index]
        setUserPattern(newUserPattern)

        const isCorrectSoFar = pattern.includes(index) && !userPattern.includes(index)

        if (!isCorrectSoFar) {
            // Wrong click - round fail
            handleRoundEnd(false)
            return
        }

        if (newUserPattern.length === pattern.length) {
            // Round success
            handleRoundEnd(true)
        }
    }

    const handleRoundEnd = (success) => {
        setGameState('result')
        if (success) setScore(s => s + 20)

        setTimeout(() => {
            if (round < TOTAL_ROUNDS - 1) {
                setRound(r => r + 1)
                startRound(round + 2) // Increase difficulty
            } else {
                setGameState('complete')
                finishGame()
            }
        }, 1000)
    }

    const finishGame = () => {
        setTimeout(() => {
            onComplete({
                score: score,
                duration: (Date.now() - startTime) / 1000
            })
        }, 1500)
    }

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6">
                <div className="text-6xl text-indigo-500">🔷</div>
                <h2 className="text-3xl font-bold text-slate-800">Visual Pattern</h2>
                <p className="text-slate-500 max-w-md">
                    Memorize the highlighted grid cells. When they disappear, tap the exact same cells to recall the pattern.
                </p>
                <Button onClick={startGame} size="lg" className="w-48">START</Button>
            </div>
        )
    }

    if (gameState === 'complete') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Evaluation Done</h2>
                <div className="text-4xl font-mono font-bold text-indigo-600">{score}/100</div>
                <p className="text-slate-500">Pattern Accuracy Score</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="mb-6 flex justify-between w-full max-w-sm text-sm font-medium text-slate-400 uppercase tracking-wider">
                <span>Round {round + 1}/{TOTAL_ROUNDS}</span>
                <span>Score: {score}</span>
            </div>

            <p className={cn(
                "h-8 text-lg font-bold mb-4 transition-all",
                gameState === 'memory' ? "text-indigo-600" : "text-transparent"
            )}>
                MEMORIZE...
            </p>

            <div className="grid grid-cols-4 gap-2 max-w-sm w-full">
                {Array.from({ length: 16 }).map((_, idx) => {
                    const isTarget = pattern.includes(idx)
                    const isSelected = userPattern.includes(idx)

                    return (
                        <div
                            key={idx}
                            onClick={() => handleCellClick(idx)}
                            className={cn(
                                "aspect-square rounded-lg cursor-pointer transition-all duration-200 border-2",
                                gameState === 'memory' && isTarget
                                    ? "bg-indigo-500 border-indigo-600 shadow-lg shadow-indigo-200"
                                    : "bg-slate-50 border-slate-200",
                                gameState === 'recall' && "hover:bg-slate-100",
                                gameState === 'recall' && isSelected && isTarget && "bg-emerald-500 border-emerald-600",
                                gameState === 'recall' && isSelected && !isTarget && "bg-red-500 border-red-600"
                            )}
                        />
                    )
                })}
            </div>
        </div>
    )
}
