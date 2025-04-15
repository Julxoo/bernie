'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { ResponsiveGrid } from '@/components/layout/responsive-grid';
import { MobileActions } from '@/components/layout/mobile-actions';
import { VideoCard } from '@/components/video/VideoCard';
import { NewVideoForm } from '@/components/video/NewVideoForm';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/client';

const _STATUSES = ['À monter', 'En cours', 'Terminé'];

// Filtres prédéfinis pour faciliter le filtrage rapide
const PRESET_FILTERS = [
  { id: 'all', label: 'Toutes', filter: () => true },
  { id: 'a-monter', label: 'À monter', filter: (video: Video) => video.production_status === 'À monter' },
  { id: 'en-cours', label: 'En cours', filter: (video: Video) => video.production_status === 'En cours' },
  { id: 'pret', label: 'Prêtes', filter: (video: Video) => video.production_status === 'Prêt à publier' }
];

// Options de tri
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
  created_at: string;
  updated_at: string;
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

  // Charger les catégories au montage du composant ou à l'ouverture du dialogue
  useEffect(() => {
    // Si le dialogue n'est pas ouvert, ne pas charger les données
    if (!open) return;
    
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    async function loadCategories() {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('video_categories')
          .select('id, title')
          .order('title', { ascending: true });

        if (error) throw error;

        if (data && isMounted) {
          setCategories(data);
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

  // Réinitialiser la sélection quand la modale se ferme
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
  const _pathname = usePathname();
  const _searchParams = useSearchParams();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<{id: number, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [_statusFilter, _setStatusFilter] = useState<string>('all');
  const [_categoryFilter, _setCategoryFilter] = useState<number | null>(null);
  const [dateSort, setDateSort] = useState<string>('newest');
  const [_selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [activePresetFilter, setActivePresetFilter] = useState<string>('all');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [_showFiltersDialog, _setShowFiltersDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection de la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    // Initialiser l'état isMobile au chargement
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fonction pour détecter le scroll et cacher/montrer les filtres sur mobile
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

  // Charger les données
  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      setLoading(true);
      setError(null);
      
      try {
        // 1. Récupérer les vidéos
        let videosData;
        
        const categoryVideosResult = await supabase
          .from('category_videos')
          .select('*')
          .order('created_at', { ascending: false });
        
        const videosError = categoryVideosResult.error;
        
        videosData = categoryVideosResult.data;
        
        // Afficher les données en console pour debug
        if (process.env.NODE_ENV === 'development') {
          console.log('Données récupérées (category_videos):', videosData);
          console.log('Structure des données:', videosData && videosData.length > 0 ? 
                    Object.keys(videosData[0]).join(', ') : 'Aucune donnée');
        }
        
        if (videosError) {
          // Si échec, essayer avec la table "videos" comme fallback
          const fallbackResult = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (fallbackResult.error) throw fallbackResult.error;
          videosData = fallbackResult.data;
        }
        
        // 2. Récupérer toutes les catégories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('video_categories')
          .select('*')
          .order('title', { ascending: true });
          
        if (categoriesError) throw categoriesError;
        
        // 3. Joindre manuellement les données des catégories aux vidéos
        const formattedVideos = videosData ? videosData.map((video: {
          id: number;
          title: string;
          description: string | null;
          category_id: number;
          created_at: string;
          updated_at: string;
          status?: string;
          production_status?: string;
          thumbnail_url?: string;
        }) => {
          const category = categoriesData?.find((cat: { id: number }) => cat.id === video.category_id);
          return {
            ...video,
            category: category ? {
              title: category.title,
              identifier: category.identifier
            } : undefined
          };
        }) : [];
        
        setVideos(formattedVideos);
        setFilteredVideos(formattedVideos);
        setCategories(categoriesData || []);
      } catch (error: Error | unknown) {
        // Enregistrer l'erreur uniquement en développement
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des données:', error);
        }
        setError((error as Error)?.message || "Impossible de charger les données.");
        
        // Essayer d'initialiser avec des données vides pour éviter de bloquer l'interface
        setVideos([]);
        setFilteredVideos([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Fonction de tri des vidéos selon différents critères
  const sortVideos = useCallback((videos: Video[], sortOption: string) => {
    const videosCopy = [...videos];
    
    switch (sortOption) {
      case 'newest':
        return videosCopy.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return videosCopy.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
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
        return videosCopy.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'date_modif':
        return videosCopy.sort((a, b) => {
          const dateA = a.updated_at ? new Date(a.updated_at).getTime() : new Date(a.created_at).getTime();
          const dateB = b.updated_at ? new Date(b.updated_at).getTime() : new Date(b.created_at).getTime();
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
        (video.description && video.description.toLowerCase().includes(query))
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

  // Gérer la sélection de catégories
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  // Appliquer un filtre prédéfini
  const applyPresetFilter = (filterId: string) => {
    if (activePresetFilter === filterId) {
      // Si on clique sur le filtre déjà actif, on le désactive
      setActivePresetFilter('all');
    } else {
      setActivePresetFilter(filterId);
      // Réinitialiser les autres filtres pour éviter les conflits
      setSelectedCategories([]);
    }
  };

  // Calculer le nombre de vidéos par filtre prédéfini
  const getFilterCount = (filterId: string) => {
    if (filterId === 'all') return videos.length;
    const filter = PRESET_FILTERS.find(f => f.id === filterId);
    if (!filter) return 0;
    return videos.filter(filter.filter).length;
  };

  // Fonction pour regrouper les vidéos par catégorie
  const getVideosGroupedByCategory = () => {
    if (!groupByCategory) return { ungrouped: filteredVideos };
    
    const grouped = filteredVideos.reduce((acc: Record<string, Video[]>, video) => {
      const categoryId = video.category_id || 'uncategorized';
      const categoryKey = categoryId.toString();
      
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      
      acc[categoryKey].push(video);
      return acc;
    }, {});
    
    return grouped;
  };
  
  // Obtenir le titre d'une catégorie par son ID
  const getCategoryTitle = (categoryId: string) => {
    if (categoryId === 'uncategorized') return 'Sans catégorie';
    const category = categories.find(c => c.id.toString() === categoryId);
    return category ? category.title : `Catégorie ${categoryId}`;
  };

  const toggleGroupByCategory = () => {
    setGroupByCategory(!groupByCategory);
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
                key={groupByCategory ? 'grouped' : 'list'}
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
                      href={`/video/${video.id}`}
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
    <ResponsiveGrid>
      {[...Array(6)].map((_, i) => (
        <Skeleton 
          key={i} 
          className={`${isMobile ? 'h-48' : 'h-64'} w-full rounded-lg`} 
          aria-label="Chargement des vidéos..."
        />
      ))}
    </ResponsiveGrid>
  );
} 