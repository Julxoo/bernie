import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  
  const { data, error } = await supabase
    .from('video_details')
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  const body = await request.json();
  
  // Si category_video_id est fourni, vérifier qu'il existe
  if (body.category_video_id) {
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
  }
  
  // Mettre à jour le timestamp updated_at
  body.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('video_details')
    .update(body)
    .eq('id', id)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  
  const { error } = await supabase
    .from('video_details')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 