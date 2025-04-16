import { Suspense } from 'react';

import { CategoriesClient } from './categories-client';
import { ClientActionsWrapper } from './client-actions-wrapper';

import type { VideoCategory } from '@/types/api';

import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Skeleton } from '@/components/ui/feedback/skeleton';
import { NewCategoryDialog } from '@/components/video/new-category-dialog';
import { createClient } from '@/lib/supabase/server';
import { FolderIcon } from '@heroicons/react/24/outline';

// Type pour les catégories avec leurs vidéos associées
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

// Fonction serveur pour récupérer toutes les catégories
async function fetchCategories(): Promise<CategoryWithVideos[]> {
  // Utiliser directement Supabase côté serveur au lieu de passer par l'API
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('video_categories')
    .select('*')
    .order('title', { ascending: true });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as CategoryWithVideos[];
}

// Composant Skeleton amélioré pour les catégories
function CategoryListSkeleton() {
  return (
    <PageContent>
      <Section>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="p-6 bg-card/80 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </PageContent>
  );
}

// Component to wrap CategoryList and make it a server component
async function CategoryServerWrapper() {
  const categories = await fetchCategories();
  
  return (
    <PageContent>
      <Section>
        <CategoriesClient initialCategories={categories} />
      </Section>
    </PageContent>
  );
}

export default async function CategoriesPage() {
  const actions = (
    <NewCategoryDialog />
  );

  return (
    <PageContainer>
      <EnhancedPageHeader 
        usePathConfig={true}
        actions={actions}
        icon={<FolderIcon className="h-6 w-6" aria-hidden="true" />}
      />
      
      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryServerWrapper />
      </Suspense>

      {/* Actions mobiles flottantes */}
      <ClientActionsWrapper />
    </PageContainer>
  );
} 