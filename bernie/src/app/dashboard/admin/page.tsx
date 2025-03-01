"use client";

import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && session?.user?.role !== "admin") {
      // Redirige vers le dashboard si l'utilisateur n'est pas admin
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  return (
    <DashboardLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Administration</h1>
      </header>
      <div className="p-4 bg-[#171717] rounded-lg">
        <p className="text-lg">
          Bienvenue dans l&apos;espace administration. Vous pouvez gérer les utilisateurs et effectuer des actions sensibles ici.
        </p>
        <button
          onClick={() => signOut()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Déconnexion
        </button>
      </div>
    </DashboardLayout>
  );
}
