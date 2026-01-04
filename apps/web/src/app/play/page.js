'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

// Import games
import ReactionTimeGame from './games/ReactionTime'
import MemoryMatchGame from './games/MemoryMatch'
import PatternRecognitionGame from './games/PatternRecognition'
import ColorStroopGame from './games/ColorStroop'
import NumberSequenceGame from './games/NumberSequence'
import MazeNavigatorGame from './games/MazeNavigator'
import WhackAMoleGame from './games/WhackAMole'
import PuzzleSliderGame from './games/PuzzleSlider'
import FocusTrackerGame from './games/FocusTracker'
import BreathingExerciseGame from './games/BreathingExercise'

// Import face tracking
import FaceTracking from './FaceTracking'

const ALL_GAMES = [
    { id: 1, name: 'Reaction Time', component: ReactionTimeGame, emoji: '⚡' },
    { id: 2, name: 'Memory Match', component: MemoryMatchGame, emoji: '🧠' },
    { id: 3, name: 'Pattern Recognition', component: PatternRecognitionGame, emoji: '🔷' },
    { id: 4, name: 'Color Stroop', component: ColorStroopGame, emoji: '🎨' },
    { id: 5, name: 'Number Sequence', component: NumberSequenceGame, emoji: '🔢' },
    { id: 6, name: 'Maze Navigator', component: MazeNavigatorGame, emoji: '🗺️' },
    { id: 7, name: 'Whack-a-Mole', component: WhackAMoleGame, emoji: '🔨' },
    { id: 8, name: 'Puzzle Slider', component: PuzzleSliderGame, emoji: '🧩' },
    { id: 9, name: 'Focus Tracker', component: FocusTrackerGame, emoji: '🎯' },
    { id: 10, name: 'Breathing Exercise', component: BreathingExerciseGame, emoji: '🧘' }
]

export default function PlayPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [sessionId, setSessionId] = useState(null)
    const [currentGameIndex, setCurrentGameIndex] = useState(null)
    const [selectedGames, setSelectedGames] = useState([])
    const [stressData, setStressData] = useState([])
    const [currentStress, setCurrentStress] = useState(null)
    const [gameStarted, setGameStarted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [completedGames, setCompletedGames] = useState(new Set())

    const faceTrackingRef = useRef(null)
    const scrollContainerRef = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }
        setUser(JSON.parse(userData))
    }, [router])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index'))
                        if (!isNaN(index)) {
                            setCurrentGameIndex(index)
                        }
                    }
                })
            },
            { root: scrollContainerRef.current, threshold: 0.6 }
        )

        if (gameStarted) {
            setTimeout(() => {
                const sections = document.querySelectorAll('.game-snap-section')
                sections.forEach((section) => observer.observe(section))
            }, 100)
        }
        return () => observer.disconnect()
    }, [selectedGames, gameStarted])

    const selectRandomGames = () => {
        const shuffled = [...ALL_GAMES]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled.slice(0, 4)
    }

    const startSession = async () => {
        setLoading(true)
        try {
            const games = selectRandomGames()
            setSelectedGames(games)

            const response = await fetch('http://localhost:8000/api/v1/stress/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, baseline_stress: 50 })
            })

            if (!response.ok) throw new Error('Failed to create session')

            const data = await response.json()
            setSessionId(data.session_id)
            setCurrentGameIndex(0)
            setGameStarted(true)

            setTimeout(() => {
                if (faceTrackingRef.current) faceTrackingRef.current.startTracking()
            }, 500)
        } catch (error) {
            console.error('Error starting session:', error)
            alert('Failed to start session: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGameComplete = async (gameData, index) => {
        if (completedGames.has(index)) return

        try {
            await fetch(`http://localhost:8000/api/v1/stress/session/${sessionId}/game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_name: selectedGames[index].name,
                    game_number: index + 1,
                    score: gameData.score || 0,
                    duration: gameData.duration || 0,
                    face_data: JSON.stringify(gameData.faceData || {}),
                    stress_scores: JSON.stringify(stressData),
                    avg_stress: stressData.length > 0 ? stressData.reduce((a, b) => a + b, 0) / stressData.length : 50,
                    max_stress: stressData.length > 0 ? Math.max(...stressData) : 50,
                    min_stress: stressData.length > 0 ? Math.min(...stressData) : 50
                })
            })

            setCompletedGames(prev => new Set([...prev, index]))
            setStressData([])

            if (index < selectedGames.length - 1) {
                const nextSection = document.getElementById(`game-section-${index + 1}`)
                if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' })
            } else {
                const footerSection = document.getElementById('footer-section')
                if (footerSection) footerSection.scrollIntoView({ behavior: 'smooth' })
                await completeSession()
            }
        } catch (error) {
            console.error('Error saving game data:', error)
        }
    }

    const completeSession = async () => {
        try {
            await fetch(`http://localhost:8000/api/v1/stress/session/${sessionId}/complete`, {
                method: 'POST'
            })
            if (faceTrackingRef.current) faceTrackingRef.current.stopTracking()
            router.push(`/report?session=${sessionId}`)
        } catch (error) {
            console.error('Error completing session:', error)
            router.push(`/report?session=${sessionId}`)
        }
    }

    const handleStressUpdate = (stressScore) => {
        setCurrentStress(stressScore)
        setStressData(prev => {
            const newData = [...prev, stressScore]
            if (newData.length > 50) return newData.slice(newData.length - 50)
            return newData
        })
    }

    if (!user) return <div className="flex h-screen items-center justify-center">Loading user data...</div>

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-xl w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mb-2">
                            🧠
                        </div>
                        <CardTitle className="text-3xl">Cognitive Assessment</CardTitle>
                        <p className="text-muted-foreground">
                            You are about to begin a session consisting of 4 random cognitive tasks.
                            During this session, your facial expressions will be analyzed to monitor stress levels.
                        </p>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
                            <strong>Privacy Notice:</strong> Camera data is processed locally for stress analysis and is not stored permanently.
                        </div>
                        <Button
                            size="lg"
                            onClick={startSession}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Initializing Environment...' : 'Begin Session'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-screen w-screen bg-slate-100 overflow-hidden p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4 h-full w-full max-w-7xl mx-auto">

                {/* 1. Game Container */}
                <Card className="col-span-1 row-span-1 md:row-span-2 flex flex-col overflow-hidden border-2 border-primary/10">
                    <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                        <div className="font-semibold flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Active Task
                        </div>
                        <span className="text-xs font-mono bg-primary/10 px-2 py-1 rounded text-primary">
                            Step {(currentGameIndex || 0) + 1}/4
                        </span>
                    </div>

                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-none"
                    >
                        {selectedGames.map((Game, idx) => {
                            const GameComponent = Game.component
                            const isCompleted = completedGames.has(idx)
                            return (
                                <div
                                    key={idx}
                                    data-index={idx}
                                    id={`game-section-${idx}`}
                                    className="game-snap-section h-full w-full flex flex-col snap-start p-6"
                                >
                                    <h3 className="text-2xl font-bold mb-2">{Game.name}</h3>
                                    <div className={cn(
                                        "flex-1 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative",
                                        isCompleted && "opacity-50 grayscale pointer-events-none"
                                    )}>
                                        <GameComponent onComplete={(data) => handleGameComplete(data, idx)} />

                                        {isCompleted && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                                                <span className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-lg border border-green-200">
                                                    Task Completed
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        <div
                            id="footer-section"
                            className="game-snap-section h-full w-full flex items-center justify-center snap-start"
                        >
                            <div className="text-center">
                                <h2 className="text-3xl font-bold mb-4">Assessment Complete</h2>
                                <Button onClick={completeSession} size="lg">Generate Report</Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Face Tracking Feed */}
                <Card className="col-span-1 row-span-1 flex flex-col overflow-hidden">
                    <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                        <span className="text-sm font-semibold">Video Stream</span>
                        <span className="text-xs text-muted-foreground">Processing Active</span>
                    </div>
                    <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                        <FaceTracking ref={faceTrackingRef} onStressUpdate={handleStressUpdate} />
                        <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 text-white text-xs rounded font-mono">
                            LIVE
                        </div>
                    </div>
                </Card>

                {/* 3. Analytics Panel */}
                <div className="col-span-1 row-span-1 grid grid-cols-2 gap-4">
                    <Card className="flex flex-col justify-center items-center p-6">
                        <p className="text-sm text-muted-foreground mb-1">Current Stress</p>
                        <div className={cn(
                            "text-5xl font-bold",
                            !currentStress ? "text-muted" :
                                currentStress < 30 ? "text-emerald-500" :
                                    currentStress < 70 ? "text-amber-500" : "text-red-500"
                        )}>
                            {currentStress ? Math.round(currentStress) : '--'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Index (0-100)</p>
                    </Card>

                    <Card className="flex flex-col p-4 relative overflow-hidden">
                        <p className="text-sm font-semibold mb-2">Real-time Trend</p>
                        <div className="flex-1 flex items-end gap-1">
                            {stressData.slice(-20).map((val, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-primary/20 rounded-t-sm"
                                    style={{ height: `${val}%` }}
                                ></div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
