import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Copy,
  Check,
  Tag,
  Star,
  ExternalLink,
  Layers,
  Filter,
  Info,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/common/ToastProvider';
import { ClothingPromptItem } from '../types/prompt';

export const PromptLibraryPage: React.FC = () => {
  const { prompts } = useStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((p) => {
      if (p.published === false) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesPrompt = p.prompt.toLowerCase().includes(q);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesPrompt && !matchesTags) return false;
      }

      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [prompts, searchQuery, selectedCategory, selectedDifficulty]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Prompt nusxalandi');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Kiyim & Moda Prompt Kutubxonasi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Fotorealistik Kiyim Reklamalari Uchun{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-amber-600">
              Tayyor Promptlar
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Kiyimlaringiz rasmini yuklab, Midjourney, Imagen yoki boshqa AI modellarida professional katalog va Instagram tasmalariga mos fotolavhalar yarating.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Prompt nomi, kiyim turi yoki kalit so'z..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-border text-foreground placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-border text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value="all">Barcha Toifalar</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-border text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value="all">Barcha Darajalar</option>
                <option value="Beginner">Boshlang'ich (Beginner)</option>
                <option value="Intermediate">O'rtacha (Intermediate)</option>
                <option value="Advanced">Murakkab (Advanced)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrompts.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-card border border-border/80 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {item.category} • {item.subcategory}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
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

                <h3 className="text-base sm:text-lg font-black text-foreground leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  {item.description}
                </p>

                {item.useCase && (
                  <div className="mt-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-border text-xs text-zinc-600 dark:text-zinc-300">
                    <strong className="text-foreground font-bold">Tavsiya etilgan joy: </strong>
                    {item.useCase}
                  </div>
                )}

                {/* Prompt Box */}
                <div className="mt-4 relative group">
                  <pre className="p-4 rounded-2xl bg-background text-zinc-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto border border-border scrollbar-thin">
                    {item.prompt}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.prompt)}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-accent hover:brightness-110 text-accent-foreground text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Nusxalandi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Promptni Nusxalash</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-500 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
