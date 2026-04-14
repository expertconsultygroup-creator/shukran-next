import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--bg-deep)] pt-12 border-t-[3px] border-t-white relative">
      <div className="absolute top-[-3px] left-0 right-0 h-[3px] flex">
        <div className="flex-1 bg-black"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[var(--green)]"></div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z" fill="var(--gold)"/>
              </svg>
              <h2 className="font-sans font-bold text-xl text-[var(--gold)]">شكراً حماة الوطن</h2>
            </div>
            <p className="text-[var(--muted)] font-sans font-bold">مشروع وطني إماراتي</p>
            <p className="text-[var(--muted-light)] mt-4 text-sm max-w-xs leading-relaxed">
              منصة وطنية لتوثيق رسائل الشكر والعرفان لأبطال القوات المسلحة الإماراتية، نحو تحقيق رقم قياسي عالمي.
            </p>
          </div>

          <div>
            <h3 className="text-[var(--white)] font-sans font-bold text-lg mb-4 border-b border-[var(--border)] pb-2 inline-block">روابط سريعة</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">الرئيسية</Link></li>
              <li><Link href="/send" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">أرسل رسالتك</Link></li>
              <li><Link href="/messages" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">قراءة الرسائل</Link></li>
              <li><Link href="/guinness" className="text-[var(--muted-light)] hover:text-[var(--gold)] transition-colors">رقم غينيس</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--white)] font-sans font-bold text-lg mb-4 border-b border-[var(--border)] pb-2 inline-block">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="text-[var(--muted-light)]">contact@shukran.ae</li>
              <li className="text-[var(--muted-light)]">+971 800 SHUKRAN</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--muted)] text-sm">© 2025 منصة شكراً حماة الوطن — جميع الحقوق محفوظة</p>
          <div className="flex gap-4 text-[var(--muted)] text-sm">
            <a href="#" className="hover:text-[var(--white)]">الشروط والأحكام</a>
            <a href="#" className="hover:text-[var(--white)]">سياسة الخصوصية</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
