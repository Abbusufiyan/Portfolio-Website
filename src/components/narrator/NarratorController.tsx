import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { DIALOGUE, DialogueEntry } from './NarratorDialogue';
import { NarratorState } from './NarratorAnimations';

export interface ActiveLine {
  key: string;
  text: string;
  id: number;
}

export interface SayOptions {
  auto?: boolean;
  silent?: boolean;
  text?: string;
}

export interface NarratorContextValue {
  stateRef: React.MutableRefObject<NarratorState>;
  line: ActiveLine | null;
  speaking: boolean;
  muted: boolean;
  minimized: boolean;
  setMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMute: () => void;
  talk: () => void;
  say: (target: string, opts?: SayOptions) => boolean;
}

const Ctx = createContext<NarratorContextValue | null>(null);

export const useNarrator = (): NarratorContextValue => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useNarrator must be used inside <NarratorProvider>');
  return c;
};

const pick = (e: DialogueEntry): string => {
  if (e.lines && e.lines.length > 0) {
    return e.lines[Math.floor(Math.random() * e.lines.length)];
  }
  return e.text || '';
};

const store = {
  get: (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

function chooseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const v = window.speechSynthesis.getVoices().filter(x => /^en/i.test(x.lang));
  return v.find(x => /(samantha|zira|aria|jenny|female)/i.test(x.name)) || v[0] || null;
}

export interface NarratorProviderProps {
  children: ReactNode;
  dialogue?: Record<string, DialogueEntry>;
  minGap?: number;
}

export function NarratorProvider({ children, dialogue = DIALOGUE, minGap = 3500 }: NarratorProviderProps) {
  // Shared mutable state read every frame by the 3D rig (no React re-renders).
  const stateRef = useRef<NarratorState>({
    speaking: false, 
    expression: 'neutral', 
    gesture: 'none', 
    gestureAt: 0,
    gestureUntil: 0, 
    look: 0, 
    scrollVel: 0, 
    interactAt: performance.now()
  });

  const [line, setLine] = useState<ActiveLine | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(() => store.get('narrator-muted') === '1');
  const [minimized, setMinimized] = useState(false);

  const mutedRef = useRef(muted); 
  mutedRef.current = muted;

  const spoken = useRef(new Set<string>());
  const last = useRef<{ at: number; key: string | null }>({ at: 0, key: null });
  const section = useRef('home');
  const tok = useRef(0);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const throttle = useRef<Record<string, number>>({});

  const clearTimers = () => { 
    Object.values(timers.current).forEach(clearTimeout); 
    timers.current = {}; 
  };

  const finish = useCallback(() => {
    const s = stateRef.current;
    s.speaking = false; 
    s.look = 0; 
    setSpeaking(false);
    timers.current.expr = setTimeout(() => { s.expression = 'neutral'; }, 1500);
    timers.current.bubble = setTimeout(() => setLine(null), 4500);
  }, []);

  const say = useCallback((target: string, opts: SayOptions = {}) => {
    const { auto = false, silent = false, text: override } = opts;
    const s = stateRef.current, now = Date.now(), entry = dialogue[target];
    if (auto && (spoken.current.has(target) || s.speaking || now - last.current.at < minGap)) return false;
    if (!entry && !override && !(typeof target === 'string' && target.includes(' '))) return false;

    const myTok = ++tok.current; // invalidates callbacks from any previous line
    clearTimers();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const text = override || (entry ? pick(entry) : target);
    const e = entry || {};
    spoken.current.add(target); 
    last.current = { at: now, key: target };
    setLine({ key: target, text, id: now });
    
    s.expression = e.expression || 'happy';
    s.look = e.look || 0;
    s.gesture = e.gesture || 'explain';
    s.gestureAt = performance.now();

    if (silent || e.voice === false) { // hover reactions: bubble + body language only
      s.speaking = false; 
      setSpeaking(false);
      s.gestureUntil = performance.now() + 1800;
      timers.current.expr = setTimeout(() => { s.expression = 'neutral'; }, 2200);
      timers.current.bubble = setTimeout(() => setLine(null), 3200);
      return true;
    }

    s.speaking = true; 
    setSpeaking(true);
    const done = () => { if (tok.current === myTok) finish(); };
    const estimate = Math.max(1800, text.length * 62);

    if (!mutedRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      const voice = chooseVoice(); 
      if (voice) u.voice = voice;
      u.pitch = 1.35; 
      u.rate = 1.03;
      u.onend = done; 
      u.onerror = done;
      window.speechSynthesis.speak(u);
      timers.current.safety = setTimeout(done, estimate + 6000);
    } else {
      timers.current.fallback = setTimeout(done, estimate); // muted: bubble + mouth animation only
    }
    return true;
  }, [dialogue, minGap, finish]);

  const toggleMute = useCallback(() => {
    setMuted(m => { 
      const next = !m;
      store.set('narrator-muted', next ? '1' : '0'); 
      return next; 
    });
    if (!mutedRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Manual trigger: stop if talking, replay the section, or chat if it was just said.
  const talk = useCallback(() => {
    if (stateRef.current.speaking) { 
      tok.current++; 
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
      }
      clearTimers(); 
      finish(); 
      return; 
    }
    const recent = last.current.key === section.current && Date.now() - last.current.at < 20000;
    say(recent && dialogue.chat ? 'chat' : section.current);
  }, [say, finish, dialogue]);

  // ---- major sections: <section data-narrator-section="projects"> ----
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const pending: Record<string, ReturnType<typeof setTimeout>> = {};
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      const key = (en.target as HTMLElement).dataset.narratorSection;
      if (key && en.isIntersecting) {
        section.current = key;
        clearTimeout(pending[key]);
        pending[key] = setTimeout(() => say(key, { auto: true }), 700); // must stay in view briefly
      } else if (key) {
        clearTimeout(pending[key]);
      }
    }), { rootMargin: '-35% 0px -35% 0px', threshold: 0 });

    const scan = () => document.querySelectorAll('[data-narrator-section]').forEach(el => { 
      if (!seen.has(el)) { 
        seen.add(el); 
        io.observe(el); 
      } 
    });
    scan(); 

    let mo: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(() => scan());
      mo.observe(document.body, { childList: true, subtree: true });
    }

    const greet = setTimeout(() => say('home', { auto: true }), 2200); // fallback if no sections are tagged
    
    return () => { 
      io.disconnect(); 
      if (mo) mo.disconnect();
      clearTimeout(greet); 
      Object.values(pending).forEach(clearTimeout); 
    };
  }, [say]);

  // ---- hover / click / scroll / activity ----
  useEffect(() => {
    const s = stateRef.current; 
    let lastHover: HTMLElement | null = null;
    let lastY = window.scrollY;
    let scrollRaf = 0;

    const touch = () => { s.interactAt = performance.now(); };

    const react = (key: string, el: HTMLElement, kind: 'hover' | 'click') => {
      const now = Date.now(), gap = kind === 'hover' ? 6000 : 2500;
      if (now - (throttle.current[key] || 0) < gap || (kind === 'hover' && s.speaking)) return;
      throttle.current[key] = now;
      say(key, { silent: kind === 'hover', text: el.dataset.narratorText });
    };

    const over = (e: MouseEvent) => { 
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.('[data-narrator-hover]') as HTMLElement | null; 
      if (el && el !== lastHover) { 
        lastHover = el; 
        const key = el.dataset.narratorHover;
        if (key) react(key, el, 'hover'); 
      } 
    };

    const out = (e: MouseEvent) => { 
      if (lastHover && !lastHover.contains(e.relatedTarget as Node)) lastHover = null; 
    };

    const click = (e: MouseEvent) => { 
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.('[data-narrator-click]') as HTMLElement | null; 
      if (el) {
        const key = el.dataset.narratorClick;
        if (key) react(key, el, 'click'); 
      }
    };

    const scroll = () => { 
      if (!scrollRaf) {
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          s.scrollVel += (window.scrollY - lastY) / 80; 
          lastY = window.scrollY; 
          touch();
        });
      }
    };

    document.addEventListener('mouseover', over); 
    document.addEventListener('mouseout', out);
    document.addEventListener('click', click);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('pointermove', touch, { passive: true }); 
    window.addEventListener('keydown', touch);

    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      document.removeEventListener('mouseover', over); 
      document.removeEventListener('mouseout', out);
      document.removeEventListener('click', click);
      window.removeEventListener('scroll', scroll); 
      window.removeEventListener('pointermove', touch); 
      window.removeEventListener('keydown', touch);
      clearTimers(); 
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [say]);

  const value = useMemo(() => ({
    stateRef, line, speaking, muted, minimized, setMinimized, toggleMute, talk, say
  }), [line, speaking, muted, minimized, toggleMute, talk, say]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
