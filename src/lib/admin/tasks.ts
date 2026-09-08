// Daily operational tasks — auto-generated from REAL store data, never canned
// filler. The dashboard renders these so the owner opens the app and sees what
// actually needs attention today (products, feed, inventory, onboarding).
//
// Every task carries an href so a single tap takes the owner to the fix surface.
// Analytics: the dashboard fires dashboard_task_completed when a task is acted on.

import { Product } from '../../types/product';
import { VideoItem } from '../../types/video';
import { StoreReadiness, ReadinessGroup } from './readiness';

export type TaskKind = 'readiness' | 'catalog' | 'content' | 'inventory' | 'operations';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface DailyTask {
  id: string;
  kind: TaskKind;
  title: string;
  description: string;
  href: string;
  priority: TaskPriority;
}

export interface DailyTaskInputs {
  products: Product[];
  videos: VideoItem[];
  readiness: StoreReadiness;
  /** product ids that received at least one product_view (all-time). */
  viewedIds?: Set<string>;
  /** product ids with at least one buy_list_add (prepared for purchase). */
  preparedIds?: Set<string>;
  /** videos posted today (createdAt within Tashkent today). */
  postedToday?: boolean;
  /** number of categories currently holding zero products. */
  emptyCategoryCount?: number;
}

const GROUP_PRIORITY: Record<ReadinessGroup, TaskPriority> = {
  identity: 'high',
  catalog: 'high',
  content: 'medium',
  contact: 'low',
};

export function computeDailyTasks(inputs: DailyTaskInputs): DailyTask[] {
  const { products, videos, readiness, viewedIds, preparedIds, postedToday } = inputs;
  const tasks: DailyTask[] = [];

  // 1. Onboarding readiness — the next 2 undone setup items.
  for (const item of readiness.items) {
    if (item.done) continue;
    tasks.push({
      id: `readiness-${item.key}`,
      kind: 'readiness',
      title: item.label,
      description: item.suggestion,
      href: item.href,
      priority: GROUP_PRIORITY[item.group],
    });
    if (tasks.filter((t) => t.kind === 'readiness').length >= 2) break;
  }

  // 2. Empty categories → catalog has gaps.
  if (inputs.products.length > 0) {
    // category emptiness is derived in the dashboard/caller via category counts;
    // exposed here through an optional category signal until the caller provides it.
    if (inputs.emptyCategoryCount && inputs.emptyCategoryCount > 0) {
      tasks.push({
        id: 'empty-categories',
        kind: 'catalog',
        title: 'Bo\'sh kategoriyalar',
        description: `${inputs.emptyCategoryCount} ta kategoriyada mahsulot yo\'q. Tuzating yoki yashiring.`,
        href: '/admin/categories',
        priority: 'medium',
      });
    }
  }

  // 3. Inventory — out of stock first, then low stock.
  const outOfStock = products.filter((p) => p.inStock === false).length;
  if (outOfStock > 0) {
    tasks.push({
      id: 'out-of-stock',
      kind: 'inventory',
      title: 'Zaxirada yo\'q mahsulotlar',
      description: `${outOfStock} ta mahsulot zaxiradan chiqib ketgan. Yangi partiya kiring.`,
      href: '/admin/inventory',
      priority: 'high',
    });
  }
  const lowStock = products.filter((p) => p.inStock && (p.stockCount ?? 0) > 0 && (p.stockCount ?? 0) <= 3).length;
  if (lowStock > 0) {
    tasks.push({
      id: 'low-stock',
      kind: 'inventory',
      title: 'Kam zaxira',
      description: `${lowStock} ta mahsulotda zaxira tugab bormoqda (3 dan kam).`,
      href: '/admin/inventory',
      priority: 'medium',
    });
  }

  // 4. Content — feed activity today / products never surfaced.
  if (videos.length > 0 && !postedToday) {
    tasks.push({
      id: 'feed-today',
      kind: 'content',
      title: 'Bugun feed posti yo\'q',
      description: 'Do\'kon har kuni yangi video yoki slayd bilan jonli ko\'rinishi kerak.',
      href: '/admin/feed',
      priority: 'medium',
    });
  }
  if (viewedIds && viewedIds.size > 0) {
    const neverViewed = products.filter((p) => !viewedIds.has(p.id)).length;
    if (neverViewed > 0) {
      tasks.push({
        id: 'never-viewed',
        kind: 'content',
        title: 'Ko\'rilmagan mahsulotlar',
        description: `${neverViewed} ta mahsulot hech kim ko\'rmagan. Feed yoki bosh sahifada joy bering.`,
        href: '/admin/feed',
        priority: 'low',
      });
    }
  }
  if (preparedIds && preparedIds.size > 0) {
    const neverPrepared = products.filter((p) => !preparedIds.has(p.id)).length;
    if (neverPrepared > 0) {
      tasks.push({
        id: 'never-prepared',
        kind: 'operations',
        title: 'Xaridga tayyorlanmagan mahsulot',
        description: `${neverPrepared} ta mahsulot xarid ro\'yxatiga hech qachon qo\'shilmagan.`,
        href: '/admin/products',
        priority: 'low',
      });
    }
  }

  if (tasks.length === 0) {
    tasks.push({
      id: 'all-clear',
      kind: 'operations',
      title: 'Hammasi joyida!',
      description: 'Bugungi barcha e\'tibor masalalari hal qilingan.',
      href: '/admin',
      priority: 'low',
    });
  }

  const order: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
  return tasks.slice(0, 8).sort((a, b) => order[a.priority] - order[b.priority]);
}