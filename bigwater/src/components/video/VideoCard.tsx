'use client';

import { Folder, ChevronRight, Clock, RotateCw, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';



export type VideoCardProps = {
  video: {
    id: number;
    title: string;
    status?: string;
    production_status?: string;
    category_id: number;
    identifier?: number | null;
    created_at: string | null;
    updated_at?: string | null;
    description?: string;
    thumbnail_url?: string;
    category?: {
      title: string;
      identifier?: string | number;
    };
  };
  /** Taille de la carte: default, small, large */
  size?: 'default' | 'small' | 'large';
  /** Si true, les effets interactifs sont appliqués (hover, etc.) */
  interactive?: boolean;
  /** Afficher ou non les détails de catégorie */
  showCategory?: boolean;
  /** URL personnalisée pour le lien, par défaut /video/[id] */
  href?: string;
  /** Classe CSS personnalisée */
  className?: string;
  /** Pour mobile: ajustements spécifiques si nécessaire */
  isMobile?: boolean;
  /** Fonction de clic personnalisée au lieu du lien */
  onClick?: () => void;
};

export function VideoCard({ 
  video, 
  size = 'default',
  interactive = true,
  showCategory = true,
  href,
  className,
  isMobile: propIsMobile,
  onClick
}: VideoCardProps) {
  // Détection automatique du mode mobile si non fourni en prop
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Si isMobile est fourni en props, on l'utilise
    if (propIsMobile !== undefined) {
      setIsMobile(propIsMobile);
      return;
    }
    
    // Sinon on détecte la taille d'écran
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [propIsMobile]);
  
  // Ajuster automatiquement la taille en fonction du mode mobile
  const effectiveSize = isMobile ? 'small' : size;
  
  const videoStatus = video.status || video.production_status || 'À monter';
  const linkPath = href || (video.id ? `/video/${video.id}` : '/videos');
  
  // Formater l'identifiant selon le format standardisé #A-2
  const formatVideoIdentifier = () => {
    const categoryId = video.category?.identifier || video.category_id;
    const videoId = video.identifier || 'N/A';
    
    // Si categoryId est un nombre, le convertir en lettre
    // (par exemple 1 = A, 2 = B, etc.)
    let categoryPrefix;
    if (typeof categoryId === 'number') {
      // Convertir en lettre (1 => A, 2 => B, etc.)
      categoryPrefix = String.fromCharCode(64 + categoryId);
    } else if (typeof categoryId === 'string' && categoryId.length === 1) {
      // Si c'est déjà une lettre, l'utiliser tel quel
      categoryPrefix = categoryId.toUpperCase();
    } else {
      // Fallback au cas où
      categoryPrefix = categoryId;
    }
    
    return `#${categoryPrefix}-${videoId}`;
  };
  
  const videoIdentifier = formatVideoIdentifier();
  
  // Définition standard des couleurs et icônes de statut
  const statuses = {
    'À monter': {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30',
      icon: <Clock className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'}`} aria-hidden="true" />,
      ariaLabel: 'Statut: À monter'
    },
    'En cours': {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30',
      icon: <RotateCw className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'}`} aria-hidden="true" />,
      ariaLabel: 'Statut: En cours'
    },
    'Terminé': {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30',
      icon: <CheckCircle className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'}`} aria-hidden="true" />,
      ariaLabel: 'Statut: Terminé'
    },
  };

  // Récupérer les styles de statut ou définir des valeurs par défaut
  const statusStyle = statuses[videoStatus as keyof typeof statuses] || {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800/30',
    icon: <Clock className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'}`} aria-hidden="true" />,
    ariaLabel: 'Statut: Non défini'
  };

  // Ajuster les styles en fonction de la taille
  const cardStyles = cn(
    "flex flex-col overflow-hidden border relative",
    isMobile ? "rounded-xl border-neutral-800 bg-neutral-900" : "",
    interactive && [
      "transition-all duration-300 ease-in-out",
      !isMobile && [
        "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
        "hover:before:border-primary/10 before:opacity-0 hover:before:opacity-100",
        "hover:-translate-y-1"
      ],
      "relative before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-transparent before:transition-all"
    ],
    "h-[calc(100%-1px)]",
    effectiveSize === 'small' && "h-full max-h-[280px] sm:max-h-none",
    effectiveSize === 'large' && "h-full",
    "sm:h-full md:h-full",
    isMobile && "touch-manipulation",
    className
  );

  const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
    if (onClick) {
      return (
        <div 
          onClick={onClick} 
          className={cn(
            "cursor-pointer w-full h-full",
            isMobile && "active:bg-primary/5 transition-colors"
          )}
          role="button"
          tabIndex={0}
          aria-label={`Ouvrir la vidéo ${video.title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
        >
          {children}
        </div>
      );
    }
    
    if (!video.id) {
      // Si pas d'ID, on affiche juste la carte sans lien
      return <div className="w-full h-full">{children}</div>;
    }
    
    return (
      <Link 
        href={linkPath} 
        prefetch={false} 
        className={cn(
          "block w-full h-full",
          isMobile && "active:bg-primary/5 transition-colors"
        )}
        aria-label={`Voir les détails de la vidéo ${video.title}`}
      >
        {children}
      </Link>
    );
  };

  const formattedDate = video.created_at 
    ? new Date(video.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      })
    : new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });

  // Optimiser l'affichage du texte en fonction de la taille de l'écran
  const titleLineClamp = isMobile ? 'line-clamp-1' : 'line-clamp-2';
  
  const cardContent = (
    <Card className={cardStyles}>
      <CardContent className="flex flex-col flex-grow p-0">
        {/* Vignette si disponible */}
        {video.thumbnail_url && (
          <div className={cn(
            "w-full overflow-hidden bg-neutral-800",
            isMobile ? "rounded-t-xl" : "rounded-t-lg",
            effectiveSize === 'small' && isMobile ? "h-24" : "h-20 sm:h-28 md:h-32 lg:h-36",
            effectiveSize === 'large' && "h-32 sm:h-36 md:h-40 lg:h-48",
            effectiveSize === 'default' && "h-28 sm:h-32 md:h-36 lg:h-40"
          )}>
            <img 
              src={video.thumbnail_url} 
              alt={`Vignette pour ${video.title}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        {/* Contenu */}
        <div className={cn(
          "flex-grow flex flex-col justify-between",
          isMobile ? "p-3" : "p-3 sm:p-4",
          "flex-1 min-h-[90px] sm:min-h-[120px] md:min-h-[150px]"
        )}>
          {/* Layout pour l'affichage en grille */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className={cn(
                "font-medium transition-colors",
                titleLineClamp,
                isMobile ? "text-sm text-white" : "text-sm sm:text-base text-foreground",
                interactive && !isMobile && "group-hover:text-primary"
              )}>
                {video.title}
              </h3>
              
              {showCategory && (
                <div className="flex items-center text-muted-foreground" style={{
                  fontSize: isMobile ? '0.7rem' : '0.75rem'
                }}>
                  <div 
                    className={cn(
                      "bg-primary/10 rounded-full flex items-center justify-center mr-1.5 flex-shrink-0",
                      isMobile ? "h-4 w-4" : "h-5 w-5",
                      interactive && !isMobile && "transition-transform group-hover:scale-110"
                    )}
                    aria-hidden="true"
                  >
                    <Folder className={isMobile ? "h-3 w-3" : "h-3 w-3"} style={{ color: 'var(--primary)' }} />
                  </div>
                  <span className={isMobile ? "text-neutral-400" : ""} title={video.category?.title || 'Sans catégorie'}>
                    {video.category?.title || 'Sans catégorie'}
                  </span>
                </div>
              )}
            </div>
            
            <div className={cn(
              "flex flex-col items-end ml-3 space-y-1",
              isMobile ? "mt-0.5" : ""
            )}>
              <Badge 
                className={cn(
                  isMobile ? "px-2 py-0.5 text-xs font-medium" : "px-2 py-1 text-xs font-medium",
                  "flex items-center gap-1 border whitespace-nowrap",
                  statusStyle.color
                )}
                aria-label={statusStyle.ariaLabel}
              >
                {statusStyle.icon}
                <span>{videoStatus}</span>
              </Badge>
              
              <span 
                className={cn(
                  "text-muted-foreground font-mono",
                  isMobile ? "text-xs text-neutral-500" : "text-xs"
                )} 
                aria-label={`Identifiant: ${videoIdentifier}`}
              >
                {videoIdentifier}
              </span>
            </div>
          </div>
          
          <div className={cn(
            "text-muted-foreground mt-1",
            isMobile ? "text-xs text-neutral-500" : "text-xs"
          )} 
          aria-label={`Date: ${formattedDate}`}
          >
            {formattedDate}
          </div>

          {/* Indicateur visuel au survol (seulement sur desktop) */}
          {interactive && !isMobile && (
            <div 
              className="absolute bottom-2 right-2 transform translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
              aria-hidden="true"
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </div>
          )}
          
          {/* Indicateur tactile sur mobile */}
          {interactive && isMobile && (
            <div 
              className="absolute bottom-3 right-3"
              aria-hidden="true"
            >
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ContentWrapper>
      {cardContent}
    </ContentWrapper>
  );
} 