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
  LogOut
} from "lucide-react";

interface BottomNavProps {
  onSignOut: () => void;
}

export default function BottomNav({ onSignOut }: BottomNavProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActiveLink = (href: string) => pathname === href;

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-[#171717] border-t border-[#424242]
        flex justify-between items-center
        px-2
        h-16   /* Hauteur fixe de la bottomNav */
        md:hidden
      "
    >
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center flex-1 ${
          isActiveLink("/dashboard") ? "text-white" : "text-[#a1a1a1]"
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-xs">Catégories</span>
      </Link>

      <Link
        href="/dashboard/stats"
        className={`flex flex-col items-center justify-center flex-1 ${
          isActiveLink("/dashboard/stats") ? "text-white" : "text-[#a1a1a1]"
        }`}
      >
        <BarChart2 className="w-5 h-5" />
        <span className="text-xs">Stats</span>
      </Link>

      <Link
        href="/dashboard/priorities"
        className={`flex flex-col items-center justify-center flex-1 ${
          isActiveLink("/dashboard/priorities") ? "text-white" : "text-[#a1a1a1]"
        }`}
      >
        <List className="w-5 h-5" />
        <span className="text-xs">Priorités</span>
      </Link>

      {session?.user?.role === "admin" && (
        <Link
          href="/dashboard/admin"
          className={`flex flex-col items-center justify-center flex-1 ${
            isActiveLink("/dashboard/admin") ? "text-white" : "text-[#a1a1a1]"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">Admin</span>
        </Link>
      )}

      <Link
        href="/dashboard/profile"
        className={`flex flex-col items-center justify-center flex-1 ${
          isActiveLink("/dashboard/profile") ? "text-white" : "text-[#a1a1a1]"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-xs">Profil</span>
      </Link>

      <button
        onClick={onSignOut}
        className="flex flex-col items-center justify-center flex-1 text-[#a1a1a1]"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-xs">Quitter</span>
      </button>
    </nav>
  );
}
