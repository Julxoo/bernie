/**
 * Types pour les paramètres du formulaire de connexion
 */
export interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Types pour les paramètres du formulaire de réinitialisation de mot de passe
 */
export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

/**
 * Types pour les paramètres du formulaire de mise à jour de profil
 */
export interface UpdateProfileFormData {
  fullName: string;
}

/**
 * Types pour les paramètres du formulaire de mise à jour de mot de passe
 */
export interface UpdatePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Types pour les profils utilisateur
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
} 