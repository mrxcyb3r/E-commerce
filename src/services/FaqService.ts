import { supabase } from '../lib/supabase/client';
import type { FaqItem } from '../types/faq';

export class FaqService {
  static async list(publishedOnly: boolean = true): Promise<FaqItem[]> {
    let query = supabase.from('faqs').select('*');

    if (publishedOnly) {
      query = query.eq('is_published', true);
    }

    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data as FaqItem[];
  }

  static async getById(id: string): Promise<FaqItem | null> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    return data as FaqItem;
  }

  static async create(faq: Omit<FaqItem, 'id' | 'created_at' | 'updated_at'>): Promise<FaqItem> {
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        is_published: faq.is_published ?? true,
        sort_order: faq.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as FaqItem;
  }

  static async update(id: string, updates: Partial<FaqItem>): Promise<FaqItem> {
    const { data, error } = await supabase
      .from('faqs')
      .update({
        question: updates.question,
        answer: updates.answer,
        category: updates.category,
        is_published: updates.is_published,
        sort_order: updates.sort_order,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FaqItem;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) throw error;
  }
}