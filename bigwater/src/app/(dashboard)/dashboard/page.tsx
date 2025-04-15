'use client';

import {
  CircleCheck,
  Edit,
  PlusCircle,
  FolderPlus,
  FilePlus,
  Clock3,
  FilePieChart,
  FolderClosed,
  Film,
  ClipboardList,
  BellRing,
} from "lucide-react";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';


import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { NewCategoryForm } from '@/components/video/NewCategoryForm';
import { NewVideoForm } from '@/components/video/NewVideoForm';
import { calculatePercentageChange, formatNumber, getRelativeTime } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { 
  ActivityItem, 
  VideoStat, 
  StatCardProps, 
  QuickActionCardProps, 
  TooltipProps,
  StatusChartItem,
  ActivityChartItem,
  CategoryChartItem
} from '@/types';
import { CategoryVideo, VideoCategory, ProductionStatus } from '@/types/api';
import { TooltipPayloadItem } from '@/types/common';
import { useRouter } from 'next/navigation';

const COLORS = {
  'À monter': 'hsl(40, 95%, 45%)',
  'En cours': 'hsl(220, 95%, 45%)',
  'Terminé': 'hsl(130, 95%, 35%)',
};

const getActivityIcon = (activity: ActivityItem) => {
  if (activity.title.includes('Catégorie')) {
    return <FolderPlus className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.action.includes('créée')) {
    return <PlusCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.action.includes('terminée')) {
    return <CircleCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.status === 'Prêt à publier') {
    return <FilePieChart className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.status === 'En cours') {
    return <Clock3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else {
    return <Edit className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  }
};

// Composant personnalisé pour le tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Card className="backdrop-blur-md bg-background/90 border border-border/40 shadow-lg p-2">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: TooltipPayloadItem, index: number) => (
            <div key={`item-${index}`} className="flex items-center text-xs gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium">{entry.name}:</span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  return null;
};

// Composant pour les cartes de statistiques
const StatCard = ({ title, value, icon, percentage, lastUpdated }: StatCardProps) => (
  <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="rounded-md p-2 bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
    <div className="px-4 pb-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center mt-1 text-xs text-muted-foreground">
        {percentage && (
          <Badge className="mr-2 px-1 py-0 bg-red-600 text-white rounded-sm font-medium text-xs">
            {percentage}
          </Badge>
        )}
        {lastUpdated}
      </div>
    </div>
  </div>
);

// Composant pour les cartes d'actions rapides
const QuickActionCard = ({ icon, title, onClick, href }: QuickActionCardProps) => {
  const content = (
    <div className="rounded-lg border bg-background shadow-sm p-4 flex flex-col items-center justify-center hover:shadow-md transition-all h-full">
      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
        {icon}
      </div>
      <span className="text-sm font-medium text-center">{title}</span>
    </div>
  );

  if (href) {
    return <Link href={href} className="h-full">{content}</Link>;
  }

  return (
    <button onClick={onClick} className="w-full h-full text-left">
      {content}
    </button>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<VideoStat[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<StatusChartItem[]>([]);
  const [activityData, setActivityData] = useState<ActivityChartItem[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryChartItem[]>([]);
  const [newVideoDialogOpen, setNewVideoDialogOpen] = useState(false);
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simuler des données historiques pour les comparaisons
    const historicalData = {
      totalVideos: 115, // Total il y a un mois
      statusCounts: {
        'À monter': 35, // Il y a une semaine
        'En cours': 15,
        'Prêt à publier': 10,
        'Terminé': 55 // Il y a un mois
      },
      categories: 13 // Il y a un trimestre
    };

    async function fetchDashboardData() {
      const supabase = createClient();
      setLoading(true);
      setError(null);

      try {
        // 1. Récupérer le nombre total de vidéos
        const { count: totalVideos, error: totalError } = await supabase
          .from('category_videos')
          .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;

        // 2. Récupérer les vidéos avec leurs statuts depuis category_videos
        const { data: videos, error: videosError } = await supabase
          .from('category_videos')
          .select('id, title, category_id, production_status, updated_at, created_at')
          .order('updated_at', { ascending: false });

        if (videosError) throw videosError;

        // 3. Récupérer les catégories
        const { data: categories, error: categoriesError } = await supabase
          .from('video_categories')
          .select('id, title');
          
        if (categoriesError) throw categoriesError;

        // Compter les statuts des vidéos
        const statusMap: Record<string, number> = { 
          'À monter': 0, 
          'En cours': 0, 
          'Terminé': 0 
        };

        // Si videos existe et contient des données
        if (videos && videos.length > 0) {
          videos.forEach((video: CategoryVideo) => {
            if (video.production_status && Object.prototype.hasOwnProperty.call(statusMap, video.production_status)) {
              statusMap[video.production_status] += 1;
            }
          });
        } else {
          // Valeurs par défaut si pas de données
          statusMap['À monter'] = Math.floor((totalVideos || 0) * 0.6) || 0;
          statusMap['En cours'] = Math.floor((totalVideos || 0) * 0.3) || 0;
          statusMap['Terminé'] = Math.floor((totalVideos || 0) * 0.1) || 0;
        }

        // Récupérer le nombre de catégories
        const categoriesCount = categories?.length || 0;

        // Préparer les données de graphique pour les statuts
        const chartStatusData: StatusChartItem[] = [
          { name: 'À monter', value: statusMap['À monter'], color: COLORS['À monter'] },
          { name: 'En cours', value: statusMap['En cours'], color: COLORS['En cours'] },
          { name: 'Terminé', value: statusMap['Terminé'], color: COLORS['Terminé'] }
        ];
        
        setStatusData(chartStatusData);

        // Préparer les données pour le graphique des activités (7 derniers jours)
        const dateMap = new Map<string, number>();
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateString = date.toLocaleDateString('fr-FR', { weekday: 'short' });
          dateMap.set(dateString, 0);
        }
        
        videos?.forEach((video: CategoryVideo) => {
          if (video.updated_at) {
            const updateDate = new Date(video.updated_at);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 7) {
              const dateString = updateDate.toLocaleDateString('fr-FR', { weekday: 'short' });
              dateMap.set(dateString, (dateMap.get(dateString) || 0) + 1);
            }
          }
        });
        
        const activityChartData: ActivityChartItem[] = Array.from(dateMap.entries()).map(([date, count]) => ({ 
          date, 
          'Modifications': count 
        }));
        
        setActivityData(activityChartData);

        // Préparer les données pour le graphique des catégories
        if (categories && categories.length > 0) {
          // Créer un tableau pour compter les vidéos par catégorie
          const videoCounts: Record<number, number> = {};
          
          // Initialiser les compteurs à 0 pour chaque catégorie
          categories.forEach((category: VideoCategory) => {
            if (category.id) {
              videoCounts[category.id] = 0;
            }
          });
          
          // Compter les vidéos par catégorie
          if (videos && videos.length > 0) {
            videos.forEach((video: CategoryVideo) => {
              const categoryId = video.category_id;
              if (categoryId && typeof videoCounts[categoryId] === 'number') {
                videoCounts[categoryId] += 1;
              }
            });
          }
          
          // Transformer en format utilisable par le graphique
          const categoryStats: CategoryChartItem[] = categories
            .filter((category: VideoCategory) => category.id !== undefined)
            .map((category: VideoCategory) => ({
              name: category.title,
              value: videoCounts[category.id] || 0
            }))
            .sort((a: CategoryChartItem, b: CategoryChartItem) => b.value - a.value)
            .slice(0, 5); // Top 5 catégories
          
          setCategoryData(categoryStats);
        }

        // Calculer les pourcentages de changement à partir des données historiques simulées
        const totalVideosChange = calculatePercentageChange(
          totalVideos || 0,
          historicalData.totalVideos
        );
        
        const terminatedChange = calculatePercentageChange(
          statusMap['Terminé'],
          historicalData.statusCounts['Terminé']
        );
        
        const toEditChange = calculatePercentageChange(
          statusMap['À monter'],
          historicalData.statusCounts['À monter']
        );
        
        const categoriesChange = calculatePercentageChange(
          categoriesCount,
          historicalData.categories
        );
        
        // Mettre à jour les statistiques avec des couleurs
        const updatedStats: VideoStat[] = [
          { 
            title: 'Total Vidéos', 
            value: formatNumber(totalVideos || 0), 
            change: totalVideosChange, 
            icon: <Film className="h-5 w-5" />,
            description: 'Depuis le mois dernier',
            color: 'hsl(210, 95%, 60%)'
          },
          { 
            title: 'À monter', 
            value: formatNumber(statusMap['À monter']), 
            change: toEditChange, 
            icon: <ClipboardList className="h-5 w-5" />,
            description: 'Depuis la semaine dernière',
            color: COLORS['À monter']
          },
          { 
            title: 'Terminées', 
            value: formatNumber(statusMap['Terminé']), 
            change: terminatedChange, 
            icon: <CircleCheck className="h-5 w-5" />,
            description: 'Depuis le mois dernier',
            color: COLORS['Terminé']
          },
          { 
            title: 'Catégories', 
            value: formatNumber(categoriesCount), 
            change: categoriesChange, 
            icon: <FolderClosed className="h-5 w-5" />,
            description: 'Depuis le trimestre',
            color: 'hsl(40, 95%, 65%)'
          },
        ];
        
        setStats(updatedStats);

        // Si videos existe et contient des données
        if (videos && videos.length > 0) {
          // Prendre les 5 vidéos les plus récentes
          const recentVideos = videos.slice(0, 6);
          
          const formattedActivities = recentVideos.map((video: CategoryVideo, index: number) => {
            let action = "modifiée";
            let color = "text-gray-500";
            
            if (video.production_status === 'Terminé') {
              action = "marquée comme terminée";
              color = "text-green-500";
            } else if (video.production_status === 'En cours') {
              action = "déplacée vers 'En cours'";
              color = "text-blue-500";
            }
            
            // Comparer les dates de création et de mise à jour
            const createdDate = new Date(video.created_at || new Date().toISOString());
            const updatedDate = new Date(video.updated_at || new Date().toISOString());
            const hoursSinceCreation = (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
            
            // Si la mise à jour est récente après la création, c'est une nouvelle vidéo
            if (hoursSinceCreation < 1) {
              action = "créée";
            }
            
            return {
              id: video.id,
              title: 'Vidéo mise à jour',
              timestamp: getRelativeTime(updatedDate),
              action: action,
              resourceName: video.title,
              status: video.production_status
            };
          });
          
          setActivities(formattedActivities);
        } else {
          // Aucune activité si pas de vidéos disponibles
          setActivities([]);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erreur lors du chargement des données:', err);
        }
        setError('Impossible de charger les données.');
        
        // Définir des statistiques par défaut en cas d'erreur
        setStats([
          { 
            title: 'Total Vidéos', 
            value: '0', 
            icon: <Film className="h-5 w-5" />,
            description: 'Aucune donnée disponible',
            color: 'hsl(210, 95%, 60%)'
          },
          { 
            title: 'À monter', 
            value: '0', 
            icon: <ClipboardList className="h-5 w-5" />,
            description: 'Aucune donnée disponible',
            color: COLORS['À monter']
          },
          { 
            title: 'Terminées', 
            value: '0', 
            icon: <CircleCheck className="h-5 w-5" />,
            description: 'Aucune donnée disponible',
            color: COLORS['Terminé']
          },
          { 
            title: 'Catégories', 
            value: '0', 
            icon: <FolderClosed className="h-5 w-5" />,
            description: 'Aucune donnée disponible',
            color: 'hsl(40, 95%, 65%)'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <EnhancedPageHeader 
          title="Accueil" 
          description="Chargement des données..."
        />
        <PageContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-md" />
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-[300px] w-full rounded-md" />
              <Skeleton className="h-[300px] w-full rounded-md" />
            </div>
            
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EnhancedPageHeader 
          title="Accueil" 
          description="Une erreur est survenue lors du chargement des données."
        />
        <PageContent>
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <EnhancedPageHeader 
        usePathConfig={true}
      />
      
      <PageContent>
        <div className="space-y-6">
          
          {/* Section des actions rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div onClick={() => setNewVideoDialogOpen(true)}>
              <QuickActionCard
                icon={<FilePlus className="h-5 w-5" />}
                title="Créer une vidéo"
              />
            </div>
            <div onClick={() => setNewCategoryDialogOpen(true)}>
              <QuickActionCard
                icon={<FolderPlus className="h-5 w-5" />}
                title="Créer une catégorie"
              />
            </div>
            <QuickActionCard
              icon={<BellRing className="h-5 w-5" />}
              title="Dernières activités"
              href="/videos?sort=updated_at&sortDir=desc"
            />
            <QuickActionCard
              icon={<FilePieChart className="h-5 w-5" />}
              title="Vidéos prêtes à publier"
              href="/videos?status=Prêt à publier"
            />
          </div>
          
          {/* Statistiques */}
          <Section title="Statistiques" className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                title="Total Vidéos" 
                value={22} 
                icon={<Film className="h-4 w-4" />}
                percentage="-81%" 
                lastUpdated="Depuis le mois dernier"
              />
              
              <StatCard 
                title="À monter" 
                value={8} 
                icon={<ClipboardList className="h-4 w-4" />}
                percentage="-77%" 
                lastUpdated="Depuis la semaine dernière"
              />
              
              <StatCard 
                title="Terminées" 
                value={9} 
                icon={<CircleCheck className="h-4 w-4" />}
                percentage="-84%" 
                lastUpdated="Depuis le mois dernier"
              />
              
              <StatCard 
                title="Catégories" 
                value={11} 
                icon={<FolderClosed className="h-4 w-4" />}
                percentage="-15%" 
                lastUpdated="Depuis le trimestre"
              />
            </div>
          </Section>
          
          {/* Section des activités récentes */}
          <div id="recent-activities">
            <Section
              title="Activités récentes"
              description="Les dernières modifications sur la plateforme"
              className="my-6"
            >
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px]">
                    <div className="divide-y">
                      {activities && activities.length > 0 ? (
                        activities.map((activity, i) => (
                          <div key={i} className="p-4 flex items-start space-x-3 hover:bg-accent/30 transition-colors">
                            <div className="shrink-0 rounded-full bg-primary/10 p-2 h-10 w-10 flex items-center justify-center">
                              {getActivityIcon(activity)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between flex-wrap">
                                <div className="font-medium text-sm md:text-base truncate mr-2">{activity.title}</div>
                                <div className="text-xs md:text-sm text-muted-foreground">{activity.timestamp}</div>
                              </div>
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                                La vidéo <span className="font-medium">{activity.resourceName}</span> a été {activity.action}
                              </p>
                              {activity.status && (
                                <Badge 
                                  variant="outline" 
                                  className="mt-1"
                                  style={{ 
                                    backgroundColor: `${COLORS[activity.status as keyof typeof COLORS]}10`,
                                    color: COLORS[activity.status as keyof typeof COLORS],
                                    borderColor: `${COLORS[activity.status as keyof typeof COLORS]}30`
                                  }}
                                >
                                  {activity.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16">
                          <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageContent>
      
      {/* Modales pour les actions rapides */}
      <Dialog 
        open={newVideoDialogOpen} 
        onOpenChange={(open) => {
          setNewVideoDialogOpen(open);
          // Si on ferme le dialogue, s'assurer que les données sont rafraîchies
          if (!open) {
            router.refresh();
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle vidéo</DialogTitle>
            <DialogDescription>
              Créer une nouvelle vidéo avec un identifiant unique
            </DialogDescription>
          </DialogHeader>
          <NewVideoForm 
            onSuccess={() => setNewVideoDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={newCategoryDialogOpen} 
        onOpenChange={(open) => {
          setNewCategoryDialogOpen(open);
          // Si on ferme le dialogue, s'assurer que les données sont rafraîchies
          if (!open) {
            router.refresh();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
            <DialogDescription>
              Créer une nouvelle catégorie pour organiser vos vidéos
            </DialogDescription>
          </DialogHeader>
          <NewCategoryForm onSuccess={() => setNewCategoryDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
} 