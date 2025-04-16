/**
 * Interface pour les vidéos catégorisées
 */
export interface CategoryVideo {
  id: number;
  title: string;
  category_id: number;
  identifier: number | null;
  production_status: VideoStatus;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Interface pour les catégories de vidéos
 */
export interface VideoCategory {
  id: number;
  title: string;
  identifier: number;
  created_at: string | null;
  last_updated: string | null;
}

/**
 * Interface pour les activités utilisateur
 */
export interface UserActivity {
  id: number;
  user_id: string;
  action_type: string;
  details: string;
  created_at: string;
}

/**
 * Type pour les statuts de production
 */
export type ProductionStatus = 'À monter' | 'En cours' | 'Terminé';

/**
 * Interface pour les données historiques
 */
export interface HistoricalData {
  totalVideos: number;
  statusCounts: Record<ProductionStatus | string, number>;
  categories: number;
} 

export type VideoStatus = 'À monter' | 'En cours' | 'Terminé';

export interface Profile {
  id: string;
  email: string;
  role: string;
  name: string | null;
  created_at: string | null;
}

export interface VideoDetails {
  id: number;
  category_video_id: number;
  title: string;
  description: string | null;
  production_status: VideoStatus;
  rush_link: string | null;
  video_link: string | null;
  miniature_link: string | null;
  instructions_miniature: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserActivity {
  id: number;
  user_id: string;
  action_type: string;
  details: string;
  created_at: string;
}

export interface CasinoReport {
  id: number;
  user_id: string | null;
  template_id: number;
  template_name: string;
  day: number;
  month: string;
  year: number;
  date: string;
  created_at: string | null;
  data: Record<string, any>;
} 

export interface VideoDetails {
  id: number;
  category_video_id: number;
  title: string;
  description: string | null;
  production_status: VideoStatus;
  rush_link: string | null;
  video_link: string | null;
  miniature_link: string | null;
  instructions_miniature: string | null;
  created_at: string | null;
  updated_at: string | null;
}