import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export interface SkillBook {
  title: string;
  subtitle: string;
  colorA: string;
  colorB: string;
  textColor: string;
  blurb: string;
  category: string;
  level: string;
  experience: string;
  tag: string;
}

const SKILLS_DATA: SkillBook[] = [
  {
    title: "C++",
    subtitle: "SYSTEMS & PROGRAMMING",
    colorA: "#1d9aa8",
    colorB: "#e09a5a",
    textColor: "#ffffff",
    blurb: "Low-level system programming, memory management, and high-performance computing.",
    category: "Systems Engineering",
    level: "Advanced Core",
    experience: "Core Competency",
    tag: "cpp"
  },
  {
    title: "DSA IN C++",
    subtitle: "DATA STRUCTURES & ALGORITHMS",
    colorA: "#2a2a2d",
    colorB: "#555555",
    textColor: "#e7e2d6",
    blurb: "Mastering complex algorithmic problems, dynamic programming, graph algorithms, and time/space complexity optimization.",
    category: "Computer Science",
    level: "Problem Solver",
    experience: "Continuous Practice",
    tag: "dsa"
  },
  {
    title: "JAVASCRIPT",
    subtitle: "WEB PROGRAMMING",
    colorA: "#cdbf80",
    colorB: "#3a3a98",
    textColor: "#1f2f66",
    blurb: "Core language of the web. Building dynamic, interactive web experiences and robust client-side logic.",
    category: "Web Architecture",
    level: "Proficient",
    experience: "Daily Use",
    tag: "javascript"
  },
  {
    title: "REACT",
    subtitle: "FRONTEND DEVELOPMENT",
    colorA: "#3a6a8a",
    colorB: "#7aa4c0",
    textColor: "#f1ece0",
    blurb: "Building modern, ultra-responsive web applications with reusable components, state management, and hooks.",
    category: "Frontend UI",
    level: "Advanced",
    experience: "Production Ready",
    tag: "react"
  },
  {
    title: "NODE / EXPRESS",
    subtitle: "BACKEND DEVELOPMENT",
    colorA: "#325c3a",
    colorB: "#80b088",
    textColor: "#eef3e2",
    blurb: "Designing scalable server-side architectures, middleware, and efficient event-driven backends.",
    category: "Backend Services",
    level: "Practitioner",
    experience: "Core Utility",
    tag: "node-express"
  },
  {
    title: "MYSQL",
    subtitle: "DATABASE MANAGEMENT",
    colorA: "#d1912c",
    colorB: "#f0c070",
    textColor: "#2a1a08",
    blurb: "Designing relational schemas, optimizing complex queries, and ensuring data integrity with ACID compliance.",
    category: "Data Systems",
    level: "Schema Architect",
    experience: "Backend Core",
    tag: "mysql"
  },
  {
    title: "REST API",
    subtitle: "API DEVELOPMENT",
    colorA: "#b8332a",
    colorB: "#e0803a",
    textColor: "#f6e3c8",
    blurb: "Building robust, stateless APIs for seamless client-server communication and data exchange.",
    category: "Architecture",
    level: "Workflow Core",
    experience: "Daily Use",
    tag: "rest-api"
  },
  {
    title: "JWT",
    subtitle: "AUTHENTICATION & SECURITY",
    colorA: "#4d3a7a",
    colorB: "#8a70b8",
    textColor: "#f0e6ff",
    blurb: "Implementing secure token-based authentication, authorization flows, and session management.",
    category: "Security",
    level: "Practitioner",
    experience: "Production Ready",
    tag: "jwt"
  }
];

export function Skills3DShelfComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // References for state management inside high-frequency animation loops
  const selRef = useRef<number>(-1);
  const isDraggingRef = useRef<boolean>(false);
  const targetCurRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);

  useEffect(() => {
    if (!stageRef.current) return;

    const N = SKILLS_DATA.length;
    let animFrameId: number;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebGlSupported(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const domElement = renderer.domElement;
    stageRef.current.appendChild(domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    // Lights
    scene.add(new THREE.HemisphereLight(0xfff3e0, 0x201a1c, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 1.05);
    sun.position.set(-4, 8, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -7,
      right: 7,
      top: 7,
      bottom: -7,
      near: 1,
      far: 30,
    });
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const rim = new THREE.PointLight(0x88aaff, 0.5, 30);
    rim.position.set(6, 2, 4);
    scene.add(rim);

    // Wall backdrop
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.55 })
    );
    wall.position.z = -3.2;
    wall.receiveShadow = true;
    scene.add(wall);

    // ---- Canvas Texture Generators
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    function cv(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return [c, c.getContext("2d")!];
    }

    function shade(hex: string, a: number): string {
      const n = parseInt(hex.slice(1), 16);
      const r = n >> 16,
        g = (n >> 8) & 255,
        b = n & 255;
      const f = (v: number) =>
        Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a)));
      return `rgb(${f(r)},${f(g)},${f(b)})`;
    }

    function logo(g: CanvasRenderingContext2D, x: number, y: number, s: number, col: string) {
      g.strokeStyle = col;
      g.lineWidth = s * 0.07;
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.arc(x, y, s * (0.5 - k * 0.12), Math.PI * 0.15 + k, Math.PI * 1.7 + k);
        g.stroke();
      }
    }

    function paint(g: CanvasRenderingContext2D, w: number, h: number, b: SkillBook, i: number) {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, b.colorA);
      gr.addColorStop(1, shade(b.colorA, -0.25));
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);

      if (i % 3 === 0 || i === 0) {
        for (let k = 0; k < (i === 0 ? 70 : 30); k++) {
          g.strokeStyle = k % 2 ? b.colorB : shade(b.colorA, 0.25);
          g.globalAlpha = 0.55;
          g.lineWidth = 2 + rnd() * 10;
          g.beginPath();
          const y = rnd() * h,
            x = rnd() * w;
          g.moveTo(x, y);
          g.bezierCurveTo(x + 80, y - h * 0.6, x + 200, y + h * 0.6, x + 320 * rnd(), y);
          g.stroke();
        }
        g.globalAlpha = 1;
      } else {
        g.fillStyle = b.colorB;
        g.globalAlpha = 0.16;
        for (let k = 0; k < 6; k++) {
          g.beginPath();
          g.arc(rnd() * w, rnd() * h, h * (0.3 + rnd() * 0.5), 0, 7);
          g.fill();
        }
        g.globalAlpha = 1;
      }
    }

    function tex(c: HTMLCanvasElement): THREE.CanvasTexture {
      const t = new THREE.CanvasTexture(c);
      t.anisotropy = 8;
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    // Spine Texture Layout
    function spineTex(b: SkillBook, i: number): THREE.CanvasTexture {
      const [c, g] = cv(1024, 180);
      paint(g, 1024, 180, b, i);

      // Left Logo Icon
      logo(g, 80, 90, 56, b.textColor);

      // Main Skill Title
      g.fillStyle = b.textColor;
      g.textAlign = "center";
      g.textBaseline = "middle";

      let fsTitle = 36;
      g.font = "bold " + fsTitle + "px sans-serif";
      while (g.measureText(b.title).width > 680 && fsTitle > 22) {
        fsTitle -= 2;
        g.font = "bold " + fsTitle + "px sans-serif";
      }
      g.fillText(b.title, 512, 64);

      // Subtitle / Sub-category
      let fsSub = 20;
      const subUpper = b.subtitle.toUpperCase();
      g.font = "bold " + fsSub + "px sans-serif";
      while (g.measureText(subUpper).width > 680 && fsSub > 13) {
        fsSub -= 1;
        g.font = "bold " + fsSub + "px sans-serif";
      }
      g.globalAlpha = 0.85;
      g.fillText(subUpper, 512, 116);
      g.globalAlpha = 1.0;

      // Right Logo Icon
      logo(g, 944, 90, 56, b.textColor);

      return tex(c);
    }

    // Cover Texture Layout
    function coverTex(b: SkillBook, i: number): THREE.CanvasTexture {
      const [c, g] = cv(1024, 640);
      g.translate(512, 320);
      g.rotate(-Math.PI / 2);
      g.translate(-320, -512);

      paint(g, 640, 1024, b, i);

      g.fillStyle = b.textColor;
      g.textAlign = "center";
      g.textBaseline = "middle";

      logo(g, 320, 140, 76, b.textColor);

      // Title wrapped & auto-fitted
      let fsTitle = 46;
      g.font = "bold " + fsTitle + "px sans-serif";
      const words = b.title.split(" ");
      const lines: string[] = [""];
      words.forEach((x) => {
        const l = lines[lines.length - 1];
        if ((l + " " + x).length > 11 && l) lines.push(x);
        else lines[lines.length - 1] = (l + " " + x).trim();
      });

      const startY = 480 - (lines.length - 1) * 30;
      lines.forEach((t, k) => {
        g.fillText(t, 320, startY + k * 60);
      });

      // Subtitle at bottom
      let fsSub = 24;
      g.font = "italic " + fsSub + "px sans-serif";
      while (g.measureText(b.subtitle).width > 540 && fsSub > 16) {
        fsSub -= 1;
        g.font = "italic " + fsSub + "px sans-serif";
      }
      g.globalAlpha = 0.9;
      g.fillText(b.subtitle, 320, 880);
      g.globalAlpha = 1.0;

      return tex(c);
    }

    // Page texture
    const [pc, pg] = cv(64, 256);
    pg.fillStyle = "#efe8d6";
    pg.fillRect(0, 0, 64, 256);
    for (let y = 0; y < 256; y += 2) {
      pg.fillStyle = `rgba(120,105,80,${0.12 + rnd() * 0.2})`;
      pg.fillRect(0, y, 64, 1);
    }
    const pageT = tex(pc);
    pageT.wrapS = pageT.wrapT = THREE.RepeatWrapping;

    // ---- Book Mesh Construction
    const H = 3.4,
      D = 2.15,
      CT = 0.07;
    const books: THREE.Group[] = [];

    SKILLS_DATA.forEach((b, i) => {
      const T = 0.52 + ((i * 37) % 5) * 0.045;
      const g = new THREE.Group();

      const edge = new THREE.MeshStandardMaterial({
        color: b.colorA,
        roughness: 0.55,
        metalness: 0.05,
      });

      const ct = coverTex(b, i);
      const cm = new THREE.MeshStandardMaterial({ map: ct, roughness: 0.5 });

      const add = (
        geo: THREE.BufferGeometry,
        mats: THREE.Material | THREE.Material[],
        x: number,
        y: number,
        z: number
      ) => {
        const m = new THREE.Mesh(geo, mats);
        m.position.set(x, y, z);
        m.castShadow = m.receiveShadow = true;
        g.add(m);
        return m;
      };

      // Top / bottom cover plates
      add(new THREE.BoxGeometry(H, CT, D), [edge, edge, cm, edge, edge, edge], 0, T / 2 - CT / 2, 0);
      add(new THREE.BoxGeometry(H, CT, D), [edge, edge, edge, cm, edge, edge], 0, -T / 2 + CT / 2, 0);

      // Spine
      const spineMaterial = new THREE.MeshStandardMaterial({
        map: spineTex(b, i),
        roughness: 0.45,
      });
      add(new THREE.BoxGeometry(H, T, CT), [edge, edge, edge, edge, spineMaterial, edge], 0, 0, D / 2 - CT / 2);

      // Pages block
      const pm = new THREE.MeshStandardMaterial({ color: 0xefe8d6, roughness: 0.9 });
      const pe = pm.clone();
      pe.map = pageT;
      add(new THREE.BoxGeometry(H - 0.1, T - 2 * CT - 0.02, D - 0.12), [pe, pe, pm, pm, pe, pe], 0, 0, -0.05);

      // Spine hinges
      [1, -1].forEach((s) => {
        const cy = new THREE.Mesh(
          new THREE.CylinderGeometry(CT * 0.6, CT * 0.6, H, 12),
          edge
        );
        cy.rotation.z = Math.PI / 2;
        cy.position.set(0, s * (T / 2 - CT * 0.45), D / 2 - CT * 0.4);
        cy.castShadow = true;
        g.add(cy);
      });

      g.userData = { i, T, ry: (((i * 53) % 9) - 4) * 0.035, rx: (((i * 29) % 7) - 3) * 0.012 };
      scene.add(g);
      books.push(g);
    });

    // ---- Interaction & Raycasting
    const ray = new THREE.Raycaster();
    const mv = new THREE.Vector2();
    let downPos: [number, number] | null = null;
    let dragY = 0,
      dragX = 0;
    let hov = -1;

    const hit = (e: PointerEvent) => {
      const r = domElement.getBoundingClientRect();
      mv.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mv, camera);
      const intersects = ray.intersectObjects(books, true);
      if (!intersects.length) return -1;
      let o: THREE.Object3D | null = intersects[0].object;
      while (o && !o.userData.T) o = o.parent;
      return o ? o.userData.i : -1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      downPos = [e.clientX, e.clientY];
      isDraggingRef.current = selRef.current >= 0;
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]) > 6;
      downPos = null;

      if (moved || selRef.current >= 0) return;
      const clickedIdx = hit(e);
      if (clickedIdx >= 0) {
        selRef.current = clickedIdx;
        setSelectedIndex(clickedIdx);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current && downPos) {
        dragY += e.movementX * 0.01;
        dragX = Math.max(-0.5, Math.min(0.5, dragX + e.movementY * 0.005));
        return;
      }
      if (e.pointerType !== "mouse") return;
      hov = selRef.current < 0 ? hit(e) : -1;
      domElement.style.cursor = hov >= 0 ? "pointer" : "";
    };

    domElement.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    domElement.addEventListener("pointermove", handlePointerMove);

    // ---- Resize & Layout
    const mob = () => window.innerWidth <= 860;
    function handleResize() {
      if (!stageRef.current) return;
      const w = stageRef.current.clientWidth;
      const h = stageRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.userData.z = Math.max(9.6, 7.4 / camera.aspect);
    }
    handleResize();
    window.addEventListener("resize", handleResize);

    // ---- Mouse Hover Detection & Wheel Scroll Capture Controller
    const handleMouseEnter = () => {
      isHoveredRef.current = true;
    };
    const handleMouseLeave = () => {
      isHoveredRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      // If floating detail panel text is scrolled, let detail panel scroll normally
      const detailPanel = document.getElementById("skill-detail-panel");
      if (detailPanel && detailPanel.contains(e.target as Node)) {
        return;
      }

      const containerEl = containerRef.current;
      if (!containerEl) return;

      const isCursorOver = isHoveredRef.current || containerEl.matches(":hover");
      if (!isCursorOver) return;

      const rect = containerEl.getBoundingClientRect();
      const isInViewport = rect.top <= 120 && rect.bottom >= window.innerHeight - 120;
      if (!isInViewport) return;

      const curTarget = targetCurRef.current;
      const isAtStart = curTarget <= 0.001 && e.deltaY < 0;
      const isAtEnd = curTarget >= N - 1 - 0.001 && e.deltaY > 0;

      // [Inside shelf] If cursor is over shelf and we are not at start scrolling up or end scrolling down:
      if (!isAtStart && !isAtEnd) {
        // PREVENT PAGE SCROLL COMPLETELY — Page stays still!
        e.preventDefault();
        e.stopPropagation();

        // Calculate smooth step for 3D shelf animation
        const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 60);
        const step = (delta / 60) * 0.25;

        targetCurRef.current = Math.max(0, Math.min(N - 1, curTarget + step));
      }
      // [At shelf boundary] We DO NOT call e.preventDefault(), allowing browser page scroll!
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener("mouseenter", handleMouseEnter);
      containerEl.addEventListener("mouseleave", handleMouseLeave);
      containerEl.addEventListener("pointerenter", handleMouseEnter);
      containerEl.addEventListener("pointerleave", handleMouseLeave);
      containerEl.addEventListener("wheel", handleWheel, { passive: false });
    }

    // ---- Math Quaternions & Render Loop
    const qFace = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(-1, 0, 0)
      )
    );
    const qA = new THREE.Quaternion(),
      qS = new THREE.Quaternion(),
      eu = new THREE.Euler(),
      eu2 = new THREE.Euler();
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const cl = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    let cur = 0;
    let prog = 0;
    let act = -1;
    let last = performance.now();
    let isVisible = true;
    let isRunning = true;

    function loop(now: number) {
      if (!isRunning) return;
      animFrameId = requestAnimationFrame(loop);
      if (!isVisible || document.visibilityState === 'hidden') return;

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      const sel = selRef.current;
      prog = cl(prog + (sel >= 0 ? dt : -dt) / 0.85, 0, 1);
      const m = ease(prog);
      if (prog === 0 && sel < 0) act = -1;
      if (sel >= 0) act = sel;

      if (!isDraggingRef.current) {
        dragY *= 0.992;
        dragX *= 0.97;
      }

      // Smooth lerp to target book index driven strictly by captured wheel events
      cur += (targetCurRef.current - cur) * 0.12;


      camera.position.set(0, 3.3 - m * 2.1, camera.userData.z);
      camera.lookAt(0, 0.15 * (1 - m), 0);
      camera.updateProjectionMatrix();

      const dist = camera.position.z - 1.6;
      const hH = Math.tan((16 * Math.PI) / 180) * dist;
      const hW = hH * camera.aspect;
      const M = mob();

      const tx = M ? 0 : -hW * 0.46;
      const ty = M ? hH * 0.42 : 0;
      const ts = M ? 0.50 : 0.98;

      books.forEach((g) => {
        const u = g.userData;
        const dy = u.i - cur;
        const ad = Math.abs(dy);

        u.hv = (u.hv || 0) + ((hov === u.i && sel < 0 ? 1 : 0) - (u.hv || 0)) * 0.15;
        const y = -dy * 1.15 + u.hv * 0.12;
        const z = -Math.min(ad, 4) * 0.3 + u.hv * 0.35;
        const rx = u.rx + cl(dy, -3, 3) * 0.035 - u.hv * 0.05;
        const ry = u.ry + dy * 0.025;
        const s = 1 - 0.035 * Math.min(ad, 4) + u.hv * 0.03;

        eu.set(rx, ry, 0);
        qA.setFromEuler(eu);

        if (u.i === act) {
          const fy = Math.sin(t * 0.9) * 0.1;
          const fz = Math.sin(t * 0.55) * 0.12;
          g.position.set(
            THREE.MathUtils.lerp(0, tx, m),
            THREE.MathUtils.lerp(y, ty + fy, m),
            THREE.MathUtils.lerp(z, 1.6 + fz, m)
          );
          eu2.set(Math.sin(t * 0.5) * 0.05 + dragX, Math.sin(t * 0.35) * 0.5 + dragY, 0);
          qS.setFromEuler(eu2).multiply(qFace);

          g.quaternion.slerpQuaternions(qA, qS, m);
          g.scale.setScalar(THREE.MathUtils.lerp(s, ts, m));
          g.visible = true;
        } else {
          const k = 1 - m;
          g.position.set(0, y - Math.sign(dy || 1) * m * 1.6, z);
          g.quaternion.copy(qA);
          g.scale.setScalar(Math.max(0.001, s * k));
          g.visible = ad < 5 && m < 0.99;
        }
      });

      renderer.render(scene, camera);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = Boolean(entry && entry.isIntersecting);
        if (isVisible) {
          last = performance.now();
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        last = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    animFrameId = requestAnimationFrame(loop);

    // Keydown listener for Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selRef.current >= 0) {
        selRef.current = -1;
        setSelectedIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      if (containerEl) {
        containerEl.removeEventListener("mouseenter", handleMouseEnter);
        containerEl.removeEventListener("mouseleave", handleMouseLeave);
        containerEl.removeEventListener("pointerenter", handleMouseEnter);
        containerEl.removeEventListener("pointerleave", handleMouseLeave);
        containerEl.removeEventListener("wheel", handleWheel);
      }
      domElement.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      domElement.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      if (stageRef.current && renderer.domElement) {
        stageRef.current.removeChild(renderer.domElement);
      }
      
      scene.traverse((object: any) => {
        if (object.isMesh) {
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
      
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);




  const closeDetail = () => {
    selRef.current = -1;
    setSelectedIndex(null);
  };

  const currentSkill = selectedIndex !== null ? SKILLS_DATA[selectedIndex] : null;

  return (
    <section
      id="skills"
      data-narrator-section="skills"
      data-lenis-prevent="true"
      ref={containerRef}
      className="relative bg-transparent text-white font-sans overflow-hidden min-h-screen h-screen flex flex-col justify-center"
    >
      {/* Viewport container for 3D stage */}
      <div className="relative h-full w-full overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-12 py-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500">02 /</span>
            <h2 className="font-semibold text-lg sm:text-2xl tracking-tight text-white">
              Skills &amp; Arsenal
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="hidden sm:inline-block tracking-widest text-[10px] uppercase text-zinc-500">
              [ SCROLL TO SHELF • CLICK VOLUME TO INSPECT ]
            </span>
          </div>
        </header>


        {/* 3D WebGL Stage Container */}
        <div ref={stageRef} className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Fallback if WebGL fails */}
        {!webGlSupported && (
          <div className="absolute inset-0 z-20 flex items-center justify-center text-zinc-400 italic font-mono">
            WebGL is not available in your browser context.
          </div>
        )}

        {/* Selected Skill Floating Detail Panel */}
        <div
          id="skill-detail-panel"
          className={cn(
            "absolute z-40 top-1/2 right-[4vw] sm:right-[6vw] w-full max-w-[420px] -translate-y-1/2 p-6 sm:p-8 rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-out pointer-events-none opacity-0 translate-x-12",
            currentSkill && "opacity-100 translate-x-0 pointer-events-auto",
            "max-h-[85vh] overflow-y-auto"
          )}
        >
          {currentSkill && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                  {currentSkill.category}
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  {currentSkill.level}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
                  {currentSkill.title}
                </h3>
                <p className="text-sm font-mono text-zinc-400 italic">
                  {currentSkill.subtitle}
                </p>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed pt-2 border-t border-white/10">
                {currentSkill.blurb}
              </p>

              <dl className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                <div>
                  <dt className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Experience
                  </dt>
                  <dd className="font-semibold text-zinc-200 mt-0.5">
                    {currentSkill.experience}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Domain
                  </dt>
                  <dd className="font-semibold text-zinc-200 mt-0.5">
                    {currentSkill.category}
                  </dd>
                </div>
              </dl>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-[10px] font-mono text-zinc-500">
                  [ DRAG 3D MODEL TO ROTATE ]
                </span>
                <button
                  onClick={closeDetail}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  Close ←
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back Button Overlay */}
        <button
          onClick={closeDetail}
          className={cn(
            "absolute top-6 right-6 z-50 px-4 py-2 rounded-full border border-white/20 bg-black/70 backdrop-blur-md text-xs font-mono text-white transition-all duration-300 opacity-0 pointer-events-none hover:border-white/50",
            currentSkill && "opacity-100 pointer-events-auto"
          )}
        >
          ← Back to Shelf [ESC]
        </button>
      </div>
    </section>
  );
}

export const Skills3DShelf = React.memo(Skills3DShelfComponent);
export default Skills3DShelf;

