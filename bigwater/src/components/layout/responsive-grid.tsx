import React from 'react';

import { cn } from '@/lib/utils';

type GridVariant = 'default' | 'compact' | 'wide' | 'fitted';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: GridVariant;
  minWidth?: string;
  gap?: string;
}

export function ResponsiveGrid({
  children,
  className,
  variant = 'default',
  minWidth,
  gap
}: ResponsiveGridProps) {
  
  const gridVariants: Record<GridVariant, string> = {
    // Par défaut: 1 colonne sur mobile, 2 sur tablette, 3 sur ordinateur
    default: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    // Compact: 1 colonne sur mobile, 2 sur tablette, 4 sur grand écran
    compact: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    // Large: 1 colonne sur mobile, 2 sur grand écran
    wide: "grid-cols-1 md:grid-cols-2",
    // Ajusté: utilise minWidth pour déterminer automatiquement le nombre de colonnes
    fitted: "grid-cols-1"
  };
  
  const baseStyles = variant === 'fitted'
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth || '250px'}, 1fr))`,
        gap: gap || 'var(--grid-gap, 1rem)'
      }
    : {};
  
  return (
    <div 
      className={cn(
        "grid",
        variant !== 'fitted' && (gap ? `gap-${gap}` : "gap-2 sm:gap-3 md:gap-6"),
        variant !== 'fitted' && gridVariants[variant],
        className
      )}
      style={variant === 'fitted' ? baseStyles : undefined}
    >
      {children}
    </div>
  );
} 