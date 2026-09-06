import React, { useState, useRef } from 'react';
import {
  Film,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
  Package,
  Loader2,
} from 'lucide-react';
import { useVideoFeed } from '../../context/VideoContext';
import { useStore } from '../../context/StoreContext';
import { VideoItem } from '../../types/video';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { VideoUploader } from '../../components/admin/VideoUploader';
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
  const pendingUploadsRef = useRef<{ bucket: string; path: string }[]>([]);

  const recordUploaded = (media: { bucket: string; path: string }) => { pendingUploadsRef.current.push(media); };
  const cleanupPendingUploads = () => { const pending = pendingUploadsRef.current.splice(0, pendingUploadsRef.current.length); for (const item of pending) { void deleteMediaObjects(item.bucket, [item.path]); } };

  const openCreateModal = () => { setTitle(''); setDescription(''); setVideoUrl(''); setPosterUrl(''); setAuthor(''); setProductId(products[0]?.id || ''); setBadge(''); setCategory('all'); setPublished(true); setPendingFeedId('feed-' + Date.now()); setIsCreating(true); setEditingVideo(null); };
  const openEditModal = (v: VideoItem) => { setTitle(v.title); setDescription(v.description || ''); setVideoUrl(v.videoUrl || ''); setPosterUrl(v.posterUrl || ''); setAuthor(v.author || ''); setProductId(v.productId || ''); setBadge(v.badge?.text || ''); setCategory(v.category || 'all'); setPublished(v.published !== false); setPendingFeedId(v.id); setEditingVideo(v); setIsCreating(false); };
  const closeModal = () => { cleanupPendingUploads(); setIsCreating(false); setEditingVideo(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      if (isCreating) {
        const ok = await addVideo({ title: title.trim(), description: description.trim(), videoUrl: videoUrl.trim() || undefined, posterUrl: posterUrl.trim() || undefined, author: author.trim() || undefined, productId: productId || undefined, badge: badge.trim() ? { text: badge.trim(), type: 'new' } : undefined, category: category || 'all', published, order: videos.length + 1 }, pendingFeedId);
        if (ok) { pendingUploadsRef.current = []; setIsCreating(false); } else { cleanupPendingUploads(); }
      } else if (editingVideo) {
        const ok = await updateVideo(editingVideo.id, { title: title.trim(), description: description.trim(), videoUrl: videoUrl.trim() || undefined, posterUrl: posterUrl.trim() || undefined, author: author.trim() || undefined, productId: productId || undefined, badge: badge.trim() ? { text: badge.trim(), type: 'new' } : undefined, category: category || 'all', published });
        if (ok) { pendingUploadsRef.current = []; setEditingVideo(null); } else { cleanupPendingUploads(); }
      }
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

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((vid, idx) => {
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

              <div className="px-3 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <button type="button" disabled={idx === 0} onClick={() => reorderVideos(idx, idx - 1)} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button type="button" disabled={idx === videos.length - 1} onClick={() => reorderVideos(idx, idx + 1)} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => openEditModal(vid)} className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-foreground hover:bg-muted/80 flex items-center gap-1"><Edit className="w-3 h-3" /> Tahrirlash</button>
                  <button type="button" onClick={() => setVideoToDelete(vid)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingVideo) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={closeModal} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-xl bg-card rounded-xl p-6 shadow-xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{isCreating ? 'Yangi video' : 'Videoni tahrirlash'}</h3>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Sarlavha <span className="text-destructive">*</span></label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video sarlavhasi" className="admin-input font-medium" />
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

              <VideoUploader value={videoUrl || undefined} onChange={(url) => setVideoUrl(url || '')} poster={posterUrl || undefined} onPosterChange={(url) => setPosterUrl(url || '')} bucket={MEDIA_BUCKETS.FEED_MEDIA} scope={pendingFeedId} label="Video fayl" helperText="MP4 yoki WebM (100 MB gacha)." onUploaded={recordUploaded} />

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
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isCreating ? 'Yaratish' : 'Saqlash'}
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
