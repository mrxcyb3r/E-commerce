import { supabase } from '../lib/supabase/client';
import type { Review } from '../types/review';

export class TestimonialService {
  static async list(publishedOnly: boolean = true): Promise<Review[]> {
    let query = supabase.from('testimonials').select('*');

    if (publishedOnly) {
      query = query.eq('is_published', true);
    }

    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data as Review[];
  }

  static async getById(id: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    return data as Review;
  }

  static async create(testimonial: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        name: testimonial.name,
        location: testimonial.location,
        avatar_url: testimonial.avatar_url,
        rating: testimonial.rating,
        comment: testimonial.comment,
        date: testimonial.date,
        verified_visit: testimonial.verified_visit ?? false,
        purchased_product: testimonial.purchased_product,
        is_published: testimonial.is_published ?? true,
        sort_order: testimonial.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  }

  static async update(id: string, updates: Partial<Review>): Promise<Review> {
    const { data, error } = await supabase
      .from('testimonials')
      .update({
        name: updates.name,
        location: updates.location,
        avatar_url: updates.avatar_url,
        rating: updates.rating,
        comment: updates.comment,
        date: updates.date,
        verified_visit: updates.verified_visit,
        purchased_product: updates.purchased_product,
        is_published: updates.is_published,
        sort_order: updates.sort_order,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
  }
}