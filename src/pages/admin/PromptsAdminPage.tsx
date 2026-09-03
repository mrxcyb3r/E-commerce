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
  Layers,
  Sparkle,
  X,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ClothingPromptItem } from '../../types/prompt';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

const CATEGORIES = [
  "Erkaklar Kiyimlari (Men's Wear)",
  "Ayollar Kiyimlari (Women's Fashion)",
  "Bolalar Kiyimlari (Kids & Teens)",
  "Poyabzallar (Footwear & Shoes)",
  "Sport Kiyimlari (Sportswear)",
  "Mavsumiy & Aksiya (Seasonal & Campaigns)",
];

export const PromptsAdminPage: React.FC = () => {
  const {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    togglePromptPublished,
    togglePromptFeatured,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<ClothingPromptItem | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<ClothingPromptItem | null>(null);

  // Form State
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
        if (!p.category.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0])) {
          return false;
        }
      }

      return true;
    });
  }, [prompts, searchQuery, selectedCategory]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setTitle('');
    setCategory("Erkaklar Kiyimlari (Men's Wear)");
    setSubcategory('Klassik');
    setProductType('Kostyum-shim');
    setDescription('Rasmiy kiyimlar uchun fotorealistik studiya surati.');
    setUseCase('Instagram postlari, katalog va onlayn do\'kon uchun eng qulay.');
    setPromptText(`Analyze the uploaded clothing item. Preserve the lapel cut, button spacing, shoulder structure, and exact fabric weave pattern.

Scene: Minimalist luxury studio with warm charcoal wall and soft edge lighting.
Model: Confident model posing naturally.
Lighting: Professional softbox lighting with crisp edge highlights.
Orientation: 4:5 vertical.`);
    setAspectRatio('4:5');
    setDifficulty('Beginner');
    setTags(['menswear', 'suit', 'classic', 'studio']);
    setFeatured(false);
    setPublished(true);
    setIsCreating(true);
    setEditingPrompt(null);
  };

  const openEditModal = (pr: ClothingPromptItem) => {
    setTitle(pr.title);
    setCategory(pr.category);
    setSubcategory(pr.subcategory);
    setProductType(pr.productType);
    setDescription(pr.description);
    setUseCase(pr.useCase || '');
    setPromptText(pr.prompt);
    setAspectRatio(pr.aspectRatio || '4:5');
    setDifficulty((pr.difficulty as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner');
    setTags(pr.tags || []);
    setFeatured(!!pr.featured);
    setPublished(pr.published !== false);
    setEditingPrompt(pr);
    setIsCreating(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) return;

    if (isCreating) {
      addPrompt({
        title: title.trim(),
        category: category.trim(),
        subcategory: subcategory.trim() || 'General',
        productType: productType.trim() || 'Clothing',
        description: description.trim(),
        useCase: useCase.trim(),
        prompt: promptText.trim(),
        aspectRatio,
        difficulty,
        tags,
        featured,
        published,
      });
      setIsCreating(false);
    } else if (editingPrompt) {
      updatePrompt(editingPrompt.id, {
        title: title.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
        productType: productType.trim(),
        description: description.trim(),
        useCase: useCase.trim(),
        prompt: promptText.trim(),
        aspectRatio,
        difficulty,
        tags,
        featured,
        published,
      });
      setEditingPrompt(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (promptToDelete) {
      deletePrompt(promptToDelete.id);
      setPromptToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            AI Prompt Kutubxonasi Boshqaruvi
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Do'kondagi barcha kiyimlar uchun tayyorlangan sun'iy intellekt promptlari ({prompts.length} ta prompt)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/prompts"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Kutubxona sahifasi</span>
          </a>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yangi prompt</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Prompt nomi, kiyim turi yoki kalit so'z bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="all">Barcha toifalar</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Prompts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrompts.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
              !item.published ? 'opacity-60 bg-neutral-50 dark:bg-neutral-950' : ''
            }`}
          >
            <div>
              {/* Category, Difficulty and Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {item.category} • {item.subcategory}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                    {item.aspectRatio || '4:5'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.difficulty === 'Advanced'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : item.difficulty === 'Intermediate'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {item.difficulty}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                {item.description}
              </p>

              {item.useCase && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300">
                  <strong className="text-neutral-900 dark:text-white font-bold">Qo'llanishi: </strong>
                  {item.useCase}
                </div>
              )}

              {/* Prompt Text Box with Copy Action */}
              <div className="mt-3.5 relative group">
                <pre className="p-3.5 rounded-2xl bg-neutral-950 text-neutral-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-neutral-800 scrollbar-thin">
                  {item.prompt}
                </pre>
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.prompt)}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Nusxalandi!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxalash</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-500 font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card Actions Footer */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => togglePromptFeatured(item.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                    item.featured
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  }`}
                  title={item.featured ? "Tanlanganlardan chiqarish" : "Tanlangan qilish"}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={() => togglePromptPublished(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                    item.published
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {item.published ? 'Faol' : 'Yashirilgan'}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => duplicatePrompt(item.id)}
                  className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300"
                  title="Nusxa yaratish"
                >
                  <FileText className="w-4 h-4" />
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
                  onClick={() => setPromptToDelete(item)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
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
      {(isCreating || editingPrompt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => {
              setIsCreating(false);
              setEditingPrompt(null);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                {isCreating ? 'Yangi AI Prompt Qo\'shish' : 'Promptni Tahrirlash'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPrompt(null);
                }}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Prompt Sarlavhasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Erkaklar Qishki Palto — Qorli Shahar Ko'chasi"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Toifa
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ichki Bo'lim (Subcategory)
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Masalan: Palto, Klassika"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kiyim Turi
                  </label>
                  <input
                    type="text"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="Masalan: Qishki Jun Palto"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    O'lcham Nisbati (Aspect Ratio)
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="4:5">4:5 (Instagram Post / Mahsulot)</option>
                    <option value="9:16">9:16 (Reels / TikTok / Story)</option>
                    <option value="1:1">1:1 (Kvadrat)</option>
                    <option value="16:9">16:9 (Landshaft / Banner)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Murakkablik Darajasi
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner (Oson)</option>
                    <option value="Intermediate">Intermediate (O'rtacha)</option>
                    <option value="Advanced">Advanced (Murakkab)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  AI Prompt Matni <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Analyze the uploaded clothing item..."
                  className="w-full px-4 py-3 text-xs font-mono leading-relaxed rounded-xl bg-neutral-950 text-neutral-200 border border-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qisqacha Tavsif va Tavsiya
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kiyimni professional uslubda ko'rsatish..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qayerda Qo'llash Maqsadga Muvofiq? (Use Case)
                </label>
                <input
                  type="text"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="Instagram reklamalari, e-commerce katalogi..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              {/* Tags Editor */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Teglar
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="teg qo'shish..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 text-white text-xs font-bold"
                  >
                    + Qo'shish
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-neutral-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPrompt(null);
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
        isOpen={!!promptToDelete}
        title="Promptni o'chirish"
        message={`"${promptToDelete?.title}" nomli AI promptni o'chirishni tasdiqlaysizmi?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPromptToDelete(null)}
      />
    </div>
  );
};
