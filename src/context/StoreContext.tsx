import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Product, Category } from '../types/product';
import { ClothingPromptItem } from '../types/prompt';
import { Review } from '../types/review';
import { FaqItem } from '../types/faq';
import { VideoItem } from '../types/video';
import { BusinessConfig } from '../types/business';
import { HomepageCms, AboutCms, ContactCms, AdminActivityLog } from '../types/cms';

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
  // Helper to load from localStorage with fallback
  const loadInitial = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return fallback;
  };

  // Products state (ensure all have published property)
  const [products, setProducts] = useState<Product[]>(() => {
    const raw = loadInitial<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return raw.map((p) => ({
      ...p,
      published: p.published !== undefined ? p.published : true,
    }));
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    const raw = loadInitial<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return raw.map((c) => ({
      ...c,
      published: c.published !== undefined ? c.published : true,
    }));
  });

  // Prompts state
  const [prompts, setPrompts] = useState<ClothingPromptItem[]>(() => {
    return loadInitial<ClothingPromptItem[]>(KEYS.PROMPTS, INITIAL_PROMPTS);
  });

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Review[]>(() => {
    const raw = loadInitial<Review[]>(KEYS.TESTIMONIALS, INITIAL_REVIEWS);
    return raw.map((r) => ({
      ...r,
      published: r.published !== undefined ? r.published : true,
    }));
  });

  // FAQ state
  const [faq, setFaq] = useState<FaqItem[]>(() => {
    const raw = loadInitial<FaqItem[]>(KEYS.FAQ, INITIAL_FAQ);
    return raw.map((f) => ({
      ...f,
      published: f.published !== undefined ? f.published : true,
    }));
  });

  // Store info state
  const [storeInfo, setStoreInfo] = useState<BusinessConfig>(() => {
    return loadInitial<BusinessConfig>(KEYS.STORE_INFO, INITIAL_BUSINESS);
  });

  // Homepage CMS state
  const [homepageCms, setHomepageCms] = useState<HomepageCms>(() => {
    return loadInitial<HomepageCms>(KEYS.HOMEPAGE, INITIAL_HOMEPAGE_CMS);
  });

  // About CMS state
  const [aboutCms, setAboutCms] = useState<AboutCms>(() => {
    return loadInitial<AboutCms>(KEYS.ABOUT, INITIAL_ABOUT_CMS);
  });

  // Contact CMS state
  const [contactCms, setContactCms] = useState<ContactCms>(() => {
    return loadInitial<ContactCms>(KEYS.CONTACT, INITIAL_CONTACT_CMS);
  });

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>(() => {
    return loadInitial<AdminActivityLog[]>(KEYS.LOGS, [
      {
        id: 'log-init',
        action: 'setting',
        entity: 'store',
        description: 'Tizim ishga tushirildi va boshlang\'ich ma\'lumotlar yuklandi',
        timestamp: new Date().toISOString(),
      },
    ]);
  });

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
    return products.filter((p) => p.published !== false);
  }, [products]);

  const featuredProducts = useMemo(() => {
    return publishedProducts.filter((p) => p.isFeatured);
  }, [publishedProducts]);

  const newProducts = useMemo(() => {
    return publishedProducts.filter((p) => p.isNew);
  }, [publishedProducts]);

  const discountedProducts = useMemo(() => {
    return publishedProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
  }, [publishedProducts]);

  // Dynamic category product count calculation
  const categoriesWithDynamicCount = useMemo(() => {
    return categories.map((cat) => {
      const count = publishedProducts.filter(
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
      published: promptData.published !== undefined ? promptData.published : true,
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
