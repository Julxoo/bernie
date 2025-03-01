"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface PerformanceStats {
  avgProductionTime: string;
  monthlyCounts: Record<string, number>;
  totalVideos: number;
}

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await fetch("/api/performance");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques de performance");
        }
        const data = (await response.json()) as PerformanceStats;
        setStats(data);
      } catch (err: unknown) {
        console.error("Erreur lors du chargement des statistiques de performance", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Une erreur inconnue est survenue");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  return (
    <DashboardLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Suivi de performance et Reporting
        </h1>
      </header>

      {isLoading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Temps moyen de production */}
          <div className="p-4 bg-[#171717] rounded-lg">
            <h2 className="text-xl font-bold">Temps moyen de production</h2>
            <p className="text-3xl">{stats.avgProductionTime} jours</p>
          </div>
          {/* Vidéos terminées par mois */}
          <div className="p-4 bg-[#171717] rounded-lg">
            <h2 className="text-xl font-bold">Vidéos terminées par mois</h2>
            <ul>
              {Object.entries(stats.monthlyCounts).map(([month, count]) => (
                <li key={month}>
                  {month}: {count} vidéo{count > 1 ? "s" : ""}
                </li>
              ))}
            </ul>
          </div>
          {/* Total des vidéos terminées */}
          <div className="p-4 bg-[#171717] rounded-lg">
            <h2 className="text-xl font-bold">Total des vidéos terminées</h2>
            <p className="text-3xl">{stats.totalVideos}</p>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
