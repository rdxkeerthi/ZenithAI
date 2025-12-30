'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import GameStressMonitor from '../components/GameStressMonitor';
import MediaPipeOverlay from '../components/MediaPipeOverlay';
import useFaceTracking from '../hooks/useFaceTracking';
import authService from '../services/auth';
import api from '../services/api';

export default function EyeControlGame() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [stressData, setStressData] = useState(null);
    const [gameActive, setGameActive] = useState(false);
    const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
    const [score, setScore] = useState(0);
    const videoRef = useRef(null);
    const [showLandmarks, setShowLandmarks] = useState(true);

    const { isTracking, setIsTracking, faceDetected, landmarks, confidence } = useFaceTracking(videoRef);

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

        const ws = api.connectWebSocket(sessionId, (data) => {
            if (data.status === 'success') {
                setStressData(data);
            }
        });

        return () => {
            if (ws) ws.close();
        };
    }, [sessionId, gameActive]);

    const startGame = async () => {
        setGameActive(true);
        setIsTracking(true);
        setScore(0);
        setTargetPosition({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });

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

    useEffect(() => {
        if (!gameActive) return;

        const interval = setInterval(() => {
            setTargetPosition({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
            setScore(s => s + 5);
        }, 3000);

        return () => clearInterval(interval);
    }, [gameActive]);

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Eye Control
                    </h2>
                    <p className="text-gray-600">Follow the moving target with your eyes</p>
                </div>

                <div className="glass-apple rounded-2xl p-8">
                    {!gameActive ? (
                        <div className="text-center space-y-6">
                            <div className="w-32 h-32 bg-green-100 rounded-full mx-auto flex items-center justify-center text-4xl">
                                👁️
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Ready to Focus?</h3>
                            <p className="text-gray-600">Track the green target as it moves.</p>
                            <button
                                onClick={startGame}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
                            >
                                Start Game
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative w-full h-96 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-inner">
                                <div
                                    className="absolute w-8 h-8 bg-green-500 rounded-full shadow-lg transition-all duration-1000 ease-in-out"
                                    style={{
                                        left: `${targetPosition.x}%`,
                                        top: `${targetPosition.y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                />
                            </div>

                            <div className="text-center">
                                <div className="text-sm text-gray-500 mb-1">Score</div>
                                <div className="text-4xl font-bold text-gray-900">{score}</div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={stopGame}
                                    className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
                                >
                                    End Game
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Internal video reference for face tracking logic if needed, but GamePage handles stress. 
                If this game specifically needs eye tracking logic from `useFaceTracking`, it should use it. 
                However, the current logic only moves a dot and updates score based on time, not actual eye tracking.
                So we can remove the video element if it's not actually used for game mechanics controls.
            */}
            <video ref={videoRef} className="hidden" muted autoPlay playsInline />
        </div>
    );
}
