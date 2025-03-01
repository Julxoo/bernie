"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Alert {
  id: number;
  title: string;
  production_status: string;
  updated_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/alerts");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des alertes");
        }
        const data = (await response.json()) as Alert[];
        setAlerts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Erreur lors du chargement des alertes", err);
        } else {
          console.error("Erreur lors du chargement des alertes", err);
        }
        setError("Impossible de charger les alertes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <DashboardLayout>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Alertes et Rappels</h1>
      </header>
      {isLoading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : alerts.length === 0 ? (
        <div>Aucune alerte pour le moment.</div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 bg-[#171717] rounded-lg">
              <h2 className="text-xl font-bold">{alert.title}</h2>
              <p>Statut : {alert.production_status}</p>
              <p>
                Dernière mise à jour :{" "}
                {new Date(alert.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
