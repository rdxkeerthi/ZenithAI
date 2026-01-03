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
        <div className="h-full flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl font-bold mb-2">🔢 Number Sequence</h2>
            <p className="text-muted mb-4">Round {round + 1} of {totalRounds} | Score: {score}</p>

            <div className="mb-8 h-32 flex items-center justify-center">
                {showSequence ? (
                    <p className="text-6xl font-bold tracking-wider">
                        {sequence.join(' ')}
                    </p>
                ) : (
                    <p className="text-lg text-muted">Enter the sequence you saw</p>
                )}
            </div>

            {!showSequence && (
                <form onSubmit={handleSubmit} className="w-full max-w-md">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                        className="input text-center text-2xl mb-4"
                        placeholder="Enter numbers"
                        autoFocus
                        maxLength={sequence.length}
                    />
                    <button type="submit" className="btn btn-primary w-full">
                        Submit
                    </button>
                </form>
            )}
        </div>
    )
}
