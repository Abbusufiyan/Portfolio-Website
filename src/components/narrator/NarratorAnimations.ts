import { useEffect, useRef, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Object3D, Mesh, Material } from 'three';
import { EXPRESSIONS, ExpressionPreset } from './NarratorExpressions';

const { damp, clamp } = MathUtils;

export interface NarratorState {
  speaking: boolean;
  expression: string;
  gesture: string;
  gestureAt: number;
  gestureUntil: number;
  look: number;
  scrollVel: number;
  interactAt: number;
}

export type GestureFunc = (t: number) => { r: number; l: number; rx: number };

export const GESTURES: Record<string, GestureFunc> = {
  none:      () => ({ r: 0.12, l: 0.12, rx: 0 }),
  wave:      t => ({ r: 2.3 + Math.sin(t * 10) * 0.35, l: 0.12, rx: 0 }),
  explain:   t => ({ r: 0.7 + Math.sin(t * 3) * 0.3, l: 0.6 + Math.sin(t * 3 + 1.6) * 0.3, rx: -0.3 }),
  present:   t => ({ r: 1.1 + Math.sin(t * 2.5) * 0.15, l: 1.1 + Math.sin(t * 2.5 + 0.4) * 0.15, rx: -0.5 }),
  point:     t => ({ r: 0.9, l: 0.12, rx: -1.2 + Math.sin(t * 5) * 0.1 }),
  celebrate: t => ({ r: 2.2 + Math.sin(t * 12) * 0.3, l: 2.2 + Math.sin(t * 12 + Math.PI) * 0.3, rx: 0 }),
  shrug:     t => ({ r: 0.9 + Math.sin(t * 2) * 0.1, l: 0.9 + Math.sin(t * 2) * 0.1, rx: 0 }),
};

// Global singleton pointer state to avoid duplicate event listeners
interface PointerState {
  x: number;
  y: number;
  lastMoved: number;
}

const globalPointer: PointerState = { x: 0, y: 0, lastMoved: Date.now() };
let listenerAttached = false;
let listenerCount = 0;

function handlePointerMove(e: MouseEvent | PointerEvent) {
  globalPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  // Viewport normalized coordinates: Top = +1, Center = 0, Bottom = -1
  globalPointer.y = 1 - (e.clientY / window.innerHeight) * 2;
  globalPointer.lastMoved = performance.now();
}

export function usePointer() {
  const pointerRef = useRef(globalPointer);

  useEffect(() => {
    if (!listenerAttached && typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      listenerAttached = true;
    }
    listenerCount++;

    return () => {
      listenerCount--;
      if (listenerCount <= 0 && listenerAttached && typeof window !== 'undefined') {
        window.removeEventListener('pointermove', handlePointerMove);
        listenerAttached = false;
      }
    };
  }, []);

  return pointerRef;
}

export type RigRefsMap = Record<string, Object3D | null>;

export function useCharacterRig(
  refs: MutableRefObject<RigRefsMap>,
  stateRef: MutableRefObject<NarratorState>
) {
  const pointer = usePointer();
  const cur = useRef<ExpressionPreset>({ ...EXPRESSIONS.neutral });
  const m = useRef({
    yaw: 0, pitch: 0, roll: 0, blinkAt: 2, blinkT: -1, idleLookAt: 0, idleLook: 0,
    scroll: 0, wR: 0.12, wL: 0.12, rx: 0, open: 0, ex: 0, ey: 0
  });

  useFrame((state, dtRaw) => {
    if (document.visibilityState === 'hidden') return;
    const r = refs.current; 
    if (!r.body || !r.head) return;
    const dt = Math.min(dtRaw, 0.05), t = state.clock.elapsedTime, now = performance.now();
    const s = stateRef.current, k = m.current, p = pointer.current;
    const idle = now - s.interactAt > 6000;
    const gesturing = s.speaking || now < s.gestureUntil;

    // ---- expression blending (occasional idle smile) ----
    let exprName = s.expression;
    if (exprName === 'neutral' && !s.speaking && Math.sin(t * 0.35) > 0.93) exprName = 'happy';
    const target = EXPRESSIONS[exprName] || EXPRESSIONS.neutral;
    
    (Object.keys(target) as (keyof ExpressionPreset)[]).forEach((key) => {
      cur.current[key] = damp(cur.current[key], target[key], 8, dt);
    });
    const c = cur.current;

    // ---- blinking ----
    let blink = 0;
    if (k.blinkT < 0 && t > k.blinkAt) k.blinkT = 0;
    if (k.blinkT >= 0) {
      k.blinkT += dt; 
      const pr = k.blinkT / 0.16;
      if (pr >= 1) { 
        k.blinkT = -1; 
        k.blinkAt = t + 2 + Math.random() * 3.5; 
        if (Math.random() < 0.2) k.blinkAt = t + 0.25; 
      } else {
        blink = Math.sin(pr * Math.PI);
      }
    }
    const lid = 1 - blink * 0.95;
    [r.eyeL, r.eyeR].forEach(e => e && e.scale.set(c.eyeX, c.eyeY * lid, 1));

    // ---- CURSOR TRACKING & IDLE BEHAVIOR ----
    const mouseIdleDuration = now - p.lastMoved;
    let targetPx = p.x;
    let targetPy = p.y;

    // After 6 seconds of cursor inactivity, slowly return towards neutral (0, 0)
    if (mouseIdleDuration > 6000) {
      const fade = Math.max(0, 1 - (mouseIdleDuration - 6000) / 2000);
      targetPx *= fade;
      targetPy *= fade;
    }

    const cursorX = clamp(targetPx, -1, 1);
    const cursorY = clamp(targetPy, -1, 1);

    // NATURAL ROTATION LIMITS:
    // Horizontal head rotation: approx ±10–15° (max limit 0.22 rad = 12.6°)
    // Vertical head rotation: approx ±6–10° (max limit 0.14 rad = 8.0°)
    const headYawLimit = 0.22;
    const headPitchLimit = 0.14;

    if (idle && mouseIdleDuration > 6000 && !s.speaking && t > k.idleLookAt) { 
      k.idleLook = (Math.random() - 0.5) * 0.3; 
      k.idleLookAt = t + 2.5 + Math.random() * 3; 
    }
    const lookX = s.speaking ? s.look * 0.3 : (idle && mouseIdleDuration > 6000) ? k.idleLook : 0;

    const yawT = cursorX * headYawLimit + lookX;
    // cursorY = +1 (top/up) -> pitch should be negative to tilt head upward
    // cursorY = -1 (bottom/down) -> pitch should be positive to tilt head downward
    const pitchT = -cursorY * headPitchLimit + (s.speaking ? Math.sin(t * 4.2) * 0.03 : 0);
    const rollT = c.tilt + cursorX * 0.035 + Math.sin(t * 0.9) * 0.025 + (s.speaking ? Math.sin(t * 3.1) * 0.04 : 0);

    // Interpolate head rotations with smooth damping (no instant snapping)
    k.yaw = damp(k.yaw, yawT, 5, dt); 
    k.pitch = damp(k.pitch, pitchT, 5, dt); 
    k.roll = damp(k.roll, rollT, 5, dt);
    
    r.head.rotation.set(k.pitch, k.yaw, k.roll);

    // BODY & FEET: STATIONARY / ALMOST NO ROTATION
    // DO NOT rotate entire body or feet towards cursor
    r.body.rotation.y = k.yaw * 0.04;

    // EYES: PRIMARY TRACKING MECHANISM
    // Pupils/eyes smoothly shift with slightly wider range (X: ±0.065, Y: ±0.045)
    const eyeTargetX = cursorX * 0.065 + Math.sin(t * 0.7) * 0.004;
    const eyeTargetY = cursorY * 0.045;

    k.ex = damp(k.ex, eyeTargetX, 9, dt);
    k.ey = damp(k.ey, eyeTargetY, 9, dt);

    [r.eyeL, r.eyeR].forEach((e, i) => {
      if (!e) return;
      const side = i ? 1 : -1;
      // Eyes shift smoothly across face
      e.position.x = side * 0.29 + k.ex;
      e.position.y = 0.22 + k.ey;
      // Organic eye roll tilt facing cursor direction
      e.rotation.y = side * 0.1 + k.ex * 0.7;
      e.rotation.x = 0.05 - k.ey * 0.7;
    });

    // ---- breathing, bounce, scroll lean ----
    const speed = s.speaking ? 3.6 : 2.2;
    const bounce = Math.pow(Math.max(0, Math.sin(t * speed)), 2) * (s.speaking ? 0.045 : 0.022) * (1 + c.smile * 0.4);
    const breath = Math.sin(t * 1.8) * 0.012;
    k.scroll = clamp(k.scroll + s.scrollVel, -3, 3); 
    s.scrollVel = 0; 
    k.scroll = damp(k.scroll, 0, 3, dt);
    r.body.position.y = bounce;
    r.body.scale.set(1 - breath * 0.5, 1 + breath, 1 - breath * 0.5);
    r.body.rotation.z = k.scroll * 0.06;
    if (r.helmet) { 
      r.helmet.position.y = 0.02 + bounce * 0.8; 
      r.helmet.rotation.z = Math.sin(t * speed + 0.8) * 0.02; 
    }

    // ---- wings ----
    const gFn = GESTURES[gesturing ? s.gesture : 'none'] || GESTURES.none;
    const g = gFn((now - s.gestureAt) / 1000);
    const flap = !gesturing ? Math.pow(Math.max(0, Math.sin(t * 0.9)), 12) * Math.sin(t * 14) * 0.25 : 0;
    const sway = Math.sin(t * 1.6) * 0.03;
    k.wR = damp(k.wR, g.r + flap + sway, 10, dt); 
    k.wL = damp(k.wL, g.l + flap - sway, 10, dt); 
    k.rx = damp(k.rx, g.rx, 8, dt);
    if (r.wingR) { r.wingR.rotation.z = k.wR; r.wingR.rotation.x = k.rx; }
    if (r.wingL) { r.wingL.rotation.z = -k.wL; r.wingL.rotation.x = k.rx * 0.5; }

    // ---- beak ----
    const talk = s.speaking ? 0.08 + 0.26 * Math.abs(Math.sin(t * 12.5)) * (0.6 + 0.4 * Math.pow(Math.sin(t * 4.3), 2)) : c.beakOpen;
    k.open = damp(k.open, talk, 25, dt);
    if (r.beakLower) r.beakLower.rotation.x = k.open;
    if (r.beakUpper) r.beakUpper.scale.x = 1 + c.smile * 0.12;

    // ---- cheeks + feet ----
    [r.cheekL, r.cheekR].forEach(ch => {
      if (ch && (ch as Mesh).material) {
        ((ch as Mesh).material as Material).opacity = c.blush;
      }
    });
    const step = Math.sin(t * speed);
    if (r.footL) { r.footL.position.y = -0.97 + Math.max(0, step) * 0.015; r.footL.rotation.y = -0.18 - (s.speaking ? step * 0.05 : 0); }
    if (r.footR) { r.footR.position.y = -0.97 + Math.max(0, -step) * 0.015; r.footR.rotation.y = 0.18 + (s.speaking ? step * 0.05 : 0); }
  });
}
