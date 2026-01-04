'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function ReportContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session')

    const [report, setReport] = useState(null)
    const [sessionData, setSessionData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!sessionId) {
            router.push('/dashboard')
            return
        }
        fetchReport()
    }, [sessionId, router])

    const fetchReport = async () => {
        try {
            // Fetch session data first
            const sessionResponse = await fetch(
                `http://localhost:8000/api/v1/stress/session/${sessionId}`
            )

            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json()
                setSessionData(sessionData)
            }

            // Generate report if not exists
            const generateResponse = await fetch(
                `http://localhost:8000/api/v1/reports/generate/${sessionId}`,
                { method: 'POST' }
            )

            if (!generateResponse.ok) {
                // Try to fetch existing report
                const fetchResponse = await fetch(
                    `http://localhost:8000/api/v1/reports/session/${sessionId}/report`
                )

                if (!fetchResponse.ok) {
                    throw new Error('Failed to load report')
                }

                const data = await fetchResponse.json()
                setReport(data)
            } else {
                const data = await generateResponse.json()
                setReport(data)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const downloadPDF = async () => {
        try {
            const response = await fetch(
                `http://localhost:8000/api/v1/reports/${report.id}/pdf`
            )
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `stress_report_${report.id}_${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Error downloading PDF:', error)
            alert('Failed to download PDF')
        }
    }

    const parseJSON = (str) => {
        try {
            return JSON.parse(str)
        } catch {
            return []
        }
    }

    const getStressColor = (level) => {
        if (level === 'Low') return 'text-emerald-600 bg-emerald-100'
        if (level === 'Medium') return 'text-amber-600 bg-amber-100'
        return 'text-red-600 bg-red-100'
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="text-muted-foreground">Generating comprehensive report...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex bg-red-50 p-4 rounded-md text-red-900 items-center justify-between">
                <div>
                    <h3 className="font-bold">Error Loading Report</h3>
                    <p>{error}</p>
                </div>
                <Button onClick={() => router.push('/dashboard')} variant="destructive">Return to Dashboard</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Stress Analysis Report</h1>
                    <p className="text-muted-foreground">
                        Session #{sessionId} • {new Date(report.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={downloadPDF} variant="outline">
                        Download PDF
                    </Button>
                    <Button onClick={() => router.push('/dashboard')}>
                        Return to Dashboard
                    </Button>
                </div>
            </div>

            {/* Overall Assessment */}
            <Card>
                <CardHeader>
                    <CardTitle>Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Stress Score</p>
                        <p className="text-4xl font-bold text-primary">{report.overall_stress.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">/ 100</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Stress Level</p>
                        <span className={cn("px-3 py-1 rounded-full text-sm font-semibold inline-block my-2", getStressColor(report.stress_level))}>
                            {report.stress_level}
                        </span>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Trend</p>
                        <p className="text-2xl font-semibold my-2">
                            {report.stress_trend === 'Increasing' ? '📈 Increasing' :
                                report.stress_trend === 'Decreasing' ? '📉 Decreasing' : '➡️ Stable'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Game Performance */}
            {sessionData?.games?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Session Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sessionData.games.map((game, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="mb-2 sm:mb-0">
                                        <p className="font-semibold">{game.game_name}</p>
                                        <p className="text-xs text-muted-foreground">Duration: {game.duration.toFixed(1)}s</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-8 text-sm">
                                        <div className="text-center">
                                            <p className="text-muted-foreground text-xs">Score</p>
                                            <p className="font-medium">{game.score.toFixed(0)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground text-xs">Avg Stress</p>
                                            <p className="font-medium">{game.avg_stress.toFixed(1)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground text-xs">Peak</p>
                                            <p className="font-medium">{game.max_stress.toFixed(1)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecommendationCard title="Recommended Activities" icon="🌳" items={parseJSON(report.activities)} />
                <RecommendationCard title="Workout Plan" icon="💪" items={parseJSON(report.workouts)} />
                <RecommendationCard title="Meditation" icon="🧘" items={parseJSON(report.meditation)} />
                <RecommendationCard title="Nutrition" icon="🥗" items={parseJSON(report.food_control)} />
            </div>

            <div className="p-4 bg-yellow-50 text-yellow-900 rounded-lg border border-yellow-200 text-sm">
                <strong>Disclaimer:</strong> This report is AI-generated based on facial analysis. It is not a medical diagnosis. Please consult a healthcare professional for medical advice.
            </div>
        </div>
    )
}

function RecommendationCard({ title, icon, items }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <span className="text-xl">{icon}</span>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-sm">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="text-muted-foreground">{item}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}

export default function ReportPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<div>Loading Report...</div>}>
                <ReportContent />
            </Suspense>
        </DashboardLayout>
    )
}
