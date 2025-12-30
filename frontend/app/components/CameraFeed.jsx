'use client';

import { useRef, useEffect, useState } from 'react';
import api from '../services/api'; // Restored API import
import MediaPipeOverlay from './MediaPipeOverlay';
import useFaceTracking from '../hooks/useFaceTracking';
import RealTimeGraph from './RealTimeGraph';

export default function CameraFeed({ sessionId, onStressUpdate, autoStart = false }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState('');
    const [wsStatus, setWsStatus] = useState('disconnected');
    const [localStressData, setLocalStressData] = useState(null);
    const wsRef = useRef(null);
    const frameIntervalRef = useRef(null);
    const [showLandmarks, setShowLandmarks] = useState(true);

    // Use shared Face Tracking hook for Mesh
    const { isTracking, setIsTracking, faceDetected, landmarks } = useFaceTracking(videoRef);

    // Auto-start camera when sessionId is provided and autoStart is enabled
    useEffect(() => {
        if (sessionId && autoStart && !isActive && !error) {
            console.log('🚀 Auto-starting camera for session:', sessionId);
            setIsActive(true);
        }
    }, [sessionId, autoStart]);

    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let interval;
        if (isActive && wsStatus === 'connected') {
            const startTime = Date.now() - (elapsedTime * 1000);
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, wsStatus]);

    useEffect(() => {
        if (!isActive) setElapsedTime(0);
    }, [isActive]);

    useEffect(() => {
        if (isActive && sessionId) {
            startCamera();
            connectWebSocket();
            setIsTracking(true);
        } else {
            setIsTracking(false);
        }

        return () => {
            stopCamera();
            disconnectWebSocket();
            setIsTracking(false);
        };
    }, [isActive, sessionId]);

    const startCamera = async () => {
        try {
            setError('');

            // Simplest possible constraints - just request video
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Wait for metadata to load before playing
                videoRef.current.onloadedmetadata = async () => {
                    try {
                        // Set video properties
                        videoRef.current.muted = true;
                        videoRef.current.playsInline = true;

                        await videoRef.current.play();
                        console.log('✅ Camera started successfully');
                        processFrames();
                    } catch (playError) {
                        console.error("Error playing video:", playError);
                        // Retry once after a short delay
                        setTimeout(async () => {
                            try {
                                await videoRef.current.play();
                                console.log('✅ Camera started on retry');
                                processFrames();
                            } catch (retryError) {
                                setError('Failed to start video playback. Please refresh and try again.');
                                setIsActive(false);
                            }
                        }, 500);
                    }
                };
            }
        } catch (err) {
            console.error('❌ Camera error:', err);

            // Provide specific error messages
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera permission denied. Please allow camera access in your browser settings and click retry.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera found. Please connect a camera and try again.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera is already in use by another application. Please close other apps using the camera.');
            } else if (err.name === 'OverconstrainedError') {
                setError('Camera does not support the required settings. Trying with basic settings...');
                // Retry with minimal constraints
                retryWithBasicConstraints();
            } else {
                setError(`Camera error: ${err.message || 'Unknown error'}. Please try again.`);
            }

            setIsActive(false);
        }
    };

    const retryWithBasicConstraints = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = async () => {
                    await videoRef.current.play();
                    console.log('✅ Camera started with basic constraints');
                    processFrames();
                    setError('');
                    setIsActive(true);
                };
            }
        } catch (retryErr) {
            setError('Failed to start camera even with basic settings. Please check your camera.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }

        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }
    };

    const [stressHistory, setStressHistory] = useState({ history: [] });

    const connectWebSocket = () => {
        console.log('🔌 Connecting WebSocket for session:', sessionId);
        wsRef.current = api.connectWebSocket(
            sessionId,
            (data) => {
                // Update local state for overlay
                if (data.status === 'success') {
                    setLocalStressData(data);

                    // Update history for graph
                    setStressHistory(prev => ({
                        history: [...prev.history, { stress: data.stress_score, timestamp: Date.now() }].slice(-60)
                    }));
                }

                // Propagate to parent
                if (onStressUpdate && data.status === 'success') {
                    onStressUpdate(data);
                }
            },
            (status) => {
                setWsStatus(status);
                // console.log('🔌 WebSocket status:', status);
            }
        );
    };

    const disconnectWebSocket = () => {
        if (wsRef.current) {
            api.disconnectWebSocket();
            wsRef.current = null;
        }
    };

    const processFrames = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');

        // Send frames at 10 FPS
        frameIntervalRef.current = setInterval(() => {
            if (!isActive || !wsRef.current || wsStatus !== 'connected') return;

            try {
                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Get image data
                const imageData = canvas.toDataURL('image/jpeg', 0.7);

                // Send to backend via WebSocket
                if (wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        frame: imageData,
                        timestamp: Date.now()
                    }));
                }
            } catch (err) {
                console.error('❌ Frame processing error:', err);
            }
        }, 100); // 10 FPS
    };

    // Auto-stop after 30 seconds
    useEffect(() => {
        if (elapsedTime >= 30 && isActive) {
            console.log("⏱️ 30s Analysis Limit Reached. Stopping.");
            setIsActive(false);
            stopCamera(); // Stop camera stream
            disconnectWebSocket(); // Close connection

            // Notify parent that session is complete
            if (onStressUpdate) {
                // Determine final status based on last reading or average
                api.completeSession(sessionId).catch(console.error);
                onStressUpdate({
                    status: 'completed',
                    stress_score: localStressData?.stress_score || 0
                });
            }
        }
    }, [elapsedTime, isActive]);

    const getStatusColor = () => {
        if (elapsedTime >= 30) return 'text-blue-600';
        switch (wsStatus) {
            case 'connected': return 'text-green-600';
            case 'connecting': return 'text-yellow-600';
            case 'reconnecting': return 'text-orange-600';
            case 'error': return 'text-red-600';
            case 'failed': return 'text-red-700';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = () => {
        if (elapsedTime >= 30) return 'Analysis Complete';

        switch (wsStatus) {
            case 'connected': return 'Analyzing - Keep Head Still';
            case 'connecting': return 'Server Connecting...';
            case 'reconnecting': return 'Reconnecting...';
            case 'error': return 'Connection Error';
            case 'failed': return 'Connection Failed';
            default: return 'Ready to Start';
        }
    };

    return (
        <div className="relative glass-panel p-2">
            <div className="bg-black/90 rounded-2xl overflow-hidden shadow-glass relative aspect-video">
                {!isActive && elapsedTime >= 30 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <div className="text-center">
                            <div className="text-5xl mb-2">✅</div>
                            <h3 className="text-2xl font-bold text-white">Session Complete</h3>
                            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-blue-600 rounded-full text-white text-sm">
                                Start New
                            </button>
                        </div>
                    </div>
                ) : null}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto"
                    style={{ transform: 'scaleX(-1)' }} // Mirror effect
                />
                <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    className="hidden"
                />

                {/* Visual Overlays */}
                {isActive && (
                    <>
                        {/* MediaPipe Face Mesh */}
                        <MediaPipeOverlay landmarks={landmarks} show={showLandmarks} />

                        {/* Stress Info Overlay */}
                        {localStressData && (
                            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 transition-all duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs text-slate-300">Stress Level</div>
                                    <div className="flex gap-2">
                                        <span className={`text-lg font-bold ${localStressData.stress_level === 'High' ? 'text-red-400' :
                                            localStressData.stress_level === 'Medium' ? 'text-yellow-400' :
                                                'text-green-400'
                                            }`}>
                                            {localStressData.stress_level}
                                        </span>
                                        <span className="text-sm font-mono text-white mt-1">
                                            ({Math.round(localStressData.stress_score)}/100)
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${localStressData.stress_level === 'High' ? 'bg-red-500' :
                                            localStressData.stress_level === 'Medium' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                        style={{ width: `${localStressData.stress_score}%` }}
                                    />
                                </div>

                                {/* Factors (Advanced Info) */}
                                {localStressData.factors && Object.keys(localStressData.factors).length > 0 && (
                                    <div className="mt-2 text-[10px] text-slate-400 flex gap-2">
                                        {localStressData.factors.work_load === 'High' && <span>🏢 High Workload</span>}
                                        {localStressData.factors.sleep === 'Poor' && <span>💤 Low Sleep</span>}
                                        {localStressData.factors.screen_time === 'High' && <span>📱 High Screen Time</span>}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {error && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{error}</p>
                            <button
                                onClick={() => {
                                    setError('');
                                    setIsActive(true);
                                }}
                                className="mt-2 text-sm font-semibold text-red-600 hover:text-red-800 underline"
                            >
                                Retry Camera Access
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
                <button
                    onClick={() => setIsActive(!isActive)}
                    disabled={!!error}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                >
                    {isActive ? 'Stop Analysis' : 'Start Analysis'}
                </button>

                {isActive && (
                    <button
                        onClick={() => setShowLandmarks(!showLandmarks)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium transition-colors"
                    >
                        {showLandmarks ? 'Hide Mesh' : 'Show Mesh'}
                    </button>
                )}
            </div>

            {isActive && (
                <div className={`mt-2 flex items-center text-sm ${getStatusColor()}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${wsStatus === 'connected' ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></div>
                    {getStatusText()}
                    {wsStatus === 'connected' && (
                        <span className="ml-4 font-mono font-medium text-slate-500">
                            {new Date(elapsedTime * 1000).toISOString().substr(11, 8)}
                        </span>
                    )}
                </div>
            )}
            {/* Real-time Graph */}
            {stressHistory.history.length > 0 && (
                <div className="mt-4">
                    <RealTimeGraph stressData={stressHistory} />
                </div>
            )}
        </div>
    );
}

