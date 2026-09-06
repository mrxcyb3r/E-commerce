import { HomepageCms, AboutCms, ContactCms } from '../types/cms';

export const INITIAL_HOMEPAGE_CMS: HomepageCms = {
  hero: {
    badge: 'O\'lningizdagi mahsulotlar',
    title: 'Sifatli Kiyimlar va Oyoq Kiyimlar',
    highlightedTitle: 'Mahsulotlar',
    subtitle: 'Mahsulotlarimizni uydan chiqmasdan ko\'ring, narxlarini va mavjudligini aniqlang hamda do\'konimizga murojaat qilng.',
    primaryButtonText: 'Katalogga o\'tish',
    primaryButtonLink: '/products',
    secondaryButtonText: 'Do\'kon manzili',
    secondaryButtonLink: '/location',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  },
  stats: [
    {
      id: 'products',
      value: '100+',
      label: 'Mahsulot',
      sublabel: 'Doimiy yangilanuvchi kolleksiya',
      dynamic: true,
    },
    {
      id: 'collections',
      value: 'Yangi',
      label: 'Kolleksiyalar',
      sublabel: 'Mavsumiy eng so\'nggi trendlar',
      dynamic: false,
    },
    {
      id: 'shopping',
      value: 'Qulay',
      label: 'Xarid tajribasi',
      sublabel: 'Narx va o\'lchamlar ochiq',
      dynamic: false,
    },
    {
      id: 'store',
      value: 'Mahalliy',
      label: 'Do\'kon',
      sublabel: 'Kiyib ko\'rish va tanlash imkoni',
      dynamic: false,
    },
  ],
  promoBanner: {
    badge: 'Yangi Mavsum Taklifi',
    title: 'Bahor & Yoz Yangi Kolleksiyasi',
    subtitle: 'Eng zamonaviy uslub va qulaylik',
    description: 'Do\'konimizga yangi fasl uchun eng sara futbolkalar, krossovkalar va yengil kiyimlar to\'plami yetib keldi. O\'zingizga mos o\'lchamni tanlang!',
    buttonText: 'Kolleksiyani ko\'rish',
    buttonLink: '/products',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    enabled: true,
  },
  whyChooseUsTitle: 'Nega Aynan Bizning Do\'kon?',
  whyChooseUsSubtitle: 'Zamonaviy kiyinish va qulay xarid uchun barcha qulayliklar',
  features: [
    {
      id: 'feat-1',
      icon: 'Eye',
      title: 'Shaffof Onlayn Ko\'rish',
      description: 'Barcha narxlar, o\'lchamlar va ranglar saytimizda 100% ochiq ko\'rsatilgan.',
    },
    {
      id: 'feat-2',
      icon: 'Sparkles',
      title: 'Haqiqiy Sifat Kafolati',
      description: 'Faqat sinovdan o\'tgan matolar, qulay andazalar va mustahkam tikuvlar.',
    },
    {
      id: 'feat-3',
      icon: 'ShieldCheck',
      title: 'Kiyib Ko\'rish Imkoniyati',
      description: 'Do\'konga kelib, kiyinish xonalarimizda o\'zingizga mosligiga to\'liq ishonch hosil qiling.',
    },
    {
      id: 'feat-4',
      icon: 'Clock',
      title: 'Har Kuni Ochiq',
      description: 'Dam olish kunlarisiz, haftaning 7 kuni soat 09:00 dan 20:00 gacha xizmatingizdamiz.',
    },
  ],
  featuredSectionTitle: 'Mashhur Mahsulotlar',
  featuredSectionSubtitle: 'Mijozlarimiz tomonidan eng ko\'p tanlanayotgan eng sara to\'plamlar',
  videoSectionTitle: 'Onlayn Ko\'rish',
  videoSectionSubtitle: 'Kiyimlarning haqiqiy ko\'rinishi, matosi va kiyilishini qisqa videolarda tomosha qiling',
};

export const INITIAL_ABOUT_CMS: AboutCms = {
  title: 'Zamonaviy Uslub va Sifat Markazi',
  subtitle: 'Do\'konimizda mijozlarimizga eng sara kiyim-kechak va poyabzallarni taqdim etib kelamiz.',
  mainStory: 'Bizning maqsadimiz — har bir mijozga o\'z uslubiga mos, qulay va uzoq vaqt xizmat qiladigan kiyimlarni qulay narxlarda topishiga yordam berishdir. Onlayn do\'konimiz orqali siz uydan chiqmasdan savol berishingiz mumkin.',
  secondStory: 'Do\'konimizda doimiy ravishda yangi kolleksiyalar yangilanib turadi. Erkaklar, ayollar, bolalar kiyimlari va sifatli oyoq kiyimlarining keng assortimenti sizni kutmoqda.',
  mission: 'Har bir inson uchun zamonaviy kiyinishni oson, shaffof va zavqli jarayonga aylantirish.',
  vision: 'Mintaqadagi eng ishonchli va sevimli mahalliy brendga aylanish.',
  images: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80',
  ],
  features: [
    {
      title: 'Yuqori Sifatli Matolar',
      description: 'Har bir mahsulot materialini sinchkovlik bilan tanlaymiz.',
    },
    {
      title: 'Hamyonbop Narxlar',
      description: 'Hech qanday keraksiz ustamalarsiz to\'g\'ridan-to\'g\'ri shaffof narxlar.',
    },
    {
      title: 'Samimiy Xizmat',
      description: 'Mutaxassis xodimlarimiz sizga mos o\'lcham va uslubni tanlashda bajonidil ko\'maklashadi.',
    },
  ],
};

export const INITIAL_CONTACT_CMS: ContactCms = {
  title: 'Biz Bilan Bog\'laning',
  subtitle: 'Savollaringiz bormi yoki mahsulot zaxirasini aniqlashtirmoqchimisiz? Biz bilan tezkor bog\'laning!',
  description: 'Telegram, telefon yoki do\'konimizga bevosita tashrif buyurib barcha ma\'lumotlarni olishingiz mumkin.',
  formEnabled: true,
  telegramDirectNote: 'Telegram orqali tezkor javob olishingiz mumkin — odatda 5-10 daqiqada javob beramiz.',
};
