import { supabase } from './client';

export const MEDIA_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  STORE_ASSETS: 'store-assets',
  FEED_MEDIA: 'feed-media',
  PROMPT_ASSETS: 'prompt-assets',
} as const;

export type MediaKind = 'image' | 'video';

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

export interface MediaValidation {
  ok: boolean;
  error?: string;
}

export const validateMediaFile = (file: File, kind: MediaKind): MediaValidation => {
  const mime = file.type || mimeFromName(file.name);
  if (kind === 'image') {
    if (!(IMAGE_MIME_TYPES as readonly string[]).includes(mime)) {
      return {
        ok: false,
        error: 'Faqat JPG, PNG yoki WEBP rasm fayllari qabul qilinadi.',
      };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return {
        ok: false,
        error: 'Rasm hajmi 5 MB dan oshmasligi kerak.',
      };
    }
    return { ok: true };
  }

  if (!(VIDEO_MIME_TYPES as readonly string[]).includes(mime)) {
    return {
      ok: false,
      error: 'Faqat MP4 yoki WebM video fayllari qabul qilinadi.',
    };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return {
      ok: false,
      error: 'Video hajmi 100 MB dan oshmasligi kerak.',
    };
  }
  return { ok: true };
};

export const mimeFromName = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'webm') return 'video/webm';
  return '';
};

const slugifyBasename = (name: string): string => {
  const base = (name.split('.').slice(0, -1).join('.') || name).trim();
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'media';
};

export const fileExt = (file: File): string => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'jpeg' || ext === 'png' || ext === 'webp' || ext === 'mp4' || ext === 'webm') return ext;
  const mime = file.type;
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'video/mp4') return 'mp4';
  if (mime === 'video/webm') return 'webm';
  return ext || 'bin';
};

const stamp = (): string => Date.now().toString(36);

export const buildMediaPath = (
  kind: MediaKind,
  scope: string,
  file: File,
  sub: 'images' | 'videos' | 'poster' | 'thumbnails' = kind === 'image' ? 'images' : 'videos',
): string => {
  const name = `${stamp()}-${slugifyBasename(file.name)}.${fileExt(file)}`;
  if (scope.startsWith('feed-')) {
    return `feed/${scope}/${sub}/${name}`;
  }
  return `products/${scope}/${sub}/${name}`;
};

const storageBaseUrl = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  return url.replace(/\/$/, '');
};

const parseServerError = (payload: unknown): string => {
  try {
    const body = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const message = (body as { message?: string; error?: string }).message
      ?? (body as { error?: string }).error
      ?? (body as { message?: string }).message;
    if (message) return message;
  } catch {
    // fallthrough
  }
  return 'Faylni yuklashda xatolik yuz berdi.';
};

/**
 * Uploads a file to Supabase Storage with real upload progress (XHR-based,
 * mirrors the storage-js multipart protocol but exposes onUploadProgress).
 * The admin session token is attached so server-side RLS allows the write.
 */
export const uploadMediaWithProgress = async (options: {
  bucket: string;
  path: string;
  file: File;
  onProgress?: (percent: number) => void;
}): Promise<{ path: string; publicUrl: string }> => {
  if (typeof XMLHttpRequest === 'undefined') {
    throw new Error('Yuklash faqat brauzerda ishlaydi.');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const url = storageBaseUrl();
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const mime = options.file.type || mimeFromName(options.file.name);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${url}/storage/v1/object/${options.bucket}/${options.path}`);
    xhr.setRequestHeader('apikey', apikey);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('x-upsert', 'false');

    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        options.onProgress?.(100);
        const publicUrl = getPublicUrl(options.bucket, options.path);
        resolve({ path: options.path, publicUrl });
        return;
      }
      options.onProgress?.(0);
      reject(new Error(parseServerError(xhr.responseText)));
    };

    xhr.onerror = () => {
      options.onProgress?.(0);
      reject(new Error('Tarmoq xatosi. Iltimos, qayta urinib ko\'ring.'));
    };

    // A Blob sliced with an explicit type guarantees the server-side
    // allowed_mime_types check passes even when File.type is empty.
    const blob = new Blob([options.file], { type: mime });
    const form = new FormData();
    form.append('cacheControl', '3600');
    form.append('', blob);
    xhr.send(form);
  });
};

export const getPublicUrl = (bucket: string, path: string): string =>
  supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

export const deleteMediaObjects = async (
  bucket: string,
  paths: string[],
): Promise<{ removed: string[]; errors: string[] }> => {
  const cleaned = paths.filter(Boolean);
  if (cleaned.length === 0) return { removed: [], errors: [] };
  const { error } = await supabase.storage.from(bucket).remove(cleaned);
  if (error) {
    return { removed: [], errors: [error.message] };
  }
  return { removed: cleaned, errors: [] };
};

/**
 * Detects whether a URL points to one of our own storage objects and returns
 * the owning bucket -> path tuple, so removed items clean up their files.
 */
export const parseOwnedObject = (value: string): { bucket: string; path: string } | null => {
  if (!value) return null;
  const cleaned = value.split('?')[0];
  const match = cleaned.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return null;
  const [, bucket, path] = match;
  if (!path || path.length === 0) return null;
  return { bucket, path: decodeURIComponent(path) };
};

export const isOwnedObjectUrl = (value: string): boolean => parseOwnedObject(value) !== null;