import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  hasCrossGlint: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export function AnimeStarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000 };

    // Stars setup
    const starCount = Math.floor((width * height) / 2000);
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const size = Math.random() < 0.08 ? Math.random() * 1.8 + 1.2 : Math.random() * 1.0 + 0.4;
      const baseAlpha = Math.random() * 0.7 + 0.3;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        alpha: baseAlpha,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        hasCrossGlint: size > 1.8 && Math.random() < 0.6,
      });
    }

    // Shooting stars setup
    const shootingStars: ShootingStar[] = Array.from({ length: 3 }, () => ({
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      angle: 0,
      opacity: 0,
      active: false,
    }));

    const resetShootingStar = (star: ShootingStar) => {
      star.x = Math.random() * width * 0.8 + width * 0.1;
      star.y = Math.random() * height * 0.4;
      star.length = Math.random() * 80 + 60;
      star.speed = Math.random() * 12 + 8;
      star.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // ~45 degree drop
      star.opacity = 1;
      star.active = true;
    };

    // Periodically spawn shooting star
    const shootingInterval = setInterval(() => {
      const inactive = shootingStars.find((s) => !s.active);
      if (inactive && Math.random() < 0.7) {
        resetShootingStar(inactive);
      }
    }, 3500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Draw manga-style cumulus cloud puff clusters
    const drawCloudCluster = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      baseRadius: number,
      puffCount: number
    ) => {
      ctx.save();

      // Outer soft glow layer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let i = 0; i < puffCount; i++) {
        const angle = (i / puffCount) * Math.PI * 2;
        const dist = baseRadius * 0.5;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const r = baseRadius * (0.6 + Math.sin(i * 1.5) * 0.3);

        ctx.beginPath();
        ctx.arc(px, py, r * 1.25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mid shading layer (Manga tones)
      ctx.fillStyle = 'rgba(230, 235, 245, 0.12)';
      for (let i = 0; i < puffCount; i++) {
        const angle = (i / puffCount) * Math.PI * 2;
        const dist = baseRadius * 0.45;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const r = baseRadius * (0.55 + Math.cos(i * 2.1) * 0.25);

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core white puff layer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      for (let i = 0; i < puffCount; i++) {
        const angle = (i / puffCount) * Math.PI * 2;
        const dist = baseRadius * 0.35;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const r = baseRadius * (0.45 + Math.sin(i * 3.2) * 0.2);

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stylized Manga cloud line outlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < puffCount; i++) {
        const angle = (i / puffCount) * Math.PI * 2;
        const dist = baseRadius * 0.45;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const r = baseRadius * (0.55 + Math.cos(i * 2.1) * 0.25);

        ctx.beginPath();
        ctx.arc(px, py, r, angle - 0.5, angle + 1.2);
        ctx.stroke();
      }

      ctx.restore();
    };

    let time = 0;

    const render = () => {
      time += 0.01;

      // Deep Black Night Sky Base
      ctx.fillStyle = '#030307';
      ctx.fillRect(0, 0, width, height);

      // Subtle Cosmic Nebula Dust Gradient
      const bgGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        50,
        width * 0.5,
        height * 0.3,
        width * 0.8
      );
      bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      bgGradient.addColorStop(0.5, 'rgba(200, 210, 230, 0.02)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Render Sparkling Micro-Stars
      stars.forEach((star) => {
        // Twinkle update
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // Distance to cursor for interactive brightness & glint
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let alpha = star.alpha;

        if (dist < 120 && mouse.x > 0) {
          alpha = Math.min(1.0, alpha + (1 - dist / 120) * 0.6);
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';

        // Star dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross glint for bright manga stars
        if (star.hasCrossGlint || (dist < 80 && mouse.x > 0)) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 0.8;
          const glintLen = star.size * 3.5;

          ctx.beginPath();
          ctx.moveTo(star.x - glintLen, star.y);
          ctx.lineTo(star.x + glintLen, star.y);
          ctx.moveTo(star.x, star.y - glintLen);
          ctx.lineTo(star.x, star.y + glintLen);
          ctx.stroke();
        }

        ctx.restore();
      });

      // Render Shooting Stars
      shootingStars.forEach((star) => {
        if (!star.active) return;

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.restore();

        // Move star
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity *= 0.96;

        if (star.opacity <= 0.05 || star.x > width + 100 || star.y > height + 100) {
          star.active = false;
        }
      });

      // Render Manga Fluffy Clouds framing the screen (Top Corners & Bottom Edge)
      const cloudDrift = Math.sin(time * 0.5) * 8;

      // Bottom Right Large Cumulus Cloud Formation
      drawCloudCluster(ctx, width * 0.85 + cloudDrift, height * 0.88, 140, 9);
      drawCloudCluster(ctx, width * 0.95, height * 0.75, 110, 8);
      drawCloudCluster(ctx, width * 0.72, height * 0.95, 120, 7);

      // Bottom Left Cloud Formation
      drawCloudCluster(ctx, width * 0.12 - cloudDrift, height * 0.92, 130, 8);
      drawCloudCluster(ctx, width * 0.02, height * 0.80, 100, 7);

      // Top Left Cloud Formation
      drawCloudCluster(ctx, width * 0.08, height * 0.08 + cloudDrift * 0.5, 120, 8);
      drawCloudCluster(ctx, width * 0.22, height * 0.02, 90, 6);

      // Top Right Cloud Formation
      drawCloudCluster(ctx, width * 0.92, height * 0.12 - cloudDrift * 0.5, 110, 7);

      // Cursor glow in starry night
      if (mouse.x > 0) {
        ctx.save();
        const cursorGlow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          100
        );
        cursorGlow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        cursorGlow.addColorStop(0.5, 'rgba(200, 220, 255, 0.04)');
        cursorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = cursorGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(shootingInterval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
