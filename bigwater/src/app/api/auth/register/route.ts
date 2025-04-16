import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminAccess } from '@/lib/auth/admin-middleware';

export async function POST(request: NextRequest) {
  // Vérifier si l'utilisateur est administrateur
  const accessError = await verifyAdminAccess(request);
  if (accessError) {
    return accessError;
  }

  const supabase = await createClient();
  const body = await request.json();
  
  const { email, password, name, role } = body;
  
  if (!email || !password || !name) {
    return NextResponse.json({ 
      error: 'Email, mot de passe et nom sont requis' 
    }, { status: 400 });
  }
  
  try {
    // 1. Créer l'utilisateur avec l'API Auth de Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role || 'user'
        }
      }
    });
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
    
    if (!authData.user) {
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 });
    }
    
    // 2. Créer ou mettre à jour le profil dans la table profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        name,
        role: role || 'user'
      })
      .select()
      .single();
    
    if (profileError) {
      // En cas d'erreur lors de la création du profil, on supprime l'utilisateur créé
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    
    return NextResponse.json(profileData, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Une erreur s\'est produite lors de l\'inscription' },
      { status: 500 }
    );
  }
} 