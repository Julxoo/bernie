/**
 * Fichier de constantes globales pour l'application
 */

// Couleurs de l'application
export const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  // Ajouter d'autres palettes de couleurs au besoin
};

// Configuration des routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  VIDEOS: '/dashboard/videos',
  CATEGORIES: '/dashboard/categories',
  PROFILE: '/dashboard/profile',
  ADMIN: '/dashboard/admin',
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

// Autres constantes globales
export const APP_NAME = 'BigWater';
export const DEFAULT_LOCALE = 'fr';
export const API_PAGE_SIZE = 20;
