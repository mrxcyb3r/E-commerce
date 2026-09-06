import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Copy,
  Check,
  Edit,
  Trash2,
  Star,
  ExternalLink,
  X,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { ClothingPromptItem } from '../../types/prompt';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

const CATEGORIES = [
  "Erkaklar kiyimlari (Men's Wear)",
  "Ayollar kiyimlari (Women's Fashion)",
  "Bolalar va o'smirlar kiyimlari (Kids & Teens)",
  "Poyabzallar (Footwear & Shoes)",
  "Sport kiyimlari (Sportswear)",
  "Mavsumiy va aksiyalar (Seasonal & Campaigns)",
];

export const PromptsAdminPage: React.FC = () => {
  const { prompts, addPrompt, updatePrompt, deletePrompt, duplicatePrompt, togglePromptPublished, togglePromptFeatured } = useStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<ClothingPromptItem | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<ClothingPromptItem | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState('');
  const [productType, setProductType] = useState('');
  const [description, setDescription] = useState('');
  const [useCase, setUseCase] = useState('');
  const [promptText, setPromptText] = useState('');
  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesPrompt = p.prompt.toLowerCase().includes(q);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesPrompt && !matchesTags) return false;
      }
      if (selectedCategory !== 'all') {
        if (!p.category.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0])) return false;
      }
      return true;
    });
  }, [prompts, searchQuery, selectedCategory]);

  const handleCopy = (id: string, text: string) => { navigator.clipboard?.writeText(text).catch(() => {}); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); showToast('Prompt nusxalandi'); };

  const openCreateModal = () => {
    setTitle(''); setCategory(CATEGORIES[0]); setSubcategory('Klassik'); setProductType('Kostyum-shim');
    setDescription('Rasmiy kiyimlar uchun fotorealistik studiya surati.'); setUseCase("Instagram postlari, katalog uchun.");
    setPromptText(`Analyze the uploaded clothing item. Preserve the lapel cut, button spacing, shoulder structure, and exact fabric weave pattern.\n\nScene: Minimalist luxury studio with warm charcoal wall and soft edge lighting.\nModel: Confident model posing naturally.\nLighting: Professional softbox lighting with crisp edge highlights.\nOrientation: 4:5 vertical.`);
    setAspectRatio('4:5'); setDifficulty('Beginner'); setTags(['menswear', 'suit', 'classic', 'studio']); setFeatured(false); setPublished(true);
    setIsCreating(true); setEditingPrompt(null);
  };

  const openEditModal = (pr: ClothingPromptItem) => {
    setTitle(pr.title); setCategory(pr.category); setSubcategory(pr.subcategory); setProductType(pr.productType);
    setDescription(pr.description); setUseCase(pr.useCase || ''); setPromptText(pr.prompt); setAspectRatio(pr.aspectRatio || '4:5');
    setDifficulty((pr.difficulty as any) || 'Beginner'); setTags(pr.tags || []); setFeatured(!!pr.featured); setPublished(pr.published !== false);
    setEditingPrompt(pr); setIsCreating(false);
  };

  const handleAddTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) { setTags([...tags, tagInput.trim().toLowerCase()]); setTagInput(''); } };
  const handleRemoveTag = (t: string) => setTags(tags.filter((item) => item !== t));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) return;
    const data = { title: title.trim(), category: category.trim(), subcategory: subcategory.trim() || 'General', productType: productType.trim() || 'Clothing', description: description.trim(), useCase: useCase.trim(), prompt: promptText.trim(), aspectRatio, difficulty, tags, featured, published };
    if (isCreating) { addPrompt(data); setIsCreating(false); }
    else if (editingPrompt) { updatePrompt(editingPrompt.id, data); setEditingPrompt(null); }
  };

  const handleDeleteConfirm = () => { if (promptToDelete) { deletePrompt(promptToDelete.id); setPromptToDelete(null); } };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">AI Prompt Kutubxonasi</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{prompts.length} ta prompt</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/prompts" target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" /> Kutubxona
          </a>
          <button type="button" onClick={openCreateModal} className="px-3.5 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Yangi prompt
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-3 rounded-xl bg-card border border-border space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Prompt nomi, kiyim turi yoki kalit so'z..." className="admin-input pl-9 font-medium" />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="admin-input font-medium">
            <option value="all">Barcha toifalar</option>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((item) => (
          <div key={item.id} className={`bg-card border border-border rounded-xl p-4 hover:border-muted-foreground/20 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 ${!item.published ? 'opacity-60' : ''}`}>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">{item.category} · {item.subcategory}</span>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-medium text-muted-foreground">{item.aspectRatio || '4:5'}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${item.difficulty === 'Advanced' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' : item.difficulty === 'Intermediate' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'}`}>{item.difficulty}</span>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-foreground leading-snug">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>

              {item.useCase && (
                <div className="mt-2 p-2 rounded-lg bg-muted/50 border border-border/50 text-[10px] text-muted-foreground">
                  <strong className="text-foreground">Qo'llanishi:</strong> {item.useCase}
                </div>
              )}

              <div className="mt-2.5 relative group">
                <pre className="p-3 rounded-lg bg-muted text-foreground text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto border border-border scrollbar-thin">{item.prompt}</pre>
                <button type="button" onClick={() => handleCopy(item.id, item.prompt)} className="absolute top-2 right-2 px-2 py-1 rounded-md bg-foreground text-background text-[10px] font-semibold flex items-center gap-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedId === item.id ? <><Check className="w-3 h-3" /> Nusxalandi</> : <><Copy className="w-3 h-3" /> Nusxalash</>}
                </button>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((t) => (<span key={t} className="px-1.5 py-0.5 rounded bg-muted text-[9px] text-muted-foreground font-medium">#{t}</span>))}
                </div>
              )}
            </div>

            <div className="pt-2.5 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => togglePromptFeatured(item.id)} className={`p-1.5 rounded-md text-[11px] font-medium transition-colors ${item.featured ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`} title={item.featured ? "Tanlanganlardan chiqarish" : "Tanlangan qilish"}>
                  <Star className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => togglePromptPublished(item.id)} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${item.published ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                  {item.published ? 'Faol' : 'Yashirin'}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => duplicatePrompt(item.id)} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground" title="Nusxa"><FileText className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => openEditModal(item)} className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-foreground hover:bg-muted/80 flex items-center gap-1"><Edit className="w-3 h-3" /> Tahrirlash</button>
                <button type="button" onClick={() => setPromptToDelete(item)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {(isCreating || editingPrompt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsCreating(false); setEditingPrompt(null); }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-2xl bg-card rounded-xl p-6 shadow-xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{isCreating ? 'Yangi prompt' : 'Promptni tahrirlash'}</h3>
              <button type="button" onClick={() => { setIsCreating(false); setEditingPrompt(null); }} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Sarlavha <span className="text-destructive">*</span></label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Prompt sarlavhasi" className="admin-input font-medium" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Toifa</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input text-[11px]">{CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}</select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Ichki bo'lim</label>
                  <input type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="Klassik" className="admin-input text-[11px]" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Kiyim turi</label>
                  <input type="text" value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="Kostyum-shim" className="admin-input text-[11px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">O'lcham nisbati</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="admin-input text-[11px]">
                    <option value="4:5">4:5 (Instagram)</option>
                    <option value="9:16">9:16 (Reels/TikTok)</option>
                    <option value="1:1">1:1 (Kvadrat)</option>
                    <option value="16:9">16:9 (Landshaft)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Murakkablik</label>
                  <select value={difficulty} onChange={(e: any) => setDifficulty(e.target.value)} className="admin-input text-[11px]">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">AI Prompt matni <span className="text-destructive">*</span></label>
                <textarea rows={5} required value={promptText} onChange={(e) => setPromptText(e.target.value)} placeholder="Analyze the uploaded clothing item..." className="admin-input font-mono text-[11px] leading-relaxed resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Tavsif</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qisqacha tavsif" className="admin-input text-[11px]" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Qo'llanishi</label>
                  <input type="text" value={useCase} onChange={(e) => setUseCase(e.target.value)} placeholder="Instagram, katalog..." className="admin-input text-[11px]" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Teglar</label>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="teg qo'shish..." className="admin-input text-[11px] flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} />
                  <button type="button" onClick={handleAddTag} className="px-2.5 py-1 rounded-md bg-muted text-[11px] font-medium text-foreground">+</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (<span key={t} className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground flex items-center gap-1">#{t}<button type="button" onClick={() => handleRemoveTag(t)} className="text-muted-foreground/50 hover:text-destructive"><X className="w-2.5 h-2.5" /></button></span>))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => { setIsCreating(false); setEditingPrompt(null); }} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">Bekor qilish</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 shadow-sm">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!promptToDelete} title="Promptni o'chirish" message={`"${promptToDelete?.title}" o'chiriladi.`} onConfirm={handleDeleteConfirm} onCancel={() => setPromptToDelete(null)} />
    </div>
  );
};
