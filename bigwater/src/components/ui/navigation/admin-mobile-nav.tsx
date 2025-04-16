"use client";

import { 
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  hash?: string;
}

export function AdminMobileNav() {
  const pathnameValue = usePathname();
  const pathname = pathnameValue ?? '/admin';
  const [activeHash, setActiveHash] = useState<string>("users");

  // Surveiller les changements de hash
  useEffect(() => {
    // Fonction pour extraire le hash actuel
    const getHash = () => {
      if (typeof window === 'undefined') return 'users'; // Valeur par défaut pour SSR
      const hash = window.location.hash.substring(1); // Enlever le #
      return hash || 'users'; // Valeur par défaut si pas de hash
    };

    // Définir le hash initial
    setActiveHash(getHash());

    // Ajouter un écouteur pour les changements de hash
    const handleHashChange = () => {
      setActiveHash(getHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Liste des éléments de navigation pour l'admin
  const navItems: NavItem[] = [
    {
      href: "/admin",
      label: "Admin",
      icon: <ShieldCheckIcon className="h-5 w-5" />
    },
    {
      href: "/admin#users",
      label: "Utilisateurs",
      icon: <UserGroupIcon className="h-5 w-5" />,
      hash: "users"
    },
    {
      href: "/admin#casino",
      label: "Casino",
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      hash: "casino"
    },
    {
      href: "/dashboard/dashboard",
      label: "Retour",
      icon: <ArrowLeftOnRectangleIcon className="h-5 w-5" />
    }
  ];

  const isActive = (item: NavItem) => {
    // Si c'est un élément avec un hash
    if (item.hash) {
      return pathname === '/admin' && activeHash === item.hash;
    }
    
    // Pour le lien Admin sans hash
    if (item.href === '/admin' && !item.hash) {
      return pathname === '/admin' && !activeHash;
    }
    
    // Pour les autres liens
    return pathname === item.href;
  };

  return (
    <nav aria-label="Navigation admin mobile" className="fixed bottom-0 left-0 z-50 w-full h-16 xs:h-18 border-t shadow-lg bg-background md:hidden">
      <div className="grid h-full grid-cols-4" role="menubar">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-1 transition-all duration-200",
                active ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground/80",
                "active:scale-95"
              )}
            >
              <div className={cn(
                "h-6 w-6 xs:h-7 xs:w-7 flex items-center justify-center",
                active ? "text-primary" : "text-muted-foreground", 
                "transition-colors"
              )}
              aria-hidden="true"
              >
                {item.icon}
              </div>
              <span className={cn(
                "text-[10px] xs:text-xs transition-colors text-center line-clamp-1",
                active ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 