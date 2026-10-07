"use client";

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  orientation = "vertical",
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
  orientation?: "horizontal" | "vertical";
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} orientation={orientation} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden z-50", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute left-full ml-3 top-0 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 border border-white/10 shadow-lg"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 border border-white/10 shadow-lg text-white"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-300" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  orientation = "vertical",
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
  orientation?: "horizontal" | "vertical";
}) => {
  let mousePos = useMotionValue(Infinity);
  const isVertical = orientation === "vertical";

  return (
    <motion.div
      onMouseMove={(e) => mousePos.set(isVertical ? e.clientY : e.clientX)}
      onMouseLeave={() => mousePos.set(Infinity)}
      className={cn(
        "hidden rounded-2xl bg-black/70 backdrop-blur-xl border border-white/15 shadow-[0_0_25px_rgba(255,255,255,0.08)] md:flex z-50",
        isVertical
          ? "flex-col w-16 items-center gap-3 py-4 px-2"
          : "mx-auto h-16 items-end gap-4 px-4 pb-3",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer
          mousePos={mousePos}
          key={item.title}
          isVertical={isVertical}
          {...item}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mousePos,
  title,
  icon,
  href,
  isVertical = true,
}: {
  mousePos: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  isVertical?: boolean;
}) {
  let ref = useRef<HTMLAnchorElement>(null);

  let distance = useTransform(mousePos, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
    if (isVertical) {
      return val - bounds.y - bounds.height / 2;
    }
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 68, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 68, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 34, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 34, 20]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href} ref={ref}>
      <motion.div
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-zinc-900 border border-white/10 hover:border-white/30 transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={
                isVertical
                  ? { opacity: 0, x: -5, y: "-50%" }
                  : { opacity: 0, y: 10, x: "-50%" }
              }
              animate={
                isVertical
                  ? { opacity: 1, x: 0, y: "-50%" }
                  : { opacity: 1, y: 0, x: "-50%" }
              }
              exit={
                isVertical
                  ? { opacity: 0, x: -5, y: "-50%" }
                  : { opacity: 0, y: 2, x: "-50%" }
              }
              className={cn(
                "absolute w-fit rounded-md border border-white/15 bg-black/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-mono whitespace-pre text-white shadow-lg pointer-events-none z-50",
                isVertical
                  ? "left-full ml-3 top-1/2"
                  : "-top-8 left-1/2"
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
