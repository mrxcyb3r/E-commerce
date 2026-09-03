/// <reference types="vite/client" />

// Supabase Database Types
// Mapped to the schema in supabase/migrations/20260901081142_initial_schema.sql

type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
};

type ProductSize = {
  id: string;
  product_id: string;
  size: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
};

type ProductColor = {
  id: string;
  product_id: string;
  name: string;
  hex_code: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  category_id: string | null;
  brand: string | null;
  is_published: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  stock_status: string;
  stock_count: number;
  sku: string | null;
  rating: number;
  review_count: number;
  tags: string[];
  material: string | null;
  made_in: string | null;
  created_at: string;
  updated_at: string;
  product_images: ProductImage[];
  product_sizes: ProductSize[];
  product_colors: ProductColor[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_visible: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FeedPost = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  product_id: string | null;
  type: 'video' | 'collection';
  badge_text: string | null;
  badge_type: string | null;
  duration: string | null;
  sort_order: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
};

type Prompt = {
  id: string;
  title: string;
  description: string | null;
  content_type: 'image' | 'video' | 'text';
  category: string;
  subcategory: string | null;
  product_type: string | null;
  prompt: string;
  recommended_tool: string | null;
  recommended_tool_url: string | null;
  difficulty: string | null;
  tags: string[];
  aspect_ratio: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type Testimonial = {
  id: string;
  name: string;
  location: string | null;
  avatar_url: string | null;
  rating: number;
  comment: string;
  date: string | null;
  verified_visit: boolean;
  purchased_product: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'product_dwell'
  | 'product_share'
  | 'product_save'
  | 'product_unsave'
  | 'category_view'
  | 'search'
  | 'feed_view'
  | 'feed_like'
  | 'feed_share'
  | 'feed_product_click'
  | 'feed_watch'
  | 'telegram_click'
  | 'phone_click'
  | 'directions_click'
  | 'ai_question'
  | 'price_offer'
  | 'contact_click'
  | 'feedback_submit';

export type AnalyticsEvent = {
  id: number;
  shop_id: string;
  visitor_id: string;
  session_id: string;
  event_type: AnalyticsEventType;
  product_id: string | null;
  feed_id: string | null;
  category_id: string | null;
  search_query: string | null;
  page_path: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type HomepageCms = {
  id: string;
  hero_badge: string | null;
  hero_title: string | null;
  hero_highlighted_title: string | null;
  hero_subtitle: string | null;
  hero_primary_cta_text: string | null;
  hero_primary_cta_link: string | null;
  hero_secondary_cta_text: string | null;
  hero_secondary_cta_link: string | null;
  hero_image_url: string | null;
  promo_banner_badge: string | null;
  promo_banner_title: string | null;
  promo_banner_subtitle: string | null;
  promo_banner_description: string | null;
  promo_banner_button_text: string | null;
  promo_banner_button_link: string | null;
  promo_banner_image_url: string | null;
  promo_banner_enabled: boolean;
  why_choose_us_title: string | null;
  why_choose_us_subtitle: string | null;
  features: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
  featured_section_title: string | null;
  featured_section_subtitle: string | null;
  video_section_title: string | null;
  video_section_subtitle: string | null;
  updated_at: string;
};

type AboutCms = {
  id: string;
  title: string;
  subtitle: string;
  main_story: string | null;
  second_story: string | null;
  mission: string | null;
  vision: string | null;
  images: string[];
  features: {
    id: string;
    title: string;
    description: string;
  }[];
  updated_at: string;
};

type ContactCms = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  form_enabled: boolean;
  telegram_direct_note: string | null;
  support_note: string | null;
  direct_help_text: string | null;
  updated_at: string;
};

type StoreSettings = {
  id: string;
  business_name: string;
  name: string | null;
  business_description: string | null;
  tagline: string | null;
  phone: string;
  phone_raw: string;
  phone_numbers: string[];
  email: string | null;
  telegram: string;
  telegram_username: string | null;
  telegram_channel: string | null;
  instagram_username: string | null;
  address: string;
  city: string;
  landmark: string | null;
  working_hours: string;
  working_hours_detail: {
    weekdays: string;
    weekend: string;
    note: string;
  };
  social_links: {
    telegram: string;
    instagram: string;
    facebook: string;
  };
  primary_color: string;
  currency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  google_maps_url: string | null;
  yandex_maps_url: string | null;
  updated_at: string;
};

// Root state types
type Profile = {
  id: string;
  username: string;
  role: 'admin' | 'user';
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

// Group all tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>;
      };
      product_sizes: {
        Row: ProductSize;
        Insert: Omit<ProductSize, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductSize, 'id' | 'created_at'>>;
      };
      product_colors: {
        Row: ProductColor;
        Insert: Omit<ProductColor, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductColor, 'id' | 'created_at'>>;
      };
      feed_posts: {
        Row: FeedPost;
        Insert: Omit<FeedPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FeedPost, 'id' | 'created_at' | 'updated_at'>>;
      };
      prompts: {
        Row: Prompt;
        Insert: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at'>>;
      };
      testimonials: {
        Row: Testimonial;
        Insert: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>>;
      };
      faqs: {
        Row: FaqItem;
        Insert: Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      homepage_cms: {
        Row: HomepageCms;
        Insert: Omit<HomepageCms, 'id' | 'updated_at'>;
        Update: Partial<Omit<HomepageCms, 'id' | 'updated_at'>>;
      };
      about_cms: {
        Row: AboutCms;
        Insert: Omit<AboutCms, 'id' | 'updated_at'>;
        Update: Partial<Omit<AboutCms, 'id' | 'updated_at'>>;
      };
      contact_cms: {
        Row: ContactCms;
        Insert: Omit<ContactCms, 'id' | 'updated_at'>;
        Update: Partial<Omit<ContactCms, 'id' | 'updated_at'>>;
      };
      store_settings: {
        Row: StoreSettings;
        Insert: Omit<StoreSettings, 'id' | 'updated_at'>;
        Update: Partial<Omit<StoreSettings, 'id' | 'updated_at'>>;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>;
      };
    };
    Views: {};
    Functions: {
      // Auth functions
      signin: {
        Args: { email: string; password: string };
        Returns: { user: any; session: any };
      };
      signup: {
        Args: { email: string; password: string; options?: any };
        Returns: { user: any; session: any };
      };
      sendOtp: {
        Args: { email: string; type: 'signup' | 'recovery' };
        Returns: { error: any };
      };
      verifyOtp: {
        Args: { token: string; type: 'signup' | 'recovery' };
        Returns: { error: any };
      };
      resendOtp: {
        Args: { type: 'signup' | 'recovery' };
        Returns: { error: any };
      };
    };
  };
  auth: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};