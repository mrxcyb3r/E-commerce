import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Edit,
  Trash2,
  Star,
  Check,
  X,
  User,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Review } from '../../types/review';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

export const TestimonialsAdminPage: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial, toggleTestimonialPublished } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [avatar, setAvatar] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const openCreateModal = () => {
    setName('');
    setRole('Mijoz (Jizzax)');
    setComment('');
    setRating(5);
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setDate(new Date().toISOString().split('T')[0]);
    setIsCreating(true);
    setEditingReview(null);
  };

  const openEditModal = (rev: Review) => {
    setName(rev.name);
    setRole(rev.role || '');
    setComment(rev.comment);
    setRating(rev.rating);
    setAvatar(rev.avatar || '');
    setDate(rev.date || new Date().toISOString().split('T')[0]);
    setEditingReview(rev);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    if (isCreating) {
      addTestimonial({
        name: name.trim(),
        role: role.trim(),
        comment: comment.trim(),
        rating,
        avatar: avatar.trim(),
        date,
        verifiedVisit: true,
      });
      setIsCreating(false);
    } else if (editingReview) {
      updateTestimonial(editingReview.id, {
        name: name.trim(),
        role: role.trim(),
        comment: comment.trim(),
        rating,
        avatar: avatar.trim(),
        date,
        verifiedVisit: true,
      });
      setEditingReview(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (reviewToDelete) {
      deleteTestimonial(reviewToDelete.id);
      setReviewToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Mijozlar Sharhlari (Testimonials)
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Bosh sahifada va do'konda ko'rsatiladigan mijozlar fikrlari ({testimonials.length} ta sharh)
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi sharh qo'shish</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((rev) => (
          <div
            key={rev.id}
            className={`p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all ${
              rev.published === false ? 'opacity-60 bg-neutral-50 dark:bg-neutral-950' : ''
            }`}
          >
            <div className="space-y-3">
              {/* Rating Stars & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => toggleTestimonialPublished(rev.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rev.published !== false
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {rev.published !== false ? 'Faol' : 'Yashirilgan'}
                </button>
              </div>

              {/* Comment */}
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                "{rev.comment}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={rev.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    {rev.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400">
                    {rev.role} • {rev.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => openEditModal(rev)}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewToDelete(rev)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {(isCreating || editingReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setIsCreating(false);
              setEditingReview(null);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                {isCreating ? 'Yangi Sharh Qo\'shish' : 'Sharhni Tahrirlash'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingReview(null);
                }}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mijoz Ismi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Sardor Rahimov"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kasbi / Shahri
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Mijoz (Jizzax)"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Baholash (Yulduzlar)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold"
                  >
                    <option value={5}>★★★★★ (5 yulduz)</option>
                    <option value={4}>★★★★☆ (4 yulduz)</option>
                    <option value={3}>★★★☆☆ (3 yulduz)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Avatar / Rasm URL manzili
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Sharh Matni <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Kiyimlarning sifati va xizmat haqida fikr..."
                  className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={!!reviewToDelete}
        title="Sharhni o'chirish"
        message={`"${reviewToDelete?.name}" sharhini o'chirishni tasdiqlaysizmi?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
};
