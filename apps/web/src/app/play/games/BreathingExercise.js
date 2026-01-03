'use client'
import { useState, useEffect } from 'react'

export default function BreathingExerciseGame({ onComplete }) {
    const [phase, setPhase] = useState('inhale') // inhale, hold, exhale
    const [count, setCount] = useState(4)
    const [cycles, setCycles] = useState(0)
    const [startTime] = useState(Date.now())
    const totalCycles = 5

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    // Move to next phase
                    if (phase === 'inhale') {
                        setPhase('hold')
                        return 4
                    } else if (phase === 'hold') {
                        setPhase('exhale')
                        return 4
                    } else {
                        // Complete cycle
                        const newCycles = cycles + 1
                        setCycles(newCycles)

                        if (newCycles >= totalCycles) {
                            clearInterval(interval)
                            const duration = (Date.now() - startTime) / 1000
                            onComplete({ score: 100, duration })
                            return 0
                        }

                        setPhase('inhale')
                        return 4
                    }
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [phase, cycles, startTime, onComplete])

    const getCircleSize = () => {
        if (phase === 'inhale') {
            return 200 + (4 - count) * 50
        } else if (phase === 'exhale') {
            return 200 + count * 50
        }
        return 400
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
            <h2 className="text-3xl font-bold mb-2 gradient-text">🧘 Breathing Exercise</h2>
            <p className="text-text-muted mb-8 font-semibold">Cycle {cycles + 1} of {totalCycles}</p>

            <div className="relative w-full max-w-md aspect-square flex items-center justify-center mb-8">
                <div
                    className="rounded-full bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/40 transition-all duration-1000 flex items-center justify-center shadow-lg shadow-primary/20"
                    style={{
                        width: `${getCircleSize()}px`,
                        height: `${getCircleSize()}px`
                    }}
                >
                    <div className="text-center">
                        <p className="text-4xl font-bold mb-2 text-primary">{count}</p>
                        <p className="text-2xl uppercase text-primary font-bold">{phase}</p>
                    </div>
                </div>
            </div>

            <div className="text-center text-text-muted">
                <p className="font-medium">Follow the breathing pattern</p>
                <p className="text-sm mt-2 text-text-secondary">Inhale → Hold → Exhale</p>
            </div>
        </div>
    )
}
