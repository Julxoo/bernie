"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface GlobalWrapperProps {
  children: React.ReactNode;
}

export default function GlobalWrapper({ children }: GlobalWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Ne pas afficher la sidebar/bottomNav sur la page de login
  const isLoginPage = pathname.startsWith("/login");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-[#212121]">
      {/* Barre latérale sur desktop */}
      <div className="hidden md:block">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Bottom navigation sur mobile */}
      <div className="md:hidden">
        <BottomNav onSignOut={handleSignOut} />
      </div>

      {/* Contenu principal */}
      <main
        className={`
          text-[#ECECEC] overflow-y-auto
          transition-all duration-300
          ${isSidebarOpen ? "md:ml-64" : ""}
          /* IMPORTANT : padding-bottom pour ne pas que le content soit caché par la bottom nav en mobile */
          pb-16   /* sur mobile */
          md:pb-0 /* sur desktop, pas besoin */
        `}
      >
        {children}
      </main>
    </div>
  );
}
