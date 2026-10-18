"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface Particle {
    theta: number; // angle along spiral
    speed: number;
    char: string;
    opacity: number;
    color: 'red' | 'dark' | 'dim';
    flipTimer: number;
}

interface Ripple {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    opacity: number;
}

export default function DynamicBinarySpiral() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Mouse tilt physics state
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const targetTilt = useRef({ x: 0, y: 0 });
    const currentTilt = useRef({ x: 0, y: 0 });

    // Interactive rotation angle
    const rotationAngle = useRef(0);
    const rotationSpeed = useRef(0.28);
    const targetSpeed = useRef(0.28);

    // Ripples on click
    const ripples = useRef<Ripple[]>([]);

    // Particles stream
    const particles = useRef<Particle[]>([]);

    // Handle mouse movement for 3D tilt
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        targetTilt.current = {
            x: -ny * 14, // rotateX
            y: nx * 14,  // rotateY
        };
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        targetSpeed.current = 0.75; // smoothly accelerate on hover
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        targetTilt.current = { x: 0, y: 0 };
        targetSpeed.current = 0.28; // return to gentle cruising speed
    }, []);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Spawn a shockwave ripple
        ripples.current.push({
            x,
            y,
            radius: 8,
            maxRadius: Math.max(rect.width, rect.height) * 0.65,
            opacity: 0.85,
        });

        // Boost spin momentum briefly
        rotationSpeed.current = 2.8;

        // Visual press bounce
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
    }, []);

    // Canvas animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;

        // Resize canvas with DPR
        const resizeCanvas = () => {
            if (!containerRef.current || !canvas) return;
            const rect = containerRef.current.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize streaming binary particles
        const numParticles = 36;
        particles.current = Array.from({ length: numParticles }, (_, i) => ({
            theta: (i / numParticles) * Math.PI * 7.5 + Math.random() * 0.4,
            speed: 0.007 + Math.random() * 0.01,
            char: Math.random() > 0.5 ? '1' : '0',
            opacity: 0.2 + Math.random() * 0.6,
            color: Math.random() > 0.7 ? 'red' : Math.random() > 0.35 ? 'dark' : 'dim',
            flipTimer: Math.floor(Math.random() * 35),
        }));

        const a = 3.4; // logarithmic spiral growth factor
        const b = 0.162;

        // Main render loop
        const render = () => {
            const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
            const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
            const centerX = width / 2;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

            // Smooth tilt physics lerp
            currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.08;
            currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.08;
            setTilt({ ...currentTilt.current });

            // Smooth rotation speed lerp
            rotationSpeed.current += (targetSpeed.current - rotationSpeed.current) * 0.04;
            rotationAngle.current = (rotationAngle.current + rotationSpeed.current) % 360;

            const globalRot = (rotationAngle.current * Math.PI) / 180;

            // Draw click ripples
            for (let i = ripples.current.length - 1; i >= 0; i--) {
                const r = ripples.current[i];
                r.radius += 5.0;
                r.opacity *= 0.94;

                ctx.save();
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(225, 29, 72, ${r.opacity * 0.6})`;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();

                if (r.opacity < 0.01 || r.radius > r.maxRadius) {
                    ripples.current.splice(i, 1);
                }
            }

            // Draw streaming binary bits along logarithmic spiral
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            particles.current.forEach(p => {
                // Inward flow: theta decreases towards center
                p.theta -= p.speed * (1 + (isHovered ? 0.7 : 0));

                // If particle reaches singularity, respawn at outer boundary
                if (p.theta < 0.6) {
                    p.theta = Math.PI * 7.5 + Math.random() * 0.4;
                    p.char = Math.random() > 0.5 ? '1' : '0';
                }

                // Bit flip animation
                p.flipTimer++;
                if (p.flipTimer > 45) {
                    p.char = p.char === '1' ? '0' : '1';
                    p.flipTimer = 0;
                }

                // Calculate spiral radius r = a * e^(b * theta)
                const r = a * Math.exp(b * p.theta);
                const maxR = Math.min(width, height) * 0.45;

                if (r <= maxR && r > 10) {
                    const currentAngle = p.theta + globalRot;
                    const x = centerX + r * Math.cos(currentAngle);
                    const y = centerY + r * Math.sin(currentAngle);

                    // Dynamic font size scaling with radius
                    const fontSize = Math.max(9, Math.min(15, (r / maxR) * 15));
                    ctx.font = `800 ${fontSize}px var(--font-geist-mono), monospace`;

                    if (p.color === 'red') {
                        ctx.fillStyle = `rgba(225, 29, 72, ${p.opacity * (isHovered ? 1 : 0.85)})`;
                        ctx.shadowColor = 'rgba(225, 29, 72, 0.5)';
                        ctx.shadowBlur = 5;
                    } else if (p.color === 'dark') {
                        ctx.fillStyle = `rgba(15, 23, 42, ${p.opacity * 0.75})`;
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.fillStyle = `rgba(100, 116, 139, ${p.opacity * 0.5})`;
                        ctx.shadowBlur = 0;
                    }

                    // Save context for tangent rotation along the spiral arm
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(currentAngle + Math.PI / 2);
                    ctx.fillText(p.char, 0, 0);
                    ctx.restore();
                }
            });

            ctx.restore();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isHovered]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] aspect-square flex items-center justify-center select-none cursor-pointer group"
            style={{
                perspective: '1100px',
            }}
        >
            {/* Very soft feather ambient radial aura - no hard circular borders */}
            <div
                className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
                style={{
                    background: isHovered
                        ? 'radial-gradient(circle at center, rgba(225, 29, 72, 0.08) 0%, rgba(15, 23, 42, 0.02) 45%, transparent 70%)'
                        : 'radial-gradient(circle at center, rgba(225, 29, 72, 0.04) 0%, transparent 60%)',
                    transform: 'scale(1.2)',
                }}
                aria-hidden="true"
            />

            {/* 3D Tilted Interactive Container */}
            <div
                className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
                style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isPressed ? 0.98 : isHovered ? 1.03 : 1})`,
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* The Rotating High-Res Binary Spiral Image - fully seamless, no clipping boundary */}
                <div
                    className="relative w-full h-full flex items-center justify-center animate-spiral-vortex"
                    style={{
                        transform: `rotate(${rotationAngle.current}deg)`,
                        willChange: 'transform',
                    }}
                >
                    <Image
                        src="/binary-spiral.png"
                        alt="AFRIKYIA Binary Architecture Spiral"
                        width={540}
                        height={540}
                        priority
                        className="w-full h-full object-contain select-none pointer-events-none transition-all duration-500"
                        style={{
                            filter: isHovered ? 'drop-shadow(0 4px 14px rgba(225,29,72,0.12))' : 'none',
                        }}
                    />
                </div>

                {/* Live Canvas Overlay with Streaming Bits & Shockwaves */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />

                {/* Central Digital Vortex Core (Singularity Pulsar) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center">
                    {/* Soft expanding energy ping */}
                    <div
                        className="w-6 h-6 rounded-full bg-brand-red/20 blur-[1px] animate-ping"
                        style={{ animationDuration: isHovered ? '1.2s' : '2.2s' }}
                    />
                    {/* Glowing node core */}
                    <div className="absolute w-2 h-2 rounded-full bg-brand-red shadow-sm shadow-brand-red" />
                </div>
            </div>
        </div>
    );
}
