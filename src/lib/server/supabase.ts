import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSecret } from 'astro:env/server';

// The project URL is not secret; the key is (set SUPABASE_SECRET_KEY in Vercel).
const DEFAULT_URL = 'https://awzphbubjvsrctmuqhoi.supabase.co';
export const PHOTO_BUCKET = 'lead-photos';

let client: SupabaseClient | null | undefined;

/** Server-only Supabase client using the secret (service role) key, or null if not configured. */
export function db(): SupabaseClient | null {
  if (client !== undefined) return client;
  const key = getSecret('SUPABASE_SECRET_KEY');
  client = key
    ? createClient(getSecret('SUPABASE_URL') || DEFAULT_URL, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
  return client;
}
