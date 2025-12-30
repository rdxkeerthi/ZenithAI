'use client';

import { useEffect, useRef } from 'react';

export default function MouseTrail() {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.01;

                // Color variations - blue/purple theme like Antigravity
                const colors = [
                    { r: 102, g: 126, b: 234 },  // #667eea
                    { r: 118, g: 75, b: 162 },   // #764ba2
                    { r: 79, g: 172, b: 254 },   // #4facfe
                    { r: 0, g: 242, b: 254 },    // #00f2fe
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= this.decay;
                this.size *= 0.98;
            }

            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = this.life;

                // Create gradient for each particle
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size
                );
                gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`);
                gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            isDead() {
                return this.life <= 0 || this.size <= 0.1;
            }
        }

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;

            // Create new particles
            for (let i = 0; i < 3; i++) {
                particlesRef.current.push(
                    new Particle(
                        e.clientX + (Math.random() - 0.5) * 10,
                        e.clientY + (Math.random() - 0.5) * 10
                    )
                );
            }

            // Limit particle count
            if (particlesRef.current.length > 300) {
                particlesRef.current = particlesRef.current.slice(-300);
            }
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(particle => {
                particle.update();
                particle.draw(ctx);
                return !particle.isDead();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
}
