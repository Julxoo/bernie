'use client';

import { 
  ArrowLeft, 
  Folder,
  Plus,
  Search
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/inputs/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/inputs/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/overlays/dialog';
import { Skeleton } from '@/components/ui/feedback/skeleton';

import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import { MobileActions } from '@/components/layout/mobile-actions';
import { VideoCard } from '@/components/video/video-card';
import { NewVideoForm } from '@/components/video/new-video-form';
import { createClient } from '@/services/supabase/client';

import type { CategoryVideo, VideoCategory } from '@/types/api';

// Type pour les vidéos avec détails additionnels
type Video = CategoryVideo & {
  description?: string | null;
  thumbnail_url?: string;
  category?: {
    title: string;
    identifier: string | number;
  };
  video_details?: {
    description: string | null;
  } | null;
};

// Type pour les catégories avec données additionnelles
type CategoryWithStats = VideoCategory & {
  description?: string;
  pending_count?: number;
  finished_count?: number;
  ready_to_publish_count?: number;
};

// Type pour les données de vidéo provenant de Supabase
type VideoData = Record<string, unknown>;

// Filtres prédéfinis pour faciliter le filtrage rapide
const PRESET_FILTERS = [
  { id: 'all', label: 'Toutes', filter: () => true },
  { id: 'a-preparer', label: 'À préparer', filter: (video: Video) => video.production_status === 'À préparer' },
  { id: 'pretes', label: 'Prêtes', filter: (video: Video) => video.production_status === 'Prêtes' },
  { id: 'upload', label: 'Upload', filter: (video: Video) => video.production_status === 'Upload' }
];

// Options de tri
const SORT_OPTIONS = [
  { id: 'newest', label: 'Plus récent' },
  { id: 'oldest', label: 'Plus ancien' },
  { id: 'alpha', label: 'Alphabétique (A-Z)' },
  { id: 'alpha-desc', label: 'Alphabétique (Z-A)' }
];

function VideoListSkeleton() {
  return (
    <ResponsiveGrid>
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </ResponsiveGrid>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [category, setCategory] = useState<CategoryWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateSort, setDateSort] = useState<string>('newest');
  const [activePresetFilter, setActivePresetFilter] = useState<string>('all');
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Appliquer les filtres à partir des paramètres d'URL au chargement
  useEffect(() => {
    if (searchParams) {
      // Récupérer le paramètre status
      const statusParam = searchParams.get('status');
      if (statusParam) {
        setActivePresetFilter(statusParam);
      }

      // Récupérer le paramètre search
      const searchParam = searchParams.get('search');
      if (searchParam) {
        setSearchQuery(searchParam);
      }

      // Récupérer le paramètre sort
      const sortParam = searchParams.get('sort');
      if (sortParam) {
        setDateSort(sortParam);
      }
    }
  }, [searchParams]);

  // Fonction pour détecter le scroll et cacher/montrer les filtres sur mobile
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsScrollingDown(true);
    } else {
      setIsScrollingDown(false);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Charger les données
  useEffect(() => {
    async function loadData() {
      if (!categoryId) return;
      
      const supabase = createClient();
      setLoading(true);
      setError(null);
      
      try {
        // 1. Récupérer la catégorie
        const { data: categoryData, error: categoryError } = await supabase
          .from('video_categories')
          .select('*')
          .eq('id', categoryId)
          .single();
        
        if (categoryError) throw categoryError;
        if (!categoryData) throw new Error('Catégorie non trouvée');
        
        setCategory(categoryData);
        
        // 2. Récupérer les vidéos de cette catégorie
        const { data: videoData, error: videoError } = await supabase
          .from('category_videos')
          .select(`
            *,
            video_details (*)
          `)
          .eq('category_id', categoryId)
          .order('identifier', { ascending: true });
        
        if (videoError) throw videoError;
        
        // Formater les données de vidéo
        const formattedVideos = videoData.map((video: VideoData) => ({
          ...video,
          category: {
            title: categoryData.title,
            identifier: categoryData.identifier
          }
        }));
        
        setVideos(formattedVideos);
        setFilteredVideos(formattedVideos);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des données:', error);
        }
        setError((error as Error)?.message || "Impossible de charger les données.");
        
        // Initialiser avec des données vides
        setVideos([]);
        setFilteredVideos([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [categoryId]);
  
  // Fonction de tri des vidéos selon différents critères
  const sortVideos = useCallback((videos: Video[], sortOption: string) => {
    const videosCopy = [...videos];
    
    switch (sortOption) {
      case 'newest':
        return videosCopy.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      case 'oldest':
        return videosCopy.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA - dateB;
        });
      case 'alpha':
        return videosCopy.sort((a, b) => 
          a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' })
        );
      case 'alpha-desc':
        return videosCopy.sort((a, b) => 
          b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' })
        );
      default:
        return videosCopy;
    }
  }, []);

  // Fonction de filtrage mise à jour
  const applyFilters = useCallback(() => {
    if (videos.length === 0) return;

    let results = [...videos];

    // Appliquer le filtre de statut
    if (activePresetFilter !== 'all') {
      const activeFilter = PRESET_FILTERS.find(f => f.id === activePresetFilter);
      if (activeFilter) {
        results = results.filter(activeFilter.filter);
      }
    }

    // Appliquer le filtre de recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(video => 
        video.title.toLowerCase().includes(query) || 
        (video.description && video.description.toLowerCase().includes(query)) ||
        (video.video_details?.description && video.video_details.description.toLowerCase().includes(query))
      );
    }

    // Appliquer le tri
    results = sortVideos(results, dateSort);

    setFilteredVideos(results);
  }, [videos, activePresetFilter, searchQuery, dateSort, sortVideos]);

  // Mettre à jour les filtres quand les critères changent
  useEffect(() => {
    applyFilters();
  }, [applyFilters, videos, activePresetFilter, searchQuery, dateSort]);

  // Gestionnaire de changement de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Gestionnaire de changement de filtre
  const handleFilterChange = (filterId: string) => {
    setActivePresetFilter(filterId);
  };

  // Gestionnaire de changement de tri
  const handleSortChange = (value: string) => {
    setDateSort(value);
  };

  // Calculer le nombre de vidéos par filtre prédéfini
  const getFilterCount = (filterId: string) => {
    if (filterId === 'all') return videos.length;
    const filter = PRESET_FILTERS.find(f => f.id === filterId);
    if (!filter) return 0;
    return videos.filter(filter.filter).length;
  };

  // Fonction pour naviguer vers la page précédente
  const goBack = () => {
    router.push('/dashboard/categories');
  };

  function NewVideoInCategoryButton() {
    const [open, setOpen] = useState(false);
    
    const handleSuccess = () => {
      setOpen(false);
      
      // Rafraîchir les données
      const fetchUpdatedVideos = async () => {
        if (!categoryId) return;
        
        try {
          const supabase = createClient();
          
          // Récupérer les vidéos mises à jour
          const { data: videoData, error: videoError } = await supabase
            .from('category_videos')
            .select(`
              *,
              video_details (*)
            `)
            .eq('category_id', categoryId)
            .order('identifier', { ascending: true });
          
          if (videoError) throw videoError;
          
          if (category) {
            // Formater les données de vidéo
            const formattedVideos = videoData.map((video: VideoData) => ({
              ...video,
              category: {
                title: category.title,
                identifier: category.identifier
              }
            }));
            
            setVideos(formattedVideos);
            // Appliquer les filtres actuels aux nouvelles données
            applyFilters();
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement des vidéos:', error);
          toast.error('Impossible de rafraîchir la liste des vidéos');
        }
      };
      
      fetchUpdatedVideos();
    };
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle vidéo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle vidéo</DialogTitle>
            <DialogDescription>
              Créer une nouvelle vidéo dans la catégorie {category?.title}
            </DialogDescription>
          </DialogHeader>
          
          {category && (
            <NewVideoForm 
              categoryId={category.id} 
              onSuccess={handleSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <PageContainer>
      <EnhancedPageHeader 
        usePathConfig={false}
        title={category?.title || 'Catégorie'}
        description={category?.description || 'Gérez les vidéos de cette catégorie'}
        icon={<Folder className="h-6 w-6" />}
        breadcrumbs={[
          { title: 'Accueil', href: '/dashboard' },
          { title: 'Catégories', href: '/dashboard/categories' },
          { title: category?.title || 'Catégorie' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <NewVideoInCategoryButton />
          </div>
        }
      />

      <PageContent>
        <Section>
          {/* Barre de recherche et filtres */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une vidéo..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={dateSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtres rapides */}
            <div className="flex flex-wrap gap-2">
              {PRESET_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activePresetFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(filter.id)}
                  className="whitespace-nowrap"
                >
                  {filter.label}
                  {filter.id !== 'all' && getFilterCount(filter.id) > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getFilterCount(filter.id)}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Liste des vidéos */}
          {loading ? (
            <VideoListSkeleton />
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune vidéo ne correspond à vos critères de recherche</p>
              {(searchQuery || activePresetFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActivePresetFilter('all');
                    setDateSort('newest');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="videos-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ResponsiveGrid>
                  {filteredVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={{
                        ...video,
                        description: video.description || video.video_details?.description || undefined
                      }}
                      href={`/dashboard/videos/${video.id}`}
                    />
                  ))}
                </ResponsiveGrid>
              </motion.div>
            </AnimatePresence>
          )}
        </Section>
      </PageContent>

      {/* Actions mobiles flottantes */}
      <MobileActions visible={!isScrollingDown}>
        <NewVideoInCategoryButton />
      </MobileActions>
    </PageContainer>
  );
} 