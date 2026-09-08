// Phase 15 — Permission layer.
//
// The only purpose of this module is to stop "auth.role() == 'owner' ? ..."
// checks from being scattered through the admin UI. A capability is the
// granular right to USE a page/action; the sidebar filters navigation, and
// RequireCapability gates every /admin route so direct URLs cannot bypass it.
//
// Today the map is simple (owner/admin hold everything; the owner exclusively
// manages staff). Tomorrow these functions map onto roles — and this file is
// the single place that changes.
//
// NOTE: these are UI/UX-level gates. Real authorization is enforced by
// RLS/triggers in the database (role escalation is impossible client-side).
// Capability maps MUST stay aligned with what the DB actually permits:
// do not grant a frontend capability the RLS layer denies.

import { StaffRole } from '../../types/supabase-db';

export type Capability =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'feed'
  | 'homepage'
  | 'prompts'
  | 'store'
  | 'orders'
  | 'buySessions'
  | 'campaigns'
  | 'analytics'
  | 'activity'
  | 'settings'
  | 'users'
  | 'audit';

/** Roles that get a capability. `*` = every role. */
const CAPABILITY_ROLES: Record<Capability, StaffRole[] | '*'> = {
  dashboard: ['owner', 'admin'],
  products: ['owner', 'admin', 'manager'],
  categories: ['owner', 'admin'],
  inventory: ['owner', 'admin'],
  feed: ['owner', 'admin', 'manager'],
  homepage: ['owner', 'admin'],
  prompts: ['owner', 'admin'],
  store: ['owner', 'admin'],
  orders: ['owner', 'admin'],
  buySessions: ['owner', 'admin'],
  campaigns: ['owner', 'admin', 'manager'],
  analytics: ['owner', 'admin'],
  activity: ['owner', 'admin'],
  settings: ['owner', 'admin'],
  users: ['owner'],
  audit: ['owner', 'admin'],
};

export function can(role: StaffRole | null | undefined, capability: Capability): boolean {
  if (!role) return false;
  const allowed = CAPABILITY_ROLES[capability];
  if (allowed === '*') return true;
  return allowed.includes(role);
}

/** Convenience wrappers matching the Phase 15 spec / continuation prompt names. */
export const canManageDashboard = (r: StaffRole | null | undefined) => can(r, 'dashboard');
export const canManageProducts = (r: StaffRole | null | undefined) => can(r, 'products');
export const canManageCategories = (r: StaffRole | null | undefined) => can(r, 'categories');
export const canManageInventory = (r: StaffRole | null | undefined) => can(r, 'inventory');
export const canManageFeed = (r: StaffRole | null | undefined) => can(r, 'feed');
export const canManageHomepage = (r: StaffRole | null | undefined) => can(r, 'homepage');
export const canManagePrompts = (r: StaffRole | null | undefined) => can(r, 'prompts');
export const canManageStore = (r: StaffRole | null | undefined) => can(r, 'store');
export const canManageOrders = (r: StaffRole | null | undefined) => can(r, 'orders');
export const canManageBuySessions = (r: StaffRole | null | undefined) => can(r, 'buySessions');
export const canManageCampaigns = (r: StaffRole | null | undefined) => can(r, 'campaigns');
export const canManageAnalytics = (r: StaffRole | null | undefined) => can(r, 'analytics');
export const canManageActivity = (r: StaffRole | null | undefined) => can(r, 'activity');
export const canManageSettings = (r: StaffRole | null | undefined) => can(r, 'settings');
export const canManageUsers = (r: StaffRole | null | undefined) => can(r, 'users');
export const canManageAudit = (r: StaffRole | null | undefined) => can(r, 'audit');