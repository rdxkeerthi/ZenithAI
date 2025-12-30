'use client';

import { useEffect, useRef } from 'react';

export default function MediaPipeOverlay({ landmarks, show = true }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!show || !landmarks || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw face mesh
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;

        // Draw all 468 landmarks
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;

            // Draw landmark point
            ctx.fillStyle = index < 10 ? '#ff0000' : '#00ff00'; // Highlight first 10 points
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw connections (simplified - key facial features)
        const connections = [
            // Face oval
            [10, 338], [338, 297], [297, 332], [332, 284],
            [284, 251], [251, 389], [389, 356], [356, 454],
            [454, 323], [323, 361], [361, 288], [288, 397],
            [397, 365], [365, 379], [379, 378], [378, 400],
            [400, 377], [377, 152], [152, 148], [148, 176],
            [176, 149], [149, 150], [150, 136], [136, 172],
            [172, 58], [58, 132], [132, 93], [93, 234],
            [234, 127], [127, 162], [162, 21], [21, 54],
            [54, 103], [103, 67], [67, 109], [109, 10]
        ];

        ctx.strokeStyle = '#00ff0040';
        connections.forEach(([start, end]) => {
            if (landmarks[start] && landmarks[end]) {
                ctx.beginPath();
                ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
                ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
                ctx.stroke();
            }
        });

    }, [landmarks, show]);

    if (!show) return null;

    return (
        <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
