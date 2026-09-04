import React, { useRef, useState } from 'react';
import { Video, X, Upload, RefreshCcw, AlertCircle, Loader2, Check, Link as LinkIcon } from 'lucide-react';
import {
  buildMediaPath,
  deleteMediaObjects,
  parseOwnedObject,
  uploadMediaWithProgress,
  validateMediaFile,
} from '../../lib/supabase/storage';

interface VideoUploaderProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  poster?: string;
  onPosterChange?: (value: string | undefined) => void;
  bucket: string;
  scope: string;
  label?: string;
  helperText?: string;
  showPoster?: boolean;
  disabled?: boolean;
  onUploaded?: (media: { bucket: string; path: string }) => void;
}

type UploadState = {
  progress: number;
  status: 'uploading' | 'error' | 'success';
  error?: string;
};

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  value,
  onChange,
  poster,
  onPosterChange,
  bucket,
  scope,
  label = 'Video fayl',
  helperText = 'MP4 yoki WebM, hajmi 100 MB gacha. E\'lon fayl yuklab saqlash orqali yuklanadi.',
  showPoster = true,
  disabled = false,
  onUploaded,
}) => {
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [posterUpload, setPosterUpload] = useState<UploadState | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const runVideoUpload = async (file: File) => {
    const validation = validateMediaFile(file, 'video');
    if (!validation.ok) {
      setUpload({ progress: 0, status: 'error', error: validation.error });
      return;
    }
    const path = buildMediaPath('video', scope, file, 'videos');
    setUpload({ progress: 0, status: 'uploading' });
    try {
      const { publicUrl } = await uploadMediaWithProgress({
        bucket,
        path,
        file,
        onProgress: (progress) => setUpload((prev) => (prev ? { ...prev, progress } : { progress, status: 'uploading' })),
      });
      onChange(publicUrl);
      setUpload({ progress: 100, status: 'success' });
      onUploaded?.({ bucket, path });
      setTimeout(() => setUpload(null), 1000);
    } catch (e) {
      setUpload({
        progress: 0,
        status: 'error',
        error: e instanceof Error ? e.message : 'Video yuklashda xatolik yuz berdi.',
      });
    }
  };

  const runPosterUpload = async (file: File) => {
    const validation = validateMediaFile(file, 'image');
    if (!validation.ok) {
      setPosterUpload({ progress: 0, status: 'error', error: validation.error });
      return;
    }
    if (!onPosterChange) return;
    const path = buildMediaPath('image', scope, file, 'poster');
    setPosterUpload({ progress: 0, status: 'uploading' });
    try {
      const { publicUrl } = await uploadMediaWithProgress({
        bucket,
        path,
        file,
        onProgress: (progress) => setPosterUpload((prev) => (prev ? { ...prev, progress } : { progress, status: 'uploading' })),
      });
      onPosterChange(publicUrl);
      setPosterUpload({ progress: 100, status: 'success' });
      onUploaded?.({ bucket, path });
      setTimeout(() => setPosterUpload(null), 1000);
    } catch (e) {
      setPosterUpload({
        progress: 0,
        status: 'error',
        error: e instanceof Error ? e.message : 'Muqova yuklashda xatolik yuz berdi.',
      });
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    const owned = parseOwnedObject(value);
    if (owned) {
      try {
        await deleteMediaObjects(owned.bucket, [owned.path]);
      } catch {
        // orphan cleanup best-effort; leave console signal for debugging
        console.error('[VideoUploader] storage delete failed', owned.path);
      }
    }
    onChange(undefined);
  };

  const handleRemovePoster = async () => {
    if (!onPosterChange || !poster) return;
    const owned = parseOwnedObject(poster);
    if (owned) {
      try {
        await deleteMediaObjects(owned.bucket, [owned.path]);
      } catch {
        console.error('[VideoUploader] poster delete failed', owned.path);
      }
    }
    onPosterChange(undefined);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      const url = new URL(urlInput);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error();
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    } catch {
      setUpload({ progress: 0, status: 'error', error: 'Iltimos, to\'g\'ri video URL manzilini kiriting.' });
    }
  };

  return (
    <div className="space-y-3">
      <LabelRow label={label} />

      {value ? (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="aspect-video bg-black">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              key={value}
              src={value}
              className="w-full h-full object-contain"
              controls
              muted
              playsInline
              preload="metadata"
              onError={() => setUpload({ progress: 0, status: 'error', error: 'Videoni o\'qib bo\'lmadi. Fayl formati qo\'llab-quvvatlanmasligi mumkin.' })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 p-2.5 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              disabled={disabled}
              onClick={() => videoInputRef.current?.click()}
              className="text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Videoni almashtirish</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              className="text-xs font-semibold text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>O'chirish</span>
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput((v) => !v)}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-1"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{showUrlInput ? 'Yopish' : 'URL bilan almashtirish'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && videoInputRef.current?.click()}
          className="rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white dark:bg-neutral-900"
        >
          <Video className="w-7 h-7 text-neutral-400" />
          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Video fayl tanlang (MP4/WebM)</p>
          <p className="text-[11px] text-neutral-400">Hajmi 100 MB gacha · Yuklangan video do\'konda ko\'rsatiladi</p>
        </div>
      )}

      {showUrlInput && !value && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 space-y-2 bg-neutral-50 dark:bg-neutral-800/60">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Mavjud video URL manzilini import qilish (oldingi URL asosidagi videolar uchun).</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs"
              placeholder="https://..."
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

      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void runVideoUpload(file);
        }}
      />

      {upload && upload.status !== 'success' && (
        <UploadStatusRow state={upload} onRetry={undefined} onDismiss={() => setUpload(null)} />
      )}

      {showPoster && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">Muqova / Poster rasm (ixtiyoriy)</label>
          {poster ? (
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2.5">
              <img src={poster} alt="" className="w-20 h-14 object-cover rounded-lg" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => posterInputRef.current?.click()}
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  O'zgartirish
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleRemovePoster}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  O'chirish
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => posterInputRef.current?.click()}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 px-4 py-3 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" /> Muqova rasm yuklash
            </button>
          )}
          <input
            ref={posterInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void runPosterUpload(file);
            }}
          />
          {posterUpload && posterUpload.status !== 'success' && (
            <UploadStatusRow state={posterUpload} onRetry={undefined} onDismiss={() => setPosterUpload(null)} />
          )}
        </div>
      )}

      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-300">{helperText}</p>
    </div>
  );
};

const LabelRow: React.FC<{ label: string }> = ({ label }) => (
  <label className="block text-sm font-bold text-neutral-900 dark:text-white">{label}</label>
);

const UploadStatusRow: React.FC<{
  state: UploadState;
  onRetry?: () => void;
  onDismiss: () => void;
}> = ({ state, onRetry, onDismiss }) => {
  if (state.status === 'error') {
    return (
      <div className="flex items-start justify-between gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2">
        <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {state.error ?? 'Yuklashda xatolik.'}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {onRetry && (
            <button type="button" onClick={onRetry} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Qayta
            </button>
          )}
          <button type="button" onClick={onDismiss} className="text-red-400 hover:text-red-600" aria-label="Yopish">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" /> Yuklanmoqda... {state.progress}%
        </span>
        {state.status === 'success' && <Check className="w-4 h-4 text-green-500" />}
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${state.progress}%` }} />
      </div>
    </div>
  );
};