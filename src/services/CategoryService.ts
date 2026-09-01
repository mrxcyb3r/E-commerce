import { supabase } from '../lib/supabase/client';
import type { Category } from '../types/product';

export class CategoryService {
  static async list(publishedOnly: boolean = true): Promise<Category[]> {
    let query = supabase.from('categories').select('*');

    if (publishedOnly) {
      query = query.eq('is_visible', true);
    }

    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data as Category[];
  }

  static async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    return data as Category;
  }

  static async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        is_visible: category.is_visible ?? true,
        featured: category.featured ?? false,
        sort_order: category.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  }

  static async update(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: updates.name,
        slug: updates.slug,
        description: updates.description,
        image: updates.image,
        is_visible: updates.is_visible,
        featured: updates.featured,
        sort_order: updates.sort_order,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  static async search(query: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', `%${query}%`)
      .ilike('description', `%${query}%`);

    if (error) throw error;
    return data as Category[];
  }
}