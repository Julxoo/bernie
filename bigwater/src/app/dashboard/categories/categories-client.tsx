"use client";

import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowsUpDownIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, FileCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";

import type { VideoCategory } from "@/types/api";

import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { MobileFilterDrawer } from "@/components/ui/mobile-filter-drawer";
import { Progress } from "@/components/ui/feedback/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/data-display/tabs";
import { 
  TooltipProvider, 
} from "@/components/ui/overlays/tooltip";

// Types de tri disponibles
type SortType = "title" | "last_updated" | "count";

// Type étendu pour inclure les vidéos associées
interface CategoryWithVideos extends VideoCategory {
  category_videos: { 
    id: number; 
    title: string; 
    identifier: number | null;
  }[];
  pending_count?: number;
  finished_count?: number;
  ready_to_publish_count?: number;
  description?: string;
}

interface CategoriesClientProps {
  initialCategories: CategoryWithVideos[];
}

// Hook de debounce
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Composant personnalisé pour la barre de recherche
interface CategorySearchBarProps {
  // Value prop is required and used within the component on line 96
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

function CategorySearchBar({ value, onChange, onReset, className = "", onFocus, onBlur }: CategorySearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative flex w-full">
        <MagnifyingGlassIcon className={`absolute left-2.5 top-2.5 h-4 w-4 ${isFocused ? "text-primary" : "text-muted-foreground"} transition-colors`} />
        <Input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Rechercher une catégorie ou vidéo..."
          className={`pl-8 pr-8 rounded-md w-full ${isFocused ? "border-primary ring-1 ring-primary" : ""} transition-all`}
          autoComplete="off"
        />
        {value && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 h-9 w-9" 
            onClick={() => {
              onChange('');
              if (onReset) onReset();
              if (inputRef.current) inputRef.current.focus();
            }}
            aria-label="Effacer la recherche"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<SortType>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  
  // Définir les options de tri pour le filtre mobile
  const SORT_OPTIONS = [
    { id: 'newest', label: 'Plus récentes d\'abord' },
    { id: 'oldest', label: 'Plus anciennes d\'abord' },
    { id: 'alphabetical', label: 'Alphabétique (A-Z)' },
    { id: 'reverse-alphabetical', label: 'Alphabétique (Z-A)' },
    { id: 'most-videos', label: 'Plus de vidéos' },
    { id: 'least-videos', label: 'Moins de vidéos' },
  ];

  // Handler pour basculer une catégorie dans les filtres
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  
  // Utilisation d'un debounce pour la recherche
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // État de la recherche - commented out as variables are unused
  // useEffect(() => {
  //   setIsSearching(debouncedSearchTerm !== searchTerm);
  // }, [debouncedSearchTerm, searchTerm]);
  
  // Fonction pour changer le tri
  const toggleSort = (newSortType: SortType) => {
    if (sortBy === newSortType) {
      // Si on clique sur le même tri, on inverse la direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Sinon, on change le type de tri et on remet la direction par défaut
      setSortBy(newSortType);
      setSortDirection("asc");
    }
  };

  // Filtrer et trier les catégories
  const filteredCategories = useMemo(() => {
    let result = [...initialCategories];
    
    // Filtrer par texte de recherche (identifiant ou titre de catégorie/vidéo)
    if (debouncedSearchTerm) {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      
      // Recherche exacte sur l'identifiant (si c'est un nombre)
      const isNumericSearch = /^\d+$/.test(debouncedSearchTerm);
      
      result = result.filter((category) => {
        // Vérifier si la catégorie correspond
        const categoryMatches = isNumericSearch 
          ? category.identifier.toString() === debouncedSearchTerm
          : category.title.toLowerCase().includes(lowerSearchTerm);
        
        if (categoryMatches) return true;
        
        // Vérifier si une des vidéos de la catégorie correspond
        if (category.category_videos && category.category_videos.length > 0) {
          return category.category_videos.some(video => {
            if (isNumericSearch && video.identifier) {
              // Recherche exacte par identifiant de vidéo
              return video.identifier.toString() === debouncedSearchTerm;
            } else {
              // Recherche approx. par titre de vidéo
              return video.title.toLowerCase().includes(lowerSearchTerm);
            }
          });
        }
        
        return false;
      });
    }
    
    // Filtrer par onglet
    if (activeTab !== "all") {
      switch (activeTab) {
        case "pending":
          result = result.filter((category) => (category.pending_count || 0) > 0);
          break;
        case "in-progress":
          result = result.filter((category) => (category.finished_count || 0) > 0);
          break;
        case "ready":
          result = result.filter((category) => (category.ready_to_publish_count || 0) > 0);
          break;
      }
    }
    
    // Trier les résultats
    result.sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;
      
      switch (sortBy) {
        case "title":
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case "last_updated":
          valueA = a.last_updated ? new Date(a.last_updated).getTime() : 0;
          valueB = b.last_updated ? new Date(b.last_updated).getTime() : 0;
          break;
        case "count":
          valueA = (a.pending_count || 0) + (a.finished_count || 0) + (a.ready_to_publish_count || 0);
          valueB = (b.pending_count || 0) + (b.finished_count || 0) + (b.ready_to_publish_count || 0);
          break;
        default:
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
      }
      
      if (valueA === valueB) return 0;
      
      const comparison = valueA > valueB ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return result;
  }, [initialCategories, debouncedSearchTerm, activeTab, sortBy, sortDirection]);

  // Vérifier si des filtres sont appliqués
  const hasActiveFilters = debouncedSearchTerm !== "" || activeTab !== "all";
  
  // Réinitialiser tous les filtres
  const clearAllFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
    setSortBy("title");
    setSortDirection("asc");
  };

  // Mémoiser les catégories qui ont des vidéos correspondant à la recherche
  const matchingVideosInfo = useMemo(() => {
    if (!debouncedSearchTerm) return {}; // Pas de recherche active, on ne calcule rien
    
    const result: Record<number, { videoId: number, videoTitle: string, videoIdentifier: number | null }[]> = {};
    
    initialCategories.forEach(category => {
      if (!category.category_videos?.length) return;
      
      const isNumericSearch = /^\d+$/.test(debouncedSearchTerm);
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      
      const matchingVideos = category.category_videos.filter(video => {
        if (isNumericSearch && video.identifier) {
          return video.identifier.toString() === debouncedSearchTerm;
        } else {
          return video.title.toLowerCase().includes(lowerSearchTerm);
        }
      });
      
      if (matchingVideos.length) {
        result[category.id] = matchingVideos.map(v => ({
          videoId: v.id,
          videoTitle: v.title,
          videoIdentifier: v.identifier
        }));
      }
    });
    
    return result;
  }, [initialCategories, debouncedSearchTerm]);

  // Variable will be used to set isMobile but not directly referenced
  const [, setIsMobile] = useState(false);

  // Écouteur de redimensionnement pour ajuster le mode d'affichage
  useEffect(() => {
    // Initialiser les états au premier montage
    const checkMobile = () => window.innerWidth < 768;
    const initialMobile = checkMobile();
    setIsMobile(initialMobile);
    
    const handleResize = () => {
      const mobile = checkMobile();
      setIsMobile(mobile);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculer le total des vidéos pour une catégorie
  const getTotalVideos = (category: CategoryWithVideos) => {
    return (category.pending_count || 0) + (category.finished_count || 0) + (category.ready_to_publish_count || 0);
  };

  // Calculer le pourcentage de progression pour une catégorie
  const getProgressPercentage = (category: CategoryWithVideos) => {
    const total = getTotalVideos(category);
    if (total === 0) return 0;
    return Math.round(((category.finished_count || 0) / total) * 100);
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-0 pb-16 md:pb-0"
      >
        {/* En-tête mobile amélioré */}
        <div className="mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">{filteredCategories.length} catégorie{filteredCategories.length !== 1 ? 's' : ''}</h2>
                  <p className="text-sm text-muted-foreground">Gérez et organisez vos vidéos par catégorie</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <MobileFilterDrawer 
                    categories={initialCategories}
                    selectedCategories={selectedCategories}
                    sortOptions={SORT_OPTIONS}
                    dateSort="newest"
                    handleCategoryToggle={handleCategoryToggle}
                    setSelectedCategories={setSelectedCategories}
                    setDateSort={() => {}}
                  />
                  
                  <Button asChild size="sm" className="sm:hidden">
                    <Link href="/categories/new">
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Barre de recherche optimisée */}
              <div className="w-full">
                <CategorySearchBar 
                  value={searchTerm}
                  onChange={(selectedValue) => {
                    setSearchTerm(selectedValue);
                  }}
                  onReset={() => {
                    setActiveTab("all");
                    setSortBy("title");
                    setSortDirection("asc");
                  }}
                  className="w-full"
                  onFocus={() => {}}
                  onBlur={() => {}}
                />
              </div>
            </div>
            
            {/* Navigation par onglets améliorée pour mobile */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto overflow-y-hidden no-scrollbar pb-1">
                <TabsList className="flex p-0.5 bg-muted/50 rounded-lg border border-border/50 w-full md:w-auto min-w-max gap-1">
                  <TabsTrigger 
                    value="all" 
                    className="rounded-md text-xs px-2 sm:px-4 py-1.5 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-1 sm:gap-2 items-center transition-all duration-200 flex-1 justify-center"
                  >
                    <span className="flex items-center justify-center rounded-full w-5 h-5 sm:w-6 sm:h-6 bg-background/80 text-[10px] font-semibold">
                      {initialCategories.length}
                    </span>
                    <span className="whitespace-nowrap truncate">Toutes</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="rounded-md text-xs px-2 sm:px-4 py-1.5 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-1 sm:gap-2 items-center transition-all duration-200 flex-1 justify-center"
                  >
                    <span className="flex items-center justify-center rounded-full w-5 h-5 sm:w-6 sm:h-6 bg-orange-100 text-orange-600 text-[10px] font-semibold">
                      {initialCategories.filter(c => (c.pending_count || 0) > 0).length}
                    </span>
                    <span className="whitespace-nowrap truncate">À monter</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="in-progress" 
                    className="rounded-md text-xs px-2 sm:px-4 py-1.5 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-1 sm:gap-2 items-center transition-all duration-200 flex-1 justify-center"
                  >
                    <span className="flex items-center justify-center rounded-full w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 text-[10px] font-semibold">
                      {initialCategories.filter(c => (c.ready_to_publish_count || 0) > 0).length}
                    </span>
                    <span className="whitespace-nowrap truncate">En cours</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ready" 
                    className="rounded-md text-xs px-2 sm:px-4 py-1.5 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm flex gap-1 sm:gap-2 items-center transition-all duration-200 flex-1 justify-center"
                  >
                    <span className="flex items-center justify-center rounded-full w-5 h-5 sm:w-6 sm:h-6 bg-green-100 text-green-600 text-[10px] font-semibold">
                      {initialCategories.filter(c => (c.finished_count || 0) > 0).length}
                    </span>
                    <span className="whitespace-nowrap truncate">Prêtes</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Options de tri et affichage */}
              <div className="flex items-center justify-between mt-3 mb-2">
                <div className="relative">
                  <div className="flex gap-1.5">
                    <Button
                      variant={sortBy === "title" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleSort("title")}
                      className="h-8 px-2.5 text-xs"
                    >
                      <span className="mr-1">Titre</span>
                      {sortBy === "title" && (
                        <ArrowsUpDownIcon 
                          className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`} 
                        />
                      )}
                    </Button>
                    
                    <Button
                      variant={sortBy === "count" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleSort("count")}
                      className="h-8 px-2.5 text-xs hidden sm:flex"
                    >
                      <span className="mr-1">Vidéos</span>
                      {sortBy === "count" && (
                        <ArrowsUpDownIcon 
                          className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`} 
                        />
                      )}
                    </Button>
                    
                    <Button
                      variant={sortBy === "last_updated" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleSort("last_updated")}
                      className="h-8 px-2.5 text-xs hidden sm:flex"
                    >
                      <span className="mr-1">Date</span>
                      {sortBy === "last_updated" && (
                        <ArrowsUpDownIcon 
                          className={`h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`} 
                        />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Contenu des onglets */}
              {["all", "pending", "in-progress", "ready"].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="focus-visible:outline-none focus-visible:ring-0">
                  <AnimatePresence mode="wait">
                    {filteredCategories.length === 0 ? (
                      <motion.div
                        key={`empty-${tabValue}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center py-10 text-center"
                      >
                        <FunnelIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">Aucune catégorie trouvée</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Aucune catégorie ne correspond à vos critères de recherche.
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={clearAllFilters}
                          >
                            Réinitialiser les filtres
                          </Button>
                        )}
                      </motion.div>
                    ) : (
                      // Vue grille
                      <motion.div 
                        key={`grid-view-${tabValue}`}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {filteredCategories.map((category) => (
                          <motion.div
                            key={category.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link 
                              href={`/categories/${category.id}`}
                              className="h-full block"
                            >
                              <Card className="h-full cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all duration-200 overflow-hidden group">
                                <CardHeader className="pb-2 relative">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">
                                      {category.title}
                                    </CardTitle>
                                    {category.identifier && (
                                      <Badge variant="outline" className="shrink-0">
                                        #{category.identifier}
                                      </Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                
                                <CardContent className="pb-2">
                                  {/* Afficher les vidéos correspondantes si la recherche est active */}
                                  {debouncedSearchTerm && matchingVideosInfo[category.id] && (
                                    <div className="mb-3 p-2 bg-secondary/20 rounded-md">
                                      <p className="text-xs font-medium mb-1 text-secondary-foreground">Vidéos correspondantes:</p>
                                      <div className="space-y-1 max-h-24 overflow-y-auto">
                                        {matchingVideosInfo[category.id].map(video => (
                                          <div key={video.videoId} className="flex items-center gap-1 text-xs p-1 pl-2 bg-background rounded">
                                            <span className="line-clamp-1 flex-1">{video.videoTitle}</span>
                                            {video.videoIdentifier && (
                                              <Badge variant="outline" className="h-5 text-[10px]">
                                                #{video.videoIdentifier}
                                              </Badge>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="flex flex-col items-center bg-muted/40 p-2 rounded">
                                      <Clock className="h-4 w-4 mb-1 text-orange-500" />
                                      <span className="text-sm font-medium">{category.pending_count || 0}</span>
                                      <span className="text-xs text-muted-foreground">À monter</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-muted/40 p-2 rounded">
                                      <FileCheck className="h-4 w-4 mb-1 text-blue-500" />
                                      <span className="text-sm font-medium">{category.ready_to_publish_count || 0}</span>
                                      <span className="text-xs text-muted-foreground">Prêtes</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-muted/40 p-2 rounded">
                                      <CheckCircle2 className="h-4 w-4 mb-1 text-green-500" />
                                      <span className="text-sm font-medium">{category.finished_count || 0}</span>
                                      <span className="text-xs text-muted-foreground">Terminées</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1 text-xs">
                                      <span>Progression</span>
                                      <span>{getProgressPercentage(category)}%</span>
                                    </div>
                                    <Progress 
                                      value={getProgressPercentage(category)} 
                                      className="h-1.5"
                                    />
                                  </div>
                                </CardContent>
                                
                                <CardFooter className="pt-0 pb-4 text-xs text-muted-foreground border-t border-border/30 mt-1 px-6">
                                  <div className="flex items-center justify-between w-full pt-2">
                                    <span>{getTotalVideos(category)} vidéo{getTotalVideos(category) !== 1 ? 's' : ''}</span>
                                    {category.last_updated && (
                                      <span>
                                        Modifié: {new Date(category.last_updated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                      </span>
                                    )}
                                  </div>
                                </CardFooter>
                              </Card>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
} 