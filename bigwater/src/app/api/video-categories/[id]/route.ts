import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  const supabase = await createClient();
  const id = context.params.id;
  
  const { data, error } = await supabase
    .from('video_categories')
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
  const supabase = await createClient();
  const id = context.params.id;
  const body = await request.json();
  
  // Vérifier si l'identifiant est changé et s'il est déjà utilisé
  if (body.identifier) {
    const { data: existingCategory } = await supabase
      .from('video_categories')
      .select('id')
      .eq('identifier', body.identifier)
      .neq('id', id)
      .maybeSingle();
      
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Une catégorie avec cet identifiant existe déjà' },
        { status: 400 }
      );
    }
  }
  
  const { data, error } = await supabase
    .from('video_categories')
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
  const supabase = await createClient();
  const id = context.params.id;
  
  // Vérifier si des vidéos sont associées à cette catégorie
  const { data: relatedVideos, error: checkError } = await supabase
    .from('category_videos')
    .select('id')
    .eq('category_id', id)
    .limit(1);
    
  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }
  
  if (relatedVideos && relatedVideos.length > 0) {
    return NextResponse.json(
      { error: 'Impossible de supprimer cette catégorie car des vidéos y sont associées' },
      { status: 400 }
    );
  }
  
  const { error } = await supabase
    .from('video_categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 