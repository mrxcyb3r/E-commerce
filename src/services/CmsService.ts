import { supabase } from '../lib/supabase/client';
import type { HomepageCms, AboutCms, ContactCms } from '../types/cms';

export class CmsService {
  static async getHomepageCms(): Promise<HomepageCms> {
    const { data, error } = await supabase
      .from('homepage_cms')
      .select('*')
      .single();

    if (error) throw error;
    if (!data) {
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
          heroImageUrl: '',
        },
        stats: [],
        promoBanner: {
          badge: 'Yangi Mavsum Taklifi',
          title: 'Bahor & Yoz Yangi Kolleksiyasi',
          subtitle: 'Eng zamonaviy uslub va qulaylik',
          description: 'Do\'konimizga yangi fasl uchun eng sara futbolkalar, krossovkalar va yengil kiyimlar to\'plami yetib keldi. O\'zingizga mos o\'lchamni tanlang!',
          buttonText: 'Kolleksiyani ko\'rish',
          buttonLink: '/products',
          imageUrl: '',
          enabled: false,
        },
        whyChooseUsTitle: 'Nega Aynan Bizning Do\'kon?',
        whyChooseUsSubtitle: 'Zamonaviy kiyinish va qulay xarid uchun barcha qulayliklar',
        features: [],
        featuredSectionTitle: 'Mashhur Mahsulotlar',
        featuredSectionSubtitle: 'Mijozlarimiz tomonidan eng ko\'p tanlanayotgan eng sara to\'plamlar',
        videoSectionTitle: 'Jonli Vitrina — Videolarda Ko\'ring',
        videoSectionSubtitle: 'Kiyimlarning haqiqiy ko\'rinishi, matosi va kiyilishini qisqa videolarda tomosha qiling',
      };
    }
    return data as HomepageCms;
  }

  static async updateHomepageCms(cms: Partial<HomepageCms>): Promise<HomepageCms> {
    // Get current CMS data first
    const { data: current, error: fetchError } = await supabase
      .from('homepage_cms')
      .select('*')
      .single();

    if (fetchError) throw fetchError;

    const updated = {
      ...current,
      ...cms,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('homepage_cms')
      .upsert({
        ...updated,
      })
      .select()
      .single();

    if (error) throw error;
    return data as HomepageCms;
  }

  static async getAboutCms(): Promise<AboutCms> {
    const { data, error } = await supabase
      .from('about_cms')
      .select('*')
      .single();

    if (error) throw error;
    if (!data) {
      return {
        title: 'Zamonaviy Uslub va Sifat Markazi',
        subtitle: 'Jizzax shahrida mijozlarimizga eng sara kiyim-kechak va poyabzallarni taqdim etib kelmoqdamiz.',
        mainStory: 'Bizning maqsadimiz — har bir mijozga o\'z uslubiga mos, qulay va uzoq vaqt xizmat qiladigan kiyimlarni qulay narxlarda topishiga yordam berishdir. Raqamli vitrinamiz orqali siz uydan chiqmasdan xaridni rejalashtirishingiz mumkin.',
        secondStory: 'Do\'konimizda doimiy ravishda yangi kolleksiyalar yangilanib turadi. Erkaklar, ayollar, bolalar kiyimlari va sifatli oyoq kiyimlarning keng assortimenti sizni kutmoqda.',
        mission: 'Har bir inson uchun zamonaviy kiyinishni oson, shaffof va zavqli jarayonga aylantirish.',
        vision: 'Mintaqadagi eng ishonchli va sevimli mahalliy brendga aylanish.',
        images: [],
        features: [],
      };
    }
    return data as AboutCms;
  }

  static async updateAboutCms(cms: Partial<AboutCms>): Promise<AboutCms> {
    const { data: current, error: fetchError } = await supabase
      .from('about_cms')
      .select('*')
      .single();

    if (fetchError) throw fetchError;

    const updated = {
      ...current,
      ...cms,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('about_cms')
      .upsert({
        ...updated,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AboutCms;
  }

  static async getContactCms(): Promise<ContactCms> {
    const { data, error } = await supabase
      .from('contact_cms')
      .select('*')
      .single();

    if (error) throw error;
    if (!data) {
      return {
        title: 'Biz Bilan Bog\'laning',
        subtitle: 'Savollaringiz bormi yoki mahsulot zaxirasini aniqlashtirmoqchimisiz? Biz bilan tezkor bog\'laning!',
        description: 'Telegram, telefon yoki do\'konimizga bevosita tashrif buyurib barcha ma\'lumotlarni olishingiz mumkin.',
        formEnabled: true,
        telegramDirectNote: 'Telegram orqali tezkor javob olishingiz mumkin — odatda 5-10 daqiqada javob beramiz.',
      };
    }
    return data as ContactCms;
  }

  static async updateContactCms(cms: Partial<ContactCms>): Promise<ContactCms> {
    const { data: current, error: fetchError } = await supabase
      .from('contact_cms')
      .select('*')
      .single();

    if (fetchError) throw fetchError;

    const updated = {
      ...current,
      ...cms,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('contact_cms')
      .upsert({
        ...updated,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ContactCms;
  }
}