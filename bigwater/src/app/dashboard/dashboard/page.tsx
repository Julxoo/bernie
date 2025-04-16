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
  Link2,
  FileText,
  User,
} from "lucide-react";
import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Badge } from '@/components/ui/data-display/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/overlays/dialog';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { NewVideoForm } from '@/components/video/new-video-form';
import { formatNumber, getRelativeTime } from '@/lib/utils';
import { 
  ActivityItem, 
  VideoStat, 
  QuickActionCardProps, 
} from '@/types';
import { CategoryVideo } from '@/types/api';
import { useRouter } from 'next/navigation';
import { getCategoryVideos } from '@/services/api/categoryVideos';
import { getVideoCategories } from '@/services/api/videoCategories';
import { NewCategoryForm } from '@/components/video/new-category-form';
import { getProfiles } from '@/services/api/profiles';
import { getUserActivities } from '@/services/api/userActivity';

const COLORS = {
  'À monter': 'hsl(40, 95%, 45%)',
  'En cours': 'hsl(220, 95%, 45%)',
  'Terminé': 'hsl(130, 95%, 35%)',
};

const getActivityIcon = (activity: ActivityItem) => {
  if (activity.title.includes('Catégorie')) {
    return <FolderPlus className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.changeType === 'Création') {
    return <PlusCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.changeType === 'Changement de statut' && activity.status === 'Terminé') {
    return <CircleCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.changeType === 'Changement de statut' && activity.status === 'En cours') {
    return <Clock3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.changeType === 'Mise à jour de lien') {
    return <Link2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else if (activity.changeType === 'Mise à jour de description') {
    return <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  } else {
    return <Edit className="h-4 w-4 md:h-5 md:w-5 text-primary" />;
  }
};

const StatCard = ({ title, value, icon, href }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
}) => {
  const content = (
    <div className="bg-background rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="rounded-md p-2 bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
};

const QuickActionCard = ({ icon, title, onClick, href }: QuickActionCardProps) => {
  const content = (
    <div className="rounded-lg border bg-background shadow-sm p-4 flex flex-col items-center justify-center hover:shadow-md transition-all h-full cursor-pointer">
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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VideoStat[]>([]);
  const [newVideoDialogOpen, setNewVideoDialogOpen] = useState(false);
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const router = useRouter();
  const isInitialRender = useRef(true);

  // Fonction pour extraire en toute sécurité les détails JSON
  const safeParseJSON = (jsonString: string | object | undefined) => {
    if (jsonString === undefined) {
      return {};
    }
    
    if (typeof jsonString !== 'string') {
      return jsonString || {};
    }
    
    try {
      const trimmedJson = jsonString.trim();
      if (!trimmedJson || !trimmedJson.startsWith('{')) {
        return {};
      }
      return JSON.parse(trimmedJson);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur lors du parsing JSON:', e, jsonString);
      }
      return {};
    }
  };

  const fetchDashboardData = useCallback(async function() {
    setLoading(true);
    setError(null);

    try {
      const videos = await getCategoryVideos();
      const categories = await getVideoCategories();
      const userActivities = await getUserActivities();
      const profiles = await getProfiles();
      
      const totalVideos = videos?.length || 0;
      const statusMap: Record<string, number> = { 
        'À monter': 0, 
        'En cours': 0, 
        'Terminé': 0 
      };
      
      if (videos && videos.length > 0) {
        videos.forEach((video: CategoryVideo) => {
          if (video.production_status && Object.prototype.hasOwnProperty.call(statusMap, video.production_status)) {
            statusMap[video.production_status] += 1;
          }
        });
      } else {
        statusMap['À monter'] = Math.floor((totalVideos || 0) * 0.6) || 0;
        statusMap['En cours'] = Math.floor((totalVideos || 0) * 0.3) || 0;
        statusMap['Terminé'] = Math.floor((totalVideos || 0) * 0.1) || 0;
      }

      const categoriesCount = categories?.length || 0;
      
      if (videos && videos.length > 0 && userActivities && userActivities.length > 0) {
        // Trier les vidéos par date de mise à jour (la plus récente d'abord)
        const sortedVideos = [...videos].sort((a, b) => {
          const dateA = new Date(a.updated_at || '').getTime();
          const dateB = new Date(b.updated_at || '').getTime();
          return dateB - dateA;
        });
        
        // Récupérer seulement les activités liées aux vidéos et catégories
        const videoRelatedActivities = userActivities.filter(activity => 
          activity.action_type.includes('video') || 
          activity.action_type.includes('category')
        );
        
        // Créer une map pour associer les utilisateurs à leurs noms
        const userMap = new Map();
        if (profiles && profiles.length > 0) {
          profiles.forEach(profile => {
            userMap.set(profile.id, profile.name || profile.email || 'Utilisateur');
          });
        }
        
        // Fusionner les informations des vidéos avec les activités des utilisateurs
        const enrichedActivities = [];
        
        // D'abord, traiter les activités utilisateur récentes (maximum 10)
        const recentActivities = videoRelatedActivities.slice(0, 10);
        
        for (const activity of recentActivities) {
          try {
            const details = safeParseJSON(activity.details);
            const relatedVideo = videos.find(v => v.id === details?.video_id || v.id === details?.entity_id);
            
            if (relatedVideo) {
              let actionDescription = '';
              let changeType = '';
              
              switch (activity.action_type) {
                case 'video_created':
                  actionDescription = 'créée';
                  changeType = 'Création';
                  break;
                case 'video_updated':
                  actionDescription = 'modifiée';
                  changeType = 'Modification';
                  break;  
                case 'video_status_changed':
                  actionDescription = `déplacée vers '${relatedVideo.production_status}'`;
                  changeType = 'Changement de statut';
                  break;
                case 'video_link_updated':
                  actionDescription = 'liens mis à jour';
                  changeType = 'Mise à jour de lien';
                  break;
                case 'video_description_updated':
                  actionDescription = 'description modifiée';
                  changeType = 'Mise à jour de description';
                  break;
                default:
                  actionDescription = 'modifiée';
                  changeType = 'Modification';
              }
              
              const userName = userMap.get(activity.user_id) || 'Utilisateur';
              
              enrichedActivities.push({
                id: relatedVideo.id,
                title: changeType,
                timestamp: getRelativeTime(new Date(activity.created_at)),
                action: actionDescription,
                resourceName: relatedVideo.title,
                status: relatedVideo.production_status,
                userName: userName,
                userId: activity.user_id,
                changeType: changeType
              });
            }
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Erreur lors du traitement de l\'activité:', err);
            }
          }
        }
        
        // Si nous n'avons pas assez d'activités enrichies, compléter avec les vidéos récemment mises à jour
        if (enrichedActivities.length < 6) {
          const recentVideos = sortedVideos.slice(0, 6 - enrichedActivities.length);
          
          for (const video of recentVideos) {
            // Vérifier si cette vidéo n'est pas déjà dans enrichedActivities
            if (!enrichedActivities.some(a => a.id === video.id)) {
              let action = "modifiée";
              let changeType = "Modification";
              
              if (video.production_status === 'Terminé') {
                action = "marquée comme terminée";
                changeType = "Changement de statut";
              } else if (video.production_status === 'En cours') {
                action = "déplacée vers 'En cours'";
                changeType = "Changement de statut";
              }
              
              const createdDate = new Date(video.created_at || new Date().toISOString());
              const updatedDate = new Date(video.updated_at || new Date().toISOString());
              const hoursSinceCreation = (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
              
              if (hoursSinceCreation < 1) {
                action = "créée";
                changeType = "Création";
              }
              
              // Essayer de trouver l'utilisateur qui a modifié cette vidéo
              const videoActivity = userActivities.find(a => {
                try {
                  const details = safeParseJSON(a.details);
                  return details?.video_id === video.id || details?.entity_id === video.id;
                } catch {
                  return false;
                }
              });
              
              const userId = videoActivity?.user_id || '';
              const userName = userId ? (userMap.get(userId) || 'Utilisateur') : 'Système';
              
              enrichedActivities.push({
                id: video.id,
                title: changeType,
                timestamp: getRelativeTime(updatedDate),
                action: action,
                resourceName: video.title,
                status: video.production_status,
                userName: userName,
                userId: userId,
                changeType: changeType
              });
            }
          }
        }
        
        // Trier les activités enrichies par date
        enrichedActivities.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        });
        
        setActivities(enrichedActivities.slice(0, 6));
      } else {
        setActivities([]);
      }

      const updatedStats: VideoStat[] = [
        { 
          title: 'Total Vidéos', 
          value: formatNumber(totalVideos || 0),
          icon: <Film className="h-5 w-5" />,
          color: 'hsl(210, 95%, 60%)',
          href: '/videos'
        },
        { 
          title: 'À monter', 
          value: formatNumber(statusMap['À monter']),
          icon: <ClipboardList className="h-5 w-5" />,
          color: COLORS['À monter'],
          href: '/videos?filter=a-monter'
        },
        { 
          title: 'Terminées', 
          value: formatNumber(statusMap['Terminé']),
          icon: <CircleCheck className="h-5 w-5" />,
          color: COLORS['Terminé'],
          href: '/videos?filter=termine'
        },
        { 
          title: 'Catégories', 
          value: formatNumber(categoriesCount),
          icon: <FolderClosed className="h-5 w-5" />,
          color: 'hsl(40, 95%, 65%)',
          href: '/categories'
        },
      ];
      
      setStats(updatedStats);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur lors du chargement des données:', err);
      }
      setError('Impossible de charger les données.');
      
      setStats([
        { 
          title: 'Total Vidéos', 
          value: '0', 
          icon: <Film className="h-5 w-5" />,
          color: 'hsl(210, 95%, 60%)',
          href: '/videos'
        },
        { 
          title: 'À monter', 
          value: '0', 
          icon: <ClipboardList className="h-5 w-5" />,
          color: COLORS['À monter'],
          href: '/videos?filter=a-monter'
        },
        { 
          title: 'Terminées', 
          value: '0', 
          icon: <CircleCheck className="h-5 w-5" />,
          color: COLORS['Terminé'],
          href: '/videos?filter=termine'
        },
        { 
          title: 'Catégories', 
          value: '0', 
          icon: <FolderClosed className="h-5 w-5" />,
          color: 'hsl(40, 95%, 65%)',
          href: '/categories'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Effet pour détecter quand les modales sont fermées
  useEffect(() => {
    // Ignorer le premier rendu
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Si une modale a été fermée, marquer pour rafraîchissement
    if (!newVideoDialogOpen && !newCategoryDialogOpen) {
      setShouldRefresh(true);
    }
  }, [newVideoDialogOpen, newCategoryDialogOpen]);
  
  // Effet pour rafraîchir les données quand nécessaire
  useEffect(() => {
    if (shouldRefresh && !loading) {
      setShouldRefresh(false);
      fetchDashboardData();
    }
  }, [shouldRefresh, loading, fetchDashboardData]);

  if (loading) {
    return (
      <PageContainer>
        <EnhancedPageHeader 
          usePathConfig={true}
          description="Chargement des données..."
        />
        <PageContent>
          <div className="space-y-6">
            {/* Skeleton pour les actions rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border bg-background shadow-sm p-4">
                  <div className="flex flex-col items-center justify-center">
                    <Skeleton className="h-10 w-10 rounded-full mb-3" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Skeleton pour les statistiques */}
            <div>
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-background rounded-lg border shadow-sm overflow-hidden p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <div className="flex items-center mt-1">
                      <Skeleton className="h-4 w-12 mr-2 rounded-sm" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Skeleton pour les activités récentes */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Skeleton className="h-8 w-40 mb-1" />
                  <Skeleton className="h-5 w-64" />
                </div>
              </div>
              
              <div className="border rounded-lg shadow-sm">
                <div className="h-[350px] overflow-hidden">
                  <div className="divide-y">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-4 flex items-start space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between flex-wrap">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
              href="/dashboard/videos?sort=updated_at&sortDir=desc"
            />
            <QuickActionCard
              icon={<FilePieChart className="h-5 w-5" />}
              title="Vidéos en cours"
              href="/dashboard/videos?filter=en-cours"
            />
          </div>
          
          {/* Statistiques */}
          <Section title="Statistiques" className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <StatCard 
                  key={index}
                  title={stat.title} 
                  value={stat.value} 
                  icon={stat.icon}
                  href={stat.href}
                />
              ))}
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
                          <Link 
                            href={`/dashboard/videos/${activity.id}`} 
                            key={i} 
                            className="block"
                          >
                            <div className="p-4 flex items-start space-x-3 hover:bg-accent/30 transition-colors cursor-pointer">
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
                                <div className="flex items-center justify-between mt-1">
                                  {activity.status && (
                                    <Badge 
                                      variant="outline" 
                                      className="mr-2"
                                      style={{ 
                                        backgroundColor: `${COLORS[activity.status as keyof typeof COLORS]}10`,
                                        color: COLORS[activity.status as keyof typeof COLORS],
                                        borderColor: `${COLORS[activity.status as keyof typeof COLORS]}30`
                                      }}
                                    >
                                      {activity.status}
                                    </Badge>
                                  )}
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {activity.userName}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
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