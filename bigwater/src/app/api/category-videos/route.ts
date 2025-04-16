import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const status = searchParams.get('status');
  
  let query = supabase.from('category_videos').select('*');
  
  if (categoryId) query = query.eq('category_id', categoryId);
  if (status) query = query.eq('production_status', status);
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('category_videos')
    .insert(body)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 