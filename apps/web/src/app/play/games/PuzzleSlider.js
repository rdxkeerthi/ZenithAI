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
        <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
            <h2 className="text-3xl font-bold mb-2 gradient-text">🧩 Puzzle Slider</h2>
            <p className="text-text-muted mb-4 font-semibold">Moves: {moves}</p>
            <p className="text-sm mb-8 text-text-secondary font-medium">Arrange tiles in order 1-8</p>

            <div className="grid grid-cols-3 gap-2 max-w-sm">
                {tiles.map((tile, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleTileClick(idx)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-4xl font-bold cursor-pointer transition-all border-2 ${tile === 0
                                ? 'bg-transparent border-transparent'
                                : canMove(idx)
                                    ? 'bg-primary/25 border-primary hover:bg-primary/40 hover:shadow-md'
                                    : 'bg-secondary/20 border-secondary/40'
                            }`}
                    >
                        {tile !== 0 && <span className="text-primary font-black">{tile}</span>}
                    </div>
                ))}
            </div>
        </div>
    )
}
