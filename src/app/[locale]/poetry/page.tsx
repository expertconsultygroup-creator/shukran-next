"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Upload, Play } from "lucide-react";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { AudioPlayer } from "@/components/shared/AudioPlayer";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

export default function Poetry() {
  const t = useTranslations("poetry");
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const [poems, setPoems] = useState<any[]>([]);
  const [expandedPoem, setExpandedPoem] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", poet: "", text: "" });

  async function handleSubmitPoem(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/poetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to submit poem");
      
      toast.success(isRtl ? "تم إرسال القصيدة للمراجعة بنجاح" : "Poem successfully submitted for review!");
      setIsSubmitModalOpen(false);
      setFormData({ title: "", poet: "", text: "" });
    } catch (err) {
      toast.error(isRtl ? "حدث خطأ أثناء الإرسال" : "An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    fetch("/api/poetry").then(r => r.json()).then(setPoems).catch(() => {});
  }, []);

  const featured = poems.find((p: any) => p.featured) || poems[0];
  const rest = poems.filter((p: any) => featured && p.id !== featured.id);

  if (!featured) return <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center"><div className="w-12 h-12 border-4 border-t-[var(--gold)] rounded-full animate-spin" style={{ borderColor: 'var(--surface-2)', borderTopColor: 'var(--gold)' }}></div></div>;

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 relative" dir="auto">
      <ShamsaPattern className="opacity-[0.03] fixed inset-0 pointer-events-none" />
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-sans font-black text-3xl sm:text-5xl text-[var(--gold)] drop-shadow-[var(--glow-gold)] mb-4">{t("headerTitle")}</h1>
            <p className="text-[var(--muted-light)] text-lg">{t("headerSubtitle")}</p>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative bg-[var(--card-glass)] backdrop-blur-xl border border-[var(--gold)] p-8 md:p-16 rounded-2xl shadow-[var(--glow-gold)] text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-[var(--gold-dim)] text-[var(--gold)] font-bold text-sm mb-6 border border-[var(--gold)]">{t("poemOfDay")}</span>
            <h2 className="font-sans font-bold text-3xl text-[var(--white)] mb-2">{featured.title}</h2>
            <p className="text-[var(--gold-light)] font-sans mb-10 text-lg">{t("poetLabel")} {featured.poet}</p>
            <div className="font-serif text-[16px] sm:text-[20px] md:text-[22px] leading-[2.4] sm:leading-[2.6] text-[var(--white)] whitespace-pre-wrap px-2 sm:px-4 md:px-12 mx-auto inline-block text-center mb-12">{featured.text}</div>
            {featured.audio_url && (
              <div className="flex justify-center max-w-sm mx-auto"><AudioPlayer duration="1:45" className="w-full" /></div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-5xl text-start">
        <h3 className="font-sans font-bold text-2xl text-[var(--white)] mb-8 border-s-4 border-[var(--gold)] ps-4">{t("anthologyTitle")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rest.map((poem: any, i: number) => (
            <motion.div key={poem.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[var(--card-glass-alt)] backdrop-blur-md border border-[var(--border)] rounded-2xl overflow-hidden relative group">
              <div className="h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-sans font-bold text-xl text-[var(--white)]">{poem.title}</h4>
                    <p className="text-[var(--muted)] text-sm">{t("poetLabel")} {poem.poet}</p>
                  </div>
                  {poem.audio_url && <span className="bg-[var(--surface-2)] p-2 rounded-full text-[var(--gold)]"><Play className="w-4 h-4 ms-0.5" fill="currentColor" /></span>}
                </div>
                <div className="font-serif text-[var(--muted-light)] leading-[2.2] text-lg italic opacity-80 mb-6">{poem.text.split('\n').slice(0, 2).join('\n')}...</div>
                <button onClick={() => setExpandedPoem(poem.id)} className="text-[var(--gold)] font-bold text-sm hover:underline">{t("readFull")} {isRtl ? '←' : '→'}</button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <button onClick={() => setIsSubmitModalOpen(true)} className="fixed bottom-8 end-8 z-40 bg-[var(--gold)] text-[var(--bg-deep)] px-6 py-4 rounded-full font-sans font-bold text-lg shadow-[var(--glow-gold)] hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
        <Plus size={24} /> {t("addPoem")}
      </button>

      <AnimatePresence>
        {expandedPoem && (() => {
          const p = poems.find((p: any) => p.id === expandedPoem);
          if (!p) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setExpandedPoem(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[var(--bg-deep)] border border-[var(--gold)] rounded-2xl p-8 md:p-12 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-[var(--glow-gold)]">
                <button onClick={() => setExpandedPoem(null)} className="absolute top-4 end-4 p-2 text-[var(--muted)] hover:text-[var(--white)] rounded-full bg-[var(--surface)]"><X size={24}/></button>
                <div className="text-center">
                  <h2 className="font-sans font-bold text-3xl text-[var(--gold)] mb-2">{p.title}</h2>
                  <p className="text-[var(--muted-light)] mb-10">{t("poetLabel")} {p.poet}</p>
                  <div className="font-serif text-xl leading-[2.6] text-[var(--white)] whitespace-pre-wrap inline-block text-center mb-10">{p.text}</div>
                  {p.audio_url && <div className="mt-8 border-t border-[var(--border)] pt-8 max-w-sm mx-auto"><AudioPlayer duration="2:10" /></div>}
                </div>
              </motion.div>
            </div>
          );
        })()}

        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-start" dir="auto">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSubmitModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative bg-[var(--surface)] border border-[var(--gold-dim)] rounded-2xl p-6 md:p-10 w-full max-w-2xl shadow-2xl">
              <button onClick={() => setIsSubmitModalOpen(false)} className="absolute top-4 end-4 p-2 text-[var(--muted)] hover:text-[var(--white)]"><X size={24}/></button>
              <h2 className="font-sans font-bold text-2xl text-[var(--white)] mb-6">{t("sharePoemTitle")}</h2>
              <form className="space-y-5" onSubmit={handleSubmitPoem}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-[var(--muted)] text-sm mb-2">{t("nameLabel")}</label><input type="text" className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--white)] px-4 py-3 focus:outline-none focus:border-[var(--gold)] text-start" required value={formData.poet} onChange={e => setFormData({ ...formData, poet: e.target.value })} /></div>
                  <div><label className="block text-[var(--muted)] text-sm mb-2">{t("poemTitleLabel")}</label><input type="text" className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--white)] px-4 py-3 focus:outline-none focus:border-[var(--gold)] text-start" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                </div>
                <div><label className="block text-[var(--muted)] text-sm mb-2">{t("poemTextLabel")}</label><textarea rows={8} className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--white)] px-4 py-3 focus:outline-none focus:border-[var(--gold)] font-serif resize-none leading-loose text-center" placeholder={t("poemPlaceholder")} required value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })}></textarea></div>
                <button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl bg-[var(--gold)] text-[var(--bg-deep)] font-sans font-bold text-lg mt-6 hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? "..." : t("submitPoem")}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

