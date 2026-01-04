'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const COLORS = [
    { name: 'RED', color: '#ef4444' },
    { name: 'BLUE', color: '#3b82f6' },
    { name: 'GREEN', color: '#10b981' },
    { name: 'YELLOW', color: '#f59e0b' }
]

export default function ColorStroopGame({ onComplete }) {
    const [gameState, setGameState] = useState('intro') // intro, playing, complete
    const [currentWord, setCurrentWord] = useState(null)
    const [currentColor, setCurrentColor] = useState(null)
    const [score, setScore] = useState(0)
    const [round, setRound] = useState(0)
    const [startTime, setStartTime] = useState(null)
    const TOTAL_ROUNDS = 10

    const startGame = () => {
        setGameState('playing')
        setScore(0)
        setRound(0)
        setStartTime(Date.now())
        generateNew()
    }

    const generateNew = () => {
        const wordIdx = Math.floor(Math.random() * COLORS.length)
        const colorIdx = Math.floor(Math.random() * COLORS.length)
        setCurrentWord(COLORS[wordIdx].name)
        setCurrentColor(COLORS[colorIdx].color)
    }

    const handleAnswer = (colorName) => {
        const correctColor = COLORS.find(c => c.color === currentColor)
        if (colorName === correctColor.name) {
            setScore(s => s + 10)
        }

        if (round < TOTAL_ROUNDS - 1) {
            setRound(r => r + 1)
            generateNew()
        } else {
            finishGame()
        }
    }

    const finishGame = () => {
        setGameState('complete')
        const duration = (Date.now() - startTime) / 1000
        setTimeout(() => {
            onComplete({ score, duration })
        }, 1500)
    }

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6">
                <div className="text-6xl text-indigo-500">🎨</div>
                <h2 className="text-3xl font-bold text-slate-800">Color Conflict</h2>
                <p className="text-slate-500 max-w-md">
                    Stroop Effect Test. Select the <strong>COLOR</strong> of the text, not the word itself. Ignore the semantic meaning.
                </p>
                <Button onClick={startGame} size="lg" className="w-48">START TEST</Button>
            </div>
        )
    }

    if (gameState === 'complete') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Cognitive Load Test</h2>
                <div className="text-4xl font-mono font-bold text-indigo-600">{score}/100</div>
                <p className="text-slate-500">Accuracy Score</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex justify-between w-full max-w-md text-sm font-medium text-slate-400 uppercase tracking-wider">
                <span>Round {round + 1}/{TOTAL_ROUNDS}</span>
                <span>Score: {score}</span>
            </div>

            <div className="mb-12 p-12 bg-white rounded-3xl border-2 border-slate-100 shadow-xl w-full max-w-md flex items-center justify-center">
                <p
                    className="text-6xl font-black tracking-widest"
                    style={{ color: currentColor }}
                >
                    {currentWord}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                {COLORS.map((color) => (
                    <button
                        key={color.name}
                        onClick={() => handleAnswer(color.name)}
                        className="btn h-20 rounded-2xl font-bold text-white text-xl shadow-lg hover:scale-105 active:scale-95 transition-all border-b-4 border-black/10"
                        style={{ backgroundColor: color.color }}
                    >
                        {color.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
