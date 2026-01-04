'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function FocusTrackerGame({ onComplete }) {
    const [gameState, setGameState] = useState('intro') // intro, playing, complete
    const [position, setPosition] = useState({ x: 50, y: 50 }) // User cursor
    const [target, setTarget] = useState({ x: 50, y: 50 }) // Moving target
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30) // 30 seconds game
    const [isInside, setIsInside] = useState(false)

    // Game loop ref
    const requestRef = useRef()
    const startTimeRef = useRef()
    const lastScoreTimeRef = useRef(0)

    const startGame = () => {
        setGameState('playing')
        setScore(0)
        setTimeLeft(30)
        startLoop()
    }

    const startLoop = () => {
        startTimeRef.current = Date.now()
        lastScoreTimeRef.current = Date.now()
        requestRef.current = requestAnimationFrame(animate)
    }

    const animate = (time) => {
        const now = Date.now()
        const elapsed = (now - startTimeRef.current) / 1000

        // Timer logic
        const remaining = Math.max(0, 30 - elapsed)
        setTimeLeft(remaining)

        if (remaining <= 0) {
            setGameState('complete')
            cancelAnimationFrame(requestRef.current)
            finishGame()
            return
        }

        // Move target in a figure-8 or smooth random path
        // Using sine waves for smooth continuous movement
        const speed = 0.5 + (elapsed / 10) // Speed up over time
        const tx = 50 + 35 * Math.sin(now * 0.001 * speed) * Math.cos(now * 0.0005)
        const ty = 50 + 35 * Math.sin(now * 0.0015 * speed)

        setTarget({ x: tx, y: ty })

        // Check if cursor (position) is inside target
        // Distance check (percentage based)
        // Assume target radius is approx 10% of container width
        // Assume Aspect Ratio is roughly square for calculation simplicity or handle separately
        const dx = position.x - tx
        const dy = position.y - ty
        const dist = Math.sqrt(dx * dx + dy * dy)

        const threshold = 10 // 10% radius
        const inside = dist < threshold
        setIsInside(inside)

        // Score accumulation (every 100ms effectively)
        if (inside && now - lastScoreTimeRef.current > 100) {
            setScore(prev => prev + 10)
            lastScoreTimeRef.current = now
        }

        requestRef.current = requestAnimationFrame(animate)
    }

    const finishGame = () => {
        // Normalize score: 3000 max points approx (30s * 10pts/0.1s)
        // Let's say 2500 is 100%
        const finalScore = Math.min(100, Math.floor((score / 2500) * 100))

        setTimeout(() => {
            onComplete({
                score: finalScore,
                duration: 30
            })
        }, 1500)
    }

    useEffect(() => {
        return () => cancelAnimationFrame(requestRef.current)
    }, [])

    const handleMouseMove = (e) => {
        if (gameState !== 'playing') return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setPosition({ x, y })
    }

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6">
                <div className="text-6xl text-indigo-500">🎯</div>
                <h2 className="text-3xl font-bold text-slate-800">Precision Pursuit</h2>
                <p className="text-slate-500 max-w-md">
                    Keep your cursor inside the moving circle as it accelerates. Do not let it escape.
                </p>
                <Button onClick={startGame} size="lg" className="w-48">START TRACKING</Button>
            </div>
        )
    }

    if (gameState === 'complete') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Tracking Complete</h2>
                <div className="text-4xl font-mono font-bold text-indigo-600">{Math.min(100, Math.floor((score / 2500) * 100))} pts</div>
                <p className="text-slate-500">Focus Stability Score</p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="mb-6 flex justify-between w-full max-w-lg text-sm font-medium text-slate-400 uppercase tracking-wider">
                <div className="flex flex-col">
                    <span className="text-xs">Time Remaining</span>
                    <span className={cn("text-xl font-bold font-mono", timeLeft < 5 ? "text-red-500" : "text-slate-700")}>
                        {timeLeft.toFixed(1)}s
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-xs">Score</span>
                    <span className="text-xl font-bold text-indigo-600">{score}</span>
                </div>
            </div>

            <div
                className="relative w-full max-w-lg aspect-square bg-slate-50 rounded-3xl border-2 border-slate-200 shadow-inner overflow-hidden cursor-none"
                onMouseMove={handleMouseMove}
            >
                {/* Grid/Guides Background */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '10% 10%' }}
                />

                {/* Target Zone */}
                <div
                    className={cn(
                        "absolute w-20 h-20 rounded-full border-4 transition-colors duration-75 flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2",
                        isInside
                            ? "bg-emerald-500/20 border-emerald-500 shadow-emerald-200"
                            : "bg-indigo-500/10 border-indigo-400"
                    )}
                    style={{ left: `${target.x}%`, top: `${target.y}%` }}
                >
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        isInside ? "bg-emerald-500 animate-ping" : "bg-indigo-400"
                    )} />
                </div>

                {/* User Cursor */}
                <div
                    className={cn(
                        "absolute w-6 h-6 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-75 pointer-events-none z-10",
                        isInside ? "bg-emerald-600 border-white shadow-lg" : "bg-slate-800 border-white shadow-md"
                    )}
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                />

                {/* Connect Line (Visual Aid) */}
                <svg className="absolute inset-0 pointer-events-none opacity-30">
                    <line
                        x1={`${position.x}%`} y1={`${position.y}%`}
                        x2={`${target.x}%`} y2={`${target.y}%`}
                        stroke={isInside ? "#10b981" : "#64748b"}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                    />
                </svg>
            </div>

            <p className="mt-6 text-sm text-slate-400">
                Keep the dark dot inside the large circle.
            </p>
        </div>
    )
}
