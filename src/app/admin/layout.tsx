"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, MessageSquare, PieChart, Film, ScrollText,
  Settings, LogOut, Bell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const menu = [
  { href: "/admin", icon: LayoutDashboard, label: "نظرة عامة" },
  { href: "/admin/messages", icon: MessageSquare, label: "الرسائل" },
  { href: "/admin/stats", icon: PieChart, label: "التحليلات" },
  { href: "/admin/media", icon: Film, label: "الوسائط" },
  { href: "/admin/poetry", icon: ScrollText, label: "القصائد" },
  { href: "/admin/settings", icon: Settings, label: "الإعدادات" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't wrap the login page with the admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase?.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const currentLabel = menu.find((m) => m.href === pathname)?.label || "لوحة الإدارة";

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex rtl relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative top-0 right-0 h-full z-50 md:z-auto
        w-[240px] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col shrink-0
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[var(--border)]">
          <svg width="24" height="24" viewBox="0 0 100 100" fill="var(--gold)"><path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z"/></svg>
          <span className="font-bold text-[var(--white)] tracking-wide text-sm">لوحة الإدارة</span>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 px-3">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  active ? "bg-[var(--gold-dim)] text-[var(--gold)]" : "text-[var(--muted-light)] hover:bg-[var(--surface-2)] hover:text-[var(--white)]"
                }`}
                style={active ? { borderRight: "3px solid var(--gold)" } : {}}
              >
                <Icon size={20} />
                <span className="font-bold text-sm">{m.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] text-[var(--gold)] flex items-center justify-center font-bold">AD</div>
            <div className="flex-1">
              <div className="text-[var(--white)] text-sm font-bold">Admin</div>
              <div className="text-[var(--muted)] text-xs">مدير النظام</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-[var(--red-light)] hover:bg-[var(--red-dim)] rounded-lg transition-colors text-sm font-bold">
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 md:mr-0">
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--red)]"></span>
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
