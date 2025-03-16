// src/app/dashboard/admin/components/ReportEditor.tsx
import React, { useState } from "react";
import { Save, Download, Plus, Edit, Trash, Check, X } from "lucide-react";
import {
  CASINOS,
  METRICS,
  MONTHS,
  addCasino,
  removeCasino,
  renameCasino,
} from "../constants";
import { saveReport, generateExcel } from "../services/reportsService";
import { CasinoReport } from "../types";

interface ReportEditorProps {
  activeReport: CasinoReport;
  setActiveReport: React.Dispatch<React.SetStateAction<CasinoReport | null>>;
  setReports: React.Dispatch<React.SetStateAction<CasinoReport[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReportEditor: React.FC<ReportEditorProps> = ({
  activeReport,
  setActiveReport,
  setReports,
  isLoading,
  setIsLoading,
}) => {
  const [newCasinoName, setNewCasinoName] = useState<string>("");
  const [editingCasino, setEditingCasino] = useState<string | null>(null);
  const [editCasinoName, setEditCasinoName] = useState<string>("");
  const [casinoToDelete, setCasinoToDelete] = useState<string | null>(null);

  // Mettre à jour une valeur dans le rapport
  const handleReportChange = (
    casino: string,
    metricId: string,
    value: string
  ): void => {
    setActiveReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [`${casino}_${metricId}`]: value,
        },
      };
    });
  };

  // Mettre à jour les métadonnées (mois/année)
  const handleMetadataChange = (
    field: string,
    value: string | number
  ): void => {
    setActiveReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // Sauvegarder le rapport
  const handleSaveReport = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const savedReport = await saveReport(activeReport);

      setActiveReport(savedReport);

      // Mettre à jour la liste des rapports
      setReports((prev) => {
        if (prev.find((r) => r.id === savedReport.id)) {
          return prev.map((r) => (r.id === savedReport.id ? savedReport : r));
        } else {
          return [savedReport, ...prev];
        }
      });

      alert("Rapport sauvegardé avec succès!");
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du rapport:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      alert("Erreur lors de la sauvegarde du rapport: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Exporter en Excel
  const handleExportExcel = (): void => {
    generateExcel(activeReport);
  };

  // Fonction pour ajouter un nouveau casino
  const handleAddCasino = (): void => {
    if (newCasinoName.trim() === "") {
      alert("Veuillez entrer un nom de casino");
      return;
    }

    // Vérifier si le casino existe déjà
    const casinoName = newCasinoName.trim().toUpperCase();
    if (CASINOS.includes(casinoName)) {
      alert("Ce casino existe déjà");
      return;
    }

    // Ajouter le casino à la liste globale
    addCasino(casinoName);

    // Initialiser les données pour ce casino dans le rapport actif
    setActiveReport((prev) => {
      if (!prev) return prev;

      const updatedReport = {
        ...prev,
        data: {
          ...prev.data,
        },
      };

      // Initialiser les champs pour le nouveau casino
      updatedReport.data[`${casinoName}_TOTAL_DEPOSIT`] = "0.00";
      updatedReport.data[`${casinoName}_SIGNUP`] = "0";
      updatedReport.data[`${casinoName}_FTD`] = "0";
      updatedReport.data[`${casinoName}_NGR`] = "0.00";
      updatedReport.data[`${casinoName}_PROFITS`] = "0.00";

      return updatedReport;
    });

    // Réinitialiser le champ
    setNewCasinoName("");
  };

  // Commencer la modification d'un casino
  const startEditCasino = (casino: string): void => {
    setEditingCasino(casino);
    setEditCasinoName(casino);
  };

  // Annuler la modification d'un casino
  const cancelEditCasino = (): void => {
    setEditingCasino(null);
    setEditCasinoName("");
  };

  // Confirmer la modification d'un casino
  const confirmEditCasino = (): void => {
    if (!editingCasino) return;
    if (editCasinoName.trim() === "") {
      alert("Le nom du casino ne peut pas être vide");
      return;
    }

    const newName = editCasinoName.trim().toUpperCase();
    if (newName === editingCasino) {
      // Pas de changement
      cancelEditCasino();
      return;
    }

    if (CASINOS.includes(newName)) {
      alert("Un casino avec ce nom existe déjà");
      return;
    }

    // Mettre à jour les données du rapport
    setActiveReport((prev) => {
      if (!prev) return prev;

      const updatedData = { ...prev.data };

      // Copier les données de l'ancien casino vers le nouveau
      METRICS.forEach(({ id }) => {
        const oldKey = `${editingCasino}_${id}`;
        const newKey = `${newName}_${id}`;

        if (updatedData[oldKey] !== undefined) {
          updatedData[newKey] = updatedData[oldKey];
          delete updatedData[oldKey]; // Supprimer l'ancienne clé
        }
      });

      return {
        ...prev,
        data: updatedData,
      };
    });

    // Renommer dans la liste globale
    renameCasino(editingCasino, newName);

    // Réinitialiser
    cancelEditCasino();
  };

  // Confirmer la suppression d'un casino
  const confirmDeleteCasino = (casino: string): void => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir supprimer le casino ${casino} ?`)
    ) {
      // Supprimer les données du casino du rapport
      setActiveReport((prev) => {
        if (!prev) return prev;

        const updatedData = { ...prev.data };

        // Supprimer toutes les clés associées à ce casino
        METRICS.forEach(({ id }) => {
          const key = `${casino}_${id}`;
          delete updatedData[key];
        });

        return {
          ...prev,
          data: updatedData,
        };
      });

      // Supprimer de la liste globale
      removeCasino(casino);
    }
  };

  // Calculer les totaux et ratios
  const calculateTotals = (): {
    totalDeposit: number;
    totalSignup: number;
    totalFtd: number;
    totalNgr: number;
    totalProfits: number;
  } => {
    let totalDeposit = 0;
    let totalSignup = 0;
    let totalFtd = 0;
    let totalNgr = 0;
    let totalProfits = 0;

    CASINOS.forEach((casino) => {
      totalDeposit += parseFloat(
        activeReport.data[`${casino}_TOTAL_DEPOSIT`] || "0"
      );
      totalSignup += parseInt(activeReport.data[`${casino}_SIGNUP`] || "0");
      totalFtd += parseInt(activeReport.data[`${casino}_FTD`] || "0");
      totalNgr += parseFloat(activeReport.data[`${casino}_NGR`] || "0");
      totalProfits += parseFloat(activeReport.data[`${casino}_PROFITS`] || "0");
    });

    return { totalDeposit, totalSignup, totalFtd, totalNgr, totalProfits };
  };

  return (
    <div className="bg-[#171717] p-6 rounded-lg border border-[#424242]">
      {/* En-tête et boutons d'action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold capitalize">
            Rapport {activeReport.month} {activeReport.year}
          </h2>
          <p className="text-sm text-gray-400">
            {activeReport.id
              ? "Modification du rapport"
              : "Création d'un nouveau rapport"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-[#ECECEC] rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Download size={16} />
            Exporter en Excel
          </button>
          <button
            onClick={handleSaveReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#171717] transition-colors duration-200 border border-[#424242]"
            disabled={isLoading}
          >
            <Save size={16} />
            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Métadonnées du rapport */}
      <div className="bg-[#1a1a1a] p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Mois
            </label>
            <select
              value={activeReport.month}
              onChange={(e) => handleMetadataChange("month", e.target.value)}
              className="w-full p-2 rounded bg-[#212121] border border-[#424242] text-white"
            >
              {MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Année
            </label>
            <input
              type="number"
              value={activeReport.year}
              onChange={(e) =>
                handleMetadataChange(
                  "year",
                  parseInt(e.target.value) || new Date().getFullYear()
                )
              }
              className="w-full p-2 rounded bg-[#212121] border border-[#424242] text-white"
              min="2020"
              max="2030"
            />
          </div>
        </div>
      </div>

      {/* Gestion des casinos */}
      <div className="mb-6 bg-[#1a1a1a] p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Gestion des casinos</h3>

        {/* Ajouter un nouveau casino */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newCasinoName}
            onChange={(e) => setNewCasinoName(e.target.value)}
            placeholder="Nom du nouveau casino"
            className="flex-1 p-2 rounded bg-[#212121] border border-[#424242] text-white"
          />
          <button
            onClick={handleAddCasino}
            className="flex items-center gap-2 px-4 py-2 bg-[#424242] text-[#ECECEC] rounded-lg hover:bg-[#171717] transition-colors duration-200 border border-[#424242]"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {/* Liste des casinos avec options de modification/suppression */}
        <div className="mt-4 border border-[#424242] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#212121]">
              <tr>
                <th className="text-left p-3 border-b border-[#2a2a2a]">
                  Nom du casino
                </th>
                <th className="text-right p-3 border-b border-[#2a2a2a]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {CASINOS.map((casino) => (
                <tr key={casino} className="border-b border-[#2a2a2a]">
                  <td className="p-3">
                    {editingCasino === casino ? (
                      <input
                        type="text"
                        value={editCasinoName}
                        onChange={(e) => setEditCasinoName(e.target.value)}
                        className="w-full p-2 rounded bg-[#212121] border border-[#424242] text-white"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{casino}</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {editingCasino === casino ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={confirmEditCasino}
                          className="p-1 rounded-full hover:bg-green-800/30 text-green-500"
                          title="Confirmer"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEditCasino}
                          className="p-1 rounded-full hover:bg-red-800/30 text-red-500"
                          title="Annuler"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditCasino(casino)}
                          className="p-1 rounded-full hover:bg-blue-800/30 text-blue-500"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => confirmDeleteCasino(casino)}
                          className="p-1 rounded-full hover:bg-red-800/30 text-red-500"
                          title="Supprimer"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Les modifications apportées aux casinos affecteront tous les rapports.
        </p>
      </div>

      {/* Tableaux de données - Section 1: Dépôts, Inscriptions, FTD */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Dépôts & Conversions</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-[#2a2a2a] rounded-lg overflow-hidden">
            <thead className="bg-[#212121]">
              <tr>
                <th className="text-left p-3 border-b border-[#2a2a2a]">
                  Casino
                </th>
                <th className="text-left p-3 border-b border-[#2a2a2a]">
                  TOTAL DEPOSIT
                </th>
                <th className="text-left p-3 border-b border-[#2a2a2a]">
                  SIGNUP
                </th>
                <th className="text-left p-3 border-b border-[#2a2a2a]">FTD</th>
                <th className="text-left p-3 border-b border-[#2a2a2a]">
                  DEPOSIT/SIGNUP
                </th>
                <th className="text-left p-3 border-b border-[#2a2a2a]">
                  DEPOSIT/FTD
                </th>
              </tr>
            </thead>
            <tbody>
              {CASINOS.map((casino) => {
                // Calculer les ratios
                const deposit = parseFloat(
                  activeReport.data[`${casino}_TOTAL_DEPOSIT`] || "0"
                );
                const signup = parseInt(
                  activeReport.data[`${casino}_SIGNUP`] || "0"
                );
                const ftd = parseInt(activeReport.data[`${casino}_FTD`] || "0");
                const depositPerSignup = signup > 0 ? deposit / signup : 0;
                const depositPerFtd = ftd > 0 ? deposit / ftd : 0;

                return (
                  <tr key={casino} className="border-b border-[#2a2a2a]">
                    <td className="p-3 font-medium">{casino}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={
                          activeReport.data[`${casino}_TOTAL_DEPOSIT`] || "0.00"
                        }
                        onChange={(e) =>
                          handleReportChange(
                            casino,
                            "TOTAL_DEPOSIT",
                            e.target.value
                          )
                        }
                        className="w-full p-2 rounded bg-[#171717] border border-[#2a2a2a] text-white"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={activeReport.data[`${casino}_SIGNUP`] || "0"}
                        onChange={(e) =>
                          handleReportChange(casino, "SIGNUP", e.target.value)
                        }
                        className="w-full p-2 rounded bg-[#171717] border border-[#2a2a2a] text-white"
                        placeholder="0"
                        min="0"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={activeReport.data[`${casino}_FTD`] || "0"}
                        onChange={(e) =>
                          handleReportChange(casino, "FTD", e.target.value)
                        }
                        className="w-full p-2 rounded bg-[#171717] border border-[#2a2a2a] text-white"
                        placeholder="0"
                        min="0"
                      />
                    </td>
                    <td className="p-3 text-gray-400">
                      {depositPerSignup.toFixed(2)} €
                    </td>
                    <td className="p-3 text-gray-400">
                      {depositPerFtd.toFixed(2)} €
                    </td>
                  </tr>
                );
              })}

              {/* Ligne de total calculé automatiquement */}
              <tr className="bg-[#1d1d1d]">
                <td className="p-3 font-bold">TOTAL</td>
                <td className="p-3 font-bold">
                  {calculateTotals().totalDeposit.toFixed(2)} €
                </td>
                <td className="p-3 font-bold">
                  {calculateTotals().totalSignup}
                </td>
                <td className="p-3 font-bold">{calculateTotals().totalFtd}</td>
                <td className="p-3 font-bold">
                  {(() => {
                    const { totalDeposit, totalSignup } = calculateTotals();
                    return totalSignup > 0
                      ? (totalDeposit / totalSignup).toFixed(2) + " €"
                      : "0.00 €";
                  })()}
                </td>
                <td className="p-3 font-bold">
                  {(() => {
                    const { totalDeposit, totalFtd } = calculateTotals();
                    return totalFtd > 0
                      ? (totalDeposit / totalFtd).toFixed(2) + " €"
                      : "0.00 €";
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tableaux de données - Section 2: NGR et Profits */}
      <div>
        <h3 className="text-lg font-medium mb-4">NGR & Profits</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-[#2a2a2a] rounded-lg overflow-hidden">
            <thead className="bg-[#212121]">
              <tr>
                <th className="text-left p-3 border-b border-[#2a2a2a]">
                  Casino
                </th>
                <th className="text-left p-3 border-b border-[#2a2a2a]">NGR</th>
                <th className="text-left p-3 border-b border-[#2a2a2a]">
                  PROFITS
                </th>
              </tr>
            </thead>
            <tbody>
              {CASINOS.map((casino) => (
                <tr key={casino} className="border-b border-[#2a2a2a]">
                  <td className="p-3 font-medium">{casino}</td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={activeReport.data[`${casino}_NGR`] || "0.00"}
                      onChange={(e) =>
                        handleReportChange(casino, "NGR", e.target.value)
                      }
                      className="w-full p-2 rounded bg-[#171717] border border-[#2a2a2a] text-white"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={activeReport.data[`${casino}_PROFITS`] || "0.00"}
                      onChange={(e) =>
                        handleReportChange(casino, "PROFITS", e.target.value)
                      }
                      className="w-full p-2 rounded bg-[#171717] border border-[#2a2a2a] text-white"
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              ))}

              {/* Ligne de total calculé automatiquement */}
              <tr className="bg-[#1d1d1d]">
                <td className="p-3 font-bold">TOTAL</td>
                <td className="p-3 font-bold">
                  {calculateTotals().totalNgr.toFixed(2)} €
                </td>
                <td className="p-3 font-bold">
                  {calculateTotals().totalProfits.toFixed(2)} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;
