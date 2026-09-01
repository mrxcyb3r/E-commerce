import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VideoItem } from '../types/video';
import { INITIAL_VIDEOS } from '../data/videos';
import { useStore } from './StoreContext';
import { Product } from '../types/product';

interface VideoContextType {
  videos: VideoItem[];
  publishedVideos: VideoItem[];
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  addVideo: (video: Omit<VideoItem, 'id' | 'createdAt'>) => void;
  updateVideo: (id: string, updates: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;
  togglePublish: (id: string) => void;
  reorderVideos: (startIndex: number, endIndex: number) => void;
  resetToDefault: () => void;
  getProductForVideo: (productId?: string) => Product | undefined;
}

const STORAGE_KEY = 'store_video_feed_items';

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { products } = useStore();
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_VIDEOS;
  });

  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch {
      // ignore
    }
  }, [videos]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const addVideo = (newVideoData: Omit<VideoItem, 'id' | 'createdAt'>) => {
    const newVideo: VideoItem = {
      ...newVideoData,
      id: `vid-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      order: videos.length + 1,
    };
    setVideos((prev) => [newVideo, ...prev]);
  };

  const updateVideo = (id: string, updates: Partial<VideoItem>) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const togglePublish = (id: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, published: !v.published } : v))
    );
  };

  const reorderVideos = (startIndex: number, endIndex: number) => {
    setVideos((prev) => {
      const result = [...prev];
      const removed = result.splice(startIndex, 1)[0];
      if (removed) {
        result.splice(endIndex, 0, removed);
      }
      return result.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const resetToDefault = () => {
    setVideos(INITIAL_VIDEOS);
  };

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
