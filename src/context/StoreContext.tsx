import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Product, Category } from '../types/product';
import { ClothingPromptItem } from '../types/prompt';
import { Review } from '../types/review';
import { FaqItem } from '../types/faq';
import { VideoItem } from '../types/video';
import { BusinessConfig } from '../types/business';
import { HomepageCms, AboutCms, ContactCms, AdminActivityLog } from '../types/cms';
import { supabase } from '../lib/supabase/client';
import type { Database } from '../types/supabase-db';

import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/categories';
import { INITIAL_PROMPTS } from '../data/prompts';
import { REVIEWS as INITIAL_REVIEWS } from '../data/reviews';
import { FAQ_ITEMS as INITIAL_FAQ } from '../data/faq';
import { INITIAL_VIDEOS } from '../data/videos';
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
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | undefined;
  toggleProductFeatured: (id: string) => void;
  toggleProductNew: (id: string) => void;
  toggleProductPublished: (id: string) => void;
  updateProductStock: (id: string, inStock: boolean, count?: number) => void;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;

  // Categories
  categories: Category[];
  publishedCategories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (startIndex: number, endIndex: number) => void;

  // Videos / Feed
  videos: VideoItem[];
  publishedVideos: VideoItem[];
  addVideo: (video: Omit<VideoItem, 'id' | 'createdAt'>) => VideoItem;
  updateVideo: (id: string, updates: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;
  toggleVideoPublished: (id: string) => void;
  reorderVideos: (startIndex: number, endIndex: number) => void;

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
  aboutCms: AboutCms;
  updateAboutCms: (updates: Partial<AboutCms>) => void;
  contactCms: ContactCms;
  updateContactCms: (updates: Partial<ContactCms>) => void;

  // Logs & Management
  activityLogs: AdminActivityLog[];
  logActivity: (action: AdminActivityLog['action'], entity: AdminActivityLog['entity'], description: string) => void;
  resetAllToDefaults: () => void;
  resetAllData: () => void;
  exportDataJSON: () => string;
  exportData: () => string;
  importDataJSON: (jsonString: string) => boolean;
  importData: (jsonString: string) => boolean;
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
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      return INITIAL_VIDEOS;
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
  const [storeInfo, setStoreInfo] = useState<BusinessConfig>(() => {
    try {
      return INITIAL_BUSINESS;
    } catch {
      return {} as BusinessConfig;
    }
  });
  const [homepageCms, setHomepageCms] = useState<HomepageCms>(() => {
    try {
      return INITIAL_HOMEPAGE_CMS;
    } catch {
      return {} as HomepageCms;
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

  // Fetch from Supabase after mount (async, won't block initial render)
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        if (error) throw error;
        setProducts(data as Product[] ?? []);
      } catch (err) {
        console.error('Failed to fetch products from Supabase:', err);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        if (error) throw error;
        setCategories(data as Category[] ?? []);
      } catch (err) {
        console.error('Failed to fetch categories from Supabase:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error } = await supabase
          .from('feed_posts')
          .select('*, products(*)')
          .eq('type', 'video')
          .eq('is_published', true);
        if (error) throw error;
        setVideos(data as VideoItem[] ?? []);
      } catch (err) {
        console.error('Failed to fetch videos from Supabase:', err);
      }
    }
    fetchVideos();
  }, []);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('is_published', true);
        if (error) throw error;
        setPrompts(data as ClothingPromptItem[] ?? []);
      } catch (err) {
        console.error('Failed to fetch prompts from Supabase:', err);
      }
    }
    fetchPrompts();
  }, []);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_published', true);
        if (error) throw error;
        setTestimonials(data as Review[] ?? []);
      } catch (err) {
        console.error('Failed to fetch testimonials from Supabase:', err);
      }
    }
    fetchTestimonials();
  }, []);

  useEffect(() => {
    async function fetchFaq() {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_published', true);
        if (error) throw error;
        setFaq(data as FaqItem[] ?? []);
      } catch (err) {
        console.error('Failed to fetch FAQ from Supabase:', err);
      }
    }
    fetchFaq();
  }, []);

  useEffect(() => {
    async function fetchStoreInfo() {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*');
        if (error) throw error;
        setStoreInfo(data as BusinessConfig ?? {} as BusinessConfig);
      } catch (err) {
        console.error('Failed to fetch store info from Supabase:', err);
      }
    }
    fetchStoreInfo();
  }, []);

  useEffect(() => {
    async function fetchHomepageCms() {
      try {
        const { data, error } = await supabase
          .from('homepage_cms')
          .select('*');
        if (error) throw error;
        setHomepageCms(data as HomepageCms ?? {} as HomepageCms);
      } catch (err) {
        console.error('Failed to fetch homepage CMS from Supabase:', err);
      }
    }
    fetchHomepageCms();
  }, []);

  useEffect(() => {
    async function fetchAboutCms() {
      try {
        const { data, error } = await supabase
          .from('about_cms')
          .select('*');
        if (error) throw error;
        setAboutCms(data as AboutCms ?? {} as AboutCms);
      } catch (err) {
        console.error('Failed to fetch about CMS from Supabase:', err);
      }
    }
    fetchAboutCms();
  }, []);

  useEffect(() => {
    async function fetchContactCms() {
      try {
        const { data, error } = await supabase
          .from('contact_cms')
          .select('*');
        if (error) throw error;
        setContactCms(data as ContactCms ?? {} as ContactCms);
      } catch (err) {
        console.error('Failed to fetch contact CMS from Supabase:', err);
      }
    }
    fetchContactCms();
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

  // Fetch videos from Supabase
  async function fetchVideosFromSupabase(): Promise<VideoItem[]> {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*, products(*)')
        .eq('type', 'video')
        .eq('is_published', true);
      
      if (error) throw error;
      return (data as VideoItem[]) ?? [];
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
      return data as BusinessConfig;
    } catch {
      // Return default business config
      return {
        businessName: 'Ecommerce',
        businessDescription: 'Zamonaviy va sifatli mahsulotlar raqamli vitrinasi',
        tagline: 'Mahsulotlarni onlayn ko\'ring, narxlarni oldindanBilling va do\'konimizdan qulay xarid qiling.',
        phone: '+998 90 123 45 67',
        phoneRaw: '+998901234567',
        telegram: 'https://t.me/ecommerce_uz',
        telegramUsername: '@ecommerce_uz',
        address: 'Yangibot, Jizzax, O\'zbekiston',
        city: 'Jizzax',
        landmark: 'Markaziy bozor yaqinida, Savdo majmuasi 2-qavat',
        workingHours: 'Har kuni 09:00 — 20:00',
        workingHoursDetail: {
          weekdays: '09:00 — 20:00 (Dushanba - Juma)',
          weekend: '09:00 — 21:00 (Shanba - Yakshanba)',
          note: 'Tanaffussiz xizmat ko\'rsatamiz',
        },
        socialLinks: {
          telegram: 'https://t.me/ecommerce_uz',
          instagram: 'https://instagram.com/ecommerce_uz',
          facebook: 'https://facebook.com/ecommerce_uz',
        },
        primaryColor: '#0f172a',
        currency: 'so\'m',
        coordinates: {
          lat: 40.1158,
          lng: 67.8422,
        },
      };
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
          badge: 'Jizzaxdagi zamonaviy vitrina',
          title: 'Sifatli Kiyimlar va Oyoq Kiyimlar',
          highlightedTitle: 'Raqamli Vitrinasi',
          subtitle: 'Mahsulotlarimizni uydan chiqmasdan ko\'ring, narxlarini va mavjudligini aniqlang ham va do\'konimizdan qulay xarid qiling.',
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
          { id: 'feat-1', icon: 'Eye', title: 'Shaffof Raqamli Vitrina', description: 'Barcha narxlar, o\'lchamlar va ranglar saytimizda 100% ochiq ko\'rsatilgan.' },
          { id: 'feat-2', icon: 'Sparkles', title: 'Haqiqiy Sifat Kafolati', description: 'Faqt sinovdan o\'tgan matolar, qulay andazalar va mustahkam tikuvlar.' },
          { id: 'feat-3', icon: 'ShieldCheck', title: 'Kiyib Ko\'rish Imkoniyati', description: 'Do\'konga kelib, kiyinish xonalarimizda o\'zingizna mosligiga to\'liq ishonch hosil qiling.' },
          { id: 'feat-4', icon: 'Clock', title: 'Har Kuni Ochiq', description: 'Dam olsunki kunlarisiz,haftaning 7 kuni soat 09:00 dan 20:00 gacha xizmatingizdamiz.' },
        ],
        featuredSectionTitle: 'Mashhur Mahsulotlar',
        featuredSectionSubtitle: 'Mijozlarimiz tomonidan eng ko\'p tanlanayotgan eng sara to\'plamlar',
        videoSectionTitle: 'Jonli Vitrina — Videolarda Ko\'ring',
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
        subtitle: 'Jizzax shahrida mijozlarimizga eng sara kiyim-kechak va poyabzallarni taqdim etib kelmoqdamiz.',
        mainStory: 'Bizning maqsadimiz — har bir mijozga o\'z uslubiga mos, qulay va uzoq vaqt xizmat qiladigan kiyimlarni qulay narxlarda topishiga yordam berishdir. Raqamli vitrinamiz orqali siz uydan chiqmasdan xaridni rejalashtirishingiz mumkin.',
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
  // Product CRUD
  useEffect(() => {
    const saveProduct = async (product: Product) => {
      try {
        const { error } = await supabase
          .from('products')
          .upsert({
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            short_description: product.short_description ?? "",
            price: product.price,
            originalPrice: product.original_price,
            currency: product.currency,
            category: product.category_id,
            brand: product.brand,
            is_published: product.published ?? true,
            isFeatured: product.is_featured,
            isNew: product.is_new,
            isOnSale: product.is_on_sale,
            stockStatus: product.stock_status,
            stockCount: product.stock_count,
            sku: product.sku,
            rating: product.rating,
            review_count: product.reviewCount,
            tags: product.tags,
            material: product.material,
            madeIn: product.madeIn,
          });
        if (error) throw error;
        // Optionally log the activity
        // await logActivity('product', product.is_published ? 'publish' : 'update', `Product: ${product.name}`);
      } catch (err) {
        console.error('Error saving product to Supabase:', err);
      }
    };

    // Save each product in the state
    products.forEach(saveProduct);
  }, [products, supabase]);

  // Category CRUD
  useEffect(() => {
    const saveCategory = async (category: Category) => {
      try {
        const { error } = await supabase
          .from('categories')
          .upsert({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            is_visible: category.is_visible ?? true,
            sort_order: category.order,
          });
        if (error) throw error;
      } catch (err) {
        console.error('Error saving category to Supabase:', err);
      }
    };

    categories.forEach(saveCategory);
  }, [categories, supabase]);

  // Store info CRUD
  useEffect(() => {
    const saveStoreInfo = async () => {
      try {
        const { error } = await supabase
          .from('store_settings')
          .upsert({
            business_name: storeInfo.businessName,
            name: storeInfo.name,
            business_description: storeInfo.businessDescription,
            tagline: storeInfo.tagline,
            phone: storeInfo.phone,
            phone_raw: storeInfo.phoneRaw,
            phone_numbers: storeInfo.phoneNumbers ?? [],
            email: storeInfo.email,
            telegram: storeInfo.telegram,
            telegram_username: storeInfo.telegramUsername,
            telegram_channel: storeInfo.telegramChannel,
            instagram_username: storeInfo.instagramUsername,
            address: storeInfo.address,
            city: storeInfo.city,
            landmark: storeInfo.landmark,
            working_hours: storeInfo.workingHours,
            working_hours_detail: storeInfo.workingHoursDetail,
            social_links: storeInfo.socialLinks,
            primary_color: storeInfo.primaryColor,
            currency: storeInfo.currency,
            coordinates: storeInfo.coordinates,
          });
        if (error) throw error;
      } catch (err) {
        console.error('Error saving store info to Supabase:', err);
      }
    };
    saveStoreInfo();
  }, [storeInfo, supabase]);

  // Homepage CMS CRUD
  useEffect(() => {
    const saveHomepageCms = async () => {
      try {
        const { error } = await supabase
          .from('homepage_cms')
          .upsert({
            hero_badge: homepageCms.hero.badge,
            hero_title: homepageCms.hero.title,
            hero_highlighted_title: homepageCms.hero.highlightedTitle,
            hero_subtitle: homepageCms.hero.subtitle,
            hero_primary_cta_text: homepageCms.hero.primaryButtonText,
            hero_primary_cta_link: homepageCms.hero.primaryButtonLink,
            hero_secondary_cta_text: homepageCms.hero.secondaryButtonText,
            hero_secondary_cta_link: homepageCms.hero.secondaryButtonLink,
            hero_image_url: homepageCms.hero.heroImageUrl,
            promo_banner_badge: homepageCms.promoBanner.badge,
            promo_banner_title: homepageCms.promoBanner.title,
            promo_banner_subtitle: homepageCms.promoBanner.subtitle,
            promo_banner_description: homepageCms.promoBanner.description,
            promo_banner_button_text: homepageCms.promoBanner.buttonText,
            promo_banner_button_link: homepageCms.promoBanner.buttonLink,
            promo_banner_image_url: homepageCms.promoBanner.imageUrl,
            promo_banner_enabled: homepageCms.promoBanner.enabled,
            why_choose_us_title: homepageCms.whyChooseUsTitle,
            why_choose_us_subtitle: homepageCms.whyChooseUsSubtitle,
            features: homepageCms.features,
            featured_section_title: homepageCms.featuredSectionTitle,
            featured_section_subtitle: homepageCms.featuredSectionSubtitle,
            video_section_title: homepageCms.videoSectionTitle,
            video_section_subtitle: homepageCms.videoSectionSubtitle,
          });
        if (error) throw error;
      } catch (err) {
        console.error('Error saving homepage CMS to Supabase:', err);
      }
    };
    saveHomepageCms();
  }, [homepageCms, supabase]);

  // About CMS CRUD
  useEffect(() => {
    const saveAboutCms = async () => {
      try {
        const { error } = await supabase
          .from('about_cms')
          .upsert({
            title: aboutCms.title,
            subtitle: aboutCms.subtitle,
            main_story: aboutCms.mainStory,
            second_story: aboutCms.secondStory,
            mission: aboutCms.mission,
            vision: aboutCms.vision,
            images: aboutCms.images,
            features: aboutCms.features,
          });
        if (error) throw error;
      } catch (err) {
        console.error('Error saving about CMS to Supabase:', err);
      }
    };
    saveAboutCms();
  }, [aboutCms, supabase]);

  // Contact CMS CRUD
  useEffect(() => {
    const saveContactCms = async () => {
      try {
        const { error } = await supabase
          .from('contact_cms')
          .upsert({
            title: contactCms.title,
            subtitle: contactCms.subtitle,
            description: contactCms.description,
            form_enabled: contactCms.formEnabled,
            telegram_direct_note: contactCms.telegramDirectNote,
            support_note: contactCms.supportNote,
            direct_help_text: contactCms.directHelpText,
          });
        if (error) throw error;
      } catch (err) {
        console.error('Error saving contact CMS to Supabase:', err);
      }
    };
    saveContactCms();
  }, [contactCms, supabase]);

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

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      published: productData.published !== undefined ? productData.published : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    logActivity('create', 'product', `Yangi mahsulot qo'shildi: "${newProduct.name}" (${newProduct.price.toLocaleString('uz-UZ')} so'm)`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
          return updated;
        }
        return p;
      })
    );
    const existing = products.find((p) => p.id === id);
    logActivity('update', 'product', `Mahsulot yangilandi: "${updates.name || existing?.name || id}"`);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
    logActivity('create', 'product', `Mahsulotdan nusxa yaratildi: "${copy.name}"`);
    return copy;
  };

  const toggleProductFeatured = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
    const p = products.find((item) => item.id === id);
    logActivity('update', 'product', `Mahsulot tanlanganlar holati o'zgardi: "${p?.name}"`);
  };

  const toggleProductNew = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isNew: !p.isNew } : p))
    );
    const p = products.find((item) => item.id === id);
    logActivity('update', 'product', `Mahsulot yangilik belgisi o'zgardi: "${p?.name}"`);
  };

  const toggleProductPublished = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published: !p.published } : p))
    );
    const p = products.find((item) => item.id === id);
    logActivity('publish', 'product', `Mahsulot nashr holati o'zgardi: "${p?.name}"`);
  };

  const updateProductStock = (id: string, inStock: boolean, count?: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock, stockCount: count ?? p.stockCount } : p))
    );
    const p = products.find((item) => item.id === id);
    logActivity('update', 'product', `Zaxira yangilandi: "${p?.name}" (${inStock ? 'Mavjud' : 'Tugagan'}, soni: ${count ?? p?.stockCount})`);
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
    logActivity('create', 'category', `Yangi kategoriya qo'shildi: "${newCategory.name}"`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    const cat = categories.find((c) => c.id === id);
    logActivity('update', 'category', `Kategoriya yangilandi: "${updates.name || cat?.name || id}"`);
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
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
      is_published: promptData.is_published !== undefined ? promptData.published : true,
      order: prompts.length + 1,
    };
    setPrompts((prev) => [newPrompt, ...prev]);
    logActivity('create', 'prompt', `Yangi AI Prompt qo'shildi: "${newPrompt.title}" (${newPrompt.category})`);
    return newPrompt;
  };

  const updatePrompt = (id: string, updates: Partial<ClothingPromptItem>) => {
    setPrompts((prev) =>
      prev.map((pr) => (pr.id === id ? { ...pr, ...updates } : pr))
    );
    const item = prompts.find((pr) => pr.id === id);
    logActivity('update', 'prompt', `AI Prompt yangilandi: "${updates.title || item?.title || id}"`);
  };

  const deletePrompt = (id: string) => {
    const target = prompts.find((pr) => pr.id === id);
    setPrompts((prev) => prev.filter((pr) => pr.id !== id));
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
    logActivity('create', 'prompt', `AI Promptdan nusxa olindi: "${copy.title}"`);
    return copy;
  };

  const togglePromptPublished = (id: string) => {
    setPrompts((prev) =>
      prev.map((pr) => (pr.id === id ? { ...pr, published: !pr.published } : pr))
    );
    const pr = prompts.find((item) => item.id === id);
    logActivity('publish', 'prompt', `AI Prompt nashr holati o'zgardi: "${pr?.title}"`);
  };

  const togglePromptFeatured = (id: string) => {
    setPrompts((prev) =>
      prev.map((pr) => (pr.id === id ? { ...pr, featured: !pr.featured } : pr))
    );
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
    logActivity('create', 'testimonial', `Yangi sharh qo'shildi: ${newReview.name}`);
  };

  const updateTestimonial = (id: string, updates: Partial<Review>) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    logActivity('update', 'testimonial', `Sharh tahrirlandi: ${id}`);
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    logActivity('delete', 'testimonial', `Sharh o'chirildi: ${id}`);
  };

  const toggleTestimonialPublished = (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, published: !t.published } : t))
    );
  };

  // FAQ Actions
  const addFaq = (faqData: Omit<FaqItem, 'id'>) => {
    const newFaq: FaqItem = {
      ...faqData,
      id: `faq-${Date.now()}`,
      published: true,
    };
    setFaq((prev) => [...prev, newFaq]);
    logActivity('create', 'faq', `Yangi savol-javob qo'shildi: "${newFaq.question.slice(0, 40)}..."`);
  };

  const updateFaq = (id: string, updates: Partial<FaqItem>) => {
    setFaq((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    logActivity('update', 'faq', `Savol-javob tahrirlandi: ${id}`);
  };

  const deleteFaq = (id: string) => {
    setFaq((prev) => prev.filter((f) => f.id !== id));
    logActivity('delete', 'faq', `Savol-javob o'chirildi: ${id}`);
  };

  const toggleFaqPublished = (id: string) => {
    setFaq((prev) =>
      prev.map((f) => (f.id === id ? { ...f, published: !f.published } : f))
    );
  };

  // Store Info
  const updateStoreInfo = (updates: Partial<BusinessConfig>) => {
    setStoreInfo((prev) => ({ ...prev, ...updates }));
    logActivity('setting', 'store', 'Do\'kon asosiy ma\'lumotlari va kontaktlari yangilandi');
  };

  // CMS Content
  const updateHomepageCms = (updates: Partial<HomepageCms>) => {
    setHomepageCms((prev) => ({ ...prev, ...updates }));
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
        toggleProductFeatured,
        toggleProductNew,
        toggleProductPublished,
        updateProductStock,
        getProductById,
        getProductBySlug,

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

// Product CRUD
export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        id: `prod-${Date.now()}`,
        slug: product.slug,
        name: product.name,
        description: product.description,
        short_description: product.short_description ?? "",
        price: product.price,
        originalPrice: product.original_price,
        currency: product.currency,
        category: product.category_id,
        brand: product.brand,
        is_published: product.is_published ?? true,
        is_featured: product.is_featured ?? false,
        is_new: product.is_new ?? false,
        is_on_sale: product.is_on_sale ?? false,
        stock_status: product.stock_status ?? 'mavjud',
        stock_count: product.stockCount ?? 0,
        sku: product.sku,
        rating: product.rating ?? 0,
        review_count: product.reviewCount ?? 0,
        tags: product.tags ?? [],
        material: product.material,
        made_in: product.madeIn,
        sort_order: product.sort_order ?? 0,
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
      .update({
        name: updates.name,
        description: updates.description,
        short_description: updates.short_description,
        price: updates.price,
        original_price: updates.original_price,
        currency: updates.currency,
        category_id: updates.category_id,
        brand: updates.brand,
        is_published: updates.is_published,
        is_featured: updates.is_featured,
        is_new: updates.is_new,
        is_on_sale: updates.is_on_sale,
        stock_status: updates.stock_status,
        stock_count: updates.stockCount,
        sku: updates.sku,
        rating: updates.rating,
        review_count: updates.reviewCount,
        tags: updates.tags,
        material: updates.material,
        made_in: updates.madeIn,
        sort_
      })
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
export const createCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: `cat-${Date.now()}`,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        featured: category.featured ?? false,
        published: category.published ?? true,
        order: category.sort_order ?? 0,
        is_visible: category.is_visible ?? true,
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
      .update({
        name: updates.name,
        slug: updates.slug,
        description: updates.description,
        image_url: updates.image,
        
        
        
        is_visible: updates.is_visible,
      })
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
      .upsert({
        business_name: updates.businessName,
        name: updates.name,
        business_description: updates.businessDescription,
        tagline: updates.tagline,
        phone: updates.phone,
        phone_raw: updates.phoneRaw,
        phone_numbers: updates.phoneNumbers,
        email: updates.email,
        telegram: updates.telegram,
        telegram_username: updates.telegramUsername,
        telegram_channel: updates.telegramChannel,
        instagram_username: updates.instagramUsername,
        address: updates.address,
        city: updates.city,
        landmark: updates.landmark,
        working_hours: updates.workingHours,
        working_hours_detail: updates.workingHoursDetail,
        social_links: updates.socialLinks,
        primary_color: updates.primaryColor,
        currency: updates.currency,
        coordinates: updates.coordinates,
      });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating store info:', err);
    return null;
  }
};

// Prompt CRUD
export const createPrompt = async (prompt: Omit<ClothingPromptItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        id: `prompt-${Date.now()}`,
        title: prompt.title,
        description: prompt.description,
        content_type: prompt.content_type,
        category: prompt.category,
        subcategory: prompt.subcategory,
        product_type: prompt.product_type,
        prompt: prompt.prompt,
        recommended_tool: prompt.recommended_tool,
        recommended_tool_url: prompt.recommended_tool_url,
        difficulty: prompt.difficulty,
        tags: prompt.tags ?? [],
        aspect_ratio: prompt.aspect_ratio,
        is_featured: prompt.is_featured ?? false,
        is_published: prompt.is_published ?? true,
        sort_order: prompt.sort_order ?? 0,
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
      .update({
        title: updates.title,
        description: updates.description,
        content_type: updates.content_type,
        category: updates.category,
        subcategory: updates.subcategory,
        product_type: updates.product_type,
        prompt: updates.prompt,
        recommended_tool: updates.recommended_tool,
        recommended_tool_url: updates.recommended_tool_url,
        difficulty: updates.difficulty,
        tags: updates.tags,
        aspect_ratio: updates.aspect_ratio,
        is_featured: updates.is_featured,
        is_published: updates.is_published,
        sort_
      })
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
export const createTestimonial = async (testimonial: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        id: `rev-${Date.now()}`,
        name: testimonial.name,
        location: testimonial.location,
        avatar: testimonial.avatar,
        rating: testimonial.rating,
        comment: testimonial.comment,
        date: testimonial.date,
        verified_visit: testimonial.verifiedVisit ?? false,
        purchased_product: testimonial.purchasedProduct,
        is_published: testimonial.published ?? true,
        sort_order: testimonial.order ?? 0,
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
      .update({
        name: updates.name,
        location: updates.location,
        avatar_url: updates.avatar_url,
        rating: updates.rating,
        comment: updates.comment,
        date: updates.date,
        verified_visit: updates.verified_visit,
        purchased_product: updates.purchased_product,
        is_published: updates.is_published,
        sort_
      })
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
export const createFaq = async (faq: Omit<FaqItem, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        id: `faq-${Date.now()}`,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        is_published: faq.is_published ?? true,
        sort_order: faq.sort_order ?? 0,
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
      .update({
        question: updates.question,
        answer: updates.answer,
        category: updates.category,
        is_published: updates.is_published,
        sort_
      })
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
