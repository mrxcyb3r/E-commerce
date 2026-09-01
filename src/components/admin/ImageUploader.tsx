import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Plus, X, Upload, Check, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface ImageUploadState {
  url: string;
  progress: UploadProgress;
  isPrimary: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 8,
  label = 'Rasmlar',
  helperText = 'Birinchi rasm asosiy rasm sifatida ko\'rsatiladi. URL kiriting yoki kompyuterdan rasm yuklang.',
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<{ [key: number]: string }>({});
  const [uploadProgress, setUploadProgress] = useState<Map<number, UploadProgress>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [primaryIndex, setPrimaryIndex] = useState(0);

  // Initialize progress states for existing images
  useEffect(() => {
    const progressMap = new Map<number, UploadProgress>();
    images.forEach((_, index) => {
      progressMap.set(index, { progress: 0, status: 'success' });
    });
    setUploadProgress(progressMap);
  }, [images]);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput); // validate
      // For URL-based images, just add them directly
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
    } catch {
      setUploadErrors(prev => ({ ...prev, 0: "Iltimos, to'g'ri rasm URL manzilini kiriting." }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files as FileList;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, fileIndex) => {
      const progressId = images.length + fileIndex;
      
      // Validation
      if (!file.type.startsWith('image/')) {
        setUploadErrors(prev => ({ ...prev, [progressId]: 'Faqat rasm fayllari (JPG, PNG, WEBP) qabul qilinadi.' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadErrors(prev => ({ ...prev, [progressId]: "Rasm hajmi 5MB dan oshmasligi kerak." }));
        return;
      }

      setUploadErrors(prev => ({ ...prev, [progressId]: '' }));
      setUploadProgress(prev => {
        const map = new Map(progressMap);
        map.set(progressId, { progress: 0, status: 'uploading', error: undefined });
        return map;
      });

      // Upload to Supabase Storage
      const filePath = `product-images/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        setUploadErrors(prev => ({ ...prev, [progressId]: uploadError.message }));
        setUploadProgress(prev => {
          const map = new Map(progressMap);
          map.set(progressId, { progress: 100, status: 'error', error: uploadError.message });
          return map;
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Add to state
      onChange([...images, publicUrl]);
      
      setUploadProgress(prev => {
        const map = new Map(progressMap);
        map.set(progressId, { progress: 100, status: 'success' });
        return map;
      });
    });
  };

  const handleRemove = (index: number) => {
    // Optionally delete from Supabase Storage
    const primary = images[index];
    if (primary && primary.includes('product-images')) {
      const path = primary.split('/').pop();
      supabase.storage.from('product-images').remove([path]);
    }
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleSetPrimary = (index: number) => {
    if (index === primaryIndex) return;
    setPrimaryIndex(index);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newArr = [...images];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    onChange(newArr);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-neutral-900 dark:text-white">
          {label} {images.length > 0 && <span className="text-xs font-medium text-neutral-500">({images.length}/{maxImages})</span>}
        </label>
        {images.length < maxImages && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 transition-colors"
            >
              {showUrlInput ? 'Yopish' : '+ URL qo\'shish'}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 px-3 py-1 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Fayl yuklash</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {showUrlInput && (
          <div className="mt-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 text-xs"
              placeholder="Rasm URL manzili"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="mt-2 px-3 py-1 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-neutral-950"
            >
              Qo'shish
            </button>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((src, index) => {
              const isPrimary = index === primaryIndex;
              const progress = uploadProgress.get(index);
              return (
                <div
                  key={index}
                  className={`relative rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-hidden ${isPrimary ? 'border-amber-500' : ''}`}>
                  {progress && progress.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">
                      <span>{y progress}%</span>
                    </div>
                  )}
                  <img
                    src={src}
                    alt=""
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {progress && progress.status === 'error' && (
                      <div className="bg-red-500/20 text-red-400 text-xs p-1 rounded">
                        {progress.error?.substring(0, 30)}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="absolute top-1 right-1 rounded-full bg-black/60 text-white text-xs p-1 hover:bg-black/80">
                      <X className="w-3 h-3" />
                    </button>
                    {isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="absolute top-1 left-1 rounded-full bg-black/60 text-white text-xs p-1 hover:bg-black/80">
                          <Star className="w-2 h-2" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'left')}"
                      className="absolute bottom-1 left-1 rounded-full bg-black/20 text-white text-xs p-1 hover:bg-black/40">
                        <ArrowLeft className="w-2 h-2" />
                      </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'right')}"
                      className="absolute bottom-1 right-1 rounded-full bg-black/20 text-white text-xs p-1 hover:bg-black/40">
                        <ArrowRight className="w-2 h-2" />
                      </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-300 mt-1">{helperText}</p>
    </div>
  );
};
