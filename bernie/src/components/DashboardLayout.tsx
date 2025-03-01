// src/components/DashboardLayout.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Utilisation de signOut de NextAuth pour terminer la session
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#212121] flex">
      {/* Bouton hamburger pour mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#424242] rounded-full shadow-lg focus:outline-none"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isSidebarOpen ? "X" : "≡"}
      </button>

      {/* Sidebar avec props pour gérer l'état et la déconnexion */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        onSignOut={handleSignOut}
      />

      {/* Contenu principal */}
      <main className="flex-1 p-4 pt-16 md:pt-4 md:p-8 text-[#ECECEC] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
