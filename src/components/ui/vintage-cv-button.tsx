import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface VintageCVButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export function VintageCVButton({ onClick, isVisible }: VintageCVButtonProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 pointer-events-auto select-none"
        >
          <button
            onClick={onClick}
            className="relative flex items-center gap-1 sm:gap-4 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-[#b89355]/45 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_15px_rgba(184,147,85,0.12)] transition-all duration-300 group hover:scale-105"
            style={{
              background: 'linear-gradient(180deg, #2c1e13 0%, #190f07 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(95, 69, 32, 0.5), inset 0 1px 0 rgba(255, 230, 160, 0.25), 0 10px 28px rgba(0,0,0,0.85)',
            }}
            aria-label="View CV"
          >
            {/* Left Antique Filigree End Cap */}
            <div className="flex items-center text-[#c5a059] opacity-75 pr-0.5 sm:pr-1.5 pointer-events-none group-hover:opacity-100 transition-opacity">
              <svg width="14" height="18" viewBox="0 0 18 24" fill="currentColor" className="w-3 h-4 sm:w-3.5 sm:h-4.5">
                <path d="M9 0C9 5 4 8 0 9C4 10 9 13 9 18C9 13 14 10 18 9C14 8 9 5 9 0Z" opacity="0.85" />
                <circle cx="9" cy="9" r="1.5" fill="#f5d78e" />
              </svg>
            </div>

            <span
              className="relative block font-serif text-[10px] sm:text-[12px] md:text-[13px] tracking-[0.16em] sm:tracking-[0.2em] font-semibold transition-all duration-300 text-[#c2a773]/80 group-hover:text-[#fff0c4] group-hover:drop-shadow-[0_1px_4px_rgba(212,175,55,0.4)]"
              style={{
                fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              RESUME / CV
            </span>

            {/* Right Antique Filigree End Cap */}
            <div className="flex items-center text-[#c5a059] opacity-75 pl-0.5 sm:pl-1.5 pointer-events-none group-hover:opacity-100 transition-opacity">
              <svg width="14" height="18" viewBox="0 0 18 24" fill="currentColor" className="w-3 h-4 sm:w-3.5 sm:h-4.5 scale-x-[-1]">
                <path d="M9 0C9 5 4 8 0 9C4 10 9 13 9 18C9 13 14 10 18 9C14 8 9 5 9 0Z" opacity="0.85" />
                <circle cx="9" cy="9" r="1.5" fill="#f5d78e" />
              </svg>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
