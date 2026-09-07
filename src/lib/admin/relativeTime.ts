/** Shared relative-time formatter for admin activity / notifications. */
export function relativeTime(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const ts = date.getTime();
  if (Number.isNaN(ts)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 10) return 'hozir';
  if (diffSec < 60) return `${diffSec} soniya oldin`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} soat oldin`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} kun oldin`;
  return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
}
