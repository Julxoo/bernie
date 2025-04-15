'use client';

import { useCallback, useEffect, useState } from 'react';

import { MobileActions } from '@/components/layout/mobile-actions';
import { NewCategoryDialog } from '@/components/video/NewCategoryDialog';

export function ClientActionsWrapper() {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsScrollingDown(true);
    } else {
      setIsScrollingDown(false);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <MobileActions visible={!isScrollingDown} className="justify-end px-4">
      <NewCategoryDialog 
        buttonSize="icon"
        buttonClassName="h-10 w-10 rounded-full shadow-lg"
      />
    </MobileActions>
  );
} 