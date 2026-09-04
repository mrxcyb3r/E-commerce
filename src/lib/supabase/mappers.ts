import type { Product, Category } from '../../types/product';
import type { Database } from '../../types/supabase-db';
import type { Review } from '../../types/review';
import type { FaqItem } from '../../types/faq';
import type { ClothingPromptItem } from '../../types/prompt';
import type { HomepageCms, AboutCms, ContactCms } from '../../types/cms';
import type { BusinessConfig } from '../../types/business';

type DbProduct = Database['public']['Tables']['products']['Row'];
type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbFeedPost = Database['public']['Tables']['feed_posts']['Row'];
type DbPrompt = Database['public']['Tables']['prompts']['Row'];
type DbTestimonial = Database['public']['Tables']['testimonials']['Row'];
type DbFaq = Database['public']['Tables']['faqs']['Row'];
type DbStoreSettings = Database['public']['Tables']['store_settings']['Row'];
type DbHomepageCms = Database['public']['Tables']['homepage_cms']['Row'];
type DbAboutCms = Database['public']['Tables']['about_cms']['Row'];
type DbContactCms = Database['public']['Tables']['contact_cms']['Row'];

export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80';

// ---- DB row -> app model mappers ----

export function mapDbCategoryToApp(row: DbCategory, productCount = 0): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    image: row.image_url ?? DEFAULT_IMAGE,
    featured: row.featured ?? false,
    published: row.is_visible !== false,
    sort_order: row.sort_order ?? 0,
    is_visible: row.is_visible,
    productCount,
  };
}

export function mapDbProductToApp(
  row: DbProduct,
  lookupCategory: (id: string | null) => Category | undefined,
): Product {
  const images: string[] =
    row.product_images && row.product_images.length > 0
      ? row.product_images
          .slice()
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((img) => img.url)
      : [DEFAULT_IMAGE];

  const sizes: string[] =
    row.product_sizes && row.product_sizes.length > 0
      ? row.product_sizes
          .filter((s) => s.is_available !== false)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((s) => s.size)
      : [];

  const colors =
    row.product_colors && row.product_colors.length > 0
      ? row.product_colors.map((c) => ({ name: c.name, hex: c.hex_code || '#18181b' }))
      : [];

  const cat = lookupCategory(row.category_id);
  const categorySlug = cat?.slug ?? row.category_id ?? '';
  const stockCount = row.stock_count ?? 0;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    short_description: row.short_description,
    category: categorySlug,
    categoryName: cat?.name ?? '',
    brand: row.brand ?? undefined,
    description: row.description ?? '',
    details: [],
    images,
    sizes,
    colors,
    inStock: (row.stock_status ?? 'mavjud') === 'mavjud' && stockCount > 0,
    stockCount,
    isNew: row.is_new ?? false,
    isFeatured: row.is_featured ?? false,
    isOnSale: row.is_on_sale ?? false,
    published: row.is_published !== false,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    sku: row.sku ?? '',
    stockStatus: row.stock_status ?? 'mavjud',
    material: row.material ?? undefined,
    madeIn: row.made_in ?? undefined,
    tags: row.tags ?? [],
    videoUrl: row.video_url ?? undefined,
    videoPosterUrl: row.video_poster_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDbPromptToApp(row: DbPrompt): ClothingPromptItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    content_type: row.content_type,
    category: row.category,
    subcategory: row.subcategory ?? '',
    productType: row.product_type ?? '',
    prompt: row.prompt,
    recommended_tool: row.recommended_tool ?? '',
    recommended_tool_url: row.recommended_tool_url ?? '',
    difficulty: row.difficulty ?? '',
    tags: row.tags ?? [],
    aspectRatio: row.aspect_ratio,
    useCase: row.description ?? '',
    featured: row.is_featured ?? false,
    published: row.is_published !== false,
    sort_order: row.sort_order ?? 0,
  };
}

export function mapDbTestimonialToApp(row: DbTestimonial): Review {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? undefined,
    avatar: row.avatar_url ?? undefined,
    rating: row.rating,
    comment: row.comment,
    date: row.date ?? '',
    verifiedVisit: row.verified_visit ?? false,
    purchasedProduct: row.purchased_product ?? undefined,
    published: row.is_published !== false,
    order: row.sort_order ?? 0,
  };
}

export function mapDbFaqToApp(row: DbFaq): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category ?? undefined,
    published: row.is_published !== false,
    sort_order: row.sort_order ?? 0,
    is_published: row.is_published !== false,
  };
}

export function mapDbStoreSettingsToApp(row: DbStoreSettings): BusinessConfig {
  return {
    businessName: row.business_name,
    name: row.name ?? row.business_name,
    businessDescription: row.business_description ?? '',
    tagline: row.tagline ?? '',
    phone: row.phone,
    phoneRaw: row.phone_raw ?? '',
    phoneNumbers: row.phone_numbers ?? [],
    email: row.email ?? undefined,
    telegram: row.telegram,
    telegramUsername: row.telegram_username ?? '',
    telegramChannel: row.telegram_channel ?? undefined,
    instagramUsername: row.instagram_username ?? undefined,
    address: row.address,
    city: row.city,
    landmark: row.landmark ?? '',
    workingHours: row.working_hours,
    workingHoursDetail: row.working_hours_detail
      ? {
          weekdays: row.working_hours_detail.weekdays ?? '',
          weekend: row.working_hours_detail.weekend ?? '',
          note: row.working_hours_detail.note ?? '',
        }
      : { weekdays: '', weekend: '', note: '' },
    socialLinks: row.social_links
      ? {
          telegram: row.social_links.telegram ?? '',
          instagram: row.social_links.instagram ?? undefined,
          facebook: row.social_links.facebook ?? undefined,
        }
      : { telegram: '' },
    primaryColor: row.primary_color,
    currency: row.currency,
    coordinates: row.coordinates
      ? { lat: row.coordinates.lat ?? 0, lng: row.coordinates.lng ?? 0 }
      : { lat: 0, lng: 0 },
    googleMapsUrl: row.google_maps_url ?? undefined,
    yandexMapsUrl: row.yandex_maps_url ?? undefined,
  };
}

export function mapDbHomepageCmsToApp(row: DbHomepageCms): HomepageCms {
  return {
    hero: {
      badge: row.hero_badge ?? '',
      title: row.hero_title ?? '',
      highlightedTitle: row.hero_highlighted_title ?? '',
      subtitle: row.hero_subtitle ?? '',
      primaryButtonText: row.hero_primary_cta_text ?? '',
      primaryButtonLink: row.hero_primary_cta_link ?? '',
      secondaryButtonText: row.hero_secondary_cta_text ?? '',
      secondaryButtonLink: row.hero_secondary_cta_link ?? '',
      heroImage: row.hero_image_url ?? '',
    },
    stats: [],
    promoBanner: {
      badge: row.promo_banner_badge ?? '',
      title: row.promo_banner_title ?? '',
      subtitle: row.promo_banner_subtitle ?? '',
      description: row.promo_banner_description ?? '',
      buttonText: row.promo_banner_button_text ?? '',
      buttonLink: row.promo_banner_button_link ?? '',
      imageUrl: row.promo_banner_image_url ?? '',
      enabled: row.promo_banner_enabled ?? false,
    },
    whyChooseUsTitle: row.why_choose_us_title ?? '',
    whyChooseUsSubtitle: row.why_choose_us_subtitle ?? '',
    features: Array.isArray(row.features)
      ? (row.features as HomepageCms['features'])
      : [],
    featuredSectionTitle: row.featured_section_title ?? '',
    featuredSectionSubtitle: row.featured_section_subtitle ?? '',
    videoSectionTitle: row.video_section_title ?? '',
    videoSectionSubtitle: row.video_section_subtitle ?? '',
  };
}

export function mapDbAboutCmsToApp(row: DbAboutCms): AboutCms {
  return {
    title: row.title,
    subtitle: row.subtitle ?? '',
    mainStory: row.main_story ?? '',
    secondStory: row.second_story ?? '',
    mission: row.mission ?? '',
    vision: row.vision ?? '',
    images: row.images ?? [],
    features: Array.isArray(row.features)
      ? (row.features as AboutCms['features'])
      : [],
  };
}

export function mapDbContactCmsToApp(row: DbContactCms): ContactCms {
  return {
    title: row.title,
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    formEnabled: row.form_enabled ?? true,
    telegramDirectNote: row.telegram_direct_note ?? '',
    supportNote: row.support_note ?? undefined,
    directHelpText: row.direct_help_text ?? undefined,
  };
}

// ---- App model -> DB payload mappers (for inserts/updates) ----

export function productToDb(product: Product) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description ?? '',
    price: product.price,
    original_price: product.originalPrice ?? null,
    currency: product.currency || 'uzs',
    brand: product.brand ?? null,
    is_published: product.published !== false,
    is_featured: product.isFeatured ?? false,
    is_new: product.isNew ?? false,
    is_on_sale: product.isOnSale ?? false,
    stock_status: product.stockStatus ?? (product.inStock ? 'mavjud' : 'tugagan'),
    stock_count: product.stockCount ?? 0,
    sku: product.sku ?? null,
    rating: product.rating ?? 0,
    review_count: product.reviewCount ?? 0,
    tags: product.tags ?? [],
    material: product.material ?? null,
    made_in: product.madeIn ?? null,
    video_url: product.videoUrl ?? null,
    video_poster_url: product.videoPosterUrl ?? null,
  };
}

export function categoryToDb(category: Category) {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    image_url: category.image ?? null,
    is_visible: category.is_visible ?? category.published !== false,
    featured: category.featured ?? false,
    sort_order: category.sort_order ?? category.order ?? 0,
  };
}

export function promptToDb(prompt: ClothingPromptItem) {
  return {
    title: prompt.title,
    description: prompt.description ?? null,
    content_type: prompt.content_type,
    category: prompt.category,
    subcategory: prompt.subcategory ?? null,
    product_type: prompt.productType ?? null,
    prompt: prompt.prompt,
    recommended_tool: prompt.recommended_tool ?? null,
    recommended_tool_url: prompt.recommended_tool_url ?? null,
    difficulty: prompt.difficulty ?? null,
    tags: prompt.tags ?? [],
    aspect_ratio: prompt.aspectRatio,
    is_featured: prompt.featured ?? false,
    is_published: prompt.published !== false,
    sort_order: prompt.sort_order ?? 0,
  };
}

export function testimonialToDb(review: Review) {
  return {
    name: review.name,
    location: review.location ?? null,
    avatar_url: review.avatar ?? null,
    rating: review.rating,
    comment: review.comment,
    date: review.date ?? null,
    verified_visit: review.verifiedVisit ?? false,
    purchased_product: review.purchasedProduct ?? null,
    is_published: review.published !== false,
    sort_order: review.order ?? 0,
  };
}

export function faqToDb(faq: FaqItem) {
  return {
    question: faq.question,
    answer: faq.answer,
    category: faq.category ?? null,
    is_published: faq.published !== false,
    sort_order: faq.sort_order ?? faq.order ?? 0,
  };
}

export function businessConfigToDb(config: BusinessConfig) {
  return {
    business_name: config.businessName,
    name: config.name ?? null,
    business_description: config.businessDescription ?? null,
    tagline: config.tagline ?? null,
    phone: config.phone,
    phone_raw: config.phoneRaw ?? null,
    phone_numbers: config.phoneNumbers ?? [],
    email: config.email ?? null,
    telegram: config.telegram,
    telegram_username: config.telegramUsername ?? null,
    telegram_channel: config.telegramChannel ?? null,
    instagram_username: config.instagramUsername ?? null,
    address: config.address,
    city: config.city,
    landmark: config.landmark ?? null,
    working_hours: config.workingHours,
    working_hours_detail: config.workingHoursDetail,
    social_links: config.socialLinks,
    primary_color: config.primaryColor,
    currency: config.currency,
    coordinates: config.coordinates,
    google_maps_url: config.googleMapsUrl ?? null,
    yandex_maps_url: config.yandexMapsUrl ?? null,
  };
}

export function homepageCmsToDb(cms: HomepageCms) {
  return {
    hero_badge: cms.hero?.badge ?? null,
    hero_title: cms.hero?.title ?? null,
    hero_highlighted_title: cms.hero?.highlightedTitle ?? null,
    hero_subtitle: cms.hero?.subtitle ?? null,
    hero_primary_cta_text: cms.hero?.primaryButtonText ?? null,
    hero_primary_cta_link: cms.hero?.primaryButtonLink ?? null,
    hero_secondary_cta_text: cms.hero?.secondaryButtonText ?? null,
    hero_secondary_cta_link: cms.hero?.secondaryButtonLink ?? null,
    hero_image_url: cms.hero?.heroImage ?? null,
    promo_banner_badge: cms.promoBanner?.badge ?? null,
    promo_banner_title: cms.promoBanner?.title ?? null,
    promo_banner_subtitle: cms.promoBanner?.subtitle ?? null,
    promo_banner_description: cms.promoBanner?.description ?? null,
    promo_banner_button_text: cms.promoBanner?.buttonText ?? null,
    promo_banner_button_link: cms.promoBanner?.buttonLink ?? null,
    promo_banner_image_url: cms.promoBanner?.imageUrl ?? null,
    promo_banner_enabled: cms.promoBanner?.enabled ?? false,
    why_choose_us_title: cms.whyChooseUsTitle ?? null,
    why_choose_us_subtitle: cms.whyChooseUsSubtitle ?? null,
    features: cms.features ?? [],
    featured_section_title: cms.featuredSectionTitle ?? null,
    featured_section_subtitle: cms.featuredSectionSubtitle ?? null,
    video_section_title: cms.videoSectionTitle ?? null,
    video_section_subtitle: cms.videoSectionSubtitle ?? null,
  };
}

export function aboutCmsToDb(cms: AboutCms) {
  return {
    title: cms.title,
    subtitle: cms.subtitle ?? null,
    main_story: cms.mainStory ?? null,
    second_story: cms.secondStory ?? null,
    mission: cms.mission ?? null,
    vision: cms.vision ?? null,
    images: cms.images ?? [],
    features: cms.features ?? [],
  };
}

export function contactCmsToDb(cms: ContactCms) {
  return {
    title: cms.title,
    subtitle: cms.subtitle ?? null,
    description: cms.description ?? null,
    form_enabled: cms.formEnabled ?? true,
    telegram_direct_note: cms.telegramDirectNote ?? null,
    support_note: cms.supportNote ?? null,
    direct_help_text: cms.directHelpText ?? null,
  };
}
