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
  businessName: 'Do\'kon',
  name: 'Do\'kon',
  shortName: 'Do\'kon',
  businessDescription: "Sifatli mahsulotlar va qulay xarid imkoniyati",
  tagline: "Ozingizga mos mahsulotlarni toping",
  heroTitle: "Yoqtirganingizni toping",
  heroSubtitle: "Katalog orqali mahsulotlarni ko'ring, narxini biling va do'konimizga keling",
  aboutText: "Zamonaviy do'konimizda keng mobdar mahsulotlar mavjud",
  mission: 'Mijozlarga qulay xarid tajribasi yaratish',
  vision: 'Mijozlarni maxsus xarid tajribasiga aylanish',
  phone: '',
  phoneRaw: '',
  email: 'admin@dokon.uz',
  adminEmail: 'admin@dokon.uz',
  adminName: "Bavfaqatgi Administratori",
  telegram: '',
  telegramUsername: '',
  instagramUsername: '',
  address: '',
  city: '',
  landmark: '',
  workingHours: '',
  workingHoursDetail: {
    weekdays: '',
    weekend: '',
    note: '',
  },
  socialLinks: {
    telegram: '',
    instagram: '',
    facebook: '',
  },
  primaryColor: '#0f172a',
  secondaryColor: '#f59e0b',
  accentColor: '#ef4444',
  currency: "so'm",
  coordinates: {
    lat: 0,
    lng: 0,
  },
  logoUrl: '',
  logoDarkUrl: '',
  faviconUrl: '',
  businessCategory: 'Kiyim-kechak',
  language: 'uz',
  supportedLanguages: ['uz', 'ru', 'en'],
  defaultSeoTitle: 'Do\'kon — Sifatli Mahsulotlar',
  defaultSeoDescription: "Do'konda sifatli mahsulotlar, narxlar va qulay xarid imkoniyati",
  defaultSeoKeywords: 'do\'kon, mahsulotlar, kiyim, poyabzal, ecommerce, xarid',
  ogImageUrl: '',
  twitterImageUrl: '',
  copyright: '© 2026',
  footerText: 'Barcha huquqlar himoyalangan',
};

export const TRUST_STATS = [
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
