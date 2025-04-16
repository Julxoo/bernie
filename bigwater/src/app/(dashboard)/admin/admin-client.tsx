"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/data-display/tabs";
import { UserManagement } from "./user-management";
import { CasinoSection } from "./casino-section";
import { UsersIcon, GamepadIcon } from "lucide-react";

export function AdminClient() {
  const [activeTab, setActiveTab] = useState<string>("users");

  // Gestionnaire pour les liens d'ancrage depuis la barre de navigation mobile
  useEffect(() => {
    // Fonction pour vérifier le hash de l'URL et changer l'onglet
    const checkHash = () => {
      const hash = window.location.hash.substring(1); // Enlever le #
      if (hash === "users" || hash === "casino") {
        setActiveTab(hash);
      }
    };

    // Vérifier au chargement initial
    checkHash();

    // Ajouter un écouteur d'événements pour les changements de hash
    window.addEventListener("hashchange", checkHash);

    // Nettoyer l'écouteur d'événements
    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  // Mettre à jour le hash lorsque l'onglet change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Mettre à jour l'URL avec le nouveau hash sans recharger la page
    const url = new URL(window.location.href);
    url.hash = value;
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">
          Gérez les utilisateurs et les fonctionnalités du système.
        </p>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            <span>Utilisateurs</span>
          </TabsTrigger>
          <TabsTrigger value="casino" className="flex items-center gap-2">
            <GamepadIcon className="h-4 w-4" />
            <span>Casino</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
          <UserManagement />
        </TabsContent>

        <TabsContent value="casino" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
          <CasinoSection />
        </TabsContent>
      </Tabs>
    </div>
  );
} 