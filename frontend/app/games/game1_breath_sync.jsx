'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import GameStressMonitor from '../components/GameStressMonitor';
import MediaPipeOverlay from '../components/MediaPipeOverlay';
import useFaceTracking from '../hooks/useFaceTracking';
import authService from '../services/auth';
import api from '../services/api';

export default function BreathSyncGame() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [stressData, setStressData] = useState(null);
    const [gameActive, setGameActive] = useState(false);
    const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
    const [countdown, setCountdown] = useState(4);
    const [score, setScore] = useState(0);
    const videoRef = useRef(null);
    const [showLandmarks, setShowLandmarks] = useState(true);

    const { isTracking, setIsTracking, faceDetected, landmarks, confidence } = useFaceTracking(
        videoRef,
        (faceData) => {
            // Face detected callback - can be used for additional processing
            console.log('Face detected:', faceData);
        }
    );

    useEffect(() => {
        const currentUser = authService.getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        startStressSession();
    }, [router]);

    const startStressSession = async () => {
        try {
            const response = await api.startAnalysis(authService.getUser().id);
            setSessionId(response.session_id);
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    };

    useEffect(() => {
        if (!sessionId || !gameActive) return;

        // Connect WebSocket for stress monitoring
        const ws = api.connectWebSocket(
            sessionId,
            (data) => {
                if (data.status === 'success') {
                    setStressData(data);
                }
            },
            (status) => {
                console.log('WebSocket status:', status);
            }
        );

        return () => {
            if (ws) ws.close();
        };
    }, [sessionId, gameActive]);

    useEffect(() => {
        if (!gameActive) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Change phase
                    if (breathPhase === 'inhale') {
                        setBreathPhase('hold');
                        return 4;
                    } else if (breathPhase === 'hold') {
                        setBreathPhase('exhale');
                        return 4;
                    } else {
                        setBreathPhase('inhale');
                        setScore((s) => s + 1);
                        return 4;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameActive, breathPhase]);

    const startGame = async () => {
        setGameActive(true);
        setIsTracking(true);
        setScore(0);
        setBreathPhase('inhale');
        setCountdown(4);

        // Start camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Camera error:', err);
        }
    };

    const stopGame = () => {
        setGameActive(false);
        setIsTracking(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const getPhaseColor = () => {
        switch (breathPhase) {
            case 'inhale': return 'from-blue-500 to-cyan-600';
            case 'hold': return 'from-yellow-500 to-orange-600';
            case 'exhale': return 'from-green-500 to-emerald-600';
            default: return 'from-gray-500 to-slate-600';
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            {/* Game Stress Monitor - Removed as GamePage handles it */}

            <div className="w-full max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Breath Sync
                    </h2>
                    <p className="text-gray-600">
                        Follow the breathing pattern to reduce stress
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Game Area */}
                    <div className="glass-apple rounded-2xl p-8 text-center shadow-sm">
                        {!gameActive ? (
                            <div className="space-y-6">
                                <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                                    <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Ready to Start?</h3>
                                <p className="text-gray-600">
                                    Center your mind with guided breathing exercises.
                                </p>
                                <button
                                    onClick={startGame}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
                                >
                                    Start Session
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Breathing Circle */}
                                <div className="relative py-8">
                                    <div
                                        className={`w-64 h-64 mx-auto rounded-full flex items-center justify-center transition-all duration-1000 shadow-xl ${breathPhase === 'inhale' ? 'bg-blue-500 scale-110' :
                                                breathPhase === 'hold' ? 'bg-indigo-500 scale-100' :
                                                    'bg-green-500 scale-90'
                                            }`}
                                    >
                                        <div className="text-center text-white">
                                            <div className="text-6xl font-bold mb-2">{countdown}</div>
                                            <div className="text-2xl font-semibold uppercase tracking-wider">{breathPhase}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Score */}
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Cycles Completed</div>
                                    <div className="text-4xl font-bold text-gray-900">{score}</div>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={stopGame}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-2 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        End Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions - Right Side */}
                    <div className="glass-apple p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breathing Guide</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                <div>
                                    <div className="font-medium text-gray-900">Inhale (4s)</div>
                                    <div className="text-sm text-gray-600">Breathe in deeply through your nose</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                <div>
                                    <div className="font-medium text-gray-900">Hold (4s)</div>
                                    <div className="text-sm text-gray-600">Hold your breath comfortably</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                <div>
                                    <div className="font-medium text-gray-900">Exhale (4s)</div>
                                    <div className="text-sm text-gray-600">Release slowly through your mouth</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500 italic text-center">
                                "Rhythmic breathing signals your parasympathetic nervous system to calm your body."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Video for Face Tracking if needed internally, but we rely on GamePage mainly */}
            <video ref={videoRef} className="hidden" muted autoPlay playsInline />
        </div>
    );

}
