"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface MusicPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The source URL of the audio file or YouTube video */
  src: string;
  /** The URL of the album cover image */
  coverArt: string;
  /** Whether to auto-play the audio when loaded */
  autoPlay?: boolean;
}

export function MusicPlayer({
  className,
  src,
  coverArt,
  autoPlay = false,
  onClick,
  ...props
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Extract YouTube ID if it's a YouTube URL
  const getYoutubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
    );
    return match ? match[1] : null;
  };

  const youtubeId = src ? getYoutubeId(src) : null;

  useEffect(() => {
    if (isPlaying) {
      if (youtubeId && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      } else {
        audioRef.current?.play().catch(() => setIsPlaying(false));
      }
    } else {
      if (youtubeId && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
      } else {
        audioRef.current?.pause();
      }
    }
  }, [isPlaying, youtubeId]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
      {...props}
    >
      {youtubeId ? (
        <iframe
          ref={iframeRef}
          className="hidden"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=${
            autoPlay ? 1 : 0
          }&controls=0`}
          allow="autoplay"
        />
      ) : (
        <audio
          ref={audioRef}
          src={src}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Record + Tonearm clickable area */}
      <div
        className="relative cursor-pointer select-none h-28 w-28 sm:h-32 sm:w-32"
        onClick={togglePlay}
        title={isPlaying ? "Pause" : "Play"}
      >
        {/* Tonearm */}
        <motion.div
          className="absolute z-20 top-[-5%] right-[-10%] origin-top-right w-[60%] h-[15%] pointer-events-none"
          initial={{ rotate: 10 }}
          animate={{ rotate: isPlaying ? -20 : 10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Tonearm pivot base */}
          <div className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-400 shadow-md transform translate-x-1/2 -translate-y-1/2 border-2 border-zinc-200 z-10" />
          {/* Tonearm stick & needle */}
          <div className="absolute top-0 right-[8px] sm:right-[10px] w-[90%] h-1.5 bg-zinc-400 rounded-full origin-right -rotate-12 shadow-sm flex items-center justify-start">
            {/* Needle stylus head */}
            <div className="w-3 h-3 bg-zinc-800 rounded-full shadow-md transform -translate-x-1/2" />
          </div>
        </motion.div>

        {/* Record Disc */}
        <div
          className="relative w-full h-full rounded-full border-4 border-black/10 shadow-xl overflow-hidden shadow-black/30 bg-black animate-spin"
          style={{
            animationDuration: "4s",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        >
          {/* Album Cover Background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: `url(${coverArt})` }}
          />

          {/* Vinyl groove rings */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 21%, transparent 22%, transparent 35%, rgba(0,0,0,0.5) 36%, transparent 37%, transparent 50%, rgba(0,0,0,0.3) 51%, transparent 52%, transparent 65%, rgba(0,0,0,0.6) 66%, transparent 67%, transparent 80%, rgba(0,0,0,0.4) 81%, transparent 82%)",
            }}
          />

          {/* Glare / specular reflection */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.2) 100%)",
            }}
          />

          {/* Center label area */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full bg-zinc-900 border border-zinc-700 shadow-inner flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full shadow-inner border border-black/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
