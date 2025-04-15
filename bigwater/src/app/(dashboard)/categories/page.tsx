import { Suspense } from 'react';

import { CategoriesClient } from './categories-client';
import { ClientActionsWrapper } from './client-actions-wrapper';

import type { VideoCategory } from '@/types/api';

import { PageContainer, PageContent } from '@/components/layout/page-container';
import { EnhancedPageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Skeleton } from '@/components/ui/skeleton';
import { NewCategoryDialog } from '@/components/video/NewCategoryDialog';
import { videoService } from '@/lib/services';

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
async function fetchCategories() {
  return await videoService.getCategories() as CategoryWithVideos[];
}

function CategoryListSkeleton() {
  return (
    <PageContent>
      <Section>
        <Skeleton className="h-12 w-full mb-4 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
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
      />
      
      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryServerWrapper />
      </Suspense>

      {/* Actions mobiles flottantes */}
      <ClientActionsWrapper />
    </PageContainer>
  );
} 