import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { CookieOptions } from '@supabase/ssr';

export function createClient(request: NextRequest) {
  // Créer une nouvelle instance de response basée sur la requête existante
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Si la valeur est vide, cela équivaut à supprimer le cookie
          if (value === '') {
            response.cookies.delete(name);
            return;
          }
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string) {
          response.cookies.delete(name);
        },
      },
    }
  );

  return { supabase, response };
} 