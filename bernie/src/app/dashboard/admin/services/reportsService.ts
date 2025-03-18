// src/app/dashboard/admin/services/reportsService.ts
import * as XLSX from "xlsx";
import { 
  CASINOS, 
  MONTHS, 
  addCasino, 
  formatDate, 
  getDayFromDate, 
  getMonthFromDate, 
  getYearFromDate 
} from "../constants";
import { CasinoReport, DateRange, StatFilter, StatResponse } from "../types";
import { Session } from "next-auth";

// Fonction pour récupérer tous les rapports
export async function fetchReports(): Promise<CasinoReport[]> {
  const response = await fetch('/api/casino-reports');
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des rapports');
  }
  return await response.json();
}

// Fonction pour récupérer les rapports dans une plage de dates
export async function fetchReportsByDateRange(dateRange: DateRange): Promise<CasinoReport[]> {
  const response = await fetch(`/api/casino-reports/range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des rapports par plage de dates');
  }
  return await response.json();
}

// Fonction pour créer un nouveau rapport
export function createNewReport(session?: Session | null): CasinoReport {
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  const currentDay = currentDate.getDate();
  const currentMonth = MONTHS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  // Structure initiale du rapport
  const newReportData: CasinoReport = {
    template_id: 1,
    template_name: "Rapport Performances Quotidiennes",
    day: currentDay,
    month: currentMonth,
    year: currentYear,
    date: formattedDate,
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
    report.template_name = "Rapport Performances Quotidiennes";
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
    [`Rapport quotidien - ${report.day} ${report.month} ${report.year}`],
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

// Fonction pour récupérer les statistiques
export async function fetchStats(filter: StatFilter): Promise<StatResponse> {
  try {
    const queryParams = new URLSearchParams({
      startDate: filter.dateRange.startDate,
      endDate: filter.dateRange.endDate,
      groupBy: filter.groupBy,
      metrics: filter.metrics.join(','),
      casinos: filter.casinos.join(','),
    });

    const response = await fetch(`/api/stats?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    // Pour le développement, simuler des données en attendant l'API réelle
    if (process.env.NODE_ENV === 'development') {
      return generateMockStats(filter);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return generateMockStats(filter); // En cas d'erreur, on renvoie des données simulées
  }
}

function generateMockStats(filter: StatFilter): StatResponse {
  const { startDate, endDate } = filter.dateRange;
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const dataPoints: any[] = [];
  const currentDate = new Date(start);
  
  // Générer des données pour chaque jour/semaine/mois selon le groupBy
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const point: any = {
      date: dateStr,
    };
    
    // Pour chaque casino et métrique, générer des données aléatoires
    filter.casinos.forEach(casino => {
      filter.metrics.forEach(metric => {
        // Les données varient selon les métriques
        let value = 0;
        if (metric === 'TOTAL_DEPOSIT') {
          value = Math.floor(Math.random() * 10000) + 500;
        } else if (metric === 'PROFITS') {
          value = Math.floor(Math.random() * 5000) + 100;
        } else if (metric === 'SIGNUP') {
          value = Math.floor(Math.random() * 50) + 5;
        } else if (metric === 'FTD') {
          value = Math.floor(Math.random() * 20) + 1;
        } else if (metric === 'NGR') {
          value = Math.floor(Math.random() * 8000) + 200;
        }
        
        // Pour les données agrégées par jour
        if (filter.groupBy === 'day') {
          point[metric] = (point[metric] || 0) + value;
          // Ajouter également des données par casino
          point[`${casino}_${metric}`] = value;
        } else {
          // Pour les données agrégées (semaine, mois, année)
          value *= (filter.groupBy === 'week' ? 7 : filter.groupBy === 'month' ? 30 : 365);
          point[metric] = (point[metric] || 0) + value;
          point[`${casino}_${metric}`] = value;
        }
      });
    });
    
    dataPoints.push(point);
    
    // Avancer à la prochaine période selon le groupBy
    if (filter.groupBy === 'day') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (filter.groupBy === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (filter.groupBy === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
  }
  
  // Générer des données pour la période précédente
  const previousPeriod = {
    deposits: Math.floor(Math.random() * 50000) + 10000,
    profits: Math.floor(Math.random() * 25000) + 5000,
    signups: Math.floor(Math.random() * 500) + 50,
    ftd: Math.floor(Math.random() * 200) + 20,
    ngr: Math.floor(Math.random() * 40000) + 8000,
  };
  
  return {
    data: dataPoints,
    previousPeriod,
    meta: {
      total: dataPoints.length,
      page: 1,
      pageSize: 100
    }
  };
}

// Fonction pour importer un fichier Excel
export function importExcel(file: File): Promise<CasinoReport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Extraire les informations du rapport depuis le titre
        const titleRow = jsonData[0][0] as string;
        let date = new Date();
        
        // Si c'est un ancien format (mensuel)
        if (titleRow.includes("Rapport mensuel")) {
          const matches = titleRow.match(/Rapport mensuel - (\w+) (\d{4})/);
          if (matches && matches.length >= 3) {
            const monthName = matches[1];
            const year = parseInt(matches[2]);
            const monthIndex = MONTHS.indexOf(monthName.toLowerCase());
            
            if (monthIndex !== -1) {
              date = new Date(year, monthIndex, 1);
            }
          }
        } else if (titleRow.includes("Rapport quotidien")) {
          // Nouveau format (quotidien)
          const matches = titleRow.match(/Rapport quotidien - (\d{1,2}) (\w+) (\d{4})/);
          if (matches && matches.length >= 4) {
            const day = parseInt(matches[1]);
            const monthName = matches[2];
            const year = parseInt(matches[3]);
            const monthIndex = MONTHS.indexOf(monthName.toLowerCase());
            
            if (monthIndex !== -1) {
              date = new Date(year, monthIndex, day);
            }
          }
        }
        
        const formattedDate = formatDate(date);
        
        // Créer la structure de rapport
        const importedReport: CasinoReport = {
          template_id: 1,
          template_name: "Rapport Performances Quotidiennes",
          day: getDayFromDate(formattedDate),
          month: getMonthFromDate(formattedDate),
          year: getYearFromDate(formattedDate),
          date: formattedDate,
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
            importedReport.data[`${casino}_TOTAL_DEPOSIT`] = deposit.toString();
            importedReport.data[`${casino}_SIGNUP`] = signup.toString();
            importedReport.data[`${casino}_FTD`] = ftd.toString();
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
              importedReport.data[`${casino}_NGR`] = ngr.toString();
              importedReport.data[`${casino}_PROFITS`] = profits.toString();
            }
          }
        }
        
        resolve(importedReport);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}