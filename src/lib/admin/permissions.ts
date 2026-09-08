// Phase 15 — Permission layer.
//
// The only purpose of this module is to stop "auth.role() == 'owner' ? ..."
// checks from being scattered through the admin UI. Today the capability map
// is simple (the owner holds everything); tomorrow these functions map onto
// roles — and this file is the single place that changes.
//
// NOTE: these are UI-level gates. Real authorization is enforced by
// RLS/triggers in the database (role escalation is impossible client-side).

import { StaffRole } from '../../types/supabase-db';

export type Capability =
  | 'products'
  | 'feed'
  | 'analytics'
  | 'campaigns'
  | 'store'
  | 'users'
  | 'settings';

/** Roles that get a capability. `*` = every role (used to keep read-only
 *  surfaces reachable without scattering checks). */
const CAPABILITY_ROLES: Record<Capability, StaffRole[] | '*'> = {
  products: ['owner', 'admin', 'manager'],
  feed: ['owner', 'admin', 'manager'],
  analytics: ['owner', 'admin'],
  campaigns: ['owner', 'admin', 'manager'],
  store: ['owner', 'admin'],
  users: ['owner'],
  settings: ['owner', 'admin'],
};

export function can(role: StaffRole | null | undefined, capability: Capability): boolean {
  if (!role) return false;
  const allowed = CAPABILITY_ROLES[capability];
  if (allowed === '*') return true;
  return allowed.includes(role);
}

/** Convenience wrappers matching the Phase 15 spec names. */
export const canManageProducts = (r: StaffRole | null | undefined) => can(r, 'products');
export const canManageFeed = (r: StaffRole | null | undefined) => can(r, 'feed');
export const canManageAnalytics = (r: StaffRole | null | undefined) => can(r, 'analytics');
export const canManageCampaigns = (r: StaffRole | null | undefined) => can(r, 'campaigns');
export const canManageStore = (r: StaffRole | null | undefined) => can(r, 'store');
export const canManageUsers = (r: StaffRole | null | undefined) => can(r, 'users');
export const canManageSettings = (r: StaffRole | null | undefined) => can(r, 'settings');