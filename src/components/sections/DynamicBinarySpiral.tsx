"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface Particle {
    theta: number; // angle along spiral
    speed: number;
    size: number;
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
    const rotationSpeed = useRef(0.25);
    const targetSpeed = useRef(0.25);

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
            x: -ny * 16, // rotateX
            y: nx * 16,  // rotateY
        };
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        targetSpeed.current = 0.85; // accelerate on hover
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        targetTilt.current = { x: 0, y: 0 };
        targetSpeed.current = 0.25; // return to cruising speed
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
            radius: 5,
            maxRadius: Math.max(rect.width, rect.height) * 0.75,
            opacity: 0.9,
        });

        // Boost spin briefly
        rotationSpeed.current = 3.5;

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
        const numParticles = 42;
        particles.current = Array.from({ length: numParticles }, (_, i) => ({
            theta: (i / numParticles) * Math.PI * 8 + Math.random() * 0.5,
            speed: 0.008 + Math.random() * 0.012,
            size: 10 + Math.random() * 6,
            char: Math.random() > 0.5 ? '1' : '0',
            opacity: 0.25 + Math.random() * 0.65,
            color: Math.random() > 0.75 ? 'red' : Math.random() > 0.4 ? 'dark' : 'dim',
            flipTimer: Math.floor(Math.random() * 30),
        }));

        const a = 3.2; // logarithmic spiral growth factor
        const b = 0.165;

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
            rotationSpeed.current += (targetSpeed.current - rotationSpeed.current) * 0.05;
            rotationAngle.current = (rotationAngle.current + rotationSpeed.current) % 360;

            const globalRot = (rotationAngle.current * Math.PI) / 180;

            // Draw click ripples
            for (let i = ripples.current.length - 1; i >= 0; i--) {
                const r = ripples.current[i];
                r.radius += 5.5;
                r.opacity *= 0.94;

                ctx.save();
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(225, 29, 72, ${r.opacity * 0.7})`;
                ctx.lineWidth = 2.5;
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
                p.theta -= p.speed * (1 + (isHovered ? 0.8 : 0));

                // If particle reaches singularity, respawn at outer boundary
                if (p.theta < 0.5) {
                    p.theta = Math.PI * 8 + Math.random() * 0.5;
                    p.char = Math.random() > 0.5 ? '1' : '0';
                }

                // Bit flip animation
                p.flipTimer++;
                if (p.flipTimer > 40) {
                    p.char = p.char === '1' ? '0' : '1';
                    p.flipTimer = 0;
                }

                // Calculate spiral radius r = a * e^(b * theta)
                const r = a * Math.exp(b * p.theta);
                const maxR = Math.min(width, height) * 0.48;

                if (r <= maxR && r > 8) {
                    const currentAngle = p.theta + globalRot;
                    const x = centerX + r * Math.cos(currentAngle);
                    const y = centerY + r * Math.sin(currentAngle);

                    // Dynamic font size scaling with radius (larger on outer rim, smaller at center)
                    const fontSize = Math.max(9, Math.min(16, (r / maxR) * 16));
                    ctx.font = `800 ${fontSize}px var(--font-geist-mono), monospace`;

                    if (p.color === 'red') {
                        ctx.fillStyle = `rgba(225, 29, 72, ${p.opacity * (isHovered ? 1 : 0.85)})`;
                        ctx.shadowColor = 'rgba(225, 29, 72, 0.6)';
                        ctx.shadowBlur = 6;
                    } else if (p.color === 'dark') {
                        ctx.fillStyle = `rgba(15, 23, 42, ${p.opacity * 0.8})`;
                        ctx.shadowBlur = 0;
                    } else {
                        ctx.fillStyle = `rgba(100, 116, 139, ${p.opacity * 0.55})`;
                        ctx.shadowBlur = 0;
                    }

                    // Save context for tangent rotation
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
            className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[540px] aspect-square flex items-center justify-center select-none cursor-pointer group"
            style={{
                perspective: '1100px',
            }}
        >
            {/* Ambient Radial Backlight Glow */}
            <div
                className="absolute inset-0 rounded-full pointer-events-none transition-all duration-700 ease-out"
                style={{
                    background: isHovered
                        ? 'radial-gradient(circle at center, rgba(225, 29, 72, 0.12) 0%, rgba(15, 23, 42, 0.04) 50%, transparent 75%)'
                        : 'radial-gradient(circle at center, rgba(225, 29, 72, 0.06) 0%, rgba(15, 23, 42, 0.02) 45%, transparent 70%)',
                    transform: 'scale(1.25)',
                }}
                aria-hidden="true"
            />

            {/* Counter-rotating subtle orbital ring with compass tick marks */}
            <div
                className="absolute w-[95%] h-[95%] rounded-full border border-slate-200/50 border-dashed animate-spiral-spin-reverse pointer-events-none transition-opacity duration-500"
                style={{
                    opacity: isHovered ? 0.85 : 0.45,
                }}
                aria-hidden="true"
            />

            {/* Concentric subtle radar pulse ring */}
            <div
                className="absolute w-[75%] h-[75%] rounded-full border border-brand-red/10 pointer-events-none animate-pulse"
                style={{ animationDuration: '4s' }}
                aria-hidden="true"
            />

            {/* 3D Tilted Interactive Card Container */}
            <div
                className="relative w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
                style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isPressed ? 0.97 : isHovered ? 1.04 : 1})`,
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* The Rotating High-Res Binary Spiral Image */}
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
                        className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm transition-all duration-500"
                        style={{
                            filter: isHovered ? 'contrast(1.08) drop-shadow(0 4px 16px rgba(225,29,72,0.15))' : 'none',
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
                    {/* Expanding energy pulse */}
                    <div
                        className="w-8 h-8 rounded-full bg-brand-red/20 blur-xs animate-ping"
                        style={{ animationDuration: isHovered ? '1.2s' : '2.4s' }}
                    />
                    {/* Glowing outer halo */}
                    <div
                        className="absolute w-4 h-4 rounded-full bg-brand-red/40 blur-[1px] transition-transform duration-300"
                        style={{ transform: isHovered ? 'scale(1.4)' : 'scale(1)' }}
                    />
                    {/* Sharp core pulsar node */}
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-brand-red shadow-md shadow-brand-red/80" />
                </div>
            </div>

            {/* Interactive Status Tooltip / Badge on Hover */}
            <div
                className={`absolute bottom-2 inset-x-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
            >
                <div className="inline-flex items-center gap-2 bg-slate-900/90 text-white text-[11px] font-mono font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border border-slate-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                    <span>ALGO_STREAM // CLICK_BURST</span>
                </div>
            </div>
        </div>
    );
}
