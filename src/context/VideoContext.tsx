import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { VideoItem, VideoBadgeType } from '../types/video';
import { supabase } from '../lib/supabase/client';
import { useStore } from './StoreContext';
import { Product } from '../types/product';

interface VideoContextType {
  videos: VideoItem[];
  publishedVideos: VideoItem[];
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  addVideo: (video: Omit<VideoItem, 'id' | 'createdAt'>) => Promise<boolean>;
  updateVideo: (id: string, updates: Partial<VideoItem>) => Promise<boolean>;
  deleteVideo: (id: string) => Promise<boolean>;
  togglePublish: (id: string) => Promise<boolean>;
  reorderVideos: (startIndex: number, endIndex: number) => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
  getProductForVideo: (productId?: string) => Product | undefined;
  loading: boolean;
  error: string | null;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Map Supabase feed_posts row to VideoItem
function rowToVideoItem(row: Record<string, unknown>): VideoItem {
  const badgeText = row.badge_text as string | null;
  const badgeType = row.badge_type as VideoBadgeType | null;
  return {
    id: row.id as string,
    type: (row.type as 'video' | 'collection') || 'video',
    title: row.title as string,
    description: (row.description as string) || '',
    videoUrl: (row.video_url as string) || undefined,
    posterUrl: (row.thumbnail_url as string) || '',
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    productId: (row.product_id as string) || undefined,
    category: (row.category as string) || 'all',
    badge: badgeText ? { text: badgeText, type: badgeType || 'new' } : undefined,
    duration: (row.duration as string) || undefined,
    order: (row.sort_order as number) || 0,
    published: row.is_published !== false,
    createdAt: (row.created_at as string) || '',
    author: (row.author as string) || undefined,
  };
}

// Map VideoItem fields to Supabase feed_posts row
function videoItemToRow(video: Omit<VideoItem, 'id' | 'createdAt'>): Record<string, unknown> {
  return {
    title: video.title,
    description: video.description || null,
    video_url: video.videoUrl || null,
    thumbnail_url: video.posterUrl || null,
    product_id: video.productId || null,
    type: video.type || 'video',
    badge_text: video.badge?.text || null,
    badge_type: video.badge?.type || null,
    duration: video.duration || null,
    sort_order: video.order || 0,
    is_published: video.published !== false,
    is_featured: false,
    category: video.category || 'all',
    author: video.author || null,
    images: video.images || [],
  };
}

export const VideoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { products } = useStore();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('feed_posts')
        .select('*')
        .order('sort_order', { ascending: true });

      if (err) throw err;
      setVideos((data ?? []).map(rowToVideoItem));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Videolarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const addVideo = useCallback(async (newVideoData: Omit<VideoItem, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const row = videoItemToRow(newVideoData);
      // Compute sort_order as max + 1
      row.sort_order = Math.max(0, ...videos.map((v) => v.order || 0)) + 1;

      const { data, error: err } = await supabase
        .from('feed_posts')
        .insert(row)
        .select()
        .single();

      if (err) throw err;
      if (data) {
        setVideos((prev) => [...prev, rowToVideoItem(data)]);
      }
      return true;
    } catch (e) {
      console.error('[feed_posts insert error]', e);
      return false;
    }
  }, [videos]);

  const updateVideo = useCallback(async (id: string, updates: Partial<VideoItem>): Promise<boolean> => {
    try {
      const row: Record<string, unknown> = {};
      if (updates.title !== undefined) row.title = updates.title;
      if (updates.description !== undefined) row.description = updates.description;
      if (updates.videoUrl !== undefined) row.video_url = updates.videoUrl;
      if (updates.posterUrl !== undefined) row.thumbnail_url = updates.posterUrl;
      if (updates.productId !== undefined) row.product_id = updates.productId || null;
      if (updates.type !== undefined) row.type = updates.type;
      if (updates.badge !== undefined) {
        row.badge_text = updates.badge?.text || null;
        row.badge_type = updates.badge?.type || null;
      }
      if (updates.duration !== undefined) row.duration = updates.duration;
      if (updates.published !== undefined) row.is_published = updates.published;
      if (updates.category !== undefined) row.category = updates.category;
      if (updates.author !== undefined) row.author = updates.author;
      if (updates.images !== undefined) row.images = updates.images;
      row.updated_at = new Date().toISOString();

      const { error: err } = await supabase
        .from('feed_posts')
        .update(row)
        .eq('id', id);

      if (err) throw err;
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
      );
      return true;
    } catch (e) {
      console.error('[feed_posts update error]', e);
      return false;
    }
  }, []);

  const deleteVideo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: err } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setVideos((prev) => prev.filter((v) => v.id !== id));
      return true;
    } catch (e) {
      console.error('[feed_posts delete error]', e);
      return false;
    }
  }, []);

  const togglePublish = useCallback(async (id: string): Promise<boolean> => {
    try {
      const video = videos.find((v) => v.id === id);
      if (!video) return false;
      const newPublished = !video.published;

      const { error: err } = await supabase
        .from('feed_posts')
        .update({ is_published: newPublished, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (err) throw err;
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, published: newPublished } : v))
      );
      return true;
    } catch (e) {
      console.error('[feed_posts togglePublish error]', e);
      return false;
    }
  }, [videos]);

  const reorderVideos = useCallback(async (startIndex: number, endIndex: number): Promise<boolean> => {
    try {
      const result = [...videos];
      const removed = result.splice(startIndex, 1)[0];
      if (!removed) return false;
      result.splice(endIndex, 0, removed);

      const updates = result.map((item, idx) => ({
        id: item.id,
        sort_order: idx + 1,
      }));

      // Batch update: update each item's sort_order
      for (const u of updates) {
        const { error: err } = await supabase
          .from('feed_posts')
          .update({ sort_order: u.sort_order, updated_at: new Date().toISOString() })
          .eq('id', u.id);
        if (err) throw err;
      }

      setVideos(result.map((item, idx) => ({ ...item, order: idx + 1 })));
      return true;
    } catch (e) {
      console.error('[feed_posts reorder error]', e);
      // Refetch to restore correct order
      fetchVideos();
      return false;
    }
  }, [videos, fetchVideos]);

  const resetToDefault = useCallback(async (): Promise<boolean> => {
    try {
      // Delete all existing feed_posts
      const { error: delErr } = await supabase
        .from('feed_posts')
        .delete()
        .neq('id', '__never_match__');
      if (delErr) throw delErr;

      // Seed the default data
      const seedData: Omit<VideoItem, 'id' | 'createdAt'>[] = [
        {
          type: 'video',
          title: 'Premium Sport Krossovka — Qulaylik va Dinamika',
          description: 'Yengil amortizatsiyali taglik va kundalik yurish uchun ideal qulaylik. Ranglari va o\'lchamlari do\'konda mavjud.',
          videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
          productId: 'prod-2',
          category: 'oyoq-kiyimlar',
          badge: { text: 'YANGI', type: 'new' },
          duration: '0:14',
          order: 1,
          published: true,
        },
        {
          type: 'collection',
          title: 'Mavsumiy Lookbook — Shahar Ko\'rinishi & Kombinatsiyalar',
          description: 'Har 3 soniyada o\'zgaruvchi zamonaviy uslublar to\'plami.',
          posterUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
          images: [
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
          ],
          category: 'ayollar',
          badge: { text: 'LOOKBOOK', type: 'lookbook' },
          order: 2,
          published: true,
        },
        {
          type: 'video',
          title: 'Classic Oversize T-Shirt — 100% Premium Paxta',
          description: 'Erkin bichim, shaklini yo\'qotmaydigan zich mato.',
          videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
          productId: 'prod-1',
          category: 'erkaklar',
          badge: { text: 'HIT SAVDO', type: 'featured' },
          duration: '0:18',
          order: 3,
          published: true,
        },
        {
          type: 'collection',
          title: 'Klassik va Zamonaviy Aksessuarlar Tanlovi',
          description: 'Kundalik va bayramona kiyimlar uchun zarur bo\'lgan charm hamyonlar, soatlar va ko\'zoynaklar.',
          posterUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
          images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80',
          ],
          category: 'aksessuarlar',
          badge: { text: 'TO\'PLAM', type: 'featured' },
          order: 4,
          published: true,
        },
        {
          type: 'video',
          title: 'Urban Streetwear Bomber Kurtka — Shamolga Chidamli',
          description: 'Zamonaviy ko\'cha uslubi, suv qaytaruvchi mustahkam mato.',
          videoUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80',
          productId: 'prod-3',
          category: 'erkaklar',
          badge: { text: 'CHEGIRMA', type: 'sale' },
          duration: '0:16',
          order: 5,
          published: true,
        },
        {
          type: 'video',
          title: 'Klassik Minimalist Qo\'l Soati — Safir Shisha',
          description: 'Zanglamas po\'lat korpus, yapon kvarts mexanizmi.',
          videoUrl: 'https://samplelib.com/preview/mp4/sample-5s.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
          productId: 'prod-5',
          category: 'aksessuarlar',
          badge: { text: 'PREMIUM', type: 'featured' },
          duration: '0:12',
          order: 6,
          published: true,
        },
        {
          type: 'video',
          title: 'Do\'konimiz va Yangi Mavsum Mahsulotlari',
          description: 'Bizning do\'konga tashrif buyurib, eng so\'nggi to\'plamlarni kiyib ko\'rishingiz mumkin.',
          videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          posterUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
          category: 'all',
          badge: { text: 'DO\'KON', type: 'store' },
          duration: '0:22',
          order: 7,
          published: true,
        },
      ];

      for (const item of seedData) {
        const row = videoItemToRow(item);
        row.id = item.productId || `seed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const { error: insErr } = await supabase.from('feed_posts').insert(row);
        if (insErr) throw insErr;
      }

      await fetchVideos();
      return true;
    } catch (e) {
      console.error('[feed_posts reset error]', e);
      fetchVideos();
      return false;
    }
  }, [fetchVideos]);

  const getProductForVideo = (productId?: string): Product | undefined => {
    if (!productId) return undefined;
    return products.find((p) => p.id === productId);
  };

  const publishedVideos = videos.filter((v) => v.published);

  return (
    <VideoContext.Provider
      value={{
        videos,
        publishedVideos,
        isMuted,
        setIsMuted,
        toggleMute,
        addVideo,
        updateVideo,
        deleteVideo,
        togglePublish,
        reorderVideos,
        resetToDefault,
        getProductForVideo,
        loading,
        error,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoFeed = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoFeed must be used within a VideoProvider');
  }
  return context;
};
