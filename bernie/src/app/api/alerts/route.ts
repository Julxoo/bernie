// src/app/api/alerts/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    // On définit un seuil à 7 jours
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 7);
    const isoThreshold = thresholdDate.toISOString();

    const { data: videos, error } = await supabase
      .from("category_videos")
      .select("id, title, production_status, updated_at")
      .neq("production_status", "Terminé")
      .lt("updated_at", isoThreshold);

    if (error) throw error;
    return NextResponse.json(videos);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Erreur dans l'API alerts :", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
