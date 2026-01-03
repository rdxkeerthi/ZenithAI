'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        fetchSessions(parsedUser.id)
    }, [router])

    const fetchSessions = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/stress/user/${userId}/history`)
            if (response.ok) {
                const data = await response.json()
                setSessions(data)
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-xl font-semibold text-primary animate-pulse">LOADING SYSTEM...</div>
                </div>
            </div>
        )
    }

    const avgStress = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.avg_stress || 0), 0) / sessions.length
        : 0

    const getStressLevel = (stress) => {
        if (stress < 30) return { label: 'OPTIMAL', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
        if (stress < 70) return { label: 'MODERATE', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
        return { label: 'HIGH', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
    }

    const overallStatus = getStressLevel(avgStress)

    return (
        <div className="min-h-screen p-4 md:p-8 relative overflow-hidden bg-gradient-to-br from-[var(--bg-primary)] via-white to-[var(--bg-secondary)]">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/8 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/8 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-fade-in pb-6 border-b border-primary/10">
                    <div>
                        <div className="text-sm font-semibold text-primary mb-1 uppercase tracking-widest opacity-80">Welcome Back</div>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-dark tracking-tight">
                            {user.name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-xs text-text-muted uppercase tracking-wider">System Status</span>
                            <span className="text-success font-semibold text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                                ONLINE
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary px-6 py-2.5 rounded-lg border border-primary/15 hover:bg-primary/5 transition-all text-text-primary font-medium text-sm"
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>

                    {/* Primary Hero Action (Spans full width on mobile, 8 cols on desktop) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Start Session Card */}
                        <div
                            onClick={() => router.push('/play')}
                            className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 p-8 cursor-pointer hover:border-primary/50 transition-all duration-300 shadow-2xl min-h-[300px] flex flex-col justify-between"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/30 rounded-full blur-[80px] group-hover:bg-primary/40 transition-all"></div>

                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                                    Recommended Action
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 group-hover:translate-x-2 transition-transform">
                                    Start New Session
                                </h2>
                                <p className="text-lg text-gray-400 max-w-lg mb-8 group-hover:text-gray-200 transition-colors">
                                    Begin a 4-game cognitive sequence. Our AI will analyze your facial micro-expressions to determine baseline stress levels.
                                </p>
                            </div>

                            <div className="relative z-10 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-xl shadow-lg border border-white/20 group-hover:scale-110 transition-transform">
                                    ▶
                                </div>
                                <span className="text-white font-bold text-lg group-hover:text-primary-light transition-colors">Initiate Protocol</span>
                            </div>
                        </div>

                        {/* Recent History Feed */}
                        <div className="glass rounded-[1.5rem] p-6 flex-1 min-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span className="text-2xl">📜</span> Recent Logs
                                </h3>
                                <button className="text-sm text-primary hover:text-white transition-colors">View All Archive</button>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-white/10 rounded-2xl">
                                    <div className="text-4xl mb-3 opacity-30">📂</div>
                                    <p className="text-gray-500">No session data available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map((session) => {
                                        const sLevel = getStressLevel(session.avg_stress || 0)
                                        return (
                                            <div
                                                key={session.id}
                                                onClick={() => router.push(`/report?session=${session.id}`)}
                                                className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                                            >
                                                <div className="h-12 w-12 rounded-lg bg-black/40 flex items-center justify-center text-lg font-mono text-gray-400 border border-white/5">
                                                    #{session.id.toString().slice(-3)}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-400 mb-0.5">
                                                        {new Date(session.created_at).toLocaleDateString()} • {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="font-semibold text-gray-200">
                                                        Cognitive Assessment
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${sLevel.bg} ${sLevel.color} border ${sLevel.border}`}>
                                                        {sLevel.label}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Avg: {session.avg_stress?.toFixed(1) || '--'}
                                                    </span>
                                                </div>

                                                <div className="text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                                    →
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Stats Panel (4 Columns) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* User Profile Card */}
                        <div className="card bg-gradient-to-b from-gray-800 to-gray-900 !p-6 !border-white/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
                                    <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center text-2xl">
                                        👤
                                    </div>
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-white">{user?.name}</div>
                                    <div className="text-sm text-gray-400">{user?.email}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
                                    <span className="text-sm text-gray-400">Occupation</span>
                                    <span className="text-sm text-white font-medium">{user?.work_type || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
                                    <span className="text-sm text-gray-400">Daily Hours</span>
                                    <span className="text-sm text-white font-medium">{user?.working_hours || 0}h</span>
                                </div>
                            </div>
                        </div>

                        {/* Overall Stats */}
                        <div className="card !bg-gray-900/50 !backdrop-blur-xl !border-white/10 flex-1">
                            <h3 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-6">Aggregate Analytics</h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                                    <div className="text-3xl font-bold text-white mb-1">{sessions.length}</div>
                                    <div className="text-xs text-indigo-300">Total Sessions</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center">
                                    <div className={`text-3xl font-bold ${overallStatus.color}`}>
                                        {avgStress.toFixed(0)}
                                    </div>
                                    <div className="text-xs text-fuchsia-300">Avg Stress</div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center mb-6">
                                <div className="text-sm text-gray-400 mb-2">Primary Stress Indicator</div>
                                <div className={`text-xl font-bold ${overallStatus.color} flex items-center justify-center gap-2`}>
                                    <span className={`w-3 h-3 rounded-full ${overallStatus.bg.replace('/10', '')}`}></span>
                                    {overallStatus.label} LEVEL
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 text-center leading-relaxed">
                                Analysis based on {sessions.length} recorded sessions.
                                <br />Next update available after new session.
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}
