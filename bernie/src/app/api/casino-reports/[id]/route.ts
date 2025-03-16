// src/app/api/casino-reports/[id]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data, error } = await supabase
      .from('casino_reports')
      .select('*')
      .eq('id', params.id)
      .single();
      
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { error } = await supabase
      .from('casino_reports')
      .delete()
      .eq('id', params.id);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const data = await request.json();
  
  try {
    const { data: result, error } = await supabase
      .from('casino_reports')
      .update(data)
      .eq('id', params.id)
      .select();
      
    if (error) throw error;
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}