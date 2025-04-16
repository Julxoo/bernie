"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2Icon, ShieldAlertIcon } from "lucide-react";

export default function ProtectAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        setLoading(true);
        
        // 1. Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // L'utilisateur n'est pas connecté, le rediriger vers la page de connexion
          router.push("/login");
          return;
        }
        
        // 2. Vérifier si l'utilisateur a le rôle d'admin dans la table des profils
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (error) {
          console.error("Erreur lors de la vérification du profil:", error);
          setIsAuthorized(false);
          return;
        }
        
        // 3. Vérifier le rôle
        if (profile && profile.role === "admin") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des autorisations:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAdminStatus();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2Icon className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Vérification des autorisations...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-destructive/5 text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex justify-center mb-4">
            <ShieldAlertIcon className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Accès non autorisé</h1>
          <p className="text-muted-foreground mb-6">
            Vous n&apos;;avez pas les autorisations nécessaires pour accéder à cette section. 
            Cette zone est réservée aux administrateurs.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 