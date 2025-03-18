// src/app/dashboard/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AccessDenied from "./components/AccessDenied";
import ReportList from "./components/ReportList";
import ReportEditor from "./components/ReportEditor";
import { fetchReports, saveReport, generateExcel } from "./services/reportsService";
import { CasinoReport } from "./types";
import { StatisticsPanel } from "./components/StatisticsPanel";
import { 
  PlusCircle, 
  ArrowLeft, 
  BarChart2, 
  SaveIcon, 
  Download, 
  Search,
  Calendar,
  Trash,
  ChevronDown
} from "lucide-react";
import { AdminCard } from "./components/ui/AdminCard";
import { AdminButton } from "./components/ui/AdminButton";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState<CasinoReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<CasinoReport | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
        // Si aucun rapport n'existe, afficher l'état vide
        setShowEmptyState(data.length === 0);
      } catch (err) {
        console.error('Erreur lors du chargement des rapports:', err);
        setShowEmptyState(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status !== "loading") {
      loadReports();
    }
  }, [session, status, router]);

  // Créer un nouveau rapport vide
  const handleCreateReport = () => {
    const today = new Date();
    const day = today.getDate();
    const monthIndex = today.getMonth();
    const year = today.getFullYear();
    const date = today.toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Créer un objet rapport vide
    const emptyReport: CasinoReport = {
      template_id: 1,
      template_name: "Rapport quotidien",
      day,
      month: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][monthIndex],
      year,
      date,
      created_at: new Date().toISOString(),
      data: {},
    };

    setCurrentReport(emptyReport);
    setIsEditing(true);
  };

  const handleEditReport = (report: CasinoReport) => {
    setCurrentReport(report);
    setIsEditing(true);
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setCurrentReport(null);
  };

  // Sauvegarder un rapport depuis l'en-tête
  const handleSaveReportFromHeader = async () => {
    if (!currentReport) return;
    
    try {
      setIsLoading(true);
      const savedReport = await saveReport(currentReport);
      
      setCurrentReport(savedReport);
      
      // Mettre à jour la liste des rapports
      setReports((prev) => {
        if (prev.find((r) => r.id === savedReport.id)) {
          return prev.map((r) => (r.id === savedReport.id ? savedReport : r));
        } else {
          return [savedReport, ...prev];
        }
      });
      
      // Notification de succès
      alert("Rapport sauvegardé avec succès!");
      
      // Retourner à la liste des rapports
      setIsEditing(false);
      setCurrentReport(null);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du rapport:", err);
      alert("Une erreur est survenue lors de la sauvegarde du rapport.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Exporter un rapport en Excel
  const handleExportReportFromHeader = () => {
    if (!currentReport) return;
    generateExcel(currentReport);
  };

  // Supprimer un rapport
  const handleDeleteReport = async (reportId: number) => {
    if (!reportId || !window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) return;
    
    try {
      setIsLoading(true);
      // Appeler l'API pour supprimer le rapport
      await fetch(`/api/casino-reports/${reportId}`, {
        method: 'DELETE',
      });
      
      // Mettre à jour la liste des rapports
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      // Notification de succès
      alert("Rapport supprimé avec succès!");
    } catch (err) {
      console.error("Erreur lors de la suppression du rapport:", err);
      alert("Une erreur est survenue lors de la suppression du rapport.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les rapports par recherche
  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(report.date).toLocaleDateString('fr-FR');
    return dateStr.includes(searchLower) || 
           report.month.toLowerCase().includes(searchLower) ||
           String(report.year).includes(searchLower);
  });

  // Trier les rapports par date
  const sortedReports = [...filteredReports].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="h-12 w-12 border-4 border-t-blue-500 border-blue-500/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Barre de navigation latérale (à implémenter) */}
      
      {/* Contenu principal */}
      <main className="w-full">
        {/* En-tête persistant */}
        <header className="bg-[#1a1a1a] py-4 px-6 shadow-md border-b border-[#323232]">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditing 
                  ? currentReport?.id 
                    ? `Modifier le rapport - ${new Date(currentReport.date).toLocaleDateString('fr-FR')}`
                    : "Nouveau rapport"
                  : "Dashboard Admin"
                }
              </h1>
              <p className="text-sm text-gray-400">
                {isEditing 
                  ? `${currentReport?.id ? 'Modification' : 'Création'} d'un rapport de performance`
                  : "Gérez vos rapports et analysez les statistiques"
                }
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <AdminButton
                    variant="secondary"
                    onClick={handleCloseEditor}
                    className="px-3 py-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Retour</span>
                  </AdminButton>
                  
                  <AdminButton
                    variant="secondary"
                    onClick={handleExportReportFromHeader}
                    className="px-3 py-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exporter</span>
                  </AdminButton>
                  
                  <AdminButton
                    variant="primary"
                    onClick={handleSaveReportFromHeader}
                    loading={isLoading}
                    className="px-4 py-2"
                  >
                    <SaveIcon className="h-4 w-4" />
                    <span>Enregistrer</span>
                  </AdminButton>
                </>
              ) : (
                <AdminButton 
                  variant="primary"
                  onClick={handleCreateReport}
                  className="px-4 py-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Nouveau rapport</span>
                </AdminButton>
              )}
            </div>
          </div>
        </header>

        {/* Navigation par onglets - visible uniquement si pas en mode édition */}
        {!isEditing && (
          <nav className="bg-[#1d1d1d] border-b border-[#323232]">
            <div className="container mx-auto">
              <div className="flex">
                <button
                  className={`px-6 py-4 font-medium text-sm relative transition ${
                    activeTab === "reports" 
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("reports")}
                >
                  Rapports
                </button>
                <button
                  className={`px-6 py-4 font-medium text-sm relative transition flex items-center gap-2 ${
                    activeTab === "stats" 
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" 
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("stats")}
                >
                  <BarChart2 className="h-4 w-4" />
                  Statistiques
                </button>
              </div>
            </div>
          </nav>
        )}

        {/* Contenu principal */}
        <div className="container mx-auto py-6 px-4">
          {isEditing ? (
            <AdminCard className="shadow-lg">
              {currentReport && (
                <ReportEditor
                  activeReport={currentReport}
                  setActiveReport={setCurrentReport}
                  setReports={setReports}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  onClose={handleCloseEditor}
                  isInline={true}
                />
              )}
            </AdminCard>
          ) : (
            <>
              {activeTab === "reports" && (
                <div className="space-y-6">
                  {/* Barre d'outils: recherche et filtres */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1a1a1a] p-4 rounded-lg border border-[#323232]">
                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un rapport..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#252525] border border-[#323232] rounded-md text-white text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Trier par:</span>
                      <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="flex items-center gap-1 px-3 py-2 bg-[#252525] border border-[#323232] rounded-md text-white text-sm hover:bg-[#2a2a2a]"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                        <ChevronDown className={`h-3 w-3 text-gray-400 ${sortOrder === "asc" ? "rotate-180" : ""} transition-transform`} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Liste des rapports */}
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="h-10 w-10 border-4 border-t-blue-500 border-blue-500/30 rounded-full animate-spin"></div>
                    </div>
                  ) : showEmptyState || sortedReports.length === 0 ? (
                    <div className="bg-[#1A1A1A] rounded-xl p-10 border border-[#323232] text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                        <Calendar className="h-8 w-8 text-blue-400" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-white">Aucun rapport disponible</h3>
                      <p className="mb-6 text-gray-400">
                        {searchTerm 
                          ? "Aucun rapport ne correspond à votre recherche. Essayez avec d'autres termes."
                          : "Commencez par créer votre premier rapport de performance."
                        }
                      </p>
                      {!searchTerm && (
                        <AdminButton variant="primary" onClick={handleCreateReport}>
                          <PlusCircle className="h-4 w-4" />
                          Créer un rapport
                        </AdminButton>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {sortedReports.map(report => (
                        <div 
                          key={report.id}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1A1A1A] hover:bg-[#1e1e1e] p-5 rounded-xl border border-[#323232] hover:border-[#424242] transition-colors cursor-pointer"
                        >
                          <div className="flex-grow" onClick={() => handleEditReport(report)}>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                Rapport du {new Date(report.date).toLocaleDateString('fr-FR')}
                              </h3>
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">
                                {report.template_name}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                              {/* KPIs du rapport */}
                              {(() => {
                                // Calculer les totaux
                                let totalDeposit = 0;
                                let totalSignups = 0;
                                let totalFtd = 0;
                                let totalProfits = 0;
                                
                                Object.entries(report.data).forEach(([key, value]) => {
                                  if (key.includes('_TOTAL_DEPOSIT')) totalDeposit += parseFloat(value || '0');
                                  if (key.includes('_SIGNUP')) totalSignups += parseInt(value || '0');
                                  if (key.includes('_FTD')) totalFtd += parseInt(value || '0');
                                  if (key.includes('_PROFITS')) totalProfits += parseFloat(value || '0');
                                });

                                return (
                                  <>
                                    <div className="bg-[#252525] p-3 rounded-lg">
                                      <p className="text-xs text-gray-400">Total des dépôts</p>
                                      <p className="text-lg font-medium text-white">{totalDeposit.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</p>
                                    </div>
                                    <div className="bg-[#252525] p-3 rounded-lg">
                                      <p className="text-xs text-gray-400">Inscriptions</p>
                                      <p className="text-lg font-medium text-white">{totalSignups}</p>
                                    </div>
                                    <div className="bg-[#252525] p-3 rounded-lg">
                                      <p className="text-xs text-gray-400">Premier dépôt (FTD)</p>
                                      <p className="text-lg font-medium text-white">{totalFtd}</p>
                                    </div>
                                    <div className="bg-[#252525] p-3 rounded-lg">
                                      <p className="text-xs text-gray-400">Profits</p>
                                      <p className="text-lg font-medium text-white">{totalProfits.toLocaleString('fr-FR', {minimumFractionDigits: 2})} €</p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Actions sur le rapport */}
                          <div className="flex sm:flex-col gap-2 sm:self-start mt-4 sm:mt-0">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReport(report.id as number);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                              title="Supprimer le rapport"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (report.id) {
                                  const reportToExport = { ...report };
                                  generateExcel(reportToExport);
                                }
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded"
                              title="Exporter en Excel"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "stats" && (
                <StatisticsPanel />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}