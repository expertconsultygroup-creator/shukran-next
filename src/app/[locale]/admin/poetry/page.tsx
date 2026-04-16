"use client";

import { useState, useEffect } from "react";
import { Search, Check, X as XIcon, Eye } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

interface Poem {
  id: string;
  title: string;
  poet: string;
  text: string;
  status: string;
  created_at: string;
}

export default function PoetryAdmin() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [previewPoem, setPreviewPoem] = useState<Poem | null>(null);

  useEffect(() => {
    fetchPoems();
  }, [statusFilter, searchTerm, page]);

  async function fetchPoems() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
        ...(searchTerm && { search: searchTerm }),
      });
      const res = await fetch(`/api/admin/poetry?${params}`);
      const data = await res.json();
      setPoems(data.poems || []);
      setTotal(data.total || 0);
    } catch {
      console.error("Failed to fetch poems");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, status: "approved" | "rejected") {
    try {
      const res = await fetch(`/api/admin/poetry/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(status === "approved" ? t("poetryApproved") : t("poetryRejected"));
      setPoems((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      toast.error(t("errorOccurred"));
    }
  }

  async function handleBulkAction(status: "approved" | "rejected") {
    if (selectedIds.size === 0) return;
    try {
      const res = await fetch("/api/admin/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status, entity: "poems" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast.success(t("bulkUpdated", { count: data.updated }));
      setSelectedIds(new Set());
      fetchPoems();
    } catch {
      toast.error(t("bulkError"));
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
    if (selectedIds.size === poems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(poems.map((m) => m.id)));
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4" dir="auto">
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="bg-[var(--gold-dim)] border border-[var(--gold)] rounded-xl p-4 flex items-center justify-between">
          <span className="text-[var(--gold)] font-bold text-sm">{t("selectedMessages", { count: selectedIds.size })}</span>
          <div className="flex gap-3">
            <button onClick={() => handleBulkAction("approved")} className="flex items-center justify-center gap-2 bg-[var(--green)] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              <Check size={16} /> {t("approveAll")}
            </button>
            <button onClick={() => handleBulkAction("rejected")} className="flex items-center justify-center gap-2 bg-[var(--red)] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
              <XIcon size={16} /> {t("rejectAll")}
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex flex-wrap gap-4 items-center justify-between">
          <h3 className="font-bold text-[var(--white)] text-xl">{t("managePoetry")}</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-[var(--muted)]`} size={16} />
              <input
                type="text"
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className={`bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 text-sm focus:border-[var(--gold)] outline-none text-start`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] px-4 py-2 text-sm focus:border-[var(--gold)] outline-none"
            >
              <option value="pending">{t("pending")}</option>
              <option value="approved">{t("approved")}</option>
              <option value="rejected">{t("rejected")}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[var(--muted)]">{t("loading")}</div>
        ) : poems.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted)]">{t("noPoetry")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-sm`}>
              <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-3 font-normal w-12">
                    <input type="checkbox" className="accent-[var(--gold)]" checked={selectedIds.size === poems.length && poems.length > 0} onChange={toggleAll} />
                  </th>
                  <th className="px-6 py-3 font-normal">{t("poemTitle")}</th>
                  <th className="px-6 py-3 font-normal">{t("poet")}</th>
                  <th className="px-6 py-3 font-normal w-[30%]">{t("poemText")}</th>
                  <th className="px-6 py-3 font-normal">{t("status")}</th>
                  <th className="px-6 py-3 font-normal text-center">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {poems.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--gold-dim)] text-[var(--white)]">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="accent-[var(--gold)]" checked={selectedIds.has(m.id)} onChange={() => toggleSelect(m.id)} />
                    </td>
                    <td className="px-6 py-4 font-bold">{m.title}</td>
                    <td className="px-6 py-4 text-[var(--muted-light)]">{m.poet}</td>
                    <td className="px-6 py-4"><p className="truncate w-48 text-[var(--muted-light)]">{m.text}</p></td>
                    <td className="px-6 py-4">
                      {m.status === "pending" && <span className="bg-[var(--camel)]/20 text-[var(--camel)] px-2 py-1 rounded text-xs">{t("pending")}</span>}
                      {m.status === "approved" && <span className="bg-[var(--green)]/20 text-[var(--green-light)] px-2 py-1 rounded text-xs">{t("approved")}</span>}
                      {m.status === "rejected" && <span className="bg-[var(--red)]/20 text-[var(--red-light)] px-2 py-1 rounded text-xs">{t("rejected")}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {m.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(m.id, "approved")} className="w-7 h-7 rounded bg-[var(--green-dim)] text-[var(--green)] flex items-center justify-center hover:bg-[var(--green)] hover:text-[var(--white)] transition-colors"><Check size={14} /></button>
                            <button onClick={() => handleAction(m.id, "rejected")} className="w-7 h-7 rounded bg-[var(--red-dim)] text-[var(--red)] flex items-center justify-center hover:bg-[var(--red)] hover:text-[var(--white)] transition-colors"><XIcon size={14} /></button>
                          </>
                        )}
                        <button onClick={() => setPreviewPoem(m)} className="w-7 h-7 rounded bg-[var(--sea-dim)] text-[var(--sea)] flex items-center justify-center hover:bg-[var(--sea)] hover:text-[var(--white)] transition-colors"><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-[var(--border)] text-[var(--muted)] text-sm flex justify-between">
          <span>{t("showing", { count: poems.length, total: total })}</span>
          <div className="flex gap-2" dir="ltr">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-[var(--surface-2)] rounded hover:text-[var(--white)] disabled:opacity-50">{t("prev")}</button>
            <span className="px-3 py-1 bg-[var(--gold)] text-[var(--bg-deep)] font-bold rounded">{page}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 bg-[var(--surface-2)] rounded hover:text-[var(--white)] disabled:opacity-50">{t("next")}</button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewPoem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewPoem(null)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 max-w-lg w-full text-start" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-[var(--white)] text-xl mb-1">{previewPoem.title}</h3>
                <div className="text-[var(--gold)] text-sm">{previewPoem.poet}</div>
              </div>
              <button onClick={() => setPreviewPoem(null)} className="text-[var(--muted)] hover:text-[var(--white)] shrink-0"><XIcon size={20} /></button>
            </div>
            <p className="text-[var(--white)] leading-loose mb-6 bg-[var(--bg-deep)] p-6 rounded-xl border border-[var(--border)] max-h-80 overflow-y-auto font-serif text-center whitespace-pre-wrap">{previewPoem.text}</p>
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span>{new Date(previewPoem.created_at).toLocaleDateString(isRtl ? "ar-AE" : "en-US")}</span>
            </div>
            {previewPoem.status === "pending" && (
              <div className="flex gap-3 mt-6">
                <button onClick={() => { handleAction(previewPoem.id, "approved"); setPreviewPoem(null); }} className="flex-1 py-2.5 rounded-xl bg-[var(--green)] text-white font-bold hover:opacity-90 transition-opacity">{t("approve")}</button>
                <button onClick={() => { handleAction(previewPoem.id, "rejected"); setPreviewPoem(null); }} className="flex-1 py-2.5 rounded-xl bg-[var(--red)] text-white font-bold hover:opacity-90 transition-opacity">{t("reject")}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
