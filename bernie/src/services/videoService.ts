import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Video } from "../types/video";

const supabase = createClientComponentClient();

/**
 * Met à jour un champ donné dans les tables "category_videos" et "video_details".
 * @param id - L'ID de la vidéo.
 * @param field - Le nom du champ à mettre à jour.
 * @param value - La nouvelle valeur.
 */
const updateFieldAcrossTables = async (id: string, field: string, value: string): Promise<void> => {
  const { error: errorVideo } = await supabase
    .from("category_videos")
    .update({ [field]: value })
    .eq("id", id);
  const { error: errorDetails } = await supabase
    .from("video_details")
    .update({ [field]: value })
    .eq("category_video_id", id);

  if (errorVideo || errorDetails) {
    throw new Error(`Erreur lors de la mise à jour du champ "${field}"`);
  }
};

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
  await updateFieldAcrossTables(id, "title", newTitle);
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
    throw new Error(`Erreur lors de la mise à jour du lien "${field}"`);
  }
};

export const updateStatus = async (id: string, newStatus: string): Promise<void> => {
  await updateFieldAcrossTables(id, "production_status", newStatus);
};
