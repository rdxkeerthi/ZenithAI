'use client';

import { useEffect, useRef } from 'react';

export default function FloatingParticles({ density = 50, colors = ['#667eea', '#764ba2', '#f093fb', '#00f2fe'] }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        // Particle class
        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -10;
                this.size = Math.random() * 3 + 1;
                this.speedY = Math.random() * 0.5 + 0.2;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.2;
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.pulsePhase += this.pulseSpeed;

                // Reset if out of bounds
                if (this.y > canvas.height + 10) {
                    this.reset();
                }
                if (this.x < -10 || this.x > canvas.width + 10) {
                    this.x = Math.random() * canvas.width;
                }
            }

            draw(ctx) {
                const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
                const currentOpacity = this.opacity * pulse;

                ctx.save();
                ctx.globalAlpha = currentOpacity;

                // Draw glow
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size * 3
                );
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fill();

                // Draw core
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        // Initialize particles
        const initParticles = () => {
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000) * (density / 50);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [density, colors]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
        />
    );
}
