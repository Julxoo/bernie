// src/app/api/priorities/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface Video {
  id: number;
  title: string;
  production_status: string;
  updated_at: string;
}

interface PrioritizedVideo extends Video {
  priority: number;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Récupérer toutes les vidéos dont le statut n'est pas "Terminé"
    const { data: videos, error } = await supabase
      .from("category_videos")
      .select("id, title, production_status, updated_at")
      .neq("production_status", "Terminé");

    if (error) throw error;

    const now = new Date();
    const videoList: Video[] = videos ?? [];

    const prioritizedVideos: PrioritizedVideo[] = videoList.map((video) => {
      const updatedAt = new Date(video.updated_at);
      const diffInMs = now.getTime() - updatedAt.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      return {
        ...video,
        priority: Math.round(diffInDays),
      };
    });

    prioritizedVideos.sort((a, b) => b.priority - a.priority);

    return NextResponse.json(prioritizedVideos);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    console.error("Erreur dans l'API priorités :", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
