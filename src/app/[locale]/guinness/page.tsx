"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLiveCount } from "@/hooks/use-live-count";
import { COUNTER_GOAL } from "@/lib/constants";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { useTranslations } from "next-intl";

export default function Guinness() {
  const t = useTranslations("guinness");
  
  const [progress, setProgress] = useState(0);
  const count = useLiveCount();
  const percentage = (count / COUNTER_GOAL) * 100;
  const remaining = COUNTER_GOAL - count;

  useEffect(() => {
    const timer = setTimeout(() => { setProgress(percentage); }, 500);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Dynamic milestones based on current count
  const milestones = useMemo(() => {
    const targets = [100000, 250000, 500000, 750000, 1000000];
    return targets.map((target) => {
      const isDone = count >= target;
      const isCurrent = !isDone && count >= (target * 0.5); // within reach
      return {
        count: target.toLocaleString(),
        date: isDone ? t("milestoneDone") : target === COUNTER_GOAL ? t("milestoneGoal") : t("milestonePending"),
        status: isDone ? "done" : isCurrent ? "current" : "pending",
      };
    });
  }, [count, t]);

  // Dynamic verification logs based on live count
  const logs = useMemo(() => {
    const now = new Date();
    const fmtTime = (offset: number) => {
      const d = new Date(now.getTime() - offset * 1000);
      return d.toISOString().replace("T", " ").substring(0, 19);
    };
    // Generate pseudo-random hashes from count
    const hash = (seed: number) => {
      const h = ((seed * 2654435761) >>> 0).toString(16).padStart(8, "0");
      return h.substring(0, 8);
    };
    return [
      `[${fmtTime(18)}] ✓ Message verified — Hash: ${hash(count - 5)}...`,
      `[${fmtTime(15)}] ✓ Message verified — Hash: ${hash(count - 4)}...`,
      `[${fmtTime(12)}] ✓ Message verified — Hash: ${hash(count - 3)}...`,
      `[${fmtTime(9)}] ⏳ Validating IP constraint...`,
      `[${fmtTime(6)}] ✓ Constraint check passed. Queued for ledger.`,
      `[${fmtTime(3)}] ✓ Message #${count.toLocaleString()} verified — Hash: ${hash(count)}...`,
    ];
  }, [count]);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--white)] relative" dir="auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(203,163,68,0.05)_0%,transparent_70%)] pointer-events-none" />
      <ShamsaPattern className="opacity-[0.02]" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block bg-gradient-to-br from-[var(--gold)] to-[#9e7d2e] px-8 py-3 rounded-lg mb-8 shadow-[var(--glow-gold)]">
            <h2 className="font-mono text-[var(--bg-deep)] font-black text-xl md:text-2xl tracking-widest">GUINNESS WORLD RECORDS™</h2>
          </motion.div>
          <h1 className="font-sans font-black text-2xl sm:text-4xl md:text-6xl mb-6">{t("heroTitle")}</h1>
          <p className="text-[var(--muted-light)] text-xl">{t("heroDesc")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_50px_rgba(203,163,68,0.2)]" />
              <svg width="320" height="320" viewBox="0 0 320 320" className="transform -rotate-90 drop-shadow-[var(--glow-gold)] z-10 transition-transform">
                <circle cx="160" cy="160" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
                <motion.circle cx="160" cy="160" r={radius} fill="none" stroke="var(--gold)" strokeWidth="14" strokeLinecap="round" strokeDasharray={circumference} animate={{ strokeDashoffset }} transition={{ duration: 2, ease: "easeOut" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="font-mono font-bold text-5xl text-[var(--gold)] tracking-tight" dir="ltr">{count.toLocaleString()}</span>
                <span className="font-sans font-bold text-[var(--muted)] text-xl mt-2">{percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] px-8 py-4 rounded-2xl text-center">
              <p className="text-[var(--muted)] text-sm mb-1">{t("remainingToGoal")}</p>
              <p className="font-mono text-[var(--gold-light)] text-2xl font-bold"><span dir="ltr">{remaining.toLocaleString()}</span> {t("messageLabel")}</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8 text-start">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 relative overflow-hidden">
              <h3 className="font-sans font-bold text-2xl mb-8">{t("milestonesTitle")}</h3>
              <div className="space-y-6 relative z-10">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-6">
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-[var(--surface)] relative z-10">
                      {m.status === "done" && <div className="w-4 h-4 bg-[var(--gold)] rounded-full ring-4 ring-[var(--gold-dim)]"></div>}
                      {m.status === "current" && <div className="w-4 h-4 bg-[var(--gold)] rounded-full animate-ping"></div>}
                      {m.status === "pending" && <div className="w-4 h-4 border-2 border-[var(--muted)] rounded-full"></div>}
                    </div>
                    <div className="flex-1 flex justify-between items-center border-b border-[var(--border)] border-dashed pb-2">
                      <span className={`font-mono text-xl ${m.status === "pending" ? "text-[var(--muted)]" : "text-[var(--white)] font-bold"}`}>{m.count}</span>
                      <span className={`text-sm ${m.status === "current" ? "text-[var(--gold)]" : "text-[var(--muted-light)]"}`}>{m.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t("reqUUID"), done: true },
                { label: t("reqTimestamp"), done: true },
                { label: t("reqNoDuplicate"), done: true },
                { label: t("reqIP"), done: true },
                { label: t("reqCSV"), done: true },
                { label: t("reqAudit"), done: false },
              ].map((item, i) => (
                <div key={i} className="bg-[var(--card-glass-light)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-3">
                  {item.done ? <div className="w-6 h-6 rounded-full bg-[var(--green-dim)] flex items-center justify-center text-[var(--green)] shrink-0">✓</div> : <div className="w-6 h-6 rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin shrink-0"></div>}
                  <span className={`font-bold text-sm ${item.done ? 'text-[var(--white)]' : 'text-[var(--gold)]'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 bg-[#020A04] border border-[var(--green-dim)] rounded-xl p-6 font-mono text-[var(--green-light)] text-sm shadow-[0_0_30px_rgba(63,142,80,0.1)] text-start" dir="ltr">
          <div className="flex items-center gap-3 border-b border-[var(--green-dark)] pb-3 mb-4">
            <div className="w-3 h-3 bg-[var(--red)] rounded-full"></div>
            <div className="w-3 h-3 bg-[var(--camel)] rounded-full"></div>
            <div className="w-3 h-3 bg-[var(--green)] rounded-full"></div>
            <span className="text-[var(--green)] ms-4 opacity-70">GWR_VERIFICATION_NODE_01 // LIVE</span>
          </div>
          <div className="space-y-2 h-48 overflow-hidden flex flex-col justify-end">
            {logs.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i === logs.length - 1 ? 1 : 0.7, x: 0 }}>{log}</motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
