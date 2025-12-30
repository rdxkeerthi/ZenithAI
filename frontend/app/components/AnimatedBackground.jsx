'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Blob class for morphing shapes
        class Blob {
            constructor(x, y, radius, color) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.radius = radius;
                this.color = color;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = 0.0005 + Math.random() * 0.001;
                this.drift = 50 + Math.random() * 100;
            }

            update(time) {
                this.angle += this.speed;
                this.x = this.baseX + Math.cos(this.angle) * this.drift;
                this.y = this.baseY + Math.sin(this.angle) * this.drift;
            }

            draw(ctx) {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius
                );
                gradient.addColorStop(0, this.color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
                gradient.addColorStop(1, this.color.replace(')', ', 0)').replace('rgb', 'rgba'));

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create blobs
        const blobs = [
            new Blob(canvas.width * 0.2, canvas.height * 0.3, 300, 'rgb(102, 126, 234)'),
            new Blob(canvas.width * 0.8, canvas.height * 0.2, 350, 'rgb(118, 75, 162)'),
            new Blob(canvas.width * 0.5, canvas.height * 0.7, 280, 'rgb(240, 147, 251)'),
            new Blob(canvas.width * 0.1, canvas.height * 0.8, 250, 'rgb(0, 242, 254)'),
            new Blob(canvas.width * 0.9, canvas.height * 0.6, 320, 'rgb(245, 87, 108)'),
        ];

        // Animation loop
        const animate = () => {
            time += 0.01;

            // Create gradient background
            const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            bgGradient.addColorStop(0, '#0a0e27');
            bgGradient.addColorStop(1, '#1e293b');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw blobs
            blobs.forEach(blob => {
                blob.update(time);
                blob.draw(ctx);
            });

            // Apply blur effect
            ctx.filter = 'blur(60px)';
            ctx.drawImage(canvas, 0, 0);
            ctx.filter = 'none';

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
