import { BusinessConfig } from '../types/business';

/**
 * BRANDING DEFAULTS — the single source of truth for store identity.
 *
 * White-label workflow for a new client:
 *   1. Duplicate this project.
 *   2. Change ONLY the values in this file (businessName, contact info,
 *      colors, logo, SEO defaults ...).
 *   3. Log into /admin → Do'kon → set the same contact/branding values
 *      (they get persisted to `store_settings` in Supabase and then take
 *      over from these defaults).
 *   4. Deploy. Done.
 *
 * Everything brand-specific reads from `useStore().storeInfo`, which is
 * hydrated from the `store_settings` table and falls back to this file.
 */
export const BUSINESS_CONFIG: BusinessConfig = {
  businessName: 'Ecommerce',
  name: 'Ecommerce',
  shortName: 'Ecom',
  businessDescription: "O'nline do'konimizda sifatli mahsulotlar",
  tagline: "Mahsulotlarni onlayn ko'ring, narxlarni oldindan biling va do'konimizdan qulay xarid qiling.",
  heroTitle: 'Yangiliklar va trendlar',
  heroSubtitle: 'Mahsulotlarni onlayn ko\'ring va do\'konimizga tashrif buyuring',
  aboutText: "Biz mahalliy mijozlarga sifatli mahsulotlar yetkazib beradigan zamonaviy do'konmiz.",
  mission: 'Sifatli mahsulotlarni qulay narxlarda taqdim etish',
  vision: 'Mahalliy bozorda yetakchi sifatga ega do\'konga aylanish',
  phone: '+998 90 123 45 67',
  phoneRaw: '+998901234567',
  email: 'admin@dokon.uz',
  adminEmail: 'admin@dokon.uz',
  adminName: "Do'kon Administratori",
  telegram: 'https://t.me/ecommerce_uz',
  telegramUsername: '@ecommerce_uz',
  instagramUsername: '@ecommerce_uz',
  address: 'Yangibot, Jizzax, O\'zbekiston',
  city: 'Jizzax',
  landmark: "Markaziy bozor yaqinida, Savdo majmuasi 2-qavat",
  workingHours: 'Har kuni 09:00 — 20:00',
  workingHoursDetail: {
    weekdays: '09:00 — 20:00 (Dushanba - Juma)',
    weekend: '09:00 — 21:00 (Shanba - Yakshanba)',
    note: "Tanaffussiz xizmat ko'rsatamiz",
  },
  socialLinks: {
    telegram: 'https://t.me/ecommerce_uz',
    instagram: 'https://instagram.com/ecommerce_uz',
    facebook: 'https://facebook.com/ecommerce_uz',
  },
  primaryColor: '#0f172a',
  secondaryColor: '#f59e0b',
  accentColor: '#ef4444',
  currency: "so'm",
  coordinates: {
    lat: 40.1158,
    lng: 67.8422,
  },
  logoUrl: '',
  logoDarkUrl: '',
  faviconUrl: '',
  businessCategory: 'Kiyim-kechak',
  language: 'uz',
  supportedLanguages: ['uz', 'ru', 'en'],
  defaultSeoTitle: 'Ecommerce — Zamonaviy va sifatli mahsulotlar',
  defaultSeoDescription: "Ecommerce onlayn do'koni — mahsulotlarni onlayn ko'ring, narxlarni oldindan biling va qulay xarid qiling.",
  defaultSeoKeywords: 'do\'kon, mahsulotlar, kiyim, poyabzal, aksessuarlar, ecommerce, xarid',
  ogImageUrl: '',
  twitterImageUrl: '',
  copyright: '© 2026',
  footerText: 'Barcha huquqlar himoyalangan',
};

export const TRUST_STATS = [
  {
    id: 'products',
    value: '100+',
    label: 'Mahsulot',
    sublabel: 'Doimiy yangilanuvchi kolleksiya',
  },
  {
    id: 'collections',
    value: 'Yangi',
    label: 'Kolleksiyalar',
    sublabel: 'Mavsumiy eng so\'nggi trendlar',
  },
  {
    id: 'shopping',
    value: 'Qulay',
    label: 'Xarid tajribasi',
    sublabel: 'Narx va o\'lchamlar ochiq',
  },
  {
    id: 'store',
    value: 'Mahalliy',
    label: 'Do\'kon',
    sublabel: 'Kiyib ko\'rish va tanlash imkoni',
  },
];

export type { BusinessConfig } from '../types/business';
