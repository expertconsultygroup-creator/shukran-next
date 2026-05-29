"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Globe, Mic, Send, User, Users, MessageSquare, Award, Play, Pause } from "lucide-react";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";

interface Step {
  num: number;
  titleKey: string;
  descKey: string;
  Icon: LucideIcon;
}

const steps: Step[] = [
  { num: 1, titleKey: "step1Title", descKey: "step1Desc", Icon: Globe },
  { num: 2, titleKey: "step2Title", descKey: "step2Desc", Icon: User },
  { num: 3, titleKey: "step3Title", descKey: "step3Desc", Icon: Users },
  { num: 4, titleKey: "step4Title", descKey: "step4Desc", Icon: MessageSquare },
  { num: 5, titleKey: "step5Title", descKey: "step5Desc", Icon: Mic },
  { num: 6, titleKey: "step6Title", descKey: "step6Desc", Icon: Send },
  { num: 7, titleKey: "step7Title", descKey: "step7Desc", Icon: Award },
];

export default function GuidePage() {
  const t = useTranslations("guide");
  const locale = useLocale();
  const [downloading, setDownloading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const guideVideoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { downloadUserGuide } = await import("@/lib/generate-guide");
      await downloadUserGuide();
    } catch {
      // silent fail
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative pb-20" dir="auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(203,163,68,0.06)_0%,transparent_60%)] pointer-events-none" />
      <ShamsaPattern className="opacity-[0.03]" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero */}
        <section className="text-center mb-16 pt-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] bg-clip-text text-transparent mb-4 leading-tight">
              {t("heroTitle")}
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-[var(--muted-light)] text-lg md:text-xl max-w-2xl mx-auto mb-8">
            {t("heroSubtitle")}
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="h-1 w-20 bg-[var(--gold)] rounded-full mx-auto mb-10" />

          {/* Download PDF button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-lg shadow-[var(--glow-gold)] hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
          >
            <Download size={22} />
            {downloading ? t("generating") : t("downloadPdf")}
          </motion.button>
        </section>

        {/* Video */}
        <section className="max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg"
          >
            <video
              ref={guideVideoRef}
              className="w-full aspect-video object-contain bg-black cursor-pointer"
              poster="/media/logo.jpeg"
              preload="none"
              playsInline
              onClick={() => {
                if (guideVideoRef.current) {
                  if (guideVideoRef.current.paused) {
                    guideVideoRef.current.play();
                    setIsVideoPlaying(true);
                  } else {
                    guideVideoRef.current.pause();
                    setIsVideoPlaying(false);
                  }
                }
              }}
              onEnded={() => setIsVideoPlaying(false)}
            >
              <source src="/media/story.mp4" type="video/mp4" />
            </video>
            {!isVideoPlaying && (
              <button
                onClick={() => {
                  if (guideVideoRef.current) {
                    guideVideoRef.current.play();
                    setIsVideoPlaying(true);
                  }
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center shadow-[var(--glow-gold)]">
                  <Play size={28} className="text-[var(--bg-deep)] ms-1" />
                </div>
              </button>
            )}
          </motion.div>
        </section>

        {/* Steps */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="relative">
            {/* Vertical gold line connecting steps */}
            <div className="absolute start-6 sm:start-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--gold)] via-[var(--gold-dim)] to-transparent hidden sm:block" />

            <div className="space-y-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: locale === "ar" ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex gap-4 sm:gap-6 items-start group"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[var(--gold)] flex items-center justify-center shadow-[var(--glow-gold)] group-hover:scale-110 transition-transform">
                      <span className="font-mono font-black text-lg sm:text-2xl text-[var(--bg-deep)]">{step.num}</span>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-[var(--card-glass)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-5 sm:p-6 group-hover:border-[var(--gold-dim)] group-hover:shadow-[var(--glow-gold)] transition-all duration-500">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--gold-dim)] flex items-center justify-center">
                        <step.Icon size={20} className="text-[var(--gold)]" />
                      </div>
                      <h3 className="font-sans font-bold text-lg sm:text-xl text-[var(--white)] group-hover:text-[var(--gold)] transition-colors">
                        {t(step.titleKey)}
                      </h3>
                    </div>
                    <p className="text-[var(--muted-light)] text-sm sm:text-base leading-relaxed">
                      {t(step.descKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--card-glass)] backdrop-blur-xl border border-[var(--gold-dim)] rounded-3xl p-10 md:p-14 relative overflow-hidden max-w-2xl mx-auto"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(203,163,68,0.08)_0%,transparent_60%)] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-sans font-bold text-2xl md:text-3xl text-[var(--gold)] mb-4">{t("ctaTitle")}</h2>
              <p className="text-[var(--muted-light)] text-lg mb-8">{t("ctaDesc")}</p>
              <Link
                href="/send"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold shadow-[var(--glow-gold)] hover:scale-105 active:scale-95 transition-transform"
              >
                <Send size={18} />
                {t("sendNow")}
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
