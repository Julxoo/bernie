// src/app/dashboard/admin/components/ReportList.tsx
import { useSession } from "next-auth/react";
import { Plus, Upload, FileText, Download, Trash2 } from "lucide-react";
import { createNewReport, importExcel, deleteReport, generateExcel } from "../services/reportsService";
import { CASINOS } from "../constants";
import { CasinoReport } from "../types";

interface ReportListProps {
  reports: CasinoReport[];
  isLoading: boolean;
  setReports: React.Dispatch<React.SetStateAction<CasinoReport[]>>;
  setActiveReport: React.Dispatch<React.SetStateAction<CasinoReport | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const ReportList: React.FC<ReportListProps> = ({ reports, isLoading, setReports, setActiveReport, setActiveTab }) => {
  const { data: session } = useSession();
  
  // Gérer la création d'un nouveau rapport
  const handleCreateReport = () => {
    const newReport = createNewReport(session);
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

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={handleCreateReport}
          className="flex items-center gap-2 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg"
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
          <div className="flex items-center gap-2 px-4 py-2 bg-[#323232] text-[#ECECEC] rounded-lg">
            <Upload size={16} />
            Importer un Excel
          </div>
        </label>
      </div>
      
      {isLoading ? (
        <div className="text-center p-12">Chargement...</div>
      ) : reports.length === 0 ? (
        <div className="bg-[#171717] p-8 text-center rounded-lg border border-[#424242]">
          <FileText size={48} className="text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucun rapport sauvegardé</h3>
          <p className="text-gray-400 mb-6">
            Créez votre premier rapport ou importez un fichier Excel existant
          </p>
        </div>
      ) : (
        <div className="bg-[#171717] rounded-lg border border-[#424242] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#424242]">
                <th className="text-left p-4">Période</th>
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
                    <td className="p-4 font-medium capitalize">{report.month} {report.year}</td>
                    <td className="p-4">{totalDeposit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                    <td className="p-4">{totalProfits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                    <td className="p-4">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2 hover:bg-[#212121] rounded-full"
                          onClick={() => {
                            setActiveReport(report);
                            setActiveTab("edit");
                          }}
                          title="Voir/Modifier"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          className="p-2 hover:bg-[#212121] rounded-full"
                          onClick={() => handleExport(report)}
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          className="p-2 hover:bg-[#212121] rounded-full text-red-500"
                          onClick={() => report.id && handleDeleteReport(report.id)}
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
      )}
    </div>
  );
};

export default ReportList;