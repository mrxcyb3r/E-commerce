import { BusinessConfig } from '../types/business';

/**
 * BRANDING DEFAULTS — the single source of truth for store identity.
 *
 * White-label workflow for a new client:
 *   1. Duplicate this project.
 *   2. Change ONLY the values in this file (businessName, contact info,
 *      colors, logo, SEO defaults …).
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
  businessDescription: "O'nline do'konimizda sifatli mahsulotlar",
  tagline: "Mahsulotlarni onlayn ko'ring, narxlarni oldindan biling va do'konimizdan qulay xarid qiling.",
  phone: '+998 90 123 45 67',
  phoneRaw: '+998901234567',
  email: 'admin@dokon.uz',
  telegram: 'https://t.me/ecommerce_uz',
  telegramUsername: '@ecommerce_uz',
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
  currency: "so'm",
  coordinates: {
    lat: 40.1158,
    lng: 67.8422,
  },
  logoUrl: '',
  faviconUrl: '',
  businessCategory: 'Kiyim-kechak',
  language: 'uz',
  defaultSeoTitle: 'Ecommerce — Zamonaviy va sifatli mahsulotlar',
  defaultSeoDescription: "Ecommerce onlayn do'koni — mahsulotlarni onlayn ko'ring, narxlarni oldindan biling va qulay xarid qiling.",
  ogImageUrl: '',
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