import React, { useState } from 'react';
import {
  Film,
  Plus,
  Edit,
  Trash2,
  Eye,
  Heart,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Package,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useVideoFeed } from '../../context/VideoContext';
import { useStore } from '../../context/StoreContext';
import { VideoItem } from '../../types/video';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useFeedAdmStats } from '../../hooks/useFeedAdmStats';
import { formatDuration } from '../../components/admin/analytics/util';

export const FeedAdminPage: React.FC = () => {
  const {
    videos,
    addVideo,
    updateVideo,
    deleteVideo,
    togglePublish,
    reorderVideos,
    resetToDefault,
    loading: feedLoading,
  } = useVideoFeed();

  const { products } = useStore();
  const { stats } = useFeedAdmStats();

  const [isCreating, setIsCreating] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [productId, setProductId] = useState<string>('');
  const [badge, setBadge] = useState('');
  const [published, setPublished] = useState(true);

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setPosterUrl('');
    setAuthor('');
    setProductId(products[0]?.id || '');
    setBadge('');
    setPublished(true);
    setIsCreating(true);
    setEditingVideo(null);
  };

  const openEditModal = (v: VideoItem) => {
    setTitle(v.title);
    setDescription(v.description || '');
    setVideoUrl(v.videoUrl || '');
    setPosterUrl(v.posterUrl || '');
    setAuthor(v.author || '');
    setProductId(v.productId || '');
    setBadge(v.badge?.text || '');
    setPublished(v.published !== false);
    setEditingVideo(v);
    setIsCreating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);

    try {
      if (isCreating) {
        const ok = await addVideo({
          title: title.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim() || undefined,
          posterUrl: posterUrl.trim() || undefined,
          author: author.trim() || undefined,
          productId: productId || undefined,
          badge: badge.trim() ? { text: badge.trim(), type: 'new' } : undefined,
          category: 'all',
          published,
          order: videos.length + 1,
        });
        if (ok) setIsCreating(false);
      } else if (editingVideo) {
        const ok = await updateVideo(editingVideo.id, {
          title: title.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim() || undefined,
          posterUrl: posterUrl.trim() || undefined,
          author: author.trim() || undefined,
          productId: productId || undefined,
          badge: badge.trim() ? { text: badge.trim(), type: 'new' } : undefined,
          published,
        });
        if (ok) setEditingVideo(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (videoToDelete) {
      await deleteVideo(videoToDelete.id);
      setVideoToDelete(null);
    }
  };

  const handleTogglePublish = async (id: string) => {
    await togglePublish(id);
  };

  const handleReorder = async (from: number, to: number) => {
    await reorderVideos(from, to);
  };

  const handleReset = async () => {
    await resetToDefault();
    setShowResetConfirm(false);
  };

  if (feedLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
        <span className="ml-3 text-sm text-neutral-500">Videolar yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Jonli Feed / Videolar
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Mijozlar ko'radigan vertikal qisqa videolavhalar va ularga biriktirilgan mahsulotlar ({videos.length} ta video — Supabase)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
            title="Boshlang'ich videolarni qaytarish"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Standart holatga</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yangi video qo'shish</span>
          </button>
        </div>
      </div>

      {/* Videos List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid, idx) => {
          const linkedProduct = products.find((p) => p.id === vid.productId);
          return (
            <div
              key={vid.id}
              className={`group rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all ${
                !vid.published ? 'opacity-60 bg-neutral-50 dark:bg-neutral-950' : ''
              }`}
            >
              <div>
                {/* Poster / Video Preview */}
                <div className="relative aspect-9/16 max-h-72 bg-neutral-900 overflow-hidden">
                  <img
                    src={vid.posterUrl || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      {vid.badge ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider">
                          {vid.badge.text}
                        </span>
                      ) : <div />}

                      <button
                        type="button"
                        onClick={() => handleTogglePublish(vid.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          vid.published
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {vid.published ? 'Faol' : 'Yashirilgan'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-amber-400">
                        {vid.author || '@do\'kon'}
                      </p>
                      <h3 className="text-sm font-extrabold text-white leading-snug line-clamp-2">
                        {vid.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Linked Product Card inside Video Tile */}
                <div className="p-4 space-y-3">
                  {linkedProduct ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                      <img
                        src={linkedProduct.images[0] || ''}
                        alt=""
                        className="w-9 h-9 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase">
                          Biriktirilgan mahsulot:
                        </span>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {linkedProduct.name}
                        </p>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                          {linkedProduct.price.toLocaleString('uz-UZ')} so'm
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-[11px] text-neutral-400 italic">
                      Mahsulot biriktirilmagan
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Film className="w-3.5 h-3.5" />
                      <span>{vid.type === 'collection' ? 'Kolleksiya' : 'Video'}</span>
                    </span>
                    <span className="text-neutral-500 font-mono text-[10px]">
                      {vid.id}
                    </span>
                  </div>

                  {/* Real engagement stats (from Supabase) */}
                  {stats[vid.id] && (
                    <div className="grid grid-cols-4 gap-1.5 pt-2 text-center">
                      <StatChip label="Ko'r" value={stats[vid.id].views.toLocaleString('uz-UZ')} />
                      <StatChip label="👍" value={stats[vid.id].likes.toLocaleString('uz-UZ')} />
                      <StatChip label="Izoh" value={stats[vid.id].comments.toLocaleString('uz-UZ')} />
                      <StatChip label="Vaqt" value={formatDuration(stats[vid.id].watchSec)} />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleReorder(idx, idx - 1)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30"
                    title="Oldinga siljitish"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === videos.length - 1}
                    onClick={() => handleReorder(idx, idx + 1)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30"
                    title="Keyinga siljitish"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(vid)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoToDelete(vid)}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingVideo) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setIsCreating(false);
              setEditingVideo(null);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                {isCreating ? 'Yangi Video / Reel Qo\'shish' : 'Videoni Tahrirlash'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingVideo(null);
                }}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Video Sarlavhasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Bahorgi yangi kolleksiya kiyilish ko'rinishi"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Muallif / Do'kon tegi
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="@do'kon"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Video Belgisi (Badge)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="TOP TANLOV, YANGI, TREND"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Video URL manzili (MP4 yoki WebM)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://... yoki video link"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Muqova / Poster Rasmi URL manzili
                </label>
                <input
                  type="url"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Biriktirilgan Mahsulot
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium"
                >
                  <option value="">-- Mahsulot tanlanmagan --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price.toLocaleString('uz-UZ')} so'm
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qisqacha Tavsif
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Video haqida qisqacha izoh..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <div>
                  <span className="block text-xs font-bold text-neutral-900 dark:text-white">
                    Videolarda ko'rsatish
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Mijozlar lentada ko'ra oladi
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingVideo(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isCreating ? 'Yaratish' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={!!videoToDelete}
        title="Videoni o'chirish"
        message={`"${videoToDelete?.title}" nomli videoni rostdan ham o'chirmoqchimisiz?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setVideoToDelete(null)}
      />

      {/* Reset Modal */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Boshlang'ich videolarni tiklash"
        message="Barcha video ro'yxati dastlabki namuna videolariga qaytariladi. Davom etasizmi?"
        isDestructive={false}
        confirmLabel="Tiklash"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};

const StatChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 px-1 py-1">
    <div className="text-xs font-black text-neutral-900 dark:text-white">{value}</div>
    <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">{label}</div>
  </div>
);
