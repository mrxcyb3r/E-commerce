import { supabase } from '../lib/supabase/client';
import type { FeedPost } from '../types/product';

export interface FeedPostWithProduct extends FeedPost {
  product?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

export class FeedService {
  static async list(params?: {
    publishedOnly?: boolean;
    featuredOnly?: boolean;
    type?: 'video' | 'collection';
    category?: string;
    productId?: string;
    search?: string;
  }): Promise<FeedPostWithProduct[]> {
    let query = supabase.from('feed_posts').select('*, products(*)');

    if (params?.publishedOnly !== false) {
      query = query.eq('is_published', true);
    }

    if (params?.type) {
      query = query.eq('type', params.type);
    }

    if (params?.category) {
      query = query.eq('category', params.category);
    }

    if (params?.productId) {
      query = query.eq('product_id', params.productId);
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      query = query.or(`title.ilike.%${searchLower}%,description.ilike.%${searchLower}%`);
    }

    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data as FeedPostWithProduct[];
  }

  static async getById(id: string): Promise<FeedPostWithProduct | null> {
    const { data, error } = await supabase
      .from('feed_posts')
      .select('*, products(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    return data as FeedPostWithProduct;
  }

  static async create(feed: Omit<FeedPost, 'id' | 'created_at' | 'updated_at'>): Promise<FeedPost> {
    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        title: feed.title,
        description: feed.description,
        video_url: feed.video_url,
        thumbnail_url: feed.thumbnail_url,
        product_id: feed.product_id,
        type: feed.type,
        badge_text: feed.badge_text,
        badge_type: feed.badge_type,
        duration: feed.duration,
        sort_order: feed.sort_order,
        is_published: feed.is_published ?? true,
        is_featured: feed.is_featured ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as FeedPost;
  }

  static async update(id: string, updates: Partial<FeedPost>): Promise<FeedPost> {
    const { data, error } = await supabase
      .from('feed_posts')
      .update({
        title: updates.title,
        description: updates.description,
        video_url: updates.video_url,
        thumbnail_url: updates.thumbnail_url,
        product_id: updates.product_id,
        type: updates.type,
        badge_text: updates.badge_text,
        badge_type: updates.badge_type,
        duration: updates.duration,
        sort_order: updates.sort_order,
        is_published: updates.is_published,
        is_featured: updates.is_featured,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FeedPost;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('feed_posts').delete().eq('id', id);
    if (error) throw error;
  }
}