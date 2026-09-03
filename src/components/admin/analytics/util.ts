export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function productNameById(
  id: string | undefined,
  resolve: (id: string) => { name: string; categoryName?: string } | undefined
): string {
  if (!id) return 'Noma\'lum';
  const p = resolve(id);
  return p ? p.name : id;
}

export function categoryNameById(
  id: string,
  resolve: (id: string) => { name: string } | undefined
): string {
  const c = resolve(id);
  return c ? c.name : id;
}

export interface Resolver {
  product: (id: string) => { name: string } | undefined;
  feed: (id: string) => { title: string } | undefined;
  category: (id: string) => { name: string } | undefined;
}
