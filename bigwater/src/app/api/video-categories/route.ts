import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  // Récupérer les paramètres de filtrage
  const userId = searchParams.get('userId');
  
  // Construire la requête
  let query = supabase.from('video_categories').select('*');
  
  if (userId) query = query.eq('user_id', userId);
  
  // Ordonner par titre
  query = query.order('title', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  
  // Vérifier si l'identifiant existe déjà
  if (body.identifier) {
    const { data: existingCategory } = await supabase
      .from('video_categories')
      .select('id')
      .eq('identifier', body.identifier)
      .maybeSingle();
      
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Une catégorie avec cet identifiant existe déjà' },
        { status: 400 }
      );
    }
  }
  
  // Initialiser les compteurs si non fournis
  if (body.finished_count === undefined) body.finished_count = 0;
  if (body.pending_count === undefined) body.pending_count = 0;
  if (body.ready_to_publish_count === undefined) body.ready_to_publish_count = 0;
  
  const { data, error } = await supabase
    .from('video_categories')
    .insert(body)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 