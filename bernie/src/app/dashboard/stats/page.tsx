"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Stats {
  toDo: number;
  inProgress: number;
  readyToPublish: number;
  finished: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    toDo: 0,
    inProgress: 0,
    readyToPublish: 0,
    finished: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }
        const data = (await response.json()) as Stats;
        setStats(data);
      } catch (err: unknown) {
        console.error("Erreur lors du chargement des statistiques", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Impossible de charger les statistiques");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Vue d&apos;ensemble de la production
        </h1>
      </header>

      {isLoading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#171717] rounded-lg text-center">
              <p className="text-3xl font-bold">{stats.toDo}</p>
              <p>À monter</p>
            </div>
            <div className="p-4 bg-[#171717] rounded-lg text-center">
              <p className="text-3xl font-bold">{stats.inProgress}</p>
              <p>En cours</p>
            </div>
            <div className="p-4 bg-[#171717] rounded-lg text-center">
              <p className="text-3xl font-bold">{stats.readyToPublish}</p>
              <p>Prêt à publier</p>
            </div>
            <div className="p-4 bg-[#171717] rounded-lg text-center">
              <p className="text-3xl font-bold">{stats.finished}</p>
              <p>Terminé</p>
            </div>
          </div>
          {/* Vous pouvez ajouter ici d'autres visualisations (graphique, etc.) */}
        </div>
      )}
    </DashboardLayout>
  );
}
