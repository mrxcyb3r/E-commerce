import { BusinessConfig } from '../types/business';

export const BUSINESS_CONFIG: BusinessConfig = {
  businessName: 'Ecommerce',
  name: 'Ecommerce',
  businessDescription: 'O\'nline do\'konimizda sifatli mahsulotlar',
  tagline: 'Mahsulotlarni onlayn ko\'ring, narxlarni oldindan biling va do\'konimizdan qulay xarid qiling.',
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
