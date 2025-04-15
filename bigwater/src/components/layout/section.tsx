import React from 'react';

import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  fullWidth?: boolean;
}

export function Section({
  children,
  className,
  title,
  description,
  fullWidth = false
}: SectionProps) {
  return (
    <section className={cn("py-3 md:py-6", fullWidth ? "" : "px-0 md:px-0", className)}>
      {(title || description) && (
        <div className="mb-3 md:mb-6">
          {title && <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  className,
  actions
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1 md:mb-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold md:text-xl">{title}</h3>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export function SectionCard({
  children,
  className,
  title,
  description,
  footer
}: SectionCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm h-full flex flex-col", className)}>
      {(title || description) && (
        <div className="border-b p-4 md:p-6">
          {title && <h3 className="text-lg font-semibold md:text-xl">{title}</h3>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={cn("flex-1", !className?.includes('p-') && "p-4 md:p-6")}>
        {children}
      </div>
      {footer && (
        <div className="border-t p-4 md:p-6 bg-muted/50 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
} 