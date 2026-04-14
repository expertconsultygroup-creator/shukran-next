"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, BookOpen, Printer, ChevronRight, ChevronLeft, X } from "lucide-react";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";

export default function EBook() {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = 312;

  const chapters = [
    { title: "المقدمة", page: 1 },
    { title: "تاريخ المنصة", page: 12 },
    { title: "رسائل الشكر (مواطنون)", page: 24 },
    { title: "رسائل الشكر (مقيمون)", page: 128 },
    { title: "القصائد الوطنية", page: 240 },
    { title: "الرعاة والشركاء", page: 300 }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative overflow-hidden">
      <ShamsaPattern className="opacity-5" />

      <div className="container mx-auto px-4 py-20 relative z-10">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8 mb-24">
          {/* Left/Top: Info */}
          <div className="w-full lg:w-1/2">
            <div className="inline-block border border-[var(--gold)] px-4 py-1 rounded-full text-[var(--gold)] text-sm font-bold mb-6">
              الإصدار الرقمي الأول ✦ 2025
            </div>
            <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl text-[var(--white)] mb-6 leading-tight">
              السجل الوطني<br/>
              <span className="text-[var(--gold)]">لرسائل الشكر</span>
            </h1>
            <p className="text-[var(--muted-light)] text-lg mb-10 leading-relaxed max-w-lg">
              كتاب رقمي فني يوثق مليون رسالة شكر وقصيدة ومشاركة مرئية، صُيغ ليبقى مرجعاً تاريخياً يعكس تلاحم القيادة والشعب والمقيمين.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsReaderOpen(true)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-[var(--glow-gold)]"
              >
                <BookOpen size={24} />
                اقرأ أونلاين
              </button>
            </div>
          </div>

          {/* Right/Bottom: 3D Book */}
          <div className="w-full lg:w-1/2 flex justify-center perspective-[1200px]">
            <motion.div
              initial={{ rotateY: -20, rotateX: 5 }}
              whileHover={{ rotateY: -5, rotateX: 2 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative w-[300px] md:w-[400px] aspect-[1/1.4] cursor-pointer group"
              onClick={() => setIsReaderOpen(true)}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Cover */}
              <div className="absolute inset-0 rounded-l-lg rounded-r-md bg-gradient-to-br from-[#0a2015] to-[var(--green-dark)] shadow-2xl border-l-[4px] border-[#05100a] flex flex-col items-center justify-center p-8 overflow-hidden z-10" style={{ transform: "translateZ(14px)" }}>
                <ShamsaPattern className="opacity-20" />
                <svg viewBox="0 0 100 100" fill="none" className="w-24 h-24 mb-6 text-[var(--gold)] drop-shadow-md">
                  <path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z" fill="currentColor"/>
                </svg>
                <h2 className="font-sans font-black text-4xl text-[var(--gold)] text-center mb-2">شكراً</h2>
                <h3 className="font-sans font-bold text-2xl text-[var(--white)] text-center">حماة الوطن</h3>
                <div className="mt-12 h-px w-20 bg-[var(--gold)]"></div>
                <p className="mt-4 text-[var(--gold-dim)] font-mono text-sm tracking-widest">VOL I. 2025</p>

                {/* Edge lighting */}
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent"></div>
              </div>

              {/* Pages Edge (Right) */}
              <div className="absolute top-[1%] bottom-[1%] right-0 w-7 bg-[#F9F7ED] rounded-r-sm border-y border-r border-[#d4d0bc] flex flex-col justify-evenly py-4" style={{ transform: "rotateY(90deg) translateZ(196px) translateX(14px)", transformOrigin: "right" }}>
                {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-black/10"></div>
                ))}
              </div>

              {/* Spine (Left) */}
              <div className="absolute inset-y-0 left-0 w-7 bg-[var(--gold-dark)] rounded-l-md shadow-[inset_-2px_0_5px_rgba(0,0,0,0.5)] border-l border-black/20" style={{ transform: "rotateY(-90deg) translateZ(14px)", transformOrigin: "left" }}></div>

              {/* Back Cover (inside) - creates depth */}
              <div className="absolute inset-0 bg-[#05100a] rounded-lg" style={{ transform: "translateZ(-14px)" }}></div>

              {/* Shadow on floor */}
              <div className="absolute -bottom-8 left-10 right-[-20px] h-10 bg-black/60 blur-[20px]" style={{ transform: "translateZ(-20px)" }}></div>
            </motion.div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x md:divide-x-reverse divide-[var(--border)]">
            {[
              { label: "صفحة", value: "312" },
              { label: "رسالة موثقة", value: "847,293" },
              { label: "قصيدة", value: "312" },
              { label: "وسيلة إعلامية", value: "48" }
            ].map((stat, i) => (
              <div key={i} className="px-4">
                <div className="font-mono text-4xl text-[var(--gold)] font-bold mb-2">{stat.value}</div>
                <div className="text-[var(--muted-light)] font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Table of Contents */}
          <div>
            <h3 className="font-sans font-bold text-3xl text-[var(--white)] mb-8 border-r-4 border-[var(--gold)] pr-4">فهرس المحتويات</h3>
            <div className="space-y-4">
              {chapters.map((ch, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <span className="font-mono text-[var(--gold)] font-bold w-6">{String(i+1).padStart(2,'0')}</span>
                  <span className="text-[var(--white)] text-lg group-hover:text-[var(--gold)] transition-colors">{ch.title}</span>
                  <div className="flex-1 border-b border-dashed border-[var(--border)] group-hover:border-[var(--gold-dim)] transition-colors mt-2 mx-4"></div>
                  <span className="font-mono text-[var(--muted)]">{ch.page}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Options */}
          <div>
            <h3 className="font-sans font-bold text-3xl text-[var(--white)] mb-8 border-r-4 border-[var(--gold)] pr-4">خيارات الحصول على الكتاب</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[var(--card-glass-alt)] border border-[var(--gold-dim)] rounded-2xl p-6 text-center hover:bg-[var(--surface-2)] transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--gold)] group-hover:text-[var(--gold)] text-[var(--white)] transition-colors">
                  <Download size={28} />
                </div>
                <h4 className="font-bold text-[var(--white)] mb-2">النسخة الرقمية (PDF)</h4>
                <p className="text-[var(--muted)] text-sm mb-4">دقة عالية · 45 ميجابايت</p>
                <button className="text-[var(--gold)] font-bold text-sm">تحميل الآن ↓</button>
              </div>

              <div className="bg-[var(--card-glass-alt)] border border-[var(--border)] rounded-2xl p-6 text-center hover:bg-[var(--surface-2)] transition-colors cursor-pointer group relative overflow-hidden">
                <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--muted)]">
                  <Printer size={28} />
                </div>
                <h4 className="font-bold text-[var(--white)] mb-2">نسخة للطباعة</h4>
                <p className="text-[var(--muted)] text-sm mb-4">جاهزة للمطابع · CMYK</p>
                <button className="text-[var(--muted)] font-bold text-sm">قريباً</button>
                <div className="absolute top-4 left-4 bg-[var(--surface)] px-2 py-1 text-xs rounded text-[var(--muted)]">مغلق</div>
              </div>
            </div>

            <div className="mt-8 bg-[var(--surface)] rounded-xl p-6 flex items-center gap-6 border border-[var(--border)]">
              <div className="w-24 h-24 bg-white rounded flex items-center justify-center shrink-0">
                {/* Mock QR */}
                <div className="grid grid-cols-5 grid-rows-5 gap-1 w-16 h-16">
                  {Array.from({length: 25}).map((_, i) => (
                    <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                  ))}
                  {/* QR Corners */}
                  <div className="col-start-1 row-start-1 col-span-2 row-span-2 border-4 border-black"></div>
                  <div className="col-start-4 row-start-1 col-span-2 row-span-2 border-4 border-black"></div>
                  <div className="col-start-1 row-start-4 col-span-2 row-span-2 border-4 border-black"></div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-[var(--white)] mb-1">امسح الكود</h4>
                <p className="text-[var(--muted)] text-sm leading-relaxed">لتحميل الكتاب مباشرة على هاتفك الذكي أو مشاركته مع العائلة والأصدقاء.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Reader Fullscreen Modal */}
      <AnimatePresence>
        {isReaderOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#F9F7ED] text-[#1B1D21] flex flex-col"
          >
            {/* Top Bar */}
            <div className="h-16 border-b border-[#E6D7A2] px-6 flex items-center justify-between shrink-0 bg-[#FFFDF9]">
              <div className="font-sans font-bold text-[#B68A35]">شكراً حماة الوطن</div>
              <div className="font-mono text-[#5F646D] font-bold">صفحة {page} من {totalPages}</div>
              <button
                onClick={() => setIsReaderOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F2ECCF] text-[#5F646D] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Reader Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="absolute right-4 md:right-10 w-14 h-14 bg-white shadow-lg rounded-full flex items-center justify-center text-[#B68A35] hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 z-20"
              >
                <ChevronRight size={32} />
              </button>

              {/* Paper / Page */}
              <motion.div
                key={page}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl h-[80vh] bg-white shadow-2xl p-10 md:p-20 overflow-y-auto"
                style={{ transformStyle: "preserve-3d", transformOrigin: "right" }}
              >
                {page === 1 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 mb-8 text-[#B68A35]">
                      <path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z" fill="currentColor"/>
                    </svg>
                    <h2 className="font-sans font-black text-5xl text-[#B68A35] mb-4">المقدمة</h2>
                    <div className="w-12 h-1 bg-[#E6D7A2] mx-auto mb-10"></div>
                    <div className="font-serif text-2xl leading-[2.4] text-justify">
                      بسم الله الرحمن الرحيم. يمثل هذا السجل الوطني لوحة شرف يخطها أبناء الإمارات والمقيمون على أرضها الطيبة، تعبيراً عن خالص الشكر والامتنان لأبطال القوات المسلحة...
                    </div>
                  </div>
                ) : (
                  <div>
                     <h3 className="font-sans font-bold text-2xl text-[#B68A35] border-b border-[#E6D7A2] pb-4 mb-8">رسائل الشكر - {page * 10}</h3>
                     <div className="space-y-10">
                       {[1,2,3].map(i => (
                         <div key={i}>
                           <div className="font-serif text-xl leading-[2.2] mb-3">"أبطال الوطن وحماته، عرفانكم في قلوبنا إلى الأبد، شكراً من صميم القلب على كل ما تقدمونه من تضحيات."</div>
                           <div className="font-sans text-sm text-[#797E86] font-bold">— محمد الهاشمي، مواطن</div>
                         </div>
                       ))}
                     </div>
                  </div>
                )}
              </motion.div>

              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="absolute left-4 md:left-10 w-14 h-14 bg-white shadow-lg rounded-full flex items-center justify-center text-[#B68A35] hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 z-20"
              >
                <ChevronLeft size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
