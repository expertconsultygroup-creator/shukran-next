"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, CheckCircle2, Upload, Download, Phone, Check, AlertCircle, ChevronDown, MessageSquareText, AudioLines, Award, X } from "lucide-react";
import confetti from "canvas-confetti";
import { LiveCounter } from "@/components/shared/LiveCounter";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { AudioPlayer } from "@/components/shared/AudioPlayer";
import { OrgPicker } from "@/components/shared/OrgPicker";
import { useTranslations, useLocale } from "next-intl";
import { UAE_EMIRATES } from "@/lib/constants";
import { ORG_CATEGORIES } from "@/data/organizations";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { uploadAudio } from "@/lib/upload-audio";
import { toast } from "sonner";

export default function SendMessage() {
  const t = useTranslations("send");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [displayId, setDisplayId] = useState("");
  const [successName, setSuccessName] = useState("");
  const [generatingCert, setGeneratingCert] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [messageType, setMessageType] = useState<"text" | "voice" | "both">("text");
  const recorder = useVoiceRecorder(60);

  // UAE mobile: 05X XXXXXXX (10 digits) | UAE landline: 0[234679] XXXXXXX (9 digits)
  // Accepts local part only (without +971) since prefix is shown in UI
  const isValidUAELocal = (phone: string): boolean => {
    const digits = phone.replace(/[\s\-()]/g, "");
    // Mobile: 05X followed by 7 digits = 10 digits total
    if (/^0?5[0-9]\d{7}$/.test(digits)) return true;
    // Landline: 0[234679] followed by 7 digits = 9 digits total
    if (/^0?[234679]\d{7}$/.test(digits)) return true;
    return false;
  };

  // Normalize to +971 format for API
  const normalizePhone = (phone: string): string => {
    const digits = phone.replace(/[\s\-()]/g, "").replace(/^0/, "");
    return `+971${digits}`;
  };

  // Auto-format phone input: strip leading 0 (since +971 is shown), add spaces
  const formatUAEPhone = (input: string): string => {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits.startsWith("5")) {
      // Mobile: 5X XXX XXXX (9 digits)
      digits = digits.slice(0, 9);
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    } else if (digits.length > 0) {
      // Landline: X XXX XXXX (8 digits)
      digits = digits.slice(0, 8);
      if (digits.length <= 1) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
      return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
    }
    return "";
  };
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    category: "مواطن",
    phone: "",
    emirate: "",
    senderType: "individual" as "individual" | "organization",
    organizationCategory: "",
    organizationName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);

    if (!isValidUAELocal(formData.phone)) {
      setPhoneError(t("invalidPhone"));
      return;
    }

    // Validate at least one content type is provided
    const hasText = formData.message.trim().length > 0;
    const hasVoice = !!recorder.audioBlob;
    if (!hasText && !hasVoice) {
      toast.error(t("needTextOrVoice"));
      return;
    }

    setIsSubmitting(true);
    setPhoneError("");

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
          ...(formData.message.trim() && { text: formData.message.trim() }),
          nationality: `🇦🇪 ${t("uae")}`,
          country_code: "AE",
          country_name: t("uae"),
          category: formData.category,
          phone: normalizePhone(formData.phone),
          emirate: formData.emirate,
          sender_type: formData.senderType,
          ...(formData.senderType === "organization" && {
            organization_name: formData.organizationName,
            organization_category: formData.organizationCategory,
          }),
          ...(voice_url && { voice_url }),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 409 && errorData?.error === "DUPLICATE_PHONE") {
          setPhoneError(t("duplicatePhone"));
          setIsSubmitting(false);
          return;
        }
        throw new Error("Failed to submit");
      }

      const data = await res.json();
      setDisplayId(data.message?.display_id || "");
      setSuccessName(formData.name);
      setShowSuccessPopup(true);

      const colors = ['#D83731', '#3F8E50', '#CBA344', '#FFFFFF', '#000000'];
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors });
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.4, x: 0.3 }, colors }), 400);
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.4, x: 0.7 }, colors }), 600);
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
      await downloadCertificate({ name: successName, displayId, locale: locale as "ar" | "en" });
    } catch {
      toast.error("Failed to generate certificate");
    } finally {
      setGeneratingCert(false);
    }
  };

  const categoryValues = ["مواطن", "مقيم"] as const;
  const categoryLabels: Record<string, string> = {
    "مواطن": t("catCitizen"),
    "مقيم": t("catResident"),
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-24 flex-1">
        {/* Mobile live counter - compact inline strip */}
        <div className="lg:hidden mb-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between shadow-md">
            <h3 className="font-sans text-[var(--muted-light)] text-xs font-bold uppercase tracking-wider">{t("liveCounter")}</h3>
            <LiveCounter compact />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-12 text-start" dir="auto">
          <div className="w-full lg:w-[60%]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[var(--card-glass)] backdrop-blur-[20px] rounded-2xl border-t-4 border-[var(--gold)] border-x border-b border-[var(--border)] shadow-2xl p-4 sm:p-6 md:p-10 relative overflow-hidden"
                >
                  <ShamsaPattern className="opacity-[0.03] z-0" />
                  <div className="relative z-10">
                    <h2 className="font-sans font-bold text-xl sm:text-2xl md:text-3xl text-[var(--white)] mb-1 sm:mb-2">{t("subtitle")}</h2>
                    <p className="text-[var(--muted-light)] text-sm sm:text-base mb-5 sm:mb-8">{t("subtext")}</p>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 text-start">
                      <div className="relative group">
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 pt-6 pb-2 rounded-lg focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors peer text-start"
                          placeholder=" "
                          dir="auto"
                        />
                        <label
                          htmlFor="name"
                          className="absolute start-4 top-4 text-[var(--muted)] transition-all peer-focus:-top-1 peer-focus:text-xs peer-focus:text-[var(--gold)] peer-[:not(:placeholder-shown)]:-top-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[var(--gold)]"
                        >
                          {t("name")}
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-[var(--muted)] text-sm px-1 text-start">
                          {t("phone")}
                        </label>
                        <div
                          className={`flex items-center rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                            phoneError
                              ? "border-[var(--red)] shadow-[0_0_12px_rgba(216,55,49,0.15)]"
                              : phoneTouched && formData.phone && isValidUAELocal(formData.phone)
                              ? "border-[var(--green)] shadow-[0_0_12px_rgba(63,142,80,0.15)]"
                              : "border-[var(--border)] focus-within:border-[var(--gold)] focus-within:shadow-[0_0_12px_rgba(203,163,68,0.15)]"
                          }`}
                        >
                          {/* UAE prefix badge */}
                          <div className="flex items-center gap-2 bg-[var(--surface-2)] px-3 sm:px-4 py-3 sm:py-3.5 border-e border-[var(--border)] select-none shrink-0">
                            <span className="text-lg sm:text-xl leading-none">🇦🇪</span>
                            <span className="text-[var(--white)] font-mono font-bold text-sm sm:text-base">+971</span>
                          </div>

                          {/* Phone input */}
                          <input
                            type="tel"
                            id="phone"
                            required
                            value={formData.phone}
                            onChange={e => {
                              const formatted = formatUAEPhone(e.target.value);
                              setFormData({...formData, phone: formatted});
                              if (phoneError) setPhoneError("");
                            }}
                            onBlur={() => {
                              setPhoneTouched(true);
                              if (formData.phone && !isValidUAELocal(formData.phone)) {
                                setPhoneError(t("invalidPhone"));
                              } else {
                                setPhoneError("");
                              }
                            }}
                            className="flex-1 min-w-0 bg-[var(--input-glass)] text-[var(--text-on-input)] px-3 sm:px-4 py-3 sm:py-3.5 text-base sm:text-lg font-mono tracking-wider focus:ring-0 focus:outline-none placeholder:text-[var(--muted)] placeholder:font-sans placeholder:text-sm placeholder:tracking-normal"
                            placeholder="5X XXX XXXX"
                            dir="ltr"
                            inputMode="tel"
                            maxLength={12}
                          />

                          {/* Status icon */}
                          <div className="px-3 shrink-0">
                            {phoneError ? (
                              <AlertCircle className="w-5 h-5 text-[var(--red)]" />
                            ) : phoneTouched && formData.phone && isValidUAELocal(formData.phone) ? (
                              <div className="w-5 h-5 rounded-full bg-[var(--green)] flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            ) : (
                              <Phone className="w-5 h-5 text-[var(--muted)]" />
                            )}
                          </div>
                        </div>

                        {/* Feedback row */}
                        {phoneError ? (
                          <p className="text-[var(--red)] text-sm px-1 font-bold flex items-center gap-1.5">
                            {phoneError}
                          </p>
                        ) : (
                          <div className="flex items-center gap-3 px-1 text-xs text-[var(--muted)]">
                            <span>{isRtl ? "جوال" : "Mobile"}: 5X XXX XXXX</span>
                            <span className="text-[var(--border)]">|</span>
                            <span>{isRtl ? "ثابت" : "Landline"}: X XXX XXXX</span>
                          </div>
                        )}
                      </div>

                      {/* Identity: Individual vs Organization */}
                      <div>
                        <label className="block text-[var(--muted)] text-sm mb-2 px-1 text-start">{t("identityLabel")}</label>
                        <div className="flex gap-2 sm:gap-3">
                          {(["individual", "organization"] as const).map(type => (
                            <button
                              type="button"
                              key={type}
                              onClick={() => setFormData({...formData, senderType: type})}
                              className={`flex-1 px-4 sm:px-6 py-2.5 rounded-full font-sans font-bold text-sm transition-all ${
                                formData.senderType === type
                                  ? 'bg-[var(--gold)] text-[var(--bg-deep)] shadow-[var(--glow-gold)]'
                                  : 'bg-[var(--surface-2)] text-[var(--muted-light)] hover:bg-[rgba(203,163,68,0.1)] hover:text-[var(--gold)] border border-[var(--border)]'
                              }`}
                            >
                              {type === "individual" ? t("identityIndividual") : t("identityOrganization")}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Organization picker - shown when organization */}
                      {formData.senderType === "organization" && (
                        <div className="grid grid-cols-1 gap-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--gold-dim)]">
                          <div>
                            <label className="block text-[var(--muted)] text-sm mb-2 px-1 text-start">{t("orgCategoryLabel")}</label>
                            <div className="relative">
                              <select
                                value={formData.organizationCategory}
                                onChange={e => setFormData({...formData, organizationCategory: e.target.value, organizationName: ""})}
                                className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 py-3 pe-10 rounded-lg focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors appearance-none cursor-pointer"
                                dir="auto"
                              >
                                <option value="" disabled>{t("selectOrgCategory")}</option>
                                {ORG_CATEGORIES.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {isRtl ? c.name_ar : c.name_en}
                                  </option>
                                ))}
                                <option value="other">{t("orgCategoryOther")}</option>
                              </select>
                              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] pointer-events-none" />
                            </div>
                          </div>
                          {formData.organizationCategory === "other" ? (
                            <div>
                              <label className="block text-[var(--muted)] text-sm mb-2 px-1 text-start">{t("orgNameLabel")}</label>
                              <input
                                type="text"
                                value={formData.organizationName}
                                onChange={e => setFormData({...formData, organizationName: e.target.value})}
                                maxLength={200}
                                placeholder={t("orgCustomPlaceholder")}
                                className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 py-3 rounded-lg focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors text-start"
                                dir="auto"
                              />
                            </div>
                          ) : formData.organizationCategory && (
                            <div>
                              <label className="block text-[var(--muted)] text-sm mb-2 px-1 text-start">{t("orgNameLabel")}</label>
                              <OrgPicker
                                key={formData.organizationCategory}
                                category={formData.organizationCategory}
                                value={formData.organizationName}
                                onChange={(name) => setFormData({...formData, organizationName: name})}
                                placeholder={t("orgSearchPlaceholder")}
                                emptyText={t("orgNoResults")}
                                otherLabel={t("orgOtherOption")}
                                customPlaceholder={t("orgCustomPlaceholder")}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Emirate & Category side by side on mobile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[var(--muted)] text-sm mb-2 px-1 text-start">{t("emirate")}</label>
                          <div className="relative">
                            <select
                              value={formData.emirate}
                              onChange={e => setFormData({...formData, emirate: e.target.value})}
                              required
                              className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 py-3 pe-10 rounded-lg focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors appearance-none cursor-pointer"
                              dir="auto"
                            >
                              <option value="" disabled>{t("selectEmirate")}</option>
                              {UAE_EMIRATES.map((e) => (
                                <option key={e.id} value={e.id}>
                                  {isRtl ? e.name_ar : e.name_en}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[var(--muted)] text-sm mb-2 px-1 text-start">{t("category")}</label>
                          <div className="flex gap-2 sm:gap-3">
                            {categoryValues.map(cat => (
                              <button
                                type="button"
                                key={cat}
                                onClick={() => setFormData({...formData, category: cat})}
                                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-2 rounded-full font-sans font-bold text-sm transition-all ${
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
                      </div>

                      {/* Message Type Selector */}
                      <div className="pt-2 sm:pt-4">
                        <label className="block text-[var(--muted)] text-sm mb-3 px-1 text-start">{t("messageTypeLabel")}</label>
                        <div className="flex gap-2 sm:gap-3">
                          {(["text", "voice", "both"] as const).map(type => (
                            <button
                              type="button"
                              key={type}
                              onClick={() => setMessageType(type)}
                              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl font-sans font-bold text-xs sm:text-sm transition-all ${
                                messageType === type
                                  ? 'bg-[var(--gold)] text-[var(--bg-deep)] shadow-[var(--glow-gold)]'
                                  : 'bg-[var(--surface-2)] text-[var(--muted-light)] hover:bg-[rgba(203,163,68,0.1)] hover:text-[var(--gold)] border border-[var(--border)]'
                              }`}
                            >
                              {type === "text" && <MessageSquareText className="w-4 h-4" />}
                              {type === "voice" && <AudioLines className="w-4 h-4" />}
                              {type === "both" && <><MessageSquareText className="w-3.5 h-3.5" /><span>+</span><AudioLines className="w-3.5 h-3.5" /></>}
                              {t(`msgType_${type}`)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text Message - shown for "text" and "both" */}
                      {(messageType === "text" || messageType === "both") && (
                        <div className="relative group pt-2 sm:pt-4">
                          <textarea
                            id="message"
                            rows={3}
                            maxLength={500}
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            className="w-full bg-[var(--input-glass)] border-none border-b-2 border-[var(--border)] text-[var(--text-on-input)] px-4 pt-6 pb-2 rounded-lg focus:ring-0 focus:outline-none focus:border-[var(--gold)] transition-colors peer resize-none font-serif leading-loose text-start"
                            placeholder=" "
                            dir="auto"
                          ></textarea>
                          <label
                            htmlFor="message"
                            className="absolute start-4 top-6 sm:top-8 text-[var(--muted)] transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[var(--gold)] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[var(--gold)]"
                          >
                            {t("message")}
                          </label>
                          <div className="absolute start-2 bottom-2 text-xs font-mono text-[var(--muted)]">
                            {formData.message.length}/500
                          </div>
                        </div>
                      )}

                      {/* Voice Recording - shown for "voice" and "both" */}
                      {(messageType === "voice" || messageType === "both") && (
                        <div className="pt-3 sm:pt-4 border-t border-[var(--border)]">
                          <label className="block text-[var(--muted)] text-sm mb-3 sm:mb-4 px-1 text-start">{t("voiceMessage")}</label>
                          {recorder.error && (
                            <p className="text-[var(--red)] text-sm mb-3 px-1">{t("micPermissionDenied")}</p>
                          )}
                          {!recorder.audioUrl && !recorder.isRecording ? (
                            <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                              <button type="button" onClick={recorder.startRecording} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--surface-2)] border-2 border-[var(--gold-dim)] flex items-center justify-center text-[var(--gold)] hover:scale-105 hover:bg-[var(--gold-dim)] transition-all shadow-[var(--glow-gold)] mb-2 sm:mb-3">
                                <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
                              </button>
                              <span className="text-[var(--muted)] text-xs sm:text-sm">{t("clickToRecord")}</span>
                            </div>
                          ) : recorder.isRecording ? (
                            <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                              <button type="button" onClick={recorder.stopRecording} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--red-dim)] border-2 border-[var(--red)] flex items-center justify-center text-[var(--red)] hover:scale-105 transition-all shadow-[var(--glow-red)] animate-pulse mb-3 sm:mb-4 relative">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[var(--red)] rounded-sm"></div>
                              </button>
                              <div className="flex items-center gap-4">
                                <span className="font-mono text-[var(--red)] font-bold">{formatTime(recorder.recordingTime)}</span>
                              </div>
                            </div>
                          ) : recorder.audioUrl ? (
                            <div className="py-3 sm:py-4 flex items-center justify-between bg-[var(--surface-2)] px-3 sm:px-4 rounded-xl border border-[var(--border)]">
                              <AudioPlayer src={recorder.audioUrl} className="flex-1 bg-transparent border-none px-0" />
                              <button type="button" onClick={recorder.deleteRecording} className="text-[var(--red-light)] text-sm font-bold mx-2 sm:mx-4 hover:underline whitespace-nowrap">{tCommon("delete")}</button>
                            </div>
                          ) : null}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.name || !formData.phone || !formData.emirate || !isValidUAELocal(formData.phone) || (formData.senderType === "organization" && !formData.organizationName) || (messageType === "text" && !formData.message.trim()) || (messageType === "voice" && !recorder.audioBlob) || (messageType === "both" && !formData.message.trim() && !recorder.audioBlob)}
                        className="w-full h-12 sm:h-14 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-base sm:text-lg shadow-[var(--glow-gold)] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2 sm:mt-4"
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
          </div>

          {/* Desktop sidebar - hidden on mobile (counter shown above instead) */}
          <div className="hidden lg:flex w-full lg:w-[40%] flex-col gap-6">
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

      {/* ─── Success Popup Modal ─── */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowSuccessPopup(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gradient-to-b from-[var(--surface)] to-[var(--bg-deep)] border border-[var(--gold-dim)] rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Gold top accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-[var(--gold)]" />

              {/* Decorative shimmer */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <ShamsaPattern className="opacity-100" />
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="absolute top-4 end-4 z-10 w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--white)] hover:bg-[var(--surface)] transition-colors"
              >
                <X size={16} />
              </button>

              <div className="relative z-10 p-6 sm:p-8 text-center">
                {/* Success icon with animation */}
                <div className="relative mx-auto w-20 h-20 mb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                    className="w-full h-full rounded-full bg-gradient-to-br from-[var(--green)] to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  >
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 1.2, delay: 0.3, repeat: 2 }}
                    className="absolute inset-0 rounded-full border-2 border-[var(--green)]"
                  />
                </div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-sans font-black text-2xl sm:text-3xl text-[var(--gold)] mb-2"
                >
                  {t("popupTitle")}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[var(--muted-light)] text-sm sm:text-base mb-5 leading-relaxed"
                >
                  {t("popupSubtitle", { name: successName })}
                </motion.p>

                {/* Document Number */}
                {displayId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[var(--surface-2)] border border-[var(--gold-dim)] rounded-2xl p-4 mb-5 shadow-inner"
                  >
                    <p className="text-[var(--muted)] text-xs uppercase tracking-wider mb-1">{t("docNumber")}</p>
                    <p className="font-mono font-black text-2xl text-[var(--gold)] tracking-wider">#{displayId}</p>
                  </motion.div>
                )}

                {/* Certificate section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-[var(--gold-dim)] to-transparent border border-[var(--gold-dim)] rounded-2xl p-4 mb-5"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Award className="text-[var(--gold)]" size={20} />
                    <span className="text-[var(--gold)] font-bold text-sm">{t("popupCertReady")}</span>
                  </div>
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={generatingCert}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-base shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  >
                    {generatingCert ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[var(--bg-deep)] border-t-transparent rounded-full animate-spin" />
                        {t("generatingCertificate")}
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        {t("popupDownloadNow")}
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => setShowSuccessPopup(false)}
                  className="text-[var(--muted)] hover:text-[var(--white)] text-sm font-bold transition-colors"
                >
                  {t("popupClose")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
