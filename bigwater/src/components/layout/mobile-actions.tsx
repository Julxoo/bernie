import React from 'react';

import { cn } from '@/lib/utils';

interface MobileActionsProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  position?: 'bottom' | 'top';
}

export function MobileActions({
  children,
  className,
  visible = true,
  position = 'bottom'
}: MobileActionsProps) {
  return (
    <div 
      className={cn(
        "fixed left-0 z-30 w-full md:hidden bg-background/95 backdrop-blur-sm border-t p-3 flex items-center flex-wrap gap-2 justify-center transition-transform duration-200 safe-bottom",
        position === 'bottom' ? "bottom-0" : "top-16 border-b border-t-0",
        !visible && position === 'bottom' && "translate-y-full",
        !visible && position === 'top' && "-translate-y-full",
        className
      )}
      style={{ 
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' 
      }}
    >
      {children}
    </div>
  );
} 