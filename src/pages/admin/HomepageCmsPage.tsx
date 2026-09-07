import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home,
  Save,
  Check,
  Sparkles,
  Layers,
  Star,
  Image as ImageIcon,
  Tag,
  ShieldCheck,
  Eye,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Loader2,
  AlertCircle,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SingleImageUpload } from '../../components/admin/SingleImageUpload';
import { MEDIA_BUCKETS } from '../../lib/supabase/storage';
import { HomepageSlide } from '../../types/cms';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

export const HomepageCmsPage: React.FC = () => {
  const { homepageCms, updateHomepageCms, homepageSlides, publishHomepageSlides } = useStore();

  const [heroBadge, setHeroBadge] = useState(homepageCms.hero.badge);
  const [heroTitle, setHeroTitle] = useState(homepageCms.hero.title);
  const [heroHighlightedTitle, setHeroHighlightedTitle] = useState(homepageCms.hero.highlightedTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(homepageCms.hero.subtitle);
  const [heroPrimaryButtonText, setHeroPrimaryButtonText] = useState(homepageCms.hero.primaryButtonText);
  const [heroPrimaryButtonLink, setHeroPrimaryButtonLink] = useState(homepageCms.hero.primaryButtonLink);
  const [heroSecondaryButtonText, setHeroSecondaryButtonText] = useState(homepageCms.hero.secondaryButtonText);
  const [heroSecondaryButtonLink, setHeroSecondaryButtonLink] = useState(homepageCms.hero.secondaryButtonLink);
  const [heroImage, setHeroImage] = useState(homepageCms.hero.heroImage || '');

  // Promo Banner
  const [promoBadge, setPromoBadge] = useState(homepageCms.promoBanner?.badge || '');
  const [promoTitle, setPromoTitle] = useState(homepageCms.promoBanner?.title || '');
  const [promoSubtitle, setPromoSubtitle] = useState(homepageCms.promoBanner?.subtitle || '');
  const [promoDescription, setPromoDescription] = useState(homepageCms.promoBanner?.description || '');
  const [promoButtonText, setPromoButtonText] = useState(homepageCms.promoBanner?.buttonText || '');
  const [promoButtonLink, setPromoButtonLink] = useState(homepageCms.promoBanner?.buttonLink || '');
  const [promoImageUrl, setPromoImageUrl] = useState(homepageCms.promoBanner?.imageUrl || '');
  const [promoEnabled, setPromoEnabled] = useState(homepageCms.promoBanner?.enabled !== false);

  // Section titles
  const [whyChooseUsTitle, setWhyChooseUsTitle] = useState(homepageCms.whyChooseUsTitle);
  const [whyChooseUsSubtitle, setWhyChooseUsSubtitle] = useState(homepageCms.whyChooseUsSubtitle);
  const [featuredSectionTitle, setFeaturedSectionTitle] = useState(homepageCms.featuredSectionTitle);
  const [featuredSectionSubtitle, setFeaturedSectionSubtitle] = useState(homepageCms.featuredSectionSubtitle);
  const [videoSectionTitle, setVideoSectionTitle] = useState(homepageCms.videoSectionTitle);
  const [videoSectionSubtitle, setVideoSectionSubtitle] = useState(homepageCms.videoSectionSubtitle);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hero slider slides (managed locally, published on save)
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [slideToDelete, setSlideToDelete] = useState<HomepageSlide | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  interface DraftSnapshot {
    heroBadge: string; heroTitle: string; heroHighlightedTitle: string; heroSubtitle: string;
    heroPrimaryButtonText: string; heroPrimaryButtonLink: string; heroSecondaryButtonText: string; heroSecondaryButtonLink: string;
    heroImage: string; promoBadge: string; promoTitle: string; promoDescription: string; promoButtonText: string; promoButtonLink: string;
    promoImageUrl: string; promoEnabled: boolean; slides: HomepageSlide[];
  }
  const [history, setHistory] = useState<DraftSnapshot[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const captureDraft = useCallback((): DraftSnapshot => ({
    heroBadge, heroTitle, heroHighlightedTitle, heroSubtitle, heroPrimaryButtonText, heroPrimaryButtonLink,
    heroSecondaryButtonText, heroSecondaryButtonLink, heroImage, promoBadge, promoTitle, promoDescription,
    promoButtonText, promoButtonLink, promoImageUrl, promoEnabled, slides: JSON.parse(JSON.stringify(slides)),
  }), [heroBadge, heroTitle, heroHighlightedTitle, heroSubtitle, heroPrimaryButtonText, heroPrimaryButtonLink, heroSecondaryButtonText, heroSecondaryButtonLink, heroImage, promoBadge, promoTitle, promoDescription, promoButtonText, promoButtonLink, promoImageUrl, promoEnabled, slides]);

  const restoreDraft = useCallback((s: DraftSnapshot) => {
    setHeroBadge(s.heroBadge); setHeroTitle(s.heroTitle); setHeroHighlightedTitle(s.heroHighlightedTitle);
    setHeroSubtitle(s.heroSubtitle); setHeroPrimaryButtonText(s.heroPrimaryButtonText); setHeroPrimaryButtonLink(s.heroPrimaryButtonLink);
    setHeroSecondaryButtonText(s.heroSecondaryButtonText); setHeroSecondaryButtonLink(s.heroSecondaryButtonLink);
    setHeroImage(s.heroImage); setPromoBadge(s.promoBadge); setPromoTitle(s.promoTitle); setPromoDescription(s.promoDescription);
    setPromoButtonText(s.promoButtonText); setPromoButtonLink(s.promoButtonLink); setPromoImageUrl(s.promoImageUrl);
    setPromoEnabled(s.promoEnabled); setSlides(s.slides);
  }, []);

  const pushHistory = useCallback(() => {
    const snap = captureDraft();
    setHistory((prev) => {
      const base = historyIdx >= 0 ? prev.slice(0, historyIdx + 1) : prev;
      const next = [...base, snap].slice(-20);
      return next;
    });
    setHistoryIdx((i) => Math.min(i + 1, 19));
  }, [captureDraft, historyIdx]);

  const handleUndo = useCallback(() => {
    if (historyIdx < 0) return;
    const target = history[historyIdx];
    const nextIdx = historyIdx - 1;
    // push current state to redo stack position
    setHistory((prev) => {
      const cur = captureDraft();
      const withCur = nextIdx < prev.length - 1 ? prev : [...prev, cur].slice(-20);
      return withCur;
    });
    if (target) restoreDraft(target);
    setHistoryIdx(nextIdx);
  }, [history, historyIdx, restoreDraft, captureDraft]);

  const handleRedo = useCallback(() => {
    const next = history[historyIdx + 1];
    if (!next) return;
    restoreDraft(next);
    setHistoryIdx(historyIdx + 1);
  }, [history, historyIdx, restoreDraft]);

  useEffect(() => {
    setSlides(homepageSlides);
  }, [homepageSlides]);

  const isDirty = useMemo(() => {
    try {
      const pub = JSON.stringify({ h: homepageCms.hero, p: homepageCms.promoBanner, s: homepageSlides });
      const draft = JSON.stringify({
        h: { badge: heroBadge, title: heroTitle, highlightedTitle: heroHighlightedTitle, subtitle: heroSubtitle, primaryButtonText: heroPrimaryButtonText, primaryButtonLink: heroPrimaryButtonLink, secondaryButtonText: heroSecondaryButtonText, secondaryButtonLink: heroSecondaryButtonLink, heroImage },
        p: { badge: promoBadge, title: promoTitle, description: promoDescription, buttonText: promoButtonText, buttonLink: promoButtonLink, imageUrl: promoImageUrl, enabled: promoEnabled },
        s: slides,
      });
      return pub !== draft;
    } catch { return false; }
  }, [homepageCms, homepageSlides, heroBadge, heroTitle, heroHighlightedTitle, heroSubtitle, heroPrimaryButtonText, heroPrimaryButtonLink, heroSecondaryButtonText, heroSecondaryButtonLink, heroImage, promoBadge, promoTitle, promoDescription, promoButtonText, promoButtonLink, promoImageUrl, promoEnabled, slides]);

  const handleDiscard = useCallback(() => {
    setHeroBadge(homepageCms.hero.badge); setHeroTitle(homepageCms.hero.title);
    setHeroHighlightedTitle(homepageCms.hero.highlightedTitle); setHeroSubtitle(homepageCms.hero.subtitle);
    setHeroPrimaryButtonText(homepageCms.hero.primaryButtonText); setHeroPrimaryButtonLink(homepageCms.hero.primaryButtonLink);
    setHeroSecondaryButtonText(homepageCms.hero.secondaryButtonText); setHeroSecondaryButtonLink(homepageCms.hero.secondaryButtonLink);
    setHeroImage(homepageCms.hero.heroImage || '');
    setPromoBadge(homepageCms.promoBanner?.badge || ''); setPromoTitle(homepageCms.promoBanner?.title || '');
    setPromoDescription(homepageCms.promoBanner?.description || ''); setPromoButtonText(homepageCms.promoBanner?.buttonText || '');
    setPromoButtonLink(homepageCms.promoBanner?.buttonLink || ''); setPromoImageUrl(homepageCms.promoBanner?.imageUrl || '');
    setPromoEnabled(homepageCms.promoBanner?.enabled !== false);
    setWhyChooseUsTitle(homepageCms.whyChooseUsTitle); setWhyChooseUsSubtitle(homepageCms.whyChooseUsSubtitle);
    setFeaturedSectionTitle(homepageCms.featuredSectionTitle); setFeaturedSectionSubtitle(homepageCms.featuredSectionSubtitle);
    setVideoSectionTitle(homepageCms.videoSectionTitle); setVideoSectionSubtitle(homepageCms.videoSectionSubtitle);
    setSlides(homepageSlides); setHistory([]); setHistoryIdx(-1); setErrorMessage(null);
  }, [homepageCms, homepageSlides]);

  const updateSlide = useCallback((id: string, patch: Partial<HomepageSlide>) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const addSlide = useCallback(() => {
    pushHistory();
    const id = `slide-${Date.now()}`;
    const newSlide: HomepageSlide = {
      id,
      badge: '',
      title: '',
      subtitle: '',
      ctaText: "Ko'rish",
      ctaLink: '/products',
      imageUrl: '',
      mobileImageUrl: '',
      active: true,
      order: slides.length * 10 + 10,
    };
    setSlides((prev) => [...prev, newSlide]);
  }, [slides.length, pushHistory]);

  const moveSlide = useCallback((index: number, dir: -1 | 1) => {
    pushHistory();
    setSlides((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next.map((s, i) => ({ ...s, order: i * 10 + 10 }));
    });
  }, [pushHistory]);

  const removeSlide = useCallback((id: string) => {
    pushHistory();
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setSlideToDelete(null);
  }, [pushHistory]);

  const validateForm = useCallback((): boolean => {
    const errors: string[] = [];
    if (!heroTitle.trim()) errors.push('Asosiy sarlavha kiritilishi shart');
    if (!heroSubtitle.trim()) errors.push('Quyi matn (subtitle) kiritilishi shart');
    if (!heroImage.trim()) errors.push('Hero orqa fon rasmi kiritilishi shart');
    if (slides.length === 0) errors.push('Kamida bitta slider banneri qo\'shilishi shart');
    if (slides.some(s => s.active && !s.imageUrl.trim())) errors.push('Faol bannerlar uchun rasm kiritilishi shart');

    if (errors.length > 0) {
      setErrorMessage(errors.join('. '));
      return false;
    }
    setErrorMessage(null);
    return true;
  }, [heroTitle, heroSubtitle, heroImage, slides]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    pushHistory();
    setIsSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    try {
      updateHomepageCms({
        hero: {
          badge: heroBadge,
          title: heroTitle,
          highlightedTitle: heroHighlightedTitle,
          subtitle: heroSubtitle,
          primaryButtonText: heroPrimaryButtonText,
          primaryButtonLink: heroPrimaryButtonLink,
          secondaryButtonText: heroSecondaryButtonText,
          secondaryButtonLink: heroSecondaryButtonLink,
          heroImage,
        },
        promoBanner: {
          badge: promoBadge,
          title: promoTitle,
          subtitle: promoSubtitle,
          description: promoDescription,
          buttonText: promoButtonText,
          buttonLink: promoButtonLink,
          imageUrl: promoImageUrl,
          enabled: promoEnabled,
        },
        whyChooseUsTitle,
        whyChooseUsSubtitle,
        featuredSectionTitle,
        featuredSectionSubtitle,
        videoSectionTitle,
        videoSectionSubtitle,
      });

      publishHomepageSlides(slides);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save homepage CMS:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  }, [heroBadge, heroTitle, heroHighlightedTitle, heroSubtitle, heroPrimaryButtonText, heroPrimaryButtonLink, heroSecondaryButtonText, heroSecondaryButtonLink, heroImage, promoBadge, promoTitle, promoSubtitle, promoDescription, promoButtonText, promoButtonLink, promoImageUrl, promoEnabled, whyChooseUsTitle, whyChooseUsSubtitle, featuredSectionTitle, featuredSectionSubtitle, videoSectionTitle, videoSectionSubtitle, slides, updateHomepageCms, publishHomepageSlides, validateForm, pushHistory]);

  const previewWidth = previewMode === 'desktop' ? 'max-w-3xl' : previewMode === 'tablet' ? 'max-w-md' : 'max-w-[320px]';
  const activeSlidesCount = () => slides.filter((s) => s.active).length;

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sticky top-16 z-20 bg-muted/90 bg-card/90 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              Bosh Sahifa (Homepage CMS)
              {isDirty ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">Qoralama</span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">Nashr qilingan</span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              O‘zgarishlar saqlanmaguncha mijozlarga ko‘rinmaydi. Oldin ko‘rib chiqing, keyin nashr qiling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={historyIdx < 0} onClick={handleUndo} title="Bekor qilish (undo)" className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Undo"><Undo2 className="w-4 h-4" /></button>
            <button type="button" disabled={!history[historyIdx + 1]} onClick={handleRedo} title="Qaytarish (redo)" className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Redo"><Redo2 className="w-4 h-4" /></button>
            <button type="button" disabled={!isDirty || isSaving} onClick={handleDiscard} title="O‘zgarishlarni bekor qilish" className="px-3 py-2 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-40 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-background text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin stroke-[3]" /><span>Saqlanmoqda...</span></>
              ) : savedSuccess ? (
                <><Check className="w-4 h-4 stroke-[3]" /><span>Saqlandi!</span></>
              ) : (
                <><Save className="w-4 h-4" /><span>{isDirty ? 'Nashr qilish' : 'Bosh sahifani saqlash'}</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Live preview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" /><span>Jonli ko‘rinish (nashrdan oldin)</span>
          </h3>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border" role="tablist" aria-label="Preview o‘lchami">
            {([
              { k: 'desktop', icon: Monitor, label: 'Desktop' },
              { k: 'tablet', icon: Tablet, label: 'Planshet' },
              { k: 'mobile', icon: Smartphone, label: 'Mobil' },
            ] as const).map((m) => (
              <button key={m.k} type="button" role="tab" aria-selected={previewMode === m.k} onClick={() => setPreviewMode(m.k)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${previewMode === m.k ? 'bg-foreground text-background shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                <m.icon className="w-3.5 h-3.5" />{m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <div className={`w-full ${previewWidth} transition-all rounded-2xl overflow-hidden border border-border bg-background`}>
            <div className="relative aspect-[16/9] bg-muted">
              {heroImage ? <img src={heroImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Hero rasmi tanlanmagan</div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex flex-col justify-end">
                {heroBadge && <span className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white mb-1.5">{heroBadge}</span>}
                <p className="text-white font-black leading-tight text-base sm:text-xl">{heroTitle} <span className="text-amber-400">{heroHighlightedTitle}</span></p>
                <p className="text-white/80 text-[11px] mt-1 line-clamp-2">{heroSubtitle}</p>
                <div className="flex gap-2 mt-2">
                  {heroPrimaryButtonText && <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white text-black">{heroPrimaryButtonText}</span>}
                  {heroSecondaryButtonText && <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-white/60 text-white">{heroSecondaryButtonText}</span>}
                </div>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border">
              <span>{activeSlidesCount()} faol slayd · {slides.length} jami</span>
              <span>{promoEnabled && promoTitle ? `Promo: ${promoTitle.slice(0, 24)}` : 'Promo o‘chiq'}</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">Bu — qoralama ko‘rinishi. “Nashr qilish” bosilgach ommaviy saytda ko‘rinadi.</p>
      </div>

      {/* Card: Hero Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Asosiy Banner (Hero Section)</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Kichik Nishon / Badge
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              placeholder="Zamonaviy do'kon"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Asosiy Sarlavha <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Sifatli Kiyimlar va Oyoq Kiyimlar"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Urg'ulangan Matn (Oltin rangda)
              </label>
              <input
                type="text"
                value={heroHighlightedTitle}
                onChange={(e) => setHeroHighlightedTitle(e.target.value)}
                placeholder="Onlayn do'konimiz"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold text-amber-600 dark:text-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Quyi Matn (Subtitle) <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Mahsulotlarimizni uydan chiqmasdan ko'ring..."
              className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                1-Tugma Matni & Havolasi
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroPrimaryButtonText}
                  onChange={(e) => setHeroPrimaryButtonText(e.target.value)}
                  placeholder="Katalogga o'tish"
                  className="w-1/2 px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold"
                />
                <input
                  type="text"
                  value={heroPrimaryButtonLink}
                  onChange={(e) => setHeroPrimaryButtonLink(e.target.value)}
                  placeholder="/products"
                  className="w-1/2 px-3 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                2-Tugma Matni & Havolasi
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroSecondaryButtonText}
                  onChange={(e) => setHeroSecondaryButtonText(e.target.value)}
                  placeholder="Do'kon manzili"
                  className="w-1/2 px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
                />
                <input
                  type="text"
                  value={heroSecondaryButtonLink}
                  onChange={(e) => setHeroSecondaryButtonLink(e.target.value)}
                  placeholder="/location"
                  className="w-1/2 px-3 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Hero Orqa Fon Rasmi URL <span className="text-destructive">*</span>
            </label>
            <SingleImageUpload
              label="Hero orqa fon rasmi"
              value={heroImage || undefined}
              onChange={(url) => setHeroImage(url || '')}
              bucket={MEDIA_BUCKETS.STORE_ASSETS}
              scope="homepage/hero"
            />
          </div>
        </div>
      </div>

      {/* Card: Hero Slider */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Aylanma Bannerlar (Slider)</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Bosh sahifadagi aylanma bannerlarni boshqaring. Faol bannerlar mijozlarga ko'rsatiladi.
            </p>
          </div>
          <button
            type="button"
            onClick={addSlide}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-background text-xs font-black transition-all active:scale-95 inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Banner qo'shish
          </button>
        </div>

        {slides.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-border rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Hali bannerlar yo'q</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              "Banner qo'shish" tugmasini bosing va birinchi aylanma banneringizni yarating.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
                  slide.active
                    ? 'border-border bg-muted/60 bg-muted/40'
                    : 'border-dashed border-border opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-muted bg-muted text-foreground text-foreground text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-foreground">
                      <input
                        type="checkbox"
                        checked={slide.active}
                        onChange={(e) => updateSlide(slide.id, { active: e.target.checked })}
                        className="w-4 h-4 accent-amber-500"
                      />
                      Faol
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSlide(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-foreground hover:bg-muted disabled:opacity-30"
                      title="Yuqoriga"
                      aria-label="Yuqoriga surish"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(idx, 1)}
                      disabled={idx === slides.length - 1}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-foreground hover:bg-muted disabled:opacity-30"
                      title="Pastga"
                      aria-label="Pastga surish"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideToDelete(slide)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="O'chirish"
                      aria-label={`${slide.title || 'Banner'} ni o'chirish`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Kichik Nishon / Badge</label>
                      <input
                        type="text"
                        value={slide.badge}
                        onChange={(e) => updateSlide(slide.id, { badge: e.target.value })}
                        placeholder="Yangi kolleksiya"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Sarlavha</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                        placeholder="Yangi yil to'plamlari"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Quyi Matn</label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                        placeholder="Do'kondagi eng so'nggi mahsulotlar"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Tugma Matni</label>
                        <input
                          type="text"
                          value={slide.ctaText}
                          onChange={(e) => updateSlide(slide.id, { ctaText: e.target.value })}
                          placeholder="Ko'rish"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-card border border-border text-foreground font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Tugma Havolasi</label>
                        <input
                          type="text"
                          value={slide.ctaLink}
                          onChange={(e) => updateSlide(slide.id, { ctaLink: e.target.value })}
                          placeholder="/products"
                          className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-card border border-border text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SingleImageUpload
                      label="Banner rasmi (katta ekran) *"
                      value={slide.imageUrl}
                      onChange={(url) => updateSlide(slide.id, { imageUrl: url })}
                      bucket={MEDIA_BUCKETS.STORE_ASSETS}
                      scope={`homepage/${slide.id}`}
                    />
                    <SingleImageUpload
                      label="Mobil rasm (ixtiyoriy)"
                      value={slide.mobileImageUrl}
                      onChange={(url) => updateSlide(slide.id, { mobileImageUrl: url })}
                      bucket={MEDIA_BUCKETS.STORE_ASSETS}
                      scope={`homepage/${slide.id}`}
                      hint="Mobilda ko'rsatiladi, bo'sh bo'lsa asosiy rasm ishlatiladi"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {slides.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            O'zgarishlar yuqoridagi "Bosh sahifani saqlash" tugmasi bosilganda saqlanadi.
          </p>
        )}
      </div>

      {/* Card: Promo Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Mavsumiy Aksiya / Promo Banner</span>
          </h3>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-foreground">
              Bannerni ko'rsatish
            </span>
            <input
              type="checkbox"
              checked={promoEnabled}
              onChange={(e) => setPromoEnabled(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded"
            />
          </label>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Banner Nishoni (Badge)
              </label>
              <input
                type="text"
                value={promoBadge}
                onChange={(e) => setPromoBadge(e.target.value)}
                placeholder="Yangi Mavsum Taklifi"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Banner Sarlavhasi
              </label>
              <input
                type="text"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="Bahor & Yoz Yangi Kolleksiyasi"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Banner Tavsifi
            </label>
            <textarea
              rows={2}
              value={promoDescription}
              onChange={(e) => setPromoDescription(e.target.value)}
              placeholder="Do'konimizga yangi fasl uchun eng sara..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Tugma Matni
              </label>
              <input
                type="text"
                value={promoButtonText}
                onChange={(e) => setPromoButtonText(e.target.value)}
                placeholder="Kolleksiyani ko'rish"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Rasm URL manzili
              </label>
              <SingleImageUpload
                label="Promo banner rasmi"
                value={promoImageUrl || undefined}
                onChange={(url) => setPromoImageUrl(url || '')}
                bucket={MEDIA_BUCKETS.STORE_ASSETS}
                scope="homepage/promo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card: Section Headers */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-6">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          <span>Bo'lim Sarlavhalari va Matnlari</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Mashhur Mahsulotlar Bo'limi Sarlavhasi
              </label>
              <input
                type="text"
                value={featuredSectionTitle}
                onChange={(e) => setFeaturedSectionTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Mashhur Mahsulotlar Izohi
              </label>
              <input
                type="text"
                value={featuredSectionSubtitle}
                onChange={(e) => setFeaturedSectionSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Videolar bo'limi sarlavhasi
              </label>
              <input
                type="text"
                value={videoSectionTitle}
                onChange={(e) => setVideoSectionTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Videolar bo'limi izohi
              </label>
              <input
                type="text"
                value={videoSectionSubtitle}
                onChange={(e) => setVideoSectionSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                "Nega Biz?" Bo'limi Sarlavhasi
              </label>
              <input
                type="text"
                value={whyChooseUsTitle}
                onChange={(e) => setWhyChooseUsTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                "Nega Biz?" Izohi
              </label>
              <input
                type="text"
                value={whyChooseUsSubtitle}
                onChange={(e) => setWhyChooseUsSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slide delete confirmation */}
      <ConfirmDialog
        isOpen={!!slideToDelete}
        title="Bannerni o'chirish"
        message={`"${slideToDelete?.title || slideToDelete?.badge || 'Nomsiz banner'}" bannerni rostdan ham o'chirmoqchimisiz? Rasm fayli ham o'chiriladi.`}
        confirmLabel="Ha, o'chirish"
        onConfirm={() => slideToDelete && removeSlide(slideToDelete.id)}
        onCancel={() => setSlideToDelete(null)}
      />
    </form>
  );
};

export default HomepageCmsPage;