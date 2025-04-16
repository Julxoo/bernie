import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminAccess } from '@/lib/auth/admin-middleware';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  // Vérifier si l'utilisateur est administrateur
  const accessError = await verifyAdminAccess(request);
  if (accessError) {
    return accessError;
  }

  const supabase = await createClient();
  const id = context.params.id;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }
  
  return NextResponse.json(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: NextRequest, context: any) {
  // Vérifier si l'utilisateur est administrateur
  const accessError = await verifyAdminAccess(request);
  if (accessError) {
    return accessError;
  }

  const supabase = await createClient();
  const id = context.params.id;
  const body = await request.json();
  
  // Vérifier si l'email est changé et s'il est déjà utilisé
  if (body.email) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', body.email)
      .neq('id', id)
      .maybeSingle();
      
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update(body)
    .eq('id', id)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: any) {
  // Vérifier si l'utilisateur est administrateur
  const accessError = await verifyAdminAccess(request);
  if (accessError) {
    return accessError;
  }

  const supabase = await createClient();
  const id = context.params.id;
  
  try {
    // 1. Supprimer le profil de la table profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    
    // 2. Supprimer l'utilisateur de Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      console.error('Erreur lors de la suppression de l\'utilisateur dans Auth:', authError);
      // Ne pas échouer si la suppression du profil a réussi mais pas celle de l'Auth
      // Mais enregistrer l'erreur
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Une erreur s\'est produite lors de la suppression' },
      { status: 500 }
    );
  }
} 