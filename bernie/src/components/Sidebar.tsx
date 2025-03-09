// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { 
  Grid, 
  BarChart2, 
  List, 
  Settings, 
  User, 
  LogOut,
  X 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSignOut: () => void;
}

export default function Sidebar({ isOpen, onToggle, onSignOut }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Fermer la sidebar en mobile uniquement, si on clique sur un lien différent
  const handleLinkClick = (href: string) => {
    if (pathname === href) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggle();
    }
  };

  const isActiveLink = (href: string) => pathname === href;

  return (
    <>
      {/* Overlay pour mobile quand la sidebar est ouverte */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={onToggle}
        />
      )}
      
      <aside
        className={`
          fixed top-0 left-0 z-40 w-64 h-screen bg-[#171717] border-r border-[#424242]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* En-tête (on retire la croix à gauche, on garde seulement le bouton de droite) */}
          <div className="p-4 border-b border-[#424242] flex items-center justify-between">
            <span className="text-[#ECECEC] font-medium">Dashboard</span>
            <button 
              onClick={onToggle}
              className="md:hidden text-[#ECECEC]"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation principale */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1 py-2">
              <li>
                <Link
                  href="/dashboard"
                  className={`
                    flex items-center space-x-3 px-4 py-2
                    ${isActiveLink("/dashboard") 
                      ? "bg-[#252525] text-white" 
                      : "text-[#ECECEC] hover:bg-[#222222]"
                    }
                  `}
                  onClick={() => handleLinkClick("/dashboard")}
                >
                  <Grid className="w-5 h-5" />
                  <span>Catégories</span>
                </Link>
              </li>
              
              <li>
                <Link
                  href="/dashboard/stats"
                  className={`
                    flex items-center space-x-3 px-4 py-2
                    ${isActiveLink("/dashboard/stats") 
                      ? "bg-[#252525] text-white" 
                      : "text-[#ECECEC] hover:bg-[#222222]"
                    }
                  `}
                  onClick={() => handleLinkClick("/dashboard/stats")}
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>Statistiques</span>
                </Link>
              </li>
              
              <li>
                <Link
                  href="/dashboard/priorities"
                  className={`
                    flex items-center space-x-3 px-4 py-2
                    ${isActiveLink("/dashboard/priorities") 
                      ? "bg-[#252525] text-white" 
                      : "text-[#ECECEC] hover:bg-[#222222]"
                    }
                  `}
                  onClick={() => handleLinkClick("/dashboard/priorities")}
                >
                  <List className="w-5 h-5" />
                  <span>Priorités</span>
                </Link>
              </li>
              
              {session?.user?.role === "admin" && (
                <li>
                  <Link
                    href="/dashboard/admin"
                    className={`
                      flex items-center space-x-3 px-4 py-2
                      ${isActiveLink("/dashboard/admin") 
                        ? "bg-[#252525] text-white" 
                        : "text-[#ECECEC] hover:bg-[#222222]"
                      }
                    `}
                    onClick={() => handleLinkClick("/dashboard/admin")}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Administration</span>
                  </Link>
                </li>
              )}
            </ul>
            
            <div className="mt-4 pt-2 border-t border-[#424242]">
              <h3 className="px-4 text-xs uppercase font-medium text-gray-500 mt-2 mb-2">
                COMPTE
              </h3>
              <ul>
                <li>
                  <Link
                    href="/dashboard/profile"
                    className={`
                      flex items-center space-x-3 px-4 py-2
                      ${isActiveLink("/dashboard/profile") 
                        ? "bg-[#252525] text-white" 
                        : "text-[#ECECEC] hover:bg-[#222222]"
                      }
                    `}
                    onClick={() => handleLinkClick("/dashboard/profile")}
                  >
                    <User className="w-5 h-5" />
                    <span>Mon profil</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Footer (bouton de déconnexion) */}
          <div className="p-4 border-t border-[#424242] mt-auto">
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 
                bg-[#252525] hover:bg-[#333333] rounded-lg text-[#ECECEC]"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
