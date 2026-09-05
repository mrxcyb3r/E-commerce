import React, { useState, useRef } from 'react';
import { ImagePlus, RefreshCw, Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  buildMediaPath,
  uploadMediaWithProgress,
  getPublicUrl,
  validateMediaFile,
  parseOwnedObject,
} from '../../lib/supabase/storage';

interface SingleImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  bucket: string;
  scope: string;
  label?: string;
  hint?: string;
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  value,
  onChange,
  bucket,
  scope,
  label,
  hint,
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pickFile = () => fileRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validation = validateMediaFile(file, 'image');
    if (!validation.ok) {
      setError(validation.error ?? 'Yaroqsiz fayl');
      return;
    }
    setUploading(true);
    setError(null);
    setProgress(0);
    const path = buildMediaPath('image', scope, file);
    try {
      const { publicUrl } = await uploadMediaWithProgress({
        bucket,
        path,
        file,
        onProgress: (p) => setProgress(p),
      });
      const owned = parseOwnedObject(value);
      if (owned && owned.bucket === bucket && owned.path.startsWith(scope)) {
        try {
          await import('../../lib/supabase/storage').then((m) =>
            m.deleteMediaObjects(owned.bucket, [owned.path]),
          );
        } catch {
          // best effort
        }
      }
      onChange(publicUrl);
      setProgress(100);
      setDone(true);
      window.setTimeout(() => setDone(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    const owned = parseOwnedObject(value);
    if (owned) {
      import('../../lib/supabase/storage').then((m) => m.deleteMediaObjects(owned.bucket, [owned.path]));
    }
    onChange('');
  };

  return (
    <div>
      {label && (
        <span className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">{label}</span>
      )}
      <div className="flex items-start gap-3">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shrink-0">
          {value ? (
            <img
              src={value}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <ImagePlus className="w-7 h-7" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-bold text-white">{Math.round(progress)}%</span>
              <div className="w-12 h-1 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={pickFile}
              disabled={uploading}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
            >
              {value ? <RefreshCw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
              {value ? 'Almashtirish' : 'Yuklash'}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                O'chirish
              </button>
            )}
            {done && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <p className="text-[10px] text-neutral-400">{hint ?? 'JPG, PNG yoki WebP — maks. 5 MB'}</p>
          {error && (
            <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};