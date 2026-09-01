import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Plus, X, Upload, Check, Star, ArrowLeft, ArrowRight } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput); // validate
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
      setUploadError(null);
    } catch {
      setUploadError("Iltimos, to'g'ri rasm URL manzilini kiriting.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files as FileList;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Faqat rasm fayllari (JPG, PNG, WEBP) qabul qilinadi.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Rasm hajmi 5MB dan oshmasligi kerak.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) {
          onChange([...images, result as string]);
          setUploadError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
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
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {helperText}
      </p>

      {/* URL Input Form */}
      {showUrlInput && (
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... yoki rasm havolasi"
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 py-2 text-xs font-bold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Qo'shish
            </button>
          </div>
          {uploadError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-neutral-100 dark:bg-neutral-800 ${
                idx === 0
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Primary Badge */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Asosiy</span>
                </div>
              )}

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex items-center justify-between">
                  {idx !== 0 ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      title="Asosiy rasm qilish"
                      className="p-1 rounded-md bg-white/80 hover:bg-white text-neutral-900 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      <span>Asosiy</span>
                    </button>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="O'chirish"
                    className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'left')}
                    className="p-1 rounded-md bg-black/60 hover:bg-black text-white disabled:opacity-30"
                    title="Oldinga surish"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, 'right')}
                    className="p-1 rounded-md bg-black/60 hover:bg-black text-white disabled:opacity-30"
                    title="Keyinga surish"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Image Tile */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white transition-colors flex flex-col items-center justify-center p-4 text-center group bg-neutral-50/50 dark:bg-neutral-800/30"
            >
              <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="mt-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                Rasm qo'shish
              </span>
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-neutral-900 dark:hover:border-white transition-colors cursor-pointer bg-neutral-50/50 dark:bg-neutral-900/50"
        >
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-neutral-900 dark:text-white">
            Hali rasmlar yuklanmagan
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Faylni bu yerga bosing yoki yuqoridagi "+ URL qo'shish" tugmasidan foydalaning.
          </p>
        </div>
      )}
    </div>
  );
};
