"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Ship,
  Factory,
  ShieldCheck,
  Landmark,
  Globe,
  ExternalLink,
  Handshake,
  Building2,
  Shield,
  Mail,
} from "lucide-react";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { useTranslations, useLocale } from "next-intl";
import type { LucideIcon } from "lucide-react";

interface Partner {
  id: string;
  nameEn: string;
  nameAr: string;
  abbreviation: string;
  categoryKey: string;
  CategoryIcon: LucideIcon;
  descKey: string;
  website: string;
  logo: string;
}

const partners: Partner[] = [
  {
    id: "adsb",
    nameEn: "Abu Dhabi Ship Building PJSC",
    nameAr: "\u0623\u0628\u0648\u0638\u0628\u064A \u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u0633\u0641\u0646",
    abbreviation: "ADSB",
    categoryKey: "catDefense",
    CategoryIcon: Ship,
    descKey: "adsbDesc",
    website: "https://adsb.ae/",
    logo: "/partner/adsb-logo.png",
  },
  {
    id: "eico",
    nameEn: "Emirates Industrial Converting Factory",
    nameAr: "\u0645\u0635\u0646\u0639 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0644\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629",
    abbreviation: "EICO",
    categoryKey: "catManufacturing",
    CategoryIcon: Factory,
    descKey: "eicoDesc",
    website: "https://www.eicouae.com/",
    logo: "/partner/eico-logo.png",
  },
  {
    id: "pss",
    nameEn: "Professional Security Systems LLC",
    nameAr: "\u0627\u0644\u0645\u062D\u062A\u0631\u0641\u0648\u0646 \u0644\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0623\u0645\u0646\u064A\u0629",
    abbreviation: "PSS",
    categoryKey: "catSecurity",
    CategoryIcon: ShieldCheck,
    descKey: "pssDesc",
    website: "https://pssuae.net/",
    logo: "/partner/pss-logo.png",
  },
  {
    id: "mashreq",
    nameEn: "Mashreq Al Islami",
    nameAr: "\u0627\u0644\u0645\u0634\u0631\u0642 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A",
    abbreviation: "MAI",
    categoryKey: "catBanking",
    CategoryIcon: Landmark,
    descKey: "mashreqDesc",
    website: "https://www.mashreq.com/en/uae/islamic/",
    logo: "/partner/mashreq-logo.png",
  },
];

const valueProps = [
  { icon: Shield, titleKey: "value1Title", descKey: "value1Desc" },
  { icon: Building2, titleKey: "value2Title", descKey: "value2Desc" },
  { icon: Handshake, titleKey: "value3Title", descKey: "value3Desc" },
];

const stats = [
  { labelKey: "statPartners", valueKey: "statPartnersValue" },
  { labelKey: "statYears", valueKey: "statYearsValue" },
  { labelKey: "statProjects", valueKey: "statProjectsValue" },
  { labelKey: "statEmirates", valueKey: "statEmiratesValue" },
];

export default function Partners() {
  const t = useTranslations("partners");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative pb-20" dir="auto">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(203,163,68,0.06)_0%,transparent_60%)] pointer-events-none" />
      <ShamsaPattern className="opacity-[0.03]" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* ── Hero Section ── */}
        <section className="text-center mb-20 pt-8">
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
            className="text-[var(--muted-light)] text-lg md:text-xl max-w-2xl mx-auto mb-8"
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

        {/* ── Value Props Section ── */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--card-glass)] backdrop-blur-xl border border-[var(--gold-dim)] rounded-2xl p-8 md:p-12"
          >
            <h2 className="font-sans font-bold text-2xl md:text-3xl text-[var(--gold)] text-center mb-3">
              {t("valueTitle")}
            </h2>
            <p className="text-[var(--muted-light)] text-center mb-10 max-w-xl mx-auto">
              {t("valueDesc")}
            </p>
            <GoldDivider className="mb-10 opacity-30" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {valueProps.map((vp, i) => (
                <motion.div
                  key={vp.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--gold-dim)] flex items-center justify-center mb-4">
                    <vp.icon size={28} className="text-[var(--gold)]" />
                  </div>
                  <h3 className="font-sans font-bold text-lg text-[var(--white)] mb-2">
                    {t(vp.titleKey)}
                  </h3>
                  <p className="text-[var(--muted)] text-sm leading-relaxed">
                    {t(vp.descKey)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[var(--card-glass)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border)] text-center hover:border-[var(--gold-dim)] transition-colors"
              >
                <div className="font-mono font-black text-3xl md:text-4xl text-[var(--gold)] mb-2">
                  {t(stat.valueKey)}
                </div>
                <div className="text-[var(--muted)] text-sm font-sans">
                  {t(stat.labelKey)}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Partner Cards ── */}
        <section className="mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="group"
              >
                <div className="bg-[var(--card-glass)] backdrop-blur-xl border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--gold-dim)] hover:shadow-[var(--glow-gold)] transition-all duration-500 group-hover:scale-[1.02] h-full flex flex-col">
                  {/* Top accent line */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Logo area */}
                  <div className="pt-8 pb-4 flex justify-center">
                    <div className="w-28 h-28 rounded-2xl bg-white border border-[var(--border)] flex items-center justify-center overflow-hidden group-hover:border-[var(--gold-dim)] group-hover:shadow-[var(--glow-gold)] transition-all duration-500 p-3">
                      <img
                        src={partner.logo}
                        alt={partner.nameEn}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col text-start">
                    {/* Category badge */}
                    <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold-dim)] text-[var(--gold)] text-xs font-bold mb-4">
                      <partner.CategoryIcon size={12} />
                      {t(partner.categoryKey)}
                    </span>

                    {/* Company name */}
                    <h3 className="font-sans font-bold text-xl text-[var(--white)] mb-1 group-hover:text-[var(--gold)] transition-colors duration-300">
                      {isRtl ? partner.nameAr : partner.nameEn}
                    </h3>
                    <p className="text-[var(--muted)] text-sm mb-4">
                      {isRtl ? partner.nameEn : partner.nameAr}
                    </p>

                    {/* Description */}
                    <p className="text-[var(--muted-light)] text-sm leading-relaxed mb-6 flex-1">
                      {t(partner.descKey)}
                    </p>

                    {/* Website link */}
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--gold-dim)] text-[var(--gold)] font-bold text-sm hover:bg-[var(--gold)] hover:text-[var(--bg-deep)] transition-all duration-300 w-fit"
                    >
                      <Globe size={16} />
                      {t("visitWebsite")}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[var(--card-glass)] backdrop-blur-xl border border-[var(--gold-dim)] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(203,163,68,0.08)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--gold-dim)] flex items-center justify-center mx-auto mb-6">
                <Handshake size={28} className="text-[var(--gold)]" />
              </div>
              <h2 className="font-sans font-bold text-2xl md:text-4xl text-[var(--gold)] mb-4">
                {t("ctaTitle")}
              </h2>
              <p className="text-[var(--muted-light)] text-lg max-w-xl mx-auto mb-8">
                {t("ctaDesc")}
              </p>
              <a
                href="mailto:info@shukran.ae"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold shadow-[var(--glow-gold)] hover:scale-105 active:scale-95 transition-transform"
              >
                <Mail size={18} />
                {t("ctaButton")}
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
