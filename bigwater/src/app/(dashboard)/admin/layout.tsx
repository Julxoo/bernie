import { AdminMobileNav } from "@/components/ui/navigation/admin-mobile-nav";
import ProtectAdmin from "./protect-admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectAdmin>
      {children}
      <AdminMobileNav />
    </ProtectAdmin>
  );
} 