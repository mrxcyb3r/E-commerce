export interface SocialLinks {
  telegram: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export interface BusinessConfig {
  businessName: string;
  name?: string;
  businessDescription: string;
  tagline: string;
  phone: string;
  phoneRaw: string;
  phoneNumbers?: string[];
  email?: string;
  telegram: string;
  telegramUsername: string;
  telegramChannel?: string;
  instagramUsername?: string;
  address: string;
  city: string;
  landmark: string;
  workingHours: string;
  workingHoursDetail: {
    weekdays: string;
    weekend: string;
    note: string;
  };
  socialLinks: SocialLinks;
  primaryColor: string;
  currency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl?: string;
  yandexMapsUrl?: string;
}
