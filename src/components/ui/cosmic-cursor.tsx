import React, { useEffect, useRef } from 'react';

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  spin: number;
}

interface RippleRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export function CosmicCursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: StardustParticle[] = [];
    const ripples: RippleRing[] = [];
    const mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000 };

    const colors = ['#ffffff', '#38bdf8', '#818cf8', '#c084fc', '#67e8f9'];

    const spawnStardust = (x: number, y: number, count = 3) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.8 + 0.4;
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 1.8 + 0.6,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          color: colors[Math.floor(Math.random() * colors.length)] || '#38bdf8',
          spin: Math.random() * 0.1 - 0.05,
        });
      }
    };

    const spawnRipple = (x: number, y: number) => {
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius: Math.random() * 40 + 35,
        alpha: 0.8,
        color: colors[Math.floor(Math.random() * colors.length)] || '#38bdf8',
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.x;
      const dy = e.clientY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (dist > 4) {
        spawnStardust(mouse.x, mouse.y, Math.min(Math.floor(dist / 4), 6));
        if (dist > 25) {
          spawnRipple(mouse.x, mouse.y);
        }
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render cosmic ripple rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ring = ripples[i]!;
        ring.radius += 1.5;
        ring.alpha *= 0.94;

        if (ring.alpha <= 0.01 || ring.radius >= ring.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ring.alpha * 0.6;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render sparkling stardust particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        // Draw glowing particle spark
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra glow around bright stardust
        if (p.size > 1.2 && p.alpha > 0.4) {
          ctx.globalAlpha = p.alpha * 0.35;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Render trailing cosmic starlight cursor glow
      if (mouse.x > 0 && mouse.y > 0) {
        ctx.save();
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          35
        );
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
        gradient.addColorStop(0.5, 'rgba(129, 140, 248, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
