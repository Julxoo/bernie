"use client";

import { useRouter } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

interface HeaderProps {
  title?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({
  title = "Dashboard",
  isSidebarOpen = false,
  onToggleSidebar,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between p-4 bg-[#171717] border-b border-[#424242]">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="md:hidden focus:outline-none">
            {isSidebarOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        )}
        <h1 className="text-xl font-semibold text-[#ECECEC]">{title}</h1>
      </div>
      <nav>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[#ECECEC] hover:text-gray-300 transition-colors"
        >
          Accueil
        </button>
      </nav>
    </header>
  );
}
