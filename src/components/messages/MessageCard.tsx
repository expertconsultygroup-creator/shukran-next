"use client";

import { useState } from "react";
import { Share2, CheckCircle2 } from "lucide-react";
import { BadgePill } from "@/components/shared/BadgePill";
import { motion } from "framer-motion";

export function MessageCard({ message }: { message: any }) {
  const [expanded, setExpanded] = useState(false);

  const rankColorMap: Record<string, string> = {
    "💎": "transparent",
    "🥇": "var(--gold)",
    "🥈": "#9EA2A9",
    "🥉": "#CD7F32"
  };

  const borderColor = rankColorMap[message.badge] || "var(--border)";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative bg-[var(--card-glass)] backdrop-blur-[16px] rounded-2xl border border-[var(--gold-dim)] p-5 transition-all duration-300 hover:shadow-[var(--glow-gold)]"
      style={{
        borderRight: message.badge !== "💎" ? `3px solid ${borderColor}` : undefined,
      }}
    >
      {message.badge === "💎" && (
        <div className="absolute inset-y-0 right-0 w-[3px] rounded-r-2xl animate-shimmer-border"
             style={{ background: "linear-gradient(180deg, var(--gold), var(--desert), var(--camel), var(--gold))", backgroundSize: "200% 200%" }} />
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-sans font-bold text-lg text-[var(--white)] flex items-center gap-2">
            {message.name} <span className="text-xl">{message.nationality}</span>
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <BadgePill rank={
              message.badge === "💎" ? "بطل وطني" :
              message.badge === "🥇" ? "سفير" :
              message.badge === "🥈" ? "داعم" : "مشارك"
            } icon={message.badge} />
            {message.verified && (
              <span className="flex items-center gap-1 text-[var(--green)] text-xs font-bold bg-[var(--green-dim)] px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} />
                موثق
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <p className={`font-serif text-[var(--white)] leading-[2.2] text-lg ${!expanded ? "line-clamp-3" : ""}`}>
          {message.text}
        </p>

        {message.text.length > 100 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[var(--gold-light)] text-sm font-bold mt-2 hover:underline"
          >
            اقرأ المزيد ←
          </button>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[var(--muted)] text-xs">
            {message.created_at ? new Date(message.created_at).toLocaleDateString("ar-AE") : message.time}
          </span>
          <span className="font-mono text-[var(--muted-light)] text-[10px] tracking-wider mt-1 opacity-50 group-hover:opacity-100 transition-opacity">
            {message.display_id || message.id}
          </span>
        </div>
        <button className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--gold)] hover:bg-[var(--gold-dim)] transition-colors">
          <Share2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
