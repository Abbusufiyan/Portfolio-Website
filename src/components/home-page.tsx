import React from 'react';
import { Skills3DShelf } from '@/components/ui/skills-3d-shelf';
import { About3DBook } from '@/components/ui/about-3d-book';
import { CRTProjectsShowcase } from '@/components/ui/crt-projects-showcase';
import { MilestoneArchive } from '@/components/ui/evolution-timeline';
import { ContactEnvelope } from '@/components/ui/contact-envelope';
import { PixelSculptFlower } from '@/components/ui/pixel-sculpt-flower';

export function HomePageComponent() {
  return (
    <>
      {/* ── 1. About Me Section (Interactive 3D Book) ── */}
      <div id="about" data-narrator-section="about" className="relative min-h-screen w-full bg-transparent text-white font-sans overflow-x-hidden z-10 pointer-events-auto flex flex-col justify-center py-6 px-4 sm:px-8">
        <About3DBook />
        <div className="w-full flex justify-center pb-2 pt-2">
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              SCROLL DOWN TO EXPLORE SKILLS
            </span>
            <div className="w-4 h-6 border border-zinc-600 rounded-full flex justify-center p-1">
              <div className="w-1 h-1.5 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. 3D Interactive Skills Shelf ── */}
      <Skills3DShelf />

      {/* ── 3. 3D Projects Showcase ── */}
      <CRTProjectsShowcase />

      {/* ── 4. Milestone Archive (horizontal energy-line timeline) ── */}
      <MilestoneArchive />

      {/* ── 5. Contact Section (Interactive 3D Envelope) ── */}
      <ContactEnvelope />

      {/* ── 6. Final Section (Pixel Sculpt Flower) ── */}
      <PixelSculptFlower />

      {/* Far Right Scroll Indicator */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-20 pointer-events-none opacity-75">
        <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-400 uppercase [writing-mode:vertical-rl] rotate-180">
          SCROLL DOWN
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
      </div>
    </>
  );
}

export const HomePage = React.memo(HomePageComponent);
export default HomePage;

