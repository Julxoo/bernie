"use client";

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/inputs/input';
import { SearchResults } from '@/components/ui/search-results';

import { useSearch } from '@/hooks/use-search';



interface SearchBarProps {
  isMobile?: boolean;
  onClose?: () => void;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({ isMobile = false, onClose, className, onFocus, onBlur }: SearchBarProps) {
  const { query, setQuery, results, loading } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Pour éviter les erreurs de rendu côté serveur avec createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Gestion du clic en dehors des résultats pour fermer la liste
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Ne rien faire si les résultats ne sont pas affichés
      if (!showResults) return;
      
      // Vérifier si le clic est en dehors du conteneur de recherche
      const isOutsideSearchContainer = searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node);
      
      // Vérifier si le clic est sur un élément des résultats (qui sont maintenant dans le portail)
      const resultsElements = document.querySelectorAll("[data-search-results]");
      let isOnResults = false;
      
      resultsElements.forEach(element => {
        if (element.contains(event.target as Node)) {
          isOnResults = true;
        }
      });
      
      // Fermer seulement si le clic est en dehors du conteneur ET en dehors des résultats
      if (isOutsideSearchContainer && !isOnResults) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  // Focus automatique sur l'input lors du montage (pour mobile)
  useEffect(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length > 0);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery('');
    if (onClose) onClose();
  };

  const handleClearSearch = () => {
    setQuery('');
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFocus = () => {
    if (query) setShowResults(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
    // Ne pas fermer les résultats immédiatement pour permettre les clics sur les résultats
    // La fermeture est gérée par handleClickOutside
  };

  // Calculer la position des résultats par rapport à la barre de recherche
  const getResultsPosition = () => {
    if (!searchContainerRef.current) return {};
    
    const rect = searchContainerRef.current.getBoundingClientRect();
    
    return {
      position: 'fixed' as const,
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      zIndex: 9999
    };
  };

  return (
    <div ref={searchContainerRef} className={`relative w-full ${className || ''}`}>
      <div className="relative flex w-full">
        <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Rechercher..."
          className={cn(
            "pl-8 rounded-md w-full",
            isMobile && "pr-8"
          )}
          autoComplete="off"
        />
        {query && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0" 
            onClick={handleClearSearch}
            aria-label="Effacer la recherche"
          >
          </Button>
        )}
        {isMobile && !query && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0" 
            onClick={onClose}
            aria-label="Fermer la recherche"
          >
          </Button>
        )}
      </div>

      {showResults && mounted && createPortal(
        <div style={getResultsPosition()} data-search-results>
          <SearchResults 
            results={results} 
            loading={loading}
            onResultClick={handleResultClick}
            className={isMobile ? "max-h-[calc(100vh-150px)]" : "max-h-[calc(100vh-200px)]"}
          />
        </div>,
        document.body
      )}
    </div>
  );
} 