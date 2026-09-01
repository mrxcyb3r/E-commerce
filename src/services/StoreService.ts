import { supabase } from '../lib/supabase/client';
import type { StoreSettings, BusinessConfig } from '../types/business';

export class StoreService {
  static async getStoreSettings(): Promise<StoreSettings> {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) throw error;
    if (!data) {
      return {
        id: '',
        business_name: 'Ecommerce',
        name: null,
        business_description: 'Zamonaviy va sifatli mahsulotlar raqamli vitrinasi',
        tagline: 'Mahsulotlarni onlayn ko\'ring, narxlarni oldindanBilling va do\'konimizdan qulay xarid qiling.',
        phone: '+998 90 123 45 67',
        phone_raw: '+998901234567',
        phone_numbers: [],
        email: null,
        telegram: 'https://t.me/ecommerce_uz',
        telegram_username: '@ecommerce_uz',
        telegram_channel: null,
        instagram_username: null,
        address: 'Yangibot, Jizzax, O\'zbekiston',
        city: 'Jizzax',
        landmark: 'Markaziy bozor yaqinida, Savdo majmuasi 2-qavat',
        working_hours: 'Har kuni 09:00 — 20:00',
        working_hours_detail: {
          weekdays: '09:00 — 20:00 (Dushanba - Juma)',
          weekend: '09:00 — 21:00 (Shanba - Yakshanba)',
          note: 'Tanaffussiz xizmat ko\'rsatamiz',
        },
        social_links: {
          telegram: 'https://t.me/ecommerce_uz',
          instagram: 'https://instagram.com/ecommerce_uz',
          facebook: 'https://facebook.com/ecommerce_uz',
        },
        primary_color: '#0f172a',
        currency: 'so\'m',
        coordinates: {
          lat: 40.1158,
          lng: 67.8422,
        },
        google_maps_url: null,
        yandex_maps_url: null,
        updated_at: new Date().toISOString(),
      };
    }
    return data as StoreSettings;
  }

  static async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const { data: current, error: fetchError } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (fetchError) throw fetchError;

    const updated = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        ...updated,
      })
      .select()
      .single();

    if (error) throw error;
    return data as StoreSettings;
  }

  static async updateBusinessConfig(config: Partial<BusinessConfig>): Promise<BusinessConfig> {
    const settings = await this.getStoreSettings();

    const updated = {
      ...settings,
      ...config,
      updated_at: new Date().toISOString(),
    };

    return this.updateStoreSettings(updated as Partial<StoreSettings>);
  }
}