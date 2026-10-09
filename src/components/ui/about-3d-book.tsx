import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ownPhoto from '@/assets/images/own.png';

export function About3DBookComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // References to track state without triggering re-renders in animation loop
  const openRef = useRef<boolean>(false);
  const turnToRef = useRef<((n: number) => void) | null>(null);
  const closeBookRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const textarea = textareaRef.current;
    const fileInput = fileInputRef.current;
    if (!container || !textarea) return;

    let animFrameId: number;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      if (!renderer.getContext()) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const canvas = renderer.domElement;
    canvas.className = "block w-full h-full touch-none cursor-grab active:cursor-grabbing";
    container.insertBefore(canvas, container.firstChild);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const FOV = 32;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    const aniso = Math.max(1, renderer.capabilities.getMaxAnisotropy() || 1);

    // ---------- Dimensions ----------
    const W = 3,
      H = 4.2,
      T = 0.9,
      BT = 0.018,
      BS = 0.018,
      CD = 0.05,
      GAP = 0.012,
      R = 0.07;
    const WC = W + 0.1,
      HC = H + 0.12;
    const ZC = T / 2 + GAP + BT;
    const ZO = T / 2 + GAP + CD + 2 * BT;
    const TB = T - 0.05;

    const hash = (n: number) => {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };

    const mk = (
      w: number,
      h: number,
      fn: (g: CanvasRenderingContext2D, w: number, h: number) => void
    ) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      fn(c.getContext("2d")!, w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      return t;
    };

    const SERIF = "Georgia, 'Times New Roman', serif";

    // ---------- Textures ----------
    const gold = (g: CanvasRenderingContext2D, y0: number, y1: number) => {
      const l = g.createLinearGradient(0, y0, 0, y1);
      l.addColorStop(0, "#e8cf8d");
      l.addColorStop(0.5, "#b98f43");
      l.addColorStop(1, "#e2c27a");
      return l;
    };

    const coverTex = mk(1024, 1404, (g, w, h) => {
      g.fillStyle = "#1f3a33";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) {
        g.fillStyle = "rgba(0,0,0,.09)";
        g.fillRect(0, y, w, 1);
      }
      for (let x = 0; x < w; x += 3) {
        g.fillStyle = "rgba(255,255,255,.04)";
        g.fillRect(x, 0, 1, h);
      }
      for (let i = 0; i < 9000; i++) {
        g.fillStyle = `rgba(${hash(i) > 0.5 ? 255 : 0},${
          hash(i) > 0.5 ? 255 : 0
        },${hash(i) > 0.5 ? 255 : 0},.05)`;
        g.fillRect(hash(i + 1) * w, hash(i + 2) * h, 2, 2);
      }
      const gr = g.createLinearGradient(0, 0, 70, 0);
      gr.addColorStop(0, "rgba(0,0,0,.55)");
      gr.addColorStop(0.6, "rgba(0,0,0,.25)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 70, h);

      g.shadowColor = "rgba(0,0,0,.6)";
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.strokeStyle = gold(g, 0, h);
      g.lineWidth = 5;
      g.strokeRect(100, 70, w - 160, h - 140);
      g.lineWidth = 2;
      g.strokeRect(118, 88, w - 196, h - 176);

      const cx = w / 2 + 20,
        cy = 430;
      g.lineWidth = 4;
      [150, 110, 70].forEach((r) => {
        g.beginPath();
        g.arc(cx, cy, r, 0, 7);
        g.stroke();
      });
      g.beginPath();
      g.moveTo(cx, cy - 150);
      g.lineTo(cx + 130, cy + 75);
      g.lineTo(cx - 130, cy + 75);
      g.closePath();
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, 10, 0, 7);
      g.fillStyle = gold(g, cy - 10, cy + 10);
      g.fill();

      g.textAlign = "center";
      g.fillStyle = gold(g, 700, 1000);
      g.font = `bold 105px ${SERIF}`;
      g.fillText("ABU SUFIYAN", cx, 780);
      g.fillRect(cx - 90, 830, 180, 4);
      g.font = `italic 36px ${SERIF}`;
      g.fillText("Systems & Software Engineering", cx, 895);
      g.font = `34px ${SERIF}`;
      g.fillText("PORTFOLIO & BIOGRAPHY", cx, 1250);
    });

    const backTex = mk(1024, 1404, (g, w, h) => {
      g.fillStyle = "#1f3a33";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) {
        g.fillStyle = "rgba(0,0,0,.09)";
        g.fillRect(0, y, w, 1);
      }
      for (let x = 0; x < w; x += 3) {
        g.fillStyle = "rgba(255,255,255,.04)";
        g.fillRect(x, 0, 1, h);
      }
      g.shadowColor = "rgba(0,0,0,.6)";
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.strokeStyle = gold(g, 0, h);
      g.lineWidth = 5;
      g.strokeRect(100, 70, w - 160, h - 140);
      g.beginPath();
      g.arc(w / 2 - 20, h - 260, 36, 0, 7);
      g.stroke();
    });

    const spineTex = mk(256, 1024, (g, w, h) => {
      g.fillStyle = "#1b332d";
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) {
        g.fillStyle = "rgba(0,0,0,.1)";
        g.fillRect(0, y, w, 1);
      }
      g.shadowColor = "rgba(0,0,0,.6)";
      g.shadowBlur = 4;
      g.shadowOffsetY = 1;
      g.fillStyle = "#c4a057";
      [70, 110, h - 110, h - 70].forEach((y) => g.fillRect(24, y, w - 48, 5));
      g.translate(w / 2, h / 2);
      g.rotate(Math.PI / 2);
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `bold 58px ${SERIF}`;
      g.fillText("ABU SUFIYAN", 0, -8);
      g.font = `28px ${SERIF}`;
      g.fillText("PORTFOLIO", 0, 32);
      g.setTransform(1, 0, 0, 1, 0, 0);
    });

    const edgeTex = (vert: boolean) => {
      const t = mk(256, 256, (g, w, h) => {
        g.fillStyle = "#e9dfc4";
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < w; i++) {
          const a = 0.04 + hash(i) * 0.18;
          g.fillStyle = `rgba(${hash(i + 9) > 0.5 ? 90 : 40},70,40,${a})`;
          vert ? g.fillRect(i, 0, 1, h) : g.fillRect(0, i, w, 1);
        }
        for (let i = 0; i < 2500; i++) {
          g.fillStyle = "rgba(120,90,50,.04)";
          g.fillRect(hash(i) * w, hash(i + 4) * h, 3, 1);
        }
      });
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };


    // ---------- Materials ----------
    const clothSide = new THREE.MeshStandardMaterial({ color: 0x1b342d, roughness: 0.9 });
    const mFront = new THREE.MeshStandardMaterial({
      map: coverTex,
      bumpMap: coverTex,
      bumpScale: 2.2,
      roughness: 0.82,
      metalness: 0,
    });
    const mBack = new THREE.MeshStandardMaterial({
      map: backTex,
      bumpMap: backTex,
      bumpScale: 2.2,
      roughness: 0.82,
    });
    const mSpine = new THREE.MeshStandardMaterial({
      map: spineTex,
      bumpMap: spineTex,
      bumpScale: 2,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
    const paper = new THREE.MeshStandardMaterial({ color: 0xefe6d0, roughness: 0.95 });
    const endpaper = new THREE.MeshStandardMaterial({ color: 0xd8cfb4, roughness: 0.95 });
    const eV = edgeTex(true),
      eH = edgeTex(false);
    const mEdgeX = new THREE.MeshStandardMaterial({ map: eV, bumpMap: eV, bumpScale: 1.2, roughness: 0.95 });
    const mEdgeY = new THREE.MeshStandardMaterial({ map: eH, bumpMap: eH, bumpScale: 1.2, roughness: 0.95 });
    const glue = new THREE.MeshStandardMaterial({ color: 0x3a2e22, roughness: 1 });

    // ---------- Geometry Helpers ----------
    function coverGeo(w: number, h: number) {
      const s = new THREE.Shape(),
        y0 = -h / 2;
      s.moveTo(R, y0);
      s.lineTo(w - R, y0);
      s.quadraticCurveTo(w, y0, w, y0 + R);
      s.lineTo(w, h / 2 - R);
      s.quadraticCurveTo(w, h / 2, w - R, h / 2);
      s.lineTo(R, h / 2);
      s.quadraticCurveTo(0, h / 2, 0, h / 2 - R);
      s.lineTo(0, y0 + R);
      s.quadraticCurveTo(0, y0, R, y0);
      const g = new THREE.ExtrudeGeometry(s, {
        depth: CD,
        bevelEnabled: true,
        bevelThickness: BT,
        bevelSize: BS,
        bevelSegments: 3,
        curveSegments: 8,
      });
      const p = g.attributes.position,
        uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w, p.getY(i) / h + 0.5);
      return g;
    }

    const shadow = (m: THREE.Mesh) => {
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // ---------- Book Assembly ----------
    const root = new THREE.Group(),
      inner = new THREE.Group();
    root.add(inner);
    const turnTable = new THREE.Group();
    turnTable.add(root);
    scene.add(turnTable);

    const cg = coverGeo(WC, HC);
    function makeCover(front: boolean) {
      const hinge = new THREE.Group();
      const m = shadow(new THREE.Mesh(cg, [front ? mFront : mBack, clothSide]));
      hinge.add(m);
      const ep = shadow(new THREE.Mesh(new THREE.PlaneGeometry(WC - 0.05, HC - 0.05), endpaper));
      ep.rotation.y = Math.PI;
      ep.position.set(WC / 2, 0, -BT - 0.003);
      hinge.add(ep);
      return hinge;
    }

    const frontCover = makeCover(true);
    frontCover.position.set(0, 0, ZC);
    const backH = makeCover(false);
    backH.rotation.y = Math.PI;
    backH.position.set(WC, 0, -ZC);

    const frontPivot = new THREE.Group();
    frontPivot.add(frontCover);
    inner.add(frontPivot, backH);

    const spine = shadow(
      new THREE.Mesh(
        new THREE.CylinderGeometry(ZO - 0.002, ZO - 0.002, HC + 0.02, 40, 1, true, Math.PI, Math.PI),
        mSpine
      )
    );
    spine.scale.x = 0.42;
    spine.position.x = 0;
    inner.add(spine);

    // ---------- Profile Data ----------
    const PROFILE = {
      name: "Abu Sufiyan",
      title: "Software Engineer",
      photo: ownPhoto,
      intro:
        "Hi, I'm Abu Sufiyan, a passionate software enthusiast who enjoys turning complex ideas into clean, well-crafted applications — from C++ programs to modern full-stack web experiences.",
      skills: [
        "C++ & Systems Programming",
        "DBMS & MySQL",
        "Full-Stack Web Development",
        "Linux & Operating Systems",
        "Data Structures & Algorithms",
        "Web Application Development",
      ],
    };

    const faceTex = (draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => {
      const c = document.createElement("canvas");
      c.width = 1024;
      c.height = 1434;
      const g = c.getContext("2d")!;
      g.setTransform(1.6, 0, 0, 1.6, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      (t as any).redraw = () => {
        g.clearRect(0, 0, 640, 896);
        draw(g, 640, 896);
        t.needsUpdate = true;
      };
      (t as any).redraw();
      return t;
    };

    const paperBase = (g: CanvasRenderingContext2D, w: number, h: number, gr_: boolean) => {
      g.fillStyle = "#f1e9d4";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2500; i++) {
        g.fillStyle = `rgba(110,85,50,${hash(i) * 0.05})`;
        g.fillRect(hash(i + 1) * w, hash(i + 2) * h, 2, 2);
      }
      const gr = g.createLinearGradient(gr_ ? w : 0, 0, gr_ ? w - 80 : 80, 0);
      gr.addColorStop(0, "rgba(50,35,20,.3)");
      gr.addColorStop(1, "rgba(50,35,20,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    };

    const spaced = (g: CanvasRenderingContext2D, t: string, x: number, y: number, sp: number) => {
      g.textAlign = "left";
      let w = 0;
      for (const c of t) w += g.measureText(c).width + sp;
      x -= (w - sp) / 2;
      for (const c of t) {
        g.fillText(c, x, y);
        x += g.measureText(c).width + sp;
      }
    };

    const wrap = (
      g: CanvasRenderingContext2D,
      t: string,
      x: number,
      y: number,
      mw: number,
      lh: number
    ) => {
      g.textAlign = "left";
      let l = "";
      for (const w of t.split(" ")) {
        const n = l ? l + " " + w : w;
        if (g.measureText(n).width > mw && l) {
          g.fillText(l, x, y);
          y += lh;
          l = w;
        } else l = n;
      }
      g.fillText(l, x, y);
    };

    const header = (g: CanvasRenderingContext2D, w: number, t: string) => {
      g.fillStyle = "#8a7a5c";
      g.font = `15px ${SERIF}`;
      spaced(g, t, w / 2, 64, 3);
      g.fillRect(70, 78, w - 140, 1);
    };

    const folio = (g: CanvasRenderingContext2D, w: number, h: number, n: number) => {
      g.fillStyle = "#6b5d46";
      g.font = `italic 20px ${SERIF}`;
      g.textAlign = "center";
      g.fillText(String(n), w / 2, h - 46);
    };

    let photo: HTMLImageElement | null = null;
    const pic = (
      g: CanvasRenderingContext2D,
      fx: number,
      fy: number,
      fw: number,
      fh: number
    ) => {
      g.fillStyle = "#fbf6e8";
      g.fillRect(fx - 12, fy - 12, fw + 24, fh + 24);
      g.strokeStyle = "#6b5d46";
      g.lineWidth = 1.5;
      g.strokeRect(fx - 12, fy - 12, fw + 24, fh + 24);
      g.strokeStyle = "rgba(107,93,70,.45)";
      g.strokeRect(fx - 6, fy - 6, fw + 12, fh + 12);

      if (photo) {
        const r = Math.max(fw / photo.width, fh / photo.height),
          sw = fw / r,
          sh = fh / r;
        g.drawImage(
          photo,
          (photo.width - sw) / 2,
          (photo.height - sh) / 2,
          sw,
          sh,
          fx,
          fy,
          fw,
          fh
        );
      } else {
        g.save();
        g.beginPath();
        g.rect(fx, fy, fw, fh);
        g.clip();
        g.fillStyle = "#d9d0ba";
        g.fillRect(fx, fy, fw, fh);
        g.strokeStyle = "rgba(90,75,50,.2)";
        for (let i = -fh; i < fw; i += 18) {
          g.beginPath();
          g.moveTo(fx + i, fy + fh);
          g.lineTo(fx + i + fh, fy);
          g.stroke();
        }
        g.restore();
        g.fillStyle = "#6b5d46";
        g.textAlign = "center";
        g.font = `italic ${(fw / 9) | 0}px ${SERIF}`;
        g.fillText("Abu Sufiyan", fx + fw / 2, fy + fh / 2);
        g.font = `${(fw / 16) | 0}px ${SERIF}`;
        g.fillText(PROFILE.photo, fx + fw / 2, fy + fh / 2 + fw / 10);
      }
    };

    // ---------- Spread 1 ----------
    const tAL = faceTex((g, w, h) => {
      paperBase(g, w, h, true);
      header(g, w, "ABU SUFIYAN — PORTFOLIO");
      g.fillStyle = "#8a7a5c";
      g.font = `16px ${SERIF}`;
      spaced(g, "PROFILE", w / 2 - 10, 128, 6);
      pic(g, 130, 160, 360, 450);
      g.fillStyle = "#2a251c";
      g.font = `bold 34px ${SERIF}`;
      spaced(g, PROFILE.name.toUpperCase(), w / 2 - 10, 688, 6);
      g.fillStyle = "#9a7b3c";
      g.fillRect(w / 2 - 40, 712, 60, 2);
      g.fillStyle = "#5a4e3a";
      g.font = `italic 24px ${SERIF}`;
      g.textAlign = "center";
      g.fillText(PROFILE.title, w / 2 - 10, 758);
      folio(g, w, h, 2);
    });

    const tAbout = faceTex((g, w, h) => {
      paperBase(g, w, h, false);
      header(g, w, "ABU SUFIYAN — PORTFOLIO");
      g.fillStyle = "#2a251c";
      g.font = `bold 48px ${SERIF}`;
      spaced(g, "ABOUT ME", w / 2 + 10, 196, 8);
      g.fillStyle = "#9a7b3c";
      g.fillRect(w / 2 - 30, 222, 80, 3);
      g.fillStyle = "#2f2a20";
      g.font = `italic 25px ${SERIF}`;
      wrap(g, PROFILE.intro, 84, 288, w - 154, 40);
      g.fillStyle = "#8a7a5c";
      g.font = `16px ${SERIF}`;
      spaced(g, "FOCUS AREAS", w / 2 + 10, 560, 5);
      g.font = `23px ${SERIF}`;
      PROFILE.skills.forEach((s, i) => {
        g.fillStyle = "#9a7b3c";
        g.fillRect(90, 604 + i * 44 - 9, 8, 8);
        g.fillStyle = "#2f2a20";
        g.textAlign = "left";
        g.fillText(s, 116, 604 + i * 44);
      });
      g.fillStyle = "#9a7b3c";
      g.font = `italic 18px ${SERIF}`;
      g.textAlign = "right";
      g.fillText("turn the page ›", w - 70, h - 44);
      folio(g, w, h, 3);
    });

    // ---------- Spread 2 ----------
    const tOrn = faceTex((g, w, h) => {
      paperBase(g, w, h, true);
      header(g, w, "ABU SUFIYAN — PORTFOLIO");
      const cx = w / 2 - 10,
        cy = 360;
      g.strokeStyle = "#9a7b3c";
      g.lineWidth = 1.6;
      [90, 64, 38].forEach((r) => {
        g.beginPath();
        g.arc(cx, cy, r, 0, 7);
        g.stroke();
      });
      g.beginPath();
      g.moveTo(cx, cy - 90);
      g.lineTo(cx + 78, cy + 45);
      g.lineTo(cx - 78, cy + 45);
      g.closePath();
      g.stroke();
      g.fillStyle = "#4a4130";
      g.font = `italic 28px ${SERIF}`;
      g.textAlign = "center";
      g.fillText("A book is only half-written", cx, 560);
      g.fillText("until someone reads it.", cx, 604);
      folio(g, w, h, 4);
    });

    const NOTE = { area: [70, 260, 500, 380], btn: [190, 690, 260, 52], back: [50, 800, 170, 70] };
    let noteFocus = false,
      sentMsg = "",
      sentUntil = 0,
      sentBad = false;

    const noteLines = (g: CanvasRenderingContext2D, t: string, mw: number) => {
      const o: string[] = [];
      for (const p of t.split("\n")) {
        let l = "";
        for (const w of p.split(" ")) {
          const n = l ? l + " " + w : w;
          if (g.measureText(n).width > mw && l) {
            o.push(l);
            l = w;
          } else l = n;
        }
        o.push(l);
      }
      return o;
    };

    const tAR = faceTex((g, w, h) => {
      paperBase(g, w, h, false);
      header(g, w, "THE GUESTBOOK");
      g.fillStyle = "#2a251c";
      g.font = `bold 32px ${SERIF}`;
      spaced(g, "WHAT'S ON YOUR MIND?", w / 2 + 10, 160, 4);
      g.fillStyle = "#9a7b3c";
      g.fillRect(w / 2 - 40, 184, 100, 2);
      g.fillStyle = "#5a4e3a";
      g.font = `italic 24px ${SERIF}`;
      g.textAlign = "center";
      g.fillText("Write whatever is in your mind…", w / 2 + 10, 228);
      const [ax, ay, aw, ah] = NOTE.area;
      if (noteFocus) {
        g.fillStyle = "rgba(154,123,60,.08)";
        g.fillRect(ax, ay, aw, ah);
      }
      g.strokeStyle = "rgba(90,75,50,.4)";
      g.lineWidth = 1;
      g.strokeRect(ax, ay, aw, ah);
      g.strokeStyle = "rgba(90,75,50,.28)";
      for (let i = 0; i < 9; i++) {
        g.beginPath();
        g.moveTo(ax + 10, ay + 40 + i * 38);
        g.lineTo(ax + aw - 10, ay + 40 + i * 38);
        g.stroke();
      }
      g.font = `27px 'Segoe Print','Bradley Hand','Comic Sans MS',cursive`;
      g.textAlign = "left";
      const txt = textarea.value;
      if (!txt && !noteFocus) {
        g.fillStyle = "rgba(60,55,45,.5)";
        g.fillText("Write here…", ax + 16, ay + 33);
      } else {
        const L = noteLines(g, txt, aw - 34).slice(-9);
        g.fillStyle = "#26304f";
        L.forEach((l, i) => g.fillText(l, ax + 16, ay + 33 + i * 38));
        if (noteFocus && Math.floor(performance.now() / 500) % 2 === 0) {
          const i = L.length - 1;
          g.fillRect(
            ax + 18 + g.measureText(L[i]).width,
            ay + 10 + i * 38,
            2,
            28
          );
        }
      }
      const [bx, by, bw, bh] = NOTE.btn;
      if (Date.now() < sentUntil) {
        g.fillStyle = sentBad ? "#8a4a3a" : "#4f5f35";
        g.font = `italic 25px ${SERIF}`;
        g.textAlign = "center";
        g.fillText(sentMsg, w / 2 + 10, by + 34);
      } else {
        g.strokeStyle = "#6b5d46";
        g.lineWidth = 1.5;
        g.strokeRect(bx, by, bw, bh);
        g.strokeRect(bx + 4, by + 4, bw - 8, bh - 8);
        g.fillStyle = "#2a251c";
        g.font = `18px ${SERIF}`;
        spaced(g, "LEAVE A NOTE", bx + bw / 2, by + 33, 4);
      }
      g.fillStyle = "#9a7b3c";
      g.font = `italic 18px ${SERIF}`;
      g.textAlign = "left";
      g.fillText("‹ back", 70, h - 44);
      folio(g, w, h, 5);
    });

    const flash = (m: string, ms: number, bad?: boolean) => {
      sentMsg = m;
      sentBad = !!bad;
      sentUntil = Date.now() + ms;
      (tAR as any).redraw();
      setTimeout(() => (tAR as any).redraw(), ms + 40);
    };

    const sendNote = () => {
      const v = textarea.value.trim();
      if (!v) {
        flash("Please write something first.", 2200, true);
        return;
      }
      textarea.value = "";
      flash("Your note has been left.", 3500);
    };

    const focusNote = () => {
      noteFocus = true;
      textarea.focus({ preventScroll: true });
      (tAR as any).redraw();
    };

    const blurNote = () => {
      if (noteFocus) {
        noteFocus = false;
        textarea.blur();
        (tAR as any).redraw();
      }
    };

    textarea.oninput = () => (tAR as any).redraw();

    const genTex = (r: boolean) =>
      faceTex((g, w, h) => {
        paperBase(g, w, h, r);
        header(g, w, "ABU SUFIYAN — PORTFOLIO");
        for (let i = 0; i < 22; i++) {
          g.fillStyle = "rgba(58,50,38,.35)";
          g.fillRect(
            70,
            160 + i * 28,
            (i % 7 === 6 ? 0.4 : 1) * (w - 140 - hash(i) * 50),
            5
          );
        }
      });

    const pm = (t: THREE.CanvasTexture) =>
      new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 });
    const mAL = pm(tAL),
      mAR = pm(tAR),
      mAbout = pm(tAbout),
      mOrn = pm(tOrn),
      mGL = pm(genTex(true)),
      mGR = pm(genTex(false));

    const setPhoto = (src: string) => {
      const im = new Image();
      im.onload = () => {
        photo = im;
        (tAL as any).redraw();
      };
      im.src = src;
    };
    setPhoto(PROFILE.photo);

    // ---------- Page Blocks & Flip Sheets ----------
    const NS = 10,
      SH = 0.0025,
      SP = 0.003,
      K = 5,
      TL = TB / 2,
      TR = TB / 2 - NS * SP;
    const jit = (g: THREE.BoxGeometry, n: number, s: number) => {
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const zi = Math.round((p.getZ(i) / g.parameters.depth + 0.5) * n) + s,
          x = p.getX(i),
          y = p.getY(i);
        if (x > 0) p.setX(i, x + (hash(zi) - 0.5) * 0.012);
        p.setY(i, y + (y > 0 ? 1 : -1) * (hash(zi + (y > 0 ? 50 : 90)) - 0.5) * 0.008);
      }
      g.computeVertexNormals();
      return g;
    };

    const blockMats = [mEdgeX, glue, mEdgeY, mEdgeY, paper, paper];
    const rightBlock = shadow(
      new THREE.Mesh(jit(new THREE.BoxGeometry(W, H, TR, 1, 1, 14), 14, 0), blockMats)
    );
    rightBlock.position.set(0.05 + W / 2, 0, -TB / 2 + TR / 2);
    inner.add(rightBlock);

    const leftPivot = new THREE.Group();
    leftPivot.position.x = 0.05;
    const leftBlock = shadow(
      new THREE.Mesh(jit(new THREE.BoxGeometry(W, H, TL, 1, 1, 14), 14, 40), blockMats)
    );
    leftBlock.position.set(W / 2, 0, TL / 2);
    leftPivot.add(leftBlock);
    inner.add(leftPivot);

    const sg = new THREE.BoxGeometry(W - 0.03, H - 0.03, SH);
    sg.translate((W - 0.03) / 2, 0, 0);
    const sheets: Array<{ h: THREE.Group; p: number; a: any }> = [];

    for (let i = 0; i < NS; i++) {
      const h = new THREE.Group();
      h.position.set(0.05, 0, 0);
      const m = shadow(
        new THREE.Mesh(sg, [
          mEdgeX,
          glue,
          mEdgeY,
          mEdgeY,
          i === K ? mAbout : i === K + 1 ? mAR : mGR,
          i === K - 1 ? mAL : i === K ? mOrn : mGL,
        ])
      );
      m.position.z = -(i + 0.5) * SP;
      h.add(m);
      inner.add(h);
      sheets.push({ h, p: 0, a: null });
    }

    // Contact shadow under open book
    const blobTex = (() => {
      const c = document.createElement("canvas");
      c.width = 576;
      c.height = 448;
      const g = c.getContext("2d")!;
      const rw = 403,
        rh = 277,
        x = (576 - rw) / 2,
        y = (448 - rh) / 2;
      g.shadowOffsetX = 3000;
      [
        [70, 0.45],
        [34, 0.55],
        [12, 0.7],
      ].forEach(([b, a]) => {
        g.shadowBlur = b;
        g.shadowColor = `rgba(0,0,0,${a})`;
        g.fillRect(x - 3000, y + 6, rw, rh);
      });
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();

    const blob = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 7),
      new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: 0, depthWrite: false })
    );
    blob.rotation.x = -Math.PI / 2;
    turnTable.add(blob);

    // Floor shadow catcher
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.5 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -HC / 2 - 0.45;
    floor.receiveShadow = true;
    scene.add(floor);

    // ---------- Lighting ----------
    scene.add(new THREE.HemisphereLight(0xc7d0ff, 0x1a1410, 0.5));
    const key = new THREE.DirectionalLight(0xfff0dc, 1.15);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -6,
      right: 6,
      top: 6,
      bottom: -6,
      near: 1,
      far: 25,
    });
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 5;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xaabbff, 0.3);
    fill.position.set(-5, 2, 4);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x9fb8ff, 0.7);
    rim.position.set(-3, 4, -6);
    scene.add(rim);

    // ---------- Camera & State ----------
    const S = { yaw: 0.62, pitch: 0.2, dist: 12, zoom: 1, mx: 0, my: 0 },
      Tg = { yaw: 0.62, pitch: 0.2, zoom: 1 };
    const tt = () => performance.now() / 1000;
    const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const eioS = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

    const cov: { p: number; a: any } = { p: 0, a: null };
    const anim = (o: any, to: number, delay: number, dur: number, e: (t: number) => number) => {
      o.a = { t0: tt() + delay, d: dur, f: o.p, to, e };
    };
    const stepA = (o: any) => {
      if (!o.a) return;
      const u = Math.min(1, Math.max(0, (tt() - o.a.t0) / o.a.d));
      o.p = o.a.f + (o.a.to - o.a.f) * o.a.e(u);
      if (u >= 1) o.a = null;
    };

    let busyUntil = 0;
    let spread = 0;

    function openBook() {
      openRef.current = true;
      busyUntil = tt() + 3.5;
      anim(cov, 1, 0, 1.4, eio);
      const dl = [1, 1.25, 1.5, 1.85, 2.3],
        du = [0.5, 0.45, 0.5, 0.75, 1.05];
      for (let i = 0; i < K; i++) anim(sheets[i], 1, dl[i], du[i], eioS);
      Tg.yaw = 0.04;
      Tg.pitch = 0.3;
    }

    function closeBook() {
      if (!openRef.current || tt() < busyUntil) return;
      let j = 0;
      for (let i = NS - 1; i >= 0; i--) {
        if (sheets[i].p > 0 || (sheets[i].a && sheets[i].a.to > 0)) {
          anim(sheets[i], 0, j++ * 0.14, 0.55, eioS);
        }
      }
      anim(cov, 0, j * 0.14 + 0.3, 1.3, eio);
      busyUntil = tt() + j * 0.14 + 1.7;
      blurNote();
      spread = 0;
      openRef.current = false;
      Tg.yaw = 0.62;
      Tg.pitch = 0.2;
      Tg.zoom = 1;
    }

    closeBookRef.current = closeBook;

    function turnTo(n: number) {
      if (!openRef.current || tt() < busyUntil || n === spread) return;
      blurNote();
      spread = n;
      busyUntil = tt() + 1.1;
      anim(sheets[K], n, 0, 0.95, eioS);
      anim(sheets[K], n, 0, 0.95, eioS);
    }

    turnToRef.current = turnTo;

    // ---------- Book Interactions ----------
    const ray = new THREE.Raycaster(),
      ndc = new THREE.Vector2();
    let down: { x: number; y: number } | null = null,
      dragging = false,
      last: { x: number; y: number } | null = null;

    const handlePointerDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
      last = { x: e.clientX, y: e.clientY };
      dragging = false;
      if (canvas) canvas.style.cursor = "grabbing";
    };

    const handlePointerMove = (e: PointerEvent) => {
      const w = window.innerWidth,
        h = window.innerHeight;
      S.mx = (e.clientX / w - 0.5) * 2;
      S.my = (e.clientY / h - 0.5) * 2;
      if (!down || !last) return;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) dragging = true;
      if (dragging) {
        const k = openRef.current ? 0.003 : 0.008;
        Tg.yaw += (e.clientX - last.x) * k;
        Tg.pitch += (e.clientY - last.y) * k * 0.8;
        if (openRef.current) {
          Tg.yaw = Math.max(-0.45, Math.min(0.45, Tg.yaw));
          Tg.pitch = Math.max(0.1, Math.min(0.65, Tg.pitch));
        } else {
          Tg.pitch = Math.max(-0.6, Math.min(0.9, Tg.pitch));
        }
      }
      last = { x: e.clientX, y: e.clientY };
    };

    const rightMesh = () => sheets[K + spread].h.children[0] as THREE.Mesh;

    function pageClick(h: THREE.Intersection) {
      const lp = inner.worldToLocal(h.point.clone());
      if (lp.x < -0.1) {
        blurNote();
        closeBook();
        return;
      }

      if (h.object === rightMesh() && (h.face as any)?.materialIndex === 4 && h.uv) {
        const x = h.uv.x * 640,
          y = (1 - h.uv.y) * 896,
          inr = ([a, b, c, d]: number[]) => x > a && x < a + c && y > b && y < b + d;
        if (spread === 0) {
          turnTo(1);
          return;
        }
        if (inr(NOTE.btn)) {
          blurNote();
          sendNote();
          return;
        }
        if (inr(NOTE.area)) {
          focusNote();
          return;
        }
        if (inr(NOTE.back)) {
          blurNote();
          turnTo(0);
          return;
        }
      }
      blurNote();
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (canvas) canvas.style.cursor = "grab";
      if (down && !dragging) {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const intersects = ray.intersectObject(root, true);
        if (intersects.length > 0) {
          const h = intersects[0];
          if (!openRef.current && tt() > busyUntil) openBook();
          else if (openRef.current && tt() > busyUntil) pageClick(h);
        } else {
          blurNote();
        }
      }
      down = null;
    };

    const handleWheel = (e: WheelEvent) => {
      // Allow wheel zoom on closed book without locking overall page scroll unless hovering directly
      if (!openRef.current) {
        Tg.zoom = Math.max(0.65, Math.min(1.3, Tg.zoom * (1 + e.deltaY * 0.0008)));
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: true });

    // ---------- Camera Controller & Render Loop ----------
    function fit(w: number, h: number) {
      const aspect = camera.aspect && !isNaN(camera.aspect) && isFinite(camera.aspect) && camera.aspect > 0 ? camera.aspect : 1;
      const t = Math.tan((FOV * Math.PI) / 360);
      const val = Math.max(h / 2 / t, w / 2 / (t * aspect));
      return isFinite(val) && !isNaN(val) ? val : 12;
    }

    function handleResize() {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w <= 0 || h <= 0) return;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener("resize", handleResize);

    let L = 0,
      lastB = -1;
    const clock = new THREE.Clock();
    const ease = (a: number, b: number, k: number, dt: number) => {
      const start = isNaN(a) || !isFinite(a) ? b : a;
      const end = isNaN(b) || !isFinite(b) ? start : b;
      return start + (end - start) * (1 - Math.exp(-k * dt));
    };

    let isVisible = true;
    let isRunning = true;

    function frame() {
      if (!isRunning) return;
      animFrameId = requestAnimationFrame(frame);
      if (!isVisible || document.visibilityState === 'hidden') return;

      const dt = Math.min(clock.getDelta(), 0.05),
        t = clock.elapsedTime;
      stepA(cov);
      sheets.forEach(stepA);
      const c = cov.p;

      frontPivot.rotation.y = -Math.PI * c;
      leftPivot.rotation.y = -Math.PI * c;
      sheets.forEach((s) => (s.h.rotation.y = -Math.PI * s.p));

      spine.scale.z = 1 - 0.96 * c;
      spine.position.z = -ZC * c - 0.04 * c * c * c;
      inner.position.x = -((0.05 + W / 2) * (1 - c) + 0.05 * c);

      S.yaw = ease(S.yaw, Tg.yaw, 4, dt);
      S.pitch = ease(S.pitch, Tg.pitch, 4, dt);
      S.zoom = ease(S.zoom, Tg.zoom, 6, dt);

      L = ease(L, openRef.current && tt() > busyUntil - 0.6 ? 1 : 0, 2.2, dt);
      const targetDist = fit(WC * (1.9 + 0.6 * c - 0.35 * L), HC * (1.5 - 0.3 * c - 0.25 * L));
      const nextDist = ease(
        S.dist,
        isFinite(targetDist) && !isNaN(targetDist) ? targetDist : 12,
        3,
        dt
      );
      S.dist = isFinite(nextDist) && !isNaN(nextDist) ? nextDist : 12;

      const el = L * (1.02 + (S.pitch - 0.3) * 0.6 + S.my * 0.03),
        d = S.dist * S.zoom;
      const camY = 0.6 * (1 - L) + Math.sin(el) * d;
      const camZ = Math.cos(el) * d;
      if (isFinite(camY) && isFinite(camZ) && !isNaN(camY) && !isNaN(camZ)) {
        camera.position.set(0, camY, camZ);
        camera.lookAt(0, -ZO * 0.5 * L, 0);
      }

      turnTable.rotation.y = (S.yaw + S.mx * 0.04) * L;
      root.rotation.y = (S.yaw + S.mx * 0.05 * (1 - 0.5 * c)) * (1 - L);
      root.rotation.x = (S.pitch + S.my * 0.03) * (1 - L) - (Math.PI / 2) * L;

      const fy = (-HC / 2 - 0.45) * (1 - L) - ZO * L;
      floor.position.y = fy;
      blob.position.y = fy + 0.004;
      blob.material.opacity = 0.95 * L;

      if (noteFocus) {
        const b = Math.floor(performance.now() / 500);
        if (b !== lastB) {
          lastB = b;
          (tAR as any).redraw();
        }
      }

      root.position.y = Math.sin(t * 0.8) * 0.04 * (1 - c);
      try {
        renderer.render(scene, camera);
      } catch (e) {
        // Safe against transient context loss or frame errors
      }
    }

    let isContextLost = false;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      cancelAnimationFrame(animFrameId);
    };
    const handleContextRestored = () => {
      isContextLost = false;
      clock.getDelta();
      handleResize();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible && !isContextLost) {
            clock.getDelta(); // reset delta timer so frame doesn't jump
            handleResize();
          }
        }
      },
      { threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        clock.getDelta();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    animFrameId = requestAnimationFrame(frame);

    // Keydown listener for Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (noteFocus) blurNote();
        else closeBook();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const handleFileInputChange = (e: Event) => {
      const inputEl = e.target as HTMLInputElement;
      const f = inputEl.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        if (typeof r.result === "string") {
          setPhoto(r.result);
        }
      };
      r.readAsDataURL(f);
    };

    if (fileInput) {
      fileInput.addEventListener("change", handleFileInputChange);
    }

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      if (fileInput) {
        fileInput.removeEventListener("change", handleFileInputChange);
      }

      // Dispose scene resources
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => {
                if ('map' in m && (m as any).map) (m as any).map.dispose();
                if ('bumpMap' in m && (m as any).bumpMap) (m as any).bumpMap.dispose();
                m.dispose();
              });
            } else {
              if ('map' in mesh.material && (mesh.material as any).map) (mesh.material as any).map.dispose();
              if ('bumpMap' in mesh.material && (mesh.material as any).bumpMap) (mesh.material as any).bumpMap.dispose();
              mesh.material.dispose();
            }
          }
        }
      });
      scene.clear();

      try {
        renderer.forceContextLoss();
        renderer.dispose();
      } catch (_) {}

      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] sm:h-[750px] lg:h-[820px] max-w-6xl mx-auto flex items-center justify-center overflow-hidden"
    >
      {/* WebGL Unsupported Fallback */}
      {!webGlSupported && (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-mono text-sm italic">
          WebGL is not available in your browser context.
        </div>
      )}

      {/* Hidden inputs for Guestbook interaction & custom photo */}
      <textarea
        ref={textareaRef}
        maxLength={300}
        aria-label="Your note"
        className="fixed top-0 left-0 w-px h-px opacity-0 p-0 border-0 pointer-events-none"
      />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />


    </div>
  );
}

export const About3DBook = React.memo(About3DBookComponent);
export default About3DBook;

