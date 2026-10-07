"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  type CSSProperties,
  type FocusEvent,
  useMemo,
  useRef,
  useState,
} from "react";

export interface OrbitStackItem {
  name: string;
  role: string;
  description: string;
  accent?: string;
  initials?: string;
  stat?: string;
  image?: string;
  technologies?: string[];
  features?: string[];
  github?: string;
  liveDemo?: string;
  video?: string;
}

interface OrbitCardStackProps {
  items?: OrbitStackItem[];
  className?: string;
  cardClassName?: string;
  defaultActiveIndex?: number;
  activeIndex?: number;
  spread?: number;
  lift?: number;
  onActiveChange?: (item: OrbitStackItem, index: number) => void;
}

export const defaultProjects: OrbitStackItem[] = [
  {
    name: "StreamWave",
    role: "Music Streaming App",
    description:
      "A modern music streaming dashboard and web app featuring an interactive audio player, dynamic playlists, and real-time audio visualization.",
    accent: "#e8a33d",
    initials: "SW",
    stat: "Web Audio API",
    image: "/img/music-app-img.png",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Web Audio API"],
    features: [
      "Interactive audio player with live waveform visualizer",
      "Custom dynamic playlists and queue management",
      "Real-time audio frequency analyzer",
      "Sleek dark mode glassmorphic interface"
    ],
    github: "https://github.com/",
    liveDemo: "https://music-six-lemon.vercel.app/",
    video: "/videos/project-1.mp4"
  },
  {
    name: "Developer Portfolio",
    role: "Interactive Web Experience",
    description:
      "A highly dynamic interactive developer portfolio featuring 3D Three.js visual showcases, particle animations, and custom UI components.",
    accent: "#78dcca",
    initials: "DP",
    stat: "Three.js / WebGL",
    image: "/img/portfolio-website-img.png",
    technologies: ["React", "TypeScript", "Three.js", "Tailwind CSS", "Framer Motion"],
    features: [
      "Interactive 3D Book biography showcase",
      "Orbit Card Stack project showcase",
      "Custom WebGL canvas shaders & particle background",
      "Built-in floating dock & persistent background music player"
    ],
    github: "https://github.com/",
    liveDemo: "https://music-six-lemon.vercel.app/",
    video: "/videos/project-2.mp4"
  },
  {
    name: "Paper Trail",
    role: "Document Workflow Engine",
    description:
      "A document workflow tool that turns messy PDFs into searchable, tagged knowledge bases with a fast keyboard-first interface.",
    accent: "#b9a7ff",
    initials: "PT",
    stat: "Next.js / Redis",
    image: "/images/portfolio/slide-04.jpeg",
    technologies: ["Next.js", "TypeScript", "Prisma", "Redis"],
    features: [
      "Automated PDF parsing & keyword tag extraction",
      "Keyboard-first search navigation & instant indexing",
      "High-speed Redis cache layer for document queries",
      "Collaborative document annotation workspace"
    ],
    github: "https://github.com/",
    liveDemo: "https://example.com",
    video: "/videos/project-2.mp4"
  },
  {
    name: "Orbit Board",
    role: "Realtime Kanban Canvas",
    description:
      "A realtime kanban and planning canvas with drag-and-drop, presence cursors and offline-first sync.",
    accent: "#ff9d77",
    initials: "OB",
    stat: "WebSockets / Go",
    image: "/images/portfolio/slide-01.jpeg",
    technologies: ["Vue", "WebSockets", "Go", "SQLite"],
    features: [
      "Real-time multi-user cursor presence & drag-and-drop",
      "Offline-first local state persistence with SQLite sync",
      "High-performance Go WebSocket communication server",
      "Custom task prioritization matrix & timelines"
    ],
    github: "https://github.com/",
    liveDemo: "https://example.com",
    video: "/videos/project-3.mp4"
  },
  {
    name: "Night Shift",
    role: "WebGL Sky & Weather Visualizer",
    description:
      "A WebGL-powered weather and sky visualiser that maps live atmospheric data onto an interactive 3D globe.",
    accent: "#f8d66d",
    initials: "NS",
    stat: "GLSL / D3",
    image: "/images/portfolio/slide-02.jpeg",
    technologies: ["Three.js", "GLSL", "Vite", "D3"],
    features: [
      "Interactive 3D atmospheric globe with live weather data",
      "Custom GLSL atmosphere shaders & volumetric cloud rendering",
      "Real-time wind & temperature flow particle mapping",
      "Time-lapse celestial light & constellation controls"
    ],
    github: "https://github.com/",
    liveDemo: "https://example.com",
    video: "/videos/project-4.mp4"
  }
];

function inRange(index: number, length: number) {
  return Math.min(Math.max(0, index), Math.max(0, length - 1));
}

function initialsFor(item: OrbitStackItem) {
  return (
    item.initials ??
    item.name
      .split(/\s+/)
      .map((part) => part.at(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()
  );
}

function Portrait({ item }: { item: OrbitStackItem }) {
  const [imgError, setImgError] = useState(false);
  const initials = initialsFor(item);
  const shared =
    "relative flex aspect-[1.36] w-full overflow-hidden rounded-[1.45rem] border border-black/[0.08] bg-zinc-900";

  if (item.image && !imgError) {
    return (
      <div className={shared}>
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover object-top"
          onError={() => setImgError(true)}
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-zinc-950/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-[0.18em] text-white border border-white/10">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div
      className={shared}
      style={{ "--portrait-accent": item.accent ?? "#f3f1ea" } as CSSProperties}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,var(--portrait-accent),transparent_24%),radial-gradient(circle_at_85%_72%,rgba(255,255,255,0.5),transparent_28%)] opacity-45" />
      <div className="absolute inset-x-8 bottom-0 h-[72%] rounded-t-[999px] border-2 border-zinc-950 bg-[#f7f5ef]" />
      <div className="absolute left-1/2 top-[22%] size-24 -translate-x-1/2 rounded-[45%_55%_48%_52%] border-2 border-zinc-950 bg-[#f5f2eb]">
        <span className="absolute left-[27%] top-[34%] size-2 rounded-full bg-zinc-950" />
        <span className="absolute right-[27%] top-[34%] size-2 rounded-full bg-zinc-950" />
        <span className="absolute left-1/2 top-[52%] h-6 w-4 -translate-x-1/2 rounded-b-full border-b-2 border-zinc-950" />
        <span
          className="absolute -top-5 left-1/2 h-9 w-24 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-zinc-950"
          style={{ backgroundColor: item.accent ?? "#f3f1ea" }}
        />
      </div>
      <span className="absolute bottom-4 right-4 rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white">
        {initials}
      </span>
    </div>
  );
}

export function OrbitCardStack({
  items = defaultProjects,
  className,
  cardClassName,
  defaultActiveIndex = 0,
  activeIndex: controlledActiveIndex,
  spread = 168,
  lift = 34,
  onActiveChange,
}: OrbitCardStackProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const cards = items.length ? items : defaultProjects;
  const restingIndex = inRange(defaultActiveIndex, cards.length);
  const [internalActiveIndex, setInternalActiveIndex] = useState(restingIndex);
  
  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;
  
  const [open, setOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const midpoint = (cards.length - 1) / 2;

  const layouts = useMemo(
    () =>
      cards.map((_, index) => {
        const offset = index - activeIndex;
        const cardSpread = spread || 115;
        return {
          open: {
            x: offset * cardSpread,
            y: Math.abs(offset) * 24 + (Math.abs(offset) > 1 ? 10 : 0),
            rotation: offset * 7,
          },
          closed: {
            x: offset * 12,
            y: Math.abs(offset) * 6,
            rotation: offset * 3,
          },
        };
      }),
    [cards, activeIndex, spread],
  );

  const activate = (index: number) => {
    const next = inRange(index, cards.length);
    setOpen(true);
    setInternalActiveIndex(next);
    onActiveChange?.(cards[next]!, next);
  };

  const close = () => {
    setOpen(false);
  };

  const leaveFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  };

  return (
    <div
      className={cn(
        "relative flex min-h-full w-full items-center justify-center p-4 overflow-visible",
        className,
      )}
    >
      <div
        ref={stageRef}
        className="relative h-[560px] w-full max-w-[700px]"
        onMouseLeave={close}
        onBlur={leaveFocus}
        role="list"
        aria-label="Project card stack"
      >
        {cards.map((item, index) => {
          const offset = index - activeIndex;
          const position = open ? layouts[index]!.open : layouts[index]!.closed;
          const active = index === activeIndex;
          const style: CSSProperties = {
            zIndex: active ? 100 : 50 - Math.abs(offset),
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${
              position.y - (open && active ? lift : 0)
            }px)) rotate(${position.rotation}deg) scale(${
              active ? 1.04 : open ? Math.max(0.85, 1 - Math.abs(offset) * 0.05) : 0.97
            })`,
            transitionDuration: reduceMotion ? "0ms" : "420ms",
          };

          return (
            <article
              key={`${item.name}-${index}`}
              role="listitem"
              tabIndex={0}
              aria-current={active ? "true" : undefined}
              className={cn(
                "absolute left-1/2 top-1/2 w-[min(78vw,21rem)] origin-bottom cursor-pointer rounded-[1.9rem] border bg-[#e9e6df] p-4 text-[#141414] outline-none shadow-xl transition-all duration-300",
                active ? "border-[#e8a33d] ring-2 ring-[#e8a33d]/50 shadow-2xl shadow-[#e8a33d]/15" : "border-black/10 hover:border-black/20",
                cardClassName,
              )}
              style={style}
              onMouseEnter={() => activate(index)}
              onFocus={() => activate(index)}
              onClick={() => activate(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  const next = (index + 1) % cards.length;
                  activate(next);
                  stageRef.current
                    ?.querySelectorAll<HTMLElement>("[role=listitem]")
                    [next]?.focus();
                }
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  const next = (index - 1 + cards.length) % cards.length;
                  activate(next);
                  stageRef.current
                    ?.querySelectorAll<HTMLElement>("[role=listitem]")
                    [next]?.focus();
                }
                if (event.key === "Escape") {
                  event.currentTarget.blur();
                  close();
                }
              }}
            >
              <div className="relative">
                <Portrait item={item} />
                <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-zinc-950 text-white shadow-lg shadow-black/20">
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </div>
              <div className="px-2 pb-2 pt-5">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {item.role}
                </p>
                <h3 className="mt-1.5 text-[1.85rem] font-semibold leading-none tracking-[-0.04em] text-zinc-950">
                  {item.name}
                </h3>
                <p className="mt-3.5 max-w-[17rem] text-[0.92rem] font-medium leading-[1.4] tracking-[-0.01em] text-zinc-700 line-clamp-3">
                  {item.description}
                </p>
                <div className="mt-4 border-t border-black/10 pt-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500 flex justify-between items-center">
                  <span>{item.stat ?? "Project"}</span>
                  <span className="text-[#e8a33d] font-bold">0{index + 1}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default OrbitCardStack;
