import { VideoDetails } from '@/types/api';

/**
 * Récupère tous les détails de vidéos avec filtrage optionnel
 * @param categoryVideoId - Filtre par ID de vidéo de catégorie (optionnel)
 * @param status - Filtre par statut de production (optionnel)
 * @returns Un tableau de VideoDetails
 */
export async function getVideoDetails(categoryVideoId?: number, status?: string): Promise<VideoDetails[]> {
  const queryParams = new URLSearchParams();
  
  if (categoryVideoId) queryParams.append('categoryVideoId', categoryVideoId.toString());
  if (status) queryParams.append('status', status);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await fetch(`/api/video-details${queryString}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des détails de vidéos');
  }
  
  return response.json();
}

/**
 * Récupère les détails d'une vidéo spécifique par son ID
 * @param id - ID des détails de la vidéo
 * @returns Les détails de la vidéo
 */
export async function getVideoDetail(id: number): Promise<VideoDetails> {
  const response = await fetch(`/api/video-details/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des détails de la vidéo');
  }
  
  return response.json();
}

/**
 * Crée de nouveaux détails de vidéo
 * @param data - Données des nouveaux détails
 * @returns Les détails créés
 */
export async function createVideoDetail(data: Partial<VideoDetails>): Promise<VideoDetails> {
  const response = await fetch('/api/video-details', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création des détails de vidéo');
  }
  
  return response.json();
}

/**
 * Met à jour les détails d'une vidéo existante
 * @param id - ID des détails à mettre à jour
 * @param data - Nouvelles données pour les détails
 * @returns Les détails mis à jour
 */
export async function updateVideoDetail(id: number, data: Partial<VideoDetails>): Promise<VideoDetails> {
  const response = await fetch(`/api/video-details/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour des détails de vidéo');
  }
  
  return response.json();
}

/**
 * Supprime les détails d'une vidéo
 * @param id - ID des détails à supprimer
 * @returns void
 */
export async function deleteVideoDetail(id: number): Promise<void> {
  const response = await fetch(`/api/video-details/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression des détails de vidéo');
  }
} 