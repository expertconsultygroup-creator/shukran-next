"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { BadgePill } from "@/components/shared/BadgePill";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";

export default function HallOfFame() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contributors, setContributors] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/contributors").then(r => r.json()).then(setContributors).catch(() => {});
  }, []);

  const top3 = contributors.slice(0, 3);
  const rest = contributors.slice(3).filter((c: any) => c.name.includes(searchTerm));

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const heights = [140, 180, 110];
  const glows = ["#9EA2A9", "var(--gold)", "#CD7F32"];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(203,163,68,0.08)_0%,transparent_50%)] pointer-events-none" />
      <ShamsaPattern className="opacity-5" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl text-[var(--gold)] mb-4 drop-shadow-[var(--glow-gold)]">قاعة المشاهير</h1>
          <p className="text-[var(--muted-light)] text-lg">تكريم لفرسان المنصة الأكثر تفاعلاً ومشاركة</p>
        </div>

        {podiumOrder.length >= 3 && (
          <div className="flex items-end justify-center gap-2 md:gap-6 mb-24 h-[300px]">
            {podiumOrder.map((user: any, i: number) => {
              const isFirst = i === 1;
              return (
                <motion.div key={user.rank} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: isFirst ? 0 : 0.2, type: "spring", stiffness: 50 }} className="flex flex-col items-center relative" style={{ zIndex: isFirst ? 10 : 5 }}>
                  {isFirst && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} className="absolute -top-10 text-3xl animate-bounce">👑</motion.div>}
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--surface-2)] border-2 flex items-center justify-center text-xl font-bold mb-4 shadow-lg overflow-hidden relative" style={{ borderColor: glows[i], boxShadow: `0 0 20px ${glows[i]}40` }}>
                    {user.name.charAt(0)}
                    {isFirst && <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>}
                  </div>
                  <div className="text-center mb-2 px-1">
                    <div className="font-sans font-bold text-[var(--white)] text-xs sm:text-sm truncate w-20 sm:w-24">{user.name}</div>
                    <div className="font-mono text-[var(--gold)] text-[10px] sm:text-xs">{user.messages} رسالة</div>
                  </div>
                  <div className="w-24 md:w-32 rounded-t-lg relative flex items-center justify-center overflow-hidden border-t border-x" style={{ height: `${heights[i]}px`, background: `linear-gradient(to top, var(--card-glass-deep), ${glows[i]}20)`, borderColor: `${glows[i]}40` }}>
                    <span className="font-mono font-black text-4xl md:text-5xl opacity-40" style={{ color: glows[i] }}>{user.rank}</span>
                    <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: glows[i] }}></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
          {(["مشارك", "داعم", "سفير", "بطل وطني"] as const).map((rank, i) => (
            <div key={rank} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2">
              <BadgePill rank={rank} />
              <span className="text-[var(--muted)] text-xs">{i === 0 ? "1+ رسالة" : i === 1 ? "10+ رسائل" : i === 2 ? "25+ رسالة" : "50+ رسالة"}</span>
            </div>
          ))}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-xl max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-[var(--border)] pb-6">
            <h3 className="font-sans font-bold text-2xl text-[var(--white)]">سجل الشرف</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input type="text" placeholder="ابحث عن مساهم..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] pr-10 pl-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="pb-4 font-normal w-16">#</th>
                  <th className="pb-4 font-normal">الاسم</th>
                  <th className="pb-4 font-normal">الدولة</th>
                  <th className="pb-4 font-normal text-center">الرسائل</th>
                  <th className="pb-4 font-normal">الشارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rest.map((user: any) => (
                  <tr key={user.rank} className="hover:bg-[var(--gold-dim)] transition-colors group">
                    <td className="py-4 font-mono text-[var(--muted-light)]">{user.rank}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-xs font-bold text-[var(--gold)]">{user.name.charAt(0)}</div>
                        <span className="font-bold text-[var(--white)] group-hover:text-[var(--gold)] transition-colors">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-[var(--white)] text-lg">{user.nationality} <span className="text-sm text-[var(--muted-light)] ml-1">{user.country}</span></td>
                    <td className="py-4 text-center font-mono font-bold text-[var(--gold-light)]">{user.messages}</td>
                    <td className="py-4"><BadgePill rank={user.badge === "💎" ? "بطل وطني" : user.badge === "🥇" ? "سفير" : user.badge === "🥈" ? "داعم" : "مشارك"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
