import { useEffect, useRef, useState } from 'react';

export default function useFaceTracking(videoRef, onFaceDetected) {
    const [isTracking, setIsTracking] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [landmarks, setLandmarks] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const faceMeshRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadMediaPipe = async () => {
            try {
                // Helper to load scripts
                const loadScript = (src) => {
                    return new Promise((resolve, reject) => {
                        const existingScript = document.querySelector(`script[src="${src}"]`);
                        if (existingScript) {
                            if (existingScript.getAttribute('data-loaded') === 'true') {
                                resolve();
                            } else {
                                existingScript.addEventListener('load', () => resolve());
                                existingScript.addEventListener('error', (e) => reject(e));
                            }
                            return;
                        }
                        const script = document.createElement('script');
                        script.src = src;
                        script.crossOrigin = 'anonymous';
                        script.onload = () => {
                            script.setAttribute('data-loaded', 'true');
                            resolve();
                        };
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                };

                // Load MediaPipe scripts from CDN (using latest reliable version)
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

                // Wait a moment for globals to be available
                if (!window.FaceMesh || !window.Camera) {
                    throw new Error('MediaPipe globals not found after script load');
                }

                faceMeshRef.current = new window.FaceMesh({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                    }
                });

                faceMeshRef.current.setOptions({
                    maxNumFaces: 1,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                faceMeshRef.current.onResults((results) => {
                    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                        const faceLandmarks = results.multiFaceLandmarks[0];
                        setFaceDetected(true);
                        setLandmarks(faceLandmarks);
                        setConfidence(0.85);

                        if (onFaceDetected) {
                            onFaceDetected({
                                landmarks: faceLandmarks,
                                confidence: 0.85
                            });
                        }
                    } else {
                        setFaceDetected(false);
                        setLandmarks(null);
                        setConfidence(0);
                    }
                });

                if (videoRef.current && isTracking) {
                    const camera = new window.Camera(videoRef.current, {
                        onFrame: async () => {
                            if (faceMeshRef.current && videoRef.current) {
                                await faceMeshRef.current.send({ image: videoRef.current });
                            }
                        },
                        width: 640,
                        height: 480
                    });
                    camera.start();
                }
            } catch (error) {
                console.error('❌ MediaPipe loading error:', error);
            }
        };

        if (isTracking) {
            loadMediaPipe();
        }

        return () => {
            if (faceMeshRef.current) {
                try {
                    faceMeshRef.current.close();
                } catch (error) {
                    console.log('MediaPipe cleanup info (harmless):', error);
                }
                faceMeshRef.current = null;
            }
        };
    }, [isTracking, videoRef, onFaceDetected]);

    return {
        isTracking,
        setIsTracking,
        faceDetected,
        landmarks,
        confidence
    };
}
