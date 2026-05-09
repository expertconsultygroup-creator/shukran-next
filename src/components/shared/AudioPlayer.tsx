"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  className?: string;
  onDelete?: () => void;
}

// Generate deterministic bar heights from a seed string
function generateBarHeights(seed: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    heights.push((hash % 60) + 20);
  }
  return heights;
}

export function AudioPlayer({ src, className = "", onDelete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barHeights = generateBarHeights(src || "default", 30);

  useEffect(() => {
    const audio = new Audio();
    // Disable range requests for blob URLs (prevents ERR_REQUEST_RANGE_NOT_SATISFIABLE)
    audio.preload = src.startsWith("blob:") ? "auto" : "metadata";
    audio.src = src;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });

    audio.addEventListener("error", () => {
      // Silently handle load errors (e.g. revoked blob URLs during Hot Refresh)
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10", className)}>
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--bg-deep)] hover:scale-105 active:scale-95 transition-transform shrink-0"
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
      </button>

      <div className="flex items-center gap-1 flex-1 h-8">
        {barHeights.map((height, i) => {
          const isActive = (i / barHeights.length) * 100 < progress;
          return (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-colors duration-300",
                isActive ? "bg-[var(--gold)]" : "bg-[var(--muted)]"
              )}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      <div className="font-mono text-sm text-[var(--muted)] min-w-[3ch]">
        {duration > 0 ? formatTime(isPlaying ? currentTime : duration) : "0:00"}
      </div>
    </div>
  );
}
