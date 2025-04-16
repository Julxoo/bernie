import { createBrowserClient } from '@supabase/ssr';

// Client Supabase pour le côté client (navigateur)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} 