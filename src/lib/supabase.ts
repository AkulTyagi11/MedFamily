import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const FALLBACK_SUPABASE_URL = 'https://placeholder.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'placeholder-anon-key';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isServiceRoleLikeKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) {
    return true;
  }

  const payload = decodeJwtPayload(key);
  return payload?.role === 'service_role';
}

export const supabaseConfigError = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.';
  }

  if (isServiceRoleLikeKey(supabaseAnonKey)) {
    return 'VITE_SUPABASE_ANON_KEY must be a publishable or anon key. Never expose a service-role or secret key in the browser.';
  }

  return null;
})();

export const isSupabaseConfigured = !supabaseConfigError;
const resolvedSupabaseUrl = isSupabaseConfigured ? (supabaseUrl as string) : FALLBACK_SUPABASE_URL;
const resolvedSupabaseAnonKey = isSupabaseConfigured ? (supabaseAnonKey as string) : FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(
  resolvedSupabaseUrl,
  resolvedSupabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
