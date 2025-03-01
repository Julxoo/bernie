import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface Video {
  id: number;
  created_at: string;
  updated_at: string;
  production_status: string;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: videos, error } = await supabase
      .from("category_videos")
      .select("id, created_at, updated_at, production_status")
      .eq("production_status", "Terminé");

    if (error) throw error;

    const videoList: Video[] = videos ?? [];

    let totalDays = 0;
    let count = 0;
    const monthlyCounts: Record<string, number> = {};

    videoList.forEach((video) => {
      const created = new Date(video.created_at);
      const updated = new Date(video.updated_at);
      const diffInDays =
        (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      totalDays += diffInDays;
      count++;

      const month = updated.toISOString().slice(0, 7);
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const avgProductionTime = count > 0 ? totalDays / count : 0;

    return NextResponse.json({
      avgProductionTime: avgProductionTime.toFixed(2),
      monthlyCounts,
      totalVideos: count,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erreur serveur";
    console.error("Erreur dans l'API performance :", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
