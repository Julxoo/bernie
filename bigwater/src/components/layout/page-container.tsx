"use client";

import { ChevronRightIcon } from "@heroicons/react/24/solid";
import React from 'react';

import { Badge } from "@/components/ui/data-display/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/navigation/breadcrumb";
import { Separator } from "@/components/ui/layout/separator";
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageContainer({ 
  children, 
  className,
  fullWidth = false 
}: PageContainerProps) {
  return (
    <div 
      className={cn(
        "px-3 py-3 md:px-6 md:py-8",
        !fullWidth && "max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

// Nouvelle interface pour PageHeaderEnhanced
interface PageHeaderEnhancedProps {
  title: string;
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
}

// Nouveau composant de header amélioré
export function PageHeaderEnhanced({
  title,
  description,
  icon,
  badge,
  breadcrumbs,
  actions,
  className
}: PageHeaderEnhancedProps) {
  return (
    <div className={cn("mb-4 md:mb-6 space-y-3 md:space-y-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-2 overflow-x-auto flex pb-1 no-scrollbar">
          <BreadcrumbList className="flex-nowrap">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem className="whitespace-nowrap">
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                  ) : (
                    <span className="text-sm text-muted-foreground">{crumb.title}</span>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRightIcon className="h-3 w-3" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* En-tête principal avec flex-row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-2 md:gap-3">
          {/* Icône (si présente) */}
          {icon && (
            <div className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              {icon}
            </div>
          )}
          
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl font-bold md:text-3xl">{title}</h1>
              {badge && (
                <Badge variant={badge.variant || "outline"} className="ml-0 md:ml-2 text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground md:text-base max-w-3xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions (si présentes) */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0 md:ml-auto">
            {actions}
          </div>
        )}
      </div>
      
      <Separator className="my-2" />
    </div>
  );
}

// Conserver l'ancien composant pour maintenir la compatibilité avec le code existant
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  children,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-col gap-2 md:mb-8 md:flex-row md:items-center md:justify-between", className)}>
      <div>
        <h1 className="text-xl font-bold md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      {children && (
        <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-0 md:gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ 
  children,
  className 
}: PageContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
} 