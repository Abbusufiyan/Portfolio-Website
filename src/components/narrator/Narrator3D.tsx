import React, { MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { MathUtils } from 'three';
import { NarratorModel } from './NarratorModel';
import { usePointer, NarratorState } from './NarratorAnimations';

// Slow cinematic drift + cursor parallax, with a gentle push-in while speaking.
function CameraRig({ stateRef }: { stateRef: MutableRefObject<NarratorState> }) {
  const pointer = usePointer();
  useFrame(({ camera, clock }, dt) => {
    if (document.visibilityState === 'hidden') return;
    const t = clock.elapsedTime, s = stateRef.current, p = pointer.current;
    const tx = Math.sin(t * 0.4) * 0.05 + p.x * 0.08;
    const ty = -0.15 + Math.sin(t * 0.31) * 0.03 + p.y * 0.04;
    const tz = 4.6 - (s.speaking ? 0.3 : 0);
    camera.position.x = MathUtils.damp(camera.position.x, tx, 2, dt);
    camera.position.y = MathUtils.damp(camera.position.y, ty, 2, dt);
    camera.position.z = MathUtils.damp(camera.position.z, tz, 1.5, dt);
    camera.lookAt(0, -0.15, 0);
  });
  return null;
}

export interface Narrator3DProps {
  stateRef: MutableRefObject<NarratorState>;
  compact?: boolean;
}

export function Narrator3D({ stateRef, compact = false }: Narrator3DProps) {
  return (
    <Canvas
      shadows="soft"
      dpr={compact ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, -0.15, 4.6], fov: 32 }}
      gl={{ alpha: true, antialias: !compact, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#e0f2fe', '#fef3c7', 0.55]} />
      
      {/* Primary Key Light */}
      <directionalLight
        position={[2.5, 3.5, 3]}
        intensity={2.5}
        color="#fff5ea"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
      />
      {/* Cool Rim Light */}
      <directionalLight position={[-3, 2, -2.5]} intensity={2.2} color="#60a5fa" />
      {/* Warm Fill Light */}
      <directionalLight position={[3, 1, -2.5]} intensity={1.5} color="#fde047" />
      
      {/* Studio Reflection Environment */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 3, 3]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[-4, 1, 1]} scale={[2, 4, 1]} color="#bae6fd" />
      </Environment>
      
      {/* Character Model */}
      <NarratorModel stateRef={stateRef} />
      
      {/* Soft Contact Shadow below feet */}
      <ContactShadows position={[0, -1.15, 0]} opacity={0.45} scale={4.2} blur={2.4} far={1.6} />
      
      <CameraRig stateRef={stateRef} />
    </Canvas>
  );
}

export default Narrator3D;
