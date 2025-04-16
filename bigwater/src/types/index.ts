// Exporter tous les types du Dashboard
export * from './dashboard';

// Exporter tous les types d'authentification
export * from './auth';

// Exporter tous les types communs
export * from './common';

// Exporter tous les types d'API et Supabase
export * from './api';

// Note: Les types de database.ts sont déjà exportés via ./api
// export * from './database';

/**
 * Interface pour un élément d'activité sur le dashboard
 */
export interface ActivityItem {
  id: number;
  title: string;
  timestamp: string;
  action: string;
  resourceName: string;
  status?: string;
  userName?: string;
  userId?: string;
  changeType?: string;
}