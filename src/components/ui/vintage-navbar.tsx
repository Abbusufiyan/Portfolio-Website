import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface VintageNavbarProps {
  onNavigate?: (sectionId: string) => void;
  pageState?: string;
}

const NAV_ITEMS = [
  { id: 'home', label: 'HOME', targetId: 'home' },
  { id: 'skills', label: 'SKILLS', targetId: 'skills' },
  { id: 'projects', label: 'PROJECTS', targetId: 'projects-section-3d' },
  { id: 'timeline', label: 'TIMELINE', targetId: 'milestone-archive' },
  { id: 'contact', label: 'CONTACT', targetId: 'contact' },
];

export function VintageNavbarComponent({ onNavigate, pageState = 'home' }: VintageNavbarProps) {
  const [activeId, setActiveId] = useState<string>('home');
  const [isHomeSection, setIsHomeSection] = useState<boolean>(true);

  useEffect(() => {
    let scrollRaf = 0;

    const checkScroll = () => {
      const scrollY = window.scrollY;
      
      // Home section threshold (only visible at top of Home page)
      const atHome = scrollY < 250;
      setIsHomeSection(atHome);

      if (atHome) {
        setActiveId('home');
        return;
      }

      const sections = NAV_ITEMS.filter((item) => item.id !== 'home').map((item) => {
        const el = document.getElementById(item.targetId);
        if (!el) return { id: item.id, top: Infinity, bottom: -Infinity };
        const rect = el.getBoundingClientRect();
        return {
          id: item.id,
          top: rect.top,
          bottom: rect.bottom,
        };
      });

      const viewportCenter = window.innerHeight * 0.35;
      const current = sections.find((sec) => sec.top <= viewportCenter && sec.bottom >= viewportCenter);

      if (current) {
        setActiveId(current.id);
      }
    };

    const handleScroll = () => {
      if (!scrollRaf) {
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          checkScroll();
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    checkScroll();
    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = (e: React.MouseEvent, item: typeof NAV_ITEMS[0]) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveId(item.id);

    if (onNavigate) {
      onNavigate(item.targetId);
    } else {
      if (item.id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(item.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Only visible when user is on the Home page at the top section
  const isVisible = pageState === 'home' && isHomeSection;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ opacity: 0, y: -25, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -25, x: "-50%" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ left: '50%', transform: 'translateX(-50%)' }}
          className="fixed top-3 sm:top-5 z-50 max-w-[95vw] pointer-events-auto select-none"
        >
          {/* Vintage Antique Plaque Frame */}
          <nav
            className="relative flex items-center gap-1 sm:gap-4 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-[#b89355]/45 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_15px_rgba(184,147,85,0.12)] transition-all duration-300"
            style={{
              background: 'linear-gradient(180deg, #2c1e13 0%, #190f07 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(95, 69, 32, 0.5), inset 0 1px 0 rgba(255, 230, 160, 0.25), 0 10px 28px rgba(0,0,0,0.85)',
            }}
            aria-label="Vintage portfolio navigation"
          >
            {/* Left Antique Filigree End Cap */}
            <div className="flex items-center text-[#c5a059] opacity-75 pr-0.5 sm:pr-1.5 pointer-events-none">
              <svg width="14" height="18" viewBox="0 0 18 24" fill="currentColor" className="w-3 h-4 sm:w-3.5 sm:h-4.5">
                <path d="M9 0C9 5 4 8 0 9C4 10 9 13 9 18C9 13 14 10 18 9C14 8 9 5 9 0Z" opacity="0.85" />
                <circle cx="9" cy="9" r="1.5" fill="#f5d78e" />
              </svg>
            </div>

            {/* Navigation Items */}
            <ul className="flex items-center gap-1 sm:gap-3.5 m-0 p-0 list-none">
              {NAV_ITEMS.map((item, idx) => {
                const isActive = activeId === item.id;
                return (
                  <React.Fragment key={item.id}>
                    {idx > 0 && (
                      <li aria-hidden="true" className="text-[#8c6d3b]/40 text-[9px] sm:text-[10px] select-none pointer-events-none">
                        ✦
                      </li>
                    )}
                    <li className="relative">
                      <a
                        href={`#${item.targetId}`}
                        onClick={(e) => handleClick(e, item)}
                        className={`relative block px-1.5 sm:px-2.5 py-1 font-serif text-[10px] sm:text-[12px] md:text-[13px] tracking-[0.16em] sm:tracking-[0.2em] font-semibold transition-all duration-300 ${
                          isActive ? 'text-[#fff2c2] drop-shadow-[0_1px_4px_rgba(212,175,55,0.4)]' : 'text-[#c2a773]/80 hover:text-[#fff0c4] hover:scale-105'
                        }`}
                        style={{
                          fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
                          textShadow: isActive ? '0 1px 6px rgba(212, 175, 55, 0.5)' : '0 1px 3px rgba(0,0,0,0.9)',
                        }}
                      >
                        {item.label}

                        {/* Active Engraved Underline + Diamond Accent */}
                        {isActive && (
                          <motion.div
                            layoutId="vintageNavActiveUnderline"
                            className="absolute -bottom-1 left-0 right-0 flex flex-col items-center pointer-events-none"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          >
                            {/* Underline */}
                            <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#e6c67c] to-transparent shadow-[0_0_6px_#d4af37]" />
                            {/* Tiny ornamental diamond accent */}
                            <div className="w-1 h-1 bg-[#ffd984] rotate-45 -mt-[2.5px] shadow-[0_0_4px_#d4af37]" />
                          </motion.div>
                        )}
                      </a>
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>

            {/* Right Antique Filigree End Cap */}
            <div className="flex items-center text-[#c5a059] opacity-75 pl-0.5 sm:pl-1.5 pointer-events-none">
              <svg width="14" height="18" viewBox="0 0 18 24" fill="currentColor" className="w-3 h-4 sm:w-3.5 sm:h-4.5 rotate-180">
                <path d="M9 0C9 5 4 8 0 9C4 10 9 13 9 18C9 13 14 10 18 9C14 8 9 5 9 0Z" opacity="0.85" />
                <circle cx="9" cy="9" r="1.5" fill="#f5d78e" />
              </svg>
            </div>
          </nav>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

export const VintageNavbar = React.memo(VintageNavbarComponent);
export default VintageNavbar;

