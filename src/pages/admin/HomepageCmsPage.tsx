import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    setSlides(homepageSlides);
  }, [homepageSlides]);

  const updateSlide = useCallback((id: string, patch: Partial<HomepageSlide>) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const addSlide = useCallback(() => {
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
  }, [slides.length]);

  const moveSlide = useCallback((index: number, dir: -1 | 1) => {
    setSlides((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next.map((s, i) => ({ ...s, order: i * 10 + 10 }));
    });
  }, []);

  const removeSlide = useCallback((id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setSlideToDelete(null);
  }, []);

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
  }, [heroBadge, heroTitle, heroHighlightedTitle, heroSubtitle, heroPrimaryButtonText, heroPrimaryButtonLink, heroSecondaryButtonText, heroSecondaryButtonLink, heroImage, promoBadge, promoTitle, promoSubtitle, promoDescription, promoButtonText, promoButtonLink, promoImageUrl, promoEnabled, whyChooseUsTitle, whyChooseUsSubtitle, featuredSectionTitle, featuredSectionSubtitle, videoSectionTitle, videoSectionSubtitle, slides, updateHomepageCms, publishHomepageSlides, validateForm]);

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-muted/90 bg-card/90 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Bosh Sahifa (Homepage CMS)
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Bosh sahifadagi barcha sarlavhalar, bannerlar va taqdimot bloklarini tahrirlang
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-background text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
              <span>Saqlanmoqda...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Saqlandi!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Bosh sahifani saqlash</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

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