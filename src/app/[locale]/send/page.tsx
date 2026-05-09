"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, CheckCircle2, Share2, Upload, Download } from "lucide-react";
import confetti from "canvas-confetti";
import { LiveCounter } from "@/components/shared/LiveCounter";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { AudioPlayer } from "@/components/shared/AudioPlayer";
import { useTranslations, useLocale } from "next-intl";
import { UAE_EMIRATES } from "@/lib/constants";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { uploadAudio } from "@/lib/upload-audio";
import { toast } from "sonner";

export default function SendMessage() {
  const t = useTranslations("send");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [displayId, setDisplayId] = useState("");
  const [countries, setCountries] = useState<{ code: string; name_ar: string }[]>([]);
  const [generatingCert, setGeneratingCert] = useState(false);
  const recorder = useVoiceRecorder(60);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    nationality: `🇦🇪 ${t("uae")}`,
    country_code: "AE",
    country_name: t("uae"),
    category: "مواطن",
    phone: "",
    emirate: "",
  });

  // Fetch countries from DB
  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCountries(data);
        }
      })
      .catch(() => {});
  }, []);

  const flagMap: Record<string, string> = {
    AE: "🇦🇪", SA: "🇸🇦", EG: "🇪🇬", IN: "🇮🇳", PK: "🇵🇰", JO: "🇯🇴",
    PH: "🇵🇭", GB: "🇬🇧", US: "🇺🇸", FR: "🇫🇷", KW: "🇰🇼", BH: "🇧🇭",
    QA: "🇶🇦", OM: "🇴🇲", DE: "🇩🇪", NG: "🇳🇬", KE: "🇰🇪", AU: "🇦🇺",
    CA: "🇨🇦", TR: "🇹🇷",
  };

  const handleCountryChange = (value: string) => {
    // value format: "CODE|name_ar"
    const [code, name] = value.split("|");
    const flag = flagMap[code] || "🌍";
    setFormData({
      ...formData,
      nationality: `${flag} ${name}`,
      country_code: code,
      country_name: name,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let voice_url: string | undefined;
      if (recorder.audioBlob) {
        try {
          voice_url = await uploadAudio(recorder.audioBlob);
        } catch (uploadErr) {
          console.error("Voice upload failed:", uploadErr);
          toast.error(locale === "ar" ? "فشل رفع التسجيل الصوتي، حاول مرة أخرى" : "Failed to upload audio, please try again");
          setIsSubmitting(false);
          return;
        }
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          text: formData.message,
          nationality: formData.nationality,
          country_code: formData.country_code,
          country_name: formData.country_name,
          category: formData.category,
          phone: formData.phone,
          emirate: formData.emirate,
          ...(voice_url && { voice_url }),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      const data = await res.json();
      setDisplayId(data.message?.display_id || "");
      setIsSuccess(true);

      const colors = ['#D83731', '#3F8E50', '#CBA344', '#FFFFFF', '#000000'];
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(locale === "ar" ? "حدث خطأ أثناء الإرسال" : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownloadCertificate = async () => {
    setGeneratingCert(true);
    try {
      const { downloadCertificate } = await import("@/lib/generate-certificate");
      await downloadCertificate({ name: formData.name, displayId, locale: locale as "ar" | "en" });
    } catch {
      toast.error("Failed to generate certificate");
    } finally {
      setGeneratingCert(false);
    }
  };

  // Fallback countries if API fails
  const countryOptions = countries.length > 0
    ? countries.map((c) => ({ code: c.code, name: c.name_ar }))
    : [
        { code: "AE", name: "الإمارات" },
        { code: "SA", name: "السعودية" },
        { code: "EG", name: "مصر" },
        { code: "IN", name: "الهند" },
        { code: "PK", name: "باكستان" },
      ];

  const categoryValues = ["مواطن", "مقيم", "طالب", "جهة"] as const;
  const categoryLabels: Record<string, string> = {
    "مواطن": t("catCitizen"),
    "مقيم": t("catResident"),
    "طالب": t("catStudent"),
    "جهة": t("catOrganization"),
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 rtl:flex-row rtl:space-x-reverse ltr:flex-row text-start" dir="auto">
        <div className="w-full lg:w-[60%]">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--card-glass)] backdrop-blur-[20px] rounded-2xl border-t-4 border-[var(--gold)] border-x border-b border-[var(--border)] shadow-2xl p-6 md:p-10 relative overflow-hidden"
              >
                <ShamsaPattern className="opacity-[0.03] z-0" />
                <div className="relative z-10">
                  <h2 className="font-sans font-bold text-3xl text-[var(--white)] mb-2">{t("subtitle")}</h2>
                  <p className="text-[var(--muted-light)] mb-8">{t("subtext")}</p>

                  <form onSubmit={handleSubmit} className="space-y-6 text-start">
                    <div className="relative group">
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 pt-6 pb-2 focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors peer text-start"
                        placeholder=" "
                        dir="auto"
                      />
                      <label
                        htmlFor="name"
                        className="absolute end-4 top-4 text-[var(--muted)] transition-all peer-focus:-top-1 peer-focus:text-xs peer-focus:text-[var(--gold)] peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[var(--gold)]"
                      >
                        {t("name")}
                      </label>
                    </div>

                    <div className="relative group">
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 pt-6 pb-2 focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors peer text-start"
                        placeholder=" "
                        dir="ltr"
                        inputMode="tel"
                      />
                      <label
                        htmlFor="phone"
                        className="absolute end-4 top-4 text-[var(--muted)] transition-all peer-focus:-top-1 peer-focus:text-xs peer-focus:text-[var(--gold)] peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[var(--gold)]"
                      >
                        {t("phone")}
                      </label>
                    </div>

                    <div>
                      <label className="block text-[var(--muted)] text-sm mb-2 px-1 text-start">{t("nationality")}</label>
                      <select
                        value={`${formData.country_code}|${formData.country_name}`}
                        onChange={e => handleCountryChange(e.target.value)}
                        className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 py-3 focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors appearance-none cursor-pointer"
                        dir="auto"
                      >
                        {countryOptions.map((c) => (
                          <option key={c.code} value={`${c.code}|${c.name}`}>
                            {flagMap[c.code] || "🌍"} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[var(--muted)] text-sm mb-2 px-1 text-start">{t("emirate")}</label>
                      <select
                        value={formData.emirate}
                        onChange={e => setFormData({...formData, emirate: e.target.value})}
                        required
                        className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 py-3 focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors appearance-none cursor-pointer"
                        dir="auto"
                      >
                        <option value="" disabled>{t("selectEmirate")}</option>
                        {UAE_EMIRATES.map((e) => (
                          <option key={e.id} value={e.id}>
                            {isRtl ? e.name_ar : e.name_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[var(--muted)] text-sm mb-3 px-1 text-start">{t("category")}</label>
                      <div className="flex flex-wrap gap-3">
                        {categoryValues.map(cat => (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setFormData({...formData, category: cat})}
                            className={`px-6 py-2 rounded-full font-sans font-bold text-sm transition-all ${
                              formData.category === cat
                                ? 'bg-[var(--gold)] text-[var(--bg-deep)] shadow-[var(--glow-gold)]'
                                : 'bg-[var(--surface-2)] text-[var(--muted-light)] hover:bg-[rgba(203,163,68,0.1)] hover:text-[var(--gold)] border border-[var(--border)]'
                            }`}
                          >
                            {categoryLabels[cat]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative group pt-4">
                      <textarea
                        id="message"
                        required
                        rows={4}
                        minLength={10}
                        maxLength={500}
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 pt-6 pb-2 focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors peer resize-none font-serif leading-loose text-start"
                        placeholder=" "
                        dir="auto"
                      ></textarea>
                      <label
                        htmlFor="message"
                        className="absolute end-4 top-8 text-[var(--muted)] transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[var(--gold)] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[var(--gold)]"
                      >
                        {t("message")}
                      </label>
                      <div className="absolute start-2 bottom-2 text-xs font-mono text-[var(--muted)]">
                        {formData.message.length}/500
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border)]">
                      <label className="block text-[var(--muted)] text-sm mb-4 px-1 text-start">{t("audioOptional")}</label>
                      {recorder.error && (
                        <p className="text-[var(--red)] text-sm mb-3 px-1">{t("micPermissionDenied")}</p>
                      )}
                      {!recorder.audioUrl && !recorder.isRecording ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <button type="button" onClick={recorder.startRecording} className="w-20 h-20 rounded-full bg-[var(--surface-2)] border-2 border-[var(--gold-dim)] flex items-center justify-center text-[var(--gold)] hover:scale-105 hover:bg-[var(--gold-dim)] transition-all shadow-[var(--glow-gold)] mb-3">
                            <Mic size={32} />
                          </button>
                          <span className="text-[var(--muted)] text-sm">{t("clickToRecord")}</span>
                        </div>
                      ) : recorder.isRecording ? (
                        <div className="flex flex-col items-center justify-center py-6">
                          <button type="button" onClick={recorder.stopRecording} className="w-20 h-20 rounded-full bg-[var(--red-dim)] border-2 border-[var(--red)] flex items-center justify-center text-[var(--red)] hover:scale-105 transition-all shadow-[var(--glow-red)] animate-pulse mb-4 relative">
                            <div className="w-8 h-8 bg-[var(--red)] rounded-sm"></div>
                          </button>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-[var(--red)] font-bold">{formatTime(recorder.recordingTime)}</span>
                          </div>
                        </div>
                      ) : recorder.audioUrl ? (
                        <div className="py-4 flex items-center justify-between bg-[var(--surface-2)] px-4 rounded-xl border border-[var(--border)]">
                          <AudioPlayer src={recorder.audioUrl} className="flex-1 bg-transparent border-none px-0" />
                          <button type="button" onClick={recorder.deleteRecording} className="text-[var(--red-light)] text-sm font-bold mx-4 hover:underline">{tCommon("delete")}</button>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.message || !formData.phone || !formData.emirate}
                      className="w-full h-14 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-lg shadow-[var(--glow-gold)] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[var(--bg-deep)] border-t-transparent rounded-full animate-spin"></div>
                          {t("submittingText")}
                        </>
                      ) : (
                        t("submitButton")
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--card-glass)] backdrop-blur-[20px] rounded-2xl border border-[var(--gold-dim)] shadow-[var(--glow-gold)] p-8 md:p-12 text-center relative overflow-hidden"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--green-dim)] flex items-center justify-center relative">
                  <svg className="w-12 h-12 text-[var(--green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div className="absolute inset-0 border-2 border-[var(--green)] rounded-full animate-ping opacity-20"></div>
                </div>

                <h2 className="font-sans font-black text-3xl text-[var(--gold)] mb-2">{t("successTitle")}</h2>
                <p className="text-[var(--white)] text-lg mb-8">{t("successText", { name: formData.name })}</p>

                {displayId && (
                  <div className="bg-[var(--surface-2)] border border-[var(--gold-dim)] rounded-xl p-6 mb-8 inline-block shadow-inner mx-auto">
                    <p className="text-[var(--muted-light)] text-sm mb-1">{t("docNumber")}</p>
                    <p className="font-mono font-bold text-2xl text-[var(--gold)]">#{displayId}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={generatingCert}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-bold disabled:opacity-50"
                  >
                    <Download size={18} />
                    {generatingCert ? t("generatingCertificate") : t("downloadCertificate")}
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--surface-2)] border border-[var(--gold)] text-[var(--gold)] font-bold hover:bg-[var(--gold-dim)] transition-colors">
                    <Share2 size={18} />
                    {t("shareCard")}
                  </button>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({...formData, message: "", phone: "", emirate: ""});
                      recorder.deleteRecording();
                      setDisplayId("");
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-light)] font-bold hover:bg-[var(--surface)] transition-colors"
                  >
                    {t("sendAnother")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-[40%] flex flex-col gap-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center shadow-lg">
            <h3 className="font-sans text-[var(--muted-light)] text-sm font-bold mb-4 uppercase tracking-wider">{t("liveCounter")}</h3>
            <LiveCounter compact />
          </div>

          <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--gold-dim)] rounded-2xl p-8 relative overflow-hidden flex-1">
            <ShamsaPattern className="opacity-5 absolute inset-0 z-0" />
            <div className="relative z-10 text-start">
              <h3 className="font-sans font-bold text-2xl text-[var(--white)] mb-6 border-b border-[var(--border)] pb-4">{t("whyImportant")}</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--gold-dim)] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="text-[var(--gold)]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[var(--white)] mb-1">{t("reason1Title")}</h4>
                    <p className="text-[var(--muted-light)] text-sm leading-relaxed">{t("reason1Text")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--gold-dim)] flex items-center justify-center shrink-0 mt-1">
                    <Upload className="text-[var(--gold)]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[var(--white)] mb-1">{t("reason2Title")}</h4>
                    <p className="text-[var(--muted-light)] text-sm leading-relaxed">{t("reason2Text")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--gold-dim)] flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-5 h-5 text-[var(--gold)]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[var(--white)] mb-1">{t("reason3Title")}</h4>
                    <p className="text-[var(--muted-light)] text-sm leading-relaxed">{t("reason3Text")}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
