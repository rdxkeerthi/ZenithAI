'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

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

    const avgStress = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.avg_stress || 0), 0) / sessions.length
        : 0

    const getStressLevel = (stress) => {
        if (stress < 30) return { label: 'Optimal', color: 'text-emerald-600', badgeInfo: 'bg-emerald-100/50 text-emerald-800' }
        if (stress < 70) return { label: 'Moderate', color: 'text-amber-600', badgeInfo: 'bg-amber-100/50 text-amber-800' }
        return { label: 'High', color: 'text-red-600', badgeInfo: 'bg-red-100/50 text-red-800' }
    }

    const overallStatus = getStressLevel(avgStress)
    const wellnessScore = Math.max(0, 100 - avgStress)

    if (!user) return null

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Overview</h2>
                    <p className="text-lg text-slate-500">Welcome back, {user.name}. Here are your latest health metrics.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card variant="glass" className="animate-slide-up border-l-4 border-l-indigo-500" style={{ animationDelay: '100ms' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                            <span className="text-2xl animate-bounce-slow">📊</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-slate-800">
                                <AnimatedCounter value={sessions.length} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Lifetime assessments</p>
                        </CardContent>
                    </Card>
                    <Card variant="glass" className="animate-slide-up border-l-4 border-l-amber-500" style={{ animationDelay: '200ms' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Stress Level</CardTitle>
                            <span className="text-2xl animate-pulse-slow">🧠</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-slate-800">
                                <AnimatedCounter value={avgStress} />
                            </div>
                            <p className={`text-xs ${overallStatus.color} font-medium mt-1`}>{overallStatus.label} range</p>
                        </CardContent>
                    </Card>
                    <Card variant="glass" className="animate-slide-up border-l-4 border-l-emerald-500" style={{ animationDelay: '300ms' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
                            <span className="text-2xl animate-beat">❤️</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-emerald-600">
                                <AnimatedCounter value={wellnessScore} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Based on recent activity</p>
                        </CardContent>
                    </Card>
                    <Card variant="glass" className="animate-slide-up border-l-4 border-l-blue-500" style={{ animationDelay: '400ms' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <span className="text-2xl animate-spin-slow">⚡</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Online</div>
                            <p className="text-xs text-muted-foreground mt-1">AI models ready</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Main Action - Start New Session */}
                    <Card variant="vibrant" className="col-span-4 animate-slide-up relative overflow-hidden group" style={{ animationDelay: '500ms' }}>

                        {/* Abstract shapes for visual interest */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                        <CardHeader className="relative z-10">
                            <CardTitle className="text-3xl text-slate-800">Start New Assessment</CardTitle>
                            <CardDescription className="text-slate-600 text-lg">
                                Begin a 4-game cognitive sequence to measure your current stress levels.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-4">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto text-lg h-14 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                onClick={() => router.push('/play')}
                            >
                                Launch Session
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent History */}
                    <Card variant="glass" className="col-span-3 animate-slide-up" style={{ animationDelay: '600ms' }}>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your last 3 stress assessment results.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-sm text-muted-foreground animate-pulse">Loading history...</div>
                                ) : sessions.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No sessions recorded yet.</div>
                                ) : (
                                    sessions.slice(0, 5).map((session, i) => (
                                        <div
                                            key={session.id}
                                            onClick={() => router.push(`/report?session=${session.id}`)}
                                            className="group flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-indigo-50/50 p-2 rounded-lg transition-all"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold leading-none text-slate-800 group-hover:text-indigo-600 transition-colors">Assessment #{session.id.toString().slice(-3)}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(session.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`text-sm font-bold px-3 py-1 rounded-full ${getStressLevel(session.avg_stress).badgeInfo}`}>
                                                {session.avg_stress?.toFixed(0)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
