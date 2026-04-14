"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const fd = new FormData(e.target as HTMLFormElement);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    if (!supabase) {
      setError(true);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(true);
      setLoading(false);
      setTimeout(() => setError(false), 3000);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center p-4">
      <div className={`w-full max-w-md bg-[var(--card-glass)] backdrop-blur-xl border border-[var(--gold-dim)] rounded-3xl p-8 shadow-2xl ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--gold-dim)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--gold)]">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="var(--gold)"><path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C60.1 90 69.3 86.2 76.2 79.9 C67.4 86.8 55.8 90 43.3 88 C21.4 84.5 5 62.7 8.5 40.8 C10.4 28.7 18 17.6 28.8 11.8 C35.2 8.4 42.5 7.1 50 10 Z"/></svg>
          </div>
          <h1 className="font-sans font-bold text-2xl text-[var(--white)]">لوحة التحكم الإدارية</h1>
          <p className="text-[var(--muted)] mt-2">منصة شكراً حماة الوطن</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-[var(--red-dim)] border border-[var(--red)] text-[var(--red)] text-sm text-center font-bold">بيانات الدخول خاطئة</div>}
          <div>
            <label className="block text-[var(--muted)] text-sm mb-2">البريد الإلكتروني</label>
            <input name="email" type="email" required className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--white)] px-4 py-3 focus:outline-none focus:border-[var(--gold)]" />
          </div>
          <div>
            <label className="block text-[var(--muted)] text-sm mb-2">كلمة المرور</label>
            <input name="password" type="password" required className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--white)] px-4 py-3 focus:outline-none focus:border-[var(--gold)]" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[var(--gold)] text-[var(--bg-deep)] font-sans font-bold text-lg hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50">
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
