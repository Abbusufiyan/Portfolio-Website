import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { BookOpen } from "lucide-react";

export interface StripePressVolume {
  id: string;
  volNum: string;
  author: string;
  title: string;
  category: string;
  bgColor: string;
  spineColor: string;
  accentColor: string;
  patternStyle: React.CSSProperties;
  skills: string[];
}

export const STRIPE_VOLUMES: StripePressVolume[] = [
  {
    id: "vol-01",
    volNum: "01",
    author: "Stephanie Friedman",
    title: "Systems & Linux",
    category: "VOL. 01 — SYSTEMS & LINUX",
    bgColor: "#0d3b38",
    spineColor: "#0f4c48",
    accentColor: "#34d399",
    patternStyle: {
      background: "radial-gradient(ellipse at 20% 40%, #10b981 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, #059669 0%, transparent 60%), linear-gradient(135deg, #0d3b38 0%, #064e3b 100%)",
    },
    skills: ["Linux", "Bash", "Git", "CMake", "Systems Programming", "Linux Internals"],
  },
  {
    id: "vol-02",
    volNum: "02",
    author: "Peter D. Kaufman",
    title: "Computer Science",
    category: "VOL. 02 — COMPUTER SCIENCE",
    bgColor: "#c2b067",
    spineColor: "#d4c57b",
    accentColor: "#1e1b4b",
    patternStyle: {
      background: "linear-gradient(135deg, #c2b067 0%, #eab308 50%, #ca8a04 100%)",
    },
    skills: ["Data Structures & Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks", "Computer Architecture"],
  },
  {
    id: "vol-03",
    volNum: "03",
    author: "Stewart Brand",
    title: "Web Engineering",
    category: "VOL. 03 — WEB ENGINEERING",
    bgColor: "#e2ded2",
    spineColor: "#ede9de",
    accentColor: "#b45309",
    patternStyle: {
      background: "radial-gradient(circle at 50% 50%, #f5f5f4 0%, #e7e5e4 100%)",
    },
    skills: ["React", "Node.js", "Express.js", "MongoDB", "MySQL", "REST APIs", "Tailwind CSS"],
  },
  {
    id: "vol-04",
    volNum: "04",
    author: "Brian Potter",
    title: "AI & Automation",
    category: "VOL. 04 — AI & AUTOMATION",
    bgColor: "#1e293b",
    spineColor: "#334155",
    accentColor: "#c084fc",
    patternStyle: {
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    },
    skills: ["Machine Learning", "LLMs", "AI Agents", "Automation", "n8n"],
  },
  {
    id: "vol-05",
    volNum: "05",
    author: "Dwarkesh Patel",
    title: "Programming Languages",
    category: "VOL. 05 — PROGRAMMING LANGUAGES",
    bgColor: "#2b101c",
    spineColor: "#3d1728",
    accentColor: "#38bdf8",
    patternStyle: {
      background: "radial-gradient(ellipse at 70% 30%, #831843 0%, transparent 60%), linear-gradient(135deg, #2b101c 0%, #500724 100%)",
    },
    skills: ["C++", "C", "Java", "Python", "JavaScript", "SQL"],
  },
];

interface HorizontalBookProps {
  vol: StripePressVolume;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}

function Horizontal3DBook({ vol, index, total, scrollYProgress }: HorizontalBookProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Stack vertical scroll mapping
  const step = 1 / (total - 1);
  const activePt = index * step;
  const startPt = Math.max(0, activePt - step);
  const endPt = Math.min(1, activePt + step);

  // Smooth translateY scroll offset for stack
  const translateY = useTransform(
    scrollYProgress,
    [startPt, activePt, endPt],
    [220, 0, -220]
  );

  const scale = useTransform(
    scrollYProgress,
    [startPt, activePt, endPt],
    [0.94, 1.05, 0.94]
  );

  const opacity = useTransform(
    scrollYProgress,
    [startPt, activePt, endPt],
    [0.6, 1, 0.6]
  );

  const isLightBg = vol.bgColor === "#e2ded2" || vol.bgColor === "#c2b067";
  const textColor = isLightBg ? "text-zinc-950" : "text-white";
  const mutedTextColor = isLightBg ? "text-zinc-800" : "text-zinc-200";

  return (
    <motion.div
      style={{
        translateY,
        scale: isHovered ? 1.08 : scale,
        opacity,
        transformStyle: "preserve-3d",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-[680px] sm:max-w-[740px] mx-auto cursor-pointer transition-all duration-300 my-6"
    >
      {/* 3D Book Assembly (Facing Viewer with Realistic Depth) */}
      <div 
        className="relative w-full rounded-md transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered 
            ? "rotateX(20deg) rotateY(-2deg) translateZ(40px)" 
            : "rotateX(36deg) rotateY(0deg) translateZ(0px)",
          boxShadow: isHovered
            ? `0 45px 90px -15px rgba(0,0,0,0.95), 0 0 50px ${vol.accentColor}50`
            : `0 30px 60px -15px rgba(0,0,0,0.9)`,
        }}
      >
        {/* TOP COVER SURFACE (Tilted Perspective Showing Cover Artwork & Skills) */}
        <div
          className="absolute left-0 right-0 rounded-t-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl"
          style={{
            height: "220px",
            top: "-220px",
            transformOrigin: "bottom",
            transform: "rotateX(-68deg)",
            ...vol.patternStyle,
            borderTop: `3px solid ${vol.accentColor}`,
            borderLeft: `1px solid rgba(255,255,255,0.2)`,
            borderRight: `1px solid rgba(255,255,255,0.2)`,
          }}
        >
          {/* Subtle Foil Specular Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none z-10" />

          {/* Top Cover Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-black/15 pb-3">
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${mutedTextColor}`}>
              {vol.category}
            </span>
            <span 
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border"
              style={{ color: isLightBg ? "#000" : vol.accentColor, borderColor: isLightBg ? "#00000040" : `${vol.accentColor}60` }}
            >
              VOL. {vol.volNum}
            </span>
          </div>

          {/* Integrated Skill Badges on Top Cover */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-2 my-auto">
            {vol.skills.map((skill) => (
              <div
                key={skill}
                className={`px-3 py-1.5 rounded-md border text-xs font-mono font-bold flex items-center gap-2 shadow-sm ${
                  isLightBg 
                    ? "bg-black/15 border-black/25 text-zinc-950" 
                    : "bg-black/50 border-white/20 text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: vol.accentColor }} />
                <span>{skill}</span>
              </div>
            ))}
          </div>

          <div className={`relative z-10 text-[10px] font-mono font-bold uppercase tracking-widest ${mutedTextColor} text-right`}>
            STRIPE PRESS ARCHIVE • PUBLICATION SPECIFICATION
          </div>
        </div>

        {/* FRONT SPINE FACE (Wide Horizontal Bar Facing Viewer - Exact Stripe Press Replica) */}
        <div
          className={`relative w-full h-[75px] sm:h-[85px] rounded-md px-6 sm:px-8 flex items-center justify-between shadow-2xl overflow-hidden`}
          style={{
            backgroundColor: vol.spineColor,
            border: `1px solid ${isLightBg ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)"}`,
          }}
        >
          {/* Spine Foil Line Accents */}
          <div className="absolute top-1 left-4 right-4 h-[1px] bg-white/30" />
          <div className="absolute bottom-1 left-4 right-4 h-[1px] bg-white/30" />

          {/* Left: Author */}
          <div className="flex items-center gap-3">
            <span className={`text-sm sm:text-base font-serif font-semibold tracking-wider ${textColor}`}>
              {vol.author}
            </span>
          </div>

          {/* Center: Title */}
          <div className="text-center">
            <h3 className={`text-xl sm:text-3xl font-serif font-bold tracking-wide ${textColor}`}>
              {vol.title}
            </h3>
          </div>

          {/* Right: Emblem Logo */}
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center border font-mono font-bold text-xs shadow-inner"
              style={{ 
                color: isLightBg ? "#000" : vol.accentColor, 
                borderColor: isLightBg ? "#00000050" : `${vol.accentColor}70`,
                backgroundColor: isLightBg ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)"
              }}
            >
              §{vol.volNum}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE PAGE EDGE FACE (Thickness) */}
        <div
          className="absolute top-0 bottom-0 right-0 w-[26px] rounded-r-md origin-right flex items-center justify-center"
          style={{
            transform: "rotateY(90deg) translateX(26px)",
            backgroundColor: "#dcd6c8",
            background: "repeating-linear-gradient(0deg, #d4cebf 0px, #d4cebf 2px, #eae4d5 3px, #d4cebf 4px)",
            borderLeft: "1px solid rgba(0,0,0,0.3)",
          }}
        />

        {/* LEFT SIDE PAGE EDGE FACE (Thickness) */}
        <div
          className="absolute top-0 bottom-0 left-0 w-[26px] rounded-l-md origin-left flex items-center justify-center"
          style={{
            transform: "rotateY(-90deg) translateX(-26px)",
            backgroundColor: "#dcd6c8",
            background: "repeating-linear-gradient(0deg, #d4cebf 0px, #d4cebf 2px, #eae4d5 3px, #d4cebf 4px)",
            borderRight: "1px solid rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </motion.div>
  );
}

export function StripePressSkills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVolIndex, setActiveVolIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const idx = Math.min(
        STRIPE_VOLUMES.length - 1,
        Math.floor(latest * STRIPE_VOLUMES.length)
      );
      setActiveVolIndex(idx);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section 
      ref={containerRef}
      id="skills"
      className="relative w-full h-[450vh] bg-black text-white z-20"
    >
      {/* Sticky Stage Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between py-6 px-4 sm:px-8 md:px-12 overflow-hidden">
        
        {/* Header */}
        <div className="relative z-30 w-full max-w-6xl mx-auto flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-400 uppercase mb-1">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>02 / TECHNICAL PUBLICATION ARCHIVE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-wider text-white uppercase">
              SKILLS & TECHNOLOGIES
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 tracking-wider">
            <span>SCROLL DOWN TO NAVIGATE ARCHIVE</span>
          </div>
        </div>

        {/* Central 3D Stack Stage */}
        <div className="relative z-30 w-full max-w-6xl mx-auto my-auto flex items-center justify-between gap-6 py-4">
          
          {/* Stripe Press Left Vertical Tick Bar */}
          <div className="flex flex-col items-center gap-1 z-30 pointer-events-none w-8 shrink-0">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i}
                className={`transition-all duration-300 ${
                  Math.floor(i / 5) === activeVolIndex
                    ? "w-6 h-[2px] bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                    : "w-2.5 h-[1px] bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Central 3D Bookshelf Perspective Container */}
          <div 
            className="relative flex-1 max-w-4xl h-[480px] sm:h-[540px] flex flex-col justify-center items-center overflow-hidden"
            style={{
              perspective: 1200,
              transformStyle: "preserve-3d",
            }}
          >
            {STRIPE_VOLUMES.map((vol, index) => (
              <Horizontal3DBook
                key={vol.id}
                vol={vol}
                index={index}
                total={STRIPE_VOLUMES.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* Right Scroll Indicator */}
          <div className="hidden lg:flex flex-col items-center gap-3 z-30 pointer-events-none w-8 shrink-0">
            <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-400 uppercase [writing-mode:vertical-rl] rotate-180">
              SCROLL DOWN
            </span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
          </div>

        </div>

        {/* Footer */}
        <div className="relative z-30 w-full max-w-6xl mx-auto flex justify-between items-center pt-3 border-t border-white/10 text-[10px] font-mono text-zinc-400 tracking-widest uppercase">
          <span>VOLUME {activeVolIndex + 1} OF {STRIPE_VOLUMES.length} • {STRIPE_VOLUMES[activeVolIndex]?.title}</span>
          <span className="animate-pulse">STRIPE PRESS 3D ARCHIVE</span>
        </div>

      </div>
    </section>
  );
}

export default StripePressSkills;
