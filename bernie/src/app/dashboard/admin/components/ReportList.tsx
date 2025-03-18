// src/app/dashboard/admin/components/ReportList.tsx
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Plus, Upload, FileText, Download, Trash2, BarChart2,
  Calendar as CalendarIcon, List, CalendarDays 
} from "lucide-react";
import { createNewReport, importExcel, deleteReport, generateExcel } from "../services/reportsService";
import { CASINOS, formatDateFr, getCurrentDateFormatted } from "../constants";
import { CasinoReport } from "../types";
import CalendarView from "./CalendarView";
import DatePickerInput from "./DatePickerInput";

interface ReportListProps {
  reports: CasinoReport[];
  isLoading: boolean;
  setReports: React.Dispatch<React.SetStateAction<CasinoReport[]>>;
  setActiveReport: React.Dispatch<React.SetStateAction<CasinoReport | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const ReportList: React.FC<ReportListProps> = ({ reports, isLoading, setReports, setActiveReport, setActiveTab }) => {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  // Gérer la création d'un nouveau rapport
  const handleCreateReport = (date?: string) => {
    const newReport = createNewReport(session);
    
    // Si une date est fournie, mettre à jour le rapport
    if (date) {
      const newDate = new Date(date);
      newReport.date = date;
      newReport.day = newDate.getDate();
      newReport.month = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
      ][newDate.getMonth()];
      newReport.year = newDate.getFullYear();
    }
    
    setActiveReport(newReport);
    setActiveTab("edit");
  };

  // Gérer l'importation d'un fichier Excel
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const importedReport = await importExcel(file);
      // Ajouter l'ID utilisateur
      if (session?.user?.id) {
        importedReport.user_id = session.user.id;
      }
      setActiveReport(importedReport);
      setActiveTab("edit");
    } catch (err) {
      console.error("Erreur d'importation:", err);
      alert("Impossible d'importer ce fichier.");
    }
    
    // Réinitialiser l'input file
    event.target.value = '';
  };
  
  // Gérer la suppression d'un rapport
  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;
    
    try {
      await deleteReport(reportId);
      setReports(reports.filter(report => report.id !== reportId));
    } catch (err) {
      console.error("Erreur de suppression:", err);
      alert("Impossible de supprimer ce rapport.");
    }
  };
  
  // Gérer l'exportation en Excel
  const handleExport = (report: CasinoReport) => {
    setActiveReport(report);
    setTimeout(() => generateExcel(report), 100);
  };

  // Gérer l'édition d'un rapport
  const handleEditReport = (report: CasinoReport) => {
    setActiveReport(report);
    setActiveTab("edit");
  };

  // Regrouper les rapports par année puis par mois
  const reportsByYear = React.useMemo(() => {
    const byYear: { [key: number]: CasinoReport[] } = {};
    
    reports.forEach(report => {
      if (!byYear[report.year]) {
        byYear[report.year] = [];
      }
      byYear[report.year].push(report);
    });
    
    // Trier les années par ordre décroissant
    return Object.keys(byYear)
      .map(Number)
      .sort((a, b) => b - a)
      .map(year => ({
        year,
        reports: byYear[year].sort((a, b) => {
          // Trier d'abord par mois puis par jour
          const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
          const monthDiff = months.indexOf(b.month) - months.indexOf(a.month);
          
          return monthDiff !== 0 ? monthDiff : b.day - a.day;
        })
      }));
  }, [reports]);

  // Obtenir les statistiques globales pour les rapports
  const getStats = () => {
    let totalReports = reports.length;
    let totalCasinos = CASINOS.length;
    let totalYears = new Set(reports.map(r => r.year)).size;
    let lastUpdated = reports.length > 0 
      ? new Date(Math.max(...reports.map(r => new Date(r.created_at).getTime())))
      : null;
    
    return { totalReports, totalCasinos, totalYears, lastUpdated };
  };

  const stats = getStats();

  return (
    <div>
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242] flex items-center">
          <CalendarDays className="text-blue-500 mr-3" size={24} />
          <div>
            <h4 className="text-sm text-gray-400">Rapports</h4>
            <p className="text-xl font-semibold">{stats.totalReports}</p>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242] flex items-center">
          <BarChart2 className="text-purple-500 mr-3" size={24} />
          <div>
            <h4 className="text-sm text-gray-400">Années couvertes</h4>
            <p className="text-xl font-semibold">{stats.totalYears}</p>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242] flex items-center">
          <FileText className="text-green-500 mr-3" size={24} />
          <div>
            <h4 className="text-sm text-gray-400">Casinos suivis</h4>
            <p className="text-xl font-semibold">{stats.totalCasinos}</p>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242] flex items-center">
          <Upload className="text-amber-500 mr-3" size={24} />
          <div>
            <h4 className="text-sm text-gray-400">Dernière mise à jour</h4>
            <p className="text-sm font-semibold">
              {stats.lastUpdated 
                ? stats.lastUpdated.toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                : 'Aucune donnée'}
            </p>
          </div>
        </div>
      </div>

      {/* Boutons d'action et sélecteur de vue */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleCreateReport(getCurrentDateFormatted())}
            className="flex items-center gap-2 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#525252] transition-colors"
          >
            <Plus size={16} />
            Nouveau rapport
          </button>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-[#323232] text-[#ECECEC] rounded-lg hover:bg-[#424242] transition-colors">
              <Upload size={16} />
              Importer un Excel
            </div>
          </label>
        </div>
        
        <div className="flex items-center bg-[#323232] rounded-lg overflow-hidden">
          <button 
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 ${
              viewMode === "list" ? "bg-[#424242]" : "hover:bg-[#383838]"
            } transition-colors`}
          >
            <List size={16} />
            Liste
          </button>
          <button 
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-4 py-2 ${
              viewMode === "calendar" ? "bg-[#424242]" : "hover:bg-[#383838]"
            } transition-colors`}
          >
            <CalendarIcon size={16} />
            Calendrier
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center p-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <p className="mt-2 text-gray-400">Chargement des rapports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-[#171717] p-8 text-center rounded-lg border border-[#424242]">
          <FileText size={48} className="text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucun rapport sauvegardé</h3>
          <p className="text-gray-400 mb-6">
            Créez votre premier rapport ou importez un fichier Excel existant
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleCreateReport()}
              className="flex items-center gap-2 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#525252] transition-colors"
            >
              <Plus size={16} />
              Créer un rapport
            </button>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-4 py-2 bg-[#323232] text-[#ECECEC] rounded-lg hover:bg-[#424242] transition-colors">
                <Upload size={16} />
                Importer un Excel
              </div>
            </label>
          </div>
        </div>
      ) : viewMode === "calendar" ? (
        <CalendarView 
          reports={reports}
          onEditReport={handleEditReport}
          onDeleteReport={handleDeleteReport}
          onExportReport={handleExport}
          onCreateReport={handleCreateReport}
        />
      ) : (
        <div>
          {reportsByYear.map(({ year, reports }) => (
            <div key={year} className="mb-6">
              <h3 className="text-xl font-semibold mb-3">{year}</h3>
              <div className="bg-[#171717] rounded-lg border border-[#424242] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#424242]">
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Total Dépôts</th>
                      <th className="text-left p-4">Total Profits</th>
                      <th className="text-left p-4">Date de création</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      // Calculer les totaux pour l'affichage dans la liste
                      let totalDeposit = 0;
                      let totalProfits = 0;
                      
                      CASINOS.forEach(casino => {
                        totalDeposit += parseFloat(report.data[`${casino}_TOTAL_DEPOSIT`] || "0");
                        totalProfits += parseFloat(report.data[`${casino}_PROFITS`] || "0");
                      });
                      
                      return (
                        <tr key={report.id} className="border-b border-[#424242] hover:bg-[#1d1d1d]">
                          <td className="p-4 font-medium">{formatDateFr(report.date)}</td>
                          <td className="p-4">{totalDeposit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                          <td className="p-4">{totalProfits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                          <td className="p-4">{new Date(report.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleEditReport(report)}
                                className="p-1 rounded-full hover:bg-blue-900/30 text-blue-400"
                                title="Éditer"
                              >
                                <FileText size={16} />
                              </button>
                              <button 
                                onClick={() => handleExport(report)}
                                className="p-1 rounded-full hover:bg-green-900/30 text-green-400"
                                title="Exporter en Excel"
                              >
                                <Download size={16} />
                              </button>
                              <button 
                                onClick={() => report.id && handleDeleteReport(report.id)}
                                className="p-1 rounded-full hover:bg-red-900/30 text-red-400"
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;