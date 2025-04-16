import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  const supabase = await createClient();
  const id = context.params.id;
  
  const { data, error } = await supabase
    .from('category_videos')
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
  
  const { data, error } = await supabase
    .from('category_videos')
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
  
  const { error } = await supabase
    .from('category_videos')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 