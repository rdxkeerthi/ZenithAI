'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from './components/Navbar';
import CameraFeed from './components/CameraFeed';
import StressMeter from './components/StressMeter';
import api from './services/api';
import authService from './services/auth';
import GameSelector from './components/GameSelector';

// Import all game components
import BreathSync from './games/game1_breath_sync';
import FocusMaze from './games/game2_focus_maze';
import EyeControl from './games/game3_eye_control';
import BalanceGame from './games/game4_balance';
import ReactionTest from './games/game5_reaction';
import MemoryMatch from './games/game6_memory';
import CalmClick from './games/game7_calm_click';
import RelaxFlow from './games/game8_relax_flow';
import ColorMatch from './games/game9_color_match';
import PatternMemory from './games/game10_pattern_memory';
import SpeedType from './games/game11_speed_type';
import BubblePop from './games/game12_bubble_pop';

const GAME_COMPONENTS = {
    'breath_sync': BreathSync,
    'focus_maze': FocusMaze,
    'eye_control': EyeControl,
    'balance': BalanceGame,
    'reaction': ReactionTest,
    'memory': MemoryMatch,
    'calm_click': CalmClick,
    'relax_flow': RelaxFlow,
    'color_match': ColorMatch,
    'pattern_memory': PatternMemory,
    'speed_type': SpeedType,
    'bubble_pop': BubblePop,
};

export default function GamePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('game');
    const urlSessionId = searchParams.get('session');

    const [sessionId, setSessionId] = useState(urlSessionId);
    const [stressData, setStressData] = useState(null);
    const [stressHistory, setStressHistory] = useState([]); // Add history
    const [gameStarted, setGameStarted] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    const [user, setUser] = useState(null);

    const GameComponent = GAME_COMPONENTS[gameId];

    // Get user on mount
    useEffect(() => {
        const currentUser = authService.getUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    // Auto-start stress analysis when game starts
    useEffect(() => {
        if (gameStarted && !sessionId && user) {
            startStressSession();
        }
    }, [gameStarted, sessionId, user]);

    const startStressSession = async () => {
        try {
            const response = await api.startAnalysis(user.id);
            setSessionId(response.session_id);
            setStressHistory([]);
            console.log('✅ Started stress monitoring session:', response.session_id);
        } catch (error) {
            console.error('Failed to start stress session:', error);
        }
    };

    const handleGameComplete = async (result) => {
        setGameResult(result);

        // Submit game result to backend
        try {
            await api.submitGameResult({
                session_id: sessionId,
                game_name: gameId,
                score: result.score,
                duration: result.duration,
                reaction_time: result.reactionTime,
                error_rate: result.errorRate,
                focus_score: result.focusScore,
            });
        } catch (error) {
            console.error('Failed to submit game result:', error);
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
        router.push(`/games?game=${game.id}&session=${sessionId || ''}`);
    };

    if (!gameId) {
        return (
            <div className="min-h-screen bg-[var(--apple-bg)]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">Stress-Relief Games</h1>
                    <div className="glass-apple p-6">
                        <GameSelector onGameSelect={handleGameSelect} />
                    </div>
                </div>
            </div>
        );
    }

    if (!GameComponent) {
        return (
            <div className="min-h-screen bg-[var(--apple-bg)]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
                    <div className="glass-apple p-8 border border-red-200 bg-red-50/50">
                        <div className="text-red-700 font-medium text-center">
                            Game not found
                        </div>
                        <div className="text-center mt-4">
                            <button
                                onClick={() => router.push('/games')}
                                className="text-blue-600 hover:underline"
                            >
                                Browse Games
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--apple-bg)]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 capitalize">
                    {gameId.replace('_', ' ')}
                </h1>

                {/* Split Screen Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Camera & Stress Monitor (Left Side) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-apple p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">Live Stress Monitor</h2>
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-black mb-4">
                                <CameraFeed
                                    sessionId={sessionId}
                                    onStressUpdate={handleStressUpdate}
                                    autoStart={gameStarted}
                                />
                            </div>
                            <StressMeter stressData={stressData} stressHistory={stressHistory} />
                        </div>
                    </div>

                    {/* Game Area (Right/Center Side) */}
                    <div className="lg:col-span-2">
                        <div className="glass-apple p-8 min-h-[500px] flex flex-col justify-center">
                            {!gameStarted ? (
                                <div className="text-center py-12">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready to Play?</h2>
                                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                        This game will help reduce your stress levels while we monitor your progress.
                                        Find a comfortable position.
                                    </p>
                                    <button
                                        onClick={() => setGameStarted(true)}
                                        className="bg-blue-600 text-white px-10 py-4 rounded-full font-medium hover:bg-blue-700 shadow-lg transition-transform hover:scale-105"
                                    >
                                        Start Game
                                    </button>
                                </div>
                            ) : gameResult ? (
                                <div className="text-center py-12">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Game Complete!</h2>
                                    <div className="text-6xl mb-6">🎉</div>
                                    <div className="text-5xl font-bold text-blue-600 mb-2">
                                        {gameResult.score}
                                    </div>
                                    <p className="text-gray-500 mb-8 uppercase tracking-wide text-sm font-semibold">Points</p>

                                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8 text-left">
                                        <div className="bg-white/50 p-3 rounded-lg border border-gray-100">
                                            <span className="text-gray-500 text-xs block">Duration</span>
                                            <span className="text-gray-900 font-medium">{gameResult.duration}s</span>
                                        </div>
                                        <div className="bg-white/50 p-3 rounded-lg border border-gray-100">
                                            <span className="text-gray-500 text-xs block">Focus</span>
                                            <span className="text-gray-900 font-medium">{Math.round(gameResult.focusScore || 0)}%</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                setGameStarted(false);
                                                setGameResult(null);
                                            }}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md transition-colors"
                                        >
                                            Play Again
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <GameComponent onComplete={handleGameComplete} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
