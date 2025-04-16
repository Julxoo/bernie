import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  // Récupérer les paramètres de filtrage
  const userId = searchParams.get('userId');
  const actionType = searchParams.get('actionType');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  
  // Construire la requête
  let query = supabase.from('user_activity').select('*');
  
  if (userId) query = query.eq('user_id', userId);
  if (actionType) query = query.eq('action_type', actionType);
  if (fromDate) query = query.gte('created_at', fromDate);
  if (toDate) query = query.lte('created_at', toDate);
  
  // Ordonner par date décroissante
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  
  // S'assurer que created_at est défini si non fourni
  if (!body.created_at) {
    body.created_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('user_activity')
    .insert(body)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 