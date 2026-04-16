"use client";

import { useLiveCount } from "@/hooks/use-live-count";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export function LiveCounter({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("shared");
  const count = useLiveCount();
  const digits = count.toString().padStart(7, "0").split("");

  return (
    <div className={`flex flex-col items-center ${compact ? "gap-2" : "gap-4"}`}>
      <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`} dir="ltr" style={{ direction: "ltr" }}>
        {digits.map((digit, i) => (
          <div key={i} className="flex items-center">
            {i > 0 && (digits.length - i) % 3 === 0 && !compact && (
              <span className="text-[var(--gold-dark)] text-xl sm:text-3xl md:text-4xl font-mono mx-0.5 sm:mx-1">,</span>
            )}
            <div
              className={`
                relative overflow-hidden bg-[var(--card-glass-deep)]
                border border-[var(--gold-dim)] rounded-xl
                flex items-center justify-center
                shadow-[var(--glow-gold)]
                ${compact ? "w-10 h-14 text-2xl" : "w-9 h-12 text-[36px] sm:w-[52px] sm:h-[70px] sm:text-[56px] md:w-[72px] md:h-[96px] md:text-[80px]"}
              `}
              style={{ perspective: "1000px" }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={count + "-" + i}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: 90, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                  className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[var(--gold)]"
                >
                  {digit}
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[rgba(0,0,0,0.3)] z-10" />
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--green)] animate-ping" />
          <span className="text-[var(--muted)] font-mono text-xl tracking-wider uppercase">{t("documentedMessage")}</span>
        </div>
      )}
    </div>
  );
}
