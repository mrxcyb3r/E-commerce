export interface SocialLinks {
  telegram: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
}

export interface WorkingHoursDetail {
  weekdays: string;
  weekend: string;
  note: string;
}

export interface BusinessConfig {
  businessName: string;
  name?: string;
  shortName?: string;
  businessDescription: string;
  tagline: string;
  heroTitle?: string;
  heroSubtitle?: string;
  aboutText?: string;
  mission?: string;
  vision?: string;
  phone?: string;
  phoneRaw?: string;
  phoneNumbers?: string[];
  email?: string;
  adminEmail?: string;
  adminName?: string;
  telegram: string;
  telegramUsername: string;
  telegramChannel?: string;
  instagramUsername?: string;
  instagramHandle?: string;
  address: string;
  city: string;
  landmark: string;
  workingHours: string;
  workingHoursDetail: WorkingHoursDetail;
  socialLinks: SocialLinks;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  currency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl?: string;
  yandexMapsUrl?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  businessCategory?: string;
  language?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  defaultSeoKeywords?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
  copyright?: string;
  footerText?: string;
  supportedLanguages?: string[];
}
