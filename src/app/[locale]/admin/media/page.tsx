"use client";

import { useState, useEffect } from "react";
import { Search, Check, X as XIcon, Eye, Play, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

/** Extract a YouTube video ID from any URL format or raw ID string */
function extractYoutubeId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Already a raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && (parts[0] === "shorts" || parts[0] === "embed")) return parts[1];
    }
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("?")[0];
  } catch {
    const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  }
  return trimmed;
}

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  youtube_id?: string;
  youtubeId?: string;
  duration?: string;
  views?: number;
  status: string;
  created_at: string;
}

export default function MediaAdmin() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("published");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "أفلام قصيرة", youtube_id: "", duration: "", views: 0
  });

  useEffect(() => {
    fetchVideos();
  }, [statusFilter, searchTerm, page]);

  async function fetchVideos() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
        ...(searchTerm && { search: searchTerm }),
      });
      const res = await fetch(`/api/admin/videos?${params}`);
      const data = await res.json();
      setVideos(data.videos || []);
      setTotal(data.total || 0);
    } catch {
      console.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, status: "approved" | "rejected" | "published") {
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(status === "approved" || status === "published" ? t("mediaApproved") : t("mediaRejected"));
      setVideos((prev) => prev.filter((m) => m.id !== id));
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
        body: JSON.stringify({ ids: Array.from(selectedIds), status, entity: "videos" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      toast.success(t("bulkUpdated", { count: data.updated }));
      setSelectedIds(new Set());
      fetchVideos();
    } catch {
      toast.error(t("bulkError"));
    }
  }

  function openAddModal() {
    setEditingVideo(null);
    setFormData({ title: "", description: "", category: "أفلام قصيرة", youtube_id: "", duration: "", views: 0 });
    setIsFormModalOpen(true);
  }

  function openEditModal(video: Video) {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      category: video.category || "أفلام قصيرة",
      youtube_id: video.youtube_id || video.youtubeId || "",
      duration: video.duration || "",
      views: video.views || 0,
    });
    setIsFormModalOpen(true);
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEdit = !!editingVideo;
      const url = isEdit ? `/api/admin/videos/${editingVideo.id}` : `/api/admin/videos`;
      const method = isEdit ? "PATCH" : "POST";
      // Auto-extract the YouTube ID from whatever the user pasted
      const cleanedData = { ...formData, youtube_id: extractYoutubeId(formData.youtube_id) };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });
      if (!res.ok) throw new Error("Failed to save video");
      toast.success(isEdit ? t("videoUpdated") : t("videoAdded"));
      setIsFormModalOpen(false);
      fetchVideos();
    } catch {
      toast.error(t("errorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/admin/videos/${deletingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("videoDeleted"));
      setIsDeleteModalOpen(false);
      fetchVideos();
    } catch {
      toast.error(t("errorOccurred"));
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
    if (selectedIds.size === videos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(videos.map((m) => m.id)));
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
          <h3 className="font-bold text-[var(--white)] text-xl">{t("manageMedia")}</h3>
          <div className="flex gap-3">
            <button onClick={openAddModal} className="flex items-center gap-2 bg-[var(--gold)] text-[var(--bg-deep)] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[var(--gold-light)] transition-colors">
              <Plus size={16} /> {t("addVideo")}
            </button>
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
              <option value="all">{t("all")}</option>
              <option value="published">Published</option>
              <option value="pending">{t("pending")}</option>
              <option value="approved">{t("approved")}</option>
              <option value="rejected">{t("rejected")}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[var(--muted)]">{t("loading")}</div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted)]">{t("noMedia")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-sm`}>
              <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-3 font-normal w-12">
                    <input type="checkbox" className="accent-[var(--gold)]" checked={selectedIds.size === videos.length && videos.length > 0} onChange={toggleAll} />
                  </th>
                  <th className="px-6 py-3 font-normal">{t("title")}</th>
                  <th className="px-6 py-3 font-normal">{t("videoUrlOrId") || t("videoUrl")}</th>
                  <th className="px-6 py-3 font-normal">{t("videoCategory") || t("category")}</th>
                  <th className="px-6 py-3 font-normal">{t("status")}</th>
                  <th className="px-6 py-3 font-normal text-center">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {videos.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--gold-dim)] text-[var(--white)]">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="accent-[var(--gold)]" checked={selectedIds.has(m.id)} onChange={() => toggleSelect(m.id)} />
                    </td>
                    <td className="px-6 py-4 font-bold">{m.title}</td>
                    <td className="px-6 py-4 text-[var(--muted-light)]">{m.youtube_id || m.youtubeId || m.id}</td>
                    <td className="px-6 py-4 text-[var(--muted-light)]">{m.category}</td>
                    <td className="px-6 py-4">
                      {m.status === "pending" && <span className="bg-[var(--camel)]/20 text-[var(--camel)] px-2 py-1 rounded text-xs">{t("pending")}</span>}
                      {(m.status === "approved" || m.status === "published") && <span className="bg-[var(--green)]/20 text-[var(--green-light)] px-2 py-1 rounded text-xs">{t("approved")}</span>}
                      {m.status === "rejected" && <span className="bg-[var(--red)]/20 text-[var(--red-light)] px-2 py-1 rounded text-xs">{t("rejected")}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {m.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(m.id, "published")} className="w-7 h-7 rounded bg-[var(--green-dim)] text-[var(--green)] flex items-center justify-center hover:bg-[var(--green)] hover:text-[var(--white)] transition-colors"><Check size={14} /></button>
                            <button onClick={() => handleAction(m.id, "rejected")} className="w-7 h-7 rounded bg-[var(--red-dim)] text-[var(--red)] flex items-center justify-center hover:bg-[var(--red)] hover:text-[var(--white)] transition-colors"><XIcon size={14} /></button>
                          </>
                        )}
                        <button onClick={() => setPreviewVideo(m)} className="w-7 h-7 rounded bg-[var(--sea-dim)] text-[var(--sea)] flex items-center justify-center hover:bg-[var(--sea)] hover:text-[var(--white)] transition-colors"><Eye size={14} /></button>
                        <button onClick={() => openEditModal(m)} className="w-7 h-7 rounded bg-[var(--camel)]/20 text-[var(--camel)] flex items-center justify-center hover:bg-[var(--camel)] hover:text-[var(--white)] transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => confirmDelete(m.id)} className="w-7 h-7 rounded bg-[var(--red-dim)] text-[var(--red)] flex items-center justify-center hover:bg-[var(--red)] hover:text-[var(--white)] transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-[var(--border)] text-[var(--muted)] text-sm flex justify-between">
          <span>{t("showing", { count: videos.length, total: total })}</span>
          <div className="flex gap-2" dir="ltr">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-[var(--surface-2)] rounded hover:text-[var(--white)] disabled:opacity-50">{t("prev")}</button>
            <span className="px-3 py-1 bg-[var(--gold)] text-[var(--bg-deep)] font-bold rounded">{page}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 bg-[var(--surface-2)] rounded hover:text-[var(--white)] disabled:opacity-50">{t("next")}</button>
          </div>
        </div>
      </div>

      {previewVideo && (() => {
        const ytId = extractYoutubeId(previewVideo.youtube_id || previewVideo.youtubeId || "");
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewVideo(null)}>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 max-w-2xl w-full text-start" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-[var(--white)] text-xl mb-1">{previewVideo.title}</h3>
                  <div className="text-[var(--gold)] text-sm">{previewVideo.category}</div>
                </div>
                <button onClick={() => setPreviewVideo(null)} className="text-[var(--muted)] hover:text-[var(--white)] shrink-0"><XIcon size={20} /></button>
              </div>

              <div className="aspect-video bg-black rounded-lg mb-6 overflow-hidden border border-[var(--border)]">
                {ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title={previewVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                    <span>No Video URL</span>
                  </div>
                )}
              </div>
              <p className="text-[var(--white)] leading-relaxed mb-6">{previewVideo.description}</p>
              
              <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                <span>{new Date(previewVideo.created_at).toLocaleDateString(isRtl ? "ar-AE" : "en-US")} {previewVideo.views ? ` • ${previewVideo.views} views` : ""}</span>
              </div>
              {previewVideo.status === "pending" && (
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { handleAction(previewVideo.id, "published"); setPreviewVideo(null); }} className="flex-1 py-2.5 rounded-xl bg-[var(--green)] text-white font-bold hover:opacity-90 transition-opacity">{t("approve")}</button>
                  <button onClick={() => { handleAction(previewVideo.id, "rejected"); setPreviewVideo(null); }} className="flex-1 py-2.5 rounded-xl bg-[var(--red)] text-white font-bold hover:opacity-90 transition-opacity">{t("reject")}</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 md:p-8 max-w-xl w-full text-start" dir="auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[var(--white)] text-xl">{editingVideo ? t("editVideo") : t("addVideo")}</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--white)]"><XIcon size={20} /></button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmitForm}>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">{t("title")}</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] px-4 py-2 text-sm focus:border-[var(--gold)] outline-none" />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">{t("description")}</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] px-4 py-2 text-sm focus:border-[var(--gold)] outline-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-1">{t("videoCategory") || "Category"}</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] px-4 py-2 text-sm focus:border-[var(--gold)] outline-none">
                     <option value="أفلام قصيرة">Short Films / أفلام قصيرة</option>
                     <option value="فيديوهات توعوية">Awareness Videos / فيديوهات توعوية</option>
                     <option value="مقابلات">Interviews / مقابلات</option>
                     <option value="رسائل مصورة">Video Messages / رسائل مصورة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-1">{t("youtubeId")}</label>
                  <input type="text" required value={formData.youtube_id} onChange={e => setFormData({ ...formData, youtube_id: e.target.value })} className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] px-4 py-2 text-sm focus:border-[var(--gold)] outline-none" placeholder="Paste any YouTube link here..." />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-1">{t("duration")}</label>
                  <input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] px-4 py-2 text-sm focus:border-[var(--gold)] outline-none" placeholder="e.g. 5:20" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-1">{t("views")}</label>
                  <input type="number" min="0" value={formData.views} onChange={e => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })} className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-[var(--white)] px-4 py-2 text-sm focus:border-[var(--gold)] outline-none" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--gold)] text-[var(--bg-deep)] font-bold rounded-lg py-3 mt-4 hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50">
                {isSubmitting ? "..." : t("submitVideo")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="font-bold text-[var(--white)] text-xl mb-2">{t("deleteVideo")}</h3>
            <p className="text-[var(--muted)] mb-6">{t("confirmDelete")}</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2 rounded-lg bg-[var(--surface-2)] text-[var(--white)] font-bold hover:opacity-90 transition-opacity">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-[var(--red)] text-white font-bold hover:opacity-90 transition-opacity">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
