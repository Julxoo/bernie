"use client";

import { 
  Squares2X2Icon, 
  FolderIcon, 
  VideoCameraIcon,
  UserIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";


interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activePattern?: RegExp;
}

interface MobileNavBarProps {
  isAdmin?: boolean;
}

export function MobileNavBar({ isAdmin = false }: MobileNavBarProps) {
  const pathnameValue = usePathname();
  const pathname = pathnameValue ?? '/';

  
  // Vérifier si nous sommes sur une page admin
  const isAdminPath = pathname.startsWith('/admin');
  
  // Si nous sommes sur une page admin, ne pas afficher cette barre de navigation
  // car elle sera remplacée par la barre admin spécifique
  if (isAdminPath) {
    return null;
  }

  // Liste de base des éléments de navigation
  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Squares2X2Icon className="h-5 w-5" />,
      activePattern: /^\/dashboard/
    },
    {
      href: "/videos",
      label: "Vidéos",
      icon: <VideoCameraIcon className="h-5 w-5" />,
      activePattern: /^\/videos|^\/video\//
    },
    {
      href: "/categories",
      label: "Catégories",
      icon: <FolderIcon className="h-5 w-5" />, 
      activePattern: /^\/categories|^\/category\//
    },
    {
      href: "/profile",
      label: "Profil",
      icon: <UserIcon className="h-5 w-5" />, 
      activePattern: /^\/categories|^\/category\//
    }
  ];
  
  // Ajouter le lien Admin uniquement si l'utilisateur est admin
  if (isAdmin) {
    navItems.push({
      href: "/admin",
      label: "Admin",
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      activePattern: /^\/admin/
    });
  }

  const isActive = (item: NavItem) => {
    if (item.activePattern) {
      return item.activePattern.test(pathname);
    }
    return pathname === item.href;
  };

  return (
    <nav aria-label="Navigation principale mobile" className="fixed bottom-0 left-0 z-50 w-full h-16 xs:h-18 border-t shadow-lg bg-background md:hidden">
      <div className={`grid h-full ${navItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`} role="menubar">
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