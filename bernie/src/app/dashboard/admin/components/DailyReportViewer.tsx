import React, { useState } from "react";
import { CasinoReport } from "../types";
import { ChevronLeft, ChevronRight, Download, Edit, Trash2, Calendar, List } from "lucide-react";
import { formatDateFr } from "../constants";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "./ui/AdminCard";
import { AdminButton } from "./ui/AdminButton";

interface DailyReportViewerProps {
  reports: CasinoReport[];
  onEditReport: (report: CasinoReport) => void;
  onDeleteReport: (reportId: number) => void;
  onExportReport: (report: CasinoReport) => void;
  onCreateReport: (date: string) => void;
}

type ViewMode = "calendar" | "list";

export function DailyReportViewer({
  reports,
  onEditReport,
  onDeleteReport,
  onExportReport,
  onCreateReport,
}: DailyReportViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fonctions pour gérer le changement de mois dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  // Générer la grille du calendrier
  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Obtenir le jour de la semaine du premier jour (0-6, où 0 = dimanche)
    const firstDayOfWeek = firstDay.getDay();
    
    // Ajuster pour commencer la semaine le lundi (0 = lundi, 6 = dimanche)
    const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Nombre de jours dans le mois courant
    const daysInMonth = lastDay.getDate();
    
    // Tableau pour stocker la grille du calendrier
    const calendarDays = [];
    
    // Jours du mois précédent à afficher
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = 0; i < adjustedFirstDayOfWeek; i++) {
      calendarDays.push({
        date: new Date(year, month - 1, daysInPrevMonth - adjustedFirstDayOfWeek + i + 1),
        isCurrentMonth: false,
      });
    }
    
    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingCells = 42 - calendarDays.length; // 6 semaines x 7 jours = 42
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return calendarDays;
  };
  
  // Formater une date au format YYYY-MM-DD
  const formatISODate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Récupérer un rapport pour une date donnée
  const getReportForDate = (date: Date) => {
    const isoDate = formatISODate(date);
    return reports.find(report => report.date === isoDate);
  };
  
  // Calculer les totaux pour un rapport
  const calculateReportTotals = (report: CasinoReport) => {
    let totalDeposit = 0;
    let totalProfits = 0;
    
    Object.entries(report.data).forEach(([key, value]) => {
      if (key.includes('_TOTAL_DEPOSIT')) {
        totalDeposit += parseFloat(value || '0');
      } else if (key.includes('_PROFITS')) {
        totalProfits += parseFloat(value || '0');
      }
    });
    
    return { totalDeposit, totalProfits };
  };
  
  // Nom des mois en français
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  // Jours de la semaine en français
  const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  
  // Regrouper les rapports par année puis par mois pour l'affichage en liste
  const groupReportsByYearAndMonth = () => {
    const grouped: { [year: number]: { [month: string]: CasinoReport[] } } = {};
    
    reports.forEach(report => {
      if (!grouped[report.year]) {
        grouped[report.year] = {};
      }
      
      if (!grouped[report.year][report.month]) {
        grouped[report.year][report.month] = [];
      }
      
      grouped[report.year][report.month].push(report);
    });
    
    // Convertir en tableau trié
    return Object.entries(grouped)
      .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
      .map(([year, months]) => ({
        year: Number(year),
        months: Object.entries(months)
          .map(([month, reports]) => ({
            month,
            reports: reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          })),
      }));
  };
  
  const groupedReports = groupReportsByYearAndMonth();
  const calendarDays = generateCalendarGrid();
  const today = new Date();
  
  return (
    <AdminCard className="overflow-hidden">
      <AdminCardHeader className="flex flex-row items-center justify-between border-b border-[#323232] p-4">
        <AdminCardTitle>Rapports quotidiens</AdminCardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-lg bg-[#252525] p-1">
            <AdminButton
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 rounded-md"
            >
              <List className="h-4 w-4" />
            </AdminButton>
            <AdminButton
              variant={viewMode === "calendar" ? "primary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("calendar")}
              className="h-8 w-8 rounded-md"
            >
              <Calendar className="h-4 w-4" />
            </AdminButton>
          </div>
        </div>
      </AdminCardHeader>
      
      <AdminCardContent className="p-0">
        {viewMode === "calendar" ? (
          <div>
            <div className="flex items-center justify-between bg-[#1d1d1d] p-4">
              <h3 className="text-lg font-medium">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex items-center space-x-2">
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={goToCurrentMonth}
                >
                  Aujourd'hui
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </AdminButton>
              </div>
            </div>
            
            <div className="grid grid-cols-7 bg-[#212121] border-y border-[#323232]">
              {weekdays.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-[#323232]">
              {calendarDays.map((day, index) => {
                const dateStr = formatISODate(day.date);
                const report = getReportForDate(day.date);
                const isToday = formatISODate(today) === dateStr;
                
                return (
                  <div
                    key={index}
                    className={`min-h-[110px] p-2 ${
                      day.isCurrentMonth ? "bg-[#171717]" : "bg-[#121212] text-gray-600"
                    } ${isToday ? "ring-1 ring-inset ring-blue-500" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-sm font-medium ${isToday ? "text-blue-400" : ""}`}>
                        {day.date.getDate()}
                      </span>
                      {day.isCurrentMonth && (
                        <AdminButton
                          variant="ghost"
                          size="icon"
                          onClick={() => onCreateReport(dateStr)}
                          className="h-6 w-6 rounded-full"
                          title="Créer/Éditer un rapport pour cette date"
                        >
                          <Edit className="h-3 w-3" />
                        </AdminButton>
                      )}
                    </div>
                    
                    {report && (
                      <div className="mt-2">
                        <div className="rounded bg-[#212121] p-2 text-xs">
                          <div className="font-medium text-green-400">
                            Dépôts: {calculateReportTotals(report).totalDeposit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </div>
                          <div className="font-medium text-purple-400">
                            Profits: {calculateReportTotals(report).totalProfits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </div>
                          <div className="mt-1 flex space-x-1">
                            <AdminButton
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditReport(report)}
                              className="h-6 w-6 flex-1 bg-[#252525] hover:bg-[#323232]"
                              title="Éditer"
                            >
                              <Edit className="h-3 w-3" />
                            </AdminButton>
                            <AdminButton
                              variant="ghost"
                              size="icon"
                              onClick={() => onExportReport(report)}
                              className="h-6 w-6 flex-1 bg-[#252525] hover:bg-[#323232]"
                              title="Exporter"
                            >
                              <Download className="h-3 w-3" />
                            </AdminButton>
                            <AdminButton
                              variant="ghost"
                              size="icon"
                              onClick={() => report.id && onDeleteReport(report.id)}
                              className="h-6 w-6 flex-1 bg-[#252525] hover:bg-red-900/30"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </AdminButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#323232]">
            {groupedReports.map(({ year, months }) => (
              <div key={year} className="p-4">
                <h3 className="mb-3 text-xl font-semibold">{year}</h3>
                
                <div className="space-y-4">
                  {months.map(({ month, reports }) => (
                    <div key={month} className="rounded-lg border border-[#323232] overflow-hidden">
                      <div className="bg-[#1d1d1d] px-4 py-2 text-lg font-medium capitalize">
                        {month}
                      </div>
                      
                      <div>
                        <table className="w-full">
                          <thead className="bg-[#212121]">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-gray-300">Date</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-300">Dépôts</th>
                              <th className="px-4 py-3 text-left font-medium text-gray-300">Profits</th>
                              <th className="px-4 py-3 text-right font-medium text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#323232]">
                            {reports.map(report => {
                              const { totalDeposit, totalProfits } = calculateReportTotals(report);
                              
                              return (
                                <tr key={report.id} className="hover:bg-[#1a1a1a]">
                                  <td className="px-4 py-3 font-medium">
                                    {formatDateFr(report.date)}
                                  </td>
                                  <td className="px-4 py-3 text-green-400">
                                    {totalDeposit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                  </td>
                                  <td className="px-4 py-3 text-purple-400">
                                    {totalProfits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <AdminButton
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEditReport(report)}
                                        className="h-8 w-8 hover:bg-[#252525]"
                                        title="Éditer"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </AdminButton>
                                      <AdminButton
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onExportReport(report)}
                                        className="h-8 w-8 hover:bg-[#252525]"
                                        title="Exporter"
                                      >
                                        <Download className="h-4 w-4" />
                                      </AdminButton>
                                      <AdminButton
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => report.id && onDeleteReport(report.id)}
                                        className="h-8 w-8 hover:bg-red-900/30"
                                        title="Supprimer"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </AdminButton>
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
              </div>
            ))}
          </div>
        )}
      </AdminCardContent>
    </AdminCard>
  );
} 