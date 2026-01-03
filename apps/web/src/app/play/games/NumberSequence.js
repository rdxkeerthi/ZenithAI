'use client'
import { useState, useEffect } from 'react'

export default function NumberSequenceGame({ onComplete }) {
    const [sequence, setSequence] = useState([])
    const [userInput, setUserInput] = useState('')
    const [showSequence, setShowSequence] = useState(true)
    const [round, setRound] = useState(0)
    const [score, setScore] = useState(0)
    const [startTime] = useState(Date.now())
    const totalRounds = 5

    useEffect(() => {
        generateSequence()
    }, [])

    const generateSequence = () => {
        const length = 4 + round
        const seq = Array.from({ length }, () => Math.floor(Math.random() * 10))
        setSequence(seq)
        setUserInput('')
        setShowSequence(true)
        setTimeout(() => setShowSequence(false), 2000 + round * 500)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const correct = userInput === sequence.join('')
        if (correct) {
            setScore(score + 20)
        }

        if (round < totalRounds - 1) {
            setRound(round + 1)
            setTimeout(generateSequence, 1000)
        } else {
            const duration = (Date.now() - startTime) / 1000
            onComplete({ score: score + (correct ? 20 : 0), duration })
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-text-primary">
            <h2 className="text-3xl font-bold mb-2 gradient-text">🔢 Number Sequence</h2>
            <p className="text-text-muted mb-4 font-semibold">Round {round + 1} of {totalRounds} | Score: {score}</p>

            <div className="mb-8 h-32 flex items-center justify-center bg-primary/10 rounded-2xl w-full max-w-md border-2 border-primary/30">
                {showSequence ? (
                    <p className="text-6xl font-bold tracking-wider text-primary">
                        {sequence.join(' ')}
                    </p>
                ) : (
                    <p className="text-lg text-text-muted font-medium">Enter the sequence you saw</p>
                )}
            </div>

            {!showSequence && (
                <form onSubmit={handleSubmit} className="w-full max-w-md">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                        className="input text-center text-2xl mb-4 border-2 border-primary/30 rounded-xl font-bold bg-white text-text-primary placeholder-text-muted/50"
                        placeholder="Enter numbers"
                        autoFocus
                        maxLength={sequence.length}
                    />
                    <button type="submit" className="btn btn-primary w-full font-bold rounded-xl py-3">
                        Submit
                    </button>
                </form>
            )}
        </div>
    )
}
