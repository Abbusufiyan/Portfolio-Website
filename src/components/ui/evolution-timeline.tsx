import { useEffect, useRef } from 'react';


interface MilestoneItem {
  year: string;
  title: string;
  description: string;
}

const milestones: MilestoneItem[] = [
  {
    year: 'FEB 2025',
    title: 'Started Programming',
    description: 'Started learning C'
  },
  {
    year: 'MAY 2025',
    title: 'Shifted to C++',
    description: 'Moved from C to C++. Started getting comfortable with OOP concepts and problem solving.'
  },
  {
    year: '2025',
    title: 'DSA',
    description: 'Started Data Structures & Algorithms for academics. Began practicing problem solving.'
  },
  {
    year: 'SEP 2025',
    title: 'JavaScript',
    description: 'Completed learning JavaScript.'
  },
  {
    year: 'OCT 2025',
    title: 'React',
    description: 'Completed learning React. Started building more interactive web applications.'
  },
  {
    year: 'FEB 2026',
    title: 'DBMS',
    description: 'Completed Database Management Systems.'
  },
  {
    year: 'MAR 2026',
    title: 'OOP',
    description: 'Completed Object-Oriented Programming.'
  },
  {
    year: 'APR 2026',
    title: 'Backend',
    description: 'Completed learning Backend Development with JavaScript.'
  },
  {
    year: 'MAY 2026',
    title: 'MERN',
    description: 'Completed the MERN stack. Built Cura — Shopping Project.'
  },
  {
    year: 'JUL 2026',
    title: 'Music Application',
    description: 'Completed the Music Application. Worked with frontend + backend integration.'
  },
  {
    year: 'SEP 2026',
    title: 'Portfolio',
    description: 'Completed the 3D Interactive Portfolio Website. Combined React, Three.js, animations and interactive 3D experiences.'
  }
];

export function MilestoneArchive() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
    const cardEls = [...track.querySelectorAll<HTMLElement>('.ma-card')];

    const wander = (x: number, amp: number) =>
      (amp * (Math.sin(x / 230 + 1.3) + 0.45 * Math.sin(x / 91 + 0.4) + 0.6 * Math.sin(x / 440 + 2.2))) / 2.05;

    /* ── horizontal energy strand + nodes ── */
    let marks: HTMLElement[] = [];

    function buildStrand() {
      const W = track!.clientWidth;
      const H = track!.clientHeight;
      const ay = H / 2;
      const amp = W < 760 ? 10 : 18;
      const yf = (x: number) => ay + wander(x, amp);

      const mk = (fy: (x: number) => number, st: number) => {
        let d = '';
        for (let x = -12; x <= W + 12; x += st)
          d += (d ? 'L' : 'M') + x + ' ' + fy(x).toFixed(1);
        return d;
      };

      const D: Record<string, string> = {
        main: mk(yf, 12),
        fiber1: mk((x) => yf(x) + 5 * Math.sin(x * 0.052) + 1.4 * Math.sin(x * 0.17), 8),
        fiber2: mk((x) => yf(x) - 4.5 * Math.sin(x * 0.052 + 2.1) + 1.4 * Math.sin(x * 0.13 + 1), 8)
      };

      track!.querySelectorAll('svg.ma-l').forEach((s) =>
        s.setAttribute('viewBox', `0 0 ${W} ${H}`)
      );
      track!.querySelectorAll<SVGPathElement>('path[data-p]').forEach((p) => {
        const key = p.dataset.p;
        if (key && D[key]) p.setAttribute('d', D[key]);
      });
      const grad = track!.querySelector('linearGradient');
      if (grad) grad.setAttribute('x2', String(W));

      marks.forEach((m) => m.remove());
      marks = [];
      const tr = track!.getBoundingClientRect();

      cardEls.forEach((card) => {
        const it = card.parentElement!.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        const x = it.left - tr.left + it.width / 2;
        const y = yf(x);
        const above = cr.top - tr.top + cr.height / 2 > y;

        const n = document.createElement('div');
        n.className = 'ma-node';
        n.style.left = x - 10 + 'px';
        n.style.top = y - 10 + 'px';

        const c = document.createElement('div');
        c.className = 'ma-conn';
        c.style.left = x - 1 + 'px';

        if (above) {
          const t = cr.bottom - tr.top;
          c.style.top = t + 'px';
          c.style.height = Math.max(0, y - t) + 'px';
        } else {
          c.style.top = y + 'px';
          c.style.height = Math.max(0, cr.top - tr.top - y) + 'px';
        }

        track!.append(c, n);
        marks.push(n, c);
        (card as any)._node = n;
      });
    }

    /* ── CSS 3D Card Interactivity & Pointer Effects ── */
    cardEls.forEach((card) => {
      card.addEventListener('pointermove', (e: PointerEvent) => {
        if (reduce.matches || e.pointerType === 'touch') return;
        const b = card.getBoundingClientRect();
        const nx = (e.clientX - b.left) / b.width * 2 - 1;
        const ny = (e.clientY - b.top) / b.height * 2 - 1;
        card.style.transform = `perspective(800px) rotateX(${(-ny * 8).toFixed(2)}deg) rotateY(${(nx * 10).toFixed(2)}deg) translateY(-6px) scale(1.02)`;
        card.style.borderColor = '#3ee69a';
        card.style.boxShadow = '0 16px 32px -8px rgba(0,0,0,0.8), 0 0 20px rgba(62,230,154,0.3)';
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
        card.style.borderColor = '';
        card.style.boxShadow = '';
      });
    });

    /* node glow on scroll */
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        const c = e.target as any;
        if (c._node) c._node.classList.toggle('on', e.isIntersecting);
      }),
      { root: scroller, threshold: 0.35 }
    );
    cardEls.forEach((c) => io.observe(c));

    const trackIo = new IntersectionObserver((e) => {
      track!.classList.toggle('off', !e[0].isIntersecting);
    });
    trackIo.observe(track!);

    /* wheel: redirect vertical scroll to horizontal while inside */
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return;
      const max = scroller!.scrollWidth - scroller!.clientWidth;
      if ((e.deltaY > 0 && scroller!.scrollLeft < max - 1) ||
          (e.deltaY < 0 && scroller!.scrollLeft > 1)) {
        scroller!.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    scroller.addEventListener('wheel', handleWheel, { passive: false });

    /* mouse drag */
    let dragX: number | null = null;
    let dragL = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragX = e.clientX; dragL = scroller!.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (dragX === null) return;
      const d = e.clientX - dragX;
      if (Math.abs(d) > 4) scroller!.classList.add('drag');
      scroller!.scrollLeft = dragL - d;
    };
    const onUp = () => { dragX = null; scroller!.classList.remove('drag'); };
    scroller.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    /* resize: rebuild strand, rebuild slabs if card size changed */
    const ro = new ResizeObserver(() => {
      buildStrand();
    });
    ro.observe(track);
    buildStrand();

    return () => {
      io.disconnect();
      trackIo.disconnect();
      ro.disconnect();
      marks.forEach((m) => m.remove());
      scroller.removeEventListener('wheel', handleWheel);
      scroller.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <section aria-label="Milestone Archive" id="milestone-archive" style={{
      background: '#000000',
      padding: 'clamp(40px,7vw,100px) 0',
      color: '#e9efe6',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      <style>{`
        #milestone-archive * { box-sizing: border-box; }
        #milestone-archive h2 {
          font-family: "Instrument Serif", Georgia, serif;
          font-weight: 400;
          font-size: clamp(40px,6vw,80px);
          margin: 0 0 20px;
          padding: 0 16px;
          text-align: center;
          color: #e9efe6;
        }
        #milestone-archive .ma-hint {
          text-align: center;
          font-size: 11px;
          letter-spacing: .22em;
          color: #6f7d73;
          margin: 0 0 10px;
        }
        #milestone-archive .ma-scroller {
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: thin;
          scrollbar-color: #4a6b57 #000000;
          cursor: grab;
          overscroll-behavior-x: contain;
        }
        #milestone-archive .ma-scroller.drag { cursor: grabbing; user-select: none; }
        #milestone-archive .ma-track {
          position: relative;
          display: flex;
          min-width: 100%;
          width: max-content;
          height: 660px;
        }
        #milestone-archive .ma-items {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          height: 100%;
          position: relative;
          z-index: 3;
          flex: 1;
        }
        #milestone-archive .ma-item {
          position: relative;
          flex: 0 0 clamp(300px, 28vw, 420px);
          height: 100%;
        }
        #milestone-archive .ma-card {
          position: absolute;
          left: 50%;
          margin-left: -120px;
          width: 240px;
          height: auto;
          min-height: 200px;
        }
        #milestone-archive .ma-item:nth-child(odd) .ma-card { bottom: calc(50% + 78px); }
        #milestone-archive .ma-item:nth-child(even) .ma-card { top: calc(50% + 78px); }
        #milestone-archive .ma-card:not(.ma-card-gl) {
          background: #000000;
          border: 1px solid #1d2a22;
          border-radius: 18px;
        }
        #milestone-archive canvas.ma-gl {
          position: absolute;
          left: -28px; top: -28px;
          width: calc(100% + 56px);
          height: calc(100% + 56px);
          pointer-events: none;
        }
        #milestone-archive .ma-txt {
          position: relative;
          height: auto;
          padding: 24px 24px;
          transform-origin: 50% 50%;
          will-change: transform;
        }
        #milestone-archive .ma-card.ma-card-gl .ma-txt { opacity: 0; }
        #milestone-archive .ma-yr {
          font-size: 11px;
          letter-spacing: .22em;
          color: #b9ff85;
        }
        #milestone-archive .ma-txt h3 {
          font-family: "Instrument Serif", Georgia, serif;
          font-weight: 400;
          font-size: 27px;
          line-height: 1.05;
          margin: 8px 0 8px;
          color: #e9efe6;
        }
        #milestone-archive .ma-txt p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: #aab5ac;
        }
        /* strand layers */
        #milestone-archive .ma-l {
          position: absolute;
          left: 0; top: 0;
          width: 100%; height: 100%;
          overflow: visible;
          pointer-events: none;
          z-index: 1;
        }
        #milestone-archive .ma-l path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
        #milestone-archive .ma-glow { filter: blur(9px); }
        #milestone-archive .ma-bloom { filter: blur(4px); }
        #milestone-archive .ma-glow, #milestone-archive .ma-bloom { will-change: transform; }
        #milestone-archive .ma-l .ma-flow { stroke-dasharray: 140 210 60 590; animation: ma-flow 34s linear infinite; }
        #milestone-archive .ma-l .ma-pulse { stroke-dasharray: 90 910; animation: ma-flow 20s linear infinite; }
        #milestone-archive .ma-l .ma-pulse.b { stroke-dasharray: 50 450; animation-duration: 29s; }
        @keyframes ma-flow { to { stroke-dashoffset: -1000; } }
        #milestone-archive .ma-track.off .ma-flow,
        #milestone-archive .ma-track.off .ma-pulse { animation-play-state: paused; }
        #milestone-archive .ma-node {
          position: absolute;
          width: 20px; height: 20px;
          border-radius: 50%;
          z-index: 2;
          background: radial-gradient(circle, #fff 0 30%, #c8ff9a 48%, #2fe08c00 74%);
          box-shadow: 0 0 0 1px #d8ffb066, 0 0 14px 2px #2fe08c55;
          transition: box-shadow .8s, transform .8s;
        }
        #milestone-archive .ma-node.on {
          transform: scale(1.3);
          box-shadow: 0 0 0 1px #e6ffc8cc, 0 0 26px 7px #2fe08c88;
        }
        #milestone-archive .ma-conn {
          position: absolute;
          width: 2px;
          z-index: 2;
          background: linear-gradient(180deg, #c8ff9a00, #c8ff9a99 50%, #c8ff9a00);
        }
        @media (max-width: 759px) {
          #milestone-archive .ma-track { height: 620px; }
          #milestone-archive .ma-item { flex-basis: 260px; }
          #milestone-archive .ma-card { margin-left: -110px; width: 220px; }
        }
        @media (prefers-reduced-motion: reduce) {
          #milestone-archive .ma-l .ma-flow,
          #milestone-archive .ma-l .ma-pulse { animation: none; }
          #milestone-archive .ma-node { transition: none; }
        }
      `}</style>

      <h2>Milestone Archive</h2>
      <p className="ma-hint">DRAG, SCROLL OR SWIPE →</p>

      <div className="ma-scroller" ref={scrollerRef}>
        <div className="ma-track" ref={trackRef}>

          {/* SVG Strand Layers — exact copy from Milestone Archive.html */}
          <svg className="ma-l ma-glow" aria-hidden="true">
            <path data-p="main" stroke="#2fe08c" strokeWidth="30" opacity=".3" />
            <path data-p="main" stroke="#b9ff85" strokeWidth="11" opacity=".5" />
          </svg>

          <svg className="ma-l ma-bloom" aria-hidden="true">
            <path className="ma-flow" data-p="main" pathLength="1000" stroke="#d6ffa8" strokeWidth="16" opacity=".6" />
          </svg>

          <svg className="ma-l ma-core" aria-hidden="true">
            <defs>
              <linearGradient id="ma-vein" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
                <stop offset="0" stopColor="#f7ffe4" stopOpacity=".95" />
                <stop offset=".12" stopColor="#fff" stopOpacity="1" />
                <stop offset=".3" stopColor="#c8ff9a" stopOpacity=".85" />
                <stop offset=".46" stopColor="#fff" stopOpacity="1" />
                <stop offset=".64" stopColor="#aaf8b4" stopOpacity=".85" />
                <stop offset=".8" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#f7ffe4" stopOpacity=".95" />
              </linearGradient>
            </defs>
            <path data-p="fiber1" stroke="#e6ffc4" strokeWidth="1.3" opacity=".65" />
            <path data-p="fiber2" stroke="#9ff7bd" strokeWidth="1.1" opacity=".55" />
            <path data-p="main" stroke="url(#ma-vein)" strokeWidth="3.6" />
            <path className="ma-pulse" data-p="main" pathLength="1000" stroke="#fff" strokeWidth="5" opacity="1" />
            <path className="ma-pulse b" data-p="main" pathLength="1000" stroke="#f1ffd6" strokeWidth="4" opacity=".85" />
          </svg>

          {/* Milestone Cards */}
          <ol className="ma-items">
            {milestones.map((m, i) => (
              <li key={i} className="ma-item">
                <article className="ma-card">
                  <div className="ma-txt">
                    <div className="ma-yr">{m.year}</div>
                    <h3>{m.title}</h3>
                    <p>{m.description}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>

        </div>
      </div>
    </section>
  );
}

export default MilestoneArchive;
