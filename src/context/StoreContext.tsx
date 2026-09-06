import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Product, Category } from '../types/product';
import { ClothingPromptItem } from '../types/prompt';
import { Review } from '../types/review';
import { FaqItem } from '../types/faq';
import { BusinessConfig } from '../types/business';
import { HomepageCms, AboutCms, ContactCms, AdminActivityLog, HomepageSlide } from '../types/cms';
import { supabase } from '../lib/supabase/client';
import type { Database } from '../types/supabase-db';
type DbStoreSettings = Database['public']['Tables']['store_settings']['Row'];
import {
  mapDbCategoryToApp,
  mapDbProductToApp,
  mapDbPromptToApp,
  mapDbTestimonialToApp,
  mapDbFaqToApp,
  mapDbStoreSettingsToApp,
  mapDbHomepageCmsToApp,
  mapDbHomepageSlideToApp,
  mapDbAboutCmsToApp,
  mapDbContactCmsToApp,
  productToDb,
  categoryToDb,
  promptToDb,
  testimonialToDb,
  faqToDb,
  businessConfigToDb,
  homepageCmsToDb,
  homepageSlideToDb,
  aboutCmsToDb,
  contactCmsToDb,
} from '../lib/supabase/mappers';

import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/categories';
import { INITIAL_PROMPTS } from '../data/prompts';
import { REVIEWS as INITIAL_REVIEWS } from '../data/reviews';
import { FAQ_ITEMS as INITIAL_FAQ } from '../data/faq';
import { BUSINESS_CONFIG as INITIAL_BUSINESS } from '../config/business';
import {
  INITIAL_HOMEPAGE_CMS,
  INITIAL_ABOUT_CMS,
  INITIAL_CONTACT_CMS,
} from '../data/cmsDefaults';

interface StoreContextType {
  // Products
  products: Product[];
  publishedProducts: Product[];
  featuredProducts: Product[];
  newProducts: Product[];
  discountedProducts: Product[];
  addProduct: (product: Omit<Product, 'id'>, explicitId?: string) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | undefined;
  duplicateProducts: (ids: string[], copies: number) => number;
  toggleProductFeatured: (id: string) => void;
  toggleProductNew: (id: string) => void;
  toggleProductPublished: (id: string) => void;
  updateProductStock: (id: string, inStock: boolean, count?: number) => void;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  insertBulkProduct: (product: Product, categoryId?: string | null) => Promise<void>;
  cleanupBulkProduct: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  publishedCategories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (startIndex: number, endIndex: number) => void;

  // Prompts
  prompts: ClothingPromptItem[];
  publishedPrompts: ClothingPromptItem[];
  featuredPrompts: ClothingPromptItem[];
  addPrompt: (prompt: Omit<ClothingPromptItem, 'id'>) => ClothingPromptItem;
  updatePrompt: (id: string, updates: Partial<ClothingPromptItem>) => void;
  deletePrompt: (id: string) => void;
  duplicatePrompt: (id: string) => ClothingPromptItem | undefined;
  togglePromptPublished: (id: string) => void;
  togglePromptFeatured: (id: string) => void;

  // Testimonials
  testimonials: Review[];
  publishedTestimonials: Review[];
  addTestimonial: (review: Omit<Review, 'id'>) => void;
  updateTestimonial: (id: string, updates: Partial<Review>) => void;
  deleteTestimonial: (id: string) => void;
  toggleTestimonialPublished: (id: string) => void;

  // FAQ
  faq: FaqItem[];
  publishedFaq: FaqItem[];
  addFaq: (faqItem: Omit<FaqItem, 'id'>) => void;
  updateFaq: (id: string, updates: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;
  toggleFaqPublished: (id: string) => void;

  // Store Configuration
  storeInfo: BusinessConfig;
  updateStoreInfo: (updates: Partial<BusinessConfig>) => void;

  // CMS Content
  homepageCms: HomepageCms;
  updateHomepageCms: (updates: Partial<HomepageCms>) => void;
  homepageSlides: HomepageSlide[];
  publishHomepageSlides: (slides: HomepageSlide[]) => void;
  aboutCms: AboutCms;
  updateAboutCms: (updates: Partial<AboutCms>) => void;
  contactCms: ContactCms;
  updateContactCms: (updates: Partial<ContactCms>) => void;

  // Logs & Management
  activityLogs: AdminActivityLog[];
  logActivity: (action: AdminActivityLog['action'], entity: AdminActivityLog['entity'], description: string) => void;
  resetAllToDefaults: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const KEYS = {
  PRODUCTS: 'store_products_cms',
  CATEGORIES: 'store_categories_cms',
  VIDEOS: 'store_videos_cms',
  PROMPTS: 'store_prompts_cms',
  TESTIMONIALS: 'store_testimonials_cms',
  FAQ: 'store_faq_cms',
  STORE_INFO: 'store_info_cms',
  HOMEPAGE: 'store_homepage_cms',
  SLIDES: 'store_homepage_slides_cms',
  ABOUT: 'store_about_cms',
  CONTACT: 'store_contact_cms',
  LOGS: 'store_activity_logs_cms',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from Supabase, with localStorage fallback
  // Initialize state from local data imports (sync, prevents Promise in state)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      return INITIAL_PRODUCTS;
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      return INITIAL_CATEGORIES;
    } catch {
      return [];
    }
  });
  const [prompts, setPrompts] = useState<ClothingPromptItem[]>(() => {
    try {
      return INITIAL_PROMPTS;
    } catch {
      return [];
    }
  });
  const [testimonials, setTestimonials] = useState<Review[]>(() => {
    try {
      return INITIAL_REVIEWS;
    } catch {
      return [];
    }
  });
  const [faq, setFaq] = useState<FaqItem[]>(() => {
    try {
      return INITIAL_FAQ;
    } catch {
      return [];
    }
  });
  const [storeInfo, setStoreInfo] = useState<BusinessConfig>(() => INITIAL_BUSINESS);
  const [homepageCms, setHomepageCms] = useState<HomepageCms>(() => {
    try {
      return INITIAL_HOMEPAGE_CMS;
    } catch {
      return {} as HomepageCms;
    }
  });
  const [homepageSlides, setHomepageSlides] = useState<HomepageSlide[]>(() => {
    try {
      return [];
    } catch {
      return [];
    }
  });
  const [aboutCms, setAboutCms] = useState<AboutCms>(() => {
    try {
      return INITIAL_ABOUT_CMS;
    } catch {
      return {} as AboutCms;
    }
  });
  const [contactCms, setContactCms] = useState<ContactCms>(() => {
    try {
      return INITIAL_CONTACT_CMS;
    } catch {
      return {} as ContactCms;
    }
  });

  // Hydration flag: set true once the primary DB initial load completes so the
  // persistence effects below never write the initial fallback dataset over real data.
  const [hydrated, setHydrated] = useState(false);

  // Fetch everything from Supabase after mount (async, won't block initial render).
  // Errors are isolated per resource: one failing table never cascades into the
  // rest of the application state. Database-level failures are logged explicitly.
  useEffect(() => {
    let cancelled = false;

    async function fetchCategoriesToState() {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      if (!cancelled) setCategories((data ?? []).map((c) => mapDbCategoryToApp(c)));
    }

    async function fetchProductsToState() {
      const { data: cats, error: catErr } = await supabase.from('categories').select('*');
      const catLookup = new Map<string, ReturnType<typeof mapDbCategoryToApp>>();
      if (!catErr && cats) {
        for (const c of cats) catLookup.set(c.id, mapDbCategoryToApp(c));
      }
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_sizes(*), product_colors(*)');
      if (error) throw error;
      if (cancelled) return;
      const mapped = (data ?? []).map((row) =>
        mapDbProductToApp(row, (id) => (id ? catLookup.get(id) : undefined)),
      );
      setProducts(mapped);
    }

    async function fetchPromptsToState() {
      const { data, error } = await supabase.from('prompts').select('*');
      if (error) throw error;
      if (!cancelled) setPrompts((data ?? []).map((r) => mapDbPromptToApp(r)));
    }

    async function fetchTestimonialsToState() {
      const { data, error } = await supabase.from('testimonials').select('*');
      if (error) throw error;
      if (!cancelled) setTestimonials((data ?? []).map((r) => mapDbTestimonialToApp(r)));
    }

    async function fetchFaqToState() {
      const { data, error } = await supabase.from('faqs').select('*');
      if (error) throw error;
      if (!cancelled) setFaq((data ?? []).map((r) => mapDbFaqToApp(r)));
    }

    async function fetchStoreInfoToState() {
      const { data, error } = await supabase.from('store_settings').select('*').maybeSingle();
      if (error) throw error;
      if (!cancelled && data) setStoreInfo(mapDbStoreSettingsToApp(data));
    }

    async function fetchHomepageCmsToState() {
      const { data, error } = await supabase.from('homepage_cms').select('*').maybeSingle();
      if (error) throw error;
      if (!cancelled && data) setHomepageCms(mapDbHomepageCmsToApp(data));
    }

    async function fetchHomepageSlidesToState() {
      const { data, error } = await supabase.from('homepage_slides').select('*').order('sort_order');
      if (error) throw error;
      if (!cancelled) setHomepageSlides((data ?? []).map((r) => mapDbHomepageSlideToApp(r)));
    }

    async function fetchAboutCmsToState() {
      const { data, error } = await supabase.from('about_cms').select('*').maybeSingle();
      if (error) throw error;
      if (!cancelled && data) setAboutCms(mapDbAboutCmsToApp(data));
    }

    async function fetchContactCmsToState() {
      const { data, error } = await supabase.from('contact_cms').select('*').maybeSingle();
      if (error) throw error;
      if (!cancelled && data) setContactCms(mapDbContactCmsToApp(data));
    }

    const tasks = [
      fetchCategoriesToState(),
      fetchProductsToState(),
      fetchPromptsToState(),
      fetchTestimonialsToState(),
      fetchFaqToState(),
      fetchStoreInfoToState(),
      fetchHomepageCmsToState(),
      fetchHomepageSlidesToState(),
      fetchAboutCmsToState(),
      fetchContactCmsToState(),
    ];

    Promise.allSettled(tasks).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          // eslint-disable-next-line no-console
          console.error(`[StoreContext] Hydration failed for resource ${i}:`, r.reason);
        }
      });
      if (!cancelled) setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);
  // Fetch categories from Supabase
  async function fetchCategoriesFromSupabase(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        ;
      
      if (error) throw error;
      return (data as Category[]) ?? [];
    } catch {
      return [];
    }
  }

  // Fetch prompts from Supabase
  async function fetchPromptsFromSupabase(): Promise<ClothingPromptItem[]> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('is_published', true)
        ;
      
      if (error) throw error;
      return (data as ClothingPromptItem[]) ?? [];
    } catch {
      return [];
    }
  }

  // Fetch testimonials from Supabase
  async function fetchTestimonialsFromSupabase(): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        ;
      
      if (error) throw error;
      return (data as Review[]) ?? [];
    } catch {
      return [];
    }
  }

  // Fetch FAQ from Supabase
  async function fetchFaqFromSupabase(): Promise<FaqItem[]> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        ;
      
      if (error) throw error;
      return (data as FaqItem[]) ?? [];
    } catch {
      return [];
    }
  }

  // Fetch store info from Supabase
  async function fetchStoreInfoFromSupabase(): Promise<BusinessConfig> {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error) throw error;
      return mapDbStoreSettingsToApp(data as DbStoreSettings);
    } catch {
      return INITIAL_BUSINESS;
    }
  }

  // Fetch homepage CMS from Supabase
  async function fetchHomepageCmsFromSupabase(): Promise<HomepageCms> {
    try {
      const { data, error } = await supabase
        .from('homepage_cms')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as HomepageCms;
    } catch {
      // Return default homepage CMS
      return {
        hero: {
          badge: 'O\'nliningizdagi mahsulotlar',
          title: 'Sifatli Kiyimlar va Oyoq Kiyimlar',
          highlightedTitle: 'Mahsulotlar',
          subtitle: 'Mahsulotlarimizni uydan chiqmasdan ko\'ring, narxlarini va mavjudligini aniqlang ham va do\'konimizga murojaat qilng.',
          primaryButtonText: 'Katalogga o\'tish',
          primaryButtonLink: '/products',
          secondaryButtonText: 'Do\'kon manzili',
          secondaryButtonLink: '/location',
          heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        },
        stats: [
          { id: 'products', value: '100+', label: 'Mahsulot', sublabel: 'Doimiy yangilanuvchi kolleksiya', dynamic: true },
          { id: 'collections', value: 'Yangi', label: 'Kolleksiyalar', sublabel: 'Mavsumiy eng so\'nggi trendlar', dynamic: false },
          { id: 'shopping', value: 'Qulay', label: 'Xarid tajribasi', sublabel: 'Narx va o\'lchamlar ochiq', dynamic: false },
          { id: 'store', value: 'Mahalliy', label: 'Do\'kon', sublabel: 'Kiyib ko\'rish va tanlash imkoni', dynamic: false },
        ],
        promoBanner: {
          badge: 'Yangi Mavsum Taklifi',
          title: 'Bahor & Yoz Yangi Kolleksiyasi',
          subtitle: 'Eng zamonaviy uslub va qulaylik',
          description: 'Do\'konimizga yangi fasl uchun eng sara futbolkalar, krossovkalar va yengil kiyimlar to\'plami yetib keldi. O\'zingizga mos o\'lchamni tanlang!',
          buttonText: 'Kolleksiyani ko\'rish',
          buttonLink: '/products',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
          enabled: true,
        },
        whyChooseUsTitle: 'Nega Aynan Bizning Do\'kon?',
        whyChooseUsSubtitle: 'Zamonaviy kiyinish va qulay xarid uchun barcha qulayliklar',
        features: [
          { id: 'feat-1', icon: 'Eye', title: 'Shaffof Onlayn Ko\'rish', description: 'Barcha narxlar, o\'lchamlar va ranglar saytimizda 100% ochiq ko\'rsatilgan.' },
          { id: 'feat-2', icon: 'Sparkles', title: 'Haqiqiy Sifat Kafolati', description: 'Faqt sinovdan o\'tgan matolar, qulay andazalar va mustahkam tikuvlar.' },
          { id: 'feat-3', icon: 'ShieldCheck', title: 'Kiyib Ko\'rish Imkoniyati', description: 'Do\'konga kelib, kiyinish xonalarimizda o\'zingizna mosligiga to\'liq ishonch hosil qiling.' },
          { id: 'feat-4', icon: 'Clock', title: 'Har Kuni Ochiq', description: 'Dam olsunki kunlarisiz,haftaning 7 kuni soat 09:00 dan 20:00 gacha xizmatingizdamiz.' },
        ],
        featuredSectionTitle: 'Mashhur Mahsulotlar',
        featuredSectionSubtitle: 'Mijozlarimiz tomonidan eng ko\'p tanlanayotgan eng sara to\'plamlar',
        videoSectionTitle: 'Videolarda ko\'ring',
        videoSectionSubtitle: 'Kiyimlarning haqiqiy ko\'rinishi, matosi va kiyilishini qisqa videolarda tomosha qiling',
      };
    }
  }

  // Fetch about CMS from Supabase
  async function fetchAboutCmsFromSupabase(): Promise<AboutCms> {
    try {
      const { data, error } = await supabase
        .from('about_cms')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as AboutCms;
    } catch {
      // Return default about CMS
      return {
        title: 'Zamonaviy Uslub va Sifat Markazi',
        subtitle: 'Do\'konimizda mijozlarimizga eng sara kiyim-kechak va poyabzallarni taqdim etib kelamiz.',
        mainStory: 'Bizning maqsadimiz — har bir mijozga o\'z uslubiga mos, qulay va uzoq vaqt xizmat qiladigan kiyimlarni qulay narxlarda topishiga yordam berishdir. Onlayn do\'konimiz orqali siz uydan chiqmasdan savol berishingiz mumkin.',
        secondStory: 'Do\'konimizda doimiy ravishda yangi kolleksiyalar yangilanib turadi. Erkaklar, ayollar, bolalar kiyimlari va sifatli oyoq kiyimlarning keng assortimenti sizni kutmoqda.',
        mission: 'Har bir inson uchun zamonaviy kiyinishni oson, shaffof va zavqli jarayonga aylantirish.',
        vision: 'Mintaqadagi eng ishonchli va sevimli malliy brendga aylanish.',
        images: [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80',
        ],
        features: [
          { title: 'Yuqori Sifatli Matolar', description: 'Har bir mahsulot materialini sinchkovlik bilan tanlaymiz.' },
          { title: 'Hamyonbop Narxlar', description: 'Hech qanday keraksiz ustamalarsiz to\'g\'ridan-to\'g\'ri shaffof narxlar.' },
          { title: 'Samimiy Xizmat', description: 'Mutaxassis xodimlarimiz sizga mos o\'lcham va uslubni tanlashda bajonidil ko\'maklashadi.' },
        ],
      };
    }
  }

  // Fetch contact CMS from Supabase
  async function fetchContactCmsFromSupabase(): Promise<ContactCms> {
    try {
      const { data, error } = await supabase
        .from('contact_cms')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as ContactCms;
    } catch {
      // Return default contact CMS
      return {
        title: 'Biz Bilan Bog\'laning',
        subtitle: 'Savollaringiz bormi yoki mahsulot zaxirasini aniqlashtirmoqchimisiz? Biz bilan tezkor bog\'laning!',
        description: 'Telegram, telefon yoki do\'konimizga bevosita tashrif buyurib barcha ma\'lumotlarni olishingiz mumkin.',
        formEnabled: true,
        telegramDirectNote: 'Telegram orqali tezkor javob olishingiz mumkin — odatda 5-10 daqiqada javob beramiz.',
      };
    }
  }

  // Persistence Effects - save changes to Supabase
  // Product and Category array persistence is handled inside the individual
  // action handlers (add/update/delete/duplicate/toggle), which write only the
  // specific changed record with correct DB column names. We intentionally do
  // NOT blanket-upsert the entire products/categories arrays here: doing so
  // would destroy real database rows on load by writing the initial fallback
  // dataset over them.

  // Store info CRUD
  // Single-row tables are safe to upsert, but only after the initial DB load has
  // completed (hydrated) so that the fallback defaults are never written over
  // real data on first mount.
  useEffect(() => {
    if (!hydrated) return;
    const saveStoreInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const payload = { id: 'default', ...businessConfigToDb(storeInfo) };
        const { error } = await supabase.from('store_settings').upsert(payload);
        if (error && /could not find|PGRST204|logo_url|favicon_url|og_image|seo|language|business_category/i.test(error.message ?? '')) {
          const legacy = { ...payload };
          delete legacy.logo_url;
          delete legacy.favicon_url;
          delete legacy.business_category;
          delete legacy.language;
          delete legacy.default_seo_title;
          delete legacy.default_seo_description;
          delete legacy.og_image_url;
          await supabase.from('store_settings').upsert(legacy);
        }
      } catch (err) {
        console.error('Error saving store info to Supabase:', err);
      }
    };
    saveStoreInfo();
  }, [storeInfo, hydrated, supabase]);

  // Homepage CMS CRUD
  useEffect(() => {
    if (!hydrated) return;
    const saveHomepageCms = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from('homepage_cms')
          .upsert(homepageCmsToDb(homepageCms));
      } catch (err) {
        console.error('Error saving homepage CMS to Supabase:', err);
      }
    };
    saveHomepageCms();
  }, [homepageCms, hydrated, supabase]);

  // Homepage slides (owner-managed slider). All slides are saved at once from
  // the CMS page so ordering and deletions stay consistent.
  const publishHomepageSlides = async (slides: HomepageSlide[]) => {
    setHomepageSlides(slides);
    try {
      localStorage.setItem(KEYS.SLIDES, JSON.stringify(slides));
    } catch {}
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const rows = slides.map((s) => ({ ...homepageSlideToDb(s), id: s.id }));
      if (rows.length > 0) {
        await supabase.from('homepage_slides').upsert(rows);
        await supabase.from('homepage_slides').delete().not('id', 'in', `(${rows.map((r) => r.id).join(',')})`);
      } else {
        await supabase.from('homepage_slides').delete().neq('id', '__none__');
      }
    } catch (err) {
      console.error('Error saving homepage slides to Supabase:', err);
    }
  };

  // About CMS CRUD
  useEffect(() => {
    if (!hydrated) return;
    const saveAboutCms = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from('about_cms')
          .upsert(aboutCmsToDb(aboutCms));
      } catch (err) {
        console.error('Error saving about CMS to Supabase:', err);
      }
    };
    saveAboutCms();
  }, [aboutCms, hydrated, supabase]);

  // Contact CMS CRUD
  useEffect(() => {
    if (!hydrated) return;
    const saveContactCms = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from('contact_cms')
          .upsert(contactCmsToDb(contactCms));
      } catch (err) {
        console.error('Error saving contact CMS to Supabase:', err);
      }
    };
    saveContactCms();
  }, [contactCms, hydrated, supabase]);

  // ... rest stays the same

// Activity logs state
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>(() => [
    {
      id: 'log-init',
      action: 'setting',
      entity: 'store',
      description: 'Tizim ishga tushirildi va boshlang\'ich ma\'lumotlar yuklandi',
      timestamp: new Date().toISOString(),
    },
  ]);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.PROMPTS, JSON.stringify(prompts));
    } catch {}
  }, [prompts]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(testimonials));
    } catch {}
  }, [testimonials]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.FAQ, JSON.stringify(faq));
    } catch {}
  }, [faq]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.STORE_INFO, JSON.stringify(storeInfo));
    } catch {}
  }, [storeInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.HOMEPAGE, JSON.stringify(homepageCms));
    } catch {}
  }, [homepageCms]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.SLIDES, JSON.stringify(homepageSlides));
    } catch {}
  }, [homepageSlides]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.ABOUT, JSON.stringify(aboutCms));
    } catch {}
  }, [aboutCms]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.CONTACT, JSON.stringify(contactCms));
    } catch {}
  }, [contactCms]);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(activityLogs));
    } catch {}
  }, [activityLogs]);

  // Log Activity Helper
  const logActivity = (
    action: AdminActivityLog['action'],
    entity: AdminActivityLog['entity'],
    description: string
  ) => {
    const newLog: AdminActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      entity,
      description,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep latest 50
  };

  // Derived filtered items for customer site
  const publishedProducts = useMemo(() => {
    return (products ?? []).filter((p) => p.published !== false);
  }, [products]);

  const featuredProducts = useMemo(() => {
    return (publishedProducts ?? []).filter((p) => p.isFeatured);
  }, [publishedProducts]);

  const newProducts = useMemo(() => {
    return (publishedProducts ?? []).filter((p) => p.isNew);
  }, [publishedProducts]);

  const discountedProducts = useMemo(() => {
    return (publishedProducts ?? []).filter((p) => p.originalPrice && p.originalPrice > p.price);
  }, [publishedProducts]);

  // Dynamic category product count calculation
  const categoriesWithDynamicCount = useMemo(() => {
    return categories.map((cat) => {
      const count = (publishedProducts ?? []).filter(
        (p) => p.category === cat.id || p.category === cat.slug
      ).length;
      return {
        ...cat,
        productCount: count,
      };
    });
  }, [categories, publishedProducts]);

  const publishedCategories = useMemo(() => {
    return categoriesWithDynamicCount.filter((c) => c.published !== false);
  }, [categoriesWithDynamicCount]);

  const publishedPrompts = useMemo(() => {
    return prompts.filter((pr) => pr.published !== false);
  }, [prompts]);

  const featuredPrompts = useMemo(() => {
    return publishedPrompts.filter((pr) => pr.featured);
  }, [publishedPrompts]);

  const publishedTestimonials = useMemo(() => {
    return testimonials.filter((t) => t.published !== false);
  }, [testimonials]);

  const publishedFaq = useMemo(() => {
    return faq.filter((f) => f.published !== false);
  }, [faq]);

  // Targeted persistence helpers for array resources. Each writes only the
  // specific changed record with correct DB column names (via mappers), and
  // never writes the fallback dataset. Fire-and-forget with error isolation.
  const imageSigCache = new Map<string, string>();
  const sizeSigCache = new Map<string, string>();
  const colorSigCache = new Map<string, string>();

  const persistProduct = async (product: Product) => {
    try {
      // main row (includes optional video_url / video_poster_url)
      await supabase.from('products').upsert({ ...productToDb(product), id: product.id });

      // Sync product_images: keep ordering + primary identical to the images
      // array so uploaded images survive navigation/refresh. Skipped when the
      // image list did not change (e.g. stock toggle saves).
      const images = product.images ?? [];
      const sig = images.join('|');
      if (imageSigCache.get(product.id) !== sig) {
        await supabase.from('product_images').delete().eq('product_id', product.id);
        if (images.length > 0) {
          const stampPrefix = Date.now();
          const rows = images.map((url, index) => ({
            id: `pi-${product.id}-${stampPrefix}-${index}`,
            product_id: product.id,
            url,
            is_primary: index === 0,
            sort_order: index,
          }));
          const { error: insErr } = await supabase.from('product_images').insert(rows);
          if (insErr) throw insErr;
        }
        imageSigCache.set(product.id, sig);
      }

      // Sync product_sizes: sizes that are not persistable were previously
      // dropped on every refresh. Now they are written when they change.
      const sizes = product.sizes ?? [];
      const sSig = sizes.join('|');
      if (sizeSigCache.get(product.id) !== sSig) {
        await supabase.from('product_sizes').delete().eq('product_id', product.id);
        if (sizes.length > 0) {
          const stampPrefix = Date.now();
          const sizeRows = sizes.map((size, index) => ({
            id: `ps-${product.id}-${stampPrefix}-${index}`,
            product_id: product.id,
            size,
            is_available: true,
            sort_order: index,
          }));
          const { error: sizeErr } = await supabase.from('product_sizes').insert(sizeRows);
          if (sizeErr) throw sizeErr;
        }
        sizeSigCache.set(product.id, sSig);
      }

      // Sync product_colors similarly.
      const colors = product.colors ?? [];
      const cSig = JSON.stringify(colors);
      if (colorSigCache.get(product.id) !== cSig) {
        await supabase.from('product_colors').delete().eq('product_id', product.id);
        if (colors.length > 0) {
          const stampPrefix = Date.now();
          const colorRows = colors.map((c, index) => ({
            id: `pc-${product.id}-${stampPrefix}-${index}`,
            product_id: product.id,
            name: c.name,
            hex_code: c.hex || null,
            is_available: true,
            sort_order: index,
          }));
          const { error: colorErr } = await supabase.from('product_colors').insert(colorRows);
          if (colorErr) throw colorErr;
        }
        colorSigCache.set(product.id, cSig);
      }
    } catch (err) {
      console.error('Error saving product to Supabase:', err);
    }
  };

  const deleteProductRow = async (id: string) => {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting product from Supabase:', err);
    }
  };

  const persistCategory = async (category: Category) => {
    try {
      await supabase
        .from('categories')
        .upsert({ ...categoryToDb(category), id: category.id });
    } catch (err) {
      console.error('Error saving category to Supabase:', err);
    }
  };

  const deleteCategoryRow = async (id: string) => {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting category from Supabase:', err);
    }
  };

  const persistPrompt = async (prompt: ClothingPromptItem) => {
    try {
      await supabase
        .from('prompts')
        .upsert({ ...promptToDb(prompt), id: prompt.id });
    } catch (err) {
      console.error('Error saving prompt to Supabase:', err);
    }
  };

  const deletePromptRow = async (id: string) => {
    try {
      await supabase.from('prompts').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting prompt from Supabase:', err);
    }
  };

  const persistTestimonial = async (review: Review) => {
    try {
      await supabase
        .from('testimonials')
        .upsert({ ...testimonialToDb(review), id: review.id });
    } catch (err) {
      console.error('Error saving testimonial to Supabase:', err);
    }
  };

  const deleteTestimonialRow = async (id: string) => {
    try {
      await supabase.from('testimonials').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting testimonial from Supabase:', err);
    }
  };

  const persistFaq = async (faqItem: FaqItem) => {
    try {
      await supabase
        .from('faqs')
        .upsert({ ...faqToDb(faqItem), id: faqItem.id });
    } catch (err) {
      console.error('Error saving FAQ to Supabase:', err);
    }
  };

  const deleteFaqRow = async (id: string) => {
    try {
      await supabase.from('faqs').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting FAQ from Supabase:', err);
    }
  };

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id'>, explicitId?: string): Product => {
    const id = explicitId && explicitId.trim() ? explicitId.trim() : `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      published: productData.published !== undefined ? productData.published : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    logActivity('create', 'product', `Yangi mahsulot qo'shildi: "${newProduct.name}" (${newProduct.price.toLocaleString('uz-UZ')} so'm)`);
    persistProduct(newProduct);
    return newProduct;
  };

  // Bulk-created products write through the same DB rows as normal products but
  // awaited, so the caller can observe failures and clean up Storage/rows.
  const insertBulkProduct = async (product: Product, categoryId?: string | null): Promise<void> => {
    const stamp = Date.now();
    const mainResult = await supabase
      .from('products')
      .upsert({ ...productToDb(product), id: product.id, category_id: categoryId ?? null });
    if (mainResult.error) throw mainResult.error;

    const images = product.images ?? [];
    if (images.length > 0) {
      const imageRows = images.map((url, index) => ({
        id: `pi-${product.id}-${stamp}-${index}`,
        product_id: product.id,
        url,
        is_primary: index === 0,
        sort_order: index,
      }));
      const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
      if (imgErr) throw imgErr;
    }

    const sizes = product.sizes ?? [];
    if (sizes.length > 0) {
      const sizeRows = sizes.map((size, index) => ({
        id: `ps-${product.id}-${stamp}-${index}`,
        product_id: product.id,
        size,
        is_available: true,
        sort_order: index,
      }));
      const { error: sizeErr } = await supabase.from('product_sizes').insert(sizeRows);
      if (sizeErr) throw sizeErr;
    }

    const colors = product.colors ?? [];
    if (colors.length > 0) {
      const colorRows = colors.map((c, index) => ({
        id: `pc-${product.id}-${stamp}-${index}`,
        product_id: product.id,
        name: c.name,
        hex_code: c.hex || null,
        is_available: true,
        sort_order: index,
      }));
      const { error: colorErr } = await supabase.from('product_colors').insert(colorRows);
      if (colorErr) throw colorErr;
    }

    setProducts((prev) => [product, ...prev]);
    logActivity('create', 'product', `Bulk yaratildi: "${product.name}" (${product.price.toLocaleString('uz-UZ')} so'm)`);
  };

  const cleanupBulkProduct = async (id: string): Promise<void> => {
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    let updatedRef: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
          updatedRef = updated;
          return updated;
        }
        return p;
      })
    );
    const existing = products.find((p) => p.id === id);
    if (updatedRef) persistProduct(updatedRef);
    logActivity('update', 'product', `Mahsulot yangilandi: "${updates.name || existing?.name || id}"`);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductRow(id);
    logActivity('delete', 'product', `Mahsulot o'chirildi: "${target?.name || id}"`);
  };

  const duplicateProduct = (id: string): Product | undefined => {
    const target = products.find((p) => p.id === id);
    if (!target) return undefined;
    const newId = `prod-${Date.now()}`;
    const copy: Product = {
      ...target,
      id: newId,
      name: `${target.name} (Nusxa)`,
      slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${target.sku}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [copy, ...prev]);
    persistProduct(copy);
    logActivity('create', 'product', `Mahsulotdan nusxa yaratildi: "${copy.name}"`);
    return copy;
  };

  // Duplicate a set of products N times each, keeping sku/slug unique.
  const duplicateProducts = (ids: string[], copies: number): number => {
    let created = 0;
    const copiesBounded = Math.max(1, Math.min(100, Math.floor(copies)));
    const batch: Product[] = [];
    for (const id of ids) {
      const target = products.find((p) => p.id === id);
      if (!target) continue;
      for (let i = 2; i <= copiesBounded + 1; i++) {
        const newId = `prod-${Date.now()}-${created}-${i}`;
        batch.push({
          ...target,
          id: newId,
          name: `${target.name} (Nusxa ${i})`,
          slug: `${target.slug}-copy-${i}-${Date.now().toString().slice(-5)}`,
          sku: `${target.sku}-COPY${i}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      created += copiesBounded;
    }
    if (batch.length > 0) {
      setProducts((prev) => [...batch, ...prev]);
      batch.forEach((p) => persistProduct(p));
      logActivity('create', 'product', `Ommaviy nusxalash: ${batch.length} ta yangi mahsulot yaratildi`);
    }
    return batch.length;
  };

  const toggleProductFeatured = (id: string) => {
    let updatedRef: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedRef = { ...p, isFeatured: !p.isFeatured };
          return updatedRef;
        }
        return p;
      })
    );
    if (updatedRef) persistProduct(updatedRef);
    const p = products.find((item) => item.id === id);
    logActivity('update', 'product', `Mahsulot tanlanganlar holati o'zgardi: "${p?.name}"`);
  };

  const toggleProductNew = (id: string) => {
    let updatedRef: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedRef = { ...p, isNew: !p.isNew };
          return updatedRef;
        }
        return p;
      })
    );
    if (updatedRef) persistProduct(updatedRef);
    const p = products.find((item) => item.id === id);
    logActivity('update', 'product', `Mahsulot yangilik belgisi o'zgardi: "${p?.name}"`);
  };

  const toggleProductPublished = (id: string) => {
    let updatedRef: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedRef = { ...p, published: !p.published };
          return updatedRef;
        }
        return p;
      })
    );
    if (updatedRef) persistProduct(updatedRef);
    const p = products.find((item) => item.id === id);
    logActivity('publish', 'product', `Mahsulot nashr holati o'zgardi: "${p?.name}"`);
  };

  const updateProductStock = (id: string, inStock: boolean, count?: number) => {
    let updatedRef: Product | undefined;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedRef = { ...p, inStock, stockCount: count ?? p.stockCount, stockStatus: inStock ? 'mavjud' : 'tugagan' };
          return updatedRef;
        }
        return p;
      })
    );
    if (updatedRef) persistProduct(updatedRef);
    const p = products.find((item) => item.id === id);
    logActivity('update', 'product', `Zaxira yangilandi: "${p?.name}" (${inStock ? 'Mavjud' : 'Tugagan'}, soni: ${count ?? p?.stockCount})`);
  };

  const bulkUpdateProducts = (ids: string[], updates: Partial<Product>) => {
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) =>
        ids.includes(p.id)
          ? { ...p, ...updates, updatedAt: now, inStock: updates.inStock ?? p.inStock, stockStatus: updates.stockStatus ?? p.stockStatus }
          : p
      )
    );
    const clean: Record<string, unknown> = { updated_at: now };
    if ('published' in updates) clean.is_published = updates.published !== false;
    if ('isFeatured' in updates) clean.is_featured = updates.isFeatured === true;
    if ('isNew' in updates) clean.is_new = updates.isNew === true;
    if ('isOnSale' in updates) clean.is_on_sale = updates.isOnSale === true;
    if ('inStock' in updates || 'stockStatus' in updates) {
      clean.stock_status = updates.inStock ? 'mavjud' : 'tugagan';
    }
    if ('stockCount' in updates) clean.stock_count = updates.stockCount ?? 0;
    if ('category' in updates && updates.category) {
      const cat = categories.find((c) => c.slug === updates.category || c.id === updates.category);
      clean.category_id = cat?.id ?? null;
    }
    if (Object.keys(clean).length === 1) return;
    supabase
      .from('products')
      .update(clean)
      .in('id', ids)
      .then(({ error }) => {
        if (error) console.error('Error in bulk product update:', error);
      });
    logActivity('update', 'product', `${ids.length} ta mahsulot ommaviy yangilandi`);
  };

  const bulkDeleteProducts = (ids: string[]) => {
    if (ids.length === 0) return;
    const names = products.filter((p) => ids.includes(p.id)).map((p) => p.name).slice(0, 3).join(', ');
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    supabase
      .from('products')
      .delete()
      .in('id', ids)
      .then(async ({ error }) => {
        if (error) {
          console.error('Error in bulk product delete:', error);
          return;
        }
        // Clean up uploaded media folders owned by the deleted products.
        for (const id of ids) {
          try {
            const { data } = await supabase.storage.from('product-images').list(id);
            if (data && data.length > 0) {
              await supabase.storage
                .from('product-images')
                .remove(data.map((f) => `${id}/${f.name}`));
            }
            const { data: videos } = await supabase.storage.from('product-images').list(`${id}/videos`);
            if (videos && videos.length > 0) {
              await supabase.storage
                .from('product-images')
                .remove(videos.map((f) => `${id}/videos/${f.name}`));
            }
          } catch (err) {
            console.error(`Error cleaning up media for ${id}:`, err);
          }
        }
      });
    logActivity('delete', 'product', `${ids.length} ta mahsulot ommaviy o'chirildi: ${names}`);
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  const getProductBySlug = (slug: string): Product | undefined => {
    return products.find((p) => p.slug === slug || p.id === slug);
  };

  // Category Actions
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const id = categoryData.slug || `cat-${Date.now()}`;
    const newCategory: Category = {
      ...categoryData,
      id,
      published: true,
      productCount: 0,
    };
    setCategories((prev) => [...prev, newCategory]);
    persistCategory(newCategory);
    logActivity('create', 'category', `Yangi kategoriya qo'shildi: "${newCategory.name}"`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    let updatedRef: Category | undefined;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedRef = { ...c, ...updates };
          return updatedRef;
        }
        return c;
      })
    );
    if (updatedRef) persistCategory(updatedRef);
    const cat = categories.find((c) => c.id === id);
    logActivity('update', 'category', `Kategoriya yangilandi: "${updates.name || cat?.name || id}"`);
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    deleteCategoryRow(id);
    logActivity('delete', 'category', `Kategoriya o'chirildi: "${target?.name || id}"`);
  };

  const reorderCategories = (startIndex: number, endIndex: number) => {
    setCategories((prev) => {
      const result = [...prev];
      const removed = result.splice(startIndex, 1)[0];
      if (removed) {
        result.splice(endIndex, 0, removed);
      }
      return result;
    });
  };

  // Prompt Actions
  const addPrompt = (promptData: Omit<ClothingPromptItem, 'id'>): ClothingPromptItem => {
    const id = `prompt-${Date.now()}`;
    const newPrompt: ClothingPromptItem = {
      ...promptData,
      id,
      published: promptData.published !== undefined ? promptData.published : true,
      sort_order: promptData.sort_order ?? prompts.length + 1,
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    persistPrompt(newPrompt);
    logActivity('create', 'prompt', `Yangi AI Prompt qo'shildi: "${newPrompt.title}" (${newPrompt.category})`);
    return newPrompt;
  };

  const updatePrompt = (id: string, updates: Partial<ClothingPromptItem>) => {
    let updatedRef: ClothingPromptItem | undefined;
    setPrompts((prev) =>
      prev.map((pr) => {
        if (pr.id === id) {
          updatedRef = { ...pr, ...updates };
          return updatedRef;
        }
        return pr;
      })
    );
    if (updatedRef) persistPrompt(updatedRef);
    const item = prompts.find((pr) => pr.id === id);
    logActivity('update', 'prompt', `AI Prompt yangilandi: "${updates.title || item?.title || id}"`);
  };

  const deletePrompt = (id: string) => {
    const target = prompts.find((pr) => pr.id === id);
    setPrompts((prev) => prev.filter((pr) => pr.id !== id));
    deletePromptRow(id);
    logActivity('delete', 'prompt', `AI Prompt o'chirildi: "${target?.title || id}"`);
  };

  const duplicatePrompt = (id: string): ClothingPromptItem | undefined => {
    const target = prompts.find((pr) => pr.id === id);
    if (!target) return undefined;
    const copy: ClothingPromptItem = {
      ...target,
      id: `prompt-${Date.now()}`,
      title: `${target.title} (Nusxa)`,
    };
    setPrompts((prev) => [copy, ...prev]);
    persistPrompt(copy);
    logActivity('create', 'prompt', `AI Promptdan nusxa olindi: "${copy.title}"`);
    return copy;
  };

  const togglePromptPublished = (id: string) => {
    let updatedRef: ClothingPromptItem | undefined;
    setPrompts((prev) =>
      prev.map((pr) => {
        if (pr.id === id) {
          updatedRef = { ...pr, published: !pr.published };
          return updatedRef;
        }
        return pr;
      })
    );
    if (updatedRef) persistPrompt(updatedRef);
    const pr = prompts.find((item) => item.id === id);
    logActivity('publish', 'prompt', `AI Prompt nashr holati o'zgardi: "${pr?.title}"`);
  };

  const togglePromptFeatured = (id: string) => {
    let updatedRef: ClothingPromptItem | undefined;
    setPrompts((prev) =>
      prev.map((pr) => {
        if (pr.id === id) {
          updatedRef = { ...pr, featured: !pr.featured };
          return updatedRef;
        }
        return pr;
      })
    );
    if (updatedRef) persistPrompt(updatedRef);
    const pr = prompts.find((item) => item.id === id);
    logActivity('update', 'prompt', `AI Prompt tanlanganlar belgisi o'zgardi: "${pr?.title}"`);
  };

  // Testimonial Actions
  const addTestimonial = (reviewData: Omit<Review, 'id'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      published: true,
    };
    setTestimonials((prev) => [newReview, ...prev]);
    persistTestimonial(newReview);
    logActivity('create', 'testimonial', `Yangi sharh qo'shildi: ${newReview.name}`);
  };

  const updateTestimonial = (id: string, updates: Partial<Review>) => {
    let updatedRef: Review | undefined;
    setTestimonials((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedRef = { ...t, ...updates };
          return updatedRef;
        }
        return t;
      })
    );
    if (updatedRef) persistTestimonial(updatedRef);
    logActivity('update', 'testimonial', `Sharh tahrirlandi: ${id}`);
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    deleteTestimonialRow(id);
    logActivity('delete', 'testimonial', `Sharh o'chirildi: ${id}`);
  };

  const toggleTestimonialPublished = (id: string) => {
    let updatedRef: Review | undefined;
    setTestimonials((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedRef = { ...t, published: !t.published };
          return updatedRef;
        }
        return t;
      })
    );
    if (updatedRef) persistTestimonial(updatedRef);
  };

  // FAQ Actions
  const addFaq = (faqData: Omit<FaqItem, 'id'>) => {
    const newFaq: FaqItem = {
      ...faqData,
      id: `faq-${Date.now()}`,
      published: true,
    };
    setFaq((prev) => [...prev, newFaq]);
    persistFaq(newFaq);
    logActivity('create', 'faq', `Yangi savol-javob qo'shildi: "${newFaq.question.slice(0, 40)}..."`);
  };

  const updateFaq = (id: string, updates: Partial<FaqItem>) => {
    let updatedRef: FaqItem | undefined;
    setFaq((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          updatedRef = { ...f, ...updates };
          return updatedRef;
        }
        return f;
      })
    );
    if (updatedRef) persistFaq(updatedRef);
    logActivity('update', 'faq', `Savol-javob tahrirlandi: ${id}`);
  };

  const deleteFaq = (id: string) => {
    setFaq((prev) => prev.filter((f) => f.id !== id));
    deleteFaqRow(id);
    logActivity('delete', 'faq', `Savol-javob o'chirildi: ${id}`);
  };

  const toggleFaqPublished = (id: string) => {
    let updatedRef: FaqItem | undefined;
    setFaq((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          updatedRef = { ...f, published: !f.published };
          return updatedRef;
        }
        return f;
      })
    );
    if (updatedRef) persistFaq(updatedRef);
  };

  // Store Info
  const updateStoreInfo = (updates: Partial<BusinessConfig>) => {
    setStoreInfo((prev) => ({ ...prev, ...updates }));
    logActivity('setting', 'store', 'Do\'kon asosiy ma\'lumotlari va kontaktlari yangilandi');
  };

  // CMS Content
  const updateHomepageCms = (updates: Partial<HomepageCms>) => {
    setHomepageCms((prev) => {
      const next = { ...prev, ...updates };
      if (updates.hero) {
        next.heroBadge = updates.hero.badge ?? prev.heroBadge;
        next.heroTitle = updates.hero.title ?? prev.heroTitle;
        next.heroHighlightedTitle = updates.hero.highlightedTitle ?? prev.heroHighlightedTitle;
        next.heroSubtitle = updates.hero.subtitle ?? prev.heroSubtitle;
        next.heroDescription = updates.hero.subtitle ?? prev.heroDescription;
        next.heroPrimaryCtaText = updates.hero.primaryButtonText ?? prev.heroPrimaryCtaText;
        next.heroPrimaryCtaLink = updates.hero.primaryButtonLink ?? prev.heroPrimaryCtaLink;
        next.heroSecondaryCtaText = updates.hero.secondaryButtonText ?? prev.heroSecondaryCtaText;
        next.heroSecondaryCtaLink = updates.hero.secondaryButtonLink ?? prev.heroSecondaryCtaLink;
        next.heroImage = updates.hero.heroImage ?? prev.heroImage;
      }
      if (updates.promoBanner) {
        next.promoBannerBadge = updates.promoBanner.badge ?? prev.promoBannerBadge;
        next.promoBannerTitle = updates.promoBanner.title ?? prev.promoBannerTitle;
        next.promoBannerSubtitle = updates.promoBanner.description ?? updates.promoBanner.subtitle ?? prev.promoBannerSubtitle;
        next.promoBannerLink = updates.promoBanner.buttonLink ?? prev.promoBannerLink;
        next.promoBannerButtonText = updates.promoBanner.buttonText ?? prev.promoBannerButtonText;
        next.promoBannerImageUrl = updates.promoBanner.imageUrl ?? prev.promoBannerImageUrl;
        next.promoBannerEnabled = updates.promoBanner.enabled ?? prev.promoBannerEnabled;
      }
      return next;
    });
    logActivity('update', 'store', 'Bosh sahifa (Homepage) kontenti yangilandi');
  };

  const updateAboutCms = (updates: Partial<AboutCms>) => {
    setAboutCms((prev) => ({ ...prev, ...updates }));
    logActivity('update', 'store', 'Biz haqimizda (About) sahifasi kontenti yangilandi');
  };

  const updateContactCms = (updates: Partial<ContactCms>) => {
    setContactCms((prev) => ({ ...prev, ...updates }));
    logActivity('update', 'store', 'Aloqa (Contact) sahifasi sozlamalari yangilandi');
  };

  // Reset to Defaults
  const resetAllToDefaults = () => {
    setProducts(INITIAL_PRODUCTS.map((p) => ({ ...p, published: true })));
    setCategories(INITIAL_CATEGORIES.map((c) => ({ ...c, published: true })));
    setPrompts(INITIAL_PROMPTS);
    setTestimonials(INITIAL_REVIEWS.map((r) => ({ ...r, published: true })));
    setFaq(INITIAL_FAQ.map((f) => ({ ...f, published: true })));
    setStoreInfo(INITIAL_BUSINESS);
    setHomepageCms(INITIAL_HOMEPAGE_CMS);
    setAboutCms(INITIAL_ABOUT_CMS);
    setContactCms(INITIAL_CONTACT_CMS);

    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    logActivity('setting', 'store', 'Barcha ma\'lumotlar zavod sozlamalariga qaytarildi');
  };

  // Export JSON
  const exportDataJSON = (): string => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      products,
      categories,
      prompts,
      testimonials,
      faq,
      storeInfo,
      homepageCms,
      aboutCms,
      contactCms,
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  // Import JSON
  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.prompts && Array.isArray(data.prompts)) setPrompts(data.prompts);
      if (data.testimonials && Array.isArray(data.testimonials)) setTestimonials(data.testimonials);
      if (data.faq && Array.isArray(data.faq)) setFaq(data.faq);
      if (data.storeInfo) setStoreInfo(data.storeInfo);
      if (data.homepageCms) setHomepageCms(data.homepageCms);
      if (data.aboutCms) setAboutCms(data.aboutCms);
      if (data.contactCms) setContactCms(data.contactCms);

      logActivity('setting', 'store', 'Zaxira nusxadan ma\'lumotlar qayta tiklandi');
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        publishedProducts,
        featuredProducts,
        newProducts,
        discountedProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        duplicateProducts,
        toggleProductFeatured,
        toggleProductNew,
        toggleProductPublished,
        updateProductStock,
        bulkUpdateProducts,
        bulkDeleteProducts,
        getProductById,
        getProductBySlug,
        insertBulkProduct,
        cleanupBulkProduct,

        categories: categoriesWithDynamicCount,
        publishedCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,

        prompts,
        publishedPrompts,
        featuredPrompts,
        addPrompt,
        updatePrompt,
        deletePrompt,
        duplicatePrompt,
        togglePromptPublished,
        togglePromptFeatured,

        testimonials,
        publishedTestimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        toggleTestimonialPublished,

        faq,
        publishedFaq,
        addFaq,
        updateFaq,
        deleteFaq,
        toggleFaqPublished,

        storeInfo,
        updateStoreInfo,

        homepageCms,
        updateHomepageCms,
        homepageSlides,
        publishHomepageSlides,
        aboutCms,
        updateAboutCms,
        contactCms,
        updateContactCms,

        activityLogs,
        logActivity,
        resetAllToDefaults,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
// Admin CRUD mutation handlers
// These are direct Supabase writes used outside the React tree. Each converts
// the app-level object to DB columns via the mappers so column names and types
// always match the schema (no incorrect camelCase/snake_case mixing).

// Product CRUD
export const createProduct = async (product: Partial<Product>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        id: `prod-${Date.now()}`,
        ...productToDb(product as Product),
      });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating product:', err);
    return null;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productToDb(updates as Product))
      .eq('id', id);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating product:', err);
    return null;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting product:', err);
    return false;
  }
};

// Category CRUD
export const createCategory = async (category: Partial<Category>) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: `cat-${Date.now()}`,
        ...categoryToDb(category as Category),
      });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating category:', err);
    return null;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryToDb(updates as Category))
      .eq('id', id);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating category:', err);
    return null;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting category:', err);
    return false;
  }
};

// Store info CRUD
export const updateStoreInfo = async (updates: Partial<BusinessConfig>) => {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(businessConfigToDb(updates as BusinessConfig));
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating store info:', err);
    return null;
  }
};

// Prompt CRUD
export const createPrompt = async (prompt: Partial<ClothingPromptItem>) => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        id: `prompt-${Date.now()}`,
        ...promptToDb(prompt as ClothingPromptItem),
      });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating prompt:', err);
    return null;
  }
};

export const updatePrompt = async (id: string, updates: Partial<ClothingPromptItem>) => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .update(promptToDb(updates as ClothingPromptItem))
      .eq('id', id);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating prompt:', err);
    return null;
  }
};

export const deletePrompt = async (id: string) => {
  try {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting prompt:', err);
    return false;
  }
};

// Testimonial CRUD
export const createTestimonial = async (testimonial: Partial<Review>) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        id: `rev-${Date.now()}`,
        ...testimonialToDb(testimonial as Review),
      });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating testimonial:', err);
    return null;
  }
};

export const updateTestimonial = async (id: string, updates: Partial<Review>) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .update(testimonialToDb(updates as Review))
      .eq('id', id);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating testimonial:', err);
    return null;
  }
};

export const deleteTestimonial = async (id: string) => {
  try {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    return false;
  }
};

// FAQ CRUD
export const createFaq = async (faq: Partial<FaqItem>) => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        id: `faq-${Date.now()}`,
        ...faqToDb(faq as FaqItem),
      });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating FAQ:', err);
    return null;
  }
};

export const updateFaq = async (id: string, updates: Partial<FaqItem>) => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .update(faqToDb(updates as FaqItem))
      .eq('id', id);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating FAQ:', err);
    return null;
  }
};

export const deleteFaq = async (id: string) => {
  try {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    return false;
  }
};
