'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const ALL_GAMES = [
    { id: 1, name: 'Reaction Time', component: ReactionTimeGame, emoji: '⚡', description: 'Click as fast as you can when the color changes.' },
    { id: 2, name: 'Memory Match', component: MemoryMatchGame, emoji: '🧠', description: 'Find matching pairs of cards.' },
    { id: 3, name: 'Pattern Recognition', component: PatternRecognitionGame, emoji: '🔷', description: 'Repeat the pattern shown to you.' },
    { id: 4, name: 'Color Stroop', component: ColorStroopGame, emoji: '🎨', description: 'Select the color of the text, not the word.' },
    { id: 5, name: 'Number Sequence', component: NumberSequenceGame, emoji: '🔢', description: 'Enter the missing number in the sequence.' },
    { id: 6, name: 'Maze Navigator', component: MazeNavigatorGame, emoji: '🗺️', description: 'Navigate to the exit without hitting walls.' },
    { id: 7, name: 'Whack-a-Mole', component: WhackAMoleGame, emoji: '🔨', description: 'Hit the targets as they appear.' },
    { id: 8, name: 'Puzzle Slider', component: PuzzleSliderGame, emoji: '🧩', description: 'Slide tiles to form the correct image.' },
    { id: 9, name: 'Focus Tracker', component: FocusTrackerGame, emoji: '🎯', description: 'Keep your mouse on the moving target.' },
    { id: 10, name: 'Breathing Exercise', component: BreathingExerciseGame, emoji: '🧘', description: 'Follow the breathing accumulation rhythm.' }
]

export default function PlayPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [sessionId, setSessionId] = useState(null)
    const [currentGameIndex, setCurrentGameIndex] = useState(-1) // -1 means not started
    const [selectedGames, setSelectedGames] = useState([])
    const [stressData, setStressData] = useState([])
    const [currentStress, setCurrentStress] = useState(null)
    const [loading, setLoading] = useState(false)
    const [gameState, setGameState] = useState('intro') // intro, playing, transition, completed

    const faceTrackingRef = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }
        setUser(JSON.parse(userData))
    }, [router])

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
            setGameState('playing')

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

    const handleGameComplete = async (gameData) => {
        setGameState('saving')
        try {
            const currentGame = selectedGames[currentGameIndex]

            await fetch(`http://localhost:8000/api/v1/stress/session/${sessionId}/game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_name: currentGame.name,
                    game_number: currentGameIndex + 1,
                    score: gameData.score || 0,
                    duration: gameData.duration || 0,
                    face_data: JSON.stringify(gameData.faceData || {}),
                    stress_scores: JSON.stringify(stressData.slice(-50)), // optimize payload
                    avg_stress: stressData.length > 0 ? stressData.reduce((a, b) => a + b, 0) / stressData.length : 50,
                    max_stress: stressData.length > 0 ? Math.max(...stressData) : 50,
                    min_stress: stressData.length > 0 ? Math.min(...stressData) : 50
                })
            })

            if (currentGameIndex < selectedGames.length - 1) {
                setGameState('transition')
            } else {
                setGameState('completed')
                await completeSession()
            }
        } catch (error) {
            console.error('Error saving game data:', error)
            // Proceed anyway to not block user
            if (currentGameIndex < selectedGames.length - 1) {
                setGameState('transition')
            } else {
                setGameState('completed')
            }
        }
    }

    const proceedToNextGame = () => {
        setCurrentGameIndex(prev => prev + 1)
        setGameState('playing')
        setStressData([]) // Reset stress trend for new game context? Or keep it? keeping it continuous might be better, but clearing strictly for game analysis makes sense. Let's keep continuous for the user view.
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
            if (newData.length > 30) return newData.slice(newData.length - 30)
            return newData
        })
    }

    // Chart Configuration
    const chartData = {
        labels: stressData.map((_, i) => i),
        datasets: [
            {
                label: 'Stress Level',
                data: stressData,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)');
                    return gradient;
                },
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        scales: {
            x: { display: false },
            y: {
                display: false,
                min: 0,
                max: 100
            }
        },
        animation: {
            duration: 0
        },
        maintainAspectRatio: false
    }

    if (!user) return <div className="flex h-screen items-center justify-center">Loading...</div>

    if (gameState === 'intro') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-xl w-full border-2 border-indigo-100 shadow-xl">
                    <CardHeader className="text-center pb-8 border-b bg-indigo-50/30">
                        <div className="mx-auto w-16 h-16 bg-white shadow-sm border border-indigo-100 rounded-2xl flex items-center justify-center text-3xl mb-4 text-indigo-600">
                            🧠
                        </div>
                        <CardTitle className="text-3xl font-bold text-slate-900">Cognitive Stress Assessment</CardTitle>
                        <p className="text-slate-500 mt-2 text-lg">
                            Evaluate your mental performance and stress response through 4 rapid-fire cognitive challenges.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-8 flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                <div className="text-2xl mb-1">📷</div>
                                <div className="font-semibold text-slate-700">Facial Analysis</div>
                                <div className="text-xs text-slate-500">Real-time expression tracking</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                <div className="text-2xl mb-1">🎮</div>
                                <div className="font-semibold text-slate-700">4 Mini-Games</div>
                                <div className="text-xs text-slate-500">Memory, Focus, & Reaction</div>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            onClick={startSession}
                            disabled={loading}
                            className="w-full text-lg h-14 shadow-lg shadow-indigo-200"
                        >
                            {loading ? 'Initializing Environment...' : 'Start Assessment Session'}
                        </Button>
                        <p className="text-center text-xs text-slate-400">
                            Grant camera access when prompted • Results processed locally
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const ActiveGame = selectedGames[currentGameIndex]?.component

    return (
        <div className="h-screen w-screen bg-slate-100 overflow-hidden p-4 md:p-6 lg:p-8 flex gap-6">

            {/* LEFT COLUMN: GAME AREA */}
            <div className="flex-1 flex flex-col h-full gap-6">

                {/* Header / Progress */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl">
                            {selectedGames[currentGameIndex]?.emoji}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">{selectedGames[currentGameIndex]?.name}</h2>
                            <p className="text-xs text-slate-500">{selectedGames[currentGameIndex]?.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            {selectedGames.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-3 h-3 rounded-full transition-all",
                                        i === currentGameIndex ? "bg-indigo-600 scale-125" :
                                            i < currentGameIndex ? "bg-emerald-500" : "bg-slate-200"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-mono text-slate-500"> Step {currentGameIndex + 1}/4 </span>
                    </div>
                </div>

                {/* GAME CONTAINER */}
                <div className="flex-1 relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
                    {gameState === 'playing' && ActiveGame && (
                        <div className="flex-1 flex flex-col">
                            <ActiveGame onComplete={handleGameComplete} />
                        </div>
                    )}

                    {gameState === 'transition' && (
                        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm border border-emerald-200">
                                ✓
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Task Completed!</h2>
                            <p className="text-slate-500 mb-6">Take a deep breath...</p>
                            <Button onClick={proceedToNextGame} size="lg" className="w-48 shadow-lg shadow-indigo-200">
                                Next Challenge →
                            </Button>
                        </div>
                    )}

                    {gameState === 'saving' && (
                        <div className="absolute inset-0 z-30 bg-black/5 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <span className="font-medium text-slate-700">Saving Results...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: METRICS */}
            <div className="w-[320px] flex flex-col gap-6">

                {/* Camera Feed */}
                <Card className="overflow-hidden border-2 border-indigo-100 shadow-md">
                    <CardHeader className="p-3 bg-slate-50 border-b flex flex-row justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Analysis</span>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </CardHeader>
                    <div className="aspect-[4/3] bg-black relative">
                        <FaceTracking ref={faceTrackingRef} onStressUpdate={handleStressUpdate} />
                    </div>
                </Card>

                {/* Real-time Stress Graph */}
                <Card className="flex-1 flex flex-col shadow-md border-slate-200">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="text-sm font-bold text-slate-700 flex justify-between">
                            <span>Stress Index</span>
                            <span className={cn(
                                "text-lg",
                                !currentStress ? "text-slate-400" :
                                    currentStress < 40 ? "text-emerald-500" :
                                        currentStress < 70 ? "text-amber-500" : "text-red-500"
                            )}>
                                {currentStress ? Math.round(currentStress) : '--'}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative min-h-[150px]">
                        <div className="absolute inset-0 p-4">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200">
                    <CardContent className="p-6">
                        <div className="text-xs opacity-70 mb-1 uppercase tracking-wider font-semibold">Session Status</div>
                        <div className="font-medium text-lg">Recording High-Res Biometrics</div>
                        <div className="mt-4 flex gap-2">
                            <span className="px-2 py-1 bg-white/20 rounded text-xs">👀 Gaze</span>
                            <span className="px-2 py-1 bg-white/20 rounded text-xs">😐 Micro-expressions</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
