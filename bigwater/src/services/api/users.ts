import { UserProfile } from "@/types/auth";

/**
 * Récupère tous les profils utilisateur avec filtrage optionnel
 * @param role - Filtre par rôle (optionnel)
 * @returns Un tableau de UserProfile
 */
export async function getUsers(role?: string): Promise<UserProfile[]> {
  // Réutilise l'API profiles existante
  const queryParams = new URLSearchParams();
  
  if (role) queryParams.append('role', role);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await fetch(`/api/profiles${queryString}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la récupération des utilisateurs');
  }
  
  // Transformer les données reçues en UserProfile
  const profiles = await response.json();
  return profiles.map((profile: { id: string; name?: string; email?: string; role?: string }) => ({
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    role: profile.role || 'user'
  }));
}

/**
 * Crée un nouvel utilisateur avec authentification
 * @param data - Données du nouvel utilisateur, incluant password
 * @returns L'utilisateur créé
 */
export async function createUser(data: Partial<UserProfile & { password: string }>): Promise<UserProfile> {
  if (!data.password) {
    throw new Error('Le mot de passe est requis pour créer un utilisateur');
  }
  
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la création de l\'utilisateur');
  }
  
  const profile = await response.json();
  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    role: profile.role || 'user'
  };
}

/**
 * Met à jour un utilisateur existant, y compris le mot de passe si fourni
 * @param id - ID de l'utilisateur à mettre à jour
 * @param data - Nouvelles données, incluant le mot de passe si nécessaire
 * @returns L'utilisateur mis à jour
 */
export async function updateUser(id: string, data: Partial<UserProfile & { password?: string }>): Promise<UserProfile> {
  const response = await fetch('/api/auth/update-user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, ...data })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la mise à jour de l\'utilisateur');
  }
  
  const profile = await response.json();
  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    role: profile.role || 'user'
  };
}

/**
 * Supprime un utilisateur
 * @param id - ID de l'utilisateur à supprimer
 * @returns void
 */
export async function deleteUser(id: string): Promise<void> {
  // Réutilise l'API profiles existante pour la suppression
  const response = await fetch(`/api/profiles/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la suppression de l\'utilisateur');
  }
} 