import React, { useState, useEffect } from "react";
import { BarChart, AreaChart, Calendar, Filter } from "lucide-react";
import { StatFilter, DateRange } from "../types";
import { CASINOS, METRICS, GROUP_BY_OPTIONS, formatDateFr } from "../constants";
import DatePickerInput from "./DatePickerInput";
import { fetchStats } from "../services/reportsService";

interface StatsPanelProps {
  className?: string;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ className = "" }) => {
  // Initialiser les dates de début et de fin (30 derniers jours par défaut)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const defaultDateRange: DateRange = {
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  };
  
  const [filter, setFilter] = useState<StatFilter>({
    dateRange: defaultDateRange,
    metrics: ["TOTAL_DEPOSIT", "PROFITS"],
    casinos: [...CASINOS],
    groupBy: "day",
  });
  
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"line" | "bar">("line");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Charger les statistiques lors des changements de filtre
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStats(filter);
        setStats(data);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [filter]);
  
  // Mettre à jour les filtres
  const handleFilterChange = (
    field: keyof StatFilter,
    value: string | string[] | DateRange
  ) => {
    setFilter(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Gérer le changement de date
  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setFilter(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));
  };
  
  // Gérer la sélection/désélection de métriques
  const handleMetricToggle = (metricId: string) => {
    setFilter(prev => {
      const metrics = [...prev.metrics];
      const index = metrics.indexOf(metricId);
      
      if (index === -1) {
        metrics.push(metricId);
      } else {
        metrics.splice(index, 1);
      }
      
      return { ...prev, metrics };
    });
  };
  
  // Gérer la sélection/désélection de casinos
  const handleCasinoToggle = (casino: string) => {
    setFilter(prev => {
      const casinos = [...prev.casinos];
      const index = casinos.indexOf(casino);
      
      if (index === -1) {
        casinos.push(casino);
      } else {
        casinos.splice(index, 1);
      }
      
      return { ...prev, casinos };
    });
  };
  
  // Calculer les totaux pour l'affichage en haut
  const calculateTotals = () => {
    if (!stats || !stats.data) return { totalDeposit: 0, totalProfits: 0, totalSignups: 0, totalFtd: 0 };
    
    let totalDeposit = 0;
    let totalProfits = 0;
    let totalSignups = 0;
    let totalFtd = 0;
    
    stats.data.forEach((dataPoint: any) => {
      totalDeposit += dataPoint.TOTAL_DEPOSIT || 0;
      totalProfits += dataPoint.PROFITS || 0;
      totalSignups += dataPoint.SIGNUP || 0;
      totalFtd += dataPoint.FTD || 0;
    });
    
    return { totalDeposit, totalProfits, totalSignups, totalFtd };
  };
  
  const totals = calculateTotals();
  
  // Obtenir le label pour l'axe X en fonction du groupBy
  const getXAxisLabel = (date: string) => {
    const d = new Date(date);
    
    switch (filter.groupBy) {
      case "day":
        return d.getDate().toString();
      case "week":
        return `S${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}`;
      case "month":
        return d.toLocaleDateString('fr-FR', { month: 'short' });
      case "year":
        return d.getFullYear().toString();
      default:
        return date;
    }
  };
  
  return (
    <div className={`bg-[#171717] rounded-lg border border-[#424242] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-[#424242]">
        <h3 className="text-xl font-semibold">Statistiques</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("line")}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === "line" ? "bg-[#3a3a3a]" : "hover:bg-[#2a2a2a]"
            }`}
            title="Graphique en ligne"
          >
            <AreaChart size={16} />
          </button>
          <button
            onClick={() => setActiveTab("bar")}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === "bar" ? "bg-[#3a3a3a]" : "hover:bg-[#2a2a2a]"
            }`}
            title="Graphique en barres"
          >
            <BarChart size={16} />
          </button>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isFilterOpen ? "bg-[#3a3a3a]" : "hover:bg-[#2a2a2a]"
            }`}
            title="Filtres"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>
      
      {/* Période sélectionnée */}
      <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-[#424242]">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm font-medium">
            {formatDateFr(filter.dateRange.startDate)} - {formatDateFr(filter.dateRange.endDate)}
          </span>
        </div>
        <span className="text-sm text-gray-400">
          Groupé par: {GROUP_BY_OPTIONS.find(opt => opt.value === filter.groupBy)?.label}
        </span>
      </div>
      
      {/* Filtres */}
      {isFilterOpen && (
        <div className="p-4 border-b border-[#424242] bg-[#1d1d1d]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <DatePickerInput
              label="Date de début"
              value={filter.dateRange.startDate}
              onChange={(date) => handleDateChange("startDate", date)}
              max={filter.dateRange.endDate}
            />
            <DatePickerInput
              label="Date de fin"
              value={filter.dateRange.endDate}
              onChange={(date) => handleDateChange("endDate", date)}
              min={filter.dateRange.startDate}
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Grouper par
            </label>
            <select
              value={filter.groupBy}
              onChange={(e) => handleFilterChange("groupBy", e.target.value)}
              className="w-full p-2.5 bg-[#171717] border border-[#424242] text-white rounded-lg"
            >
              {GROUP_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Métriques
              </label>
              <div className="space-y-2">
                {METRICS.map((metric) => (
                  <label key={metric.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filter.metrics.includes(metric.id)}
                      onChange={() => handleMetricToggle(metric.id)}
                      className="w-4 h-4 rounded bg-[#171717] border-[#424242]"
                    />
                    <span className="text-sm">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Casinos
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {CASINOS.map((casino) => (
                  <label key={casino} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filter.casinos.includes(casino)}
                      onChange={() => handleCasinoToggle(casino)}
                      className="w-4 h-4 rounded bg-[#171717] border-[#424242]"
                    />
                    <span className="text-sm">{casino}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats en chiffres */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#1a1a1a] border-b border-[#424242]">
        <div className="bg-[#212121] p-3 rounded-lg border border-[#424242]">
          <h4 className="text-xs text-gray-400 mb-1">Total Dépôts</h4>
          <p className="text-lg font-semibold">
            {totals.totalDeposit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </div>
        <div className="bg-[#212121] p-3 rounded-lg border border-[#424242]">
          <h4 className="text-xs text-gray-400 mb-1">Total Profits</h4>
          <p className="text-lg font-semibold">
            {totals.totalProfits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </div>
        <div className="bg-[#212121] p-3 rounded-lg border border-[#424242]">
          <h4 className="text-xs text-gray-400 mb-1">Inscriptions</h4>
          <p className="text-lg font-semibold">{totals.totalSignups}</p>
        </div>
        <div className="bg-[#212121] p-3 rounded-lg border border-[#424242]">
          <h4 className="text-xs text-gray-400 mb-1">FTD</h4>
          <p className="text-lg font-semibold">{totals.totalFtd}</p>
        </div>
      </div>
      
      {/* Graphique */}
      <div className="p-4 h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : !stats || !stats.data || stats.data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Aucune donnée disponible pour la période sélectionnée
          </div>
        ) : (
          <div className="h-full">
            {/* Ce serait l'emplacement pour une bibliothèque de graphiques comme Recharts ou Chart.js */}
            <div className="text-center text-gray-400 h-full flex items-center justify-center">
              Graphique {activeTab === "line" ? "en ligne" : "en barres"} montrant les données pour {filter.metrics.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPanel; 