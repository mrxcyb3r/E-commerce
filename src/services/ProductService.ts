import { supabase } from '../lib/supabase/client';
import type { Product, ProductImage, ProductSize, ProductColor, Category } from '../types/product';
import type { Database } from '../types/supabase-db';

export interface ProductImageRecord {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductSizeRecord {
  id: string;
  product_id: string;
  size: string;
  is_available: boolean;
  sort_order: number;
}

export interface ProductColorRecord {
  id: string;
  product_id: string;
  name: string;
  hex_code: string | null;
  is_available: boolean;
  sort_order: number;
}

export interface ProductWithRelations extends Product {
  product_images: ProductImageRecord[];
  product_sizes: ProductSizeRecord[];
  product_colors: ProductColorRecord[];
}

export class ProductService {
  static async list(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
    onlyInStock?: boolean;
    sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'featured';
  }): Promise<{
    products: ProductWithRelations[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      query = query.or(`name.ilike.%${searchLower}%,description.ilike.%${searchLower}%,tags.over.%[${searchLower}]%`);
    }

    if (params?.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }

    if (params?.onlyInStock) {
      query = query.eq('stock_status', 'mavjud').gt('stock_count', 0);
    }

    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'featured':
          query = query.eq('is_featured', true).order('sort_order', { ascending: true });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
      }
    }

    const { data, error, count } = await query.limit(params?.pageSize ?? 20).offset((params?.page ?? 1 - 1) * (params?.pageSize ?? 20));

    if (error) throw error;

    const products = data as ProductWithRelations[] || [];

    // Fetch related images, sizes, colors for each product
    const productsWithRelations = await Promise.all(products.map(async (product) => {
      const [images, sizes, colors] = await Promise.all([
        supabase.from('product_images').select('*').eq('product_id', product.id).order('sort_order', { ascending: true }),
        supabase.from('product_sizes').select('*').eq('product_id', product.id).order('sort_order', { ascending: true }),
        supabase.from('product_colors').select('*').eq('product_id', product.id).order('sort_order', { ascending: true }),
      ]);

      return {
        ...product,
        product_images: images.data as ProductImageRecord[],
        product_sizes: sizes.data as ProductSizeRecord[],
        product_colors: colors.data as ProductColorRecord[],
      };
    }));

    return {
      products: productsWithRelations,
      total: count ?? 0,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };
  }

  static async getById(id: string): Promise<ProductWithRelations | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const [images, sizes, colors] = await Promise.all([
      supabase.from('product_images').select('*').eq('product_id', id).order('sort_order', { ascending: true }),
      supabase.from('product_sizes').select('*').eq('product_id', id).order('sort_order', { ascending: true }),
      supabase.from('product_colors').select('*').eq('product_id', id).order('sort_order', { ascending: true }),
    ]);

    return {
      ...data,
      product_images: images.data as ProductImageRecord[],
      product_sizes: sizes.data as ProductSizeRecord[],
      product_colors: colors.data as ProductColorRecord[],
    } as ProductWithRelations;
  }

  static async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'product_images' | 'product_sizes' | 'product_colors'> & {
    images?: File[];
    sizes?: { name: string; value: string }[];
    colors?: { name: string; hex: string }[];
  }): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        slug: product.slug,
        name: product.name,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        original_price: product.original_price,
        currency: product.currency,
        category_id: product.category_id,
        brand: product.brand,
        is_published: product.is_published ?? true,
        is_featured: product.is_featured ?? false,
        is_new: product.is_new ?? false,
        is_on_sale: product.is_on_sale ?? false,
        stock_status: product.stock_status ?? 'mavjud',
        stock_count: product.stock_count ?? 0,
        sku: product.sku,
        rating: product.rating ?? 0,
        review_count: product.reviewCount ?? 0,
        tags: product.tags ?? [],
        material: product.material,
        made_in: product.madeIn,
        sort_order: product.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Handle image uploads if provided
    if (product.images && product.images.length > 0) {
      await this.uploadImages(data.id, product.images);
    }

    // Handle size variations
    if (product.sizes) {
      await this.upsertSizes(data.id, product.sizes);
    }

    // Handle color variations
    if (product.colors) {
      await this.upsertColors(data.id, product.colors);
    }

    return data as Product;
  }

  static async update(id: string, updates: Partial<Product>, fileUpdates?: { remove?: string[]; files?: File[] }): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        short_description: updates.short_description,
        price: updates.price,
        original_price: updates.original_price,
        currency: updates.coney,
        category_id: updates.category_id,
        brand: updates.brand,
        is_published: updates.is_published,
        is_featured: updates.is_featured,
        is_new: updates.is_new,
        is_on_sale: updates.is_on_sale,
        stock_status: updates.stock_status,
        stock_count: updates.stock_count,
        sku: updates.sku,
        rating: updates.rating,
        review_count: updates.review_count,
        tags: updates.tags,
        material: updates.material,
        made_in: updates.madeIn,
        sort_order: updates.sort_order,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Handle image updates
    if (fileUpdates) {
      if (fileUpdates.remove && fileUpdates.remove.length > 0) {
        await this.removeImages(id, fileUpdates.remove);
      }
      if (fileUpdates.files && fileUpdates.files.length > 0) {
        await this.uploadImages(id, fileUpdates.files);
      }
    }

    return data as Product;
  }

  static async delete(id: string): Promise<void> {
    // First delete related images, sizes, colors
    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('product_sizes').delete().eq('product_id', id);
    await supabase.from('product_colors').delete().eq('product_id', id);

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  static async uploadImages(productId: string, files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    // Save image records to database
    const imageRecords = uploadedUrls.map(url => ({
      product_id: me,
      url,
      alt_text: me.name,
      is_primary: false,
      sort_order: 0,
    }));

    await supabase.from('product_images').insert(imageRecords);

    return uploadedUrls;
  }

  static async removeImages(productId: string, imageIds: string[]): Promise<void> {
    // Remove from storage
    const { data: images } = await supabase.from('product_images').select('*').eq('product_id', productId);

    if (images) {
      for (const img of images) {
        if (imageIds.includes(img.id)) {
          await supabase.storage
            .from('product-images')
            .remove([img.url.split('/').pop() ?? '']);
          await supabase.from('product_images').delete().eq('id', img.id);
        }
      }
    }
  }

  static async upsertSizes(productId: string, sizes: { name: string; value: string }[]): Promise<void> {
    for (const size of sizes) {
      await supabase.from('product_sizes').upsert({
        product_id: productId,
        size: size.name,
        is_available: true,
        sort_order: 0,
      });
    }
  }

  static async upsertColors(productId: string, colors: { name: string; hex: string }[]): Promise<void> {
    for (const color of colors) {
      await supabase.from('product_colors').upsert({
        product_id: productId,
        name: color.name,
        hex_code: color.hex,
        is_available: true,
        sort_order: 0,
      });
    }
  }

  static async search(params: { q: string; categoryId?: string; onlyInStock?: boolean }): Promise<ProductWithRelations[]> {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .ilike('name', `%${params.q}%`)
      .or(`description.ilike.%${params.q}%,tags.over.%[${params.q}]%`);

    if (params.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }

    if (params.onlyInStock) {
      query = query.eq('stock_status', 'mavjud').gt('stock_count', 0);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;

    // Fetch relations for each product
    const products = data as ProductWithRelations[] || [];
    const productsWithRelations = await Promise.all(products.map(async (product) => {
      const [images, sizes, colors] = await Promise.all([
        supabase.from('product_images').select('*').eq('product_id', product.id).order('sort_order', { ascending: true }),
        supabase.from('product_sizes').select('*').eq('product_id', product.id).order('sort_order', { ascending: true }),
        supabase.from('product_colors').select('*').eq('product_id', product.id).order('sort_order', { ascending: true }),
      ]);

      return {
        ...product,
        product_images: images.data as ProductImageRecord[],
        product_sizes: sizes.data as ProductSizeRecord[],
        product_colors: colors.data as ProductColorRecord[],
      };
    }));

    return productsWithRelations;
  }
}