"use client";

import { FolderIcon } from '@heroicons/react/24/outline';
import { FolderIcon as FolderIconSolid } from '@heroicons/react/24/solid';
import { VideoCameraIcon as VideoCameraIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { forwardRef } from 'react';

import { SearchResult } from '@/hooks/use-search';
import { cn } from '@/lib/utils';


interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onResultClick?: () => void;
  className?: string;
}

export const SearchResults = forwardRef<HTMLDivElement, SearchResultsProps>(
  ({ results, loading, onResultClick, className }, ref) => {
    if (loading) {
      return (
        <div 
          ref={ref}
          className={cn(
            "mt-1 p-1 bg-background rounded-md border shadow-lg max-h-[400px] overflow-y-auto",
            className
          )}
        >
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Recherche en cours...</span>
          </div>
        </div>
      );
    }

    if (results.length === 0) {
      return null;
    }

    return (
      <div 
        ref={ref}
        className={cn(
          "mt-1 p-1 bg-background rounded-md border shadow-lg max-h-[400px] overflow-y-auto",
          className
        )}
      >
        <div className="divide-y">
          {results.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={result.url}
              onClick={onResultClick}
              className="flex items-start gap-3 py-3 px-4 hover:bg-muted transition-colors rounded-md"
            >
              {result.type === 'category' ? (
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-blue-50 dark:bg-blue-950 p-1.5 rounded-md">
                    <FolderIconSolid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-red-50 dark:bg-red-950 p-1.5 rounded-md">
                    <VideoCameraIconSolid className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium truncate">{result.title}</h4>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {result.type === 'category' ? 'Catégorie' : 'Vidéo'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-col space-y-0.5">
                  {result.type === 'category' ? (
                    <span>Identifiant: {result.identifier}</span>
                  ) : (
                    <>
                      <span>ID: {result.id}</span>
                      {result.categoryInfo && (
                        <span className="flex items-center gap-1">
                          <FolderIcon className="h-3 w-3 text-blue-500" />
                          <span className="truncate">
                            {result.categoryInfo.title || `Catégorie ${result.categoryInfo.id}`}
                            {result.categoryInfo.identifier && ` (${result.categoryInfo.identifier})`}
                          </span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
);

SearchResults.displayName = "SearchResults"; 