import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  // Récupérer les paramètres de filtrage
  const role = searchParams.get('role');
  
  // Construire la requête
  let query = supabase.from('profiles').select('*');
  
  if (role) query = query.eq('role', role);
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  
  // Vérifier si l'email existe déjà
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', body.email)
    .maybeSingle();
    
  if (existingUser) {
    return NextResponse.json(
      { error: 'Un utilisateur avec cet email existe déjà' },
      { status: 400 }
    );
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(body)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 