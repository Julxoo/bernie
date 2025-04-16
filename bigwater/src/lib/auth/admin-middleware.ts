import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Middleware qui vérifie si l'utilisateur actuel est un administrateur
 * @param request - La requête entrante
 * @returns Un objet Response en cas d'erreur, ou undefined si l'utilisateur est autorisé
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function verifyAdminAccess(_request: NextRequest) {
   const supabase = await createClient();
  
  // 1. Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Authentification requise' },
      { status: 401 }
    );
  }
  
  // 2. Vérifier si l'utilisateur est un admin dans la table profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  if (error || !profile) {
    return NextResponse.json(
      { error: 'Profil non trouvé' },
      { status: 404 }
    );
  }
  
  if (profile.role !== 'admin') {
    return NextResponse.json(
      { error: 'Accès non autorisé. Droits administrateur requis.' },
      { status: 403 }
    );
  }
  
  // Si tout est bon, la fonction ne retourne rien
  // et le traitement de la requête peut continuer
  return undefined;
} 