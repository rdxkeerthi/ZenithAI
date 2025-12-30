'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import GameStressMonitor from '../components/GameStressMonitor';
import MediaPipeOverlay from '../components/MediaPipeOverlay';
import useFaceTracking from '../hooks/useFaceTracking';
import authService from '../services/auth';
import api from '../services/api';

export default function BalanceGame() {
    const router = useRouter();
    const [sessionId, setSessionId] = useState(null);
    const [stressData, setStressData] = useState(null);
    const [gameActive, setGameActive] = useState(false);
    const [balance, setBalance] = useState(50);
    const [score, setScore] = useState(0);
    const videoRef = useRef(null);
    const [showLandmarks, setShowLandmarks] = useState(true);
    const { isTracking, setIsTracking, faceDetected, landmarks } = useFaceTracking(videoRef);

    useEffect(() => {
        if (!authService.getUser()) {
            router.push('/login');
            return;
        }
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
            if (data.status === 'success') setStressData(data);
        });
        return () => { if (ws) ws.close(); };
    }, [sessionId, gameActive]);

    const startGame = async () => {
        setGameActive(true);
        setIsTracking(true);
        setScore(0);
        setBalance(50);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error('Camera error:', err);
        }
    };

    const stopGame = () => {
        setGameActive(false);
        setIsTracking(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        if (!gameActive) return;
        const interval = setInterval(() => {
            setBalance(prev => {
                const change = (Math.random() - 0.5) * 10;
                const newBalance = Math.max(0, Math.min(100, prev + change));
                if (newBalance > 40 && newBalance < 60) setScore(s => s + 1);
                return newBalance;
            });
        }, 500);
        return () => clearInterval(interval);
    }, [gameActive]);

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Balance Game</h2>
                    <p className="text-gray-600">Keep the balance in the center</p>
                </div>

                <div className="glass-apple rounded-2xl p-8">
                    {!gameActive ? (
                        <div className="text-center space-y-6">
                            <div className="w-32 h-32 bg-orange-100 rounded-full mx-auto flex items-center justify-center text-4xl">
                                ⚖️
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Ready to Balance?</h3>
                            <button onClick={startGame} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200">Start Game</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${balance}%` }}></div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500">Score</div>
                                <div className="text-4xl font-bold text-gray-900">{score}</div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button onClick={stopGame} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-6 py-2 rounded-lg font-medium">End Game</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <video ref={videoRef} className="hidden" muted autoPlay playsInline />
        </div>
    );
}
