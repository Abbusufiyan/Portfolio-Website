import React, { useState, useCallback } from 'react';
import { Spiral3DSlider, type Spiral3DSlide } from '@/components/ui/spiral-3d-slider';
import { SmallPortfolioTypography } from '@/components/ui/small-portfolio-typography';
import { BigPortfolioTypography } from '@/components/ui/big-portfolio-typography';
import { SmokeBackground } from '@/components/ui/smoke-background';
import { VintageNavbar } from '@/components/ui/vintage-navbar';

import { HomePage } from '@/components/home-page';
import { NarratorProvider, Narrator } from '@/components/narrator';

const slides: Spiral3DSlide[] = [
  { src: "/images/portfolio/slide-01.jpeg", alt: "Fight Club" },
  { src: "/images/portfolio/slide-02.jpeg", alt: "Bruce Wayne" },
  { src: "/images/portfolio/slide-03.jpeg", alt: "Loki Laufeyson Icon" },
  { src: "/images/portfolio/slide-04.jpeg", alt: "PLAN B Aesthetic" },
  { src: "/images/portfolio/slide-05.jpeg", alt: "Shah Rukh Khan Aesthetic Black" },
  { src: "/images/portfolio/slide-06.jpeg", alt: "Aesthetic Portrait 1" },
  { src: "/images/portfolio/slide-07.jpeg", alt: "Aesthetic Portrait 2" },
  { src: "/images/portfolio/slide-08.jpeg", alt: "Aesthetic Visual 3" },
  { src: "/images/portfolio/slide-09.jpeg", alt: "Crescent Moon Icon" },
];

export function App() {
  // User flow states: 'hero' -> 'focused' -> 'home'
  const [pageState, setPageState] = useState<'hero' | 'focused' | 'home'>('hero');

  const handlePageClick = useCallback(() => {
    setPageState((prev) => {
      if (prev === 'hero') return 'focused';
      if (prev === 'focused') return 'home';
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
    <NarratorProvider>
      {/* SINGLE GLOBAL BACKGROUND FROM bg.html FOR ENTIRE WEBSITE */}
      <SmokeBackground intensity={0.14} />

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
              {pageState === 'hero' ? '[ CLICK ANYWHERE TO FOCUS ]' : '[ CLICK ANYWHERE TO ENTER HOME PAGE ]'}
            </div>
          </>
        )}
      </main>

      {/* Global 3D Narrator Character */}
      <Narrator />
    </NarratorProvider>
  );
}

export default App;
