interface Profile {
  id: string;
  email: string;
  role: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Récupère tous les profils avec filtrage optionnel
 * @param role - Filtre par rôle (optionnel)
 * @returns Un tableau de Profile
 */
export async function getProfiles(role?: string): Promise<Profile[]> {
  const queryParams = new URLSearchParams();
  
  if (role) queryParams.append('role', role);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await fetch(`/api/profiles${queryString}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des profils');
  }
  
  return response.json();
}

/**
 * Récupère un profil spécifique par son ID
 * @param id - ID du profil
 * @returns Les détails du profil
 */
export async function getProfile(id: string): Promise<Profile> {
  const response = await fetch(`/api/profiles/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération du profil');
  }
  
  return response.json();
}

/**
 * Crée un nouveau profil
 * @param data - Données du nouveau profil
 * @returns Le profil créé
 */
export async function createProfile(data: Partial<Profile>): Promise<Profile> {
  const response = await fetch('/api/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création du profil');
  }
  
  return response.json();
}

/**
 * Met à jour un profil existant
 * @param id - ID du profil à mettre à jour
 * @param data - Nouvelles données pour le profil
 * @returns Le profil mis à jour
 */
export async function updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
  const response = await fetch(`/api/profiles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour du profil');
  }
  
  return response.json();
}

/**
 * Supprime un profil
 * @param id - ID du profil à supprimer
 * @returns void
 */
export async function deleteProfile(id: string): Promise<void> {
  const response = await fetch(`/api/profiles/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression du profil');
  }
} 