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
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[var(--bg-primary)] via-white to-[var(--bg-secondary)]">
            {/* Background Effects */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">
                <div className="w-[1200px] h-[800px] bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full blur-[180px] opacity-60"></div>
            </div>

            {/* Navbar */}
            <nav className="w-full px-4 py-6 flex justify-center border-b border-primary/5">
                <div className="w-full max-w-6xl flex justify-between items-center">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        ZenithMind<span className="text-primary">.AI</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/login')} className="btn btn-secondary text-sm font-medium">Log In</button>
                        <button onClick={() => router.push('/register')} className="btn btn-primary text-sm font-medium">Sign Up</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 w-full">
                <div className="w-full max-w-3xl mx-auto text-center animate-fade-in">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-dark text-sm font-medium animate-fade-in">
                        ✨ Next Generation Mental Health Monitoring
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight text-primary-dark">
                        Master Your <br />
                        <span className="gradient-text">Stress Levels</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
                        Precision real-time stress detection powered by <span className="text-primary font-semibold">AI facial analysis</span>.<br />
                        Monitor, analyze, and improve your cognitive health through interactive gameplay.
                    </p>

                    <div className="flex gap-6 justify-center flex-wrap mb-8">
                        <button
                            onClick={() => router.push('/register')}
                            className="btn btn-primary text-lg px-8 py-3 rounded-full shadow-glow hover:shadow-glow-lg transition-all transform hover:-translate-y-1"
                        >
                            Start Free Assessment
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="btn btn-secondary text-lg px-8 py-3 rounded-full"
                        >
                            Access Dashboard
                        </button>
                    </div>

                    {/* Features Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="text-3xl font-bold text-primary mb-1">98%</div>
                            <div className="text-sm text-text-muted uppercase tracking-widest">Accuracy</div>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="text-3xl font-bold text-primary mb-1">10+</div>
                            <div className="text-sm text-text-muted uppercase tracking-widest">Cognitive Games</div>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="text-3xl font-bold text-primary mb-1">Real-time</div>
                            <div className="text-sm text-text-muted uppercase tracking-widest">Analysis</div>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="text-3xl font-bold text-primary mb-1">AI</div>
                            <div className="text-sm text-text-muted uppercase tracking-widest">Powered</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Games Preview Grid */}

            {/* Science-Based Gamification */}
            <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[var(--bg-tertiary)]/20">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-primary-dark">Science-Based Gamification</h2>
                        <p className="text-text-secondary">Engage your mind while our AI works in the background.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[
                            { name: 'Reaction Time', emoji: '⚡', color: 'from-yellow-400/15 to-orange-400/15' },
                            { name: 'Memory Match', emoji: '🧠', color: 'from-pink-400/15 to-rose-400/15' },
                            { name: 'Pattern Rec.', emoji: '🔷', color: 'from-blue-400/15 to-primary/15' },
                            { name: 'Color Stroop', emoji: '🎨', color: 'from-purple-400/15 to-indigo-400/15' },
                            { name: 'Sequence', emoji: '🔢', color: 'from-green-400/15 to-emerald-400/15' },
                            { name: 'Maze Nav', emoji: '🗺️', color: 'from-teal-400/15 to-green-400/15' },
                            { name: 'Whack-a-Mole', emoji: '🔨', color: 'from-red-400/15 to-orange-400/15' },
                            { name: 'Puzzle Slider', emoji: '🧩', color: 'from-indigo-400/15 to-blue-400/15' },
                            { name: 'Focus Tracker', emoji: '🎯', color: 'from-fuchsia-400/15 to-pink-400/15' },
                            { name: 'Breathing', emoji: '🧘', color: 'from-sky-400/15 to-blue-400/15' }
                        ].map((game, idx) => (
                            <div key={idx} className={`group card text-center p-6 bg-gradient-to-br ${game.color} border border-primary/10 hover:border-primary/30 transition-all cursor-default rounded-lg`}>
                                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{game.emoji}</div>
                                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">{game.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-4 border-t border-primary/10 text-center bg-white/50">
                <p className="text-text-muted text-sm">
                    &copy; 2026 ZenithMind AI. All rights reserved. <br />
                    <span className="opacity-50 mt-2 inline-block">Advanced Stress Detection Technology</span>
                </p>
            </footer>
        </div>
    )
}
