import { supabase } from '../lib/supabase/client';
import type { Product } from '../types/product';

export class InventoryService {
  static async getProductStock(productId: string): Promise<{ stock_count: number; inStock: boolean; stock_status: string } | null> {
    const { data, error } = await supabase
      .from('products')
      .select('stock_count, stock_status')
      .eq('id', productId)
      .single();

    if (error) throw error;
    if (!data) return null;
    return {
      stock_count: data.stock_count,
      inStock: data.stock_status === 'mavjud' && data.stock_count > 0,
      stock_status: data.stock_status,
    };
  }

  static async updateProductStock(productId: string, inStock: boolean, count: number): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        stock_count: count,
        stock_status: inStock ? 'mavjud' : 'tugagan',
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  }

  static async updateSizeAvailability(productId: string, size: string, isAvailable: boolean): Promise<void> {
    const { error } = await supabase
      .from('product_sizes')
      .update({ is_available: isAvailable })
      .eq('product_id', productId)
      .eq('size', size);

    if (error) throw error;
  }

  static async updateColorAvailability(productId: string, colorName: string, isAvailable: boolean): Promise<void> {
    const { error } = await supabase
      .from('product_colors')
      .update({ is_available: isAvailable })
      .eq('product_id', productId)
      .eq('name', colorName);

    if (error) throw error;
  }

  static async listLowStockProducts(threshold: number = 5): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock_count', threshold)
      .gt('stock_count', 0);

    if (error) throw error;
    return data as Product[];
  }

  static async getOutOfStockProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('stock_status', 'tugagan');

    if (error) throw error;
    return data as Product[];
  }
}