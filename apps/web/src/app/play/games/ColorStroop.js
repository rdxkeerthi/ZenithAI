'use client'
import { useState, useEffect } from 'react'

const COLORS = [
    { name: 'RED', color: '#ef4444' },
    { name: 'BLUE', color: '#3b82f6' },
    { name: 'GREEN', color: '#10b981' },
    { name: 'YELLOW', color: '#f59e0b' }
]

export default function ColorStroopGame({ onComplete }) {
    const [currentWord, setCurrentWord] = useState(null)
    const [currentColor, setCurrentColor] = useState(null)
    const [score, setScore] = useState(0)
    const [round, setRound] = useState(0)
    const [startTime] = useState(Date.now())
    const totalRounds = 10

    useEffect(() => {
        generateNew()
    }, [])

    const generateNew = () => {
        const wordIdx = Math.floor(Math.random() * COLORS.length)
        const colorIdx = Math.floor(Math.random() * COLORS.length)
        setCurrentWord(COLORS[wordIdx].name)
        setCurrentColor(COLORS[colorIdx].color)
    }

    const handleAnswer = (colorName) => {
        const correctColor = COLORS.find(c => c.color === currentColor)
        if (colorName === correctColor.name) {
            setScore(score + 10)
        }

        if (round < totalRounds - 1) {
            setRound(round + 1)
            generateNew()
        } else {
            const duration = (Date.now() - startTime) / 1000
            onComplete({ score, duration })
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold mb-2">🎨 Color Stroop Test</h2>
            <p className="text-muted mb-4">Round {round + 1} of {totalRounds} | Score: {score}</p>
            <p className="text-lg mb-8">Select the COLOR of the text, not the word!</p>

            <div className="mb-12">
                <p
                    className="text-6xl font-bold"
                    style={{ color: currentColor }}
                >
                    {currentWord}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
                {COLORS.map((color) => (
                    <button
                        key={color.name}
                        onClick={() => handleAnswer(color.name)}
                        className="btn text-lg py-4"
                        style={{ backgroundColor: color.color }}
                    >
                        {color.name}
                    </button>
                ))}
            </div>
        </div>
    )
}
