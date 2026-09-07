import React, { useState, useCallback } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Package,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Category } from '../../types/product';
import { SingleImageUpload } from '../../components/admin/SingleImageUpload';
import { MEDIA_BUCKETS } from '../../lib/supabase/storage';

export const CategoriesPage: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, reorderCategories, bulkUpdateProducts } = useStore();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const openCreateModal = useCallback(() => {
    setName(''); setSlug(''); setDescription(''); setImage('');
    setIsCreating(true); setEditingCategory(null);
    setDeleteError(null); setFieldErrors({}); setSavedSuccess(false);
  }, []);

  const openEditModal = useCallback((cat: Category) => {
    setName(cat.name); setSlug(cat.slug); setDescription(cat.description || ''); setImage(cat.image || '');
    setEditingCategory(cat); setIsCreating(false);
    setDeleteError(null); setFieldErrors({}); setSavedSuccess(false);
  }, []);

  const handleNameChange = useCallback((val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Kategoriya nomi kiritilishi shart";
    if (!slug.trim()) errors.slug = "Slug kiritilishi shart";
    if (name.trim() && slug.trim() && slug.trim().length < 2) errors.slug = "Slug kamida 2 belgidan iborat bo'lishi kerak";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, slug]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSavedSuccess(false);
    setDeleteError(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image: image.trim() || undefined,
      };

      if (isCreating) {
        addCategory(payload);
        setIsCreating(false);
      } else if (editingCategory) {
        updateCategory(editingCategory.id, payload);
        setEditingCategory(null);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save category:', err);
      setDeleteError(err instanceof Error ? err.message : 'Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  }, [name, slug, description, image, isCreating, editingCategory, addCategory, updateCategory, validateForm]);

  const productsInCategory = useCallback((cat: Category | null) => {
    if (!cat) return [];
    return products.filter((p) => p.category === cat.id || p.category === cat.slug || p.categoryName === cat.name);
  }, [products]);

  const categoryHealth = useCallback((cat: Category) => {
    const items = productsInCategory(cat);
    const featured = items.filter((p) => p.isFeatured).length;
    const hidden = items.filter((p) => p.published === false).length;
    const noImage = items.filter((p) => !p.images || p.images.length === 0).length;
    const checks = [
      !!cat.image,
      !!cat.description?.trim(),
      items.length > 0,
      noImage === 0,
    ];
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    return { total: items.length, featured, hidden, noImage, score };
  }, [productsInCategory]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!categoryToDelete) return;
    setDeleteError(null);
    try {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setMoveTargetId('');
    } catch (e: any) {
      setDeleteError(e.message || 'Kategoriyani o\'chirishda xatolik yuz berdi');
    }
  }, [categoryToDelete, deleteCategory]);

  const handleMoveAndDelete = useCallback(async () => {
    if (!categoryToDelete || !moveTargetId) return;
    const target = categories.find((c) => c.id === moveTargetId);
    if (!target) return;
    setDeleteError(null);
    try {
      const ids = productsInCategory(categoryToDelete).map((p) => p.id);
      if (ids.length > 0) bulkUpdateProducts(ids, { category: target.slug });
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setMoveTargetId('');
    } catch (e: any) {
      setDeleteError(e.message || 'Ko‘chirishda xatolik yuz berdi');
    }
  }, [categoryToDelete, moveTargetId, categories, productsInCategory, bulkUpdateProducts, deleteCategory]);

  // Check for duplicate slug
  const duplicateSlug = categories.find(c => c.slug === slug && c.id !== editingCategory?.id);

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

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-4">
            <FolderTree className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Hali kategoriyalar yo'q</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            "Yangi kategoriya" tugmasini bosing va birinchi kategoriyangizni yarating.
          </p>
          <button type="button" onClick={openCreateModal} className="mt-4 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] inline-flex items-center gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Kategoriya yaratish
          </button>
        </div>
      )}

      {/* Grid */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const h = categoryHealth(cat);
            return (
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
                  {h.total}
                </div>
                <div className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${h.score >= 75 ? 'bg-emerald-500/90 text-white' : h.score >= 50 ? 'bg-amber-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                  {h.score}%
                </div>
              </div>

              <div className="p-3 space-y-2">
                <p className="text-[11px] text-muted-foreground line-clamp-2">{cat.description || "Ushbu kategoriya bo'yicha mahsulotlar"}</p>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">★ {h.featured} mashhur</span>
                  {h.hidden > 0 && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">{h.hidden} yashirin</span>}
                  {h.noImage > 0 && <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">{h.noImage} rasmsiz</span>}
                  {!cat.image && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">Muqova yo‘q</span>}
                </div>
              </div>

              <div className="px-3 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <button type="button" disabled={idx === 0} onClick={() => reorderCategories(idx, idx - 1)} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors" title="Oldinga" aria-label="Oldinga surish">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" disabled={idx === categories.length - 1} onClick={() => reorderCategories(idx, idx + 1)} className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors" title="Keyinga" aria-label="Keyinga surish">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => openEditModal(cat)} className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1" aria-label={`${cat.name} ni tahrirlash`}>
                    <Edit className="w-3 h-3" /> Tahrirlash
                  </button>
                  <button type="button" onClick={() => setCategoryToDelete(cat)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="O'chirish" aria-label={`${cat.name} ni o'chirish`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Creating/Editing modal */}
      {(isCreating || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsCreating(false); setEditingCategory(null); setFieldErrors({}); }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-card rounded-xl p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{isCreating ? 'Yangi kategoriya' : 'Kategoriyani tahrirlash'}</h3>
              <button type="button" onClick={() => { setIsCreating(false); setEditingCategory(null); setFieldErrors({}); }} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Yopish"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Nomi <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Masalan: Erkaklar kiyimlari"
                  className={`admin-input font-medium ${fieldErrors.name ? 'border-destructive' : ''}`}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                {fieldErrors.name && <p id="name-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Havola (Slug) <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="erkaklar-kiyimlari"
                  className={`admin-input font-mono text-[11px] ${fieldErrors.slug ? 'border-destructive' : ''}`}
                  aria-invalid={!!fieldErrors.slug}
                  aria-describedby={fieldErrors.slug ? 'slug-error' : undefined}
                />
                {fieldErrors.slug && <p id="slug-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.slug}</p>}
                {duplicateSlug && !isCreating && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1" role="alert">
                    Bu slug allaqachon ishlatilgan. Boshqa slug tanlang.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Muqova rasm</label>
                <SingleImageUpload
                  label="Kategoriya rasmi"
                  value={image || undefined}
                  onChange={(url) => setImage(url || '')}
                  bucket={MEDIA_BUCKETS.STORE_ASSETS}
                  scope={`categories/${editingCategory?.id || 'new'}`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Tavsif</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qisqacha ma'lumot..." className="admin-input resize-none" />
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => { setIsCreating(false); setEditingCategory(null); setFieldErrors({}); }} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Bekor qilish</button>
                <button type="submit" disabled={isSaving} className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation with move-before-delete */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setCategoryToDelete(null); setDeleteError(null); setMoveTargetId(''); }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-card rounded-xl p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Kategoriyani o‘chirish</h3>
              <button type="button" onClick={() => { setCategoryToDelete(null); setDeleteError(null); setMoveTargetId(''); }} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Yopish"><X className="w-4 h-4" /></button>
            </div>

            {(() => {
              const count = productsInCategory(categoryToDelete).length;
              const targets = categories.filter((c) => c.id !== categoryToDelete.id);
              return (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      <strong>“{categoryToDelete.name}”</strong> o‘chiriladi.
                      {count > 0 ? (
                        <> Bu kategoriyada <strong>{count} ta mahsulot</strong> bor. O‘chirishdan oldin ularni boshqa kategoriyaga ko‘chiring.</>
                      ) : (
                        <> Bu kategoriyada mahsulot yo‘q — xavfsiz o‘chirish mumkin.</>
                      )}
                    </p>
                  </div>
                  {count > 0 && (
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Mahsulotlarni ko‘chirish</label>
                      <select value={moveTargetId} onChange={(e) => setMoveTargetId(e.target.value)} className="admin-input font-medium" aria-label="Qayerga ko‘chirish">
                        <option value="">Kategoriya tanlang…</option>
                        {targets.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>
                  )}
                  {deleteError && <p className="text-[11px] text-destructive font-medium" role="alert">{deleteError}</p>}
                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                    <button type="button" onClick={() => { setCategoryToDelete(null); setDeleteError(null); setMoveTargetId(''); }} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Bekor qilish</button>
                    {count > 0 ? (
                      <button type="button" disabled={!moveTargetId} onClick={handleMoveAndDelete} className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all shadow-sm disabled:opacity-40">Ko‘chirib o‘chirish</button>
                    ) : (
                      <button type="button" onClick={handleDeleteConfirm} className="px-4 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all shadow-sm">Ha, o‘chirilsin</button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;