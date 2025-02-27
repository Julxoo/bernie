import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";
import { z } from "zod";

// Schéma de validation pour la création d'une vidéo
const videoSchema = z.object({
  category_id: z.number(),
  title: z.string().min(1, "Le titre est requis"),
  production_status: z.enum(["À monter", "Miniature à faire", "En validation", "Prête à exporter"]),
  instructions_miniature: z.string().optional(),
  rush_link: z.string().url().optional(),
  video_link: z.string().url().optional(),
  miniature_link: z.string().url().optional(),
});

// Pour la mise à jour, toutes les propriétés sont optionnelles sauf category_id
const videoUpdateSchema = videoSchema.partial().extend({
  category_id: z.number()
});

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const videoId = searchParams.get("id");

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    let query = supabase
      .from("category_videos")
      .select(`
        *,
        video_details (*)
      `);

    if (videoId) {
      query = query.eq("id", videoId);
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des vidéos:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsedData = videoSchema.parse(body);

    // Commencer une transaction
    const { data: categoryVideo, error: categoryVideoError } = await supabase
      .from("category_videos")
      .insert({
        category_id: parsedData.category_id,
        title: parsedData.title,
        production_status: parsedData.production_status
      })
      .select()
      .single();

    if (categoryVideoError) throw categoryVideoError;

    // Créer les détails de la vidéo
    const { data: videoDetails, error: videoDetailsError } = await supabase
      .from("video_details")
      .insert({
        category_video_id: categoryVideo.id,
        title: parsedData.title,
        instructions_miniature: parsedData.instructions_miniature,
        rush_link: parsedData.rush_link,
        video_link: parsedData.video_link,
        miniature_link: parsedData.miniature_link,
        production_status: parsedData.production_status
      })
      .select()
      .single();

    if (videoDetailsError) throw videoDetailsError;

    return NextResponse.json({
      categoryVideo,
      videoDetails
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création de la vidéo:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID requis pour la mise à jour" },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsedData = videoUpdateSchema.parse(body);

    // Mise à jour de category_videos
    const { error: categoryVideoError } = await supabase
      .from("category_videos")
      .update({
        title: parsedData.title,
        production_status: parsedData.production_status
      })
      .eq("id", id);

    if (categoryVideoError) throw categoryVideoError;

    // Mise à jour de video_details
    const { data: videoDetails, error: videoDetailsError } = await supabase
      .from("video_details")
      .update({
        title: parsedData.title,
        instructions_miniature: parsedData.instructions_miniature,
        rush_link: parsedData.rush_link,
        video_link: parsedData.video_link,
        miniature_link: parsedData.miniature_link,
        production_status: parsedData.production_status
      })
      .eq("category_video_id", id)
      .select();

    if (videoDetailsError) throw videoDetailsError;

    return NextResponse.json(videoDetails);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la vidéo:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID requis pour la suppression" },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // La suppression en cascade s'occupera de video_details
    const { error } = await supabase
      .from("category_videos")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la vidéo:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
