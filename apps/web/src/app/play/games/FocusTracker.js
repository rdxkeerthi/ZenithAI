'use client'
import { useState, useEffect } from 'react'

export default function FocusTrackerGame({ onComplete }) {
    const [position, setPosition] = useState({ x: 50, y: 50 })
    const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 })
    const [score, setScore] = useState(100)
    const [timeLeft, setTimeLeft] = useState(20)
    const [startTime] = useState(Date.now())

    useEffect(() => {
        // Move target randomly
        const targetInterval = setInterval(() => {
            setTargetPosition({
                x: 20 + Math.random() * 60,
                y: 20 + Math.random() * 60
            })
        }, 2000)

        // Timer
        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(targetInterval)
                    clearInterval(timerInterval)
                    const duration = (Date.now() - startTime) / 1000
                    onComplete({ score: Math.max(0, score), duration })
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            clearInterval(targetInterval)
            clearInterval(timerInterval)
        }
    }, [score, startTime, onComplete])

    useEffect(() => {
        // Calculate distance and update score
        const interval = setInterval(() => {
            const distance = Math.sqrt(
                Math.pow(position.x - targetPosition.x, 2) +
                Math.pow(position.y - targetPosition.y, 2)
            )

            if (distance > 10) {
                setScore(prev => Math.max(0, prev - 1))
            }
        }, 100)

        return () => clearInterval(interval)
    }, [position, targetPosition])

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setPosition({ x, y })
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold mb-2">🎯 Focus Tracker</h2>
            <p className="text-muted mb-4">Score: {score} | Time: {timeLeft}s</p>
            <p className="text-sm mb-4">Keep your cursor on the target!</p>

            <div
                onMouseMove={handleMouseMove}
                className="relative w-full max-w-lg aspect-square bg-tertiary rounded-lg cursor-none overflow-hidden"
            >
                {/* Target */}
                <div
                    className="absolute w-16 h-16 bg-success rounded-full transition-all duration-500"
                    style={{
                        left: `${targetPosition.x}%`,
                        top: `${targetPosition.y}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                />

                {/* Cursor */}
                <div
                    className="absolute w-4 h-4 bg-primary rounded-full"
                    style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            </div>
        </div>
    )
}
