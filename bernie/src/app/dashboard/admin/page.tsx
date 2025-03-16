// src/app/dashboard/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AccessDenied from "./components/AccessDenied";
import ReportList from "./components/ReportList";
import ReportEditor from "./components/ReportEditor";
import { fetchReports } from "./services/reportsService";
import { CasinoReport } from "./types";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState<CasinoReport[]>([]);
  const [activeReport, setActiveReport] = useState<CasinoReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les rapports au chargement
  useEffect(() => {
    const loadReports = async () => {
      if (status !== "loading" && session?.user?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchReports();
        setReports(data);
      } catch (err) {
        console.error('Erreur lors du chargement des rapports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status !== "loading") {
      loadReports();
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  if (session?.user?.role !== "admin") {
    return <AccessDenied />;
  }

  return (
    <div className="p-4 md:p-6 text-gray-200 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">Administration</h1>
        <p className="text-sm text-gray-400 mt-1">
          Gérez vos rapports mensuels de performance
        </p>
      </header>

      <div className="mb-6">
        <div className="flex border-b border-[#424242]">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "reports" ? "text-white border-b-2 border-white" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            Rapports sauvegardés
          </button>
          {activeReport && (
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "edit" ? "text-white border-b-2 border-white" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("edit")}
            >
              Édition
            </button>
          )}
        </div>
      </div>

      {activeTab === "reports" && (
        <ReportList 
          reports={reports}
          isLoading={isLoading}
          setReports={setReports}
          setActiveReport={setActiveReport}
          setActiveTab={setActiveTab}
        />
      )}
      
      {activeTab === "edit" && activeReport && (
        <ReportEditor
          activeReport={activeReport}
          setActiveReport={setActiveReport}
          setReports={setReports}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  );
}