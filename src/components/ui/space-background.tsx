import React, { useEffect, useRef } from 'react';

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Generate dense field of small micro-stars (no planets)
    const starCount = Math.floor((width * height) / 2800);
    const colors = ['#ffffff', '#f0f9ff', '#e0f2fe', '#bae6fd'];

    const stars: Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      alphaSpeed: number;
      color: string;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.3 + 0.4, // Small small stars (0.4px to 1.7px)
        alpha: Math.random() * 0.8 + 0.2,
        alphaSpeed: (Math.random() * 0.012 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)] || '#ffffff',
      });
    }

    const render = () => {
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        star.alpha += star.alphaSpeed;
        if (star.alpha >= 0.95 || star.alpha <= 0.15) {
          star.alphaSpeed = -star.alphaSpeed;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.15, Math.min(0.95, star.alpha));
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow for tiny bright stars
        if (star.size > 1.2 && star.alpha > 0.6) {
          ctx.globalAlpha = star.alpha * 0.3;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0" 
    />
  );
}
