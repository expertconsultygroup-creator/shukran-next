"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCard } from "@/components/messages/MessageCard";
import { ShamsaPattern } from "@/components/shared/ShamsaPattern";
import { useLiveCount } from "@/hooks/use-live-count";

export default function Messages() {
  const [filter, setFilter] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const count = useLiveCount();

  const filters = ["الكل", "مواطن", "مقيم", "طالب", "جهة"];

  useEffect(() => {
    setPage(1);
  }, [filter, searchTerm]);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(filter !== "الكل" && { category: filter }),
        ...(searchTerm && { search: searchTerm }),
      });
      try {
        const res = await fetch(`/api/messages?${params}`);
        const data = await res.json();
        if (page === 1) {
          setMessages(data.messages || []);
        } else {
          setMessages(prev => [...prev, ...(data.messages || [])]);
        }
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
      setLoading(false);
    }
    fetchMessages();
  }, [filter, searchTerm, page]);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative">
      <ShamsaPattern className="opacity-5" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="font-sans font-black text-3xl sm:text-5xl text-[var(--white)]">رسائل الشكر</h1>
              <div className="bg-[var(--gold-dim)] border border-[var(--gold)] px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--sea)] animate-ping" />
                <span className="text-[var(--gold)] font-sans font-bold text-sm tracking-wide">{count.toLocaleString()} رسالة</span>
              </div>
            </div>
            <p className="text-[var(--muted-light)] text-lg max-w-xl">تصفح آلاف الرسائل الموثقة من كافة أنحاء العالم تقديراً واعتزازاً بحماة الوطن.</p>
          </div>
        </div>

        <div className="sticky top-24 z-40 bg-[var(--overlay-glass)] backdrop-blur-[20px] border border-[var(--border)] rounded-2xl p-4 mb-10 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
            <input
              type="text"
              placeholder="ابحث بالاسم، الرسالة، أو رقم التوثيق..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl text-[var(--white)] pr-12 pl-4 py-2.5 focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-[var(--gold)] text-[var(--bg-deep)] shadow-[var(--glow-gold)]"
                    : "bg-[var(--surface-2)] text-[var(--muted-light)] hover:text-[var(--white)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading && page === 1 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-t-[var(--gold)] rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--surface-2)', borderTopColor: 'var(--gold)' }}></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {messages.map((msg: any, i: number) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: Math.min(i, 5) * 0.05 }}
                    key={msg.id}
                  >
                    <MessageCard message={msg} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {messages.length === 0 && !loading && (
              <div className="py-20 text-center">
                <Filter className="mx-auto text-[var(--muted)] mb-4" size={48} />
                <h3 className="text-xl text-[var(--white)] font-bold mb-2">لا توجد نتائج</h3>
                <p className="text-[var(--muted)]">جرب تغيير كلمات البحث أو الفلاتر</p>
              </div>
            )}

            {messages.length < total && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="px-8 py-3 rounded-full border border-[var(--gold)] text-[var(--gold)] font-bold hover:bg-[var(--gold-dim)] transition-colors shadow-[var(--glow-gold)] disabled:opacity-50"
                >
                  {loading ? "جاري التحميل..." : "تحميل المزيد"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
