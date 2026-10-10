import React from 'react';

interface CVPageProps {
  onBack: () => void;
}

export function CVPage({ onBack }: CVPageProps) {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#08080a] z-50 overflow-hidden">
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-[100] text-zinc-400 hover:text-white font-mono text-sm tracking-widest transition-colors flex items-center gap-2 mix-blend-difference"
      >
        <span>&larr;</span> BACK TO HOME
      </button>

      <a
        href="/Abu_Sufiyan_Resume.pdf"
        download="Abu_Sufiyan_Resume.pdf"
        className="fixed top-6 right-6 z-[100] group flex items-center gap-3 mix-blend-difference hover:opacity-80 transition-opacity"
      >
        <span className="text-zinc-500 group-hover:text-zinc-300 font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase transition-colors">
          Click on card to download resume
        </span>
        <div className="relative w-6 sm:w-12 h-[1px] bg-zinc-800">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#c5a059] to-transparent animate-pulse opacity-50 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(197,160,89,0.3)]" />
        </div>
      </a>
      
      <iframe 
        src="/cv.html" 
        className="w-full h-full border-none"
        title="CV Page"
      />
    </div>
  );
}
