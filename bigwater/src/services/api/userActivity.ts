interface UserActivity {
  id: string;
  user_id: string;
  action_type: string;
  entity_type?: string;
  entity_id?: string;
  details?: object;
  created_at: string;
}

/**
 * Récupère toutes les activités utilisateur avec filtrage optionnel
 * @param userId - Filtre par ID d'utilisateur (optionnel)
 * @param actionType - Filtre par type d'action (optionnel)
 * @param fromDate - Filtre par date de début (optionnel)
 * @param toDate - Filtre par date de fin (optionnel)
 * @returns Un tableau de UserActivity
 */
export async function getUserActivities(
  userId?: string, 
  actionType?: string, 
  fromDate?: string, 
  toDate?: string
): Promise<UserActivity[]> {
  const queryParams = new URLSearchParams();
  
  if (userId) queryParams.append('userId', userId);
  if (actionType) queryParams.append('actionType', actionType);
  if (fromDate) queryParams.append('fromDate', fromDate);
  if (toDate) queryParams.append('toDate', toDate);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await fetch(`/api/user-activity${queryString}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des activités utilisateur');
  }
  
  return response.json();
}

/**
 * Récupère une activité utilisateur spécifique par son ID
 * @param id - ID de l'activité
 * @returns Les détails de l'activité
 */
export async function getUserActivity(id: string): Promise<UserActivity> {
  const response = await fetch(`/api/user-activity/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération de l\'activité utilisateur');
  }
  
  return response.json();
}

/**
 * Enregistre une nouvelle activité utilisateur
 * @param data - Données de la nouvelle activité
 * @returns L'activité créée
 */
export async function createUserActivity(data: Partial<UserActivity>): Promise<UserActivity> {
  const response = await fetch('/api/user-activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'enregistrement de l\'activité utilisateur');
  }
  
  return response.json();
}

/**
 * Supprime une activité utilisateur
 * @param id - ID de l'activité à supprimer
 * @returns void
 */
export async function deleteUserActivity(id: string): Promise<void> {
  const response = await fetch(`/api/user-activity/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de l\'activité utilisateur');
  }
} 