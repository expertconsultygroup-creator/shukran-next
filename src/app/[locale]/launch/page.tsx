"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { ChevronRight, ChevronLeft, Globe } from "lucide-react";

/* ─── Seeded pseudo-random ─── */
function sr(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: sr(i * 7 + 1) * 100,
  y: sr(i * 13 + 3) * 100,
  size: sr(i * 17 + 5) * 2.5 + 0.8,
  duration: sr(i * 23 + 7) * 15 + 12,
  delay: sr(i * 29 + 11) * 6,
  opacity: sr(i * 31 + 13) * 0.35 + 0.08,
}));

/* ─── Floating gold particles (client-only) ─── */
function GoldParticles() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `radial-gradient(circle, rgba(203,163,68,${p.opacity}) 0%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 4}px rgba(203,163,68,${p.opacity * 0.6})`,
          }}
          animate={{
            y: [0, -40, -15, -55, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity * 0.6, p.opacity * 1.4, p.opacity],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Shamsa star background (inline, no import needed) ─── */
function ShamsaBg() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.025]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="shamsa-launch" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M40 0 L44.5 18 L55 8 L50 24 L68 18 L56 30 L72 34 L56 38 L68 50 L50 44 L55 60 L44.5 50 L40 68 L35.5 50 L25 60 L30 44 L12 50 L24 38 L8 34 L24 30 L12 18 L30 24 L25 8 L35.5 18 Z"
              fill="none"
              stroke="#CBA344"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#shamsa-launch)" />
      </svg>
    </div>
  );
}

/* ─── Gold ornament line ─── */
function GoldLine({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
      className="flex items-center gap-4 my-6"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#CBA344]/50 to-[#CBA344]/80" />
      <div className="w-1.5 h-1.5 rotate-45 bg-[#CBA344] shadow-[0_0_8px_rgba(203,163,68,0.8)]" />
      <div className="w-2.5 h-2.5 rotate-45 border border-[#CBA344]/60 shadow-[0_0_12px_rgba(203,163,68,0.4)]" />
      <div className="w-1.5 h-1.5 rotate-45 bg-[#CBA344] shadow-[0_0_8px_rgba(203,163,68,0.8)]" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#CBA344]/50 to-[#CBA344]/80" />
    </motion.div>
  );
}

/* ─── Main Launch Page ─── */
export default function LaunchPage() {
  const t = useTranslations("launch");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const [entered, setEntered] = useState(false);

  const handleEnter = useCallback(() => {
    setEntered(true);
    setTimeout(() => router.push(`/${locale}`), 900);
  }, [locale, router]);

  const handleLangSwitch = useCallback(() => {
    router.push(`/${locale === "ar" ? "en" : "ar"}/launch`);
  }, [locale, router]);

  /* Hide parent layout chrome */
  useEffect(() => {
    const navbar = document.querySelector("nav");
    const footer = document.querySelector("footer");
    const ticker = document.getElementById("ticker") ?? document.querySelector('[class*="ticker"]');
    const els = [navbar, footer, ticker].filter(Boolean) as HTMLElement[];
    els.forEach((el) => (el.style.display = "none"));
    document.body.style.overflow = "hidden";
    return () => {
      els.forEach((el) => (el.style.display = ""));
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto overflow-x-hidden"
        style={{ background: "#030A12" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: entered ? 0 : 1 }}
        transition={{ duration: 0.9 }}
      >
        {/* ── Deep layered background ── */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(203,163,68,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_110%,rgba(203,163,68,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,37,64,0.5)_0%,transparent_60%)]" />
        <ShamsaBg />
        <GoldParticles />

        {/* ── Corner ornaments ── */}
        {[
          "top-0 left-0",
          "top-0 right-0",
          "bottom-0 left-0",
          "bottom-0 right-0",
        ].map((pos, i) => (
          <motion.div
            key={pos}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.5 }}
            className={`absolute ${pos} pointer-events-none hidden sm:block`}
          >
            <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-40">
              <path
                d={
                  i === 0
                    ? "M8 8 L8 50 M8 8 L50 8"
                    : i === 1
                    ? "M92 8 L92 50 M92 8 L50 8"
                    : i === 2
                    ? "M8 92 L8 50 M8 92 L50 92"
                    : "M92 92 L92 50 M92 92 L50 92"
                }
                stroke="#CBA344"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </motion.div>
        ))}

        {/* ── Language switcher ── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          onClick={handleLangSwitch}
          className={`absolute top-3 sm:top-5 ${isRtl ? "left-3 sm:left-5" : "right-3 sm:right-5"} z-20 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#CBA344]/30 bg-[rgba(10,30,52,0.7)] backdrop-blur-xl text-[#D7BC6D] text-xs sm:text-sm font-sans font-semibold hover:border-[#CBA344]/70 hover:bg-[rgba(203,163,68,0.1)] transition-all duration-300 cursor-pointer`}
        >
          <Globe size={14} />
          {t("langSwitch")}
        </motion.button>

        {/* ━━━━━ MAIN CONTENT ━━━━━ */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-2xl mx-auto py-6 sm:py-8 min-h-[100dvh] justify-center">

          {/* ── Logo ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 sm:mb-5 relative"
          >
            <div className="absolute -inset-4 sm:-inset-5 rounded-3xl bg-[#CBA344]/15 blur-2xl" />
            <div className="absolute -inset-2 rounded-2xl bg-[#CBA344]/8 blur-md" />
            <img
              src="/media/logo.jpeg"
              alt={t("initiative")}
              width={110}
              height={110}
              className="relative w-[80px] h-[80px] sm:w-[110px] sm:h-[110px] rounded-2xl border-2 border-[#CBA344]/50 shadow-[0_0_50px_rgba(203,163,68,0.35),0_0_100px_rgba(203,163,68,0.1)]"
            />
          </motion.div>

          {/* ── Platform name ── */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-serif font-bold text-3xl sm:text-5xl md:text-6xl bg-gradient-to-b from-[#F5E6B8] via-[#CBA344] to-[#A07B28] bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight drop-shadow-[0_2px_12px_rgba(203,163,68,0.3)]"
          >
            {t("platformName")}
          </motion.h1>

          {/* ── Platform tagline ── */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-serif font-bold text-lg sm:text-2xl md:text-3xl text-white/90 mb-1 sm:mb-2 leading-tight"
          >
            {t("platformTagline")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-[#8FAFC8] text-[10px] sm:text-sm tracking-[0.15em] sm:tracking-[0.25em] uppercase font-sans font-medium mb-1 sm:mb-2"
          >
            {t("initiative")}
          </motion.p>

          <GoldLine delay={1} />

          {/* ── Patronage section ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="w-full"
          >
            {/* "Under the Patronage of" label */}
            <div className="inline-block px-4 sm:px-6 py-1 sm:py-1.5 rounded-full bg-[#CBA344]/10 border border-[#CBA344]/25 mb-3 sm:mb-5">
              <span className="text-[#D7BC6D] text-[10px] sm:text-sm font-sans font-semibold tracking-[0.1em] sm:tracking-[0.15em] uppercase">
                {t("underPatronage")}
              </span>
            </div>

            {/* Patron name — large and clear */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.8 }}
              className="font-serif font-bold text-[18px] sm:text-[28px] md:text-[34px] text-white mb-2 sm:mb-3 leading-snug px-2"
              style={{ textShadow: "0 2px 20px rgba(203,163,68,0.2)" }}
            >
              {t("patronName")}
            </motion.h2>

          </motion.div>

          {/* ── Quote card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="relative w-full max-w-lg mx-auto mb-4 sm:mb-6"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#CBA344]/30 via-[#CBA344]/10 to-transparent" />
            <div className="relative rounded-2xl bg-[rgba(8,22,40,0.85)] backdrop-blur-xl px-5 py-5 sm:px-8 sm:py-7 border border-[#CBA344]/15">
              {/* Opening quote mark */}
              <span className="absolute top-2 start-3 sm:top-3 sm:start-4 text-[#CBA344]/40 text-4xl sm:text-6xl font-serif leading-none select-none">&ldquo;</span>
              <p className="text-[#E8EDF5] text-sm sm:text-lg leading-[1.8] sm:leading-[1.9] font-serif relative z-10 px-2 sm:px-4 pt-3 sm:pt-4">
                {t("quote")}
              </p>
              {/* Closing quote mark */}
              <span className="absolute bottom-1 end-3 sm:bottom-2 sm:end-4 text-[#CBA344]/40 text-4xl sm:text-6xl font-serif leading-none select-none">&rdquo;</span>
            </div>
          </motion.div>

          {/* ── Platform description ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.6 }}
            className="text-[#8FAFC8] text-xs sm:text-base max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed font-sans px-2"
          >
            {t("platformDesc")}
          </motion.p>

          {/* ── Enter CTA ── */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.3, duration: 0.7 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(203,163,68,0.4), 0 0 120px rgba(203,163,68,0.15)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleEnter}
            className="group relative inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-12 py-3 sm:py-4 rounded-full font-sans font-bold text-base sm:text-lg cursor-pointer shadow-[0_0_40px_rgba(203,163,68,0.25),0_0_80px_rgba(203,163,68,0.08)]"
            style={{
              background: "linear-gradient(135deg, #D7BC6D 0%, #CBA344 40%, #A07B28 100%)",
            }}
          >
            <span className="text-[#03080F]">{t("enterPlatform")}</span>
            <ArrowIcon size={20} className="text-[#03080F] group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>

          {/* ── Bottom attribution (inside flow on mobile) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.6, duration: 0.8 }}
            className="flex flex-col items-center gap-1.5 sm:gap-2 mt-8 sm:mt-12 pb-4 px-4"
          >
            <span className="text-[#5A7A94] text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-sans">
              {t("poweredBy")}
            </span>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
              <span className="text-[#8FAFC8] text-[11px] sm:text-[12px] font-sans font-medium">{t("initiative")}</span>
              <div className="w-1 h-1 rounded-full bg-[#CBA344]/50" />
              <span className="text-[#8FAFC8] text-[11px] sm:text-[12px] font-sans font-medium">{t("culturalCenter")}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
