// src/app/api/admin/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Ici, mettez la logique de votre API pour les admins
  return NextResponse.json({ message: "Bienvenue dans l'API d'administration" });
}
