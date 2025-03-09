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
  category_id: number;
  video_details: Array<{
    title: string;
    instructions_miniature: string;
    rush_link: string;
    video_link: string;
    miniature_link: string;
    production_status: string;
    description: string;
  }>;
  // On accepte que Supabase renvoie soit un tableau, soit un objet unique pour la catégorie
  video_categories: { identifier: string }[] | { identifier: string } | null;
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

/**
 * Récupère les détails d'une vidéo et construit le fullIdentifier sous la forme "A-1".
 * On récupère également category_id et production_status pour satisfaire l'interface Video.
 */
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
      category_id,
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

  const parsedData = data as unknown as VideoDetailsResult;
  const { video_details, ...rest } = parsedData;

  // Gestion de video_categories : tableau ou objet unique
  let categoryIdentifier = "";
  if (parsedData.video_categories) {
    if (Array.isArray(parsedData.video_categories)) {
      categoryIdentifier =
        parsedData.video_categories.length > 0
          ? parsedData.video_categories[0].identifier
          : "";
    } else {
      categoryIdentifier = parsedData.video_categories.identifier;
    }
  }
  const numericIdentifier = parsedData.identifier || 0;
  const fullIdentifier = `${categoryIdentifier}-${numericIdentifier}`;

  return {
    ...rest,
    ...(video_details ? video_details[0] : {}),
    fullIdentifier,
    category_id: rest.category_id,
    status: rest.production_status,
  } as Video;
};

/**
 * Met à jour le titre d'une vidéo et enregistre l'action dans user_activity.
 * @param userId - L'ID de l'utilisateur effectuant l'action.
 * @param id - L'ID de la vidéo.
 * @param newTitle - Le nouveau titre.
 */
export const updateTitle = async (
  userId: string,
  id: string,
  newTitle: string
): Promise<void> => {
  // 1. Met à jour le titre dans les deux tables
  await updateFieldAcrossTables(id, "title", newTitle);

  // 2. Enregistre un log dans la table user_activity
  const detailsText = `La vidéo ID=${id} a un nouveau titre: "${newTitle}"`;
  const { error: insertError } = await supabase
    .from("user_activity")
    .insert([
      {
        user_id: userId,
        action_type: "update_title",
        details: detailsText,
      },
    ]);
  if (insertError) {
    console.error("Impossible d'insérer le log:", insertError);
  }
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
