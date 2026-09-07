import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Package,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Category } from '../../types/product';

export const CategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useStore();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const openCreateModal = () => {
    setName(''); setSlug(''); setDescription('');
    setImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800');
    setIsCreating(true); setEditingCategory(null);
    setDeleteError(null);
  };

  const openEditModal = (cat: Category) => {
    setName(cat.name); setSlug(cat.slug); setDescription(cat.description || ''); setImage(cat.image || '');
    setEditingCategory(cat); setIsCreating(false);
    setDeleteError(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isCreating || !slug) setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isCreating) {
      addCategory({ name: name.trim(), slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'), description: description.trim(), image: image.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800' });
      setIsCreating(false);
    } else if (editingCategory) {
      updateCategory(editingCategory.id, { name: name.trim(), slug: slug.trim(), description: description.trim(), image: image.trim() });
      setEditingCategory(null);
    }
  };

  const handleDeleteConfirm = () => {
    setDeleteError(null);
    try {
      deleteCategory(categoryToDelete!.id);
      setCategoryToDelete(null);
    } catch (e: any) {
      setDeleteError(e.message || 'Kategoriyani o\'chirishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Kategoriyalar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{categories.length} ta kategoriya</p>
        </div>
        <button type="button" onClick={openCreateModal} className="px-3.5 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Yangi kategoriya
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => (
          <div key={cat.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-muted-foreground/20 hover:shadow-sm transition-all">
            <div className="relative aspect-16/9 bg-muted overflow-hidden">
              <img src={cat.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-3">
                <div>
                  <h3 className="text-sm font-semibold text-white leading-tight">{cat.name}</h3>
                  <p className="text-[10px] text-white/60 font-mono mt-0.5">/{cat.slug}</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <Package className="w-3 h-3" />
                {cat.productCount ?? 0}
              </div>
            </div>

            <div className="p-3">
              <p className="text-[11px] text-muted-foreground line-clamp-2">{cat.description || "Ushbu kategoriya bo'yicha mahsulotlar"}</p>
            </div>

            <div className="px-3 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <button type="button" disabled={idx === 0} onClick={() => reorderCategories(idx, idx - 1)} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors" title="Oldinga">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" disabled={idx === categories.length - 1} onClick={() => reorderCategories(idx, idx + 1)} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors" title="Keyinga">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-0.5">
                <button type="button" onClick={() => openEditModal(cat)} className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1">
                  <Edit className="w-3 h-3" /> Tahrirlash
                </button>
                <button type="button" onClick={() => setCategoryToDelete(cat)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="O'chirish">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creating/Editing modal */}
      {(isCreating || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsCreating(false); setEditingCategory(null); }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-card rounded-xl p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{isCreating ? 'Yangi kategoriya' : 'Kategoriyani tahrirlash'}</h3>
              <button type="button" onClick={() => { setIsCreating(false); setEditingCategory(null); }} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Nomi <span className="text-destructive">*</span></label>
                <input type="text" required value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Masalan: Erkaklar kiyimlari" className="admin-input font-medium" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Havola (Slug)</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="erkaklar-kiyimlari" className="admin-input font-mono text-[11px]" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Muqova rasm URL</label>
                <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="admin-input" />
                {image && <div className="mt-2 aspect-16/9 rounded-lg overflow-hidden border border-border max-h-24"><img src={image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Tavsif</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qisqacha ma'lumot..." className="admin-input resize-none" />
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => { setIsCreating(false); setEditingCategory(null); }} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Bekor qilish</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all shadow-sm">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation with error handling */}
      {categoryToDelete && deleteError === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setCategoryToDelete(null); setDeleteError(null); }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-card rounded-xl p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Kategoriyani o'chirish</h3>
              <button type="button" onClick={() => { setCategoryToDelete(null); setDeleteError(null); }} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <p className="text-[11px] text-muted-foreground mb-4">
              Bu kategoriya mahsulotlari mavjud. Avval mahsulotlarni boshqa kategoriyaga o'tkazing.
            </p>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
              <button type="button" onClick={() => { setCategoryToDelete(null); setDeleteError(null); }} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Bekor qilish</button>
              <button type="button" onClick={handleDeleteConfirm} className="px-4 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all shadow-sm">
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!categoryToDelete && !deleteError} title="Kategoriyani o'chirish" message={`"${categoryToDelete?.name}" o'chiriladi.`} confirmLabel="Ha, o'chirilsin" onConfirm={handleDeleteConfirm} onCancel={() => setCategoryToDelete(null)} />
    </div>
  );
};