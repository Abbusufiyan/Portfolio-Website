import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconUser,
  IconLayersLinked,
  IconFolder,
  IconStars,
  IconMail,
} from "@tabler/icons-react";

export function FloatingDockDemo({ orientation = "vertical" }: { orientation?: "horizontal" | "vertical" }) {
  const links = [
    {
      title: "About",
      icon: <IconUser className="h-full w-full text-neutral-300" />,
      href: "#about",
    },
    {
      title: "Skills",
      icon: <IconLayersLinked className="h-full w-full text-neutral-300" />,
      href: "#skills",
    },
    {
      title: "Projects",
      icon: <IconFolder className="h-full w-full text-neutral-300" />,
      href: "#projects",
    },
    {
      title: "Milestones",
      icon: <IconStars className="h-full w-full text-neutral-300" />,
      href: "#milestone-archive",
    },
    {
      title: "Contact",
      icon: <IconMail className="h-full w-full text-neutral-300" />,
      href: "#contact",
    },

  ];

  return (
    <div className="flex items-center justify-center">
      <FloatingDock items={links} orientation={orientation} />
    </div>
  );
}

export default FloatingDockDemo;
