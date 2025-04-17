"use client";

import { 
  Squares2X2Icon, 
  FolderIcon, 
  VideoCameraIcon, 
  ChartBarIcon, 
  UserIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: 'default' | 'page';
}

export function Logo({ className, variant = 'default' }: LogoProps) {
  const pathname = usePathname();

  const getPageIcon = (): ReactNode => {
    if (pathname?.startsWith('/dashboard/dashboard')) return <Squares2X2Icon className="h-6 w-6 text-primary" />;
    if (pathname?.startsWith('/dashboard/categories')) return <FolderIcon className="h-6 w-6 text-primary" />;
    if (pathname?.startsWith('/dashboard/videos')) return <VideoCameraIcon className="h-6 w-6 text-primary" />;
    if (pathname?.startsWith('/dashboard/statistics')) return <ChartBarIcon className="h-6 w-6 text-primary" />;
    if (pathname?.startsWith('/dashboard/profile')) return <UserIcon className="h-6 w-6 text-primary" />;
    if (pathname?.startsWith('/dashboard/admin')) return <ShieldCheckIcon className="h-6 w-6 text-primary" />;
    if (pathname?.startsWith('/dashboard/settings')) return <Cog6ToothIcon className="h-6 w-6 text-primary" />;
    return <span className="text-primary font-bold text-xl">B</span>;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-md flex items-center justify-center">
        {variant === 'page' ? getPageIcon() : <span className="text-primary font-bold text-xl">B</span>}
      </div>
      <span className="font-bold text-xl">BigWater</span>
    </div>
  );
}

export default Logo; 