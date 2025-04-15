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
import React from 'react';

import { PageHeaderEnhanced } from './page-container';


interface PageTitleConfig {
  icon: React.ReactNode;
  title: string;
  description?: string;
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
}

const getPageConfig = (pathname: string): PageTitleConfig => {
  // Base configuration avec un titre par défaut
  const defaultConfig: PageTitleConfig = {
    icon: <HomeIcon className="h-6 w-6" />,
    title: "AlexSeta",
    breadcrumbs: [{ title: "Accueil", href: "/dashboard" }]
  };

  // Configuration pour les routes principales
  if (pathname.startsWith("/dashboard")) {
    return {
      icon: <Squares2X2Icon className="h-6 w-6" />,
      title: "Accueil",
      breadcrumbs: [{ title: "Accueil" }]
    };
  }
  
  if (pathname.startsWith("/categories")) {
    const breadcrumbs = [
      { title: "Accueil", href: "/dashboard" },
      { title: "Catégories" }
    ];
    
    return {
      icon: <FolderIcon className="h-6 w-6" />,
      title: "Catégories",
      breadcrumbs
    };
  }
  
  if (pathname.startsWith("/videos")) {
    const breadcrumbs = [
      { title: "Accueil", href: "/dashboard" },
      { title: "Vidéos" }
    ];
    
    return {
      icon: <VideoCameraIcon className="h-6 w-6" />,
      title: "Gestion des Vidéos",
      breadcrumbs
    };
  }
  
  if (pathname.startsWith("/statistics")) {
    const breadcrumbs = [
      { title: "Accueil", href: "/dashboard" },
      { title: "Statistiques" }
    ];
    
    return {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: "Statistiques",
      description: "Analysez les performances de vos vidéos",
      breadcrumbs
    };
  }
  
  if (pathname.startsWith("/profile")) {
    const breadcrumbs = [
      { title: "Accueil", href: "/dashboard" },
      { title: "Profil" }
    ];
    
    return {
      icon: <UserIcon className="h-6 w-6" />,
      title: "Profil",
      description: "Gérez vos informations personnelles",
      breadcrumbs
    };
  }
  
  if (pathname.startsWith("/admin")) {
    const breadcrumbs = [
      { title: "Accueil", href: "/dashboard" },
      { title: "Administration" }
    ];
    
    return {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: "Administration",
      description: "Paramètres administrateur",
      breadcrumbs
    };
  }
  
  if (pathname.startsWith("/settings")) {
    const breadcrumbs = [
      { title: "Accueil", href: "/dashboard" },
      { title: "Paramètres" }
    ];
    
    return {
      icon: <Cog6ToothIcon className="h-6 w-6" />,
      title: "Paramètres",
      description: "Configurez vos préférences",
      breadcrumbs
    };
  }
  
  if (pathname.startsWith("/users")) {
    const breadcrumbs = [
      { title: "Accueil", href: "/dashboard" },
      { title: "Utilisateurs" }
    ];
    
    return {
      icon: <UserIcon className="h-6 w-6" />,
      title: "Utilisateurs",
      description: "Gérez les utilisateurs de la plateforme",
      breadcrumbs
    };
  }
  
  if (pathname.startsWith("/casino-reports")) {
    const breadcrumbs = [
      { title: "Accueil", href: "/dashboard" },
      { title: "Rapports Casino" }
    ];
    
    return {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: "Rapports Casino",
      description: "Gérez et analysez les rapports casino",
      breadcrumbs
    };
  }

  // Configuration par défaut si aucune route ne correspond
  return defaultConfig;
};

interface PageHeaderProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
  /** Si true, utilise automatiquement le titre et l'icône en fonction de la route */
  usePathConfig?: boolean;
}

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
  
  // Obtenir la configuration basée sur le chemin si demandé
  const pathConfig = usePathConfig ? getPageConfig(pathname || '') : null;
  
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