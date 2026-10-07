"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

export interface CursorDrivenParticleTypographyProps {
    /** Additional CSS classes */
    className?: string;
    /** The text to render */
    text: string;
    /** Font size in pixels */
    fontSize?: number;
    /** Font family */
    fontFamily?: string;
    /** Size of each particle */
    particleSize?: number;
    /** Density of particles (lower number = more particles, minimum 1) */
    particleDensity?: number;
    /** How strongly the cursor pushes particles away */
    dispersionStrength?: number;
    /** Speed at which particles return to origin */
    returnSpeed?: number;
    /** Custom color for particles. Overrides inherited text color if set. */
    color?: string;
}

class Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    dispersion: number;
    returnSpd: number;

    constructor(
        x: number,
        y: number,
        size: number,
        color: string,
        dispersion: number,
        returnSpd: number
    ) {
        this.x = x + (Math.random() - 0.5) * 10; // start with slight randomness
        this.y = y + (Math.random() - 0.5) * 10;
        this.originX = x;
        this.originY = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.size = size;
        this.color = color;
        this.dispersion = dispersion;
        this.returnSpd = returnSpd;
    }

    update(mouseX: number, mouseY: number) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Physics interaction with mouse
        const interactionRadius = 90; // Interaction radius

        if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;

            const force = (interactionRadius - distance) / interactionRadius;

            // Calculate repulsion
            const repulsionX = forceDirectionX * force * this.dispersion;
            const repulsionY = forceDirectionY * force * this.dispersion;

            this.vx -= repulsionX;
            this.vy -= repulsionY;
        }

        // Return to origin (spring physics)
        this.vx += (this.originX - this.x) * this.returnSpd;
        this.vy += (this.originY - this.y) * this.returnSpd;

        // Friction
        this.vx *= 0.85;
        this.vy *= 0.85;

        // Add subtle noise/jitter when close to origin
        const distToOrigin = Math.sqrt(
            Math.pow(this.x - this.originX, 2) + Math.pow(this.y - this.originY, 2)
        );
        if (distToOrigin < 1 && Math.random() > 0.95) {
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
        }

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function CursorDrivenParticleTypography({
    className,
    text,
    fontSize = 28,
    fontFamily = "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
    particleSize = 1.2,
    particleDensity = 3,
    dispersionStrength = 12,
    returnSpeed = 0.08,
    color = "#f4f4f5",
}: CursorDrivenParticleTypographyProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        let mouseX = -1000;
        let mouseY = -1000;

        let containerWidth = 0;
        let containerHeight = 0;

        const init = () => {
            const container = containerRef.current;
            if (!container) return;

            containerWidth = container.clientWidth;
            containerHeight = container.clientHeight;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = containerWidth * dpr;
            canvas.height = containerHeight * dpr;
            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${containerHeight}px`;

            ctx.scale(dpr, dpr);

            // Determine text color
            const computedStyle = window.getComputedStyle(container);
            const textColor = color || computedStyle.color || "#ffffff";

            ctx.clearRect(0, 0, containerWidth, containerHeight);

            // Draw text to generate pixel map
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Draw standard text to measure it
            ctx.fillText(text, containerWidth / 2, containerHeight / 2);

            // Get pixel data
            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
            particles = [];

            // Create particles from text pixels
            const step = Math.max(1, Math.floor(particleDensity * dpr));
            for (let y = 0; y < textCoordinates.height; y += step) {
                for (let x = 0; x < textCoordinates.width; x += step) {
                    const index = (y * textCoordinates.width + x) * 4;
                    const alpha = textCoordinates.data[index + 3] || 0;

                    if (alpha > 128) {
                        particles.push(
                            new Particle(
                                x / dpr,
                                y / dpr,
                                particleSize,
                                textColor,
                                dispersionStrength,
                                returnSpeed
                            )
                        );
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, containerWidth, containerHeight);

            particles.forEach((particle) => {
                particle.update(mouseX, mouseY);
                particle.draw(ctx);
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const updateMousePos = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = clientX - rect.left;
            mouseY = clientY - rect.top;
        };

        const handleWindowMouseMove = (e: MouseEvent) => {
            updateMousePos(e.clientX, e.clientY);
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        const handleResize = () => {
            init();
        };

        const timeoutId = setTimeout(() => {
            init();
            animate();
        }, 100);

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener("mousemove", handleWindowMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
            window.removeEventListener("mousemove", handleWindowMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [text, fontSize, fontFamily, particleSize, particleDensity, dispersionStrength, returnSpeed, color]);

    return (
        <div
            ref={containerRef}
            className={cn("relative inline-flex items-center justify-center select-none", className)}
        >
            <canvas
                ref={canvasRef}
                className="block"
            />
        </div>
    );
}
