"use client";

import { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export function AudioPlayer({ duration = "0:45", className = "" }: { duration?: string; className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return p + 2;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className={cn("flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10", className)}>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center text-[var(--bg-deep)] hover:scale-105 active:scale-95 transition-transform"
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
      </button>

      <div className="flex items-center gap-1 flex-1 h-8">
        {Array.from({ length: 30 }).map((_, i) => {
          const isActive = (i / 30) * 100 < progress;
          const height = Math.random() * 60 + 20;
          return (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-colors duration-300",
                isActive ? "bg-[var(--gold)]" : "bg-[var(--muted)]",
                isPlaying && !isActive ? "animate-pulse" : ""
              )}
              style={{
                height: `${height}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          );
        })}
      </div>

      <div className="font-mono text-sm text-[var(--muted)] min-w-[3ch]">
        {duration}
      </div>
    </div>
  );
}
