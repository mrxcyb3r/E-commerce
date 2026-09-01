import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Package,
  Layers,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Category } from '../../types/product';

export const CategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useStore();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const openCreateModal = () => {
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800');
    setIsCreating(true);
    setEditingCategory(null);
  };

  const openEditModal = (cat: Category) => {
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setEditingCategory(cat);
    setIsCreating(false);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isCreating || !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isCreating) {
      addCategory({
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        description: description.trim(),
        image: image.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      });
      setIsCreating(false);
    } else if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image: image.trim(),
      });
      setEditingCategory(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Kategoriyalar Boshqaruvi
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Do'kondagi asosiy kiyim va poyabzal bo'limlarini boshqaring ({categories.length} ta kategoriya)
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yangi kategoriya</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="group rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              {/* Category Cover Image */}
              <div className="relative aspect-16/9 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-base font-black text-white leading-tight drop-shadow-sm">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-neutral-300 font-mono mt-0.5">
                      /{cat.slug}
                    </p>
                  </div>
                </div>

                <div className="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Package className="w-3 h-3 text-amber-400" />
                  <span>{cat.productCount ?? 0} ta mahsulot</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-5 space-y-2">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {cat.description || 'Ushbu kategoriya bo\'yicha kiyimlar to\'plami.'}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => reorderCategories(idx, idx - 1)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30"
                  title="Oldinga siljitish"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === categories.length - 1}
                  onClick={() => reorderCategories(idx, idx + 1)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30"
                  title="Keyinga siljitish"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Tahrirlash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setIsCreating(false);
              setEditingCategory(null);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                {isCreating ? 'Yangi Kategoriya Qo\'shish' : 'Kategoriyani Tahrirlash'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
                }}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Kategoriya Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Masalan: Erkaklar Kiyimlari"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Havola (Slug)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="erkaklar-kiyimlari"
                  className="w-full px-4 py-2.5 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Muqova Rasmi URL manzili
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
                {image && (
                  <div className="mt-2 aspect-16/9 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 max-h-32">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qisqacha Tavsif
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kategoriya haqida qisqacha ma'lumot..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCategory(null);
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
        isOpen={!!categoryToDelete}
        title="Kategoriyani o'chirish"
        message={`"${categoryToDelete?.name}" kategoriyasini o'chirishni tasdiqlaysizmi?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
