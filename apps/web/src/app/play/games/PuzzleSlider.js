'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function PuzzleSliderGame({ onComplete }) {
    const [gameState, setGameState] = useState('intro') // intro, playing, complete
    const [tiles, setTiles] = useState([])
    const [moves, setMoves] = useState(0)
    const [timeLeft, setTimeLeft] = useState(60) // 60 seconds strict limit
    const [startTime, setStartTime] = useState(null)

    // Solved state: [1, 2, 3, 4, 5, 6, 7, 8, 0]
    const SOLVED_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0]

    const startGame = () => {
        // Initialize with solved state
        let currentTiles = [...SOLVED_STATE]
        let blankIdx = 8
        let previousIdx = -1

        // Perform valid random moves to shuffle (to ensure solvability)
        // 100 moves should be sufficient shuffle
        for (let i = 0; i < 150; i++) {
            const possibleMoves = getValidMoves(blankIdx)
            // Filter out the move that would undo the immediate last move (simple loop prevention)
            const validNextMoves = possibleMoves.filter(idx => idx !== previousIdx)

            const randomMove = validNextMoves[Math.floor(Math.random() * validNextMoves.length)]

            currentTiles[blankIdx] = currentTiles[randomMove]
            currentTiles[randomMove] = 0

            previousIdx = blankIdx
            blankIdx = randomMove
        }

        setTiles(currentTiles)
        setMoves(0)
        setTimeLeft(60)
        setStartTime(Date.now())
        setGameState('playing')
    }

    const getValidMoves = (emptyIndex) => {
        const row = Math.floor(emptyIndex / 3)
        const col = emptyIndex % 3
        const moves = []

        if (row > 0) moves.push(emptyIndex - 3) // Up
        if (row < 2) moves.push(emptyIndex + 3) // Down
        if (col > 0) moves.push(emptyIndex - 1) // Left
        if (col < 2) moves.push(emptyIndex + 1) // Right

        return moves
    }

    useEffect(() => {
        if (gameState !== 'playing') return

        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerInterval)
                    finishGame(false) // Time out
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerInterval)
    }, [gameState])

    const handleTileClick = (index) => {
        if (gameState !== 'playing') return

        const emptyIndex = tiles.indexOf(0)
        const row = Math.floor(index / 3)
        const col = index % 3
        const emptyRow = Math.floor(emptyIndex / 3)
        const emptyCol = emptyIndex % 3

        const isAdjacent = (
            (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
            (col === emptyCol && Math.abs(row - emptyRow) === 1)
        )

        if (!isAdjacent) return

        const newTiles = [...tiles]
        // Swap
        newTiles[emptyIndex] = newTiles[index]
        newTiles[index] = 0

        setTiles(newTiles)
        setMoves(m => m + 1)

        // Check if solved
        const isSolved = newTiles.every((val, idx) => val === SOLVED_STATE[idx])

        if (isSolved) {
            finishGame(true)
        }
    }

    const finishGame = (solved) => {
        setGameState('complete')
        const duration = (Date.now() - startTime) / 1000

        // Score calculation
        // If solved: Base 50 + (TimeLeft * 2) - (MovesPenalty)
        // If timeout: 0
        let calculatedScore = 0
        if (solved) {
            const timeBonus = Math.floor((60 - duration) * 2)
            calculatedScore = Math.min(100, Math.max(10, 50 + timeBonus))
        }

        setTimeout(() => {
            onComplete({ score: calculatedScore, duration })
        }, 1500)
    }

    if (gameState === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-6">
                <div className="text-6xl text-indigo-500">🧩</div>
                <h2 className="text-3xl font-bold text-slate-800">Logic Slider</h2>
                <p className="text-slate-500 max-w-md">
                    Order the numbered tiles from 1 to 8. You have 60 seconds.
                    <br /><span className="text-xs text-slate-400 mt-2">(Tap a tile adjacent to the empty space to move it)</span>
                </p>
                <Button onClick={startGame} size="lg" className="w-48">START PUZZLE</Button>
            </div>
        )
    }

    if (gameState === 'complete') {
        const isSolved = tiles.every((val, idx) => val === SOLVED_STATE[idx])

        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold text-slate-800">
                    {isSolved ? "Puzzle Solved!" : "Time's Up"}
                </h2>
                {isSolved ? (
                    <div className="flex flex-col gap-2">
                        <div className="text-4xl font-mono font-bold text-indigo-600">{moves} Moves</div>
                        <p className="text-emerald-500 font-medium">Excellent logic!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="text-slate-500">Try again to sharpen your logic.</p>
                        <Button onClick={startGame} variant="outline" className="mt-4">Retry</Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="mb-6 flex justify-between w-full max-w-sm text-sm font-medium text-slate-400 uppercase tracking-wider">
                <span className={cn("font-mono font-bold text-lg", timeLeft < 10 ? "text-red-500" : "text-slate-700")}>
                    {timeLeft}s
                </span>
                <span>Moves: {moves}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-200 rounded-xl shadow-inner">
                {tiles.map((tile, idx) => {
                    const isEmpty = tile === 0
                    const emptyIndex = tiles.indexOf(0)
                    const row = Math.floor(idx / 3)
                    const col = idx % 3
                    const emptyRow = Math.floor(emptyIndex / 3)
                    const emptyCol = emptyIndex % 3
                    const isMovable = (row === emptyRow && Math.abs(col - emptyCol) === 1) || (col === emptyCol && Math.abs(row - emptyRow) === 1)

                    return (
                        <div
                            key={idx}
                            onClick={() => handleTileClick(idx)}
                            className={cn(
                                "w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold transition-all duration-200",
                                isEmpty
                                    ? "bg-transparent"
                                    : "bg-white text-indigo-600 shadow-[0_4px_0_0_rgb(79,70,229)] active:shadow-none active:translate-y-1 hover:-translate-y-0.5",
                                isMovable && !isEmpty && "cursor-pointer hover:bg-slate-50",
                                !isMovable && !isEmpty && "cursor-default opacity-90"
                            )}
                        >
                            {!isEmpty && tile}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
