import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { CategoryVideo, VideoCategory, VideoDetails } from '@/types/api';

import { createClient } from '@/lib/supabase/server';

import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { VideoContainer } from '@/components/video/id/video-container';

export default async function VideoDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  // Attendre la résolution de la Promise params
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const videoId = parseInt(id);
  
  if (isNaN(videoId)) {
    console.error('ID de vidéo invalide:', id);
    notFound();
  }

  try {
    // Création d'un client Supabase côté serveur
    const supabase = await createClient();

    // Récupération des données de la vidéo avec ses détails
    let video;
    try {
      const { data, error } = await supabase
        .from('category_videos')
        .select('*, video_details(*)')
        .eq('id', videoId)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Vidéo non trouvée');
      
      // Définir un type temporaire pour faciliter la manipulation des données
      type CategoryVideoWithDetails = CategoryVideo & { 
        video_details: VideoDetails | VideoDetails[] | null;
        description?: string | null;
        miniature_instruction?: string | null;
        link_rush?: string | null;
        link_video?: string | null;
        link_miniature?: string | null;
      };
      
      // Cast des données avec notre type
      const videoData = data as CategoryVideoWithDetails;
      
      // Supabase renvoie la relation 1→1 sous forme de tableau ;
      // on aplatit donc le premier (et unique) élément pour rester cohérent
      if (Array.isArray(videoData.video_details)) {
        videoData.video_details = videoData.video_details[0] || {} as VideoDetails;
      }

      // Fusionner les champs éventuellement stockés directement dans category_videos
      const cat = videoData as CategoryVideo & { video_details?: VideoDetails };
      const details = cat.video_details || {} as VideoDetails;

      cat.video_details = {
        id: details.id ?? 0,
        category_video_id: videoId,
        title: details.title ?? cat.title,
        production_status: details.production_status ?? cat.production_status,
        // Priorité : valeur dans video_details sinon colonne de category_videos sinon null
        description: details.description ?? (cat as CategoryVideo & { description?: string | null }).description ?? null,
        instructions_miniature: details.instructions_miniature ?? (cat as CategoryVideo & { miniature_instruction?: string | null }).miniature_instruction ?? null,
        rush_link: details.rush_link ?? (cat as CategoryVideo & { link_rush?: string | null }).link_rush ?? null,
        video_link: details.video_link ?? (cat as CategoryVideo & { link_video?: string | null }).link_video ?? null,
        miniature_link: details.miniature_link ?? (cat as CategoryVideo & { link_miniature?: string | null }).link_miniature ?? null,
        created_at: details.created_at ?? cat.created_at,
        updated_at: details.updated_at ?? cat.updated_at
      } as VideoDetails;

      video = videoData as CategoryVideo & { video_details: VideoDetails };
    } catch (error) {
      console.error('Erreur lors de la récupération de la vidéo:', error);
      throw new Error(`Erreur lors de la récupération de la vidéo: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    if (!video) {
      console.error('Vidéo non trouvée pour l\'id:', videoId);
      notFound();
    }

    // Si video_details est null ou undefined, initialisons-le avec un objet vide
    if (!video.video_details) {
      console.warn('Détails de la vidéo manquants, utilisation de valeurs par défaut');
      video.video_details = {
        id: 0,
        category_video_id: videoId,
        title: video.title,
        description: null,
        production_status: video.production_status,
        rush_link: null,
        video_link: null,
        miniature_link: null,
        instructions_miniature: null,
        created_at: video.created_at,
        updated_at: video.updated_at
      };
    }

    // Récupérer l'utilisateur connecté
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Récupérer la catégorie de la vidéo
    let category: VideoCategory | null = null;
    if (video.category_id) {
      try {
        const { data, error } = await supabase
          .from('video_categories')
          .select('*')
          .eq('id', video.category_id)
          .single();

        if (error) throw error;
        category = data as VideoCategory;
      } catch (error) {
        console.warn('Erreur lors de la récupération de la catégorie:', error);
        // On continue même si la catégorie n'a pas pu être récupérée
      }
    }

    // Définir le chemin de retour
    const returnUrl = category ? `/dashboard/categories/${category.id}` : '/dashboard/videos';

    // Tout s'est bien passé, retournons les données
    return (
      <PageContainer>
        <EnhancedPageHeader
          title={video.title}
          badge={video.identifier ? { text: `#${video.identifier}`, variant: "outline" } : undefined}
          breadcrumbs={[
            { title: "Accueil", href: "/dashboard/dashboard" },
            { title: "Vidéos", href: "/dashboard/videos" },
            ...(category ? [{ title: category.title, href: `/dashboard/categories/${category.id}` }] : []),
            { title: video.title }
          ]}
          actions={
            <Button variant="ghost" size="sm" asChild>
              <Link href={returnUrl}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
          }
        />
        
        <PageContent>
          <Suspense fallback={<VideoDetailsSkeleton />}>
            <VideoContainer 
              video={video} 
              category={category}
              userId={userId}
              returnUrl={returnUrl}
            />
          </Suspense>
        </PageContent>
      </PageContainer>
    );
    
  } catch (error) {
    console.error('Erreur lors du chargement de la page vidéo:', error);
    return (
      <PageContainer>
        <EnhancedPageHeader 
          title="Erreur" 
          breadcrumbs={[
            { title: "Accueil", href: "/dashboard/dashboard" },
            { title: "Vidéos", href: "/dashboard/videos" },
            { title: "Erreur" }
          ]}
        />
        <PageContent>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex flex-col items-center justify-center">
            <h2 className="text-lg font-medium mb-2">Une erreur est survenue</h2>
            <p className="text-base">Impossible de récupérer les détails de la vidéo.</p>
            <p className="text-sm mt-2 mb-4 text-muted-foreground">
              {error instanceof Error ? error.message : "Erreur inconnue"}
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/dashboard/videos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste des vidéos
              </Link>
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    );
  }
}

function VideoDetailsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      <Skeleton className="h-12 w-full max-w-md mb-8" />
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2 mb-8 w-full">
        <div className="w-full">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </div>
        <div className="w-full">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
} 