import { useState, useEffect } from 'react';

import { createClient } from '@/utils/supabase/client';

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

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function performSearch() {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Recherche dans les catégories
        const { data: categories, error: categoriesError } = await supabase
          .from('video_categories')
          .select('id, title, identifier')
          .ilike('title', `%${query}%`)
          .limit(5);

        if (categoriesError) {
          throw categoriesError;
        }

        // Recherche dans les vidéos avec jointure pour obtenir les infos de catégorie
        const { data: videos, error: videosError } = await supabase
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

        if (videosError) {
          throw videosError;
        }

        const formattedResults: SearchResult[] = [
          ...categories.map((category: any) => ({
            id: category.id,
            title: category.title,
            type: 'category' as SearchResultType,
            url: `/category/${category.id}`,
            identifier: category.identifier
          })),
          ...videos.map((video: any) => ({
            id: video.id,
            title: video.title,
            type: 'video' as SearchResultType,
            url: `/video/${video.id}`,
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