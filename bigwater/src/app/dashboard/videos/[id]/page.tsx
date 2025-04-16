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

// Désactiver temporairement la règle ESLint pour ce cas spécifique
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function VideoDetailPage(props: any) {
  // Utiliser directement les paramètres
  const { id } = props.params;
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
      
      video = data as CategoryVideo & { video_details: VideoDetails };
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
            { title: "Accueil", href: "/dashboard" },
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
            { title: "Accueil", href: "/dashboard" },
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