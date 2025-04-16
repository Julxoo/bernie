'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/overlays/dialog';
import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import { MobileActions } from '@/components/layout/mobile-actions';
import { VideoCard } from '@/components/video/video-card';
import { NewVideoForm } from '@/components/video/new-video-form';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

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
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { getCategoryVideos } from '@/services/api/categoryVideos';
import { getVideoCategories } from '@/services/api/videoCategories';

const PRESET_FILTERS = [
  { id: 'all', label: 'Toutes', filter: () => true },
  { id: 'a-monter', label: 'À monter', filter: (video: Video) => video.production_status === 'À monter' },
  { id: 'en-cours', label: 'En cours', filter: (video: Video) => video.production_status === 'En cours' },
  { id: 'termine', label: 'Terminé', filter: (video: Video) => video.production_status === 'Terminé' }
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Plus récent' },
  { id: 'oldest', label: 'Plus ancien' },
  { id: 'alpha', label: 'Alphabétique (A-Z)' },
  { id: 'alpha-desc', label: 'Alphabétique (Z-A)' }
];

type Video = {
  id: number;
  title: string;
  description: string | null;
  status?: string;
  production_status?: string;
  category_id: number;
  created_at: string | null;
  updated_at: string | null;
  thumbnail_url?: string;
  category?: {
    title: string;
    identifier: string | number;
  };
  identifier?: number | null;
};

function NewVideoWithCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<{id: number, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    async function loadCategories() {
      try {
        const categoriesData = await getVideoCategories();

        if (categoriesData && isMounted) {
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
        if (isMounted) {
          setError("Impossible de charger les catégories");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategories();
    
    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedCategory("");
    }
  }, [open]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSuccess = () => {
    setOpen(false);
    setSelectedCategory("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="Créer une nouvelle vidéo">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nouvelle vidéo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle vidéo</DialogTitle>
          <DialogDescription>
            Créer une nouvelle vidéo en sélectionnant une catégorie
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" id="category-label">Catégorie</label>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              disabled={loading}
              aria-labelledby="category-label"
            >
              <SelectTrigger aria-label="Sélectionner une catégorie">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Chargement des catégories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Aucune catégorie disponible
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Formulaire de création de vidéo - montré uniquement si une catégorie est sélectionnée */}
        {selectedCategory && (
          <NewVideoForm 
            categoryId={parseInt(selectedCategory)} 
            onSuccess={handleSuccess} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function VideosPage() {
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateSort, setDateSort] = useState<string>('newest');
  const [activePresetFilter, setActivePresetFilter] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Gestion des paramètres d'URL pour les filtres
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const filterParam = params.get('filter');
      const statusParam = params.get('status');
      
      if (filterParam && PRESET_FILTERS.some(f => f.id === filterParam)) {
        setActivePresetFilter(filterParam);
      } else if (statusParam === 'Terminé') {
        setActivePresetFilter('termine');
      } else if (statusParam === 'En cours') {
        setActivePresetFilter('en-cours');
      } else if (statusParam === 'À monter') {
        setActivePresetFilter('a-monter');
      }
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer les vidéos de catégories
        const videosData = await getCategoryVideos();
        
        // Récupérer les catégories
        const categoriesData = await getVideoCategories();
        
        // Formater les vidéos avec leurs informations de catégorie
        const formattedVideos = videosData.map((video) => {
          const category = categoriesData?.find((cat) => cat.id === video.category_id);
          return {
            ...video,
            description: '',
            category: category ? {
              title: category.title,
              identifier: category.identifier
            } : undefined
          };
        });
        
        setVideos(formattedVideos);
        setFilteredVideos(formattedVideos);
      } catch (error: Error | unknown) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des données:', error);
        }
        setError((error as Error)?.message || "Impossible de charger les données.");
        setVideos([]);
        setFilteredVideos([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
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
      case 'status':
        return videosCopy.sort((a, b) => {
          const statusA = a.production_status || a.status || '';
          const statusB = b.production_status || b.status || '';
          return statusA.localeCompare(statusB, 'fr', { sensitivity: 'base' });
        });
      case 'categorie':
        return videosCopy.sort((a, b) => {
          const catA = a.category?.title || '';
          const catB = b.category?.title || '';
          return catA.localeCompare(catB, 'fr', { sensitivity: 'base' });
        });
      case 'nom':
        return videosCopy.sort((a, b) => 
          a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' })
        );
      case 'date_creation':
        return videosCopy.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA - dateB;
        });
      case 'date_modif':
        return videosCopy.sort((a, b) => {
          const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 
                       (a.created_at ? new Date(a.created_at).getTime() : 0);
          const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 
                       (b.created_at ? new Date(b.created_at).getTime() : 0);
          return dateB - dateA;
        });
      case 'statut':
        return videosCopy.sort((a, b) => {
          const statusA = a.production_status || a.status || '';
          const statusB = b.production_status || b.status || '';
          return statusA.localeCompare(statusB, 'fr', { sensitivity: 'base' });
        });
      default:
        return videosCopy;
    }
  }, []);

  const applyFilters = useCallback(() => {
    if (videos.length === 0) return;

    let results = [...videos];

    if (activePresetFilter !== 'all') {
      const activeFilter = PRESET_FILTERS.find(f => f.id === activePresetFilter);
      if (activeFilter) {
        results = results.filter(activeFilter.filter);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(video => 
        video.title.toLowerCase().includes(query) || 
        (video.description && video.description.toLowerCase().includes(query))
      );
    }

    results = sortVideos(results, dateSort);

    setFilteredVideos(results);
  }, [videos, activePresetFilter, searchQuery, dateSort, sortVideos]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters, videos, activePresetFilter, searchQuery, dateSort]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterId: string) => {
    setActivePresetFilter(filterId);
  };

  const handleSortChange = (value: string) => {
    setDateSort(value);
  };

  const getFilterCount = (filterId: string) => {
    if (filterId === 'all') return videos.length;
    const filter = PRESET_FILTERS.find(f => f.id === filterId);
    if (!filter) return 0;
    return videos.filter(filter.filter).length;
  };

  return (
    <PageContainer>
      <EnhancedPageHeader 
        usePathConfig={true}
        title="Gérez et organisez vos vidéos"
        description="Gérez facilement toutes vos vidéos"
        icon={<VideoCameraIcon className="h-6 w-6" aria-hidden="true" />}
        actions={
          <NewVideoWithCategoryDialog />
        }
      />

      <PageContent>
        <Section>
          {/* Barre de recherche et filtres */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Rechercher une vidéo..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9"
                  aria-label="Rechercher une vidéo"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select 
                  value={dateSort} 
                  onValueChange={handleSortChange}
                  aria-label="Options de tri"
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
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
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtres rapides">
              {PRESET_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activePresetFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(filter.id)}
                  className="whitespace-nowrap"
                  aria-pressed={activePresetFilter === filter.id}
                  aria-label={`Filtrer: ${filter.label}`}
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
            <VideoListSkeleton isMobile={isMobile} />
          ) : error ? (
            <div className="text-center py-8" role="alert" aria-live="assertive">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-8" aria-live="polite">
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
                  aria-label="Réinitialiser tous les filtres"
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activePresetFilter === 'all' ? 'list' : 'grouped'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-live="polite"
                aria-label={`${filteredVideos.length} vidéos affichées`}
              >
                <ResponsiveGrid>
                  {filteredVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={{
                        ...video,
                        description: video.description || undefined
                      }}
                      href={`/videos/${video.id}`}
                      size={isMobile ? 'small' : 'default'}
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
        <NewVideoWithCategoryDialog />
      </MobileActions>
    </PageContainer>
  );
}

function VideoListSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="space-y-6">
      {/* Skeleton pour la barre de recherche et les filtres */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row md:items-center gap-4">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-full sm:w-[180px] rounded-md" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-md" />
          ))}
        </div>
      </div>
      
      {/* Skeleton pour les cartes de vidéos */}
      <ResponsiveGrid>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-lg border overflow-hidden shadow-sm">
            {/* Thumbnail */}
            <Skeleton 
              className={`${isMobile ? 'h-36' : 'h-48'} w-full rounded-t-lg`} 
            />
            
            {/* Contenu de la carte */}
            <div className="p-4 space-y-3">
              {/* Titre */}
              <Skeleton className="h-6 w-3/4 rounded-md" />
              
              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
              
              {/* Métadonnées */}
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  );
} 