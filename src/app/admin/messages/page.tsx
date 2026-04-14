"use client";

import { useState, useEffect } from "react";
import { Search, Check, X as XIcon, Eye } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  display_id: string;
  name: string;
  text: string;
  nationality: string;
  country_name: string;
  category: string;
  status: string;
  created_at: string;
}

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [previewMsg, setPreviewMsg] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, searchTerm, page]);

  async function fetchMessages() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
        ...(searchTerm && { search: searchTerm }),
      });
      const res = await fetch(`/api/messages?${params}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setTotal(data.total || 0);
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, status: "approved" | "rejected") {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(status === "approved" ? "تم قبول الرسالة" : "تم رفض الرسالة");
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      toast.error("حدث خطأ");
    }
  }

  async function handleBulkAction(status: "approved" | "rejected") {
    if (selectedIds.size === 0) return;
    try {
      const res = await fetch("/api/admin/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast.success(`تم تحديث ${data.updated} رسالة`);
      setSelectedIds(new Set());
      fetchMessages();
    } catch {
      toast.error("حدث خطأ في العملية الجماعية");
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m.id)));
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="bg-[var(--gold-dim)] border border-[var(--gold)] rounded-xl p-4 flex items-center justify-between">
          <span className="text-[var(--gold)] font-bold text-sm">تم تحديد {selectedIds.size} رسالة</span>
          <div className="flex gap-3">
            <button onClick={() => handleBulkAction("approved")} className="flex items-center gap-2 bg-[var(--green)] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
              <Check size={16} /> قبول الكل
            </button>
            <button onClick={() => handleBulkAction("rejected")} className="flex items-center gap-2 bg-[var(--red)] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
              <XIcon size={16} /> رفض الكل
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex flex-wrap gap-4 items-center justify-between">
          <h3 className="font-bold text-[var(--white)] text-xl">إدارة الرسائل</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] pr-9 pl-4 py-2 text-sm focus:border-[var(--gold)] outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] px-4 py-2 text-sm focus:border-[var(--gold)] outline-none"
            >
              <option value="pending">معلق</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[var(--muted)]">جاري التحميل...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted)]">لا توجد رسائل</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-3 font-normal">
                    <input type="checkbox" className="accent-[var(--gold)]" checked={selectedIds.size === messages.length && messages.length > 0} onChange={toggleAll} />
                  </th>
                  <th className="px-6 py-3 font-normal">UUID</th>
                  <th className="px-6 py-3 font-normal">الاسم</th>
                  <th className="px-6 py-3 font-normal w-[30%]">الرسالة</th>
                  <th className="px-6 py-3 font-normal">الدولة</th>
                  <th className="px-6 py-3 font-normal">الحالة</th>
                  <th className="px-6 py-3 font-normal text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {messages.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--gold-dim)] text-[var(--white)]">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="accent-[var(--gold)]" checked={selectedIds.has(m.id)} onChange={() => toggleSelect(m.id)} />
                    </td>
                    <td className="px-6 py-4 font-mono text-[var(--muted-light)] text-xs">{m.display_id}</td>
                    <td className="px-6 py-4 font-bold">{m.name}</td>
                    <td className="px-6 py-4"><p className="truncate w-48 text-[var(--muted-light)]">{m.text}</p></td>
                    <td className="px-6 py-4">{m.nationality} {m.country_name}</td>
                    <td className="px-6 py-4">
                      {m.status === "pending" && <span className="bg-[var(--camel)]/20 text-[var(--camel)] px-2 py-1 rounded text-xs">معلق</span>}
                      {m.status === "approved" && <span className="bg-[var(--green)]/20 text-[var(--green-light)] px-2 py-1 rounded text-xs">مقبول</span>}
                      {m.status === "rejected" && <span className="bg-[var(--red)]/20 text-[var(--red-light)] px-2 py-1 rounded text-xs">مرفوض</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {m.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(m.id, "approved")} className="w-7 h-7 rounded bg-[var(--green-dim)] text-[var(--green)] flex items-center justify-center hover:bg-[var(--green)] hover:text-[var(--white)] transition-colors"><Check size={14} /></button>
                            <button onClick={() => handleAction(m.id, "rejected")} className="w-7 h-7 rounded bg-[var(--red-dim)] text-[var(--red)] flex items-center justify-center hover:bg-[var(--red)] hover:text-[var(--white)] transition-colors"><XIcon size={14} /></button>
                          </>
                        )}
                        <button onClick={() => setPreviewMsg(m)} className="w-7 h-7 rounded bg-[var(--sea-dim)] text-[var(--sea)] flex items-center justify-center hover:bg-[var(--sea)] hover:text-[var(--white)] transition-colors"><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-[var(--border)] text-[var(--muted)] text-sm flex justify-between">
          <span>عرض {messages.length} من {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-[var(--surface-2)] rounded hover:text-[var(--white)] disabled:opacity-50">السابق</button>
            <span className="px-3 py-1 bg-[var(--gold)] text-[var(--bg-deep)] font-bold rounded">{page}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 bg-[var(--surface-2)] rounded hover:text-[var(--white)] disabled:opacity-50">التالي</button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewMsg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewMsg(null)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-[var(--white)] text-xl mb-1">{previewMsg.name}</h3>
                <div className="text-[var(--muted)] text-sm">{previewMsg.display_id} — {previewMsg.nationality} {previewMsg.country_name}</div>
              </div>
              <button onClick={() => setPreviewMsg(null)} className="text-[var(--muted)] hover:text-[var(--white)]"><XIcon size={20} /></button>
            </div>
            <p className="text-[var(--white)] leading-relaxed mb-6 bg-[var(--bg-deep)] p-4 rounded-xl border border-[var(--border)]">{previewMsg.text}</p>
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span>{previewMsg.category}</span>
              <span>{new Date(previewMsg.created_at).toLocaleDateString("ar-AE")}</span>
            </div>
            {previewMsg.status === "pending" && (
              <div className="flex gap-3 mt-6">
                <button onClick={() => { handleAction(previewMsg.id, "approved"); setPreviewMsg(null); }} className="flex-1 py-2.5 rounded-xl bg-[var(--green)] text-white font-bold hover:opacity-90 transition-opacity">قبول</button>
                <button onClick={() => { handleAction(previewMsg.id, "rejected"); setPreviewMsg(null); }} className="flex-1 py-2.5 rounded-xl bg-[var(--red)] text-white font-bold hover:opacity-90 transition-opacity">رفض</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
