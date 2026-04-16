"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, BookOpen, Printer, ChevronRight, ChevronLeft, X } from "lucide-react";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { useTranslations, useLocale } from "next-intl";

export default function EBook() {
  const t = useTranslations("ebook");
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ totalMessages: 0, totalPoems: 0, totalVideos: 0 });
  const [readerMessages, setReaderMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats({
          totalMessages: data.totalMessages || 0,
          totalPoems: data.totalPoems || 0,
          totalVideos: data.totalVideos || 0,
        });
      })
      .catch(() => {});
  }, []);

  // Fetch messages for the reader when opened
  useEffect(() => {
    if (isReaderOpen && readerMessages.length === 0) {
      fetch("/api/messages?limit=50&status=approved")
        .then((r) => r.json())
        .then((data) => setReaderMessages(data.messages || []))
        .catch(() => {});
    }
  }, [isReaderOpen, readerMessages.length]);

  // Estimate pages: ~3 messages per page + intro pages
  const totalPages = Math.max(20, Math.ceil(stats.totalMessages / 3) + 12);

  const chapters = [
    { title: t("introduction"), page: 1 },
    { title: t("platformHistory"), page: 12 },
    { title: t("chCitizens"), page: 24 },
    { title: t("chResidents"), page: Math.floor(totalPages * 0.4) },
    { title: t("chPoetry"), page: Math.floor(totalPages * 0.75) },
    { title: t("chSponsors"), page: Math.floor(totalPages * 0.95) },
  ];

  // Get messages for current reader page
  const getPageMessages = () => {
    if (page <= 1 || readerMessages.length === 0) return [];
    const startIdx = ((page - 2) * 3) % readerMessages.length;
    return readerMessages.slice(startIdx, startIdx + 3);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative overflow-hidden" dir="auto">
      <ShamsaPattern className="opacity-5" />

      <div className="container mx-auto px-4 py-20 relative z-10 text-start">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8 mb-24 text-start">
          {/* Left/Top: Info */}
          <div className="w-full lg:w-1/2">
            <div className="inline-block border border-[var(--gold)] px-4 py-1 rounded-full text-[var(--gold)] text-sm font-bold mb-6">
              {t("firstEdition")}
            </div>
            <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl text-[var(--white)] mb-6 leading-tight">
              {t("nationalRecord1")}<br/>
              <span className="text-[var(--gold)]">{t("nationalRecord2")}</span>
            </h1>
            <p className="text-[var(--muted-light)] text-lg mb-10 leading-relaxed max-w-lg">
              {t("descriptionText")}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsReaderOpen(true)}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-[var(--glow-gold)]"
              >
                <BookOpen size={24} />
                {t("readOnline")}
              </button>
            </div>
          </div>

          {/* Right/Bottom: 3D Book */}
          <div className="w-full lg:w-1/2 flex justify-center perspective-[1200px]">
            <motion.div
              initial={{ rotateY: isRtl ? 20 : -20, rotateX: 5 }}
              whileHover={{ rotateY: isRtl ? 5 : -5, rotateX: 2 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative w-[300px] md:w-[400px] aspect-[1/1.4] cursor-pointer group"
              onClick={() => setIsReaderOpen(true)}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Cover */}
              <div className={`absolute inset-0 ${isRtl ? 'rounded-r-lg rounded-l-md border-r-[4px] border-[#05100a]' : 'rounded-l-lg rounded-r-md border-l-[4px] border-[#05100a]'} bg-gradient-to-br from-[#0a2015] to-[var(--green-dark)] shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden z-10`} style={{ transform: "translateZ(14px)" }}>
                <ShamsaPattern className="opacity-20" />
                <svg viewBox="0 0 100 100" fill="none" className="w-24 h-24 mb-6 text-[var(--gold)] drop-shadow-md">
                  <path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z" fill="currentColor"/>
                </svg>
                <h2 className="font-sans font-black text-4xl text-[var(--gold)] text-center mb-2">{t("thankYou")}</h2>
                <h3 className="font-sans font-bold text-2xl text-[var(--white)] text-center">{t("guardians")}</h3>
                <div className="mt-12 h-px w-20 bg-[var(--gold)]"></div>
                <p className="mt-4 text-[var(--gold-dim)] font-mono text-sm tracking-widest">VOL I. 2025</p>

                {/* Edge lighting */}
                <div className={`absolute top-0 bottom-0 w-4 bg-gradient-to-l from-black/40 to-transparent ${isRtl ? 'left-0' : 'right-0'}`}></div>
              </div>

              {/* Pages Edge (Right/Left) */}
              <div className={`absolute top-[1%] bottom-[1%] w-7 bg-[#F9F7ED] border-y border-[#d4d0bc] flex flex-col justify-evenly py-4 ${isRtl ? 'left-0 rounded-l-sm border-l' : 'right-0 rounded-r-sm border-r'}`} style={{ transform: `rotateY(${isRtl ? -90 : 90}deg) translateZ(196px) translateX(${isRtl ? -14 : 14}px)`, transformOrigin: isRtl ? "left" : "right" }}>
                {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-black/10"></div>
                ))}
              </div>

              {/* Spine (Left/Right) */}
              <div className={`absolute inset-y-0 w-7 bg-[var(--gold-dark)] shadow-[inset_-2px_0_5px_rgba(0,0,0,0.5)] border-black/20 ${isRtl ? 'right-0 rounded-r-md border-r' : 'left-0 rounded-l-md border-l'}`} style={{ transform: `rotateY(${isRtl ? 90 : -90}deg) translateZ(14px)`, transformOrigin: isRtl ? "right" : "left" }}></div>

              {/* Back Cover (inside) - creates depth */}
              <div className="absolute inset-0 bg-[#05100a] rounded-lg" style={{ transform: "translateZ(-14px)" }}></div>

              {/* Shadow on floor */}
              <div className={`absolute -bottom-8 h-10 bg-black/60 blur-[20px] ${isRtl ? 'right-10 left-[-20px]' : 'left-10 right-[-20px]'}`} style={{ transform: "translateZ(-20px)" }}></div>
            </motion.div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 mb-24 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x md:divide-x-reverse divide-[var(--border)] rtl:divide-x-reverse ltr:divide-x">
            {[
              { label: t("statPage"), value: totalPages.toLocaleString() },
              { label: t("statMessage"), value: stats.totalMessages.toLocaleString() },
              { label: t("statPoem"), value: stats.totalPoems.toLocaleString() },
              { label: t("statVideo"), value: stats.totalVideos.toLocaleString() }
            ].map((stat, i) => (
              <div key={i} className="px-4">
                <div className="font-mono text-4xl text-[var(--gold)] font-bold mb-2">{stat.value}</div>
                <div className="text-[var(--muted-light)] font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-start">
          {/* Table of Contents */}
          <div>
            <h3 className="font-sans font-bold text-3xl text-[var(--white)] mb-8 border-s-4 border-[var(--gold)] ps-4">{t("toc")}</h3>
            <div className="space-y-4">
              {chapters.map((ch, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <span className="font-mono text-[var(--gold)] font-bold w-6 text-end">{String(i+1).padStart(2,'0')}</span>
                  <span className="text-[var(--white)] text-lg group-hover:text-[var(--gold)] transition-colors">{ch.title}</span>
                  <div className="flex-1 border-b border-dashed border-[var(--border)] group-hover:border-[var(--gold-dim)] transition-colors mt-2 mx-4"></div>
                  <span className="font-mono text-[var(--muted)]">{ch.page}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Options */}
          <div>
            <h3 className="font-sans font-bold text-3xl text-[var(--white)] mb-8 border-s-4 border-[var(--gold)] ps-4">{t("downloadOptions")}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[var(--card-glass-alt)] border border-[var(--gold-dim)] rounded-2xl p-6 text-center hover:bg-[var(--surface-2)] transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--gold)] group-hover:text-[var(--gold)] text-[var(--white)] transition-colors">
                  <Download size={28} />
                </div>
                <h4 className="font-bold text-[var(--white)] mb-2">{t("digitalVersion")}</h4>
                <p className="text-[var(--muted)] text-sm mb-4">{t("digitalVersionDesc")}</p>
                <button className="text-[var(--gold)] font-bold text-sm">{t("downloadNow")}</button>
              </div>

              <div className="bg-[var(--card-glass-alt)] border border-[var(--border)] rounded-2xl p-6 text-center hover:bg-[var(--surface-2)] transition-colors cursor-pointer group relative overflow-hidden">
                <div className="w-16 h-16 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--muted)]">
                  <Printer size={28} />
                </div>
                <h4 className="font-bold text-[var(--white)] mb-2">{t("printVersion")}</h4>
                <p className="text-[var(--muted)] text-sm mb-4">{t("printVersionDesc")}</p>
                <button className="text-[var(--muted)] font-bold text-sm">{t("comingSoon")}</button>
                <div className="absolute top-4 start-4 bg-[var(--surface)] px-2 py-1 text-xs rounded text-[var(--muted)]">{t("closedLabel")}</div>
              </div>
            </div>

            <div className="mt-8 bg-[var(--surface)] rounded-xl p-6 flex items-center gap-6 border border-[var(--border)]">
              <div className="w-24 h-24 bg-white rounded flex items-center justify-center shrink-0">
                {/* QR placeholder */}
                <div className="grid grid-cols-5 grid-rows-5 gap-1 w-16 h-16">
                  {Array.from({length: 25}).map((_, i) => (
                    <div key={i} className={`bg-black ${[0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i) ? 'opacity-100' : 'opacity-0'}`}></div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-[var(--white)] mb-1">{t("scanCode")}</h4>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{t("scanCodeDesc")}</p>
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
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Top Bar */}
            <div className="h-16 border-b border-[#E6D7A2] px-6 flex items-center justify-between shrink-0 bg-[#FFFDF9]">
              <div className="font-sans font-bold text-[#B68A35]">{t("thankYou")} {t("guardians")}</div>
              <div className="font-mono text-[#5F646D] font-bold">{t("pageCount", { page, totalPages })}</div>
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
                className="absolute end-4 md:end-10 w-14 h-14 bg-white shadow-lg rounded-full flex items-center justify-center text-[#B68A35] hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 z-20"
              >
                {isRtl ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
              </button>

              {/* Paper / Page */}
              <motion.div
                key={page}
                initial={{ rotateY: isRtl ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isRtl ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-2xl h-[80vh] bg-white shadow-2xl p-10 md:p-20 overflow-y-auto text-start"
                style={{ transformStyle: "preserve-3d", transformOrigin: isRtl ? "left" : "right" }}
              >
                {page === 1 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 mb-8 text-[#B68A35]">
                      <path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z" fill="currentColor"/>
                    </svg>
                    <h2 className="font-sans font-black text-5xl text-[#B68A35] mb-4">{t("introduction")}</h2>
                    <div className="w-12 h-1 bg-[#E6D7A2] mx-auto mb-10"></div>
                    <div className="font-serif text-2xl leading-[2.4] text-justify" dir={isRtl ? "rtl" : "ltr"}>
                      {t("introText")}
                    </div>
                  </div>
                ) : (
                  <div>
                     <h3 className="font-sans font-bold text-2xl text-[#B68A35] border-b border-[#E6D7A2] pb-4 mb-8 text-start">{t("thankYouMessages")}</h3>
                     <div className="space-y-10">
                       {getPageMessages().length > 0 ? getPageMessages().map((msg: any, i: number) => (
                         <div key={msg.id || i} className="text-start">
                           <div className="font-serif text-xl leading-[2.2] mb-3">&ldquo;{msg.text}&rdquo;</div>
                           <div className="font-sans text-sm text-[#797E86] font-bold">— {msg.name}، {msg.category}</div>
                         </div>
                       )) : (
                         <div className="text-center text-[#797E86] py-12">{t("loadingMessages")}</div>
                       )}
                     </div>
                  </div>
                )}
              </motion.div>

              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="absolute start-4 md:start-10 w-14 h-14 bg-white shadow-lg rounded-full flex items-center justify-center text-[#B68A35] hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 z-20"
              >
                {isRtl ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

