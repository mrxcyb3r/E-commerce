import React, { useState, useRef } from 'react';
import { X, Upload, Star, ArrowLeft, ArrowRight, RefreshCcw, AlertCircle, Loader2, ImagePlus } from 'lucide-react';
import {
  MEDIA_BUCKETS,
  buildMediaPath,
  deleteMediaObjects,
  parseOwnedObject,
  uploadMediaWithProgress,
  validateMediaFile,
} from '../../lib/supabase/storage';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
  bucket?: string;
  scope?: string;
  disabled?: boolean;
  onUploaded?: (media: { bucket: string; path: string }) => void;
}

interface UploadTask {
  key: number;
  file: File;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

let uploadKeyCounter = 1;

const nextUploadKey = (): number => uploadKeyCounter++;

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 8,
  label = 'Rasmlar',
  helperText = 'Birinchi rasm asosiy rasm sifatida ko\'rsatiladi. Kompyuterdan fayl yuklang yoki istasangiz URL manzil orqali qo\'shing.',
  bucket = MEDIA_BUCKETS.PRODUCT_IMAGES,
  scope = 'pending',
  disabled = false,
  onUploaded,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patchTask = (key: number, patch: Partial<UploadTask>) => {
    setTasks((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  };

  const removeTask = (key: number) => {
    setTasks((prev) => prev.filter((t) => t.key !== key));
  };

  const runUpload = async (taskKey: number, file: File, batch: string[]) => {
    const path = buildMediaPath('image', scope, file);
    patchTask(taskKey, { status: 'uploading', progress: 0, error: undefined });
    try {
      const { publicUrl } = await uploadMediaWithProgress({
        bucket,
        path,
        file,
        onProgress: (progress) => patchTask(taskKey, { progress }),
      });
      patchTask(taskKey, { status: 'success', progress: 100 });
      onUploaded?.({ bucket, path });
      batch.push(publicUrl);
      onChange([...images, ...batch]);
      // dismiss completed rows shortly after
      setTimeout(() => removeTask(taskKey), 1200);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Yuklashda xatolik yuz berdi.';
      patchTask(taskKey, { status: 'error', error: message });
    }
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const freeSlots = maxImages - images.length;
    if (freeSlots <= 0) {
      setUploadErrors({ full: `Ko\'pi bilan ${maxImages} ta rasm qo\'shish mumkin.` });
      return;
    }

    const nextErrors: { [key: number]: string } = {};
    const accepted: { key: number; file: File }[] = [];
    const batch: string[] = [];
    files.slice(0, freeSlots).forEach((file) => {
      const validation = validateMediaFile(file, 'image');
      if (!validation.ok) {
        nextErrors[Date.now() + Math.random()] = `${file.name}: ${validation.error ?? 'Yaroqsiz fayl'}`;
        return;
      }
      accepted.push({ key: nextUploadKey(), file });
    });
    setUploadErrors(nextErrors);

    for (const item of accepted) {
      const task: UploadTask = {
        key: item.key,
        file: item.file,
        name: item.file.name,
        progress: 0,
        status: 'uploading',
      };
      setTasks((prev) => [...prev, task]);
      await runUpload(item.key, item.file, batch);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    processFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    processFiles(files);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
    } catch {
      setUploadErrors((prev) => ({ ...prev, url: 'Iltimos, to\'g\'ri rasm URL manzilini kiriting.' }));
    }
  };

  const handleRemove = async (index: number) => {
    const target = images[index];
    if (!target) return;
    const owned = parseOwnedObject(target);
    if (owned) {
      try {
        await deleteMediaObjects(owned.bucket, [owned.path]);
      } catch {
        // orphan remains; report silently via console only for debugging
        console.error('[ImageUploader] storage delete failed', owned.path);
      }
    }
    onChange(images.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onChange(next);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [target] = next.splice(index, 1);
    if (target) next.unshift(target);
    onChange(next);
  };

  const dismissUploadError = (key: string) => {
    setUploadErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
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
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 px-3 py-1 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Fayl yuklash</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>

      {/* Dropzone for drag & drop */}
      {images.length < maxImages && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`mt-2 rounded-xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
              : 'border-neutral-300 dark:border-neutral-700 hover:border-amber-400 bg-neutral-50/60 dark:bg-neutral-800/40'
          }`}
        >
          <ImagePlus className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
            {dragging ? 'Rasmlarni qo\'yib yuboring' : 'Rasmlarni shu yerga tashlang yoki bosing'}
          </p>
          <p className="text-[10px] text-neutral-400 mt-0.5">JPG, PNG yoki WebP — har bir fayl maks. 5 MB</p>
        </div>
      )}

      {showUrlInput && (
        <div className="mt-2 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 space-y-2 bg-neutral-50 dark:bg-neutral-800/60">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Bu imkoniyat mavjud rasm URL manzillarini import qilish uchun (ilgari URL orqali saqlangan rasmlar). Oddiy holatda fayl yuklashdan foydalaning.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs"
              placeholder="Rasm URL manzili"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-neutral-950 whitespace-nowrap"
            >
              Qo'shish
            </button>
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((src, index) => (
            <div
              key={`${index}-${src}`}
              className={`relative rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs overflow-hidden ${index === 0 ? 'border-amber-500' : ''}`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-40 object-cover"
                loading="lazy"
              />
              <button
                type="button"
                aria-label="Rasmni o'chirish"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 rounded-full bg-black/60 text-white text-xs p-1 hover:bg-black/80"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <span className="absolute top-1 left-1 rounded-full bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" /> Asosiy
                </span>
              )}
              <div className="absolute bottom-1 inset-x-1 flex items-center justify-between">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleSetPrimary(index)}
                  className="rounded-full bg-black/60 text-white text-xs p-1 hover:bg-black/80 disabled:opacity-30"
                  title="Asosiy qilish"
                >
                  <Star className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'left')}
                    className="rounded-full bg-black/40 text-white text-xs p-1 hover:bg-black/60"
                    aria-label="Chapga surish"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'right')}
                    className="rounded-full bg-black/40 text-white text-xs p-1 hover:bg-black/60"
                    aria-label="O'ngga surish"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-2">
          {(() => {
            const uploading = tasks.filter((t) => t.status === 'uploading');
            if (uploading.length > 1) {
              const overall = uploading.reduce((sum, t) => sum + t.progress, 0) / uploading.length;
              return (
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-900">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                      {uploading.length} ta fayl yuklanmoqda...
                    </span>
                    <span className="text-xs font-black text-amber-600">{Math.round(overall)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${overall}%` }}
                    />
                  </div>
                </div>
              );
            }
            return null;
          })()}
          {tasks.map((task) => (
            <div key={task.key} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {task.status === 'uploading' ? (
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                  ) : task.status === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <CheckBadge />
                  )}
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 truncate">{task.name}</span>
                </div>
                {task.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => runUpload(task.key, task.file, [])}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 shrink-0"
                  >
                    <RefreshCcw className="w-3 h-3" /> Qayta urinish
                  </button>
                )}
                {task.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => removeTask(task.key)}
                    className="text-neutral-400 hover:text-neutral-600 shrink-0"
                    aria-label="Bekor qilish"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {task.status !== 'success' && (
                <div className="mt-2 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${task.status === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              )}
              {task.status === 'error' && task.error && (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{task.error}</p>
              )}
              {task.status === 'uploading' && (
                <p className="mt-1.5 text-xs text-neutral-500">{task.progress}%</p>
              )}
            </div>
          ))}
        </div>
      )}

      {Object.keys(uploadErrors).length > 0 && (
        <div className="space-y-1">
          {Object.entries(uploadErrors).map(([key, msg]) =>
            msg ? (
              <div key={key} className="flex items-start justify-between gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{msg}</p>
                <button
                  type="button"
                  onClick={() => dismissUploadError(key)}
                  className="text-red-400 hover:text-red-600"
                  aria-label="Xatoni yopish"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null
          )}
        </div>
      )}

      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-300 mt-1">{helperText}</p>
    </div>
  );
};

const CheckBadge = () => (
  <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
    <span className="text-[10px] font-bold leading-none">✓</span>
  </span>
);