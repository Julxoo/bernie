"use client";

import { 
  FolderIcon, 
  Squares2X2Icon, 
  VideoCameraIcon,
  ChartBarIcon,
  UserIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  HomeIcon
} from "@heroicons/react/24/outline";
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';

import { PageHeaderEnhanced } from './page-container';

// Types
interface PageTitleConfig {
  icon: React.ReactNode;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
}

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BadgeConfig {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

interface PageHeaderProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: BadgeConfig;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  /** Si true, utilise automatiquement le titre et l'icône en fonction de la route */
  usePathConfig?: boolean;
}

// Constantes
const DEFAULT_CONFIG: PageTitleConfig = {
  icon: <HomeIcon className="h-6 w-6" />,
  title: "AlexSeta",
  breadcrumbs: [{ title: "Accueil", href: "/dashboard" }]
};

/**
 * Configuration des pages en fonction des chemins d'URL
 */
const getPageConfig = (pathname: string): PageTitleConfig => {
  // Configuration de base par défaut
  if (!pathname) return DEFAULT_CONFIG;
  
  // Mappings des routes vers leurs configurations
  const routeConfigs: Record<string, PageTitleConfig> = {
    '/dashboard': {
      icon: <Squares2X2Icon className="h-6 w-6" />,
      title: "Accueil",
      breadcrumbs: [{ title: "Accueil" }]
    },
    
    '/categories': {
      icon: <FolderIcon className="h-6 w-6" />,
      title: "Catégories",
      breadcrumbs: [
        { title: "Accueil", href: "/dashboard" },
        { title: "Catégories" }
      ]
    },
    
    '/videos': {
      icon: <VideoCameraIcon className="h-6 w-6" />,
      title: "Gestion des Vidéos",
      breadcrumbs: [
        { title: "Accueil", href: "/dashboard" },
        { title: "Vidéos" }
      ]
    },
    
    '/statistics': {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: "Statistiques",
      description: "Analysez les performances de vos vidéos",
      breadcrumbs: [
        { title: "Accueil", href: "/dashboard" },
        { title: "Statistiques" }
      ]
    },
    
    '/dashboard/profile': {
      icon: <UserIcon className="h-6 w-6" />,
      title: "Profil",
      description: "Gérez vos informations personnelles",
      breadcrumbs: [
        { title: "Accueil", href: "/dashboard" },
        { title: "Profil" }
      ]
    },
    
    '/admin': {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: "Administration",
      description: "Paramètres administrateur",
      breadcrumbs: [
        { title: "Accueil", href: "/dashboard" },
        { title: "Administration" }
      ]
    },
    
    '/settings': {
      icon: <Cog6ToothIcon className="h-6 w-6" />,
      title: "Paramètres",
      description: "Configurez vos préférences",
      breadcrumbs: [
        { title: "Accueil", href: "/dashboard" },
        { title: "Paramètres" }
      ]
    },
    
    '/users': {
      icon: <UserIcon className="h-6 w-6" />,
      title: "Utilisateurs",
      description: "Gérez les utilisateurs de la plateforme",
      breadcrumbs: [
        { title: "Accueil", href: "/dashboard" },
        { title: "Utilisateurs" }
      ]
    },
    
    '/casino-reports': {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: "Rapports Casino",
      description: "Gérez et analysez les rapports casino",
      breadcrumbs: [
        { title: "Accueil", href: "/dashboard" },
        { title: "Rapports Casino" }
      ]
    }
  };
  
  // Trouver la configuration correspondante
  const matchingRoute = Object.keys(routeConfigs).find(route => 
    pathname.startsWith(route)
  );
  
  return matchingRoute ? routeConfigs[matchingRoute] : DEFAULT_CONFIG;
};

/**
 * Composant d'en-tête de page amélioré qui adapte son affichage
 * en fonction de l'itinéraire actuel ou des propriétés fournies
 */
export function EnhancedPageHeader({
  title,
  description,
  icon,
  badge,
  breadcrumbs,
  actions,
  className,
  usePathConfig = true
}: PageHeaderProps) {
  const pathname = usePathname();
  
  // Utiliser useMemo pour éviter des recalculs inutiles
  const pathConfig = useMemo(() => 
    usePathConfig ? getPageConfig(pathname || '') : null
  , [pathname, usePathConfig]);
  
  // Utiliser les props fournies ou les valeurs de la configuration du chemin
  const finalTitle = title || pathConfig?.title || "Page";
  const finalDescription = description || pathConfig?.description;
  const finalIcon = icon || pathConfig?.icon;
  const finalBreadcrumbs = breadcrumbs || pathConfig?.breadcrumbs;
  
  return (
    <PageHeaderEnhanced
      title={finalTitle}
      description={finalDescription}
      icon={finalIcon}
      badge={badge}
      breadcrumbs={finalBreadcrumbs}
      actions={actions}
      className={className}
    />
  );
}