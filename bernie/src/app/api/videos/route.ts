// src/app/api/videos/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Fonction utilitaire qui vérifie l'authentification avant d'exécuter le callback.
 */
const withAuth = async (req: Request, callback: (supabase: any) => Promise<NextResponse>) => {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  return callback(supabase);
};

const videoSchema = z.object({
  category_id: z.number(),
  title: z.string().min(1, "Le titre est requis"),
  production_status: z.enum(["À monter", "Miniature à faire", "En validation", "Prête à exporter"]),
  instructions_miniature: z.string().optional(),
  rush_link: z.string().url().optional(),
  video_link: z.string().url().optional(),
  miniature_link: z.string().url().optional(),
});

const videoUpdateSchema = videoSchema.partial().extend({
  category_id: z.number()
});

export async function GET(request: Request) {
  return withAuth(request, async (supabase) => {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const videoId = searchParams.get("id");

    let query = supabase
      .from("category_videos")
      .select(`*, video_details (*)`);

    if (videoId) {
      query = query.eq("id", videoId);
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  });
}
