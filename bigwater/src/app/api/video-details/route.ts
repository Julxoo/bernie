import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  // Récupérer les paramètres de filtrage
  const categoryVideoId = searchParams.get('categoryVideoId');
  const status = searchParams.get('status');
  
  // Construire la requête
  let query = supabase.from('video_details').select('*');
  
  if (categoryVideoId) query = query.eq('category_video_id', categoryVideoId);
  if (status) query = query.eq('production_status', status);
  
  // Ordonner par date de mise à jour décroissante
  query = query.order('updated_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  
  // Vérifier si la vidéo de catégorie existe
  const { data: categoryVideo, error: checkError } = await supabase
    .from('category_videos')
    .select('id')
    .eq('id', body.category_video_id)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }
  
  if (!categoryVideo) {
    return NextResponse.json(
      { error: 'La vidéo de catégorie spécifiée n\'existe pas' },
      { status: 400 }
    );
  }
  
  // Ajouter les timestamps si non fournis
  const now = new Date().toISOString();
  if (!body.created_at) body.created_at = now;
  if (!body.updated_at) body.updated_at = now;
  
  const { data, error } = await supabase
    .from('video_details')
    .insert(body)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 