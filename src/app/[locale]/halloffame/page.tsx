"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquareText, Share2, Building2, Trophy } from "lucide-react";
import { BadgePill } from "@/components/shared/BadgePill";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { useTranslations, useLocale } from "next-intl";
import { ORG_CATEGORIES } from "@/data/organizations";

interface OrgRow {
  rank: number;
  name: string;
  category: string;
  messages: number;
  shares: number;
  score: number;
  badge: string;
}

export default function HallOfFame() {
  const t = useTranslations("hallOfFame");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [organizations, setOrganizations] = useState<OrgRow[]>([]);

  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then((d) => setOrganizations(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const categoryLabel = (id: string) => {
    if (id === "other") return t("categoryOther");
    const c = ORG_CATEGORIES.find((x) => x.id === id);
    return c ? (isRtl ? c.name_ar : c.name_en) : id;
  };

  const totals = useMemo(
    () => ({
      orgs: organizations.length,
      messages: organizations.reduce((s, o) => s + o.messages, 0),
      shares: organizations.reduce((s, o) => s + o.shares, 0),
    }),
    [organizations]
  );

  const filtered = useMemo(
    () =>
      organizations.filter(
        (o) =>
          (!categoryFilter || o.category === categoryFilter) &&
          (!searchTerm || o.name?.includes(searchTerm))
      ),
    [organizations, categoryFilter, searchTerm]
  );

  const topSharers = useMemo(
    () =>
      [...organizations]
        .sort((a, b) => b.shares - a.shares || b.messages - a.messages)
        .slice(0, 3),
    [organizations]
  );

  const medals = ["🥇", "🥈", "🥉"];
  const glows = ["var(--gold)", "#C0C5CE", "#CD7F32"];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative pb-20" dir="auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(203,163,68,0.10)_0%,transparent_55%)] pointer-events-none" />
      <ShamsaPattern className="opacity-5" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--gold-dim)] border border-[var(--gold-dim)] mb-5"
          >
            <Trophy className="w-8 h-8 text-[var(--gold)]" />
          </motion.div>
          <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl text-[var(--gold)] mb-4 drop-shadow-[var(--glow-gold)]">
            {t("orgHeroTitle")}
          </h1>
          <p className="text-[var(--muted-light)] text-base sm:text-lg max-w-2xl mx-auto">{t("heroDescOrg")}</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 max-w-3xl mx-auto mb-16">
          {[
            { icon: Building2, value: totals.orgs, label: t("statOrgs") },
            { icon: MessageSquareText, value: totals.messages, label: t("statMessages") },
            { icon: Share2, value: totals.shares, label: t("statShares") },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="bg-[var(--card-glass)] backdrop-blur-[16px] border border-[var(--gold-dim)] rounded-2xl p-4 sm:p-6 text-center"
            >
              <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--gold)] mx-auto mb-2" />
              <div className="font-mono font-black text-2xl sm:text-3xl text-[var(--white)]" dir="ltr">
                {s.value.toLocaleString("en-US")}
              </div>
              <div className="text-[var(--muted)] text-xs sm:text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Top sharing champions */}
        {topSharers.length > 0 && (
          <div className="max-w-5xl mx-auto mb-24">
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[var(--gold-dim)] border border-[var(--gold-dim)] mb-4"
              >
                <Share2 className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-[var(--gold)] font-bold text-sm tracking-wide">{t("championsBadge")}</span>
              </motion.div>
              <h2 className="font-sans font-black text-2xl sm:text-4xl text-[var(--white)] mb-2">
                {t("championsTitle")}
              </h2>
              <p className="text-[var(--muted-light)] text-sm sm:text-base max-w-xl mx-auto">
                {t("championsSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:items-end">
              {topSharers.map((org, i) => {
                const isFirst = i === 0;
                return (
                  <motion.div
                    key={org.rank}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: i * 0.12, type: "spring", stiffness: 70 }}
                    className={`relative rounded-3xl border p-6 text-center overflow-hidden backdrop-blur-[16px] ${
                      isFirst ? "sm:order-2 sm:-mt-6" : i === 1 ? "sm:order-1" : "sm:order-3"
                    }`}
                    style={{
                      borderColor: `${glows[i]}66`,
                      background: `linear-gradient(to bottom, ${glows[i]}1f, var(--card-glass-deep))`,
                      boxShadow: `0 8px 40px ${glows[i]}26`,
                    }}
                  >
                    {isFirst && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-bounce">👑</div>
                    )}
                    <div
                      className="absolute inset-x-0 top-0 h-1.5"
                      style={{ backgroundColor: glows[i] }}
                    />
                    <div className="text-4xl mb-3 mt-2">{medals[i]}</div>
                    <div
                      className="w-16 h-16 mx-auto rounded-2xl bg-[var(--surface-2)] border-2 flex items-center justify-center mb-4 relative overflow-hidden"
                      style={{ borderColor: glows[i], boxShadow: `0 0 20px ${glows[i]}40` }}
                    >
                      <Building2 className="w-8 h-8" style={{ color: glows[i] }} />
                      {isFirst && <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />}
                    </div>
                    <div className="font-sans font-bold text-[var(--white)] text-base sm:text-lg mb-1 px-1 truncate">
                      {org.name}
                    </div>
                    <div className="text-[var(--muted)] text-xs mb-4 truncate">{categoryLabel(org.category)}</div>
                    <div
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl"
                      style={{ backgroundColor: `${glows[i]}1f` }}
                    >
                      <Share2 className="w-5 h-5" style={{ color: glows[i] }} />
                      <span className="font-mono font-black text-3xl" style={{ color: glows[i] }} dir="ltr">
                        {org.shares.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="text-[var(--muted)] text-[11px] mt-2 uppercase tracking-wider">
                      {t("colShares")}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-3 font-mono text-xs text-[var(--gold-light)]">
                      <MessageSquareText className="w-3.5 h-3.5" />
                      <span dir="ltr">{org.messages}</span>
                      <span className="text-[var(--muted)]">{t("colMessages")}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Honor roll */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-xl max-w-5xl mx-auto text-start">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-[var(--border)] pb-6">
            <h3 className="font-sans font-bold text-2xl text-[var(--white)]">{t("orgHonorRollTitle")}</h3>
            <div className="relative w-full md:w-72">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted)] ${isRtl ? "left-3" : "right-3"}`}
                size={16}
              />
              <input
                type="text"
                placeholder={t("orgSearchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] py-2 text-sm focus:outline-none focus:border-[var(--gold)] ${
                  isRtl ? "pl-10 pr-4" : "pr-10 pl-4"
                } text-start`}
              />
            </div>
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                !categoryFilter
                  ? "bg-[var(--gold)] text-[var(--bg-deep)]"
                  : "bg-[var(--surface-2)] text-[var(--muted-light)] hover:text-[var(--gold)] border border-[var(--border)]"
              }`}
            >
              {t("allCategories")}
            </button>
            {ORG_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  categoryFilter === c.id
                    ? "bg-[var(--gold)] text-[var(--bg-deep)]"
                    : "bg-[var(--surface-2)] text-[var(--muted-light)] hover:text-[var(--gold)] border border-[var(--border)]"
                }`}
              >
                {isRtl ? c.name_ar : c.name_en}
              </button>
            ))}
            <button
              onClick={() => setCategoryFilter("other")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                categoryFilter === "other"
                  ? "bg-[var(--gold)] text-[var(--bg-deep)]"
                  : "bg-[var(--surface-2)] text-[var(--muted-light)] hover:text-[var(--gold)] border border-[var(--border)]"
              }`}
            >
              {t("categoryOther")}
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[var(--muted)]">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>{t("orgEmpty")}</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto w-full">
              <table className="w-full text-start">
                <thead>
                  <tr className="text-[var(--muted)] border-b border-[var(--border)] text-start">
                    <th className="pb-4 font-normal w-16 text-start">{t("colRank")}</th>
                    <th className="pb-4 font-normal text-start">{t("colOrganization")}</th>
                    <th className="pb-4 font-normal text-start">{t("colCategory")}</th>
                    <th className="pb-4 font-normal text-center">{t("colMessages")}</th>
                    <th className="pb-4 font-normal text-center">{t("colShares")}</th>
                    <th className="pb-4 font-normal text-start">{t("colBadge")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((org) => (
                    <tr key={org.rank} className="hover:bg-[var(--gold-dim)] transition-colors group">
                      <td className="py-4 font-mono text-[var(--muted-light)] text-start">{org.rank}</td>
                      <td className="py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--gold)] shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-[var(--white)] group-hover:text-[var(--gold)] transition-colors whitespace-nowrap">
                            {org.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-[var(--muted-light)] text-sm text-start whitespace-nowrap">
                        {categoryLabel(org.category)}
                      </td>
                      <td className="py-4 text-center font-mono font-bold text-[var(--gold-light)]" dir="ltr">
                        {org.messages}
                      </td>
                      <td className="py-4 text-center font-mono font-bold text-[var(--muted-light)]" dir="ltr">
                        {org.shares}
                      </td>
                      <td className="py-4 text-start">
                        <BadgePill
                          rankId={
                            org.badge === "💎"
                              ? "nationalHero"
                              : org.badge === "🥇"
                              ? "ambassador"
                              : org.badge === "🥈"
                              ? "supporter"
                              : "participant"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
