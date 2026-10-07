import React, { useMemo, useRef, MutableRefObject } from 'react';
import * as THREE from 'three';
import { useCharacterRig, NarratorState, RigRefsMap } from './NarratorAnimations';

const YELLOW_BODY = '#ffe033';
const YELLOW_WING = '#ffd500';
const ORANGE_BEAK = '#ff7a00';
const ORANGE_FOOT = '#ff6b00';
const BLUE_HELMET = '#2563eb';
const NAVY_VENTS = '#0f172a';
const EYE_DARK = '#1a0906';

// 1. Seamless Single Continuous All-Yellow Mascot Body (Zero Neck, Zero White Patch)
function continuousBodyGeometry() {
  const points: THREE.Vector2[] = [];
  const segments = 48;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = 0.82 - t * 1.54; // y goes from +0.82 down to -0.72
    
    let r = 0;
    if (y > 0.4) {
      const normY = (0.82 - y) / 0.42;
      r = 0.76 * Math.sin(normY * Math.PI * 0.5);
    } else if (y > 0.0) {
      const normY = (0.4 - y) / 0.4;
      r = 0.76 + normY * 0.08; // widens smoothly to ~0.84 at cheeks
    } else if (y > -0.4) {
      const normY = -y / 0.4;
      r = 0.84 - normY * 0.22; // tapers smoothly down through body
    } else {
      const normY = (-0.4 - y) / 0.32;
      r = 0.62 * (1 - Math.pow(normY, 1.4));
    }
    
    points.push(new THREE.Vector2(Math.max(0, r), y));
  }
  
  const geom = new THREE.LatheGeometry(points, 64);
  geom.computeVertexNormals();
  return geom;
}

// 2. Sculpted 3D Helmet with Real Thickness & V-Notch Cutout
function helmetGeometry(outer: boolean) {
  const r = outer ? 0.87 : 0.84;
  const geom = new THREE.SphereGeometry(r, 64, 40, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const angle = Math.atan2(v.x, v.z); // 0 is front center
    const absAngle = Math.abs(angle);

    let rimY = 0.12;
    if (absAngle < 0.85) {
      // V-shaped cutout dipping down over forehead
      rimY = 0.26 + (0.85 - absAngle) * 0.22;
    } else if (absAngle < 1.5) {
      rimY = 0.12 + Math.sin((absAngle - 0.85) * Math.PI) * 0.06;
    }

    if (v.y < rimY) {
      v.y = rimY;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geom.computeVertexNormals();
  return geom;
}

// 3. Webbed Foot Geometry
function webbedFootGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.06, 0);
  s.lineTo(-0.26, 0.32);
  s.quadraticCurveTo(-0.26, 0.46, -0.15, 0.42); // Left toe
  s.quadraticCurveTo(-0.08, 0.52, 0, 0.46);    // Middle toe
  s.quadraticCurveTo(0.08, 0.52, 0.15, 0.42);   // Right toe
  s.quadraticCurveTo(0.26, 0.46, 0.26, 0.32);
  s.lineTo(0.06, 0);
  s.quadraticCurveTo(0, -0.05, -0.06, 0);

  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.04,
    bevelEnabled: true,
    bevelSize: 0.02,
    bevelThickness: 0.02,
    bevelSegments: 4,
    curveSegments: 12
  });
  g.rotateX(Math.PI / 2);
  return g;
}

// Soft radial blush texture
function blushTexture() {
  if (typeof document === 'undefined') return new THREE.Texture();
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  if (!g) return new THREE.Texture();
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  gr.addColorStop(0, 'rgba(255, 50, 90, 0.92)');
  gr.addColorStop(0.55, 'rgba(255, 75, 105, 0.4)');
  gr.addColorStop(1, 'rgba(255, 100, 120, 0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// 3 Bowling Ball Finger Holes (Top Left)
const BOWLING_HOLES = [
  { pos: [-0.14, 0.74, 0.36], rot: [0.4, -0.2, 0] },
  { pos: [-0.28, 0.65, 0.28], rot: [0.45, -0.4, 0] },
  { pos: [0.02, 0.70, 0.32], rot: [0.4, 0.1, 0] },
];

export interface NarratorModelProps {
  stateRef: MutableRefObject<NarratorState>;
}

export function NarratorModel({ stateRef }: NarratorModelProps) {
  const refs = useRef<RigRefsMap>({});
  const set = (k: string) => (el: THREE.Object3D | null) => { refs.current[k] = el; };

  const bodyGeom = useMemo(continuousBodyGeometry, []);
  const outerHelmetGeom = useMemo(() => helmetGeometry(true), []);
  const innerHelmetGeom = useMemo(() => helmetGeometry(false), []);
  const footGeom = useMemo(webbedFootGeometry, []);
  const blush = useMemo(blushTexture, []);

  useCharacterRig(refs, stateRef);

  // Cohesive smooth yellow PBR material for main character body (NO WHITE BELLY, NO FUR)
  const bodyMat = {
    color: YELLOW_BODY,
    roughness: 0.35,
    metalness: 0.0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
  };

  // Premium glossy blue helmet material
  const helmetMat = {
    color: BLUE_HELMET,
    roughness: 0.18,
    clearcoat: 0.95,
    clearcoatRoughness: 0.1,
    side: THREE.FrontSide,
  };

  const helmetInnerMat = {
    color: '#1d4ed8',
    roughness: 0.4,
    side: THREE.BackSide,
  };

  const beakMat = {
    color: ORANGE_BEAK,
    roughness: 0.25,
    clearcoat: 0.6,
  };

  const footMat = {
    color: ORANGE_FOOT,
    roughness: 0.35,
    clearcoat: 0.4,
  };

  const sh = { castShadow: true, receiveShadow: true };

  return (
    <group position={[0, 0.08, 0]} scale={[0.82, 0.82, 0.82]}>
      {/* Root Unified Character Group */}
      <group ref={set('body')}>
        {/* ONE CONTINUOUS UNIFIED ALL-YELLOW MASCOT BODY (NO SEAM, NO NECK, NO WHITE BELLY!) */}
        <mesh {...sh} geometry={bodyGeom} scale={[1, 1, 0.88]}>
          <meshPhysicalMaterial {...bodyMat} />
        </mesh>

        {/* Small Yellow Wings on sides */}
        {[
          ['wingR', 1],
          ['wingL', -1]
        ].map(([name, sx]) => (
          <group key={name as string} ref={set(name as string)} position={[(sx as number) * 0.72, 0.05, -0.02]}>
            <mesh {...sh} position={[(sx as number) * 0.08, -0.1, 0]} scale={[0.15, 0.26, 0.14]} rotation={[0, 0, (sx as number) * -0.3]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshPhysicalMaterial {...bodyMat} color={YELLOW_WING} />
            </mesh>
          </group>
        ))}

        {/* Head Features Group */}
        <group ref={set('head')} position={[0, 0, 0]}>
          {/* Professionally Sculpted 3D Helmet with Real Thickness & V-Notch Cutout */}
          <group ref={set('helmet')} position={[0, 0.02, 0]}>
            {/* Outer Helmet Shell */}
            <mesh {...sh} geometry={outerHelmetGeom}>
              <meshPhysicalMaterial {...helmetMat} />
            </mesh>
            {/* Inner Helmet Shell */}
            <mesh geometry={innerHelmetGeom}>
              <meshStandardMaterial {...helmetInnerMat} />
            </mesh>

            {/* 3 Bowling Ball Finger Holes */}
            {BOWLING_HOLES.map((h, i) => (
              <mesh key={i} position={h.pos as [number, number, number]} rotation={h.rot as [number, number, number]}>
                <circleGeometry args={[0.065, 24]} />
                <meshBasicMaterial color={NAVY_VENTS} />
              </mesh>
            ))}
          </group>

          {/* Large Expressive Anime Eyes */}
          {[
            ['eyeL', -1],
            ['eyeR', 1]
          ].map(([name, sx]) => (
            <group key={name as string} ref={set(name as string)} position={[(sx as number) * 0.29, 0.22, 0.70]} rotation={[0.05, (sx as number) * 0.1, (sx as number) * -0.06]}>
              <mesh castShadow scale={[1.15, 1.48, 0.5]}>
                <sphereGeometry args={[0.13, 32, 24]} />
                <meshPhysicalMaterial color={EYE_DARK} roughness={0.1} clearcoat={1} />
              </mesh>
              {/* Top-Left Primary Glossy Catchlight */}
              <mesh position={[-0.035, 0.065, 0.09]}>
                <sphereGeometry args={[0.045, 16, 12]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
              </mesh>
              {/* Bottom-Right Secondary Catchlight */}
              <mesh position={[0.035, -0.045, 0.09]}>
                <sphereGeometry args={[0.022, 12, 8]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
              </mesh>
            </group>
          ))}

          {/* Thin Eyebrows */}
          {[
            ['browL', -1],
            ['browR', 1]
          ].map(([name, sx]) => (
            <mesh key={name as string} position={[(sx as number) * 0.28, 0.44, 0.68]} rotation={[0, 0, (sx as number) * -0.15]}>
              <torusGeometry args={[0.08, 0.007, 8, 16, Math.PI * 0.6]} />
              <meshBasicMaterial color="#7c2d12" />
            </mesh>
          ))}

          {/* Soft Rosy Red Cheek Blush */}
          {[
            ['cheekL', -1],
            ['cheekR', 1]
          ].map(([name, sx]) => (
            <mesh key={name as string} ref={set(name as string)} position={[(sx as number) * 0.46, -0.02, 0.65]} rotation={[0, (sx as number) * 0.4, 0]}>
              <planeGeometry args={[0.34, 0.26]} />
              <meshBasicMaterial map={blush} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          ))}

          {/* Cute Orange Duck-Bill Beak */}
          <group position={[0, -0.04, 0.74]}>
            <mesh {...sh} ref={set('beakUpper')} position={[0, 0.01, 0]} scale={[1.35, 0.45, 0.8]}>
              <sphereGeometry args={[0.11, 24, 16]} />
              <meshPhysicalMaterial {...beakMat} />
            </mesh>
            <group ref={set('beakLower')} position={[0, -0.02, -0.03]}>
              <mesh {...sh} position={[0, -0.02, 0.04]} scale={[1.1, 0.35, 0.7]}>
                <sphereGeometry args={[0.09, 24, 16]} />
                <meshPhysicalMaterial {...beakMat} color="#f97316" />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* Legs & Large Orange Webbed Feet */}
      {[
        ['legL', -1],
        ['legR', 1]
      ].map(([name, sx]) => (
        <group key={name as string}>
          <mesh {...sh} position={[(sx as number) * 0.26, -0.74, 0.04]} scale={[0.07, 0.2, 0.07]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
            <meshPhysicalMaterial {...footMat} />
          </mesh>

          <mesh
            {...sh}
            ref={set(name === 'legL' ? 'footL' : 'footR')}
            geometry={footGeom}
            position={[(sx as number) * 0.26, -0.92, 0.16]}
            rotation={[0.08, (sx as number) * 0.22, 0]}
          >
            <meshPhysicalMaterial {...footMat} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default NarratorModel;
