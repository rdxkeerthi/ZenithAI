'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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
        if (stress < 30) return { label: 'Optimal', color: 'text-emerald-600', badgeInfo: 'bg-emerald-100 text-emerald-800' }
        if (stress < 70) return { label: 'Moderate', color: 'text-amber-600', badgeInfo: 'bg-amber-100 text-amber-800' }
        return { label: 'High', color: 'text-red-600', badgeInfo: 'bg-red-100 text-red-800' }
    }

    const overallStatus = getStressLevel(avgStress)

    if (!user) return null

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground">Welcome back, {user.name}. Here are your latest health metrics.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                            <span className="text-2xl">📊</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sessions.length}</div>
                            <p className="text-xs text-muted-foreground">Lifetime assessments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Stress Level</CardTitle>
                            <span className="text-2xl">🧠</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgStress.toFixed(1)}</div>
                            <p className={`text-xs ${overallStatus.color} font-medium`}>{overallStatus.label} range</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
                            <span className="text-2xl">❤️</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.max(0, 100 - avgStress).toFixed(0)}</div>
                            <p className="text-xs text-muted-foreground">Based on recent activity</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
                            <span className="text-2xl">⚡</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Ready</div>
                            <p className="text-xs text-muted-foreground">System online</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Main Action - Start New Session */}
                    <Card className="col-span-4 bg-primary text-primary-foreground border-none">
                        <CardHeader>
                            <CardTitle className="text-2xl">Start New Assessment</CardTitle>
                            <CardDescription className="text-primary-foreground/80">
                                Begin a 4-game cognitive sequence to measure your current stress levels.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="w-full sm:w-auto"
                                onClick={() => router.push('/play')}
                            >
                                Launch Session
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent History */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your last 3 stress assessment results.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-sm text-muted-foreground">Loading history...</div>
                                ) : sessions.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No sessions recorded yet.</div>
                                ) : (
                                    sessions.slice(0, 5).map((session, i) => (
                                        <div key={session.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">Assessment #{session.id.toString().slice(-3)}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(session.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`text-sm font-medium px-2 py-1 rounded-full ${getStressLevel(session.avg_stress).badgeInfo}`}>
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
