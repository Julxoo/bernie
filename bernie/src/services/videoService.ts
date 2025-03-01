import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Video } from "../types/video";

const supabase = createClientComponentClient();

// Interface décrivant la structure attendue des données retournées par Supabase
interface VideoDetailsResult {
  id: number;
  identifier: number;
  title: string;
  production_status: string;
  created_at: string;
  updated_at: string;
  video_details: Array<{
    title: string;
    instructions_miniature: string;
    rush_link: string;
    video_link: string;
    miniature_link: string;
    production_status: string;
    description: string;
  }>;
  video_categories: { identifier: string }[] | null;
}

/**
 * Met à jour un champ donné dans les tables "category_videos" et "video_details".
 * @param id - L'ID de la vidéo.
 * @param field - Le nom du champ à mettre à jour.
 * @param value - La nouvelle valeur.
 */
const updateFieldAcrossTables = async (
  id: string,
  field: string,
  value: string
): Promise<void> => {
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
    .select(
      `
      id,
      identifier,
      title,
      production_status,
      created_at,
      updated_at,
      video_details (
        title,
        instructions_miniature,
        rush_link,
        video_link,
        miniature_link,
        production_status,
        description
      ),
      video_categories!fk_category (identifier)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erreur Supabase dans fetchVideoDetails :", error);
    throw error;
  }
  if (!data) {
    throw new Error("Détails de la vidéo introuvables");
  }

  // Conversion via unknown pour ensuite le caster en VideoDetailsResult
  const parsedData = data as unknown as VideoDetailsResult;
  const { video_categories, video_details, ...rest } = parsedData;
  const categoryIdentifier =
    video_categories && video_categories.length > 0
      ? video_categories[0].identifier
      : "";
  const numericIdentifier = parsedData.identifier || 0;
  const fullIdentifier = `${categoryIdentifier}-${numericIdentifier}`;

  return {
    ...rest,
    ...(video_details ? video_details[0] : {}),
    fullIdentifier,
  } as Video;
};

export const updateTitle = async (
  id: string,
  newTitle: string
): Promise<void> => {
  await updateFieldAcrossTables(id, "title", newTitle);
};

export const updateDescription = async (
  id: string,
  newDescription: string
): Promise<void> => {
  const { error } = await supabase
    .from("video_details")
    .update({ description: newDescription })
    .eq("category_video_id", id);
  if (error) {
    throw new Error("Erreur lors de la mise à jour de la description");
  }
};

export const updateInstructions = async (
  id: string,
  newInstructions: string
): Promise<void> => {
  const { error } = await supabase
    .from("video_details")
    .update({ instructions_miniature: newInstructions })
    .eq("category_video_id", id);
  if (error) {
    throw new Error("Erreur lors de la mise à jour des instructions");
  }
};

export const updateLink = async (
  id: string,
  field: string,
  value: string
): Promise<void> => {
  const { error } = await supabase
    .from("video_details")
    .update({ [field]: value })
    .eq("category_video_id", id);
  if (error) {
    throw new Error(`Erreur lors de la mise à jour du lien "${field}"`);
  }
};

export const updateStatus = async (
  id: string,
  newStatus: string
): Promise<void> => {
  await updateFieldAcrossTables(id, "production_status", newStatus);
};
