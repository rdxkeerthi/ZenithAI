'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ReportPage() {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-white to-[var(--bg-secondary)] flex items-center justify-center">
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">
                    <div className="w-[1000px] h-[700px] bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full blur-[150px] opacity-50"></div>
                </div>
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🤖</div>
                    <div className="text-2xl font-bold mb-2 text-text-primary">Analyzing Your Session...</div>
                    <div className="text-text-muted">Generating personalized report</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg max-w-md w-full text-center p-8 border border-primary/10">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-danger text-xl mb-4 font-semibold">{error}</p>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-primary w-full font-bold rounded-lg">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    const parseJSON = (str) => {
        try {
            return JSON.parse(str)
        } catch {
            return []
        }
    }

    const getStressColor = (level) => {
        if (level === 'Low') return 'text-success'
        if (level === 'Medium') return 'text-warning'
        return 'text-danger'
    }

    const getTrendIcon = (trend) => {
        if (trend === 'Increasing') return '📈'
        if (trend === 'Decreasing') return '📉'
        return '➡️'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-white to-[var(--bg-secondary)] px-4 py-8">
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">
                <div className="w-[1000px] h-[700px] bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full blur-[150px] opacity-40"></div>
            </div>
            <div className="container max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">Stress Analysis Report</h1>
                        <p className="text-text-muted">
                            Session #{sessionId} • {new Date(report.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={downloadPDF} className="btn btn-primary flex-1 md:flex-none font-bold py-3 rounded-lg shadow-lg hover:shadow-glow">
                            📥 Download PDF
                        </button>
                        <button onClick={() => router.push('/dashboard')} className="btn btn-secondary">
                            Dashboard
                        </button>
                    </div>
                </div>

                {/* Overall Stress Assessment */}
                <div className="card mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Overall Stress Assessment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-tertiary rounded-lg">
                            <div className="text-sm text-muted mb-2">Stress Score</div>
                            <div className="text-6xl font-bold gradient-text mb-2">
                                {report.overall_stress.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted">out of 100</div>
                        </div>

                        <div className="text-center p-6 bg-tertiary rounded-lg">
                            <div className="text-sm text-muted mb-2">Stress Level</div>
                            <div className={`text-4xl font-bold mb-2 ${getStressColor(report.stress_level)}`}>
                                {report.stress_level}
                            </div>
                            <div className={`px-4 py-2 rounded-full inline-block ${report.stress_level === 'Low' ? 'bg-success/20 text-success' :
                                    report.stress_level === 'Medium' ? 'bg-warning/20 text-warning' :
                                        'bg-danger/20 text-danger'
                                }`}>
                                {report.stress_level === 'Low' ? '😌 Relaxed' :
                                    report.stress_level === 'Medium' ? '😐 Moderate' :
                                        '😰 Elevated'}
                            </div>
                        </div>

                        <div className="text-center p-6 bg-tertiary rounded-lg">
                            <div className="text-sm text-muted mb-2">Trend</div>
                            <div className="text-5xl mb-2">{getTrendIcon(report.stress_trend)}</div>
                            <div className="text-2xl font-bold">{report.stress_trend}</div>
                        </div>
                    </div>
                </div>

                {/* Session Details */}
                {sessionData && sessionData.games && sessionData.games.length > 0 && (
                    <div className="card mb-8">
                        <h2 className="text-2xl font-bold mb-6">Session Performance</h2>
                        <div className="space-y-4">
                            {sessionData.games.map((game, idx) => (
                                <div key={idx} className="p-4 bg-tertiary rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-bold text-lg">
                                            Game {game.game_number}: {game.game_name}
                                        </div>
                                        <div className="text-sm text-muted">
                                            {game.duration.toFixed(1)}s
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted">Score:</span>{' '}
                                            <span className="font-bold">{game.score.toFixed(0)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted">Avg Stress:</span>{' '}
                                            <span className={`font-bold ${game.avg_stress < 30 ? 'text-success' :
                                                    game.avg_stress < 70 ? 'text-warning' :
                                                        'text-danger'
                                                }`}>{game.avg_stress.toFixed(1)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted">Peak:</span>{' '}
                                            <span className="font-bold text-danger">{game.max_stress.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Activities */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-3xl">🌳</span>
                            Recommended Activities
                        </h3>
                        <ul className="space-y-3">
                            {parseJSON(report.activities).map((activity, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-tertiary rounded-lg hover:bg-secondary transition-colors">
                                    <span className="text-primary text-xl">•</span>
                                    <span className="flex-1">{activity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Workouts */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-3xl">💪</span>
                            Workout Plan
                        </h3>
                        <ul className="space-y-3">
                            {parseJSON(report.workouts).map((workout, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-tertiary rounded-lg hover:bg-secondary transition-colors">
                                    <span className="text-primary text-xl">•</span>
                                    <span className="flex-1">{workout}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Meditation */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-3xl">🧘</span>
                            Meditation & Mindfulness
                        </h3>
                        <ul className="space-y-3">
                            {parseJSON(report.meditation).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-tertiary rounded-lg hover:bg-secondary transition-colors">
                                    <span className="text-primary text-xl">•</span>
                                    <span className="flex-1">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Nutrition */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-3xl">🥗</span>
                            Nutrition Guidelines
                        </h3>
                        <ul className="space-y-3">
                            {parseJSON(report.food_control).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-tertiary rounded-lg hover:bg-secondary transition-colors">
                                    <span className="text-primary text-xl">•</span>
                                    <span className="flex-1">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Medical Recommendations */}
                <div className="card mb-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-3xl">⚕️</span>
                        Medical Recommendations
                    </h3>
                    <ul className="space-y-3">
                        {parseJSON(report.medical_checkup).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 p-3 bg-tertiary rounded-lg">
                                <span className="text-primary text-xl">•</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Disclaimer */}
                <div className="card bg-warning/10 border border-warning">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold mb-2">Important Disclaimer</p>
                            <p className="text-sm">
                                This report is generated by AI based on facial expression analysis and should not replace professional medical advice.
                                If you're experiencing persistent stress or mental health concerns, please consult with qualified healthcare professionals.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <button onClick={() => router.push('/play')} className="btn btn-primary">
                        🎮 Start New Session
                    </button>
                    <button onClick={downloadPDF} className="btn btn-secondary">
                        📥 Download PDF Report
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="btn">
                        📊 View Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}
