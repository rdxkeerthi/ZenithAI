'use client'
import { useState, useEffect } from 'react'

export default function MazeNavigatorGame({ onComplete }) {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [moves, setMoves] = useState(0)
    const [startTime] = useState(Date.now())
    const goalX = 4
    const goalY = 4

    useEffect(() => {
        const handleKeyPress = (e) => {
            let newX = position.x
            let newY = position.y

            switch (e.key) {
                case 'ArrowUp':
                    newY = Math.max(0, newY - 1)
                    break
                case 'ArrowDown':
                    newY = Math.min(4, newY + 1)
                    break
                case 'ArrowLeft':
                    newX = Math.max(0, newX - 1)
                    break
                case 'ArrowRight':
                    newX = Math.min(4, newX + 1)
                    break
                default:
                    return
            }

            setPosition({ x: newX, y: newY })
            setMoves(moves + 1)

            if (newX === goalX && newY === goalY) {
                const duration = (Date.now() - startTime) / 1000
                onComplete({ score: Math.max(0, 100 - moves * 2), duration })
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [position, moves, startTime, onComplete])

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
            <h2 className="text-3xl font-bold mb-2 gradient-text">🗺️ Maze Navigator</h2>
            <p className="text-text-muted mb-4 font-semibold">Moves: {moves}</p>
            <p className="text-sm mb-8 text-text-secondary font-medium">Use arrow keys to reach the goal!</p>

            <div className="grid grid-cols-5 gap-2 max-w-md">
                {Array.from({ length: 25 }).map((_, idx) => {
                    const x = idx % 5
                    const y = Math.floor(idx / 5)
                    const isPlayer = x === position.x && y === position.y
                    const isGoal = x === goalX && y === goalY

                    return (
                        <div
                            key={idx}
                            className={`aspect-square rounded-xl flex items-center justify-center text-3xl border-2 transition-all ${isPlayer ? 'bg-primary/30 border-primary shadow-lg shadow-primary/40' :
                                    isGoal ? 'bg-success/30 border-success shadow-lg shadow-success/40' :
                                        'bg-secondary/20 border-secondary/40 hover:border-secondary'
                                }`}
                        >
                            {isPlayer && '🚀'}
                            {isGoal && '🎯'}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
