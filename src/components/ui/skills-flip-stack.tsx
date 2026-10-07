"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

export interface SkillFlipItem {
  number?: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  background: string;
  foreground?: string;
}

interface SkillsFlipStackProps {
  items?: SkillFlipItem[];
  className?: string;
  hint?: string;
  heading?: string;
  endLabel?: string;
}

const SKILL_ITEMS: SkillFlipItem[] = [
  {
    eyebrow: "Systems & Low-Level",
    title: "C++, DSA & the art of thinking in memory.",
    description:
      "Deeply invested in C++ and Data Structures & Algorithms — not just to pass interviews, but to genuinely understand how programs interact with hardware, memory, and the OS beneath them.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1400&q=90&auto=format&fit=crop",
    imageAlt: "Close-up of code on a dark terminal screen",
    background: "#0d1117",
    foreground: "#34d399",
  },
  {
    eyebrow: "Operating Systems",
    title: "Linux is where I actually live.",
    description:
      "From managing filesystems and writing shell scripts to understanding kernel internals and process scheduling — Linux is my native environment. I break it, fix it, and learn something new every time.",
    image:
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1400&q=90&auto=format&fit=crop",
    imageAlt: "Terminal window with Linux commands",
    background: "#0a1628",
    foreground: "#67e8f9",
  },
  {
    eyebrow: "Full-Stack Development",
    title: "Building apps from the ground up.",
    description:
      "Comfortable across the full stack — React, Node.js, REST APIs, databases, and deployment. I ship things that actually work, and I understand why they work at every layer of the stack.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=90&auto=format&fit=crop",
    imageAlt: "Modern code editor with a colorful web project",
    background: "#160a28",
    foreground: "#c4b5fd",
  },
  {
    eyebrow: "AI & Machine Learning",
    title: "Training models, not just calling APIs.",
    description:
      "Exploring AI from the fundamentals — neural networks, training loops, loss functions — not just plugging in pre-built APIs. I want to understand the math and build things that actually reason.",
    image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&q=90&auto=format&fit=crop",
    imageAlt: "Abstract visualization of a neural network",
    background: "#0a1a12",
    foreground: "#86efac",
  },
];

function FlipCard({
  item,
  index,
  total,
  progress,
  reduceMotion,
}: {
  item: SkillFlipItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const segment = 1 / Math.max(total, 1);
  const start = index * segment;
  const end = Math.min(start + segment, 1);
  const entryStart = Math.max(0, start - segment);
  const entryEnd =
    index === 0 ? 0.0001 : Math.min(start, entryStart + segment * 0.7);
  const exitStart = start;
  const exitEnd = end;
  const stackedCardGap = Math.min(24, 72 / Math.max(total - 1, 1));
  const stackedOffset = index * stackedCardGap;
  const restingOffset = Math.min(index * 12, 34);
  const restingScale = 1 - Math.min(index * 0.012, 0.035);

  const exitYPercent = useTransform(
    progress,
    [exitStart, exitEnd],
    reduceMotion ? [0, 0] : [0, -118]
  );
  const exitStackOffset = useTransform(
    progress,
    [exitStart, exitEnd],
    reduceMotion ? [0, 0] : [0, stackedOffset]
  );
  const exitY = useMotionTemplate`calc(${exitYPercent}% + ${exitStackOffset}px)`;
  const rotateX = useTransform(
    progress,
    [exitStart, exitEnd],
    reduceMotion ? [0, 0] : [0, 22]
  );
  const opacity = useTransform(
    progress,
    [exitStart, exitEnd],
    reduceMotion ? [1, 0] : [1, 1]
  );
  const entryScale = useTransform(
    progress,
    [entryStart, entryEnd],
    index === 0 ? [1, 1] : [restingScale, 1]
  );
  const entryY = useTransform(
    progress,
    [entryStart, entryEnd],
    index === 0 ? [0, 0] : [restingOffset, 0]
  );

  return (
    <motion.article
      className="absolute inset-x-0 top-0 aspect-[3/4] will-change-transform sm:aspect-[1.76/1]"
      style={{
        y: exitY,
        rotateX,
        opacity,
        zIndex: total - index,
        transformOrigin: "50% 50%",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      <motion.div
        className="grid h-full overflow-hidden rounded-[clamp(18px,2vw,30px)] shadow-[0_16px_50px_rgba(0,0,0,0.6)] sm:grid-cols-[1.15fr_0.85fr]"
        style={{
          backgroundColor: item.background,
          color: item.foreground ?? "#ffffff",
          y: entryY,
          scale: entryScale,
          transformOrigin: "50% 100%",
        }}
      >
        {/* Left: Text content */}
        <div className="flex min-w-0 flex-col p-[clamp(24px,3vw,48px)] md:pr-[clamp(22px,3vw,48px)]">
          {/* Card number */}
          <div className="flex items-start">
            <span
              className="text-[clamp(24px,2.5vw,36px)] font-medium leading-none tracking-[-0.06em] opacity-40"
              style={{ color: item.foreground ?? "#ffffff" }}
            >
              {item.number ?? String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-auto max-w-[46rem] pt-8">
            {/* Eyebrow label */}
            <p
              className="mb-[clamp(10px,1.5vw,22px)] text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60 sm:text-xs font-mono"
              style={{ color: item.foreground ?? "#ffffff" }}
            >
              {item.eyebrow}
            </p>
            {/* Title */}
            <h2
              className="max-w-[16ch] text-balance text-[clamp(26px,3vw,44px)] font-semibold leading-[0.96] tracking-[-0.05em]"
              style={{ color: item.foreground ?? "#ffffff" }}
            >
              {item.title}
            </h2>
            {/* Description */}
            <p
              className="mt-[clamp(16px,1.8vw,24px)] max-w-[42rem] text-[clamp(13px,1.1vw,16px)] leading-[1.6] opacity-75"
              style={{ color: item.foreground ?? "#ffffff" }}
            >
              {item.description}
            </p>
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative m-[clamp(10px,1.2vw,18px)] min-h-[180px] overflow-hidden rounded-[clamp(12px,1.4vw,22px)] sm:ml-0">
          <img
            src={item.image}
            alt={item.imageAlt}
            className="h-full w-full object-cover"
            loading={index < 2 ? "eager" : "lazy"}
            draggable={false}
          />
          {/* Overlay tint matching card color */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${item.background}99 0%, transparent 50%, rgba(255,255,255,0.04) 100%)`,
            }}
          />
        </div>
      </motion.div>
    </motion.article>
  );
}

export function SkillsFlipStack({
  items = SKILL_ITEMS,
  className,
  hint = "Scroll to explore",
  heading = "Skills & Arsenal.",
  endLabel = "Always learning.",
}: SkillsFlipStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const safeItems = items.length > 0 ? items : SKILL_ITEMS;

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    mass: 0.8,
    restDelta: 0.0005,
  });
  const cardProgress = reduceMotion ? scrollYProgress : smoothProgress;

  return (
    <section
      id="skills"
      className={cn(
        "relative bg-black font-sans text-white",
        className
      )}
    >
      {/* Compact section header — appears right below the hero */}
      <div className="relative flex items-center justify-between px-[clamp(14px,4vw,64px)] py-10 border-t border-white/5">
        {/* Top fade from black */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent pointer-events-none" />

        {/* Left: section label */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-600">02 /</span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-zinc-500">Skills &amp; Arsenal</span>
        </div>

        {/* Center: heading */}
        <h2 className="absolute left-1/2 -translate-x-1/2 text-[clamp(22px,3vw,42px)] font-semibold tracking-[-0.05em] text-emerald-400 whitespace-nowrap">
          {heading}
        </h2>

        {/* Right: bouncing scroll hint */}
        <div className="flex items-center gap-2 text-zinc-600">
          <motion.span
            aria-hidden="true"
            animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="text-lg"
          >
            ↓
          </motion.span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase hidden sm:inline">{hint}</span>
          <motion.span
            aria-hidden="true"
            animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.4, delay: 0.18, repeat: Infinity, ease: "easeInOut" }}
            className="text-lg"
          >
            ↓
          </motion.span>
        </div>
      </div>


      {/* Sticky card stack scroll area */}
      <div
        ref={stackRef}
        className="relative"
        style={{ height: `${(Math.max(safeItems.length, 1) + 1) * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-[clamp(14px,4vw,64px)] py-8">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[900px] [perspective:800px] sm:aspect-[1.76/1]">
            {[...safeItems].reverse().map((item, reverseIndex) => {
              const index = safeItems.length - reverseIndex - 1;
              return (
                <FlipCard
                  key={`${item.title}-${index}`}
                  item={item}
                  index={index}
                  total={safeItems.length}
                  progress={cardProgress}
                  reduceMotion={reduceMotion}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* End label */}
      <section className="flex min-h-[80vh] items-center justify-center px-5 sm:px-10">
        <div className="text-center flex flex-col items-center gap-4">
          <p className="text-center text-[clamp(42px,8vw,120px)] font-semibold leading-none tracking-[-0.07em] text-white/10">
            {endLabel}
          </p>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-600">
            — more projects dropping soon —
          </p>
        </div>
      </section>
    </section>
  );
}

export default SkillsFlipStack;
