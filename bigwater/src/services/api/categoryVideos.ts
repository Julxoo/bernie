import { CategoryVideo } from '@/types/api';

/**
 * Récupère toutes les vidéos de catégorie avec filtrage optionnel
 * @param categoryId - Filtre par ID de catégorie (optionnel)
 * @param status - Filtre par statut de production (optionnel)
 * @returns Un tableau de CategoryVideo
 */
export async function getCategoryVideos(categoryId?: number, status?: string): Promise<CategoryVideo[]> {
  const queryParams = new URLSearchParams();
  
  if (categoryId) queryParams.append('categoryId', categoryId.toString());
  if (status) queryParams.append('status', status);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  // Vérifier si nous sommes côté client ou serveur
  const isClient = typeof window !== 'undefined';
  const baseUrl = isClient ? window.location.origin : '';
  
  const response = await fetch(`${baseUrl}/api/category-videos${queryString}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des vidéos de catégorie');
  }
  
  return response.json();
}

/**
 * Récupère une vidéo de catégorie spécifique par son ID
 * @param id - ID de la vidéo de catégorie
 * @returns Les détails de la vidéo de catégorie
 */
export async function getCategoryVideo(id: number): Promise<CategoryVideo> {
  // Vérifier si nous sommes côté client ou serveur
  const isClient = typeof window !== 'undefined';
  const baseUrl = isClient ? window.location.origin : '';
  
  const response = await fetch(`${baseUrl}/api/category-videos/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de la vidéo de catégorie');
  }
  
  return response.json();
}

/**
 * Crée une nouvelle vidéo de catégorie
 * @param data - Données de la nouvelle vidéo
 * @returns La vidéo créée
 */
export async function createCategoryVideo(data: Partial<CategoryVideo>): Promise<CategoryVideo> {
  // Vérifier si nous sommes côté client ou serveur
  const isClient = typeof window !== 'undefined';
  const baseUrl = isClient ? window.location.origin : '';
  
  const response = await fetch(`${baseUrl}/api/category-videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de la vidéo de catégorie');
  }
  
  return response.json();
}

/**
 * Met à jour une vidéo de catégorie existante
 * @param id - ID de la vidéo à mettre à jour
 * @param data - Nouvelles données pour la vidéo
 * @returns La vidéo mise à jour
 */
export async function updateCategoryVideo(id: number, data: Partial<CategoryVideo>): Promise<CategoryVideo> {
  // Vérifier si nous sommes côté client ou serveur
  const isClient = typeof window !== 'undefined';
  const baseUrl = isClient ? window.location.origin : '';
  
  const response = await fetch(`${baseUrl}/api/category-videos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de la vidéo de catégorie');
  }
  
  return response.json();
}

/**
 * Supprime une vidéo de catégorie
 * @param id - ID de la vidéo à supprimer
 * @returns void
 */
export async function deleteCategoryVideo(id: number): Promise<void> {
  // Vérifier si nous sommes côté client ou serveur
  const isClient = typeof window !== 'undefined';
  const baseUrl = isClient ? window.location.origin : '';
  
  const response = await fetch(`${baseUrl}/api/category-videos/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de la vidéo de catégorie');
  }
} 