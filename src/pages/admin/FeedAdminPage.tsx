import React, { useState, useRef, useCallback } from 'react';
import {
  Film,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
  Loader2,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Search,
  Pin,
  Copy,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { useVideoFeed } from '../../context/VideoContext';
import { useStore } from '../../context/StoreContext';
import { VideoItem } from '../../types/video';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { VideoUploader } from '../../components/admin/VideoUploader';
import { SingleImageUpload } from '../../components/admin/SingleImageUpload';
import { deleteMediaObjects, MEDIA_BUCKETS } from '../../lib/supabase/storage';
import { useFeedAdmStats } from '../../hooks/useFeedAdmStats';
import { formatDuration } from '../../components/admin/analytics/util';

const FEED_CATEGORIES = ['all', 'erkaklar', 'ayollar', 'oyoq-kiyimlar', 'aksessuarlar'] as const;

export const FeedAdminPage: React.FC = () => {
  const { videos, addVideo, updateVideo, deleteVideo, togglePublish, reorderVideos, resetToDefault, loading: feedLoading } = useVideoFeed();
  const { products } = useStore();
  const { stats } = useFeedAdmStats();

  const [isCreating, setIsCreating] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [productId, setProductId] = useState<string>('');
  const [badge, setBadge] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [published, setPublished] = useState(true);

  const [pendingFeedId, setPendingFeedId] = useState<string>('feed-' + Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'archived'>('all');
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const pendingUploadsRef = useRef<{ bucket: string; path: string }[]>([]);

  const recordUploaded = useCallback((media: { bucket: string; path: string }) => { pendingUploadsRef.current.push(media); }, []);
  const cleanupPendingUploads = useCallback(() => { const pending = pendingUploadsRef.current.splice(0, pendingUploadsRef.current.length); for (const item of pending) { void deleteMediaObjects(item.bucket, [item.path]); } }, []);

  const openCreateModal = useCallback(() => {
    setTitle(''); setDescription(''); setVideoUrl(''); setPosterUrl(''); setAuthor(''); setProductId(products[0]?.id || ''); setBadge(''); setCategory('all'); setPublished(true); setPendingFeedId('feed-' + Date.now()); setIsCreating(true); setEditingVideo(null); setFieldErrors({}); setErrorMessage(null); setSavedSuccess(false);
  }, [products]);

  const openEditModal = useCallback((v: VideoItem) => {
    setTitle(v.title); setDescription(v.description || ''); setVideoUrl(v.videoUrl || ''); setPosterUrl(v.posterUrl || ''); setAuthor(v.author || ''); setProductId(v.productId || ''); setBadge(v.badge?.text || ''); setCategory(v.category || 'all'); setPublished(v.published !== false); setPendingFeedId(v.id); setEditingVideo(v); setIsCreating(false); setFieldErrors({}); setErrorMessage(null); setSavedSuccess(false);
  }, []);

  const closeModal = useCallback(() => { cleanupPendingUploads(); setIsCreating(false); setEditingVideo(null); setFieldErrors({}); setErrorMessage(null); }, [cleanupPendingUploads]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Video sarlavhasi kiritilishi shart";
    if (!videoUrl.trim()) errors.videoUrl = "Video fayli yuklanishi shart";
    if (!posterUrl.trim()) errors.posterUrl = "Poster rasmi yuklanishi shart";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, videoUrl, posterUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || saving) return;
    setSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);
    try {
      if (isCreating) {
        const ok = await addVideo({ title: title.trim(), description: description.trim(), videoUrl: videoUrl.trim() || undefined, posterUrl: posterUrl.trim() || undefined, author: author.trim() || undefined, productId: productId || undefined, badge: badge.trim() ? { text: badge.trim(), type: 'new' } : undefined, category: category || 'all', published, order: videos.length + 1 }, pendingFeedId);
        if (ok) { pendingUploadsRef.current = []; setIsCreating(false); setSavedSuccess(true); setTimeout(() => setSavedSuccess(false), 2000); } else { cleanupPendingUploads(); }
      } else if (editingVideo) {
        const ok = await updateVideo(editingVideo.id, { title: title.trim(), description: description.trim(), videoUrl: videoUrl.trim() || undefined, posterUrl: posterUrl.trim() || undefined, author: author.trim() || undefined, productId: productId || undefined, badge: badge.trim() ? { text: badge.trim(), type: 'new' } : undefined, category: category || 'all', published });
        if (ok) { pendingUploadsRef.current = []; setEditingVideo(null); setSavedSuccess(true); setTimeout(() => setSavedSuccess(false), 2000); } else { cleanupPendingUploads(); }
      }
    } catch (err) {
      console.error('Failed to save video:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Saqlashda xatolik yuz berdi');
    } finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (videoToDelete) {
      const owned = [videoToDelete.videoUrl, videoToDelete.posterUrl].map((url) => { if (!url) return null; const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/); return match ? { bucket: match[1], path: decodeURIComponent(match[2].split('?')[0]) } : null; }).filter((item): item is { bucket: string; path: string } => item !== null);
      for (const item of owned) { void deleteMediaObjects(item.bucket, [item.path]); }
      await deleteVideo(videoToDelete.id);
      setVideoToDelete(null);
    }
  };

  const handlePin = async (idx: number) => {
    if (idx <= 0) return;
    setActionBusy(videos[idx].id + ':pin');
    await reorderVideos(idx, 0);
    setActionBusy(null);
  };

  const handleDuplicate = async (v: VideoItem) => {
    setActionBusy(v.id + ':copy');
    await addVideo({
      title: `${v.title} (nusxa)`,
      description: v.description,
      videoUrl: v.videoUrl,
      posterUrl: v.posterUrl,
      author: v.author,
      productId: v.productId,
      badge: v.badge,
      category: v.category,
      published: false,
      order: videos.length + 1,
    });
    setActionBusy(null);
  };

  const handleArchive = async (v: VideoItem) => {
    setActionBusy(v.id + ':archive');
    if (v.published) await togglePublish(v.id);
    await reorderVideos(videos.findIndex((x) => x.id === v.id), videos.length - 1);
    setActionBusy(null);
  };

  const filteredVideos = videos.filter((v) => {
    if (statusFilter === 'published' && !v.published) return false;
    if (statusFilter === 'archived' && v.published) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      if (!v.title.toLowerCase().includes(q) && !(v.description || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (feedLoading) {
    return (<div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /><span className="ml-2 text-xs text-muted-foreground">Videolar yuklanmoqda...</span></div>);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Video kutubxonasi</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{videos.length} ta video</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowResetConfirm(true)} className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Standart</span>
          </button>
          <button type="button" onClick={openCreateModal} className="px-3.5 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Yangi video</span>
          </button>
        </div>
      </div>

      {/* Search & status filter */}
      {videos.length > 0 && (
        <div className="p-3 rounded-xl bg-card border border-border flex flex-col sm:flex-row gap-2.5 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Video sarlavhasi bo‘yicha qidirish…" aria-label="Video qidirish" className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-background border border-border font-medium focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'published', 'archived'] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${statusFilter === s ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {s === 'all' ? `Barchasi (${videos.length})` : s === 'published' ? `Faol (${videos.filter((v) => v.published).length})` : `Arxiv (${videos.filter((v) => !v.published).length})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {videos.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Hali videolar yo'q</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            "Yangi video" tugmasini bosing va birinchi videongizni yuklang.
          </p>
        </div>
      )}

      {videos.length > 0 && filteredVideos.length === 0 && (
        <div className="rounded-2xl border border-border p-10 text-center">
          <p className="text-sm font-semibold">Hech narsa topilmadi</p>
          <p className="text-xs text-muted-foreground mt-1">Qidiruv yoki filtrni o‘zgartiring.</p>
          <button type="button" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-3 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium">Tozalash</button>
        </div>
      )}

      {/* Video Grid */}
      {filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((vid) => {
            const idx = videos.findIndex((v) => v.id === vid.id);
            const linkedProduct = products.find((p) => p.id === vid.productId);
            return (
              <div key={vid.id} className={`group bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:border-muted-foreground/20 hover:shadow-sm transition-all ${!vid.published ? 'opacity-60' : ''}`}>
                <div className="relative aspect-9/16 max-h-64 bg-muted overflow-hidden">
                  <img src={vid.posterUrl || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-between p-3">
                    <div className="flex items-center justify-between">
                      {vid.badge ? <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-[9px] font-bold uppercase">{vid.badge.text}</span> : <div />}
                      <button type="button" onClick={() => togglePublish(vid.id)} className={`px-2 py-0.5 rounded text-[9px] font-medium ${vid.published ? 'bg-emerald-500/90 text-white' : 'bg-black/40 text-white/60'}`}>
                        {vid.published ? 'Faol' : 'Yashirin'}
                      </button>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-accent">{vid.author || "@do'kon"}</p>
                      <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2">{vid.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-2 flex-1">
                  {linkedProduct ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                      <img src={linkedProduct.images[0] || ''} alt="" className="w-7 h-7 rounded-md object-cover border border-border shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-foreground truncate">{linkedProduct.name}</p>
                        <span className="text-[10px] font-bold text-foreground tabular-nums">{linkedProduct.price.toLocaleString('uz-UZ')} so'm</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-muted/30 text-[10px] text-muted-foreground italic">Mahsulot biriktirilmagan</div>
                  )}

                  {stats[vid.id] && (
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <StatChip label="Ko'r" value={stats[vid.id].views.toLocaleString('uz-UZ')} />
                      <StatChip label="Yoqdi" value={stats[vid.id].likes.toLocaleString('uz-UZ')} />
                      <StatChip label="Izoh" value={stats[vid.id].comments.toLocaleString('uz-UZ')} />
                      <StatChip label="Vaqt" value={formatDuration(stats[vid.id].watchSec)} />
                    </div>
                  )}
                </div>

                <div className="px-3 pb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-mono">{vid.duration || '—'}</span>
                  <span>{vid.createdAt ? new Date(vid.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }) : ''}</span>
                  {idx === 0 && <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 text-[9px] font-bold">PINNED</span>}
                </div>
                <div className="px-3 pb-3 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-0.5">
                    <button type="button" disabled={idx === 0} onClick={() => reorderVideos(idx, idx - 1)} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Yuqoriga surish"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button type="button" disabled={idx === videos.length - 1} onClick={() => reorderVideos(idx, idx + 1)} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Pastga surish"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button type="button" disabled={idx === 0 || actionBusy !== null} onClick={() => handlePin(idx)} title="Eng yuqoriga mahkamlash (pin)" aria-label="Pin qilish" className="p-1 rounded text-muted-foreground hover:text-amber-500 disabled:opacity-30"><Pin className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button type="button" disabled={actionBusy !== null} onClick={() => handleDuplicate(vid)} title="Nusxa olish" aria-label="Nusxa olish" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"><Copy className="w-3.5 h-3.5" /></button>
                    <button type="button" disabled={actionBusy !== null} onClick={() => handleArchive(vid)} title={vid.published ? 'Arxivlash (yashirish + oxiriga)' : 'Arxivda'} aria-label="Arxivlash" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"><Archive className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => openEditModal(vid)} title="Tahrirlash / videoni almashtirish" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1" aria-label={`${vid.title} ni tahrirlash`}><RefreshCw className="w-3.5 h-3.5" /><Edit className="w-3 h-3" /></button>
                    <button type="button" onClick={() => setVideoToDelete(vid)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label={`${vid.title} ni o'chirish`}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isCreating || editingVideo) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={closeModal} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-xl bg-card rounded-xl p-6 shadow-xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{isCreating ? 'Yangi video' : 'Videoni tahrirlash'}</h3>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted" aria-label="Yopish"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Sarlavha <span className="text-destructive">*</span></label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video sarlavhasi" className={`admin-input font-medium ${fieldErrors.title ? 'border-destructive' : ''}`} aria-invalid={!!fieldErrors.title} />
                {fieldErrors.title && <p className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Muallif</label>
                  <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="@do'kon" className="admin-input" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Badge</label>
                  <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="TOP, YANGI, TREND" className="admin-input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Kategoriya</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input font-medium">
                    {FEED_CATEGORIES.map((c) => (<option key={c} value={c}>{c === 'all' ? 'Barchasi' : c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Mahsulot</label>
                  <select value={productId} onChange={(e) => setProductId(e.target.value)} className="admin-input font-medium">
                    <option value="">-- Tanlanmagan --</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.name} — {p.price.toLocaleString('uz-UZ')} so'm</option>))}
                  </select>
                </div>
              </div>

              <VideoUploader value={videoUrl || undefined} onChange={(url) => setVideoUrl(url || '')} poster={posterUrl || undefined} onPosterChange={(url) => setPosterUrl(url || '')} bucket={MEDIA_BUCKETS.FEED_MEDIA} scope={pendingFeedId} label="Video fayl *" helperText="MP4 yoki WebM (100 MB gacha)." onUploaded={recordUploaded} />
              {fieldErrors.videoUrl && <p className="text-[10px] text-destructive" role="alert">{fieldErrors.videoUrl}</p>}

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Poster rasm <span className="text-destructive">*</span></label>
                <SingleImageUpload
                  label="Poster rasmi"
                  value={posterUrl || undefined}
                  onChange={(url) => setPosterUrl(url || '')}
                  bucket={MEDIA_BUCKETS.FEED_MEDIA}
                  scope={pendingFeedId}
                />
              </div>
              {fieldErrors.posterUrl && <p className="text-[10px] text-destructive" role="alert">{fieldErrors.posterUrl}</p>}

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Tavsif</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qisqacha izoh..." className="admin-input resize-none" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div>
                  <span className="block text-xs font-medium text-foreground">Lentada ko'rsatish</span>
                  <span className="text-[10px] text-muted-foreground">Mijozlar ko'ra oladi</span>
                </div>
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-foreground" />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button type="button" onClick={closeModal} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Bekor qilish</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 disabled:opacity-50 flex items-center gap-1.5 shadow-sm">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : savedSuccess ? <Check className="w-3 h-3" /> : null}
                  {saving ? 'Saqlanmoqda...' : savedSuccess ? 'Saqlandi!' : isCreating ? 'Yaratish' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!videoToDelete} title="Videoni o'chirish" message={`"${videoToDelete?.title}" o'chiriladi.`} onConfirm={handleDeleteConfirm} onCancel={() => setVideoToDelete(null)} />
      <ConfirmDialog isOpen={showResetConfirm} title="Standart holatga qaytarish" message="Barcha video ro'yxati dastlabki namunaga qaytariladi." isDestructive={false} confirmLabel="Tiklash" onConfirm={async () => { await resetToDefault(); setShowResetConfirm(false); }} onCancel={() => setShowResetConfirm(false)} />
    </div>
  );
};

const StatChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md bg-muted/50 border border-border/50 px-1 py-1">
    <div className="text-[11px] font-bold text-foreground tabular-nums">{value}</div>
    <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
  </div>
);

export default FeedAdminPage;