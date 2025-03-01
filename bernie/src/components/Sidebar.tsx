// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSignOut: () => void;
}

export default function Sidebar({ isOpen, onToggle, onSignOut }: SidebarProps) {
  const { data: session } = useSession(); // Ce hook fonctionne maintenant car l'application est enveloppée dans SessionProvider

  return (
    <aside
      className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-40 w-64 bg-[#171717] flex flex-col border-r border-[#424242] 
        pt-12 /* <-- on ajoute un padding-top ici */
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:static md:translate-x-0`}
    >
      <div className="p-6">
        <h1 className="text-xl font-semibold text-[#ECECEC]">Dashboard</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className="text-[#ECECEC] hover:text-gray-300 block py-2"
              onClick={onToggle}
            >
              Catégories
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/stats"
              className="text-[#ECECEC] hover:text-gray-300 block py-2"
              onClick={onToggle}
            >
              Statistiques
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/alerts"
              className="text-[#ECECEC] hover:text-gray-300 block py-2"
              onClick={onToggle}
            >
              Alertes
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/priorities"
              className="text-[#ECECEC] hover:text-gray-300 block py-2"
              onClick={onToggle}
            >
              Priorités
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/performance"
              className="text-[#ECECEC] hover:text-gray-300 block py-2"
              onClick={onToggle}
            >
              Performance
            </Link>
          </li>
          {session?.user?.role === "admin" && (
            <li>
              <Link
                href="/dashboard/admin"
                className="text-[#ECECEC] hover:text-gray-300 block py-2"
                onClick={onToggle}
              >
                Administration
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div className="p-4 border-t border-[#424242]">
        <button
          onClick={onSignOut}
          className="w-full px-4 py-2 text-sm bg-[#424242] hover:bg-[#171717] rounded-lg transition-colors duration-200 border border-[#424242] text-[#ECECEC]"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
