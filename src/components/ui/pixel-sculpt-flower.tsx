import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function PixelSculptFlowerComponent() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const mobile = window.matchMedia('(max-width:700px)').matches;
    const rmQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cfg = {
      res: mobile ? 64 : 100,
      depth: 7,
      gap: 0.06,
      radius: 16,
      strength: 1,
      clickStrength: 2,
      tilt: 40,
      shape: 'square'
    };

    /* ──── Procedural Starburst Texture for Star-Glow Effect ──── */
    function createStarTexture() {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const ctx = c.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const cx = 64;
      const cy = 64;

      // Soft radial glow background
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
      g.addColorStop(0, 'rgba(255, 255, 255, 1)');
      g.addColorStop(0.2, 'rgba(255, 245, 255, 0.9)');
      g.addColorStop(0.45, 'rgba(210, 235, 255, 0.4)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);

      // Primary 4-point cross star flare
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 52, cy);
      ctx.lineTo(cx + 52, cy);
      ctx.moveTo(cx, cy - 52);
      ctx.lineTo(cx, cy + 52);
      ctx.stroke();

      // Secondary fine cross flare
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 32, cy - 32);
      ctx.lineTo(cx + 32, cy + 32);
      ctx.moveTo(cx + 32, cy - 32);
      ctx.lineTo(cx - 32, cy + 32);
      ctx.stroke();

      // Core white spot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    /* ──── 1. Draw the flower (vibrant & bright colors) ──── */
    function drawFlower() {
      const S = 512;
      const c = document.createElement('canvas');
      c.width = c.height = S;
      const g = c.getContext('2d');
      if (!g) return c;

      const cx = S / 2;
      const cy = 165;
      const hs = 0.6;
      g.lineCap = 'round';

      // Brighter, richer green stem
      const sg = g.createLinearGradient(0, cy, 0, S);
      sg.addColorStop(0, '#8ecf55');
      sg.addColorStop(1, '#3d7e35');
      g.strokeStyle = sg;
      g.lineWidth = 20;
      g.beginPath();
      g.moveTo(cx, cy);
      g.bezierCurveTo(cx - 22, cy + 110, cx + 24, cy + 230, cx - 4, S - 6);
      g.stroke();

      const leaf = (x: number, y: number, dir: number, len: number, wid: number) => {
        g.save();
        g.translate(x, y);
        g.scale(dir, 1);
        g.rotate(-0.5);
        const lg = g.createLinearGradient(0, 0, len, 0);
        lg.addColorStop(0, '#3d883c');
        lg.addColorStop(1, '#b4eb76');
        g.fillStyle = lg;
        g.beginPath();
        g.moveTo(0, 0);
        g.bezierCurveTo(len * 0.3, -wid, len * 0.75, -wid * 0.8, len, 0);
        g.bezierCurveTo(len * 0.75, wid * 0.8, len * 0.3, wid, 0, 0);
        g.fill();
        g.strokeStyle = 'rgba(40,100,40,.45)';
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(6, 0);
        g.lineTo(len * 0.88, 0);
        g.stroke();
        g.restore();
      };

      leaf(cx + 6, 330, 1, 125, 36);
      leaf(cx - 2, 410, -1, 110, 32);

      // Super vibrant petals
      const layer = (n: number, len: number, wid: number, off: number, c1: string, c2: string, c3: string) => {
        for (let i = 0; i < n; i++) {
          g.save();
          g.translate(cx, cy);
          g.scale(hs, hs);
          g.rotate(off + (i * Math.PI * 2) / n);
          const gr = g.createLinearGradient(0, 0, len, 0);
          gr.addColorStop(0, c1);
          gr.addColorStop(0.55, c2);
          gr.addColorStop(1, c3);
          g.fillStyle = gr;
          g.beginPath();
          g.moveTo(20, 0);
          g.bezierCurveTo(len * 0.25, -wid * 1.25, len * 0.85, -wid * 1.05, len, -wid * 0.12);
          g.quadraticCurveTo(len * 1.03, 0, len, wid * 0.12);
          g.bezierCurveTo(len * 0.85, wid * 1.05, len * 0.25, wid * 1.25, 20, 0);
          g.fill();
          g.strokeStyle = 'rgba(160,30,90,.35)';
          g.lineWidth = 2.5;
          g.beginPath();
          g.moveTo(34, 0);
          g.lineTo(len * 0.8, 0);
          g.stroke();
          g.restore();
        }
      };

      layer(12, 238, 40, 0, '#c72e73', '#f0669e', '#ffbfe1');
      layer(10, 196, 36, Math.PI / 10, '#e03b86', '#f88bb7', '#ffdeec');
      layer(8, 150, 30, 0, '#f05d9e', '#ffacc9', '#ffffff');

      // Luminous flower center
      g.save();
      g.translate(cx, cy);
      g.scale(hs, hs);
      const cg = g.createRadialGradient(0, 0, 2, 0, 0, 44);
      cg.addColorStop(0, '#fff494');
      cg.addColorStop(0.6, '#ffcc4d');
      cg.addColorStop(1, '#d97d25');
      g.fillStyle = cg;
      g.beginPath();
      g.arc(0, 0, 44, 0, 7);
      g.fill();
      g.fillStyle = 'rgba(140,70,10,.6)';
      for (let k = 0; k < 46; k++) {
        const a = k * 2.399;
        const r = 4.6 * Math.sqrt(k);
        g.beginPath();
        g.arc(Math.cos(a) * r, Math.sin(a) * r, 2.3, 0, 7);
        g.fill();
      }
      g.restore();
      return c;
    }

    const art = drawFlower();

    /* ──── 2. Three.js setup ──── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    stage.insertBefore(renderer.domElement, stage.firstChild);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 2000);
    const group = new THREE.Group();
    scene.add(group);

    // Significantly brighter lighting setup
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(-40, 60, 90);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xd4f0ff, 1.0);
    fill.position.set(60, -30, 40);
    scene.add(fill);

    const pointLight = new THREE.PointLight(0xffffff, 3.5, 500);
    pointLight.position.set(0, 10, 60);
    scene.add(pointLight);

    let mesh: THREE.InstancedMesh | null = null;
    let tiles: Array<{ x: number; y: number; r: number; g: number; b: number; l: number }> = [];
    let N = 0;
    let cur: Float32Array | null = null;

    const dummy = new THREE.Object3D();
    const col = new THREE.Color();

    function build() {
      if (mesh) {
        group.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }

      N = cfg.res;
      const c = document.createElement('canvas');
      c.width = c.height = N;
      const x = c.getContext('2d', { willReadFrequently: true });
      if (!x) return;

      x.drawImage(art, 0, 0, N, N);
      const d = x.getImageData(0, 0, N, N).data;
      tiles = [];

      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const k = (j * N + i) * 4;
          if (d[k + 3] < 120) continue;
          tiles.push({
            x: i - N / 2 + 0.5,
            y: N / 2 - j - 0.5,
            r: d[k],
            g: d[k + 1],
            b: d[k + 2],
            l: (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2]) / 255
          });
        }
      }

      let geo: THREE.BufferGeometry;
      if (cfg.shape === 'round') {
        geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 20);
        geo.rotateX(Math.PI / 2);
      } else {
        geo = new THREE.BoxGeometry(1, 1, 1);
      }

      // Brighter material response
      mesh = new THREE.InstancedMesh(
        geo,
        new THREE.MeshStandardMaterial({
          roughness: 0.2,
          metalness: 0.1,
          emissive: 0x221020,
          emissiveIntensity: 0.5
        }),
        tiles.length
      );
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      tiles.forEach((t, i) => {
        col.setRGB(t.r / 255, t.g / 255, t.b / 255);
        if ('convertSRGBToLinear' in col) {
          (col as any).convertSRGBToLinear();
        }
        mesh!.setColorAt(i, col);
      });

      group.add(mesh);
      cur = new Float32Array(tiles.length);
      resize();
    }

    /* ──── 2b. Radiant Starburst Glow Particles (Sparkling Stars beside & above Flower) ──── */
    const STAR_COUNT = 20;
    const starTex = createStarTexture();
    const starGroup = new THREE.Group();
    group.add(starGroup);

    const stars = Array.from({ length: STAR_COUNT }, (_, id) => {
      const mat = new THREE.SpriteMaterial({
        map: starTex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 1.0,
        color: 0xffffff
      });
      const sprite = new THREE.Sprite(mat);
      starGroup.add(sprite);

      return {
        id,
        sprite,
        mat,
        side: id % 2 === 0 ? -1 : 1,
        x: 0,
        y: 0,
        z: 0,
        baseDist: 18 + Math.random() * 14,
        vy: 4.5 + Math.random() * 5.0,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 4 + Math.random() * 6,
        life: 0,
        maxLife: 7 + Math.random() * 4.0,
        baseScale: 3.5 + Math.random() * 3.5
      };
    });

    function resetStar(s: typeof stars[0], startAtBottom = true) {
      s.side = Math.random() > 0.5 ? 1 : -1;
      s.baseDist = 18 + Math.random() * 14;
      s.x = s.side * s.baseDist;
      s.y = startAtBottom ? -N / 2 - 4 + Math.random() * 4 : -N / 2 + Math.random() * (N * 1.3);
      s.z = 3 + (Math.random() - 0.5) * 12;
      s.vy = 4.5 + Math.random() * 5.0;
      s.phase = Math.random() * Math.PI * 2;
      s.twinkleSpeed = 4 + Math.random() * 6;
      s.life = startAtBottom ? 0 : Math.random() * 7;
      s.maxLife = 7 + Math.random() * 4.0;
      s.baseScale = 3.5 + Math.random() * 3.5;
    }

    stars.forEach((s) => resetStar(s, false));

    function resize() {
      if (!stage) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight || 500;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const need = Math.max(N * 1.35, (N * 1.35) / camera.aspect);
      camera.position.set(0, 0, (need / 2) / Math.tan((camera.fov * Math.PI) / 360));
      camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize);

    /* ──── 3. Interaction ──── */
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane();
    const nrm = new THREE.Vector3();
    const hit = new THREE.Vector3();

    const ptr = { nx: 0, ny: 0, active: false, last: -1e9 };
    const P = { x: 0, y: 0, act: 0 };
    const clicks: Array<{ x: number; y: number; t: number }> = [];

    function setPtr(e: PointerEvent) {
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      ptr.nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.ny = -((e.clientY - r.top) / r.height) * 2 + 1;
      ptr.active = true;
      ptr.last = performance.now();
    }

    function toLocal(nx: number, ny: number) {
      group.updateMatrixWorld(true);
      nrm.set(0, 0, 1).applyQuaternion(group.quaternion);
      plane.setFromNormalAndCoplanarPoint(nrm, group.position);
      ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
      if (!ray.ray.intersectPlane(plane, hit)) return null;
      return group.worldToLocal(hit.clone());
    }

    const handlePointerMove = (e: PointerEvent) => setPtr(e);
    const handlePointerLeave = () => { ptr.active = false; };
    const handlePointerDown = (e: PointerEvent) => {
      setPtr(e);
      const p = toLocal(ptr.nx, ptr.ny);
      if (p) {
        clicks.push({ x: p.x, y: p.y, t: 0 });
        if (clicks.length > 4) clicks.shift();
      }
    };

    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerleave', handlePointerLeave);
    stage.addEventListener('pointerdown', handlePointerDown);

    /* ──── 4. Animate ──── */
    const clock = new THREE.Clock();
    let time = 0;
    let animId = 0;
    let isVisible = true;
    let isRunning = true;

    function frame() {
      if (!isRunning) return;
      animId = requestAnimationFrame(frame);
      if (!isVisible || document.visibilityState === 'hidden') return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const rm = rmQ.matches;
      time += dt;

      const amp = rm ? 0.4 : 1;
      const now = performance.now();

      let nx = ptr.nx;
      let ny = ptr.ny;
      let on = ptr.active;

      if (!on && !rm && now - ptr.last > 2500) {
        nx = Math.sin(time * 0.5) * 0.35;
        ny = Math.cos(time * 0.37) * 0.3;
        on = true;
      }

      const targetRY = rm ? 0 : ptr.nx * 0.14 * (ptr.active ? 1 : 0);
      group.rotation.x = (-cfg.tilt * Math.PI) / 180;
      group.rotation.y += (targetRY - group.rotation.y) * (1 - Math.exp(-dt * 4));

      const p = toLocal(nx, ny);
      if (p) {
        P.x = p.x;
        P.y = p.y;
      }
      P.act += ((on && p ? 1 : 0) - P.act) * (1 - Math.exp(-dt * 6));

      clicks.forEach((c) => (c.t += dt));
      while (clicks.length && clicks[0].t > 3) clicks.shift();

      if (mesh && cur) {
        const R = cfg.radius;
        const k = 1 - Math.exp(-dt * 14);
        const s = 1 - cfg.gap;
        const depth = cfg.depth;

        for (let i = 0; i < tiles.length; i++) {
          const t = tiles[i];
          const dx = t.x - P.x;
          const dy = t.y - P.y;
          const d = Math.hypot(dx, dy) || 1e-3;

          let w = Math.max(0, 1 - d / R);
          w = w * w * (3 - 2 * w) * P.act * cfg.strength * amp;

          let lift = w * (2 + depth * 0.25);
          let pulse = 0;

          for (let c = 0; c < clicks.length; c++) {
            const q = clicks[c];
            const cd = Math.hypot(t.x - q.x, t.y - q.y);
            const rad = rm ? 0 : q.t * 32;
            const e = (cd - rad) / 4.5;
            pulse += Math.exp(-e * e) * Math.exp(-q.t * 1.5);
          }

          lift += pulse * cfg.clickStrength * amp * 2.2;
          cur[i] += (lift - cur[i]) * k;

          const h = (0.3 + 0.7 * Math.pow(t.l, 1.2)) * depth;
          const tl = Math.min(1, w) * 0.65;

          dummy.position.set(t.x, t.y, h / 2 + cur[i]);
          dummy.rotation.set(-(dy / d) * tl, (dx / d) * tl, 0);
          dummy.scale.set(s, s, h);
          dummy.updateMatrix();

          mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
      }

      /* Update twinkling starburst stars streaming beside both sides of flower and soaring above */
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        st.life += dt;

        if (st.life >= st.maxLife || st.y > N / 2 + 15) {
          resetStar(st, true);
        }

        const progress = st.life / st.maxLife;
        st.y += st.vy * dt;

        // Gentle wave sway alongside left and right sides of flower
        const sway = Math.sin(time * 1.2 + st.phase) * 3.5;
        st.x = st.side * (st.baseDist + sway);
        st.z += Math.cos(time * 2 + st.phase) * 0.5 * dt;

        // Sparkling / Twinkling pulse
        const twinkle = 0.7 + 0.35 * Math.sin(time * st.twinkleSpeed + st.phase);
        let scale = st.baseScale * twinkle;
        let opacity = 0.8 + 0.2 * Math.cos(time * (st.twinkleSpeed * 0.8) + st.phase);

        // Fade in at bottom, fade out at top
        if (progress < 0.15) {
          scale *= progress / 0.15;
          opacity *= progress / 0.15;
        } else if (progress > 0.75) {
          scale *= (1 - progress) / 0.25;
          opacity *= (1 - progress) / 0.25;
        }

        st.sprite.position.set(st.x, st.y, st.z);
        st.sprite.scale.set(scale, scale, 1);
        st.mat.opacity = opacity;
      }

      renderer.render(scene, camera);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = Boolean(entry && entry.isIntersecting);
        if (isVisible) {
          clock.getDelta();
        }
      },
      { threshold: 0.05 }
    );

    if (stage) {
      observer.observe(stage);
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        clock.getDelta();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    build();
    frame();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', resize);
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerleave', handlePointerLeave);
      stage.removeEventListener('pointerdown', handlePointerDown);
      starTex.dispose();
      
      scene.traverse((object: any) => {
        if (object.isMesh || object.isPoints) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((m: any) => {
                if (m.map) m.map.dispose();
                m.dispose();
              });
            } else {
              if (object.material.map) object.material.map.dispose();
              object.material.dispose();
            }
          }
        }
      });
      scene.clear();
      
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <section
      id="pixel-flower"
      aria-label="Pixel Sculpt Flower"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '600px',
        background: '#000000',
        color: '#ececec',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        overflow: 'hidden'
      }}
    >
      <style>{`
        #pixel-flower #stage {
          position: relative;
          width: 100%;
          height: 100%;
          touch-action: none;
          cursor: crosshair;
        }
        #pixel-flower canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        #pixel-flower .hint {
          position: absolute;
          left: 0;
          right: 0;
          top: 24px;
          text-align: center;
          color: #a09cb0;
          letter-spacing: .14em;
          text-transform: uppercase;
          font-size: 11px;
          pointer-events: none;
          z-index: 10;
        }
        #pixel-flower .foot {
          position: absolute;
          left: 0;
          right: 0;
          bottom: calc(24px + env(safe-area-inset-bottom, 0px));
          text-align: center;
          pointer-events: none;
          padding: 0 20px;
          z-index: 10;
        }
        #pixel-flower .foot i {
          display: block;
          width: 44px;
          height: 1px;
          margin: 0 auto 12px;
          background: #a09cb0;
          opacity: .6;
        }
        #pixel-flower .foot p {
          margin: 0;
          color: #a09cb0;
          font-size: 13px;
          letter-spacing: .04em;
        }
        #pixel-flower .foot b {
          display: block;
          margin-top: 4px;
          color: #ffffff;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: .06em;
          text-shadow: 0 0 16px rgba(255,255,255,0.7);
        }
      `}</style>

      <div id="stage" ref={stageRef}>
        <div className="hint">Move · Click</div>
        <div className="foot">
          <i />
          <p>Thank you for stopping by, and for taking a moment to play.</p>
          <b>This flower is dedicated to you, the viewer.</b>
        </div>
      </div>
    </section>
  );
}

export const PixelSculptFlower = React.memo(PixelSculptFlowerComponent);
export default PixelSculptFlower;

