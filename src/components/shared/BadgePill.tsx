"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type BadgeRankId = "participant" | "supporter" | "ambassador" | "nationalHero";

const badgeStyles: Record<BadgeRankId, string> = {
  "participant": "border-[#CD7F32] text-[#CD7F32] bg-[#CD7F32]/10",
  "supporter": "border-[#9EA2A9] text-[#9EA2A9] bg-[#9EA2A9]/10",
  "ambassador": "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10 shadow-[var(--glow-gold)]",
  "nationalHero": "border-transparent text-[var(--white)] animate-shimmer-border",
};

export function BadgePill({ rankId, icon }: { rankId: BadgeRankId; icon?: string }) {
  const t = useTranslations("hallOfFame");
  
  const rankMap: Record<BadgeRankId, string> = {
    participant: t("participant"),
    supporter: t("supporter"),
    ambassador: t("ambassador"),
    nationalHero: t("nationalHero"),
  };
  
  const label = rankMap[rankId];

  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap",
        badgeStyles[rankId]
      )}
      style={
        rankId === "nationalHero"
          ? {
              background: "linear-gradient(var(--bg-deep), var(--bg-deep)) padding-box, linear-gradient(90deg, var(--gold), var(--desert), var(--camel), var(--gold)) border-box",
              border: "1px solid transparent",
            }
          : undefined
      }
    >
      {icon && <span>{icon}</span>}
      {label}
    </div>
  );
}
