'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import CameraFeed from './components/CameraFeed';
import StressMeter from './components/StressMeter';
import GameSelector from './components/GameSelector';
import UserProfileModal from './components/UserProfileModal';
import authService from './services/auth';
import api from './services/api';
import RealTimeGraph from './components/RealTimeGraph';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [stressData, setStressData] = useState(null);
    const [stressHistory, setStressHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('analysis');

    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        // Check if profile needs completion
        if (!currentUser.job_role || !currentUser.work_hours) {
            setShowProfileModal(true);
        }

        loadStats(currentUser.id);
    }, []);

    const handleProfileSave = async (data) => {
        try {
            const updatedUser = await api.updateProfile(data);
            authService.setUser(updatedUser);
            setUser(updatedUser);
            setShowProfileModal(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const loadStats = async (userId) => {
        try {
            const data = await api.getDashboardStats(userId);
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
            if (error.status === 401) router.push('/login');
        }
    };

    const startAnalysis = async () => {
        try {
            const response = await api.startAnalysis(user.id);
            setSessionId(response.session_id);
            setStressHistory([]); // Reset history
        } catch (error) {
            console.error('Failed to start analysis:', error);
        }
    };

    const handleStressUpdate = (data) => {
        setStressData(data);
        if (data && data.stress_score !== undefined) {
            setStressHistory(prev => {
                const newHistory = [...prev, { stress: data.stress_score, timestamp: new Date().toISOString() }];
                if (newHistory.length > 60) return newHistory.slice(-60);
                return newHistory;
            });
        }
    };

    const handleGameSelect = (game) => {
        router.push(`/games?game=${game.id}&session=${sessionId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Monitor your stress levels and improve your well-being
                    </p>
                </div>

                {/* User & Last Session Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* User Profile Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">👤</span> Your Profile
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-500">Email</div>
                                <div className="font-medium text-gray-900">{user?.email}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Role</div>
                                <div className="font-medium text-gray-900">{user?.job_role || 'Not Set'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Work Model</div>
                                <div className="font-medium text-gray-900">{user?.work_type || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Daily Work</div>
                                <div className="font-medium text-gray-900">{user?.work_hours ? `${user.work_hours} hrs` : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Avg. Sleep</div>
                                <div className="font-medium text-gray-900">{user?.sleep_hours ? `${user.sleep_hours} hrs` : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Screen Time</div>
                                <div className="font-medium text-gray-900">{user?.electronics_usage ? `${user.electronics_usage} hrs/day` : 'N/A'}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Edit Profile
                        </button>
                    </div>

                    {/* Last Test Detail Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">📊</span> Last Analysis Result
                        </h3>
                        {stats?.recent_sessions?.length > 0 ? (
                            <div>
                                {stats.recent_sessions[stats.recent_sessions.length - 1].stress_curve && (
                                    <div className="mb-4 -mx-2">
                                        <RealTimeGraph
                                            stressData={{
                                                history: stats.recent_sessions[stats.recent_sessions.length - 1].stress_curve.map((v, i) => ({ stress: v, timestamp: i }))
                                            }}
                                            height={120}
                                        />
                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <div className="text-4xl font-bold text-purple-600">
                                            {stats.recent_sessions[stats.recent_sessions.length - 1].average_stress_score
                                                ? Math.round(stats.recent_sessions[stats.recent_sessions.length - 1].average_stress_score)
                                                : '-'}
                                        </div>
                                        <div className="text-sm text-gray-500">Stress Score</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold inline-block
                                            ${stats.recent_sessions[stats.recent_sessions.length - 1].stress_level === 'High' ? 'bg-red-100 text-red-700' :
                                                stats.recent_sessions[stats.recent_sessions.length - 1].stress_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'}`}>
                                            {stats.recent_sessions[stats.recent_sessions.length - 1].stress_level || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(stats.recent_sessions[stats.recent_sessions.length - 1].started_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                                    <div>Duration: {Math.round((new Date(stats.recent_sessions[stats.recent_sessions.length - 1].ended_at) - new Date(stats.recent_sessions[stats.recent_sessions.length - 1].started_at)) / 1000) || 30}s</div>
                                    <div>Games Played: {stats.recent_sessions[stats.recent_sessions.length - 1].games_played || 0}</div>
                                </div>
                                <button
                                    onClick={() => router.push(`/reports?session=${stats.recent_sessions[stats.recent_sessions.length - 1].session_id}`)}
                                    className="w-full bg-purple-50 text-purple-700 py-2 rounded-lg hover:bg-purple-100 text-sm font-medium transition-colors"
                                >
                                    View Full Request
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <p className="mb-2">No analysis taken yet</p>
                                <button
                                    onClick={() => setActiveTab('analysis')}
                                    className="text-indigo-600 text-sm hover:underline"
                                >
                                    Start your first session
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Real-time Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('games')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'games'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Stress-Relief Games
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            History
                        </button>
                    </nav>
                </div>

                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            {!sessionId ? (
                                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                                    <h2 className="text-2xl font-bold mb-4">Start Stress Analysis</h2>
                                    <p className="text-gray-600 mb-6">
                                        Begin a new session to analyze your stress levels in real-time
                                    </p>
                                    <button
                                        onClick={startAnalysis}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700"
                                    >
                                        Start New Session
                                    </button>
                                </div>
                            ) : (
                                <CameraFeed sessionId={sessionId} onStressUpdate={handleStressUpdate} />
                            )}
                        </div>

                        <div>
                            <StressMeter stressData={stressData} stressHistory={stressHistory} />
                        </div>
                    </div>
                )}

                {/* Games Tab */}
                {activeTab === 'games' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Stress-Relief Games</h2>
                        <GameSelector onGameSelect={handleGameSelect} />
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Analysis History</h2>
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    <div className="text-sm text-indigo-600 font-medium">Total Sessions</div>
                                    <div className="text-3xl font-bold text-indigo-900">{stats.total_sessions}</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-sm text-green-600 font-medium">Average Stress</div>
                                    <div className="text-3xl font-bold text-green-900">
                                        {stats.average_stress?.toFixed(1) || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-sm text-purple-600 font-medium">Last Session</div>
                                    <div className="text-lg font-bold text-purple-900">
                                        {stats.recent_sessions?.length > 0 ? 'Today' : 'No sessions'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {stats?.recent_sessions?.map((session, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">Session {session.session_id?.substring(0, 8)}</div>
                                            <div className="text-sm text-gray-600">
                                                {new Date(session.started_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold ${session.stress_level === 'Low' ? 'text-green-600' :
                                                session.stress_level === 'Medium' ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`}>
                                                {session.stress_level || 'N/A'}
                                            </div>
                                            <a
                                                href={`/reports?session=${session.session_id}`}
                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                            >
                                                View Report
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <UserProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onSave={handleProfileSave}
                initialData={user || {}}
            />
        </div>
    );
}
