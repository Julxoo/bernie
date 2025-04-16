import { VideoCategory } from '@/types/api';

/**
 * Récupère toutes les catégories de vidéos avec filtrage optionnel
 * @param userId - Filtre par ID d'utilisateur (optionnel)
 * @returns Un tableau de VideoCategory
 */
export async function getVideoCategories(userId?: string): Promise<VideoCategory[]> {
  const queryParams = new URLSearchParams();
  
  if (userId) queryParams.append('userId', userId);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  // Pour les appels côté serveur, nous devons utiliser une URL absolue
  // En environnement serveur, l'URL relative ne fonctionne pas correctement
  let url = `/api/video-categories${queryString}`;
  
  if (typeof window === 'undefined') {
    // Côté serveur: utiliser l'URL du serveur
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    url = `${protocol}://${host}${url}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des catégories de vidéos');
  }
  
  return response.json();
}

/**
 * Récupère une catégorie de vidéo spécifique par son ID
 * @param id - ID de la catégorie
 * @returns Les détails de la catégorie
 */
export async function getVideoCategory(id: number): Promise<VideoCategory> {
  // Pour les appels côté serveur, nous devons utiliser une URL absolue
  let url = `/api/video-categories/${id}`;
  
  if (typeof window === 'undefined') {
    // Côté serveur: utiliser l'URL du serveur
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    url = `${protocol}://${host}${url}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de la catégorie');
  }
  
  return response.json();
}

/**
 * Crée une nouvelle catégorie de vidéo
 * @param data - Données de la nouvelle catégorie
 * @returns La catégorie créée
 */
export async function createVideoCategory(data: Partial<VideoCategory>): Promise<VideoCategory> {
  // Pour les appels côté serveur, nous devons utiliser une URL absolue
  let url = `/api/video-categories`;
  
  if (typeof window === 'undefined') {
    // Côté serveur: utiliser l'URL du serveur
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    url = `${protocol}://${host}${url}`;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de la catégorie de vidéo');
  }
  
  return response.json();
}

/**
 * Met à jour une catégorie de vidéo existante
 * @param id - ID de la catégorie à mettre à jour
 * @param data - Nouvelles données pour la catégorie
 * @returns La catégorie mise à jour
 */
export async function updateVideoCategory(id: number, data: Partial<VideoCategory>): Promise<VideoCategory> {
  // Pour les appels côté serveur, nous devons utiliser une URL absolue
  let url = `/api/video-categories/${id}`;
  
  if (typeof window === 'undefined') {
    // Côté serveur: utiliser l'URL du serveur
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    url = `${protocol}://${host}${url}`;
  }
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de la catégorie de vidéo');
  }
  
  return response.json();
}

/**
 * Supprime une catégorie de vidéo
 * @param id - ID de la catégorie à supprimer
 * @returns void
 */
export async function deleteVideoCategory(id: number): Promise<void> {
  // Pour les appels côté serveur, nous devons utiliser une URL absolue
  let url = `/api/video-categories/${id}`;
  
  if (typeof window === 'undefined') {
    // Côté serveur: utiliser l'URL du serveur
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    url = `${protocol}://${host}${url}`;
  }
  
  const response = await fetch(url, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de la catégorie de vidéo');
  }
} 