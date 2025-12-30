'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from './components/Navbar';
import api from './services/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session');

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeSeriesData, setTimeSeriesData] = useState(null);

    useEffect(() => {
        if (sessionId) {
            loadReport();
        } else {
            console.log("No session ID, showing empty state");
            setLoading(false);
            // Don't set error, just leave report null to trigger specific empty state
        }
    }, [sessionId]);

    const loadReport = async () => {
        try {
            setLoading(true);
            setError(null);

            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const reportPromise = api.getReport(sessionId);

            const data = await Promise.race([reportPromise, timeoutPromise]);
            setReport(data);

            // Process time-series data for chart
            if (data.readings && data.readings.length > 0) {
                processTimeSeriesData(data.readings);
            }
        } catch (error) {
            console.error('Failed to load report:', error);
            setError(error.message || 'Failed to load report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const processTimeSeriesData = (readings) => {
        // Sort readings by timestamp
        const sortedReadings = [...readings].sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Create labels (time points)
        const labels = sortedReadings.map((reading, index) => {
            const date = new Date(reading.timestamp);
            const seconds = Math.floor((date - new Date(sortedReadings[0].timestamp)) / 1000);
            return `${seconds}s`;
        });

        // Create dataset
        const stressScores = sortedReadings.map(r => r.stress_score);

        setTimeSeriesData({
            labels,
            datasets: [
                {
                    label: 'Stress Level',
                    data: stressScores,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: stressScores.map(score => {
                        if (score < 40) return 'rgb(34, 197, 94)';
                        if (score < 75) return 'rgb(234, 179, 8)';
                        return 'rgb(239, 68, 68)';
                    }),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                }
            ]
        });
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        const score = context.parsed.y;
                        let level = 'Low';
                        if (score >= 75) level = 'High';
                        else if (score >= 40) level = 'Medium';
                        return `Stress: ${score.toFixed(1)} (${level})`;
                    }
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 11
                    }
                },
                title: {
                    display: true,
                    text: 'Stress Level',
                    color: '#374151',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6b7280',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10,
                    font: {
                        size: 11
                    }
                },
                title: {
                    display: true,
                    text: 'Time Elapsed',
                    color: '#374151',
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            }
        }
    };

    const downloadPDF = () => {
        api.downloadPDF(sessionId);
    };

    const downloadDOCX = () => {
        api.downloadDOCX(sessionId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--apple-bg)]">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center glass-apple p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading report...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!sessionId) {
        return (
            <div className="min-h-screen bg-[var(--apple-bg)]">
                <Navbar />
                <div className="flex items-center justify-center h-screen px-4">
                    <div className="glass-panel p-8 max-w-md w-full text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <h2 className="text-2xl font-bold mb-2">View Your Analysis</h2>
                        <p className="text-secondary mb-8">
                            Please select a session from your dashboard to view its detailed report.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="btn-primary w-full"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--apple-bg)]">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                    <div className="glass-apple p-8 border border-red-200 bg-red-50/50">
                        <div className="text-center">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Report</h2>
                            <p className="text-red-600 mb-6">{error}</p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={loadReport}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-[var(--apple-bg)]">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                    <div className="glass-apple p-6 border border-red-200 bg-red-50/50">
                        <div className="text-red-700 font-medium text-center">
                            Report not found. Please start a new session.
                        </div>
                        <div className="text-center mt-4">
                            <button
                                onClick={() => router.push('/analysis')}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Start New Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate statistics
    const readings = report.readings || [];
    const minStress = readings.length > 0 ? Math.min(...readings.map(r => r.stress_score)) : 0;
    const maxStress = readings.length > 0 ? Math.max(...readings.map(r => r.stress_score)) : 0;
    const avgStress = report.average_score || 0;

    return (
        <div className="min-h-screen bg-[var(--apple-bg)]">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <div className="glass-apple p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Stress Analysis Report</h1>
                            <p className="text-gray-500 mt-2">Session ID: {sessionId?.substring(0, 16)}...</p>
                            {report.game_name && (
                                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                    🎮 {report.game_name.replace('_', ' ').toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={downloadPDF}
                                className="bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors flex items-center font-medium"
                            >
                                📄 PDF
                            </button>
                            <button
                                onClick={downloadDOCX}
                                className="bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center font-medium"
                            >
                                📝 DOCX
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                            <div className="text-sm text-blue-600 font-medium mb-1">Average Stress</div>
                            <div className="text-3xl font-bold text-blue-700">{avgStress.toFixed(1)}</div>
                            <div className="text-xs text-blue-500 mt-1">out of 100</div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                            <div className="text-sm text-green-600 font-medium mb-1">Minimum</div>
                            <div className="text-3xl font-bold text-green-700">{minStress.toFixed(1)}</div>
                            <div className="text-xs text-green-500 mt-1">lowest point</div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border border-red-200">
                            <div className="text-sm text-red-600 font-medium mb-1">Maximum</div>
                            <div className="text-3xl font-bold text-red-700">{maxStress.toFixed(1)}</div>
                            <div className="text-xs text-red-500 mt-1">peak stress</div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                            <div className="text-sm text-purple-600 font-medium mb-1">Data Points</div>
                            <div className="text-3xl font-bold text-purple-700">{readings.length}</div>
                            <div className="text-xs text-purple-500 mt-1">readings</div>
                        </div>
                    </div>

                    {/* Time-Series Graph */}
                    {timeSeriesData && (
                        <div className="mb-8 p-6 bg-white/50 rounded-xl border border-gray-200">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Stress Level Over Time</h2>
                            <div className="h-80">
                                <Line data={timeSeriesData} options={chartOptions} />
                            </div>

                            {/* Stress Zones Legend */}
                            <div className="flex justify-center gap-6 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-gray-600">Low (0-40)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-gray-600">Medium (40-75)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-gray-600">High (75-100)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Game Results (if applicable) */}
                    {report.game_score !== undefined && (
                        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">🎮 Game Performance</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">Score</div>
                                    <div className="text-2xl font-bold text-indigo-600">{report.game_score}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Duration</div>
                                    <div className="text-2xl font-bold text-purple-600">{report.game_duration}s</div>
                                </div>
                                {report.reaction_time && (
                                    <div>
                                        <div className="text-sm text-gray-600">Reaction Time</div>
                                        <div className="text-2xl font-bold text-pink-600">{report.reaction_time.toFixed(0)}ms</div>
                                    </div>
                                )}
                                {report.focus_score && (
                                    <div>
                                        <div className="text-sm text-gray-600">Focus Score</div>
                                        <div className="text-2xl font-bold text-blue-600">{report.focus_score.toFixed(0)}%</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI Recommendations */}
                    {report.recommendations && Object.keys(report.recommendations).length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">AI-Powered Recommendations</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(report.recommendations).map(([category, items]) => (
                                    <div key={category} className="p-4 rounded-xl border border-gray-100 bg-white/50">
                                        <h3 className="text-lg font-semibold mb-3 text-blue-700 capitalize">
                                            {category.replace('_', ' ')}
                                        </h3>
                                        <ul className="space-y-2">
                                            {items.map((item, index) => (
                                                <li key={index} className="flex items-start text-sm">
                                                    <span className="text-blue-500 mr-2 mt-1">•</span>
                                                    <span className="text-gray-700 leading-relaxed">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommended Games */}
                    <div className="mb-8 p-6 bg-blue-50/30 rounded-xl border border-blue-100/50">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Recommended Stress-Relief Games</h2>
                        <p className="text-gray-600 mb-6">Based on your stress level, try these games to help you relax.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { id: 'breath_sync', name: 'Breath Sync', icon: '🌬️' },
                                { id: 'focus_maze', name: 'Focus Maze', icon: '🌀' },
                                { id: 'calm_click', name: 'Calm Click', icon: '👆' },
                                { id: 'bubble_pop', name: 'Bubble Pop', icon: '🫧' }
                            ].map((game) => (
                                <div
                                    key={game.id}
                                    onClick={() => router.push(`/games?game=${game.id}`)}
                                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-100 hover:border-blue-300 text-center"
                                >
                                    <div className="text-3xl mb-2">{game.icon}</div>
                                    <div className="font-medium text-gray-800 text-sm">{game.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => router.push('/analysis')}
                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Start New Analysis
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
