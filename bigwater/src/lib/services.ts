import type { VideoCategory, CategoryVideo, VideoDetails, VideoStatus } from '@/types/api';

import { createClient } from '@/lib/client';

const supabase = createClient();

export const videoService = {
  supabase,
  
  // Récupérer toutes les catégories
  async getCategories() {
    const { data, error } = await supabase
      .from('video_categories')
      .select('*, category_videos(id, title, identifier)')
      .order('identifier', { ascending: true });

    if (error) throw error;
    return data as (VideoCategory & { category_videos: { id: number; title: string; identifier: number | null }[] })[];
  },

  // Récupérer les vidéos d'une catégorie
  async getCategoryVideos(categoryId: number) {
    const { data, error } = await supabase
      .from('category_videos')
      .select(`
        *,
        video_details (*)
      `)
      .eq('category_id', categoryId)
      .order('identifier', { ascending: true });

    if (error) throw error;
    return data as (CategoryVideo & { video_details: VideoDetails })[];
  },

  // Récupérer les détails d'une vidéo
  async getVideoDetails(videoId: number) {
    const { data, error } = await supabase
      .from('video_details')
      .select('*')
      .eq('category_video_id', videoId)
      .single();

    if (error) throw error;
    return data as VideoDetails;
  },

  // Mettre à jour le statut d'une vidéo
  async updateVideoStatus(videoId: number, status: string) {
    const { data, error } = await supabase
      .from('category_videos')
      .update({ production_status: status })
      .eq('id', videoId)
      .select()
      .single();

    if (error) throw error;
    return data as CategoryVideo;
  },

  // Mettre à jour le titre d'une vidéo
  async updateVideoTitle(videoId: number, title: string) {
    // Mise à jour dans category_videos
    const { error: videoError } = await supabase
      .from('category_videos')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', videoId);

    if (videoError) throw videoError;

    // Mise à jour dans video_details
    const { data, error: detailsError } = await supabase
      .from('video_details')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('category_video_id', videoId)
      .select()
      .single();

    if (detailsError) throw detailsError;
    return data as VideoDetails;
  },

  // Mettre à jour la description d'une vidéo
  async updateVideoDescription(videoId: number, description: string) {
    const { data, error } = await supabase
      .from('video_details')
      .update({ description, updated_at: new Date().toISOString() })
      .eq('category_video_id', videoId)
      .select()
      .single();

    if (error) throw error;
    return data as VideoDetails;
  },

  // Mettre à jour les instructions de miniature
  async updateVideoInstructions(videoId: number, instructions: string) {
    const { data, error } = await supabase
      .from('video_details')
      .update({ instructions_miniature: instructions, updated_at: new Date().toISOString() })
      .eq('category_video_id', videoId)
      .select()
      .single();

    if (error) throw error;
    return data as VideoDetails;
  },

  // Mettre à jour un lien (rush, vidéo ou miniature)
  async updateVideoLink(videoId: number, linkType: 'rush_link' | 'video_link' | 'miniature_link', url: string) {
    const { data, error } = await supabase
      .from('video_details')
      .update({ [linkType]: url, updated_at: new Date().toISOString() })
      .eq('category_video_id', videoId)
      .select()
      .single();

    if (error) throw error;
    return data as VideoDetails;
  },

  // Mettre à jour le titre d'une catégorie
  async updateCategoryTitle(categoryId: number, title: string) {
    const { data, error } = await supabase
      .from('video_categories')
      .update({ title, last_updated: new Date().toISOString() })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data as VideoCategory;
  },

  // Créer une nouvelle vidéo avec ses détails
  async createNewVideo(
    categoryId: number, 
    videoData: {
      title: string;
      production_status: VideoStatus;
      description?: string;
      rush_link?: string;
      video_link?: string;
      miniature_link?: string;
      instructions_miniature?: string;
    }
  ) {
    // 1. Obtenir le prochain identifiant pour cette catégorie
    const { data: categoryVideos, error: countError } = await supabase
      .from("category_videos")
      .select("identifier")
      .eq("category_id", categoryId)
      .order("identifier", { ascending: false })
      .limit(1);

    if (countError) throw countError;

    const nextIdentifier = categoryVideos.length > 0 && categoryVideos[0].identifier
      ? (categoryVideos[0].identifier + 1)
      : 1;

    // 2. Insérer la vidéo dans category_videos
    const { data: newVideo, error: videoError } = await supabase
      .from("category_videos")
      .insert({
        category_id: categoryId,
        title: videoData.title,
        production_status: videoData.production_status,
        identifier: nextIdentifier,
      })
      .select()
      .single();

    if (videoError) throw videoError;

    // 3. Insérer les détails de la vidéo
    const { data: videoDetails, error: detailsError } = await supabase
      .from("video_details")
      .insert({
        category_video_id: newVideo.id,
        title: videoData.title,
        description: videoData.description || null,
        production_status: videoData.production_status,
        rush_link: videoData.rush_link || null,
        video_link: videoData.video_link || null,
        miniature_link: videoData.miniature_link || null,
        instructions_miniature: videoData.instructions_miniature || null,
      })
      .select()
      .single();

    if (detailsError) throw detailsError;

    return { ...newVideo, video_details: videoDetails };
  }
};

export const categoryService = {
  supabase,
  
  // Récupérer toutes les catégories
  async getCategories() {
    const { data, error } = await supabase
      .from('video_categories')
      .select('*, category_videos(id, title, identifier)')
      .order('identifier', { ascending: true });

    if (error) throw error;
    return data as (VideoCategory & { category_videos: { id: number; title: string; identifier: number | null }[] })[];
  },
  
  // Créer une nouvelle catégorie
  async createCategory(title: string) {
    // 1. Obtenir le prochain identifiant pour les catégories
    const { data: categories, error: countError } = await supabase
      .from("video_categories")
      .select("identifier")
      .order("identifier", { ascending: false })
      .limit(1);

    if (countError) throw countError;

    const nextIdentifier = categories.length > 0 ? (categories[0].identifier + 1) : 1;

    // 2. Insérer la nouvelle catégorie
    const { data, error } = await supabase
      .from("video_categories")
      .insert({
        title,
        identifier: nextIdentifier,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as VideoCategory;
  },
  
  // Mettre à jour le titre d'une catégorie
  async updateCategoryTitle(categoryId: number, title: string) {
    const { data, error } = await supabase
      .from('video_categories')
      .update({ title, last_updated: new Date().toISOString() })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data as VideoCategory;
  },
  
  // Supprimer une catégorie
  async deleteCategory(categoryId: number) {
    // Note: Cette fonction suppose que les contraintes de clé étrangère sont configurées
    // pour supprimer en cascade les enregistrements connexes dans les autres tables
    const { error } = await supabase
      .from('video_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    return { success: true };
  }
}; 