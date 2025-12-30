'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import CameraFeed from '../components/CameraFeed';
import StressMeter from '../components/StressMeter';
import authService from '../services/auth';
import api from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function AnalysisPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [stressData, setStressData] = useState(null);
    const [stressHistory, setStressHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Timer & Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isSessionComplete, setIsSessionComplete] = useState(false);
    const [sessionReport, setSessionReport] = useState(null);

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
    }, [router]);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (isAnalyzing && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isAnalyzing) {
            finishAnalysis();
        }
        return () => clearInterval(interval);
    }, [isAnalyzing, timeLeft]);

    const startAnalysis = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await api.startAnalysis(user.id);
            setSessionId(response.session_id);
            setStressHistory([]);
            setTimeLeft(30);
            setIsAnalyzing(true);
            setIsSessionComplete(false);
            setSessionReport(null);
        } catch (error) {
            console.error('Failed to start analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const finishAnalysis = async () => {
        setIsAnalyzing(false);
        setIsSessionComplete(true);

        try {
            // Slight delay to allow backend to process final frames
            await new Promise(resolve => setTimeout(resolve, 1000));
            const report = await api.getReport(sessionId);
            setSessionReport(report);
        } catch (error) {
            console.error('Failed to get report:', error);
        }
    };

    const handleStressUpdate = (data) => {
        setStressData(data);
        if (isAnalyzing) {
            setStressHistory(prev => [...prev, {
                time: 30 - timeLeft,
                score: data.stress_score
            }]);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Chart Options - Updated for Light Theme
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#1d1d1f' }
            },
            title: {
                display: true,
                text: 'Stress Level Over Time',
                color: '#1d1d1f'
            },
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                grid: { color: 'rgba(0, 0, 0, 0.1)' },
                ticks: { color: '#1d1d1f' }
            },
            x: {
                grid: { color: 'rgba(0, 0, 0, 0.1)' },
                ticks: { color: '#1d1d1f' }
            }
        }
    };

    const chartData = {
        labels: stressHistory.map(d => `${d.time}s`),
        datasets: [
            {
                label: 'Your Stress Level',
                data: stressHistory.map(d => d.score),
                borderColor: '#0071e3', // Apple Blue
                backgroundColor: 'rgba(0, 113, 227, 0.1)',
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#0071e3',
                fill: true
            },
            {
                label: 'Normal Baseline (40)',
                data: Array(stressHistory.length).fill(40),
                borderColor: '#34c759', // Apple Green
                borderDash: [8, 4],
                pointRadius: 0,
                borderWidth: 2,
                fill: false
            },
            {
                label: 'Elevated Threshold (70)',
                data: Array(stressHistory.length).fill(70),
                borderColor: '#ff9500', // Apple Orange
                borderDash: [8, 4],
                pointRadius: 0,
                borderWidth: 2,
                fill: false
            }
        ]
    };

    return (
        <div className="min-h-screen bg-[var(--apple-bg)]">
            <Navbar />

            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Real-Time Stress Analysis
                        </h1>
                        <p className="text-gray-500">
                            Monitor your stress levels in real-time using advanced facial expression analysis
                        </p>
                    </div>
                    {isAnalyzing && (
                        <div className="text-3xl font-mono font-bold text-gray-900 glass-apple px-6 py-3">
                            {formatTime(timeLeft)}
                            <div className="text-xs text-gray-500 font-normal mt-1 text-center">Remaining</div>
                        </div>
                    )}
                </div>

                {!sessionId && !isSessionComplete ? (
                    <div className="glass-apple p-12 text-center max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📸</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Start Your Analysis Session
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                            Begin a 30-second session to analyze your stress levels using your camera.
                            Ensure you are in a well-lit environment.
                        </p>
                        <button
                            onClick={startAnalysis}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Starting...' : 'Start 30s Analysis'}
                        </button>
                    </div>
                ) : isSessionComplete ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Card */}
                        <div className="lg:col-span-1 glass-apple p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Session Summary</h3>
                            {sessionReport ? (
                                <div className="space-y-6">
                                    <div className="text-center p-6 bg-white/50 rounded-xl border border-gray-100">
                                        <div className="text-sm text-gray-500 mb-2">Average Stress Score</div>
                                        <div className={`text-5xl font-bold mb-2 ${sessionReport.average_score > 70 ? 'text-red-500' :
                                            sessionReport.average_score > 40 ? 'text-orange-500' : 'text-green-500'
                                            }`}>
                                            {Math.round(sessionReport.average_score)}
                                        </div>
                                        <div className="text-lg text-gray-700 font-medium">{sessionReport.stress_level} Stress</div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => router.push(`/reports?session=${sessionId}`)}
                                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            View Full Report
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSessionId(null);
                                                setIsSessionComplete(false);
                                                setSessionReport(null);
                                            }}
                                            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg transition-colors font-medium"
                                        >
                                            Start New Session
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                    Generating Report...
                                </div>
                            )}
                        </div>

                        {/* Graph & Recommendations & Games */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Graph */}
                            <div className="glass-apple p-6">
                                <Line options={chartOptions} data={chartData} />
                            </div>

                            {/* Recommendations Carousel */}
                            {sessionReport?.recommendations && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                        <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                                            <span className="mr-2">🏥</span> Medical
                                        </h4>
                                        <p className="text-sm text-gray-600">{sessionReport.recommendations.medical_advice}</p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                                        <h4 className="font-semibold text-purple-700 mb-2 flex items-center">
                                            <span className="mr-2">🧘</span> Meditation
                                        </h4>
                                        <p className="text-sm text-gray-600">{sessionReport.recommendations.immediate_action}</p>
                                    </div>
                                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                                        <h4 className="font-semibold text-orange-700 mb-2 flex items-center">
                                            <span className="mr-2">💻</span> System Usage
                                        </h4>
                                        <p className="text-sm text-gray-600">{sessionReport.recommendations.work_adjustment}</p>
                                    </div>
                                    <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
                                        <h4 className="font-semibold text-teal-700 mb-2 flex items-center">
                                            <span className="mr-2">💤</span> Sleep
                                        </h4>
                                        <p className="text-sm text-gray-600">{sessionReport.recommendations.lifestyle_change}</p>
                                    </div>
                                </div>
                            )}

                            {/* Recommended Games */}
                            <div className="glass-apple p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recommended Stress-Relief Games</h3>
                                    <button onClick={() => router.push('/games')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {['breath_sync', 'focus_maze', 'calm_click', 'relax_flow'].map((gameId) => (
                                        <div
                                            key={gameId}
                                            onClick={() => router.push(`/games?game=${gameId}&session=${sessionId}`)}
                                            className="bg-white hover:bg-gray-50 p-4 rounded-lg cursor-pointer transition-all text-center border border-gray-200 hover:border-blue-400 shadow-sm"
                                        >
                                            <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                                <span className="text-xl">🎮</span>
                                            </div>
                                            <div className="text-sm font-medium text-gray-800 capitalize">
                                                {gameId.replace('_', ' ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Camera Feed */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-apple p-6 relative overflow-hidden">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Camera Feed</h3>
                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
                                    <CameraFeed sessionId={sessionId} onStressUpdate={handleStressUpdate} autoStart={true} />
                                </div>
                                {isAnalyzing && (
                                    <div className="absolute top-8 right-8 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-md">
                                        REC
                                    </div>
                                )}
                            </div>

                            {/* Live Real-Time Graph */}
                            {isAnalyzing && stressHistory.length > 0 && (
                                <div className="glass-apple p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Stress Analysis</h3>
                                    <div className="bg-white/50 p-4 rounded-lg">
                                        <Line options={chartOptions} data={chartData} />
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                                            <div className="text-xs text-green-600 font-medium">Current</div>
                                            <div className="text-2xl font-bold text-green-700">
                                                {stressData ? Math.round(stressData.stress_score) : '--'}
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                            <div className="text-xs text-blue-600 font-medium">Average</div>
                                            <div className="text-2xl font-bold text-blue-700">
                                                {stressHistory.length > 0
                                                    ? Math.round(stressHistory.reduce((sum, d) => sum + d.score, 0) / stressHistory.length)
                                                    : '--'}
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                                            <div className="text-xs text-purple-600 font-medium">Data Points</div>
                                            <div className="text-2xl font-bold text-purple-700">
                                                {stressHistory.length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stress Meter */}
                        <div className="lg:col-span-1">
                            <div className="glass-apple p-6 h-full">
                                <StressMeter stressData={stressData} stressHistory={stressHistory} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
