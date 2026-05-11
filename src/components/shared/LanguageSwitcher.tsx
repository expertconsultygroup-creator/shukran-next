"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    router.replace(pathname, { locale: locale === "ar" ? "en" : "ar" });
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-full text-sm font-bold transition-colors bg-[var(--surface-2)] border border-[var(--border)] text-[var(--gold)] hover:bg-[var(--gold-dim)] hover:border-[var(--gold-dim)]"
      aria-label="Toggle language"
    >
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
