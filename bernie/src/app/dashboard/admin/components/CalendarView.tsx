import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Edit, Download, Trash2 } from "lucide-react";
import { MONTHS } from "../constants";
import { CasinoReport } from "../types";
import { formatDateFr } from "../constants";

interface CalendarViewProps {
  reports: CasinoReport[];
  onEditReport: (report: CasinoReport) => void;
  onDeleteReport: (reportId: number) => void;
  onExportReport: (report: CasinoReport) => void;
  onCreateReport: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  reports,
  onEditReport,
  onDeleteReport,
  onExportReport,
  onCreateReport,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fonction pour générer la grille du calendrier
  const calendar = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0-6, 0 est dimanche)
    const firstDayOfWeek = firstDay.getDay();
    // Nombre de jours dans le mois
    const daysInMonth = lastDay.getDate();
    
    // Création du tableau pour le calendrier
    const calendarDays = [];
    
    // Ajouter les jours du mois précédent pour compléter la première semaine
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // En France, la semaine commence le lundi (1) et non le dimanche (0)
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = startOffset; i > 0; i--) {
      calendarDays.push({
        date: new Date(year, month - 1, daysInPrevMonth - i + 1),
        isCurrentMonth: false,
      });
    }
    
    // Ajouter les jours du mois en cours
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - calendarDays.length; // 6 semaines x 7 jours = 42
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return calendarDays;
  }, [currentDate]);
  
  // Organiser les rapports par date
  const reportsByDate = useMemo(() => {
    const byDate: { [key: string]: CasinoReport } = {};
    
    reports.forEach(report => {
      byDate[report.date] = report;
    });
    
    return byDate;
  }, [reports]);
  
  // Fonction pour obtenir un résumé des rapports quotidiens
  const getReportSummary = (report: CasinoReport) => {
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
  
  // Naviguer au mois précédent
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  // Naviguer au mois suivant
  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  // Naviguer au mois actuel
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Formater la date au format ISO (YYYY-MM-DD)
  const formatDateISO = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Jours de la semaine en français, commençant par lundi
  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  return (
    <div className="bg-[#171717] rounded-lg border border-[#424242] overflow-hidden">
      <div className="p-4 border-b border-[#424242] flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {MONTHS[currentDate.getMonth()].charAt(0).toUpperCase() + MONTHS[currentDate.getMonth()].slice(1)} {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={goToToday}
            className="px-3 py-1 text-sm rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
          >
            Aujourd'hui
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center border-b border-[#2a2a2a]">
        {weekdays.map(day => (
          <div key={day} className="py-2 font-medium text-sm text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 grid-rows-6 h-[750px] md:h-[600px]">
        {calendar.map((day, index) => {
          const dateStr = formatDateISO(day.date);
          const report = reportsByDate[dateStr];
          const isToday = dateStr === formatDateISO(new Date());
          
          return (
            <div 
              key={index} 
              className={`border-r border-b border-[#2a2a2a] p-2 md:p-3 relative overflow-hidden transition-colors ${
                day.isCurrentMonth ? 'bg-[#1a1a1a]' : 'bg-[#131313] text-gray-600'
              } ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-sm md:text-base font-medium ${isToday ? 'text-blue-400' : ''}`}>
                  {day.date.getDate()}
                </span>
                {day.isCurrentMonth && (
                  <button 
                    onClick={() => onCreateReport(dateStr)}
                    className="p-1 rounded-full hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-colors"
                    title="Créer un rapport pour cette date"
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
              
              {report && (
                <div className="mt-2 text-xs">
                  <div className="bg-[#242424] rounded p-2 mb-2">
                    <p className="truncate font-medium text-green-400">
                      Dépôts: {getReportSummary(report).totalDeposit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                    <p className="truncate font-medium text-purple-400">
                      Profits: {getReportSummary(report).totalProfits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                    <div className="flex mt-1 space-x-1">
                      <button 
                        onClick={() => onEditReport(report)}
                        className="flex-1 p-1 rounded bg-[#323232] hover:bg-[#424242] transition-colors"
                        title="Modifier"
                      >
                        <Edit size={12} className="mx-auto" />
                      </button>
                      <button 
                        onClick={() => onExportReport(report)}
                        className="flex-1 p-1 rounded bg-[#323232] hover:bg-[#424242] transition-colors"
                        title="Exporter"
                      >
                        <Download size={12} className="mx-auto" />
                      </button>
                      <button 
                        onClick={() => report.id && onDeleteReport(report.id)}
                        className="flex-1 p-1 rounded bg-[#323232] hover:bg-red-900 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={12} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView; 