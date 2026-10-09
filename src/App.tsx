import { useState, useCallback } from 'react';
import { Spiral3DSlider, type Spiral3DSlide } from '@/components/ui/spiral-3d-slider';
import { SmallPortfolioTypography } from '@/components/ui/small-portfolio-typography';
import { BigPortfolioTypography } from '@/components/ui/big-portfolio-typography';
import { VintageNavbar } from '@/components/ui/vintage-navbar';

import { HomePage } from '@/components/home-page';

const slides: Spiral3DSlide[] = [
  { src: "/images/portfolio/IMG_20261008_152804.jpg", alt: "Personal Photo 1" },
  { src: "/images/portfolio/IMG_20261008_154852.png", alt: "Personal Photo 2" },
  { src: "/images/portfolio/IMG_20261008_155221.png", alt: "Personal Photo 3" },
  { src: "/images/portfolio/Image.jpeg", alt: "Personal Photo 4" },
  { src: "/images/portfolio/fg.jpeg", alt: "Personal Photo 5" },
];

export function App() {
  // User flow states: 'focused' -> 'hero' -> 'home'
  const [pageState, setPageState] = useState<'focused' | 'hero' | 'home'>('focused');

  const handlePageClick = useCallback(() => {
    setPageState((prev) => {
      if (prev === 'focused') return 'hero';
      if (prev === 'hero') return 'home';
      return prev;
    });
  }, []);

  const handleNavigateFromNavbar = useCallback((targetId: string) => {
    setPageState((prev) => {
      if (prev !== 'home') {
        setTimeout(() => {
          if (targetId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            const el = document.getElementById(targetId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        return 'home';
      } else {
        if (targetId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
        return 'home';
      }
    });
  }, []);

  return (
    <>
      {/* VINTAGE ANTIQUE TOP NAVBAR (VISIBLE ON HOME PAGE ONLY) */}
      <VintageNavbar pageState={pageState} onNavigate={handleNavigateFromNavbar} />

      <main 
        data-narrator-section="home"
        onClick={pageState !== 'home' ? handlePageClick : undefined}
        className={`relative w-full min-h-screen bg-transparent ${
          pageState !== 'home' ? 'cursor-pointer select-none overflow-hidden overflow-x-hidden' : ''
        }`}
      >
        {/* Home Page — plain black background */}
        {pageState === 'home' && <HomePage />}

        {/* Hero & Focused View States */}
        {pageState !== 'home' && (
          <>
            {/* 3D Spiral Slider (Fades out when focused) */}
            <div 
              className={`relative z-10 w-full min-h-screen transition-all duration-1000 ease-out ${
                pageState === 'focused' ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
              }`}
            >
              <Spiral3DSlider 
                items={slides} 
                autoRotate 
                autoSpeed={0.13} 
                className="min-h-screen w-full" 
              />
            </div>

            {/* Small PORTFOLIO Typography (Bottom Right Corner File) */}
            <div 
              className={`fixed z-30 transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none ${
                pageState === 'focused' 
                  ? 'bottom-6 right-6 opacity-0 scale-50 pointer-events-none' 
                  : 'bottom-6 right-6 sm:bottom-8 sm:right-10 opacity-100 scale-100'
              }`}
            >
              <SmallPortfolioTypography />
            </div>

            {/* Central Big PORTFOLIO Typography (Center Screen Focus File) */}
            <div 
              className={`fixed z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none ${
                pageState === 'focused' 
                  ? 'opacity-100 scale-100 pointer-events-auto' 
                  : 'opacity-0 scale-50 pointer-events-none'
              }`}
            >
              <BigPortfolioTypography />
            </div>

            {/* Click hints */}
            <div className="fixed bottom-4 left-6 z-20 text-[11px] font-mono text-zinc-500 tracking-wider pointer-events-none opacity-60">
              {pageState === 'focused' ? '[ CLICK ANYWHERE TO CONTINUE ]' : '[ CLICK ANYWHERE TO ENTER HOME PAGE ]'}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default App;
