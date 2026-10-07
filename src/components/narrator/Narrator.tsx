import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useNarrator } from './NarratorController';
import './narrator.css';

// Three.js 3D character lazy loaded
const Narrator3D = lazy(() => import('./Narrator3D'));

function shouldUseLite() {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return true;
  } catch { 
    return true; 
  }
  const weak = (navigator.hardwareConcurrency || 4) <= 4 || ((navigator as unknown as { deviceMemory?: number }).deviceMemory || 4) <= 2;
  return window.innerWidth < 600 && weak;
}

function LiteChick({ speaking, image }: { speaking: boolean; image?: string }) {
  if (image) return <img className={`nr-lite-img ${speaking ? 'is-talking' : ''}`} src={image} alt="" />;
  return (
    <div className={`nr-chick ${speaking ? 'is-talking' : ''}`} aria-hidden="true">
      <div className="nr-chick-helmet" />
      <div className="nr-chick-eye l" />
      <div className="nr-chick-eye r" />
      <div className="nr-chick-beak" />
    </div>
  );
}

export interface NarratorProps {
  fallbackImage?: string;
}

export function Narrator({ fallbackImage }: NarratorProps) {
  const { stateRef, line, speaking, muted, toggleMute, talk, minimized, setMinimized } = useNarrator();
  const lite = useMemo(shouldUseLite, []);
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 700);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setCompact(window.innerWidth < 700);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { // wait until page idle so existing site loads first
    const go = () => setReady(true);
    if ('requestIdleCallback' in window) { 
      const id = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(go, { timeout: 1500 }); 
      return () => (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id); 
    }
    const id = setTimeout(go, 500); 
    return () => clearTimeout(id);
  }, []);

  if (minimized) {
    return (
      <button className="nr-restore shadow-2xl" onClick={() => setMinimized(false)} aria-label="Show narrator" title="Show Narrator">
        🐤
      </button>
    );
  }

  return (
    <aside className={`nr-root ${compact ? 'nr-compact' : ''}`} aria-label="Website narrator">
      {line && (
        <div key={line.id} className="nr-bubble shadow-2xl border border-white/10" role="status" aria-live="polite">
          {line.text}
        </div>
      )}
      <div className="nr-stage" onClick={talk} style={{ cursor: 'pointer' }} title="Click to interact with narrator">
        {lite ? (
          <LiteChick speaking={speaking} image={fallbackImage} />
        ) : (
          ready && (
            <Suspense fallback={null}>
              <Narrator3D stateRef={stateRef} compact={compact} />
            </Suspense>
          )
        )}
      </div>
      <div className="nr-controls">
        <button
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute narrator' : 'Mute narrator'}
          title={muted ? 'Unmute Narrator' : 'Mute Narrator'}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4z" />
            {muted ? <path d="m22 9-6 6m0-6 6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}
          </svg>
        </button>
        <button className="nr-talk" onClick={talk} title={speaking ? 'Stop speaking' : 'Ask narrator to speak'}>
          {speaking ? 'Stop' : 'Talk to me'}
        </button>
        <button onClick={() => setMinimized(true)} aria-label="Hide narrator" title="Minimize Narrator">
          –
        </button>
      </div>
    </aside>
  );
}

export default Narrator;
