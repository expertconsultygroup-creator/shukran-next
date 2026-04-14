"use client";

import { LiveCounter } from "@/components/shared/LiveCounter";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCard } from "@/components/messages/MessageCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartDataDaily = [
  { date: "2025-10-17", count: 2841, label: "17 أكتوبر" },
  { date: "2025-10-18", count: 3102, label: "18 أكتوبر" },
  { date: "2025-10-19", count: 2998, label: "19 أكتوبر" },
  { date: "2025-10-20", count: 3421, label: "20 أكتوبر" },
  { date: "2025-10-21", count: 4102, label: "21 أكتوبر" },
  { date: "2025-10-22", count: 3876, label: "22 أكتوبر" },
  { date: "2025-10-23", count: 4289, label: "23 أكتوبر" },
];

const nationalities = [
  { name: "إماراتيون", value: 48.7, color: "#CBA344" },
  { name: "مقيمون عرب", value: 22.4, color: "#3F8E50" },
  { name: "مقيمون آسيا", value: 18.9, color: "#0090D4" },
  { name: "أخرى", value: 10.0, color: "#7A9BB5" },
];

interface HomeClientProps {
  initialMessages: any[];
  initialCount: number;
}

export default function HomeClient({ initialMessages, initialCount }: HomeClientProps) {
  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 overflow-hidden">
        <ShamsaPattern className="opacity-10" />

        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] opacity-5 animate-[spin_120s_linear_infinite] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" stroke="var(--gold)" strokeWidth="1">
            <path d="M50 5 A45 45 0 1 0 95 50 A35 35 0 1 1 50 5" />
          </svg>
        </div>

        <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 px-4 py-1.5 rounded-full bg-[var(--gold-dim)] border border-[var(--gold)] shadow-[0_0_15px_rgba(203,163,68,0.2)] animate-pulse"
          >
            <span className="text-[var(--gold-light)] font-bold text-sm tracking-wide">🏆 نحو رقم قياسي عالمي موثق من غينيس</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-sans font-black text-[64px] sm:text-7xl md:text-[130px] leading-none text-[var(--gold)] mb-2 drop-shadow-[var(--glow-gold)]"
          >
            شكراً
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-sans font-bold text-2xl sm:text-4xl md:text-[80px] text-[var(--white)] mb-6"
          >
            حماة الوطن
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[var(--muted-light)] text-lg md:text-xl max-w-[480px] mb-16 leading-relaxed"
          >
            منصة وطنية لتوثيق أسمى آيات الشكر والعرفان لأبطال القوات المسلحة الإماراتية.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full max-w-4xl mx-auto mb-16"
          >
            <LiveCounter />

            <div className="mt-12 w-full max-w-2xl mx-auto">
              <div className="flex justify-between text-sm mb-3 font-sans font-bold text-[var(--muted-light)]">
                <span>{initialCount.toLocaleString()} موثق</span>
                <span className="text-[var(--gold)]">الهدف: 1,000,000</span>
              </div>
              <div className="h-3 w-full bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border)] relative">
                <div
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-light)] rounded-full"
                  style={{ width: `${Math.min((initialCount / 1000000) * 100, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/send" className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-lg shadow-[var(--glow-gold)] hover:scale-105 active:scale-95 transition-transform min-w-[200px]">
              أرسل رسالتك الآن
            </Link>
            <Link href="/messages" className="px-8 py-4 rounded-full border-2 border-[var(--gold)] text-[var(--gold-light)] font-sans font-bold text-lg hover:bg-[var(--gold-dim)] transition-colors min-w-[200px]">
              تصفح الرسائل
            </Link>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-[var(--surface)] border-y border-[var(--gold-dim)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "رسالة شكر", value: initialCount.toLocaleString() },
              { label: "دولة مشاركة", value: "124" },
              { label: "فيديو موثق", value: "48" },
              { label: "قصيدة وطنية", value: "312" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--card-glass)] backdrop-blur-md rounded-2xl p-6 border-r-4 border-[var(--gold)] shadow-lg"
              >
                <div className="font-mono text-3xl md:text-4xl text-[var(--gold)] font-bold mb-2">{stat.value}</div>
                <div className="font-sans text-[var(--muted-light)] font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST MESSAGES */}
      <section className="py-24 relative">
        <ShamsaPattern className="opacity-[0.02]" />
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-sans font-black text-2xl sm:text-4xl text-[var(--white)] mb-4">آخر رسائل الشكر</h2>
              <div className="h-1 w-20 bg-[var(--gold)] rounded-full"></div>
            </div>
            <Link href="/messages" className="text-[var(--gold-light)] font-bold hover:underline hidden sm:block">
              عرض جميع الرسائل ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialMessages.slice(0, 6).map((msg: any, i: number) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <MessageCard message={msg} />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/messages" className="text-[var(--gold-light)] font-bold hover:underline inline-block p-4">
              عرض جميع الرسائل ←
            </Link>
          </div>
        </div>
      </section>

      {/* ANALYTICS PREVIEW */}
      <section className="py-24 bg-[var(--bg-deep)] border-t border-[var(--border)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-sans font-black text-2xl sm:text-4xl text-[var(--white)] mb-4">نبض التفاعل</h2>
            <p className="text-[var(--muted)]">إحصائيات حية للمشاركة العالمية والمحلية</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 h-[280px] sm:h-[400px]">
              <h3 className="font-sans font-bold text-lg text-[var(--white)] mb-6">الرسائل اليومية</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataDaily}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted)" tick={{fill: 'var(--muted)', fontSize: 12}} />
                  <YAxis stroke="var(--muted)" tick={{fill: 'var(--muted)', fontSize: 12}} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--gold-dim)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--gold)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 flex flex-col justify-center items-center h-[280px] sm:h-[400px]">
              <h3 className="font-sans font-bold text-lg text-[var(--white)] mb-6 self-start w-full">توزيع المشاركات</h3>
              <div className="relative w-48 h-48 rounded-full border-[16px] border-[var(--surface-2)] shadow-[var(--glow-gold)] flex items-center justify-center">
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-[var(--gold)] border-r-[var(--gold)] transform rotate-45"></div>
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-b-[var(--green)] transform rotate-[10deg]"></div>
                <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-l-[var(--sea)] transform -rotate-[15deg]"></div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--white)]">124</div>
                  <div className="text-xs text-[var(--muted)]">دولة</div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 flex-wrap justify-center w-full">
                {nationalities.map(n => (
                  <div key={n.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: n.color }}></span>
                    <span className="text-sm text-[var(--muted-light)]">{n.name} {n.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
