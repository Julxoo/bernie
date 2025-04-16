import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null;
let lastError: Error | null = null;
let lastErrorTime = 0;

export function createClient() {
  try {
    // Si un client existe déjà et qu'il n'y a pas eu d'erreur récente, le réutiliser
    if (client) {
      return client;
    }
    
    // Vérifie si les variables d'environnement sont définies
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Variables d\'environnement Supabase manquantes');
      throw new Error('Configuration Supabase incomplète');
    }
    
    // Créer un nouveau client
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
    
    // Enregistrer l'erreur pour éviter de créer trop de clients en cas d'échec répété
    lastError = error instanceof Error ? error : new Error(String(error));
    lastErrorTime = Date.now();
    
    throw error;
  }
}

// Fonction utilitaire pour retenter les requêtes Supabase en cas d'échec
export async function retrySupabaseQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let attempts = 0;
  let lastError: any = null;

  while (attempts < maxRetries) {
    try {
      // Vérifier l'état de la session avant d'exécuter la requête
      if (attempts > 0) {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Problème de session détecté, tentative de rafraîchissement...');
          await supabase.auth.refreshSession();
        }
      }
      
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Journaliser l'erreur complète pour le débogage
      console.error(`Erreur tentative ${attempts + 1}/${maxRetries}:`, error);
      
      // Vérifier le type d'erreur pour déterminer si on doit réessayer
      const shouldRetry = error?.status === 503 || 
                          error?.status === 429 || // rate limit
                          error?.status === 500 || // erreur serveur
                          error?.status === 502 || // bad gateway
                          error?.message?.includes('network') || 
                          error?.message?.includes('connection') ||
                          error?.message?.includes('timeout') ||
                          error?.message?.includes('auth');
      
      if (!shouldRetry) {
        throw error;
      }
      
      console.log(`Tentative ${attempts + 1}/${maxRetries} échouée, nouvel essai dans ${delay}ms...`);
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Augmenter le délai pour la prochaine tentative (backoff exponentiel)
      delay *= 2;
      attempts++;
    }
  }

  console.error(`Échec après ${maxRetries} tentatives:`, lastError);
  throw lastError;
} 