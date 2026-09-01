import { supabase } from '../lib/supabase/client';
import type { Prompt } from '../types/prompt';

export class PromptService {
  static async list(params?: {
    publishedOnly?: boolean;
    featuredOnly?: boolean;
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Prompt[]> {
    let query = supabase.from('prompts').select('*');

    if (params?.publishedOnly !== false) {
      query = query.eq('is_published', true);
    }

    if (params?.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    if (params?.category) {
      query = query.eq('category', params.category);
    }

    if (params?.difficulty) {
      query = query.eq('difficulty', params.difficulty);
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      query = query.or(`title.ilike.%${searchLower}%,content_type.ilike.%${searchLower}%,recommended_tool.ilike.%${searchLower}%`);
    }

    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return data as Prompt[];
  }

  static async getById(id: string): Promise<Prompt | null> {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    return data as Prompt;
  }

  static async create(prompt: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>): Promise<Prompt> {
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        title: prompt.title,
        description: prompt.description,
        content_type: prompt.content_type,
        category: prompt.category,
        subcategory: prompt.subcategory,
        product_type: prompt.product_type,
        prompt: prompt.prompt,
        recommended_tool: prompt.recommended_tool,
        recommended_tool_url: prompt.recommended_tool_url,
        difficulty: prompt.difficulty,
        tags: prompt.tags ?? [],
        aspect_ratio: prompt.aspect_ratio,
        is_featured: prompt.is_featured ?? false,
        is_published: prompt.is_published ?? true,
        sort_order: prompt.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Prompt;
  }

  static async update(id: string, updates: Partial<Prompt>): Promise<Prompt> {
    const { data, error } = await supabase
      .from('prompts')
      .update({
        title: updates.title,
        description: updates.description,
        content_type: updates.content_type,
        category: updates.category,
        subcategory: updates.subcategory,
        product_type: updates.product_type,
        prompt: updates.prompt,
        recommended_tool: updates.recommended_tool,
        recommended_tool_url: updates.recommended_tool_url,
        difficulty: updates.difficulty,
        tags: updates.tags,
        aspect_ratio: updates.aspect_ratio,
        is_featured: updates.is_featured,
        is_published: updates.is_published,
        sort_order: updates.sort_order,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Prompt;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) throw error;
  }
}