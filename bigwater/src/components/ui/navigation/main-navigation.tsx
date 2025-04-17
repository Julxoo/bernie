"use client";

import { 
  HomeIcon, 
  VideoCameraIcon, 
  UserIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FolderIcon,
  Squares2X2Icon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useRef } from "react";
import * as React from "react"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/overlays/dialog";
import { SearchBar } from "@/components/ui/search-bar";

import { Logo } from "@/components/logo";
import { MobileNavBar } from "@/components/ui/navigation/mobile-nav-bar";
import { cn } from "@/lib/utils";
import { createClient } from "@/services/supabase/client";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  highlight?: boolean;
}

interface NavItemType {
  href: string;
  icon: ReactNode;
  label: string;
  highlight?: boolean;
  activePattern?: RegExp;
}

const NavItem = ({ href, icon, label, isActive, highlight }: NavItemProps) => {
  return (
    <Link 
      href={href}
      aria-current={isActive ? "page" : undefined}
      aria-label={`${label}${highlight ? ' - Recommandé' : ''}`}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-all duration-200",
        "sm:p-2.5 md:flex-row md:justify-start md:gap-3 md:p-3 rounded-md",
        "hover:translate-x-1 md:hover:translate-x-0 hover:md:translate-x-1",
        highlight 
          ? "text-primary bg-primary/10 hover:bg-primary/20" 
          : isActive 
            ? "text-primary bg-primary/5 hover:bg-primary/10"
            : "text-muted-foreground hover:text-primary hover:bg-muted/50"
      )}
    >
      <div className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" aria-hidden="true">{icon}</div>
      <span className="md:text-sm lg:text-base">{label}</span>
      {highlight && <ArrowLeftIcon className="ml-auto hidden md:block h-4 w-4 text-primary" aria-hidden="true" />}
    </Link>
  );
};

// Composant pour la barre latérale desktop
const DesktopSidebar = ({ 
  navItems, 
  pathname,
  onSignOut,
  isAdminMode,
  userEmail
}: { 
  navItems: NavItemType[], 
  pathname: string,
  onSignOut: () => void,
  isAdminMode: boolean,
  userEmail?: string | null
}) => {
  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-full w-60 sm:w-64 lg:w-72 flex-col border-r bg-background md:flex" aria-label="Navigation principale">
      <div className="flex h-16 items-center border-b px-4">
        <Logo variant="default" className="transition-transform duration-300 transform hover:scale-105" />
        {isAdminMode && (
          <span className="ml-2 text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium" role="status">
            Admin
          </span>
        )}
      </div>
      <nav className="flex flex-col gap-1 p-3 sm:p-4 flex-1 overflow-y-auto" aria-label="Menu principal">
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            highlight={item.highlight}
          />
        ))}
      </nav>
      
      {/* Section utilisateur */}
      <div className="border-t p-3 sm:p-4 mt-auto">
        {userEmail && (
          <div className="mb-3 text-sm text-muted-foreground truncate" role="status" aria-label="Connecté en tant que">
            {userEmail}
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={onSignOut}
          aria-label="Se déconnecter"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};

// Composant pour le menu mobile
const MobileMenu = ({ 
  navItems, 
  pathname, 
  userEmail,
  onSignOut,
  isOpen,
  onClose,
  isAdminMode
}: { 
  navItems: NavItemType[],
  pathname: string,
  userEmail?: string,
  onSignOut: () => void,
  isOpen: boolean,
  onClose: () => void,
  isAdminMode: boolean
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="top-0 translate-y-0 p-0 h-[100dvh] max-w-full sm:max-w-md rounded-none border-0 sm:border sm:rounded-lg sm:my-4 sm:mx-4 sm:h-auto sm:max-h-[90dvh] overflow-hidden" role="dialog" aria-modal="true" aria-label="Menu de navigation">
        <div className="flex h-14 sm:h-16 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <Logo variant="page" className="h-6 sm:h-8" />
            {isAdminMode && (
              <div className="ml-2 px-2 py-1 rounded bg-primary/10 text-primary font-medium text-xs flex items-center" role="status">
                <ShieldCheckIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                Mode Admin
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer le menu" className="text-muted-foreground hover:text-foreground transition-colors">
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100%-3.5rem)] sm:h-[calc(100%-4rem)] overflow-auto">
          <nav className="flex flex-col gap-1 p-3 sm:p-4 flex-1" aria-label="Navigation mobile">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-3 sm:p-4 font-medium transition-all duration-200 rounded-md",
                  item.highlight 
                    ? "bg-primary/10 text-primary" 
                    : pathname.startsWith(item.href) 
                      ? "bg-primary/5 text-primary" 
                      : "hover:bg-muted/50 text-foreground hover:translate-x-1"
                )}
                onClick={onClose}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              >
                <div className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" aria-hidden="true">{item.icon}</div>
                <span className="text-sm sm:text-base">{item.label}</span>
                {item.highlight && <ArrowLeftIcon className="ml-auto h-4 w-4 text-primary" aria-hidden="true" />}
              </Link>
            ))}
          </nav>
          
          {/* Section utilisateur */}
          <div className="border-t p-3 sm:p-4 mt-auto">
            {userEmail && (
              <div className="mb-3 text-sm text-muted-foreground truncate" role="status" aria-label="Connecté en tant que">
                {userEmail}
              </div>
            )}
            <Button
              variant="destructive"
              className="w-full justify-center gap-2 py-2 sm:py-2.5 text-sm sm:text-base transition-transform active:scale-[0.98]"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Déconnexion
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Composant pour le header
const Header = ({ 
  pathname,
  showSearch,
  setShowSearch,
  onSignOut,
  isAdminMode
}: { 
  pathname: string,
  showSearch: boolean,
  setShowSearch: (show: boolean) => void,
  userEmail?: string,
  onSignOut: () => void,
  isAdminMode: boolean
}) => {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Gérer les clics en dehors de la barre de recherche mobile
  useEffect(() => {
    if (!showSearch) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearch(false);
        setSearchExpanded(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch, setShowSearch]);
  
  // Fonction pour déterminer le titre de la page en fonction du chemin
  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard/dashboard")) return "Accueil";
    if (path.startsWith("/dashboard/categories")) return "Catégories";
    if (path.startsWith("/dashboard/videos")) return "Gestion des Vidéos";
    if (path.startsWith("/dashboard/statistics")) return "Statistiques";
    if (path.startsWith("/dashboard/profile")) return "Profil";
    if (path.startsWith("/dashboard/admin")) return "Administration";
    if (path.startsWith("/dashboard/settings")) return "Paramètres";
    // if (path.startsWith("/users")) return "Utilisateurs";
    // if (path.startsWith("/casino-reports")) return "Rapports Casino";
    return "BigWater";
  };

  // Obtenir le chemin de navigation
  const getPathComponent = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return null;
    
    if (segments[0] === 'admin') {
      return (
        <div className="flex items-center text-xs text-muted-foreground">
          <Link href="/dashboard/dashboard" className="hover:text-foreground">Accueil</Link>
          <span className="mx-1.5">›</span>
          <span>Administration</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <header className={cn(
      "sticky top-0 z-20 flex h-14 sm:h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-3 sm:px-4 transition-all",
      "md:ml-60 lg:ml-64 xl:ml-72 md:px-6 overflow-hidden",
      isAdminMode && "border-b-primary/20"
    )} role="banner">
      <div 
        className={cn(
          "md:hidden flex items-center transition-all duration-300 transform",
          showSearch ? "-translate-x-full opacity-0 absolute w-0" : "translate-x-0 opacity-100 relative"
        )}
      >
        <Logo variant="default" className="md:hidden h-6 sm:h-8" />
        {isAdminMode && (
          <div className="ml-2 px-2 py-1 rounded bg-primary/20 text-primary font-medium text-xs flex items-center shadow-sm" role="status">
            <ShieldCheckIcon className="h-3 w-3 mr-1" aria-hidden="true" />
            Admin
          </div>
        )}
      </div>
      
      <div 
        className={cn(
          "hidden md:flex md:flex-col md:flex-1 transition-all duration-300 transform",
          searchExpanded && "md:opacity-70"
        )}
      >
        <h1 className="text-lg lg:text-xl font-semibold">{getPageTitle(pathname)}</h1>
        {getPathComponent(pathname)}
      </div>
      
      <div 
        className={cn(
          "flex items-center gap-1 sm:gap-2 transition-all duration-300 ease-in-out",
          showSearch ? "w-full" : "ml-auto",
          !showSearch && "md:max-w-[50%]"
        )}
      >
        {showSearch ? (
          <div 
            ref={searchContainerRef} 
            className="relative flex w-full transition-all duration-300 transform"
          >
            <SearchBar 
              isMobile 
              onClose={() => {
                setSearchExpanded(false);
                // Petit délai pour l'animation avant de cacher
                setTimeout(() => {
                  setShowSearch(false);
                }, 200);
              }}
              onFocus={() => setSearchExpanded(true)}
            />
          </div>
        ) : (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setShowSearch(true);
                setSearchExpanded(true);
              }}
              aria-label="Rechercher"
              className="md:hidden transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div className="hidden md:block relative w-auto max-w-full">
              <SearchBar 
                className="w-48 sm:w-56 md:w-64 lg:w-80 xl:w-96 transition-all duration-300 ease-in-out" 
                onFocus={() => setSearchExpanded(true)}
                onBlur={() => setSearchExpanded(false)}
              />
            </div>
            <div 
              className={cn(
                "flex items-center transition-all duration-300 transform",
                searchExpanded ? "md:opacity-70" : "opacity-100 scale-100"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                aria-label="Déconnexion"
                className="md:hidden text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

interface NavigationProps {
  children?: ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const pathnameValue = usePathname();
  const pathname = pathnameValue ?? '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();
  
  // Déterminer si la page actuelle est dans la section admin
  const isAdminPath = pathname.startsWith('/dashboard/admin');
  
  useEffect(() => {
    async function handleAdminCheck() {
      try {
        setIsAdmin(false);
        setUserEmail(null);
        
        // Vérifier si l'utilisateur est connecté
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          return;
        }
        
        // Stocker l'email de l'utilisateur
        setUserEmail(session.user.email || null);
        
        // Récupérer le profil utilisateur avec le rôle
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        setIsAdmin(profile?.role === 'admin');
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
      }
    }
    
    handleAdminCheck();
  }, [supabase]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };
  
  // Navigation items standards
  const standardNavItems = [
    {
      href: "/dashboard/dashboard",
      icon: <Squares2X2Icon className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Accueil"
    },
    {
      href: "/dashboard/videos",
      icon: <VideoCameraIcon className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Vidéos"
    },
    {
      href: "/dashboard/categories",
      icon: <FolderIcon className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Catégories"
    },
    {
      href: "/dashboard/profile",
      icon: <UserIcon className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Profil"
    }
  ];
  
  // Si l'utilisateur est admin et n'est pas déjà sur une page admin, ajouter le lien admin
  if (isAdmin && !isAdminPath) {
    standardNavItems.push({
      href: "/dashboard/admin",
      icon: <ShieldCheckIcon className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Admin"
    });
  }
  
  // Navigation items pour l'admin
  const adminNavItems = [
    {
      href: "/dashboard/admin",
      icon: <Squares2X2Icon className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Admin Dashboard"
    },
    {
      href: "/dashboard/dashboard",
      icon: <HomeIcon className="h-6 w-6 md:h-5 md:w-5" />,
      label: "Retour au site",
      highlight: true
    }
  ];
  
  // Choisir les items de navigation en fonction de la page
  const navItems = isAdminPath ? adminNavItems : standardNavItems;
  
  return (
    <div className="flex min-h-screen flex-col">
      <DesktopSidebar 
        navItems={navItems} 
        pathname={pathname}
        onSignOut={handleSignOut}
        isAdminMode={isAdminPath}
        userEmail={userEmail || undefined}
      />
      
      <Header 
        pathname={pathname}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        userEmail={userEmail || undefined}
        onSignOut={handleSignOut}
        isAdminMode={isAdminPath}
      />
      
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          "md:ml-60 lg:ml-64 xl:ml-72 min-h-[calc(100vh-4rem)]",
          isAdminPath ? "pb-16 md:pb-0" : "pb-20 md:pb-0"
        )}
        role="main"
        aria-label="Contenu principal"
      >
        {children}
      </main>
      
      {/* Afficher la barre de navigation mobile uniquement en mode non-admin */}
      {!isAdminPath && <MobileNavBar isAdmin={isAdmin} />}
      
      {/* Afficher une barre de navigation mobile spécifique en mode admin */}
      {isAdminPath && <MobileAdminNavBar pathname={pathname} navItems={adminNavItems} />}
      
      <MobileMenu
        navItems={navItems}
        pathname={pathname}
        userEmail={userEmail || undefined}
        onSignOut={handleSignOut}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        isAdminMode={isAdminPath}
      />
    </div>
  );
}

// Composant pour la barre de navigation mobile en mode admin
const MobileAdminNavBar = ({ 
  pathname,
  navItems
}: { 
  pathname: string,
  navItems: NavItemType[]
}) => {
  const isActive = (item: NavItemType) => {
    if (item.activePattern) {
      return item.activePattern.test(pathname);
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };
  
  return (
    <nav 
      aria-label="Navigation admin" 
      className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-background md:hidden"
    >
      <div className="mx-auto max-w-md">
        <ul 
          className="flex h-16 items-center justify-center" 
          role="menubar"
        >
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.href} className="h-full w-1/2 max-w-40">
                <Link
                  href={item.href}
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full w-full flex-col items-center justify-center gap-2 px-4 transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div 
                    className={cn(
                      "flex items-center justify-center rounded-md p-1 transition-all",
                      active ? "bg-primary/10 text-primary scale-110" : "text-muted-foreground"
                    )}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <span 
                    className={cn(
                      "text-xs font-medium transition-colors text-center",
                      active && "text-primary"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};