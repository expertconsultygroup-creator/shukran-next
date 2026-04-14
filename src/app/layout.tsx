import type { Metadata } from "next";
import { Cairo, Noto_Naskh_Arabic, Cinzel } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Ticker } from "@/components/layout/Ticker";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { COUNTER_START } from "@/lib/constants";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-naskh",
  weight: ["400", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "شكراً حماة الوطن | Shukran - Hamaat Al-Watan",
  description: "منصة وطنية لتوثيق رسائل الشكر والعرفان لأبطال القوات المسلحة الإماراتية — نحو مليون رسالة ورقم قياسي عالمي",
  keywords: ["شكراً", "حماة الوطن", "الإمارات", "القوات المسلحة", "غينيس"],
  openGraph: {
    title: "شكراً حماة الوطن",
    description: "منصة وطنية لتوثيق رسائل الشكر لأبطال القوات المسلحة الإماراتية",
    locale: "ar_AE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialCount = COUNTER_START;

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${notoNaskh.variable} ${cinzel.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <QueryProvider>
          <SupabaseProvider>
            <ThemeProvider>
              <RealtimeProvider initialCount={initialCount}>
                <Navbar />
                <Ticker />
                <main className="flex-1 flex flex-col w-full min-h-[100dvh]">
                  {children}
                </main>
                <Footer />
                <Toaster position="top-center" richColors />
              </RealtimeProvider>
            </ThemeProvider>
          </SupabaseProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
