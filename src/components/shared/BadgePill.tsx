"use client";

import { cn } from "@/lib/utils";

type BadgeRank = "مشارك" | "داعم" | "سفير" | "بطل وطني";

const badgeStyles: Record<BadgeRank, string> = {
  "مشارك": "border-[#CD7F32] text-[#CD7F32] bg-[#CD7F32]/10",
  "داعم": "border-[#9EA2A9] text-[#9EA2A9] bg-[#9EA2A9]/10",
  "سفير": "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10 shadow-[var(--glow-gold)]",
  "بطل وطني": "border-transparent text-[var(--white)] animate-shimmer-border",
};

export function BadgePill({ rank, icon }: { rank: BadgeRank; icon?: string }) {
  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap",
        badgeStyles[rank]
      )}
      style={
        rank === "بطل وطني"
          ? {
              background: "linear-gradient(var(--bg-deep), var(--bg-deep)) padding-box, linear-gradient(90deg, var(--gold), var(--desert), var(--camel), var(--gold)) border-box",
              border: "1px solid transparent",
            }
          : undefined
      }
    >
      {icon && <span>{icon}</span>}
      {rank}
    </div>
  );
}
