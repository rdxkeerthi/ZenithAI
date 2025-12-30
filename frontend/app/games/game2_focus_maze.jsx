'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import GameStressMonitor from '../components/GameStressMonitor';
import MediaPipeOverlay from '../components/MediaPipeOverlay';
import useFaceTracking from '../hooks/useFaceTracking';
import authService from '../services/auth';
import api from '../services/api';

export default function FocusMazeGame() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [stressData, setStressData] = useState(null);
    const [gameActive, setGameActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [target, setTarget] = useState({ x: 8, y: 8 });
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
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
        setMoves(0);
        setPosition({ x: 0, y: 0 });
        setTarget({ x: Math.floor(Math.random() * 9), y: Math.floor(Math.random() * 9) });

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

    const movePlayer = (dx, dy) => {
        setPosition(prev => {
            const newX = Math.max(0, Math.min(8, prev.x + dx));
            const newY = Math.max(0, Math.min(8, prev.y + dy));
            setMoves(m => m + 1);

            if (newX === target.x && newY === target.y) {
                setScore(s => s + 10);
                setTarget({ x: Math.floor(Math.random() * 9), y: Math.floor(Math.random() * 9) });
            }

            return { x: newX, y: newY };
        });
    };

    useEffect(() => {
        if (!gameActive) return;

        const handleKeyPress = (e) => {
            switch (e.key) {
                case 'ArrowUp': movePlayer(0, -1); break;
                case 'ArrowDown': movePlayer(0, 1); break;
                case 'ArrowLeft': movePlayer(-1, 0); break;
                case 'ArrowRight': movePlayer(1, 0); break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameActive]);

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Focus Maze
                    </h2>
                    <p className="text-gray-600">
                        Navigate to the target while staying focused
                    </p>
                </div>

                <div className="glass-apple rounded-2xl p-8">
                    {!gameActive ? (
                        <div className="text-center space-y-6">
                            <div className="w-32 h-32 bg-purple-100 rounded-full mx-auto flex items-center justify-center text-4xl">
                                🧩
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Ready to Navigate?</h3>
                            <p className="text-gray-600">Use arrow keys to reach the green target.</p>
                            <button
                                onClick={startGame}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200"
                            >
                                Start Game
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Maze Grid */}
                            <div className="grid grid-cols-9 gap-2 max-w-md mx-auto aspect-square p-4 bg-white/50 rounded-xl">
                                {Array.from({ length: 81 }).map((_, i) => {
                                    const x = i % 9;
                                    const y = Math.floor(i / 9);
                                    const isPlayer = x === position.x && y === position.y;
                                    const isTarget = x === target.x && y === target.y;

                                    return (
                                        <div
                                            key={i}
                                            className={`rounded-md transition-all duration-200 ${isPlayer ? 'bg-purple-600 shadow-lg scale-110' :
                                                    isTarget ? 'bg-green-500 animate-pulse' :
                                                        'bg-gray-200/50'
                                                }`}
                                        />
                                    );
                                })}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 text-center max-w-sm mx-auto">
                                <div className="bg-white/60 rounded-lg p-3">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Score</div>
                                    <div className="text-2xl font-bold text-gray-900">{score}</div>
                                </div>
                                <div className="bg-white/60 rounded-lg p-3">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Moves</div>
                                    <div className="text-2xl font-bold text-gray-900">{moves}</div>
                                </div>
                            </div>

                            {/* Controls */}
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

            {/* Hidden Video for Face Tracking if needed internally */}
            <video ref={videoRef} className="hidden" muted autoPlay playsInline />
        </div>
    );
}
