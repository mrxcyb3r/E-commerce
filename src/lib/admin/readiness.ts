import { Product, Category } from '../../types/product';
import { BusinessConfig } from '../../types/business';
import { HomepageCms, HomepageSlide } from '../../types/cms';

export type ReadinessGroup = 'identity' | 'catalog' | 'content' | 'contact';

export interface ReadinessItem {
  key: string;
  group: ReadinessGroup;
  label: string;
  done: boolean;
  suggestion: string;
  href: string;
}

export interface StoreReadiness {
  items: ReadinessItem[];
  score: number;
  done: number;
  total: number;
}

export interface ReadinessInputs {
  products: Product[];
  categories: Category[];
  storeInfo: BusinessConfig;
  homepageCms: HomepageCms;
  homepageSlides: HomepageSlide[];
  videos: Array<{ id: string }>;
}

export interface ProductHealth {
  score: number;
  issues: string[];
}

const GROUP_ORDER: ReadinessGroup[] = ['identity', 'catalog', 'content', 'contact'];

export const READINESS_GROUP_LABELS: Record<ReadinessGroup, string> = {
  identity: 'Do\'kon identifikatsiyasi',
  catalog: 'Katalog',
  content: 'Kontent',
  contact: 'Aloqa va manzil',
};

export function computeStoreReadiness({
  products,
  categories,
  storeInfo,
  homepageCms,
  homepageSlides,
  videos,
}: ReadinessInputs): StoreReadiness {
  const missingImages = products.filter((p) => !p.images || p.images.length === 0);
  const publishedInStock = products.filter(
    (p) => p.published !== false && p.inStock
  );
  const activeSlides = homepageSlides.filter((s) => s.active);
  const hero = homepageCms.hero;
  const heroOk = Boolean(hero.title?.trim() && hero.subtitle?.trim() && hero.heroImage);

  const items: ReadinessItem[] = [
    {
      key: 'name',
      group: 'identity',
      label: 'Do\'kon nomi',
      done: Boolean(storeInfo.businessName?.trim()),
      suggestion: 'Do\'kon nomini kiriting',
      href: '/admin/onboarding?step=1',
    },
    {
      key: 'logo',
      group: 'identity',
      label: 'Logotip',
      done: Boolean(storeInfo.logoUrl),
      suggestion: 'Logotip yuklang',
      href: '/admin/store',
    },
    {
      key: 'working_hours',
      group: 'identity',
      label: 'Ish vaqti',
      done: Boolean(storeInfo.workingHours?.trim()),
      suggestion: 'Ish vaqtini kiriting',
      href: '/admin/onboarding?step=1',
    },
    {
      key: 'categories',
      group: 'catalog',
      label: 'Kategoriyalar',
      done: categories.length > 0,
      suggestion: 'Birinchi kategoriyani yarating',
      href: '/admin/categories',
    },
    {
      key: 'first_product',
      group: 'catalog',
      label: 'Birinchi mahsulot',
      done: products.length > 0,
      suggestion: 'Birinchi mahsulotni qo\'shing',
      href: '/admin/products/new',
    },
    {
      key: 'product_images',
      group: 'catalog',
      label: 'Mahsulot rasmlari',
      done: missingImages.length === 0,
      suggestion: `${missingImages.length} ta mahsulotga rasm qo\'shing`,
      href: '/admin/products',
    },
    {
      key: 'in_stock',
      group: 'catalog',
      label: 'Zaxiradagi mahsulot',
      done: publishedInStock.length > 0,
      suggestion: 'Kamida 1 ta mahsulotni zaxirada belgilang',
      href: '/admin/inventory',
    },
    {
      key: 'homepage_hero',
      group: 'content',
      label: 'Bosh sahifa hero',
      done: heroOk,
      suggestion: 'Hero sarlavha, matn va rasmni to\'ldiring',
      href: '/admin/homepage',
    },
    {
      key: 'slides',
      group: 'content',
      label: 'Faol slaydlar',
      done: activeSlides.length > 0,
      suggestion: 'Kamida 1 ta faol slayd qo\'shing',
      href: '/admin/homepage',
    },
    {
      key: 'feed',
      group: 'content',
      label: 'Feed videolari',
      done: videos.length > 0,
      suggestion: 'Birinchi feed videoni yuklang',
      href: '/admin/feed',
    },
    {
      key: 'phone',
      group: 'contact',
      label: 'Telefon raqam',
      done: Boolean(storeInfo.phoneNumbers?.[0] || storeInfo.phone),
      suggestion: 'Telefon raqamni kiriting',
      href: '/admin/onboarding?step=3',
    },
    {
      key: 'telegram',
      group: 'contact',
      label: 'Telegram',
      done: Boolean(storeInfo.telegramUsername?.trim()),
      suggestion: 'Telegram username kiriting',
      href: '/admin/onboarding?step=3',
    },
    {
      key: 'address',
      group: 'contact',
      label: 'Manzil',
      done: Boolean(storeInfo.address?.trim()),
      suggestion: 'Do\'kon manzilini kiriting',
      href: '/admin/onboarding?step=3',
    },
  ];

  const done = items.filter((i) => i.done).length;
  const score = Math.round((done / items.length) * 100);

  return { items, score, done, total: items.length };
}

export function topReadinessTasks(
  readiness: StoreReadiness,
  limit = 3
): ReadinessItem[] {
  return readiness.items
    .filter((i) => !i.done)
    .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group))
    .slice(0, limit);
}

export function productHealth(p: Product): ProductHealth {
  const issues: string[] = [];
  let score = 0;

  if (p.images && p.images.length > 0) score += 25;
  else issues.push('Rasm yo‘q');

  if (p.name && p.name.trim().length >= 3) score += 15;
  else issues.push('Nomi juda qisqa');

  if (p.price > 0) score += 15;
  else issues.push('Narx kiritilmagan');

  if (p.category?.trim()) score += 10;
  else issues.push('Kategoriya tanlanmagan');

  const desc = (p.short_description ?? '') + ' ' + p.description;
  if (desc.trim().length >= 20) score += 15;
  else issues.push('Tavsif yetarli emas');

  if (p.sizes && p.sizes.length > 0) score += 10;
  else issues.push('O‘lchamlar yo‘q');

  if (p.colors && p.colors.length > 0) score += 5;
  if (p.inStock) score += 5;
  else issues.unshift('Zaxira yo‘q');

  return { score, issues };
}

export const ONBOARDING_DISMISSED_KEY = 'onboarding_dismissed_v1';
export const ONBOARDING_COMPLETED_KEY = 'onboarding_completed_v1';

export function onboardingDismissed(): boolean {
  try {
    return sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function onboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(v: boolean): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, v ? '1' : '0');
  } catch {
    // ignore
  }
}

export function setOnboardingDismissed(v: boolean): void {
  try {
    sessionStorage.setItem(ONBOARDING_DISMISSED_KEY, v ? '1' : '0');
  } catch {
    // ignore
  }
}