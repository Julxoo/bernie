// src/app/api/stats/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Définition d'une interface pour les vidéos récupérées
interface Video {
  production_status: string;
}

// Interface pour les statistiques calculées
interface Stats {
  toDo: number;
  inProgress: number;
  readyToPublish: number;
  finished: number;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Récupération de la colonne production_status de la table category_videos
    const { data: videos, error } = await supabase
      .from("category_videos")
      .select("production_status");
      
    if (error) throw error;

    const videoList: Video[] = videos ?? [];

    // Calcul des compteurs en typant l'accumulateur
    const stats: Stats = videoList.reduce((acc: Stats, video: Video) => {
      const status = video.production_status;
      if (status === "À monter") acc.toDo += 1;
      else if (status === "En cours") acc.inProgress += 1;
      else if (status === "Prêt à publier") acc.readyToPublish += 1;
      else if (status === "Terminé") acc.finished += 1;
      return acc;
    }, { toDo: 0, inProgress: 0, readyToPublish: 0, finished: 0 });

    return NextResponse.json(stats);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Erreur dans l'API stats :", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
