import type { VideoCategory, CategoryVideo, VideoDetails, VideoStatus } from '@/types/api';

import { createClient } from '@/lib/client';

const supabase = createClient();

// Interface pour les vidéos simplifiées retournées par la requête des catégories
interface SimpleCategoryVideo {
  id: number;
  title: string;
  identifier: number | null;
  production_status: VideoStatus;
}

export const videoService = {
  supabase,
  
  // Récupérer toutes les catégories
  async getCategories() {
    const { data, error } = await supabase
      .from('video_categories')
      .select('*, category_videos(id, title, identifier, production_status)')
      .order('identifier', { ascending: true });

    if (error) throw error;
    
    // Calculer les vrais compteurs basés sur les vidéos associées
    const categoriesWithRealCounts = data.map((category) => {
      const videos = category.category_videos || [];
      const pending_count = videos.filter((v: SimpleCategoryVideo) => v.production_status === 'À monter').length;
      const finished_count = videos.filter((v: SimpleCategoryVideo) => v.production_status === 'Terminé').length;
      const ready_to_publish_count = videos.filter((v: SimpleCategoryVideo) => v.production_status === 'En cours').length;
      
      return {
        ...category,
        pending_count,
        finished_count, 
        ready_to_publish_count
      };
    });
    
    return categoriesWithRealCounts as (VideoCategory & { 
      category_videos: SimpleCategoryVideo[],
      pending_count: number,
      finished_count: number,
      ready_to_publish_count: number
    })[];
  },

  // Mettre à jour les compteurs réels dans la base de données pour toutes les catégories
  async updateAllCategoryCounts() {
    try {
      // 1. Récupérer toutes les catégories avec leurs vidéos
      const { data: categories, error } = await supabase
        .from('video_categories')
        .select('id, category_videos(production_status)')
        .order('id');
        
      if (error) throw error;
      
      // 2. Pour chaque catégorie, calculer et mettre à jour les compteurs
      const updates = categories.map(async (category) => {
        const videos = category.category_videos || [];
        const pending_count = videos.filter((v: { production_status: VideoStatus }) => v.production_status === 'À monter').length;
        const finished_count = videos.filter((v: { production_status: VideoStatus }) => v.production_status === 'Terminé').length;
        const ready_to_publish_count = videos.filter((v: { production_status: VideoStatus }) => v.production_status === 'En cours').length;
        
        // Mettre à jour la catégorie avec les compteurs calculés
        const { error: updateError } = await supabase
          .from('video_categories')
          .update({
            pending_count,
            finished_count,
            ready_to_publish_count,
            last_updated: new Date().toISOString()
          })
          .eq('id', category.id);
          
        if (updateError) throw updateError;
        
        return { id: category.id, success: true };
      });
      
      await Promise.all(updates);
      return { success: true, updated: categories.length };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des compteurs:', error);
      return { success: false, error };
    }
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
    // D'abord, obtenir la catégorie de la vidéo
    const { data: video, error: videoError } = await supabase
      .from('category_videos')
      .select('category_id')
      .eq('id', videoId)
      .single();
    
    if (videoError) throw videoError;
    
    const categoryId = video.category_id;
    
    // Mise à jour du statut
    const { data, error } = await supabase
      .from('category_videos')
      .update({ production_status: status })
      .eq('id', videoId)
      .select()
      .single();

    if (error) throw error;
    
    // Mettre à jour les compteurs pour cette catégorie
    await this._updateCategoryCounter(categoryId);
    
    return data as CategoryVideo;
  },

  // Fonction privée pour mettre à jour les compteurs d'une catégorie
  async _updateCategoryCounter(categoryId: number) {
    try {
      // 1. Récupérer toutes les vidéos de la catégorie
      const { data: videos, error: videosError } = await supabase
        .from('category_videos')
        .select('production_status')
        .eq('category_id', categoryId);
        
      if (videosError) throw videosError;
      
      // 2. Calculer les compteurs
      const pending_count = videos.filter((v: { production_status: VideoStatus }) => v.production_status === 'À monter').length;
      const finished_count = videos.filter((v: { production_status: VideoStatus }) => v.production_status === 'Terminé').length;
      const ready_to_publish_count = videos.filter((v: { production_status: VideoStatus }) => v.production_status === 'En cours').length;
      
      // 3. Mettre à jour la catégorie
      const { error: updateError } = await supabase
        .from('video_categories')
        .update({
          pending_count,
          finished_count,
          ready_to_publish_count,
          last_updated: new Date().toISOString()
        })
        .eq('id', categoryId);
        
      if (updateError) throw updateError;
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des compteurs:', error);
      return false;
    }
  },

  // Mettre à jour le titre d'une vidéo
  async updateVideoTitle(videoId: number, title: string) {
    // Obtenir la catégorie de la vidéo
    const { data: video, error: getVideoError } = await supabase
      .from('category_videos')
      .select('category_id')
      .eq('id', videoId)
      .single();
      
    if (getVideoError) throw getVideoError;
    
    const categoryId = video.category_id;
    
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
    
    // Mettre à jour les compteurs de la catégorie
    await this._updateCategoryCounter(categoryId);
    
    return data as VideoDetails;
  },

  // Fonction utilitaire pour vérifier et créer un enregistrement video_details si nécessaire
  async _ensureVideoDetailsExist(videoId: number, partialData: Partial<VideoDetails> = {}) {
    try {
      // Vérifier si les détails de vidéo existent
      const { data: existingDetails, error: checkError } = await supabase
        .from('video_details')
        .select('id')
        .eq('category_video_id', videoId)
        .maybeSingle();
  
      if (checkError) throw checkError;
      
      // Si les détails n'existent pas, créer un nouvel enregistrement
      if (!existingDetails) {
        // Récupérer les infos de base de la vidéo
        const { data: videoData, error: videoError } = await supabase
          .from('category_videos')
          .select('title, production_status')
          .eq('id', videoId)
          .single();
          
        if (videoError) throw videoError;
        
        // Insérer un nouvel enregistrement de détails
        const { data, error } = await supabase
          .from('video_details')
          .insert({
            category_video_id: videoId,
            title: videoData.title,
            production_status: videoData.production_status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...partialData
          })
          .select()
          .single();
          
        if (error) throw error;
        return { created: true, data: data as VideoDetails };
      }
      
      return { created: false, detailsId: existingDetails.id };
    } catch (error) {
      console.error("Erreur lors de la vérification/création des détails vidéo:", error);
      throw error;
    }
  },

  // Mettre à jour la description d'une vidéo
  async updateVideoDescription(videoId: number, description: string) {
    try {
      // Obtenir la catégorie de la vidéo
      const { data: video, error: getVideoError } = await supabase
        .from('category_videos')
        .select('category_id')
        .eq('id', videoId)
        .single();
        
      if (getVideoError) throw getVideoError;
      
      const categoryId = video.category_id;
      
      // Vérifier et créer l'enregistrement si nécessaire
      const result = await this._ensureVideoDetailsExist(videoId, { description });
      
      // Si l'enregistrement a été créé, retourner les données
      if (result.created) {
        // Mettre à jour les compteurs de la catégorie
        await this._updateCategoryCounter(categoryId);
        return result.data;
      }
      
      // Sinon, mettre à jour les détails existants
      const { data, error } = await supabase
        .from('video_details')
        .update({ description, updated_at: new Date().toISOString() })
        .eq('category_video_id', videoId)
        .select()
        .single();
  
      if (error) throw error;
      
      // Mettre à jour les compteurs de la catégorie
      await this._updateCategoryCounter(categoryId);
      
      return data as VideoDetails;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la description:", error);
      throw error;
    }
  },

  // Mettre à jour les instructions de miniature
  async updateVideoInstructions(videoId: number, instructions: string) {
    try {
      // Obtenir la catégorie de la vidéo
      const { data: video, error: getVideoError } = await supabase
        .from('category_videos')
        .select('category_id')
        .eq('id', videoId)
        .single();
        
      if (getVideoError) throw getVideoError;
      
      const categoryId = video.category_id;
      
      // Vérifier et créer l'enregistrement si nécessaire
      const result = await this._ensureVideoDetailsExist(videoId, { instructions_miniature: instructions });
      
      // Si l'enregistrement a été créé, retourner les données
      if (result.created) {
        // Mettre à jour les compteurs de la catégorie
        await this._updateCategoryCounter(categoryId);
        return result.data;
      }
      
      // Sinon, mettre à jour les détails existants
      const { data, error } = await supabase
        .from('video_details')
        .update({ instructions_miniature: instructions, updated_at: new Date().toISOString() })
        .eq('category_video_id', videoId)
        .select()
        .single();
  
      if (error) throw error;
      
      // Mettre à jour les compteurs de la catégorie
      await this._updateCategoryCounter(categoryId);
      
      return data as VideoDetails;
    } catch (error) {
      console.error("Erreur lors de la mise à jour des instructions:", error);
      throw error;
    }
  },

  // Mettre à jour un lien (rush, vidéo ou miniature)
  async updateVideoLink(videoId: number, linkType: 'rush_link' | 'video_link' | 'miniature_link', url: string) {
    try {
      // Obtenir la catégorie de la vidéo
      const { data: video, error: getVideoError } = await supabase
        .from('category_videos')
        .select('category_id')
        .eq('id', videoId)
        .single();
        
      if (getVideoError) throw getVideoError;
      
      const categoryId = video.category_id;
      
      // Vérifier et créer l'enregistrement si nécessaire
      const result = await this._ensureVideoDetailsExist(videoId, { [linkType]: url });
      
      // Si l'enregistrement a été créé, retourner les données
      if (result.created) {
        // Mettre à jour les compteurs de la catégorie
        await this._updateCategoryCounter(categoryId);
        return result.data;
      }
      
      // Sinon, mettre à jour les détails existants
      const { data, error } = await supabase
        .from('video_details')
        .update({ [linkType]: url, updated_at: new Date().toISOString() })
        .eq('category_video_id', videoId)
        .select()
        .single();
  
      if (error) throw error;
      
      // Mettre à jour les compteurs de la catégorie
      await this._updateCategoryCounter(categoryId);
      
      return data as VideoDetails;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du lien ${linkType}:`, error);
      throw error;
    }
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
    
    // 4. Mettre à jour les compteurs de la catégorie
    await this._updateCategoryCounter(categoryId);

    return { ...newVideo, video_details: videoDetails };
  },

  // Supprimer une vidéo
  async deleteVideo(videoId: number) {
    // D'abord, obtenir la catégorie de la vidéo
    const { data: video, error: videoError } = await supabase
      .from('category_videos')
      .select('category_id')
      .eq('id', videoId)
      .single();
      
    if (videoError) throw videoError;
    
    const categoryId = video.category_id;
    
    // Supprimer les détails de la vidéo
    const { error: detailsError } = await supabase
      .from('video_details')
      .delete()
      .eq('category_video_id', videoId);
      
    if (detailsError) throw detailsError;
    
    // Supprimer la vidéo elle-même
    const { error: deleteError } = await supabase
      .from('category_videos')
      .delete()
      .eq('id', videoId);
      
    if (deleteError) throw deleteError;
    
    // Mettre à jour les compteurs de la catégorie
    await this._updateCategoryCounter(categoryId);
    
    return true;
  }
};

export const categoryService = {
  supabase,
  
  // Récupérer toutes les catégories
  async getCategories() {
    const { data, error } = await supabase
      .from('video_categories')
      .select('*, category_videos(id, title, identifier, production_status)')
      .order('identifier', { ascending: true });

    if (error) throw error;
    
    // Calculer les vrais compteurs basés sur les vidéos associées
    const categoriesWithRealCounts = data.map((category) => {
      const videos = category.category_videos || [];
      const pending_count = videos.filter((v: SimpleCategoryVideo) => v.production_status === 'À monter').length;
      const finished_count = videos.filter((v: SimpleCategoryVideo) => v.production_status === 'Terminé').length;
      const ready_to_publish_count = videos.filter((v: SimpleCategoryVideo) => v.production_status === 'En cours').length;
      
      return {
        ...category,
        pending_count,
        finished_count, 
        ready_to_publish_count
      };
    });
    
    return categoriesWithRealCounts as (VideoCategory & { 
      category_videos: SimpleCategoryVideo[],
      pending_count: number,
      finished_count: number,
      ready_to_publish_count: number
    })[];
  },
  
  // Créer une nouvelle catégorie
  async createCategory(title: string) {
    // 1. Obtenir le prochain identifiant alphabétique pour les catégories
    const { data: categories, error: countError } = await supabase
      .from("video_categories")
      .select("identifier")
      .order("identifier", { ascending: false })
      .limit(1);

    if (countError) throw countError;

    let nextIdentifier;
    if (categories.length > 0) {
      // Extraire la première lettre de l'identifiant existant
      const lastIdentifier = categories[0].identifier.toString();
      const lastLetter = lastIdentifier.charAt(0);
      
      // Obtenir le code ASCII de la lettre et ajouter 1 pour obtenir la lettre suivante
      const nextLetterCode = lastLetter.charCodeAt(0) + 1;
      nextIdentifier = String.fromCharCode(nextLetterCode);
    } else {
      // Si aucune catégorie n'existe, commencer par 'A'
      nextIdentifier = 'A';
    }

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