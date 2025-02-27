import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Video } from "../types/video";

const supabase = createClientComponentClient();

export const fetchVideoDetails = async (id: string): Promise<Video> => {
  const { data, error } = await supabase
    .from("category_videos")
    .select(`
      *,
      video_details (
        title,
        instructions_miniature,
        rush_link,
        video_link,
        miniature_link,
        production_status,
        description
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erreur Supabase dans fetchVideoDetails :", error);
    throw error;
  }

  if (!data?.video_details || !data.video_details[0]) {
    throw new Error("Détails de la vidéo introuvables");
  }

  return { ...data, ...data.video_details[0] } as Video;
};

export const updateTitle = async (id: string, newTitle: string): Promise<void> => {
  const updates = await Promise.all([
    supabase.from("category_videos").update({ title: newTitle }).eq("id", id),
    supabase.from("video_details").update({ title: newTitle }).eq("category_video_id", id)
  ]);
  if (updates.some(({ error }) => error)) {
    throw new Error("Erreur lors de la mise à jour du titre");
  }
};

export const updateDescription = async (id: string, newDescription: string): Promise<void> => {
  const { error } = await supabase
    .from("video_details")
    .update({ description: newDescription })
    .eq("category_video_id", id);
  if (error) {
    throw new Error("Erreur lors de la mise à jour de la description");
  }
};

export const updateInstructions = async (id: string, newInstructions: string): Promise<void> => {
  const { error } = await supabase
    .from("video_details")
    .update({ instructions_miniature: newInstructions })
    .eq("category_video_id", id);
  if (error) {
    throw new Error("Erreur lors de la mise à jour des instructions");
  }
};

export const updateLink = async (id: string, field: string, value: string): Promise<void> => {
  const { error } = await supabase
    .from("video_details")
    .update({ [field]: value })
    .eq("category_video_id", id);
  if (error) {
    throw new Error(`Erreur lors de la mise à jour du lien ${field}`);
  }
};

export const updateStatus = async (id: string, newStatus: string): Promise<void> => {
  const updates = await Promise.all([
    supabase.from("category_videos").update({ production_status: newStatus }).eq("id", id),
    supabase.from("video_details").update({ production_status: newStatus }).eq("category_video_id", id)
  ]);
  if (updates.some(({ error }) => error)) {
    throw new Error("Erreur lors de la mise à jour du statut");
  }
};
