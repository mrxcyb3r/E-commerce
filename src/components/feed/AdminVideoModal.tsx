import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Link as LinkIcon, 
  ShoppingBag, 
  RotateCcw,
  Sparkles,
  Video as VideoIcon
} from 'lucide-react';
import { useVideoFeed } from '../../context/VideoContext';
import { useStore } from '../../context/StoreContext';
import { VideoBadgeType } from '../../types/video';
import { motion, AnimatePresence } from 'motion/react';

interface AdminVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminVideoModal: React.FC<AdminVideoModalProps> = ({ isOpen, onClose }) => {
  const { videos, addVideo, deleteVideo, togglePublish, resetToDefault } = useVideoFeed();
  const { products: PRODUCTS } = useStore();
  
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // Form state for adding new video
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [productId, setProductId] = useState('');
  const [category, setCategory] = useState('all');
  const [badgeText, setBadgeText] = useState('YANGI');
  const [badgeType, setBadgeType] = useState<VideoBadgeType>('new');
  const [hasBadge, setHasBadge] = useState(true);

  // File upload simulation for video
  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handlePosterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPosterUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl) return;

    addVideo({
      title,
      description,
      videoUrl,
      posterUrl: posterUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
      productId: productId || undefined,
      category,
      badge: hasBadge && badgeText ? { text: badgeText, type: badgeType } : undefined,
      order: videos.length + 1,
      published: true,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setPosterUrl('');
    setProductId('');
    setActiveTab('list');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
              <VideoIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white font-['Outfit',sans-serif] tracking-tight">
                Videolar boshqaruvi
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Do'kon uchun qisqa video roliklarni qo'shing va boshqaring
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-3 text-xs sm:text-sm font-black border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Mavjud videolar ({videos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`pb-3 text-xs sm:text-sm font-black border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Yangi video qo'shish</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500">
                  {videos.length} ta video mavjud
                </span>
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Namunaviy videolarga qaytarish</span>
                </button>
              </div>

              {videos.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm font-bold text-zinc-400">Hozircha hech qanday video qo'shilmagan.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-black"
                  >
                    Birinchi videoni qo'shish
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {videos.map((vid, idx) => {
                    const attachedProd = PRODUCTS.find((p) => p.id === vid.productId);

                    return (
                      <div
                        key={vid.id}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 gap-3"
                      >
                        {/* Video Thumbnail & Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold text-zinc-400 w-4 text-center">
                            {idx + 1}
                          </span>
                          <div className="w-12 h-16 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                            <img
                              src={vid.posterUrl}
                              alt={vid.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-zinc-900 dark:text-white truncate">
                                {vid.title}
                              </h4>
                              {vid.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-zinc-950 shrink-0">
                                  {vid.badge.text}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              {attachedProd ? `Biriktirilgan: ${attachedProd.name}` : 'Umumiy video (Mahsulotsiz)'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => togglePublish(vid.id)}
                            className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                              vid.published
                                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                : 'text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                            title={vid.published ? 'E\'londan olish' : 'E\'lon qilish'}
                          >
                            {vid.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteVideo(vid.id)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Add New Video Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Video sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Yangi Premium Krossovka sharhi"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-transparent focus:border-zinc-900 dark:focus:border-white focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Qisqa tavsif
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Video haqida qisqacha ma'lumot..."
                  className="w-full px-4 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-transparent focus:border-zinc-900 dark:focus:border-white focus:outline-none font-medium resize-none"
                />
              </div>

              {/* Video Source */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Video manbasi (MP4 URL yoki telefon/kompyuterdan yuklash) *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://.../video.mp4"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-transparent focus:border-zinc-900 dark:focus:border-white focus:outline-none font-mono text-xs"
                    />
                  </div>
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Faylni yuklash</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Poster Image */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Muqova rasmi (Poster URL yoki yuklash)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-transparent focus:border-zinc-900 dark:focus:border-white focus:outline-none font-mono text-xs"
                  />
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Rasm</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Connected Product Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Biriktiriladigan mahsulot</span>
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-transparent focus:border-zinc-900 dark:focus:border-white focus:outline-none font-medium cursor-pointer"
                >
                  <option value="">Mahsulotsiz (Umumiy video)</option>
                  {PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} — {new Intl.NumberFormat('uz-UZ').format(prod.price)} so'm ({prod.categoryName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Toifa
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-transparent focus:border-zinc-900 dark:focus:border-white focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="all">Barchasi</option>
                    <option value="erkaklar">Erkaklar kiyimlari</option>
                    <option value="ayollar">Ayollar kiyimlari</option>
                    <option value="oyoq-kiyimlar">Oyoq kiyimlar</option>
                    <option value="aksessuarlar">Aksessuarlar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Yorliq (Badge)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="YANGI / CHEGIRMA"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-transparent focus:border-zinc-900 dark:focus:border-white focus:outline-none font-black uppercase tracking-wider text-xs"
                    />
                    <select
                      value={badgeType}
                      onChange={(e) => setBadgeType(e.target.value as VideoBadgeType)}
                      className="px-3 py-2.5 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold cursor-pointer"
                    >
                      <option value="new">Yangi (Sariq)</option>
                      <option value="sale">Chegirma (Qizil)</option>
                      <option value="featured">Hit (Oq)</option>
                      <option value="store">Do'kon (Yashil)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={!title || !videoUrl}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 shadow-md"
                >
                  Videoni nashr etish
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
