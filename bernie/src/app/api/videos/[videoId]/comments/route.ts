import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

const commentSchema = z.object({
  comment: z.string().min(1, "Le commentaire ne peut être vide"),
});

export async function GET(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: comments, error } = await supabase
      .from("video_comments")
      .select("id, comment, created_at, user_id")
      .eq("video_id", Number(params.videoId))
      .order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json(comments);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }
    const { comment } = parsed.data;
    const { data, error } = await supabase
      .from("video_comments")
      .insert([
        {
          video_id: Number(params.videoId),
          user_id: session.user.id,
          comment,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
