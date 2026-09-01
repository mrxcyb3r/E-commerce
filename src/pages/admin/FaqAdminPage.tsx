import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FaqItem } from '../../types/faq';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

export const FaqAdminPage: React.FC = () => {
  const { faq, addFaq, updateFaq, deleteFaq, toggleFaqPublished } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);

  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Xarid va To\'lov');

  const openCreateModal = () => {
    setQuestion('');
    setAnswer('');
    setCategory('Xarid va To\'lov');
    setIsCreating(true);
    setEditingFaq(null);
  };

  const openEditModal = (item: FaqItem) => {
    setQuestion(item.question);
    setAnswer(item.answer);
    setCategory(item.category || 'Xarid va To\'lov');
    setEditingFaq(item);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    if (isCreating) {
      addFaq({
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
      });
      setIsCreating(false);
    } else if (editingFaq) {
      updateFaq(editingFaq.id, {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
      });
      setEditingFaq(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (faqToDelete) {
      deleteFaq(faqToDelete.id);
      setFaqToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Savol-Javoblar (FAQ) Boshqaruvi
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Mijozlar eng ko'p so'raydigan savollarga tayyor javoblarni boshqaring ({faq.length} ta savol)
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi savol-javob</span>
        </button>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faq.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              item.published === false ? 'opacity-60 bg-neutral-50 dark:bg-neutral-950' : ''
            }`}
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              {item.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {item.category}
                </span>
              )}
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {item.question}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                {item.answer}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => toggleFaqPublished(item.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                  item.published !== false
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                {item.published !== false ? 'Faol' : 'Yashirilgan'}
              </button>

              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Tahrirlash</span>
              </button>

              <button
                type="button"
                onClick={() => setFaqToDelete(item)}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {(isCreating || editingFaq) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setIsCreating(false);
              setEditingFaq(null);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                {isCreating ? 'Yangi Savol-Javob Qo\'shish' : 'Savol-Javobni Tahrirlash'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingFaq(null);
                }}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Kategoriya / Bo'lim
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Xarid, O'lchamlar, Yetkazib berish..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Savol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Masalan: Do'konga kelib kiyib ko'rsa bo'ladimi?"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Javob <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Batafsil tushuntirish va ma'lumot..."
                  className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingFaq(null);
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
        isOpen={!!faqToDelete}
        title="Savol-javobni o'chirish"
        message={`"${faqToDelete?.question}" savolini o'chirishni tasdiqlaysizmi?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setFaqToDelete(null)}
      />
    </div>
  );
};
