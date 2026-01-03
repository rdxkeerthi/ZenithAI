'use client'
import { useState, useEffect } from 'react'

export default function PuzzleSliderGame({ onComplete }) {
    const [tiles, setTiles] = useState([])
    const [moves, setMoves] = useState(0)
    const [startTime] = useState(Date.now())

    useEffect(() => {
        // Initialize puzzle
        const initial = [1, 2, 3, 4, 5, 6, 7, 8, 0]
        // Shuffle
        const shuffled = [...initial].sort(() => Math.random() - 0.5)
        setTiles(shuffled)
    }, [])

    const canMove = (index) => {
        const emptyIndex = tiles.indexOf(0)
        const row = Math.floor(index / 3)
        const col = index % 3
        const emptyRow = Math.floor(emptyIndex / 3)
        const emptyCol = emptyIndex % 3

        return (
            (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
            (col === emptyCol && Math.abs(row - emptyRow) === 1)
        )
    }

    const handleTileClick = (index) => {
        if (!canMove(index)) return

        const newTiles = [...tiles]
        const emptyIndex = tiles.indexOf(0)
            ;[newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]]
        setTiles(newTiles)
        setMoves(moves + 1)

        // Check if solved
        const isSolved = newTiles.every((tile, idx) =>
            idx === 8 ? tile === 0 : tile === idx + 1
        )

        if (isSolved) {
            const duration = (Date.now() - startTime) / 1000
            onComplete({ score: Math.max(0, 100 - moves), duration })
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold mb-2">🧩 Puzzle Slider</h2>
            <p className="text-muted mb-4">Moves: {moves}</p>
            <p className="text-sm mb-8">Arrange tiles in order 1-8</p>

            <div className="grid grid-cols-3 gap-2 max-w-sm">
                {tiles.map((tile, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleTileClick(idx)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-4xl font-bold cursor-pointer transition-all ${tile === 0
                                ? 'bg-transparent'
                                : canMove(idx)
                                    ? 'bg-primary hover:bg-primary-light'
                                    : 'bg-tertiary'
                            }`}
                    >
                        {tile !== 0 && tile}
                    </div>
                ))}
            </div>
        </div>
    )
}
