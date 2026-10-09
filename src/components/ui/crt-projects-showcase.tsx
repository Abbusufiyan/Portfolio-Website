import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface ProjectItem {
  title: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  features?: string[];
  github?: string;
  liveDemo?: string;
  hue: number;
}

export const defaultProjects: ProjectItem[] = [
  {
    title: "Aura Music Streaming Platform",
    category: "Full-Stack Web Application",
    description: "A modern, secure, full-stack music streaming platform built with React and Node.js, featuring an interactive music player, JWT-based authentication, dynamic playlists, and immersive 3D audio-reactive visuals.",
    image: "/img/music-app-img.png",
    technologies: ["React & TypeScript", "Tailwind & Vite", "Node.js & Express.js", "MySQL", "JWT & bcrypt", "WebGL / OGL"],
    features: [
      "Interactive music player and immersive audio-reactive visualizations",
      "Secure user authentication using JWT and bcrypt",
      "Backend APIs powered by Node.js and Express.js",
      "MySQL database integration",
      "Dedicated music asset processing and metadata pipeline",
      "Modern dark-themed interface with 3D visual effects"
    ],
    github: "https://github.com/Abbusufiyan/Music",
    liveDemo: "https://music-six-lemon.vercel.app/",
    hue: 28
  },
  {
    title: "Developer Portfolio",
    category: "Interactive Web Experience",
    description: "A highly dynamic interactive developer portfolio featuring 3D Three.js visual showcases, particle animations, and custom UI components.",
    image: "/img/portfolio-website-img.png",
    technologies: ["React", "TypeScript", "Three.js", "Tailwind CSS", "Framer Motion"],
    features: [
      "Interactive 3D Book biography showcase",
      "3D Orbit Archive project showcase",
      "Custom WebGL canvas shaders & particle background",
      "Built-in floating dock & persistent background music player"
    ],
    github: "https://github.com/Abbusufiyan/Portfolio-Website",
    liveDemo: "https://portfolio-website.vercel.app/",
    hue: 200
  },
  {
    title: "Aura Music Streaming Platform",
    category: "Full-Stack Web Application",
    description: "A modern, secure, full-stack music streaming platform built with React and Node.js, featuring an interactive music player, JWT-based authentication, dynamic playlists, and immersive 3D audio-reactive visuals.",
    image: "/img/music-app-img.png",
    technologies: ["React & TypeScript", "Tailwind & Vite", "Node.js & Express.js", "MySQL", "JWT & bcrypt", "WebGL / OGL"],
    features: [
      "Interactive music player and immersive audio-reactive visualizations",
      "Secure user authentication using JWT and bcrypt",
      "Backend APIs powered by Node.js and Express.js",
      "MySQL database integration",
      "Dedicated music asset processing and metadata pipeline",
      "Modern dark-themed interface with 3D visual effects"
    ],
    github: "https://github.com/Abbusufiyan/Music",
    liveDemo: "https://music-six-lemon.vercel.app/",
    hue: 28
  },
  {
    title: "Developer Portfolio",
    category: "Interactive Web Experience",
    description: "A highly dynamic interactive developer portfolio featuring 3D Three.js visual showcases, particle animations, and custom UI components.",
    image: "/img/portfolio-website-img.png",
    technologies: ["React", "TypeScript", "Three.js", "Tailwind CSS", "Framer Motion"],
    features: [
      "Interactive 3D Book biography showcase",
      "3D Orbit Archive project showcase",
      "Custom WebGL canvas shaders & particle background",
      "Built-in floating dock & persistent background music player"
    ],
    github: "https://github.com/Abbusufiyan/Portfolio-Website",
    liveDemo: "https://portfolio-website.vercel.app/",
    hue: 200
  },
  {
    title: "Aura Music Streaming Platform",
    category: "Full-Stack Web Application",
    description: "A modern, secure, full-stack music streaming platform built with React and Node.js, featuring an interactive music player, JWT-based authentication, dynamic playlists, and immersive 3D audio-reactive visuals.",
    image: "/img/music-app-img.png",
    technologies: ["React & TypeScript", "Tailwind & Vite", "Node.js & Express.js", "MySQL", "JWT & bcrypt", "WebGL / OGL"],
    features: [
      "Interactive music player and immersive audio-reactive visualizations",
      "Secure user authentication using JWT and bcrypt",
      "Backend APIs powered by Node.js and Express.js",
      "MySQL database integration",
      "Dedicated music asset processing and metadata pipeline",
      "Modern dark-themed interface with 3D visual effects"
    ],
    github: "https://github.com/Abbusufiyan/Music",
    liveDemo: "https://music-six-lemon.vercel.app/",
    hue: 28
  }
];

const T = (x: number, y: number, z: number, rx: number, ry: number, rz: number, sc: number) =>
  `translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function CRTProjectsShowcaseComponent() {
  const [active, setActive] = useState<number>(-1);
  const [hov, setHov] = useState<number>(-1);
  const [detailsOut, setDetailsOut] = useState<boolean>(false);

  const projects = defaultProjects;
  const activeProject = active >= 0 ? projects[active] : projects[0];

  const sectionRef = useRef<HTMLElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const activeRef = useRef<number>(-1);
  activeRef.current = active;

  const curRef = useRef<{ x: number; y: number; z: number; ry: number; rz: number; sc: number }[]>([]);
  const animsRef = useRef<Animation[]>([]);
  const timerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const mxRef = useRef<number>(0);
  const myRef = useRef<number>(0);
  const inViewRef = useRef<boolean>(false);

  const pendingFlightRef = useRef<{
    index: number;
    starts: string[];
    vis: boolean[];
    prev: { x: number; y: number; z: number; ry: number; rz: number; sc: number }[];
    shadow0: string;
  } | null>(null);

  // Reset tilt helper
  const resetTilt = (c: HTMLButtonElement) => {
    const t = c.querySelector('.tilt') as HTMLElement;
    if (t) {
      t.classList.remove('live');
      t.style.setProperty('--rx', '0deg');
      t.style.setProperty('--ry', '0deg');
    }
    const f = c.querySelector('.face') as HTMLElement;
    if (f) {
      f.style.setProperty('--lx', '30%');
      f.style.setProperty('--ly', '0%');
    }
    const s = c.querySelector('.shot') as HTMLElement;
    if (s) {
      s.style.setProperty('--ix', '0px');
      s.style.setProperty('--iy', '0px');
    }
  };

  // Layout calculation for a specific active index
  const layoutForActive = useCallback((targetActive: number) => {
    const cards = cardsRef.current.filter(Boolean) as HTMLButtonElement[];
    if (!cards.length || !stageRef.current) return;

    const mobileMQ = window.matchMedia('(max-width:1000px)');
    const cw = cards[0].offsetWidth;
    const n = cards.length;
    const sel = targetActive >= 0;
    const sw = stageRef.current.clientWidth;

    let leftW = sw;
    let shift = 0;

    if (sel && !mobileMQ.matches) {
      const gap = sectionRef.current
        ? parseFloat(getComputedStyle(sectionRef.current).columnGap) || parseFloat(getComputedStyle(sectionRef.current).gap) || 40
        : 40;
      // Grid ratio is minmax(0, 1.15fr) minmax(0, 1fr) -> left column is 1.15 / 2.15 of total grid width
      leftW = (sw - gap) * (1.15 / 2.15);
      shift = leftW / 2 - sw / 2;
    }

    const spread = sel ? Math.min(2, n - 1) : (n - 1) / 2;
    const step = Math.max(cw * 0.12, Math.min(cw * 0.38, (leftW / 2 - cw * 0.62) / Math.max(spread, 1)));

    cards.forEach((c, i) => {
      if (!c) return;
      const o = sel ? i - targetActive : i - (n - 1) / 2;
      const a = Math.abs(o);
      const act = i === (sel ? targetActive : hov);
      const hide = sel && i !== targetActive;
      const x = shift + o * step + Math.sign(o) * (a > 0.4 ? Math.min(cw * 0.14, step * 0.33) : 0);
      const y = a * a * cw * 0.035;
      const z = act ? 60 : -a * 70 - 20;
      const ry = act ? 0 : -Math.sign(o) * (a ? 18 + a * 4 : 0);
      const rz = o * 1.8;
      const sc = act ? 1.04 : 1 - a * 0.06;

      curRef.current[i] = { x, y, z, ry, rz, sc };
      c.style.transform = T(x, y, z, 0, ry, rz, sc);
      c.style.zIndex = String(Math.round(20 - a * 2) + (act ? 10 : 0));
      c.style.opacity = hide ? '0' : '1';
      c.style.pointerEvents = hide ? 'none' : 'auto';

      c.classList.toggle('active', sel && i === targetActive);
      c.classList.toggle('lift', !sel && i === hov);
      c.setAttribute('aria-selected', String(sel && i === targetActive));
      c.tabIndex = !sel || act ? 0 : -1;

      if (!act) resetTilt(c);
    });
  }, [hov]);

  // 3D Flight Physics Animation matching project-section.html
  const flight = useCallback(
    (f: number, starts: string[], vis: boolean[], prev: typeof curRef.current, shadow0: string) => {
      const cards = cardsRef.current.filter(Boolean) as HTMLButtonElement[];
      if (!cards[f]) return;

      const cw = cards[0].offsetWidth;
      const D = 1200;
      const P0 = prev[f];
      const P1 = curRef.current[f];
      if (!P0 || !P1) return;

      const dir = Math.sign(P1.x - P0.x) || -1;
      const kf = [
        { transform: starts[f], offset: 0, easing: 'cubic-bezier(.3,0,.2,1)' },
        { transform: T(P0.x, P0.y - cw * 0.06, Math.max(P0.z, 0) + cw * 0.3, -6, P0.ry * 0.55, P0.rz, P0.sc * 1.04), offset: 0.2, easing: 'cubic-bezier(.45,.05,.4,1)' },
        { transform: T(lerp(P0.x, P1.x, 0.64), lerp(P0.y, P1.y, 0.64) - cw * 0.05, cw * 0.34, -4, dir * 15, lerp(P0.rz, P1.rz, 0.6) + dir * 1.5, 1.06), offset: 0.55, easing: 'cubic-bezier(.3,.2,.3,1)' },
        { transform: T(P1.x + dir * cw * 0.02, P1.y, P1.z + cw * 0.1, 2, -dir * 3, P1.rz * 0.3, P1.sc * 1.015), offset: 0.82, easing: 'cubic-bezier(.3,.6,.4,1)' },
        { transform: T(P1.x, P1.y, P1.z, 0, P1.ry, P1.rz, P1.sc), offset: 1 }
      ];

      const a = cards[f].animate(kf as any, { duration: D });
      a.onfinish = () => cards.forEach((c) => { if (c) c.style.transition = ''; });
      animsRef.current.push(a);

      const face = cards[f].querySelector('.face') as HTMLElement;
      if (face) {
        const end = getComputedStyle(face).boxShadow;
        const liftShadow = 'inset 0 0 0 1px #e8a33d88,inset 0 1px 0 #ffffffa0,inset 0 -18px 30px -18px #000,0 80px 90px -28px #000e,0 26px 44px -12px #000b';
        animsRef.current.push(
          face.animate(
            [{ boxShadow: shadow0, offset: 0 }, { boxShadow: liftShadow, offset: 0.2 }, { boxShadow: liftShadow, offset: 0.6 }, { boxShadow: end, offset: 1 }] as any,
            { duration: D, easing: 'ease-out' }
          )
        );
        animsRef.current.push(
          face.animate(
            [{ filter: 'brightness(1)' }, { filter: 'brightness(1.13)', offset: 0.3 }, { filter: 'brightness(1.13)', offset: 0.58 }, { filter: 'brightness(1)' }] as any,
            { duration: D }
          )
        );
      }

      cards.forEach((c, j) => {
        if (!c || j === f || (!vis[j] && c.style.opacity === '0')) return;
        const A = prev[j];
        const B = curRef.current[j];
        if (!A || !B) return;

        const away = Math.sign(A.x - P0.x) || (j < f ? -1 : 1);
        animsRef.current.push(
          c.animate(
            [
              { transform: starts[j], offset: 0, easing: 'cubic-bezier(.3,0,.2,1)' },
              { transform: T(lerp(A.x, B.x, 0.35) + away * cw * 0.07, lerp(A.y, B.y, 0.35), Math.min(A.z, B.z) - cw * 0.12, 0, lerp(A.ry, B.ry, 0.35), lerp(A.rz, B.rz, 0.35), lerp(A.sc, B.sc, 0.35) * 0.98), offset: 0.35, easing: 'cubic-bezier(.3,0,.2,1)' },
              { transform: T(B.x, B.y, B.z, 0, B.ry, B.rz, B.sc), offset: 1 }
            ] as any,
            { duration: 950 }
          )
        );
      });
    },
    []
  );

  // Selection handler
  const select = useCallback(
    (i: number) => {
      if (i < 0 || i >= projects.length || i === activeRef.current) return;
      const cards = cardsRef.current.filter(Boolean) as HTMLButtonElement[];
      const first = activeRef.current < 0;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

      const starts = cards.map((c) => (c ? getComputedStyle(c).transform : ''));
      const vis = cards.map((c) => (c ? parseFloat(getComputedStyle(c).opacity) > 0.05 : false));
      const prev = curRef.current.map((q) => ({ ...q }));
      const shadow0 = cards[i]
        ? getComputedStyle(cards[i].querySelector('.face') as HTMLElement).boxShadow
        : '';

      animsRef.current.forEach((a) => a.cancel());
      animsRef.current = [];

      pendingFlightRef.current = {
        index: i,
        starts,
        vis,
        prev,
        shadow0
      };

      activeRef.current = i;
      setActive(i);
      setHov(-1);

      if (timerRef.current) clearTimeout(timerRef.current);

      if (!reduce.matches) {
        cards.forEach((c) => { if (c) c.style.transition = 'opacity .5s ease'; });
      }

      if (!first) {
        setDetailsOut(true);
        timerRef.current = setTimeout(() => {
          setDetailsOut(false);
        }, 180);
      }
    },
    [projects.length]
  );

  const clearSelection = useCallback(() => {
    if (activeRef.current < 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingFlightRef.current = null;
    activeRef.current = -1;
    setActive(-1);
    setDetailsOut(false);
    cardsRef.current.forEach((c) => { if (c) c.style.transition = ''; });
  }, []);

  // Sync layout and flight when active state updates
  useEffect(() => {
    layoutForActive(active);

    if (pendingFlightRef.current !== null) {
      const { index, starts, vis, prev, shadow0 } = pendingFlightRef.current;
      pendingFlightRef.current = null;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      const cards = cardsRef.current.filter(Boolean) as HTMLButtonElement[];
      if (!reduce.matches && cards[index]) {
        flight(index, starts, vis, prev, shadow0);
      }
    }
  }, [active, flight, layoutForActive]);

  // Handle Parallax apply
  const applyTilt = useCallback(() => {
    rafRef.current = 0;
    const fi = activeRef.current >= 0 ? activeRef.current : hov;
    if (fi < 0) return;
    const cards = cardsRef.current.filter(Boolean) as HTMLButtonElement[];
    const c = cards[fi];
    if (!c) return;

    const r = c.getBoundingClientRect();
    const px = Math.max(-1, Math.min(1, ((mxRef.current - r.left) / r.width) * 2 - 1));
    const py = Math.max(-1, Math.min(1, ((myRef.current - r.top) / r.height) * 2 - 1));

    const t = c.querySelector('.tilt') as HTMLElement;
    if (t) {
      t.classList.add('live');
      t.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
      t.style.setProperty('--rx', (-py * 6).toFixed(2) + 'deg');
    }

    const s = c.querySelector('.shot') as HTMLElement;
    if (s) {
      s.style.setProperty('--ix', (-px * 5).toFixed(1) + 'px');
      s.style.setProperty('--iy', (-py * 4).toFixed(1) + 'px');
    }

    const f = c.querySelector('.face') as HTMLElement;
    if (f) {
      f.style.setProperty('--lx', (px + 1) * 50 + '%');
      f.style.setProperty('--ly', (py + 1) * 50 + '%');
    }
  }, [hov]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cards = cardsRef.current.filter(Boolean) as HTMLButtonElement[];

    if (activeRef.current < 0) {
      const r = hov >= 0 && cards[hov] ? cards[hov]!.getBoundingClientRect() : null;
      const inside = r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) {
        const h = (e.target as HTMLElement).closest && (e.target as HTMLElement).closest('.card');
        const ni = h ? cards.indexOf(h as HTMLButtonElement) : -1;
        if (ni !== hov) {
          setHov(ni);
        }
      }
      if (hov < 0) return;
    }
    if (reduce.matches) return;
    mxRef.current = e.clientX;
    myRef.current = e.clientY;
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(applyTilt);
    }
  };

  const handlePointerLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const cards = cardsRef.current.filter(Boolean) as HTMLButtonElement[];
    if (activeRef.current < 0) {
      setHov(-1);
    } else if (cards[activeRef.current]) {
      resetTilt(cards[activeRef.current]!);
    }
  };

  // Keyboard navigation & Resize listeners
  useEffect(() => {
    const handleResize = () => {
      layoutForActive(activeRef.current);
    };
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0].intersectionRatio >= 0.3;
      },
      { threshold: [0, 0.3, 1] }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    const handleKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!inViewRef.current || activeRef.current < 0 || e.altKey || e.ctrlKey || e.metaKey) return;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;

      if (e.key === 'ArrowRight') {
        select(activeRef.current + 1);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        select(activeRef.current - 1);
        e.preventDefault();
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [clearSelection, layoutForActive, select]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div id="projects-section-3d" data-narrator-section="projects" className="relative w-full bg-transparent text-[#efeae0]">
      {/* Embedded Scoped CSS matching project-section.html */}
      <style>{`
        #projects-section-3d {
          --bg: #000000;
          --fg: #efeae0;
          --mute: #8a8578;
          --line: #2a2a2d;
          --acc: #e8a33d;
          box-sizing: border-box;
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        #projects-section-3d * {
          box-sizing: border-box;
        }
        #projects-section-3d #projects {
          min-height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(32px, 7vw, 100px) clamp(18px, 4vw, 64px);
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: clamp(24px, 4vw, 80px);
          align-items: center;
        }
        #projects-section-3d .stage {
          grid-area: 1/1/2/3;
          --cw: clamp(250px, 25vw, 360px);
          position: relative;
          height: calc(var(--cw) * 1.65);
          perspective: 1400px;
          overflow: hidden;
          display: grid;
          place-items: center;
          outline: none;
        }
        #projects-section-3d .orbit {
          position: relative;
          width: var(--cw);
          height: calc(var(--cw) * 1.4);
          transform-style: preserve-3d;
        }
        #projects-section-3d .card {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          cursor: pointer;
          border: 0;
          padding: 0;
          background: none;
          color: inherit;
          font: inherit;
          text-align: left;
          transition: transform .75s cubic-bezier(.2,.8,.2,1), opacity .5s, filter .5s;
          will-change: transform;
        }
        #projects-section-3d .card:focus-visible {
          outline: 2px solid var(--acc);
          outline-offset: 6px;
          border-radius: 24px;
        }
        #projects-section-3d .tilt {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
          transition: transform .35s ease-out;
        }
        #projects-section-3d .card.active .tilt.live,
        #projects-section-3d .card.lift .tilt.live {
          transition: transform .08s linear;
        }
        #projects-section-3d .face {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: linear-gradient(165deg,#222226,#151518 60%,#111113);
          box-shadow: inset 0 0 0 1px #ffffff14,inset 0 1px 0 #ffffff30,inset 0 -18px 30px -18px #000,0 28px 40px -18px #000b,0 8px 16px -8px #0009;
        }
        #projects-section-3d .card.active .face,
        #projects-section-3d .card.lift .face {
          box-shadow: inset 0 0 0 1px #e8a33d55,inset 0 1px 0 #ffffff55,inset 0 -18px 30px -18px #000,0 40px 60px -20px #000,0 10px 20px -8px #000b;
        }
        #projects-section-3d .shot {
          position: relative;
          margin: 12px 12px 0;
          height: 48%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: inset 0 0 0 1px #ffffff12,0 6px 14px -6px #000;
        }
        #projects-section-3d .shot img,
        #projects-section-3d .shot .ph {
          position: absolute;
          inset: -6px;
          width: calc(100% + 12px);
          height: calc(100% + 12px);
          object-fit: cover;
          transform: translate(var(--ix,0px),var(--iy,0px));
          transition: transform .35s ease-out;
        }
        #projects-section-3d .ph {
          display: grid;
          place-items: center;
          font-family: "Instrument Serif", serif;
          font-size: 72px;
          color: #ffffffc0;
        }
        #projects-section-3d .shot::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg,#ffffff2e 0,transparent 22%),linear-gradient(0deg,#0007,transparent 45%);
        }
        #projects-section-3d .copy {
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-height: 0;
        }
        #projects-section-3d .cat {
          font-size: 10px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--acc);
        }
        #projects-section-3d .ct {
          font-family: "Instrument Serif", Georgia, serif;
          font-size: clamp(24px,2.4vw,34px);
          line-height: 1.05;
          margin: 2px 0 0;
        }
        #projects-section-3d .cd {
          font-size: 12px;
          line-height: 1.5;
          color: #b8b2a5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        #projects-section-3d .cs {
          margin-top: auto;
          font-size: 11px;
          color: var(--mute);
          display: flex;
          justify-content: space-between;
          align-items: end;
        }
        #projects-section-3d .cs b {
          font-weight: 500;
          color: var(--fg);
          font-size: 13px;
          letter-spacing: .1em;
        }
        #projects-section-3d .sheen {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          pointer-events: none;
          mix-blend-mode: soft-light;
          background: radial-gradient(circle at var(--lx,30%) var(--ly,0%),#ffffff55,transparent 55%);
        }
        #projects-section-3d .meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          letter-spacing: .22em;
          color: var(--mute);
          border-bottom: 1px solid var(--line);
          padding-bottom: 14px;
          margin-bottom: 28px;
        }
        #projects-section-3d .meta b {
          color: var(--acc);
          font-weight: 500;
        }
        #projects-section-3d #det {
          transition: opacity .25s, transform .25s;
        }
        #projects-section-3d #det.out {
          opacity: 0;
          transform: translateY(12px);
        }
        #projects-section-3d h2 {
          font-family: "Instrument Serif", Georgia, serif;
          font-weight: 400;
          font-size: clamp(38px,5vw,76px);
          line-height: .95;
          margin: 0 0 8px;
        }
        #projects-section-3d .dcat {
          font-size: 11px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--acc);
          margin-bottom: 22px;
        }
        #projects-section-3d .dd {
          color: #cbc5b8;
          font-size: 15px;
          line-height: 1.7;
          max-width: 50ch;
          margin: 0 0 26px;
        }
        #projects-section-3d .h {
          font-size: 10px;
          letter-spacing: .3em;
          color: var(--mute);
          margin: 0 0 10px;
        }
        #projects-section-3d .tags,
        #projects-section-3d .feat {
          list-style: none;
          padding: 0;
          margin: 0 0 26px;
        }
        #projects-section-3d .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        #projects-section-3d .tags li {
          font-size: 12px;
          border: 1px solid var(--line);
          padding: 6px 12px;
          border-radius: 99px;
        }
        #projects-section-3d .feat li {
          font-size: 14px;
          color: #cbc5b8;
          padding: 5px 0 5px 18px;
          position: relative;
        }
        #projects-section-3d .feat li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 13px;
          width: 8px;
          height: 1px;
          background: var(--acc);
        }
        #projects-section-3d .acts {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        #projects-section-3d .btn {
          font-size: 11px;
          letter-spacing: .2em;
          text-decoration: none;
          color: var(--fg);
          border: 1px solid var(--fg);
          padding: 13px 22px;
          transition: .2s;
          cursor: pointer;
        }
        #projects-section-3d .btn:hover,
        #projects-section-3d .btn:focus-visible {
          background: var(--fg);
          color: var(--bg);
          outline: none;
        }
        #projects-section-3d .btn.s {
          background: var(--acc);
          border-color: var(--acc);
          color: #16110a;
        }
        #projects-section-3d .btn[aria-disabled=true] {
          opacity: .35;
          pointer-events: none;
        }
        #projects-section-3d .nav {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 34px;
          font-size: 10px;
          letter-spacing: .2em;
          color: var(--mute);
        }
        #projects-section-3d .nav button {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: none;
          border: 1px solid var(--line);
          color: var(--fg);
          font-size: 17px;
          cursor: pointer;
          transition: .2s;
        }
        #projects-section-3d .nav button:hover:not(:disabled) {
          border-color: var(--acc);
          color: var(--acc);
        }
        #projects-section-3d .nav button:disabled {
          opacity: .25;
        }
        #projects-section-3d kbd {
          border: 1px solid var(--line);
          padding: 1px 6px;
          border-radius: 3px;
        }
        #projects-section-3d .side {
          grid-area: 1/2/2/3;
          position: relative;
          z-index: 2;
          opacity: 0;
          visibility: hidden;
          transform: translateX(28px);
          transition: opacity .6s ease .35s, transform .8s cubic-bezier(.2,.8,.2,1) .35s, visibility 0s linear .95s;
        }
        #projects-section-3d #projects.sel .side {
          opacity: 1;
          visibility: visible;
          transform: none;
          transition: opacity .6s ease .35s, transform .8s cubic-bezier(.2,.8,.2,1) .35s, visibility 0s;
        }
        #projects-section-3d .nav button.all {
          width: auto;
          padding: 0 18px;
          border-radius: 99px;
          font: inherit;
          font-size: 10px;
          letter-spacing: .2em;
          margin-left: auto;
        }
        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
        }
        @media (max-width: 1000px) {
          #projects-section-3d #projects {
            grid-template-columns: 1fr;
          }
          #projects-section-3d .stage {
            grid-area: auto;
            --cw: clamp(220px, 48vw, 320px);
          }
          #projects-section-3d .side {
            grid-area: auto;
            display: none;
            opacity: 1;
            visibility: visible;
            transform: none;
            transition: none;
          }
          #projects-section-3d #projects.sel .side {
            display: block;
            animation: rise .7s cubic-bezier(.2,.8,.2,1) .3s both;
          }
        }
        @media (max-width: 520px) {
          #projects-section-3d .stage {
            --cw: clamp(200px, 64vw, 270px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          #projects-section-3d .side,
          #projects-section-3d #projects.sel .side {
            transition-duration: .01s !important;
            transition-delay: 0s !important;
          }
          #projects-section-3d .card,
          #projects-section-3d .tilt,
          #projects-section-3d #det,
          #projects-section-3d .shot img,
          #projects-section-3d .shot .ph {
            transition-duration: .01s !important;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-12 py-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500">03 /</span>
          <div className="font-semibold text-lg sm:text-2xl tracking-tight text-white m-0 p-0" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Projects Archive
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section
        id="projects"
        ref={sectionRef}
        aria-label="Projects"
        className={active >= 0 ? 'sel' : ''}
      >
        {/* 3D Stage */}
        <div
          className="stage"
          ref={stageRef}
          role="listbox"
          aria-label="Projects"
          tabIndex={0}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div className="orbit">
            {projects.map((p, i) => (
              <button
                key={p.title + i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="card"
                data-i={i}
                data-narrator-hover="hoverProject"
                data-narrator-click="projectClick"
                role="option"
                aria-label={p.title}
                onClick={() => select(i)}
              >
                <span className="tilt">
                  <span className="face">
                    <span className="shot">
                      {p.image ? (
                        <img src={p.image} alt={`${p.title} screenshot`} loading="lazy" />
                      ) : (
                        <span
                          className="ph"
                          style={{
                            background: `linear-gradient(135deg, hsl(${p.hue} 45% 32%), hsl(${p.hue + 40} 50% 14%))`
                          }}
                        >
                          {p.title[0]}
                        </span>
                      )}
                    </span>
                    <span className="copy">
                      <span className="cat">{p.category}</span>
                      <span className="ct">{p.title}</span>
                      <span className="cd">{p.description}</span>
                      <span className="cs">
                        <span>{p.technologies.slice(0, 3).join(' • ')}</span>
                        <b>{pad(i + 1)}</b>
                      </span>
                    </span>
                    <span className="sheen"></span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Side Details Panel */}
        <div className="side" ref={sideRef}>
          <div className="meta">
            <span>
              PROJECT <b>{pad(active >= 0 ? active + 1 : 1)}</b> / {pad(projects.length)}
            </span>
            <span>ARCHIVE</span>
          </div>

          <div id="det" className={detailsOut ? 'out' : ''}>
            <h2>{activeProject.title}</h2>
            <div className="dcat">{activeProject.category}</div>
            <p className="dd">{activeProject.description}</p>

            <div className="h">TECH STACK</div>
            <ul className="tags">
              {activeProject.technologies.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            {activeProject.features && activeProject.features.length > 0 && (
              <>
                <div className="h">KEY FEATURES</div>
                <ul className="feat">
                  {activeProject.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="acts">
              {activeProject.liveDemo ? (
                <a className="btn s" href={activeProject.liveDemo} target="_blank" rel="noopener noreferrer">
                  LIVE DEMO ↗
                </a>
              ) : (
                <a className="btn s" aria-disabled="true">
                  LIVE DEMO ↗
                </a>
              )}
              {activeProject.github ? (
                <a className="btn" href={activeProject.github} target="_blank" rel="noopener noreferrer">
                  GITHUB
                </a>
              ) : (
                <a className="btn" aria-disabled="true">
                  GITHUB
                </a>
              )}
            </div>
          </div>

          <div className="nav">
            <button
              onClick={() => select(active - 1)}
              disabled={active <= 0}
              aria-label="Previous project"
            >
              ←
            </button>
            <button
              onClick={() => select(active + 1)}
              disabled={active >= projects.length - 1}
              aria-label="Next project"
            >
              →
            </button>
            <span>
              &nbsp;<kbd>←</kbd> <kbd>→</kbd>
            </span>
            <button
              className="all"
              onClick={clearSelection}
              aria-label="Back to all projects"
            >
              ALL PROJECTS
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export const CRTProjectsShowcase = React.memo(CRTProjectsShowcaseComponent);
export default CRTProjectsShowcase;

