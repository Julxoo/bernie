// Index file for src/services/api

export * from './categoryVideos';
export * from './videoDetails';
export * from './videoCategories';
export * from './profiles';
export * from './userActivity';

// Réexporter les services existants pour compatibilité
export { videoService, categoryService } from '@/lib/services';


