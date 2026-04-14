"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoldDivider } from "@/components/shared/GoldDivider";
import { useTheme } from "@/components/providers/ThemeProvider";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/messages", label: "الرسائل" },
  { href: "/media", label: "الوسائط" },
  { href: "/poetry", label: "القصائد" },
  { href: "/ebook", label: "الكتاب" },
  { href: "/guinness", label: "غينيس" },
  { href: "/map", label: "الخريطة" },
  { href: "/halloffame", label: "المتصدرون" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLightMode, toggleTheme } = useTheme();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full backdrop-blur-[20px] bg-[var(--navbar-glass)] border-b border-[rgba(203,163,68,0.20)]">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:scale-105 transition-transform">
              <path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z" fill="var(--gold)"/>
            </svg>
            <span className="font-sans font-bold text-2xl text-[var(--gold)] hidden sm:block">شكراً حماة الوطن</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-sm transition-colors hover:text-[var(--gold)] ${
                  pathname === link.href ? "text-[var(--gold)] font-bold" : "text-[var(--white)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--surface-2)] text-[var(--gold)] transition-colors"
              aria-label="Toggle Theme"
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <Link
              href="/send"
              className="hidden sm:flex items-center justify-center px-6 h-10 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold shadow-[var(--glow-gold)] hover:scale-105 active:scale-95 transition-transform"
            >
              أرسل رسالتك
            </Link>

            <button
              className="lg:hidden p-2 text-[var(--gold)]"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
        <GoldDivider />
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] backdrop-blur-[20px] bg-[var(--overlay-glass)] flex flex-col"
          >
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[var(--gold)] bg-[var(--surface-2)] rounded-full"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-20">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`text-2xl font-sans font-bold ${
                      pathname === link.href ? "text-[var(--gold)]" : "text-[var(--white)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="mt-8"
              >
                <Link
                  href="/send"
                  className="flex items-center justify-center px-10 h-14 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] text-[var(--bg-deep)] font-sans font-bold text-xl shadow-[var(--glow-gold)]"
                >
                  أرسل رسالتك
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
