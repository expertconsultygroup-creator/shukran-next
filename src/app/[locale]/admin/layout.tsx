"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, MessageSquare, PieChart, Film, ScrollText,
  Settings, LogOut, Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const menu = [
    { href: "/admin", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/admin/messages", icon: MessageSquare, label: t("manageMessages") },
    { href: "/admin/media", icon: Film, label: t("manageMedia") },
    { href: "/admin/poetry", icon: ScrollText, label: t("managePoetry") },
  ];

  // Don't wrap the login page with the admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // ─── Auth Guard ────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.push("/admin/login");
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setIsAuthed(true);
      }
      setAuthChecked(true);
    });

    // Listen for auth state changes (e.g. session expiry)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthed(false);
        router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Show loading spinner while checking auth
  if (!authChecked || !isAuthed) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--surface-2)', borderTopColor: 'var(--gold)' }}></div>
      </div>
    );
  }
  // ─── End Auth Guard ────────────────────────────────────────────

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const currentLabel = menu.find((m) => m.href === pathname)?.label || t("title");

  return (
    <div className={`min-h-screen bg-[var(--bg-deep)] flex relative ${isRtl ? 'rtl' : 'ltr'}`} dir="auto">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 ${isRtl ? 'right-0' : 'left-0'} h-full z-50 md:z-auto
        w-[240px] bg-[var(--surface)] ${isRtl ? 'border-l' : 'border-r'} border-[var(--border)] flex flex-col shrink-0
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}
      `}>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[var(--border)]">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="var(--gold)"><path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z"/></svg>
          <span className="font-bold text-[var(--white)] tracking-wide text-sm">{t("title")}</span>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 px-3">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href as any}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  active ? "bg-[var(--gold-dim)] text-[var(--gold)]" : "text-[var(--muted-light)] hover:bg-[var(--surface-2)] hover:text-[var(--white)]"
                }`}
                style={active ? (isRtl ? { borderRight: "3px solid var(--gold)" } : { borderLeft: "3px solid var(--gold)" }) : {}}
              >
                <Icon size={20} />
                <span className="font-bold text-sm text-start">{m.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 text-start">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] text-[var(--gold)] flex items-center justify-center font-bold shrink-0">AD</div>
            <div className="flex-1">
              <div className="text-[var(--white)] text-sm font-bold">Admin</div>
              <div className="text-[var(--muted)] text-xs">{t("title")}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-2 w-full text-[var(--red-light)] hover:bg-[var(--red-dim)] rounded-lg transition-colors text-sm font-bold">
            <LogOut size={18} className={isRtl ? "rotate-180" : ""} /> {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-20 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg bg-[var(--surface-2)] text-[var(--gold)]"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="text-[var(--muted-light)] text-xs md:text-sm font-bold">{currentLabel}</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted-light)] relative">
              <Bell size={18} />
              <span className={`absolute top-1.5 ${isRtl ? 'left-1.5' : 'right-1.5'} w-2 h-2 rounded-full bg-[var(--red)]`}></span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
