"use client";

import { useState, useEffect } from "react";
import { Play, Eye, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { useTranslations } from "next-intl";

/** Extract a YouTube video ID from any URL format or raw ID string */
function extractYoutubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Already a raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    // youtube.com/watch?v=ID
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      // youtube.com/shorts/ID or youtube.com/embed/ID
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && (parts[0] === "shorts" || parts[0] === "embed")) return parts[1];
    }
    // youtu.be/ID
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0];
  } catch {
    // not a URL, try to find an ID pattern
    const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  }
  return trimmed; // fallback: treat entire string as ID
}

export default function Media() {
  const t = useTranslations("media");
  
  const [activeCategory, setActiveCategory] = useState(t("filterAll"));
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/videos").then(r => r.json()).then(setVideos).catch(() => {});
  }, []);

  const categories = [t("filterAll"), t("shortFilms"), t("awarenessVideos"), t("interviews"), t("videoMessages")];
  
  // The API or DB likely stores Arabic categories. We'll map if needed or just use activeCategory.
  let apiCategory = activeCategory;
  if (activeCategory === t("shortFilms")) apiCategory = "أفلام قصيرة";
  if (activeCategory === t("awarenessVideos")) apiCategory = "فيديوهات توعوية";
  if (activeCategory === t("interviews")) apiCategory = "مقابلات";
  if (activeCategory === t("videoMessages")) apiCategory = "رسائل مصورة";
  
  const filteredVideos = activeCategory === t("filterAll") ? videos : videos.filter((v: any) => v.category === apiCategory);
  const featuredVideo = videos[0];

  return (
    <div className="min-h-screen bg-[var(--bg)]" dir="auto">
      <section className="relative py-24 bg-[var(--bg-deep)] border-b border-[var(--border)] overflow-hidden">
        <ShamsaPattern className="opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl text-[var(--gold)] mb-6 drop-shadow-[var(--glow-gold)]">{t("headerTitle")}</h1>
            <p className="text-[var(--muted-light)] text-lg leading-relaxed mb-10">{t("headerSubtitle")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeCategory === cat ? "bg-[var(--gold)] text-[var(--bg-deep)] shadow-[var(--glow-gold)]" : "bg-[var(--surface)] text-[var(--muted-light)] border border-[var(--border)] hover:border-[var(--gold-dim)] hover:text-[var(--white)]"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        {activeCategory === t("filterAll") && featuredVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-16 rounded-3xl overflow-hidden border border-[var(--gold-dim)] bg-[var(--surface)] relative group cursor-pointer text-start" onClick={() => setSelectedVideo(featuredVideo)}>
            <div className="aspect-video w-full relative bg-gradient-to-br from-[#0a1e34] to-[#03080f]">
              <ShamsaPattern className="opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-[var(--gold)] bg-[var(--card-glass-light)] backdrop-blur-md flex items-center justify-center text-[var(--gold)] group-hover:scale-110 group-hover:bg-[var(--gold)] group-hover:text-[var(--bg-deep)] transition-all duration-300 shadow-[var(--glow-gold)]">
                  <Play size={40} className="ms-2" fill="currentColor" />
                </div>
              </div>
              <div className="absolute top-6 end-6 flex gap-2">
                <span className="bg-[var(--gold)] text-[var(--bg-deep)] px-3 py-1 rounded-full text-sm font-bold">{t("newBadge")}</span>
                <span className="bg-[var(--card-glass-alt)] backdrop-blur-md border border-[var(--border)] text-[var(--white)] px-3 py-1 rounded-full text-sm font-bold">{featuredVideo.category}</span>
              </div>
            </div>
            <div className="p-8 bg-[linear-gradient(to_bottom,transparent,var(--surface))] absolute bottom-0 start-0 flex flex-col w-full text-start items-start">
              <h2 className="font-sans font-bold text-3xl text-[var(--white)] mb-2">{featuredVideo.title}</h2>
              <p className="text-[var(--muted-light)] text-lg mb-4 max-w-2xl">{featuredVideo.description}</p>
              <div className="flex items-center gap-6 text-[var(--muted)] text-sm font-bold">
                <span className="flex items-center gap-2"><Eye size={16} /> {featuredVideo.views?.toLocaleString()} {t("views")}</span>
                <span className="flex items-center gap-2"><Clock size={16} /> {featuredVideo.duration}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.filter((v: any) => !featuredVideo || v.id !== featuredVideo.id || activeCategory !== t("filterAll")).map((video: any, i: number) => (
            <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[var(--card-glass)] backdrop-blur-md rounded-2xl border border-[var(--border)] overflow-hidden group hover:border-[var(--gold-dim)] transition-colors cursor-pointer hover:shadow-[var(--glow-gold)] text-start" onClick={() => setSelectedVideo(video)}>
              <div className="aspect-video relative bg-gradient-to-br from-[#1a3a5c] to-[#0a1e34]">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="w-16 h-16 rounded-full border border-[var(--gold)] bg-[var(--card-glass-alt)] backdrop-blur-md flex items-center justify-center text-[var(--gold)]">
                    <Play size={24} className="ms-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-3 end-3 bg-[var(--card-glass-deep)] text-[var(--white)] text-xs px-2 py-1 rounded font-mono">{video.duration}</div>
                <div className="absolute top-3 end-3 bg-[var(--gold-dim)] border border-[var(--gold)] text-[var(--gold)] text-xs font-bold px-2 py-1 rounded-full">{video.category}</div>
              </div>
              <div className="p-6">
                <h3 className="font-sans font-bold text-xl text-[var(--white)] mb-2 group-hover:text-[var(--gold)] transition-colors">{video.title}</h3>
                <p className="text-[var(--muted)] text-sm mb-4 line-clamp-2">{video.description}</p>
                <div className="flex items-center text-[var(--muted-light)] text-xs font-bold">
                  <span className="flex items-center gap-1"><Eye size={14} /> {video.views?.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {selectedVideo && (() => {
        const ytId = extractYoutubeId(selectedVideo.youtube_id || selectedVideo.youtubeId || "");
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 text-start" dir="auto">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedVideo(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-5xl bg-[var(--surface)] border border-[var(--gold-dim)] rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col">
              <button onClick={() => setSelectedVideo(null)} className="absolute top-4 end-4 z-20 w-10 h-10 rounded-full bg-black/50 text-[var(--white)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-black transition-colors">✕</button>
              <div className="aspect-video bg-black w-full">
                {ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                    <Play size={48} className="text-[var(--gold)] opacity-50" />
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8">
                <h2 className="font-sans font-bold text-2xl text-[var(--white)] mb-2">{selectedVideo.title}</h2>
                <p className="text-[var(--muted-light)]">{selectedVideo.description}</p>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </div>
  );
}
