export type VideoBadgeType = 'new' | 'sale' | 'featured' | 'outfit' | 'store' | 'lookbook' | 'style';

export type FeedItemType = 'video' | 'collection';

export interface VideoItem {
  id: string;
  type?: FeedItemType; // 'video' (default) or 'collection' (multi-image 3s slider)
  title: string;
  description: string;
  author?: string;
  viewsCount?: number;
  likesCount?: number;
  videoUrl?: string;
  posterUrl: string;
  images?: string[]; // Array of high-res images for image collection / lookbook slider
  productId?: string; // Optional: Links to Product.id or undefined for general styling/store content
  category: string; // 'erkaklar' | 'ayollar' | 'oyoq-kiyimlar' | 'aksessuarlar' | 'all'
  badge?: {
    text: string;
    type: VideoBadgeType;
  };
  duration?: string;
  order: number;
  published: boolean;
  createdAt: string;
}

export type FeedCategoryFilter = 'all' | 'erkaklar' | 'ayollar' | 'oyoq-kiyimlar' | 'aksessuarlar' | 'new';

