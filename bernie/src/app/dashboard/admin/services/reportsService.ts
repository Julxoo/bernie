// src/app/dashboard/admin/services/reportsService.ts
import * as XLSX from "xlsx";
import { CASINOS, MONTHS, addCasino } from "../constants";
import { CasinoReport } from "../types";
import { Session } from "next-auth";

// Fonction pour récupérer tous les rapports
export async function fetchReports(): Promise<CasinoReport[]> {
  const response = await fetch('/api/casino-reports');
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des rapports');
  }
  return await response.json();
}

// Fonction pour créer un nouveau rapport
export function createNewReport(session?: Session | null): CasinoReport {
  const currentDate = new Date();
  const currentMonth = MONTHS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  // Structure initiale du rapport
  const newReportData: CasinoReport = {
    template_id: 1,
    template_name: "Rapport Performances Mensuelles",
    month: currentMonth,
    year: currentYear,
    created_at: new Date().toISOString(),
    data: {},
    user_id: session?.user?.id
  };
  
  // Initialiser les données pour chaque casino
  CASINOS.forEach(casino => {
    newReportData.data[`${casino}_TOTAL_DEPOSIT`] = "0.00";
    newReportData.data[`${casino}_SIGNUP`] = "0";
    newReportData.data[`${casino}_FTD`] = "0";
    newReportData.data[`${casino}_NGR`] = "0.00";
    newReportData.data[`${casino}_PROFITS`] = "0.00";
  });
  
  return newReportData;
}

// Fonction pour sauvegarder un rapport
export async function saveReport(report: CasinoReport): Promise<CasinoReport> {
  // Ajouter template_id et template_name si non définis
  if (!report.template_id) {
    report.template_id = 1;
  }
  if (!report.template_name) {
    report.template_name = "Rapport Performances Mensuelles";
  }

  // Si le rapport a un ID, mise à jour, sinon création
  let response;
  if (report.id) {
    response = await fetch(`/api/casino-reports/${report.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
  } else {
    response = await fetch('/api/casino-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
  }
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur de sauvegarde');
  }
  
  return await response.json();
}

// Fonction pour supprimer un rapport
export async function deleteReport(reportId: number): Promise<boolean> {
  const response = await fetch(`/api/casino-reports/${reportId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur de suppression');
  }
  
  return true;
}

// Fonction pour générer et télécharger un fichier Excel
export function generateExcel(report: CasinoReport): void {
  // Créer un nouveau classeur
  const wb = XLSX.utils.book_new();
  
  // En-tête de la feuille
  const sheetData = [
    [`Rapport mensuel - ${report.month} ${report.year}`],
    []
  ];
  
  // Première section - En-têtes
  sheetData.push(
    ["CASINO", "TOTAL DEPOSIT", "SIGNUP", "FTD", "", "DEPOSIT/SIGNUP", "DEPOSIT/FTD", ""]
  );
  
  // Données pour chaque casino
  let totalDeposit = 0;
  let totalSignup = 0; 
  let totalFtd = 0;
  
  CASINOS.forEach(casino => {
    const deposit = parseFloat(report.data[`${casino}_TOTAL_DEPOSIT`] || "0");
    const signup = parseInt(report.data[`${casino}_SIGNUP`] || "0");
    const ftd = parseInt(report.data[`${casino}_FTD`] || "0");
    
    // Calculer les ratios
    const depositPerSignup = signup > 0 ? deposit / signup : 0;
    const depositPerFtd = ftd > 0 ? deposit / ftd : 0;
    
    // Ajouter la ligne pour ce casino
    sheetData.push([
      casino,
      deposit.toFixed(2) + " €",
      signup.toString(),
      ftd.toString(),
      "",
      depositPerSignup.toFixed(2) + " €",
      depositPerFtd.toFixed(2) + " €",
      ""
    ]);
    
    // Additionner pour le total
    totalDeposit += deposit;
    totalSignup += signup;
    totalFtd += ftd;
  });
  
  // Calculer les totaux
  const totalDepositPerSignup = totalSignup > 0 ? totalDeposit / totalSignup : 0;
  const totalDepositPerFtd = totalFtd > 0 ? totalDeposit / totalFtd : 0;
  
  // Ajouter la ligne du total
  sheetData.push([
    "TOTAL :",
    totalDeposit.toFixed(2) + " €",
    totalSignup.toString(),
    totalFtd.toString(),
    "",
    totalDepositPerSignup.toFixed(2) + " €",
    totalDepositPerFtd.toFixed(2) + " €",
    ""
  ]);
  
  // Ajouter une ligne vide
  sheetData.push([]);
  
  // Deuxième section - NGR et PROFITS
  sheetData.push(
    ["CASINO", "NGR", "PROFITS"]
  );
  
  // Données pour chaque casino
  let totalNgr = 0;
  let totalProfits = 0;
  
  CASINOS.forEach(casino => {
    const ngr = parseFloat(report.data[`${casino}_NGR`] || "0");
    const profits = parseFloat(report.data[`${casino}_PROFITS`] || "0");
    
    // Ajouter la ligne pour ce casino
    sheetData.push([
      casino,
      ngr.toFixed(2) + " €",
      profits.toFixed(2) + " €"
    ]);
    
    // Additionner pour le total
    totalNgr += ngr;
    totalProfits += profits;
  });
  
  // Ajouter la ligne du total
  sheetData.push([
    "TOTAL :",
    totalNgr.toFixed(2) + " €",
    totalProfits.toFixed(2) + " €"
  ]);
  
  // Créer la feuille et l'ajouter au classeur
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Appliquer des styles (largeur de colonnes, etc.)
  const colWidths = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 5 }, { wch: 15 }, { wch: 15 }];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, `${report.month.substring(0, 3)}_${report.year}`);
  
  // Télécharger le fichier
  XLSX.writeFile(wb, `Rapport_${report.month}_${report.year}.xlsx`);
}

// Fonction pour importer un fichier Excel
export function importExcel(file: File): Promise<CasinoReport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Récupérer la première feuille
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        
        // Extraire le mois et l'année du titre
        let month = "janvier";
        let year = new Date().getFullYear();
        
        if (jsonData[0] && jsonData[0][0]) {
          const titleText = String(jsonData[0][0]);
          const titleMatch = titleText.match(/(\w+)\s+(\d{4})/);
          if (titleMatch) {
            const potentialMonth = titleMatch[1].toLowerCase();
            if (MONTHS.includes(potentialMonth)) {
              month = potentialMonth;
            }
            
            const potentialYear = parseInt(titleMatch[2]);
            if (!isNaN(potentialYear) && potentialYear > 2000 && potentialYear < 2100) {
              year = potentialYear;
            }
          }
        }
        
        // Initialiser un nouveau rapport
        const newReportData: CasinoReport = {
          template_id: 1,
          template_name: "Rapport Performances Mensuelles",
          month: month,
          year: year,
          created_at: new Date().toISOString(),
          data: {}
        };
        
        // Parcourir les données pour remplir le rapport
        // Première section - Dépôts, inscriptions, FTD
        for (let i = 3; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 4) continue;
          
          const casino = String(row[0]);
          
          // Arrêter au total
          if (casino === "TOTAL :") break;
          
          // Si le casino n'est pas déjà dans notre liste et n'est pas une ligne vide ou spéciale
          if (!CASINOS.includes(casino) && casino.trim() !== "" && !casino.toLowerCase().includes("total")) {
            // Ajouter automatiquement ce casino à notre liste
            addCasino(casino);
          }
          
          if (CASINOS.includes(casino)) {
            // Extraire les valeurs
            const deposit = parseFloat(String(row[1]).replace(/[^\d.-]/g, '') || "0");
            const signup = parseInt(String(row[2]) || "0");
            const ftd = parseInt(String(row[3]) || "0");
            
            // Stocker les valeurs
            newReportData.data[`${casino}_TOTAL_DEPOSIT`] = deposit.toString();
            newReportData.data[`${casino}_SIGNUP`] = signup.toString();
            newReportData.data[`${casino}_FTD`] = ftd.toString();
          }
        }
        
        // Deuxième section - NGR et Profits
        let ngrSectionFound = false;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 3) continue;
          
          // Détecter le début de la section NGR/PROFITS
          if (row[0] === "CASINO" && row[1] === "NGR" && row[2] === "PROFITS") {
            ngrSectionFound = true;
            continue;
          }
          
          if (ngrSectionFound) {
            const casino = String(row[0]);
            
            // Arrêter au total
            if (casino === "TOTAL :") break;
            
            // Si le casino n'est pas déjà dans notre liste et n'est pas une ligne vide ou spéciale
            if (!CASINOS.includes(casino) && casino.trim() !== "" && !casino.toLowerCase().includes("total")) {
              // Ajouter automatiquement ce casino à notre liste
              addCasino(casino);
            }
            
            if (CASINOS.includes(casino)) {
              // Extraire les valeurs
              const ngr = parseFloat(String(row[1]).replace(/[^\d.-]/g, '') || "0");
              const profits = parseFloat(String(row[2]).replace(/[^\d.-]/g, '') || "0");
              
              // Stocker les valeurs
              newReportData.data[`${casino}_NGR`] = ngr.toString();
              newReportData.data[`${casino}_PROFITS`] = profits.toString();
            }
          }
        }
        
        resolve(newReportData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}