'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[150px] -z-10 opacity-50"></div>

            {/* Navbar */}
            <nav className="p-6">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-light">
                        ZenithMind<span className="text-primary">.AI</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => router.push('/login')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log In</button>
                        <button onClick={() => router.push('/register')} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium border border-white/10 transition-all">Sign Up</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center px-4 py-20 relative">
                <div className="container text-center animate-fade-in max-w-4xl mx-auto">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-medium animate-fade-in">
                        ✨ Next Generation Mental Health Monitoring
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-tight">
                        Master Your <br />
                        <span className="gradient-text">Stress Levels</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Precision real-time stress detection powered by <span className="text-white font-semibold">AI facial analysis</span>.
                        Monitor, analyze, and improve your cognitive health through interactive gameplay.
                    </p>

                    <div className="flex gap-6 justify-center flex-wrap">
                        <button
                            onClick={() => router.push('/register')}
                            className="btn btn-primary text-lg px-8 py-4 rounded-full shadow-glow hover:shadow-glow-lg transition-all transform hover:-translate-y-1"
                        >
                            Start Free Assessment
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="btn btn-secondary text-lg px-8 py-4 rounded-full backdrop-blur-md"
                        >
                            Access Dashboard
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Stats */}
            <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">98%</div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest">Accuracy</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">10+</div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest">Cognitive Games</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">Real-time</div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest">Analysis</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">AI</div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest">Powered</div>
                    </div>
                </div>
            </section>

            {/* Games Preview Grid */}
            <section className="py-24 px-4 bg-gradient-to-b from-transparent to-black/40">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Science-Based Gamification</h2>
                        <p className="text-gray-400">Engage your mind while our AI works in the background.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[
                            { name: 'Reaction Time', emoji: '⚡', color: 'from-yellow-500/20 to-orange-500/20' },
                            { name: 'Memory Match', emoji: '🧠', color: 'from-pink-500/20 to-rose-500/20' },
                            { name: 'Pattern Rec.', emoji: '🔷', color: 'from-blue-500/20 to-cyan-500/20' },
                            { name: 'Color Stroop', emoji: '🎨', color: 'from-purple-500/20 to-indigo-500/20' },
                            { name: 'Sequence', emoji: '🔢', color: 'from-green-500/20 to-emerald-500/20' },
                            { name: 'Maze Nav', emoji: '🗺️', color: 'from-teal-500/20 to-green-500/20' },
                            { name: 'Whack-a-Mole', emoji: '🔨', color: 'from-red-500/20 to-orange-500/20' },
                            { name: 'Puzzle Slider', emoji: '🧩', color: 'from-indigo-500/20 to-blue-500/20' },
                            { name: 'Focus Tracker', emoji: '🎯', color: 'from-fuchsia-500/20 to-pink-500/20' },
                            { name: 'Breathing', emoji: '🧘', color: 'from-sky-500/20 to-blue-500/20' }
                        ].map((game, idx) => (
                            <div key={idx} className={`group card text-center p-6 bg-gradient-to-br ${game.color} border-white/5 hover:border-white/20 transition-all cursor-default`}>
                                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{game.emoji}</div>
                                <h3 className="font-semibold text-gray-200 group-hover:text-white">{game.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-4 border-t border-white/5 text-center">
                <p className="text-gray-500 text-sm">
                    &copy; 2026 ZenithMind AI. All rights reserved. <br />
                    <span className="opacity-50 mt-2 inline-block">Advanced Stress Detection Technology</span>
                </p>
            </footer>
        </div>
    )
}
