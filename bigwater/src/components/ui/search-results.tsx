"use client";

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

    // Helper function to extract the full reference (letter + number)
    const getFullReference = (result: SearchResult) => {
      if (result.type === 'video') {
        // Si l'identifiant de la vidéo est un nombre et que la catégorie a un identifiant (lettre)
        if (typeof result.identifier === 'number' && result.categoryInfo?.identifier) {
          return `${result.categoryInfo.identifier}${result.identifier}`;
        }
        // Si l'identifiant de la vidéo est déjà au format lettre+nombre
        else if (typeof result.identifier === 'string' && /^[A-Za-z]\d+$/.test(result.identifier)) {
          return result.identifier;
        }
        // Si l'identifiant est un nombre simple
        else if (typeof result.identifier === 'number' || (typeof result.identifier === 'string' && !isNaN(Number(result.identifier)))) {
          // Chercher d'abord l'identifiant de la catégorie
          if (result.categoryInfo?.identifier) {
            return `${result.categoryInfo.identifier}${result.identifier}`;
          }
          return `${result.identifier}`;
        }
        // Fallback
        return result.identifier || `${result.id}`;
      }
      return result.identifier;
    };

    return (
      <div 
        ref={ref}
        className={cn(
          "mt-1 p-1 bg-background rounded-md border shadow-lg max-h-[400px] overflow-y-auto",
          className
        )}
      >
        <div className="divide-y">
          {results.map((result) => {
            // Debug: Afficher la valeur exacte de l'identifiant pour chaque résultat
            console.log(`Result ID: ${result.id}, Type: ${result.type}, Identifier:`, result.identifier);
            
            return (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.url}
                onClick={onResultClick}
                className="flex items-center gap-3 py-2 px-3 hover:bg-muted transition-colors rounded-md"
              >
                {result.type === 'category' ? (
                  <>
                    <div className="flex-shrink-0">
                      <div className="bg-blue-50 dark:bg-blue-950 p-1.5 rounded-md">
                        <FolderIconSolid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{result.title}</h4>
                      {result.identifier && (
                        <span className="text-xs text-muted-foreground">
                          Identifiant: <span className="font-bold text-primary">{result.identifier}</span>
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-shrink-0">
                      <div className="bg-red-50 dark:bg-red-950 p-1.5 rounded-md">
                        <VideoCameraIconSolid className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-primary tracking-wide">
                        {getFullReference(result)}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[280px]">{result.title}</span>
                    </div>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
);

SearchResults.displayName = "SearchResults"; 