import React, { useEffect, useRef } from "react";

export interface GrainGradientProps {
  colorLight?: string;
  colorMid?: string;
  colorDark?: string;
  angle?: number;
  position?: number;
  curve?: number;
  softness?: number;
  scale?: number;
  grain?: number;
  grainSize?: number;
  seed?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function GrainGradient({
  colorLight = "#4ade80",
  colorMid = "#0f766e",
  colorDark = "#020617",
  angle = 45,
  position = 0,
  curve = 0.5,
  softness = 0.2,
  scale = 1.2,
  grain = 0.35,
  grainSize = 1,
  seed = 1,
  speed = 1,
  className = "",
  style,
}: GrainGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();

    // Offscreen Canvas for generating film noise texture
    const noiseCanvas = document.createElement("canvas");
    const noiseSize = 128;
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext("2d");

    if (noiseCtx) {
      const imgData = noiseCtx.createImageData(noiseSize, noiseSize);
      const data = imgData.data;
      let currentSeed = seed;

      const pseudoRandom = () => {
        const x = Math.sin(currentSeed++) * 10000;
        return x - Math.floor(x);
      };

      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor((seed > 0 ? pseudoRandom() : Math.random()) * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
      noiseCtx.putImageData(imgData, 0, 0);
    }

    const noisePattern = ctx.createPattern(noiseCanvas, "repeat");

    // Render loop with dynamic sizing check
    const render = (now: number) => {
      if (!containerRef.current || !canvas) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = Math.floor(rect.width * dpr);
      const targetHeight = Math.floor(rect.height * dpr);

      if (targetWidth === 0 || targetHeight === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      const elapsed = (now - startTime) / 1000;
      const t = speed > 0 ? elapsed * speed * 0.4 : 0;

      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Base background fill (colorDark)
      ctx.fillStyle = colorDark;
      ctx.fillRect(0, 0, width, height);

      // Calculate dynamic gradient center points
      const radAngle = (angle * Math.PI) / 180;
      const cx = width * (0.5 + position * 0.2 + Math.sin(t * 0.5) * 0.12);
      const cy = height * (0.5 + Math.cos(t * 0.4) * 0.12);
      const baseRadius = Math.max(width, height) * scale * 0.75;

      // ColorMid Blob Gradient
      const blob1X = cx + Math.cos(radAngle + t * 0.6) * width * 0.3 * curve;
      const blob1Y = cy + Math.sin(radAngle + t * 0.6) * height * 0.3 * curve;
      const grad1 = ctx.createRadialGradient(
        blob1X,
        blob1Y,
        baseRadius * softness,
        blob1X,
        blob1Y,
        baseRadius
      );
      grad1.addColorStop(0, colorMid);
      grad1.addColorStop(1, "transparent");

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // ColorLight Glow Blob Gradient
      const blob2X = cx - Math.sin(radAngle - t * 0.5) * width * 0.25 * curve;
      const blob2Y = cy - Math.cos(radAngle - t * 0.5) * height * 0.25 * curve;
      const grad2 = ctx.createRadialGradient(
        blob2X,
        blob2Y,
        baseRadius * softness * 0.4,
        blob2X,
        blob2Y,
        baseRadius * 0.85
      );
      grad2.addColorStop(0, colorLight);
      grad2.addColorStop(0.5, colorMid);
      grad2.addColorStop(1, "transparent");

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Film Grain Overlay
      if (grain > 0 && noisePattern) {
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = Math.min(grain, 1);
        ctx.fillStyle = noisePattern;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    colorLight,
    colorMid,
    colorDark,
    angle,
    position,
    curve,
    softness,
    scale,
    grain,
    grainSize,
    seed,
    speed,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />
    </div>
  );
}

export default GrainGradient;
