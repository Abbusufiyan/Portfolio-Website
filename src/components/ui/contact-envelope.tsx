import React, { useState, useRef, useEffect } from 'react';

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

const socials: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/Abbusufiyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    )
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/syn.omr/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    )
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/abu-sufiyan-5b1934333/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    )
  },
  {
    name: 'LeetCode',
    url: 'https://leetcode.com/u/BUHw5Vatuj/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 3.5L6 11a3.5 3.5 0 0 0 0 5l2.5 2.5a3.5 3.5 0 0 0 5 0l2.5-2.5" />
        <path d="M9.5 12h10.5" />
      </svg>
    )
  },
  {
    name: 'TakeUForward',
    url: 'https://takeuforward.org/profile/1by25cs401',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 17 11 12 6 7" />
        <polyline points="13 17 18 12 13 7" />
      </svg>
    )
  },
  {
    name: 'Gmail',
    url: 'mailto:abbusufiyan753@gmail.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    )
  }
];

export function ContactEnvelopeComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);

  const openEnvelope = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const sec = sectionRef.current;
    const tilt = tiltRef.current;
    const env = envRef.current;
    if (!sec || !tilt || !env) return;

    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
    let raf = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (reduce.matches || e.pointerType === 'touch') return;
      const r = env.getBoundingClientRect();
      const px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      const py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));

      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          tilt.style.setProperty('--ry', `${(px * 11).toFixed(2)}deg`);
          tilt.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
        });
      }
    };

    const handlePointerLeave = () => {
      tilt.style.setProperty('--ry', '0deg');
      tilt.style.setProperty('--rx', '0deg');
    };

    sec.addEventListener('pointermove', handlePointerMove);
    sec.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      sec.removeEventListener('pointermove', handlePointerMove);
      sec.removeEventListener('pointerleave', handlePointerLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="contact"
      data-narrator-section="contact"
      data-narrator-hover="hoverContact"
      ref={sectionRef}
      aria-label="Contact"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(48px,8vw,110px) 16px',
        overflowX: 'clip',
        background: '#000000',
        color: '#e9efe6',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <style>{`
        #contact * { box-sizing: border-box; }
        #contact .eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #b9ff85;
          margin: 0 0 14px;
        }
        #contact h2 {
          font-family: "Instrument Serif", Georgia, serif;
          font-weight: 400;
          font-size: clamp(34px, 5.5vw, 68px);
          line-height: 1;
          margin: 0;
          text-align: center;
          color: #e9efe6;
        }
        #contact .scene {
          --w: clamp(300px, 80vw, 500px);
          --h: calc(var(--w) * 0.64);
          --is: clamp(38px, 8.5vw, 54px);
          padding-top: calc(var(--h) * 0.64);
          margin-top: clamp(16px, 4vw, 40px);
          width: var(--w);
        }
        #contact .tilt {
          transform: perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform 0.35s ease-out;
        }
        #contact .float {
          animation: env-float 6s ease-in-out infinite;
        }
        @keyframes env-float {
          50% { transform: translateY(-8px); }
        }
        #contact .env {
          position: relative;
          width: var(--w);
          height: var(--h);
          --fa: 0deg;
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        #contact .env:not(.open):hover {
          --fa: 17deg;
          transform: translateY(-5px);
        }
        #contact .env.open {
          --fa: 180deg;
        }
        #contact .back {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: linear-gradient(180deg, #0b100d, #111915);
          box-shadow: 0 0 0 1px #ffffff14, 0 30px 60px -20px #000;
        }
        #contact .back::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 10px;
          clip-path: polygon(0 0, 100% 0, 50% 54%);
          background: linear-gradient(180deg, #040604, #0a0f0c);
        }
        #contact .sheet {
          position: absolute;
          left: 4%;
          right: 4%;
          top: 9%;
          height: 84%;
          z-index: 2;
          border-radius: 8px;
          padding: clamp(12px, 3vw, 20px) 6px 0;
          background: linear-gradient(180deg, #f3eee0, #e2ddcd);
          color: #16201a;
          box-shadow: 0 -6px 24px #0007;
          text-align: center;
          transition: transform 1.05s cubic-bezier(0.2, 0.85, 0.25, 1) 0.5s;
        }
        #contact .env.open .sheet {
          transform: translateY(-62%);
        }
        #contact .cap {
          font-size: 9px;
          letter-spacing: 0.32em;
          color: #55655a;
          margin: 0 0 clamp(8px, 2vw, 14px);
          font-weight: 600;
        }
        #contact .row {
          display: flex;
          justify-content: center;
          gap: clamp(4px, 1.4vw, 10px);
          perspective: 700px;
        }
        #contact .ico {
          position: relative;
          width: var(--is);
          height: var(--is);
          display: grid;
          place-items: center;
          border-radius: 12px;
          text-decoration: none;
          background: #101a14;
          color: #dcffc2;
          border: 1px solid #2c4034;
          opacity: 0;
          transform: translateY(24px) scale(0.8);
          outline: none;
        }
        #contact .ico svg {
          width: 48%;
          height: 48%;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        #contact .env.open .ico {
          opacity: 1;
          transform: none;
          transition: opacity 0.5s calc(1s + var(--i) * 0.1s), transform 0.75s cubic-bezier(0.2, 0.9, 0.3, 1.25) calc(1s + var(--i) * 0.1s), box-shadow 0.3s, background 0.3s;
        }
        #contact .env.open .ico:hover, #contact .env.open .ico:focus-visible {
          transform: translateY(-7px) scale(1.09) rotateX(10deg);
          background: #16261d;
          box-shadow: 0 14px 22px -8px #000a, 0 0 0 1px #b9ff85, 0 0 18px #2fe08c55;
          transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.3s, background 0.3s;
        }
        #contact .tip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translate(-50%, 6px);
          font-size: 10px;
          letter-spacing: 0.12em;
          white-space: nowrap;
          background: #0b100d;
          color: #e6ffd0;
          padding: 5px 9px;
          border-radius: 6px;
          opacity: 0;
          pointer-events: none;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          border: 1px solid #2c4034;
          z-index: 10;
        }
        #contact .ico:hover .tip, #contact .ico:focus-visible .tip {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        #contact .front {
          position: absolute;
          inset: 0;
          z-index: 3;
          border-radius: 10px;
          clip-path: polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%);
          background: linear-gradient(160deg, #1f2a24, #121915 70%);
        }
        #contact .front svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        #contact .front line {
          stroke: #ffffff;
          stroke-opacity: 0.09;
          stroke-width: 0.4;
          vector-effect: non-scaling-stroke;
        }
        #contact .flap {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 54%;
          z-index: 4;
        }
        #contact .env.open .flap {
          z-index: 1;
          transition: z-index 0s 0.4s;
        }
        #contact .fo, #contact .fi {
          position: absolute;
          inset: 0;
          transform-origin: 50% 0;
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transition: transform 0.9s cubic-bezier(0.3, 0.75, 0.2, 1);
        }
        #contact .fo {
          background: linear-gradient(180deg, #27342c, #18211c);
          transform: perspective(900px) rotateX(var(--fa));
        }
        #contact .fi {
          background: linear-gradient(180deg, #0c120e, #151d18);
          transform: perspective(900px) rotateX(var(--fa)) rotateY(180deg);
        }
        #contact .seal {
          position: absolute;
          left: 50%;
          top: 60%;
          width: clamp(20px, 5vw, 30px);
          aspect-ratio: 1;
          margin: -15px 0 0 -15px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #e6ffc8, #7be07a 45%, #2c8a55);
          box-shadow: 0 4px 10px #000a, 0 0 14px #2fe08c66;
        }
        #contact .btn {
          position: absolute;
          inset: 0;
          z-index: 10;
          background: none;
          border: 0;
          border-radius: 10px;
          cursor: pointer;
          padding: 0;
        }
        #contact .btn:focus-visible {
          outline: 2px solid #b9ff85;
          outline-offset: 6px;
        }
        #contact .env.open .btn {
          pointer-events: none;
        }
        #contact .shadow {
          position: absolute;
          left: 6%;
          right: 6%;
          bottom: -30px;
          height: 24px;
          border-radius: 50%;
          background: radial-gradient(#000d, transparent 70%);
          filter: blur(8px);
          transition: transform 1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1s;
        }
        #contact .env.open .shadow {
          transform: scale(1.2, 1.5);
          opacity: 0.55;
        }
        @media (prefers-reduced-motion: reduce) {
          #contact .float { animation: none; }
          #contact .tilt, #contact .env, #contact .fo, #contact .fi, #contact .sheet, #contact .shadow, #contact .env.open .ico {
            transition-duration: .01s !important;
            transition-delay: 0s !important;
          }
        }
      `}</style>

      <p className="eyebrow">CONTACT</p>
      <h2>Let's build something together</h2>

      <div className="scene" id="scene">
        <div className="tilt" id="tilt" ref={tiltRef}>
          <div className="float">
            <div className={`env ${isOpen ? 'open' : ''}`} id="env" ref={envRef}>
              <div className="back"></div>
              <div className="sheet" id="sheet" aria-hidden={!isOpen}>
                <p className="cap">FIND ME ON</p>
                <div className="row" id="row">
                  {socials.map((s, i) => (
                    <a
                      key={s.name}
                      className="ico"
                      style={{ '--i': i } as React.CSSProperties}
                      href={s.url}
                      target={s.url.startsWith('mailto:') ? undefined : '_blank'}
                      rel={s.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      aria-label={`${s.name}${s.url.startsWith('mailto:') ? '' : ' (opens in a new tab)'}`}
                    >
                      {s.icon}
                      <span className="tip" aria-hidden="true">{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="front">
                <svg viewBox="0 0 100 66" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="0" y1="66" x2="50" y2="36" />
                  <line x1="100" y1="66" x2="50" y2="36" />
                  <line x1="0" y1="0" x2="0" y2="66" />
                  <line x1="100" y1="0" x2="100" y2="66" />
                </svg>
              </div>
              <div className="flap" aria-hidden="true">
                <div className="fo"><span className="seal"></span></div>
                <div className="fi"></div>
              </div>
              {!isOpen && (
                <button
                  className="btn"
                  id="open"
                  onClick={openEnvelope}
                  aria-expanded={isOpen}
                  aria-controls="sheet"
                  aria-label="Open envelope to reveal my social links"
                />
              )}
              <div className="shadow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const ContactEnvelope = React.memo(ContactEnvelopeComponent);
export default ContactEnvelope;

