import { useState, useEffect } from 'react';

import { createClient } from '@/services/supabase/client';
import { VideoCategory } from '@/types/api';

export type SearchResultType = 'video' | 'category';

export interface SearchResult {
  id: number;
  title: string;
  type: SearchResultType;
  url: string;
  identifier?: string | number;
  categoryInfo?: {
    id: number;
    title?: string;
    identifier?: string;
  };
}

interface CategorySearchResult {
  id: number;
  title: string;
  identifier?: string;
}

interface VideoSearchResult {
  id: number;
  title: string;
  identifier?: string;
  category_id: number;
  video_categories: VideoCategory;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function performSearch() {
      if (!query || query.length < 1) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Recherche dans les catégories
        const { data: categories, error: categoriesError } = await supabase
          .from('video_categories')
          .select('id, title, identifier')
          .or(`title.ilike.%${query}%, identifier.ilike.%${query}%`)
          .limit(5);

        if (categoriesError) {
          throw categoriesError;
        }

        // Recherche dans les vidéos par titre
        const { data: videosByTitle, error: videosTitleError } = await supabase
          .from('category_videos')
          .select(`
            id, 
            title, 
            identifier, 
            category_id,
            video_categories!inner(id, title, identifier)
          `)
          .ilike('title', `%${query}%`)
          .limit(5);

        if (videosTitleError) {
          throw videosTitleError;
        }

        // Ne pas essayer de faire une recherche directe par identifiant alphanumérique
        // car le champ identifiant est probablement un entier dans la base de données
        let videosByIdentifier: VideoSearchResult[] = [];
        // Vérifions si c'est un nombre pur avant de le rechercher comme identifiant
        if (/^\d+$/.test(query)) {
          const { data, error } = await supabase
            .from('category_videos')
            .select(`
              id, 
              title, 
              identifier, 
              category_id,
              video_categories!inner(id, title, identifier)
            `)
            .eq('identifier', query)
            .limit(5);

          if (!error && data) {
            videosByIdentifier = data as VideoSearchResult[];
          }
        }

        // Recherche spéciale pour les identifiants combinés (ex: A1, B2)
        // Si le format semble être une lettre suivie de chiffres (ex: A1, B2, C10)
        let videosByComboIdentifier: VideoSearchResult[] = [];
        if (/^[A-Za-z]\d+$/.test(query)) {
          const letter = query.charAt(0);
          const number = parseInt(query.substring(1), 10);

          const { data, error } = await supabase
            .from('category_videos')
            .select(`
              id, 
              title, 
              identifier, 
              category_id,
              video_categories!inner(id, title, identifier)
            `)
            .eq('identifier', number.toString())
            .eq('video_categories.identifier', letter)
            .limit(5);

          if (!error && data) {
            videosByComboIdentifier = data as VideoSearchResult[];
          }
        }

        // Combiner tous les résultats de vidéos sans duplications
        const videoIds = new Set();
        const allVideos = [...videosByTitle, ...videosByIdentifier, ...videosByComboIdentifier].filter(video => {
          if (videoIds.has(video.id)) {
            return false;
          }
          videoIds.add(video.id);
          return true;
        });

        const formattedResults: SearchResult[] = [
          ...categories.map((category: CategorySearchResult) => ({
            id: category.id,
            title: category.title,
            type: 'category' as SearchResultType,
            url: `/dashboard/categories/${category.id}`,
            identifier: category.identifier
          })),
          ...allVideos.map((video: VideoSearchResult) => ({
            id: video.id,
            title: video.title,
            type: 'video' as SearchResultType,
            url: `/dashboard/videos/${video.id}`,
            identifier: video.identifier,
            categoryInfo: {
              id: video.category_id,
              title: video.video_categories?.title,
              identifier: video.video_categories?.identifier
            }
          }))
        ];

        setResults(formattedResults);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    // Délai de 300ms pour éviter trop de requêtes pendant la frappe
    const timeout = setTimeout(performSearch, 300);
    return () => clearTimeout(timeout);
  }, [query, supabase]);

  return {
    query,
    setQuery,
    results,
    loading
  };
} 