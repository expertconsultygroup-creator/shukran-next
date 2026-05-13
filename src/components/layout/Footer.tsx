import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("navbar");

  return (
    <footer className="bg-[var(--bg-deep)] pt-12 border-t-[3px] border-t-white relative">
      <div className="absolute top-[-3px] left-0 right-0 h-[3px] flex">
        <div className="flex-1 bg-black"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[var(--green)]"></div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-start">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <img
                src="/media/logo.jpeg"
                alt="مبادرة درع الوطن"
                width={42}
                height={42}
                className="rounded-lg"
              />
              <img
                src="/media/armed-forces-50.jpeg"
                alt="ذكرى توحيد القوات المسلحة ٥٠ عاماً"
                width={48}
                height={48}
                className="object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
              />
              <img
                src="/media/al-nahyan-center.png"
                alt="مركز الشيخ محمد بن خالد آل نهيان الثقافي"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h2 className="font-sans font-bold text-xl text-[var(--gold)] mb-2">{t("siteName")}</h2>
            <p className="text-[var(--muted)] font-sans font-bold">{t("nationalProject")}</p>
            <p className="text-[var(--muted-light)] mt-4 text-sm max-w-xs leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div className="text-start">
            <h3 className="text-[var(--white)] font-sans font-bold text-lg mb-4 border-b border-[var(--border)] pb-2 inline-block">{t("quickLinks")}</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">{tNav("home")}</Link></li>
              <li><Link href="/send" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">{tNav("send")}</Link></li>
              <li><Link href="/messages" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">{tNav("messages")}</Link></li>
              <li><Link href="/guinness" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">{tNav("guinness")}</Link></li>
              <li><Link href="/guide" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">{tNav("guide")}</Link></li>
            </ul>
          </div>

          <div className="text-start">
            <h3 className="text-[var(--white)] font-sans font-bold text-lg mb-4 border-b border-[var(--border)] pb-2 inline-block">{t("contactUs")}</h3>
            <ul className="space-y-3" dir="ltr">
              <li className="text-[var(--muted-light)]">contact@shukran.ae</li>
              <li className="text-[var(--muted-light)]">+971 800 SHUKRAN</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--muted)] text-sm">{t("copyright")}</p>
          <div className="flex gap-4 text-[var(--muted)] text-sm">
            <a href="#" className="hover:text-[var(--white)]">{t("terms")}</a>
            <a href="#" className="hover:text-[var(--white)]">{t("privacy")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
