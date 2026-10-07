import React, { useEffect, useRef } from 'react';

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define OCT 5
#define LAYERS 2
uniform vec2 u_res; uniform float u_t; uniform float u_i;

vec2 h2(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1. + 2. * fract(sin(p) * 43758.5453123);
}
float gn(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(dot(h2(i), f), dot(h2(i + vec2(1., 0.)), f - vec2(1., 0.)), u.x),
             mix(dot(h2(i + vec2(0., 1.)), f - vec2(0., 1.)), dot(h2(i + vec2(1., 1.)), f - vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p){
  float a = .5, s = 0.;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < OCT; i++){ s += a * gn(p); p = m * p; a *= .5; }
  return s;
}
vec2 rot(vec2 p, float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c) * p; }

// returns x = thin wisps, y = soft mist density
vec2 layer(vec2 p, float t){
  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t));
  float f = fbm(p + 2.5 * q);
  float ridge = pow(clamp(1. - abs(f) * 3.2, 0., 1.), 5.);
  float dens = smoothstep(-.05, .35, fbm(p * .45 + vec2(3., 7.) + t * .5));
  return vec2(ridge * dens, dens);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (uv - .5) * vec2(u_res.x / u_res.y, 1.) * 1.7;

  vec2 a = layer(rot(p, sin(u_t * .03) * .15) + vec2(0., -u_t * .012), u_t * .03);
  float w = a.x * 1.2, mist = a.y * 0.12;
#if LAYERS > 1
  vec2 b = layer(rot(p * 1.35, -sin(u_t * .021) * .2) + vec2(7. + u_t * .008, 3. - u_t * .006), -u_t * .022);
  w += b.x * 0.9; mist += b.y * 0.08;
#endif

  // keep the centre slightly calmer so content stays the focus
  float edge = .6 + .4 * smoothstep(.0, .8, length(uv - .5) * 1.5);
  float alpha = clamp((w + mist) * edge, 0., 1.) * u_i;
  alpha += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255.; // anti-banding
  alpha = clamp(alpha, 0., 1.);
  vec3 col = vec3(.82, .88, .96);                 // cool grey-white smoke
  vec3 bg = vec3(0.0, 0.0, 0.0);                  // pitch black background
  vec3 finalColor = mix(bg, col, alpha);          // mix smoke over black
  gl_FragColor = vec4(finalColor, 1.0);           // opaque WebGL rendering
}
`;

export interface SmokeBackgroundProps {
  intensity?: number;
  className?: string;
}

export function SmokeBackgroundComponent({ intensity = 0.22, className = '' }: SmokeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const gl = cv.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    function sh(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.warn(gl!.getShaderInfoLog(s));
      }
      return s;
    }

    const vertShader = sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
    const fragShader = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vertShader || !fragShader) return;

    const pr = gl.createProgram();
    if (!pr) return;
    gl.attachShader(pr, vertShader);
    gl.attachShader(pr, fragShader);
    gl.linkProgram(pr);
    gl.useProgram(pr);

    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const l = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(l);
    gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(pr, 'u_res');
    const uT = gl.getUniformLocation(pr, 'u_t');
    const uI = gl.getUniformLocation(pr, 'u_i');

    gl.uniform1f(uI, intensity);

    let resizeTimer: number;
    function rs() {
      if (!cv || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uR, cv.width, cv.height);
    }

    function onResize() {
      cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(rs);
    }

    rs();
    window.addEventListener('resize', onResize);

    let animationFrameId: number;
    let t = Math.random() * 200;
    let last = 0;
    let isRunning = true;

    function render(n: number) {
      if (!isRunning) return;
      animationFrameId = requestAnimationFrame(render);
      if (document.visibilityState === 'hidden') return;

      const d = n - last;
      if (d < 24) return;
      last = n;
      t += Math.min(d, 100) / 1000;
      gl!.uniform1f(uT, t);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        last = performance.now();
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    render(0);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      try {
        gl.deleteBuffer(b);
        gl.deleteProgram(pr);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
      } catch {
        // ignore disposal errors
      }
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0, backgroundColor: '#000000' }}
    />
  );
}

export const SmokeBackground = React.memo(SmokeBackgroundComponent);
export default SmokeBackground;

