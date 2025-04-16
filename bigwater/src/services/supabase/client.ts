import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  try {
    if (client) {
      return client;
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Variables d\'environnement Supabase manquantes');
      throw new Error('Configuration Supabase incomplète');
    }
    
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
    
    return client;
  } catch (error) {
    console.error('Erreur lors de la création du client Supabase:', error);
    
    throw error;
  }
}

interface SupabaseError extends Error {
  status?: number;
  message: string;
}

export async function retrySupabaseQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let attempts = 0;
  let lastError: SupabaseError | null = null;

  while (attempts < maxRetries) {
    try {
      if (attempts > 0) {
        const supabase = createClient();
        const { error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Problème de session détecté, tentative de rafraîchissement...');
          await supabase.auth.refreshSession();
        }
      }
      
      return await queryFn();
    } catch (error) {
      const supabaseError = error as SupabaseError;
      lastError = supabaseError;
      
      console.error(`Erreur tentative ${attempts + 1}/${maxRetries}:`, supabaseError);
      
      const shouldRetry = supabaseError?.status === 503 || 
                          supabaseError?.status === 429 ||
                          supabaseError?.status === 500 ||
                          supabaseError?.status === 502 ||
                          supabaseError?.message?.includes('network') || 
                          supabaseError?.message?.includes('connection') ||
                          supabaseError?.message?.includes('timeout') ||
                          supabaseError?.message?.includes('auth');
      
      if (!shouldRetry) {
        throw supabaseError;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
      attempts++;
    }
  }

  console.error(`Échec après ${maxRetries} tentatives:`, lastError);
  throw lastError;
} 