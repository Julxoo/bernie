import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type CookieOptions } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Les erreurs peuvent se produire si l'objet de réponse a déjà été envoyé
            // Nous pouvons les ignorer en toute sécurité dans ce contexte
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Les erreurs peuvent se produire si l'objet de réponse a déjà été envoyé
            // Nous pouvons les ignorer en toute sécurité dans ce contexte
          }
        },
      },
    }
  );
} 