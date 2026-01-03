'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

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

    // Refs
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

    // Handle intersection observer to detect active game in the scroll view
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
            {
                root: scrollContainerRef.current,
                threshold: 0.6 // Game is "active" when 60% visible
            }
        )

        // Only observe if game has started and elements exist
        if (gameStarted) {
            // Slight delay to ensure DOM is ready
            setTimeout(() => {
                const sections = document.querySelectorAll('.game-snap-section')
                sections.forEach((section) => observer.observe(section))
            }, 100)
        }

        return () => observer.disconnect()
    }, [selectedGames, gameStarted])

    const selectRandomGames = () => {
        // Shuffle array using Fisher-Yates algorithm for true randomness
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
            // Select 4 random games
            const games = selectRandomGames()
            setSelectedGames(games)

            // Create session
            const response = await fetch('http://localhost:8000/api/v1/stress/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    baseline_stress: 50
                })
            })

            if (!response.ok) {
                throw new Error('Failed to create session')
            }

            const data = await response.json()
            setSessionId(data.session_id)
            setCurrentGameIndex(0)
            setGameStarted(true)

            // Start face tracking
            setTimeout(() => {
                if (faceTrackingRef.current) {
                    faceTrackingRef.current.startTracking()
                }
            }, 500)
        } catch (error) {
            console.error('Error starting session:', error)
            alert('Failed to start session: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGameComplete = async (gameData, index) => {
        if (completedGames.has(index)) return // Prevent double submission

        try {
            // Save game data
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

            // Mark as complete and reset stress data for next game
            setCompletedGames(prev => new Set([...prev, index]))
            setStressData([])

            // Visual feedback - auto scroll to next if available
            if (index < selectedGames.length - 1) {
                const nextSection = document.getElementById(`game-section-${index + 1}`)
                if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' })
                }
            } else {
                const footerSection = document.getElementById('footer-section')
                if (footerSection) {
                    footerSection.scrollIntoView({ behavior: 'smooth' })
                }
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

            // Stop face tracking
            if (faceTrackingRef.current) {
                faceTrackingRef.current.stopTracking()
            }

            // Redirect to report
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
            // Keep only last 50 points for graph to be performant
            if (newData.length > 50) return newData.slice(newData.length - 50)
            return newData
        })
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] flex items-center justify-center text-text-primary">
                <div className="text-2xl font-semibold animate-pulse">Loading...</div>
            </div>
        )
    }

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-white to-[var(--bg-secondary)] flex items-center justify-center p-4">
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">
                    <div className="w-[1000px] h-[700px] bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full blur-[150px] opacity-50"></div>
                </div>
                <div className="bg-white p-12 rounded-2xl shadow-lg max-w-2xl w-full text-center border border-primary/10">
                    <h1 className="text-5xl font-bold mb-6 gradient-text">
                        Ready for Analysis?
                    </h1>
                    <p className="text-xl text-text-secondary mb-10 leading-relaxed">
                        We have prepared diverse cognitive challenges.
                        Please allow camera access for real-time stress monitoring.
                    </p>
                    <button
                        onClick={startSession}
                        disabled={loading}
                        className="btn btn-primary text-xl font-bold py-4 px-12 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                        {loading ? 'Initializing AI...' : 'Start Session'}
                    </button>
                    <div className="mt-8 text-sm text-text-muted">
                        Session ID: <span className="font-mono text-primary">#{Date.now().toString().slice(-6)}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] text-text-primary overflow-hidden p-4 font-sans">
            {/* 2x2 Grid Container */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full w-full">

                {/* 1. TOP-LEFT: Game Scroll Viewport */}
                <div className="col-span-1 row-span-1 bg-white rounded-2xl border border-primary/10 relative overflow-hidden flex flex-col shadow-lg">
                    <div className="absolute top-0 left-0 right-0 p-4 bg-white/95 backdrop-blur z-20 border-b border-primary/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-primary-dark flex items-center gap-2">
                            <span>🎮</span> Active Challenge
                        </h2>
                        <span className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full border border-primary/20">
                            Game {(currentGameIndex || 0) + 1} / 4
                        </span>
                    </div>

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto scrollbar-hide pt-16"
                        style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
                    >
                        {selectedGames.map((Game, idx) => {
                            const GameComponent = Game.component
                            const isCompleted = completedGames.has(idx)
                            return (
                                <div
                                    key={idx}
                                    data-index={idx}
                                    id={`game-section-${idx}`}
                                    className="game-snap-section h-full w-full flex flex-col relative"
                                    style={{ scrollSnapAlign: 'start', minHeight: '100%' }}
                                >
                                    <div className={`flex-1 p-6 flex flex-col ${isCompleted ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                        <div className="mb-4">
                                            <h3 className="text-3xl font-bold text-primary-dark mb-1">{Game.name}</h3>
                                            <p className="text-text-secondary text-sm">Task: Complete the objective as fast as possible.</p>
                                        </div>

                                        <div className="flex-1 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/15 overflow-hidden relative">
                                            {GameComponent && (
                                                <GameComponent onComplete={(data) => handleGameComplete(data, idx)} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Completed Overlay */}
                                    {isCompleted && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-10 transition-all duration-500">
                                            <div className="bg-success text-white font-black text-2xl px-6 py-3 rounded-xl transform -rotate-6 shadow-lg border-4 border-white/30">
                                                COMPLETED!
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Footer / Completion Slide */}
                        <div
                            id="footer-section"
                            className="game-snap-section h-full w-full flex items-center justify-center"
                            style={{ scrollSnapAlign: 'start', minHeight: '100%' }}
                        >
                            <div className="text-center p-8 animate-fade-in">
                                <div className="text-8xl mb-6">🏆</div>
                                <h2 className="text-4xl font-bold mb-4 text-primary-dark">Session Complete</h2>
                                <p className="text-xl text-text-secondary mb-8">Great work! Your analysis is ready.</p>
                                <button
                                    onClick={completeSession}
                                    className="btn btn-primary px-12 py-4 rounded-xl font-bold text-xl hover:shadow-glow transition-all"
                                >
                                    View Final Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TOP-RIGHT: Camera Feed */}
                <div className="col-span-1 row-span-1 bg-white rounded-2xl border border-primary/10 overflow-hidden relative flex flex-col shadow-lg">
                    <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-white">
                        <h2 className="text-lg font-bold text-primary-dark flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Live Camera Output
                        </h2>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
                            <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
                        </div>
                    </div>
                    <div className="flex-1 relative bg-white/50 flex items-center justify-center overflow-hidden group">
                        <FaceTracking
                            ref={faceTrackingRef}
                            onStressUpdate={handleStressUpdate}
                        />

                        {/* Camera Overlay UI - Tech Corners */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
                            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/40 rounded-tr-lg"></div>
                            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-blue-500/50 rounded-bl-lg"></div>
                            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-blue-500/50 rounded-br-lg"></div>

                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-blue-300 shadow-lg">
                                AI TRACKING ACTIVE
                            </div>

                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/5 rounded-full animate-ping opacity-20"></div>
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM-LEFT: Stress Graph */}
                <div className="col-span-1 row-span-1 bg-[#16213e] rounded-3xl border border-[#0f3460] p-6 flex flex-col shadow-2xl relative overflow-hidden">
                    <h2 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2 z-10">
                        <span className="text-blue-400">📊</span> Real-time Stress Analysis
                    </h2>

                    <div className="flex-1 relative bg-[#0f3460]/20 rounded-xl border border-white/5 overflow-hidden">
                        {stressData.length > 0 ? (
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="stressGradientArea" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>
                                {/* Area Path */}
                                <path
                                    d={`M0,100 ` + stressData.map((s, i) =>
                                        `L${(i / Math.max(stressData.length - 1, 1)) * 100},${100 - s}`
                                    ).join(' ') + ` L100,100 Z`}
                                    fill="url(#stressGradientArea)"
                                />
                                {/* Line Path */}
                                <polyline
                                    points={stressData.map((stress, i) =>
                                        `${(i / Math.max(stressData.length - 1, 1)) * 100},${100 - stress}`
                                    ).join(' ')}
                                    fill="none"
                                    stroke="#6366f1"
                                    strokeWidth="3"
                                    vectorEffect="non-scaling-stroke"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-gray-500 font-mono text-xs">
                                <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 animate-spin opacity-50"></div>
                                WAITING FOR DATA STREAM...
                            </div>
                        )}

                        {/* Grid Lines */}
                        <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
                            <div className="border-b border-white/5"></div>
                            <div className="border-b border-white/5"></div>
                            <div className="border-b border-white/5"></div>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500 font-mono">
                        <span>0s</span>
                        <span>-30s</span>
                    </div>
                </div>

                {/* 4. BOTTOM-RIGHT: Stats & Progress */}
                <div className="col-span-1 row-span-1 bg-[#16213e] rounded-3xl border border-[#0f3460] p-6 flex flex-col shadow-2xl">
                    <h2 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                        <span className="text-purple-400">📈</span> Session Statistics
                    </h2>

                    <div className="grid grid-cols-2 gap-4 flex-1">
                        {/* Current Stress Card */}
                        <div className="bg-[#0f3460]/40 rounded-xl p-4 border border-white/5 flex flex-col justify-center items-center">
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-bold">Current Stress</div>
                            <div className={`text-5xl font-black ${currentStress < 30 ? 'text-[#10b981]' :
                                    currentStress < 70 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                                }`}>
                                {currentStress ? Math.round(currentStress) : '--'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Scale 0-100</div>
                        </div>

                        {/* Games Completed Card */}
                        <div className="bg-[#0f3460]/40 rounded-xl p-4 border border-white/5 flex flex-col justify-center items-center">
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-bold">Completed</div>
                            <div className="text-5xl font-black text-blue-400">
                                {completedGames.size} <span className="text-2xl text-gray-500 font-normal">/ 4</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Challenges</div>
                        </div>

                        {/* Progress Bar */}
                        <div className="col-span-2 bg-[#0f3460]/40 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                            <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase">
                                <span>Session Progress</span>
                                <span>{Math.round((completedGames.size / 4) * 100)}%</span>
                            </div>
                            <div className="h-4 bg-[#1a1a2e] rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 relative"
                                    style={{ width: `${(completedGames.size / 4) * 100}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
