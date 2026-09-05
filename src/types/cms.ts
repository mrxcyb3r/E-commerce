export interface HeroContent {
  badge: string;
  title: string;
  highlightedTitle: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  heroImage: string;
}

export interface TrustStatItem {
  id: string;
  value: string;
  label: string;
  sublabel: string;
  dynamic?: boolean; // if true, calculates from real product count
}

export interface PromoBannerContent {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  enabled: boolean;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface HomepageSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  mobileImageUrl: string;
  active: boolean;
  order: number;
}

export interface HomepageCms {
  hero: HeroContent;
  stats: TrustStatItem[];
  promoBanner: PromoBannerContent;
  whyChooseUsTitle: string;
  whyChooseUsSubtitle: string;
  features: FeatureItem[];
  featuredSectionTitle: string;
  featuredSectionSubtitle: string;
  videoSectionTitle: string;
  videoSectionSubtitle: string;

  // Optional aliases for legacy/flat access
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  heroImage?: string;
  promoBannerTitle?: string;
  promoBannerSubtitle?: string;
  promoBannerLink?: string;
  promoBannerButtonText?: string;
  faqSectionTitle?: string;
  faqSectionSubtitle?: string;
  testimonialsSectionTitle?: string;
  testimonialsSectionSubtitle?: string;
}

export interface AboutCms {
  title: string;
  subtitle: string;
  mainStory: string;
  secondStory: string;
  mission: string;
  vision: string;
  images: string[];
  features: {
    title: string;
    description: string;
  }[];

  // Optional aliases
  story?: string;
  storyTitle?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  missionTitle?: string;
  missionText?: string;
  visionTitle?: string;
  visionText?: string;
  galleryImages?: string[];
}

export interface ContactCms {
  title: string;
  subtitle: string;
  description: string;
  formEnabled: boolean;
  telegramDirectNote: string;

  // Optional aliases
  supportNote?: string;
  directHelpText?: string;
}

export interface AdminActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'setting';
  entity: 'product' | 'category' | 'video' | 'prompt' | 'testimonial' | 'faq' | 'store';
  description: string;
  timestamp: string;
}
