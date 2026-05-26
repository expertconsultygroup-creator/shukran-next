"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search, Phone, Download, User, MessageSquare, Hash,
  MapPin, Tag, Calendar, AlertCircle, Printer,
} from "lucide-react";
import { toast } from "sonner";

interface MessageData {
  id: string;
  name: string;
  text: string;
  phone: string;
  emirate: string;
  category: string;
  display_id: string;
  created_at: string;
  voice_url: string | null;
  status: string;
}

export default function AdminCertificatePage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<MessageData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);

  const formatPhoneInput = (input: string): string => {
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("00971")) digits = digits.slice(5);
    else if (digits.startsWith("971")) digits = digits.slice(3);
    if (digits.startsWith("0")) digits = digits.slice(1);

    if (digits.startsWith("5")) {
      digits = digits.slice(0, 9);
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
      return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    } else if (digits.length > 0) {
      digits = digits.slice(0, 8);
      if (digits.length <= 1) return digits;
      if (digits.length <= 4) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
      return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
    }
    return "";
  };

  const handleSearch = async () => {
    const digits = phone.replace(/\s/g, "");
    if (!digits || digits.length < 7) {
      toast.error(isRtl ? "أدخل رقم هاتف صحيح" : "Enter a valid phone number");
      return;
    }

    setSearching(true);
    setNotFound(false);
    setMessage(null);

    try {
      const normalizedPhone = `+971${digits}`;
      const res = await fetch(`/api/admin/certificate?phone=${encodeURIComponent(normalizedPhone)}`);

      if (res.status === 404) {
        setNotFound(true);
        return;
      }

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setMessage(data.message);
    } catch {
      toast.error(t("errorOccurred"));
    } finally {
      setSearching(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!message) return;
    setGeneratingCert(true);
    try {
      const { downloadCertificate } = await import("@/lib/generate-certificate");
      await downloadCertificate({
        name: message.name,
        displayId: message.display_id,
        locale: locale as "ar" | "en",
      });
      toast.success(isRtl ? "تم تحميل الشهادة" : "Certificate downloaded");
    } catch {
      toast.error(isRtl ? "فشل إنشاء الشهادة" : "Failed to generate certificate");
    } finally {
      setGeneratingCert(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-[var(--green)] bg-[var(--green-dim)]";
      case "pending": return "text-amber-400 bg-amber-400/10";
      case "rejected": return "text-[var(--red)] bg-[var(--red-dim)]";
      default: return "text-[var(--muted)] bg-[var(--surface-2)]";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--white)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--gold-dim)] flex items-center justify-center">
            <Printer className="text-[var(--gold)]" size={20} />
          </div>
          {t("certPageTitle")}
        </h1>
        <p className="text-[var(--muted-light)] mt-2 text-sm">{t("certPageDesc")}</p>
      </div>

      {/* Search Box */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
        <label className="block text-[var(--muted-light)] text-sm font-bold mb-3">
          {t("phone")}
        </label>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center rounded-xl overflow-hidden border-2 border-[var(--border)] focus-within:border-[var(--gold)] transition-colors">
            <div className="flex items-center gap-2 bg-[var(--surface-2)] px-3 sm:px-4 py-3 border-e border-[var(--border)] select-none shrink-0">
              <span className="text-lg leading-none">🇦🇪</span>
              <span className="text-[var(--white)] font-mono font-bold text-sm">+971</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="5X XXX XXXX"
              dir="ltr"
              inputMode="tel"
              maxLength={12}
              className="flex-1 min-w-0 bg-[var(--surface-2)] text-[var(--white)] px-3 sm:px-4 py-3 text-base font-mono tracking-wider focus:ring-0 focus:outline-none placeholder:text-[var(--muted)] placeholder:font-sans placeholder:text-sm"
            />
            <div className="px-3">
              <Phone className="w-5 h-5 text-[var(--muted)]" />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !phone.replace(/\s/g, "")}
            className="px-5 sm:px-6 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {searching ? (
              <div className="w-5 h-5 border-2 border-[var(--bg-deep)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={18} />
            )}
            <span className="hidden sm:inline">{searching ? t("searching") : t("searchByPhone")}</span>
          </button>
        </div>
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="bg-[var(--red-dim)] border border-[var(--red)]/20 rounded-2xl p-6 text-center">
          <AlertCircle className="mx-auto text-[var(--red)] mb-3" size={40} />
          <p className="text-[var(--red-light)] font-bold text-lg">{t("noUserFound")}</p>
        </div>
      )}

      {/* User Found - Message Details */}
      {message && (
        <div className="bg-[var(--surface)] border border-[var(--gold-dim)] rounded-2xl overflow-hidden shadow-lg">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[var(--gold-dim)] to-transparent border-b border-[var(--border)] px-5 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--gold)] text-[var(--bg-deep)] flex items-center justify-center font-bold text-lg">
                {message.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-[var(--white)] font-bold text-lg">{message.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(message.status)}`}>
                  {t(message.status as "pending" | "approved" | "rejected")}
                </span>
              </div>
            </div>
            <div className="bg-[var(--surface-2)] border border-[var(--gold-dim)] rounded-lg px-3 py-1.5 text-center">
              <p className="text-[var(--muted)] text-[10px] uppercase tracking-wider">{t("certDocNumber")}</p>
              <p className="font-mono font-bold text-[var(--gold)] text-sm">#{message.display_id}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<User size={16} />} label={t("certName")} value={message.name} />
              <InfoRow icon={<Phone size={16} />} label={t("phone")} value={message.phone} dir="ltr" />
              <InfoRow icon={<MapPin size={16} />} label={t("certEmirate")} value={message.emirate} />
              <InfoRow icon={<Tag size={16} />} label={t("certCategory")} value={message.category} />
              <InfoRow icon={<Hash size={16} />} label={t("certDocNumber")} value={`#${message.display_id}`} />
              <InfoRow icon={<Calendar size={16} />} label={t("certDate")} value={new Date(message.created_at).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-AE")} />
            </div>

            {/* Message text */}
            {message.text && (
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-[var(--gold)]" />
                  <span className="text-[var(--muted)] text-xs font-bold uppercase">{t("certMessage")}</span>
                </div>
                <p className="text-[var(--white)] text-sm leading-relaxed" dir="auto">{message.text}</p>
              </div>
            )}

            {/* Download button */}
            <button
              onClick={handleDownloadCertificate}
              disabled={generatingCert}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-base shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-2"
            >
              {generatingCert ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--bg-deep)] border-t-transparent rounded-full animate-spin" />
                  {t("printing")}
                </>
              ) : (
                <>
                  <Download size={18} />
                  {t("printAndDownload")}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, dir }: { icon: React.ReactNode; label: string; value: string; dir?: string }) {
  return (
    <div className="flex items-start gap-3 bg-[var(--surface-2)] rounded-xl px-4 py-3">
      <div className="text-[var(--gold)] mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[var(--muted)] text-[11px] uppercase tracking-wider font-bold">{label}</p>
        <p className="text-[var(--white)] text-sm font-bold truncate" dir={dir}>{value}</p>
      </div>
    </div>
  );
}
