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
      
      <iframe 
        src="/cv.html" 
        className="w-full h-full border-none"
        title="CV Page"
      />
    </div>
  );
}
