"use client";

import { motion } from "framer-motion";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function SheikhaShamaPage() {
  const t = useTranslations("sheikhaShama");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const paragraphs = [
    t("p1"),
    t("p2"),
    t("p3"),
    t("p4"),
    t("p5"),
    t("p6"),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative pb-20" dir="auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(203,163,68,0.06)_0%,transparent_60%)] pointer-events-none" />
      <ShamsaPattern className="opacity-[0.03]" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero */}
        <section className="text-center mb-16 pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] bg-clip-text text-transparent mb-4 leading-tight">
              {t("heroTitle")}
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[var(--muted-light)] text-lg md:text-xl max-w-2xl mx-auto mb-4"
          >
            {t("heroSubtitle")}
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-1 w-20 bg-[var(--gold)] rounded-full mx-auto"
          />
        </section>

        {/* Content Card */}
        <section className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="bg-[var(--card-glass)] backdrop-blur-xl border border-[var(--border)] rounded-3xl overflow-hidden"
          >
            {/* Image Section */}
            <div className="relative w-full flex justify-center bg-gradient-to-b from-[var(--surface)] to-[var(--card-glass)] p-8 pb-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="relative"
              >
                <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[var(--gold)] shadow-[0_0_40px_rgba(203,163,68,0.3)]">
                  <Image
                    src="/media/sheikha-shama.jpeg"
                    alt={t("name")}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover object-top"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full whitespace-nowrap shadow-[var(--glow-gold)]">
                  {t("titleBadge")}
                </div>
              </motion.div>
            </div>

            {/* Name & Title */}
            <div className="text-center px-6 pt-8 pb-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="font-sans font-bold text-2xl sm:text-3xl text-[var(--gold)] mb-2"
              >
                {t("name")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-[var(--muted-light)] text-sm sm:text-base max-w-lg mx-auto leading-relaxed"
              >
                {t("role")}
              </motion.p>
            </div>

            <div className="px-6 sm:px-10 py-2">
              <GoldDivider />
            </div>

            {/* Article Content */}
            <div className="px-6 sm:px-10 py-8">
              <div className="space-y-6">
                {paragraphs.map((text, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="text-[var(--white)] text-base sm:text-lg leading-[2] sm:leading-[2.2] font-sans"
                    style={{ textAlign: isRtl ? "right" : "left" }}
                  >
                    {text}
                  </motion.p>
                ))}
              </div>

              {/* Signature */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-10 pt-8 border-t border-[var(--border)]"
              >
                <p
                  className="text-[var(--gold)] font-sans font-bold text-lg sm:text-xl"
                  style={{ textAlign: isRtl ? "right" : "left" }}
                >
                  {t("signature")}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
