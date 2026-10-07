import React, { useEffect, useRef } from 'react';

export function HalftoneWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    let time = 0;

    // Finer halftone grid setup with smaller micro-circles
    const spacing = 9; // Finer 9px spacing between dot centers
    let cols = Math.ceil(width / spacing) + 2;
    let rows = Math.ceil(height / spacing) + 2;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.ceil(width / spacing) + 2;
      rows = Math.ceil(height / spacing) + 2;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      time += 0.015;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Solid deep black background
      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffffff';

      // Iterate through 2D halftone micro-dot grid
      for (let i = 0; i < cols; i++) {
        const x0 = (i - 1) * spacing;

        for (let j = 0; j < rows; j++) {
          const y0 = (j - 1) * spacing;

          // Compute 3D silk wave height fields
          const wave1 = Math.sin(x0 * 0.006 + time * 1.1) * Math.cos(y0 * 0.005 + time * 0.9);
          const wave2 = Math.sin((x0 + y0) * 0.004 + time * 1.4) * 0.7;
          const wave3 = Math.cos(x0 * 0.008 - y0 * 0.007 + time * 0.7) * 0.5;

          let waveZ = wave1 + wave2 + wave3;

          // Distance to mouse cursor for interactive repulsion & ripple height
          const dx = mouse.x - x0;
          const dy = mouse.y - y0;
          const distSq = dx * dx + dy * dy;
          const radiusSq = 180 * 180;

          let displaceX = 0;
          let displaceY = 0;

          if (distSq < radiusSq && mouse.x > 0) {
            const dist = Math.sqrt(distSq);
            const factor = (1 - dist / 180);
            const mouseImpact = Math.pow(factor, 2);

            waveZ += mouseImpact * 3.0; // Height bulge under mouse

            const angle = Math.atan2(dy, dx);
            displaceX = -Math.cos(angle) * mouseImpact * 12;
            displaceY = -Math.sin(angle) * mouseImpact * 12;
          }

          // Normalize wave height z into [0, 1] range for halftone dot sizing
          const normZ = Math.max(0, Math.min(1, (waveZ + 1.8) / 3.6));

          // Smaller micro-dot radius scale
          const minRadius = 0.25;
          const maxRadius = 2.2;
          const dotRadius = minRadius + normZ * (maxRadius - minRadius);

          const minAlpha = 0.06;
          const maxAlpha = 0.95;
          const dotAlpha = minAlpha + Math.pow(normZ, 1.3) * (maxAlpha - minAlpha);

          // Render dot
          const renderX = x0 + displaceX;
          const renderY = y0 + displaceY;

          ctx.save();
          ctx.globalAlpha = dotAlpha;
          ctx.beginPath();
          ctx.arc(renderX, renderY, dotRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
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
