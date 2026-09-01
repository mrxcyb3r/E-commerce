import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase-db';

export const supabase: SupabaseClient = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Helper for admin mutations - uses service role key only on server
export const getSupabaseAdmin = (): SupabaseClient => {
  // This should only be used in server-side context
  // For now, throw to remind developers to use server functions
  throw new Error('Use server-side Supabase client for admin operations');
};

// Re-export types for convenience
export type { Database };

// Common query helpers
export async function fetchWithErrorHandling<T>(query: Promise<{ data: T | null; error: any }>): Promise<T | null> {
  const { data, error } = await query;
  if (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
  return data ?? null;
}

// Safe data normalization helpers
export function normalizeNull<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

export function safeArray<T>(value: T[] | null | undefined): T[] {
  return value ?? [];
}

export function safeObject<T>(value: T | null | undefined): T {
  return value ?? {} as T;
}