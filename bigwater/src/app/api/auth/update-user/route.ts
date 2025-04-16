import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminAccess } from '@/lib/auth/admin-middleware';

export async function PUT(request: NextRequest) {
  // Vérifier si l'utilisateur est administrateur
  const accessError = await verifyAdminAccess(request);
  if (accessError) {
    return accessError;
  }

  const supabase = await createClient();
  const body = await request.json();
  
  const { id, name, email, password, role } = body;
  
  if (!id) {
    return NextResponse.json({ 
      error: 'ID utilisateur requis' 
    }, { status: 400 });
  }
  
  try {
    // Préparer les mises à jour du profil
    const profileUpdates: Record<string, string> = {};
    
    if (name) profileUpdates.name = name;
    if (email) profileUpdates.email = email;
    if (role) profileUpdates.role = role;
    
    // 1. Mettre à jour le profil dans la table profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    
    // 2. Si le mot de passe est fourni, le mettre à jour via l'API Auth
    if (password) {
      // Mettre à jour le mot de passe
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        id,
        { password }
      );
      
      if (passwordError) {
        return NextResponse.json({ error: passwordError.message }, { status: 500 });
      }
    }
    
    return NextResponse.json(profileData);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Une erreur s\'est produite lors de la mise à jour' },
      { status: 500 }
    );
  }
} 