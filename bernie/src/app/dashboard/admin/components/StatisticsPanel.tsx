import React, { useState, useEffect } from "react";
import { BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, Filter, Calendar, ArrowDownUp, Download, Layers } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { StatFilter, DateRange } from "../types";
import { CASINOS, METRICS, GROUP_BY_OPTIONS } from "../constants";
import { fetchStats } from "../services/reportsService";
import { AdminCard, AdminCardHeader, AdminCardTitle, AdminCardContent, AdminCardFooter } from "./ui/AdminCard";
import { AdminButton } from "./ui/AdminButton";
import { StatsCard } from "./StatsCard";
import { DateRangePicker } from "./ui/DateRangePicker";
import { AdminTabs } from "./ui/AdminTabs";

interface StatisticsPanelProps {
  className?: string;
}

export function StatisticsPanel({ className }: StatisticsPanelProps) {
  // Initialiser les dates (30 derniers jours par défaut)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);
  
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState(METRICS.map(m => m.id));
  const [casinos, setCasinos] = useState([...CASINOS]);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month" | "year">("day");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: thirtyDaysAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  });
  const [stats, setStats] = useState<any>(null);
  
  // Charger les statistiques lors des changements de filtre
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStats({
          dateRange,
          metrics,
          casinos,
          groupBy,
        });
        setStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [dateRange, metrics, casinos, groupBy]);
  
  // Calculer les totaux pour l'affichage des cartes
  const calculateTotals = () => {
    if (!stats || !stats.data || !stats.data.length) {
      return {
        deposits: 0,
        profits: 0,
        signups: 0,
        ftd: 0,
        ngr: 0,
        depositPerSignup: 0,
        depositPerFtd: 0,
        profitPerDeposit: 0,
      };
    }
    
    let deposits = 0;
    let profits = 0;
    let signups = 0;
    let ftd = 0;
    let ngr = 0;
    
    stats.data.forEach((item: any) => {
      deposits += Number(item.TOTAL_DEPOSIT || 0);
      profits += Number(item.PROFITS || 0);
      signups += Number(item.SIGNUP || 0);
      ftd += Number(item.FTD || 0);
      ngr += Number(item.NGR || 0);
    });
    
    return {
      deposits,
      profits,
      signups,
      ftd,
      ngr,
      depositPerSignup: signups > 0 ? deposits / signups : 0,
      depositPerFtd: ftd > 0 ? deposits / ftd : 0,
      profitPerDeposit: deposits > 0 ? (profits / deposits) * 100 : 0, // en pourcentage
    };
  };
  
  const totals = calculateTotals();
  
  // Calculer les tendances en comparant avec la période précédente
  const calculateTrends = () => {
    if (!stats || !stats.previousPeriod) {
      return {
        deposits: 0,
        profits: 0,
        signups: 0,
        ftd: 0,
      };
    }
    
    const current = calculateTotals();
    const previous = stats.previousPeriod;
    
    return {
      deposits: previous.deposits > 0 
        ? ((current.deposits - previous.deposits) / previous.deposits) * 100 
        : 0,
      profits: previous.profits > 0 
        ? ((current.profits - previous.profits) / previous.profits) * 100 
        : 0,
      signups: previous.signups > 0 
        ? ((current.signups - previous.signups) / previous.signups) * 100 
        : 0,
      ftd: previous.ftd > 0 
        ? ((current.ftd - previous.ftd) / previous.ftd) * 100 
        : 0,
    };
  };
  
  // Gérer les changements de filtres
  const handleMetricToggle = (metricId: string) => {
    setMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };
  
  const handleCasinoToggle = (casino: string) => {
    setCasinos(prev => 
      prev.includes(casino)
        ? prev.filter(c => c !== casino)
        : [...prev, casino]
    );
  };
  
  const handleGroupByChange = (value: string) => {
    setGroupBy(value as "day" | "week" | "month" | "year");
  };
  
  // Définir les onglets
  const tabs = [
    {
      id: "overview",
      label: "Vue d'ensemble",
    },
    {
      id: "deposits",
      label: "Dépôts",
    },
    {
      id: "profits",
      label: "Profits",
    },
    {
      id: "conversion",
      label: "Conversion",
    },
    {
      id: "casinos",
      label: "Performance par casino",
    },
  ];
  
  // Cette fonction simule des données pour le graphique
  // Dans une implémentation réelle, ces données viendraient de l'API
  const getChartData = () => {
    if (!stats || !stats.data) return [];
    
    // Formater les données selon le type de graphique choisi
    if (chartType === "pie") {
      // Pour un graphique circulaire, on groupe par casino
      const casinoData = CASINOS.map(casino => {
        const casinoStats = stats.data.reduce((total: any, item: any) => {
          // On additionne les valeurs pour chaque métrique sélectionnée
          metrics.forEach(metric => {
            const key = `${casino}_${metric}`;
            if (item[key]) {
              total[metric] = (total[metric] || 0) + Number(item[key]);
            }
          });
          return total;
        }, {});
        
        return {
          name: casino,
          // On prend la première métrique sélectionnée pour le graphique
          value: casinoStats[metrics[0]] || 0,
        };
      });
      
      return casinoData;
    }
    
    // Pour les graphiques en ligne et en barres, on garde la structure temporelle
    return stats.data.map((item: any) => ({
      date: item.date,
      ...metrics.reduce((acc: any, metric) => {
        acc[metric] = item[metric] || 0;
        return acc;
      }, {}),
    }));
  };
  
  const chartData = getChartData();
  
  // Couleurs pour les graphiques
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Formatter pour le tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#252525] p-3 border border-[#323232] rounded-lg shadow-lg">
          <p className="font-medium text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color || '#fff' }}>
              {entry.name}: {typeof entry.value === 'number' && (
                entry.name.toLowerCase().includes('dépôt') || 
                entry.name.toLowerCase().includes('profit') || 
                entry.name.toLowerCase().includes('ngr')
              ) 
                ? `${entry.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €` 
                : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <AdminCard className={className}>
      <AdminCardHeader className="flex flex-row items-center justify-between">
        <AdminCardTitle>Statistiques de performance</AdminCardTitle>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-64"
          />
          <AdminButton
            variant="ghost"
            size="icon"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={isFiltersOpen ? "bg-[#323232]" : ""}
          >
            <Filter className="h-4 w-4" />
          </AdminButton>
          <div className="flex border border-[#323232] rounded-md overflow-hidden">
            <AdminButton
              variant={chartType === "line" ? "primary" : "ghost"}
              size="icon"
              onClick={() => setChartType("line")}
              className="rounded-none border-0"
            >
              <LineChartIcon className="h-4 w-4" />
            </AdminButton>
            <AdminButton
              variant={chartType === "bar" ? "primary" : "ghost"}
              size="icon"
              onClick={() => setChartType("bar")}
              className="rounded-none border-0"
            >
              <BarChart2 className="h-4 w-4" />
            </AdminButton>
            <AdminButton
              variant={chartType === "pie" ? "primary" : "ghost"}
              size="icon"
              onClick={() => setChartType("pie")}
              className="rounded-none border-0"
            >
              <PieChartIcon className="h-4 w-4" />
            </AdminButton>
          </div>
        </div>
      </AdminCardHeader>
      
      {isFiltersOpen && (
        <div className="border-t border-b border-[#323232] bg-[#1a1a1a] p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Grouper par</h4>
              <div className="grid grid-cols-2 gap-2">
                {GROUP_BY_OPTIONS.map(option => (
                  <AdminButton
                    key={option.value}
                    variant={groupBy === option.value ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleGroupByChange(option.value)}
                  >
                    {option.label}
                  </AdminButton>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Métriques</h4>
              <div className="space-y-1">
                {METRICS.map(metric => (
                  <label key={metric.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={metrics.includes(metric.id)}
                      onChange={() => handleMetricToggle(metric.id)}
                      className="rounded border-[#323232] bg-[#252525] mr-2"
                    />
                    <span className="text-sm">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Casinos</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                {CASINOS.map(casino => (
                  <label key={casino} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={casinos.includes(casino)}
                      onChange={() => handleCasinoToggle(casino)}
                      className="rounded border-[#323232] bg-[#252525] mr-2"
                    />
                    <span className="text-sm">{casino}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AdminCardContent className="p-0">
        <div className="border-b border-[#323232]">
          <AdminTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
        
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              <StatsCard
                title="Total des dépôts"
                value={`${totals.deposits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                icon={ArrowDownUp}
                iconColor="text-blue-500"
                trend={{
                  value: Math.round(calculateTrends().deposits),
                  label: "vs période précédente",
                  positive: calculateTrends().deposits > 0,
                }}
              />
              <StatsCard
                title="Total des profits"
                value={`${totals.profits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                icon={BarChart2}
                iconColor="text-green-500"
                trend={{
                  value: Math.round(calculateTrends().profits),
                  label: "vs période précédente",
                  positive: calculateTrends().profits > 0,
                }}
              />
              <StatsCard
                title="Inscriptions"
                value={totals.signups}
                icon={Layers}
                iconColor="text-purple-500"
                trend={{
                  value: Math.round(calculateTrends().signups),
                  label: "vs période précédente",
                  positive: calculateTrends().signups > 0,
                }}
              />
              <StatsCard
                title="Premier dépôt (FTD)"
                value={totals.ftd}
                icon={Calendar}
                iconColor="text-orange-500"
                trend={{
                  value: Math.round(calculateTrends().ftd),
                  label: "vs période précédente",
                  positive: calculateTrends().ftd > 0,
                }}
              />
            </div>
            
            {/* Zone pour le graphique */}
            <div className="p-4 h-80 flex items-center justify-center bg-[#141414] border-t border-[#323232]">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 border-4 border-t-blue-500 border-blue-500/30 rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-400 text-sm">Chargement des données...</p>
                </div>
              ) : !chartData.length ? (
                <div className="text-gray-400">
                  Aucune donnée disponible pour cette période
                </div>
              ) : (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#ECECEC' }}
                        />
                        <YAxis 
                          tick={{ fill: '#ECECEC' }}
                          tickFormatter={(value) => `${value.toLocaleString('fr-FR')}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {metrics.map((metric, index) => (
                          <Line
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            name={METRICS.find(m => m.id === metric)?.label || metric}
                            stroke={COLORS[index % COLORS.length]}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                      </LineChart>
                    ) : chartType === "bar" ? (
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#ECECEC' }}
                        />
                        <YAxis 
                          tick={{ fill: '#ECECEC' }}
                          tickFormatter={(value) => `${value.toLocaleString('fr-FR')}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {metrics.map((metric, index) => (
                          <Bar
                            key={metric}
                            dataKey={metric}
                            name={METRICS.find(m => m.id === metric)?.label || metric}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </BarChart>
                    ) : (
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "deposits" && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <StatsCard
                title="Total des dépôts"
                value={`${totals.deposits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                icon={ArrowDownUp}
                iconColor="text-blue-500"
              />
              <StatsCard
                title="Dépôt moyen par inscription"
                value={`${totals.depositPerSignup.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                icon={Layers}
                iconColor="text-purple-500"
              />
              <StatsCard
                title="Dépôt moyen par FTD"
                value={`${totals.depositPerFtd.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                icon={Calendar}
                iconColor="text-orange-500"
              />
            </div>
            
            {/* Zone pour le graphique de dépôts */}
            <div className="h-80 flex items-center justify-center bg-[#141414] border border-[#323232] rounded-lg">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 border-4 border-t-blue-500 border-blue-500/30 rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-400 text-sm">Chargement des données...</p>
                </div>
              ) : !chartData.length ? (
                <div className="text-gray-400">
                  Aucune donnée disponible pour cette période
                </div>
              ) : (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#ECECEC' }}
                      />
                      <YAxis 
                        tick={{ fill: '#ECECEC' }}
                        tickFormatter={(value) => `${value.toLocaleString('fr-FR')} €`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {metrics.filter(m => m.includes('DEPOSIT')).map((metric, index) => (
                        <Bar
                          key={metric}
                          dataKey={metric}
                          name={METRICS.find(m => m.id === metric)?.label || metric}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "profits" && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <StatsCard
                title="Total des profits"
                value={`${totals.profits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                icon={BarChart2}
                iconColor="text-green-500"
              />
              <StatsCard
                title="NGR"
                value={`${totals.ngr.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                icon={LineChartIcon}
                iconColor="text-cyan-500"
              />
              <StatsCard
                title="Marge sur dépôt"
                value={`${totals.profitPerDeposit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} %`}
                icon={PieChartIcon}
                iconColor="text-amber-500"
              />
            </div>
            
            {/* Zone pour le graphique de profits */}
            <div className="h-80 flex items-center justify-center bg-[#141414] border border-[#323232] rounded-lg">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 border-4 border-t-green-500 border-green-500/30 rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-400 text-sm">Chargement des données...</p>
                </div>
              ) : !chartData.length ? (
                <div className="text-gray-400">
                  Aucune donnée disponible pour cette période
                </div>
              ) : (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#ECECEC' }}
                      />
                      <YAxis 
                        tick={{ fill: '#ECECEC' }}
                        tickFormatter={(value) => `${value.toLocaleString('fr-FR')} €`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {metrics.filter(m => m.includes('PROFITS') || m.includes('NGR')).map((metric, index) => (
                        <Line
                          key={metric}
                          type="monotone"
                          dataKey={metric}
                          name={METRICS.find(m => m.id === metric)?.label || metric}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "conversion" && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <StatsCard
                title="Inscriptions"
                value={totals.signups}
                icon={Layers}
                iconColor="text-purple-500"
              />
              <StatsCard
                title="Premier dépôt (FTD)"
                value={totals.ftd}
                icon={Calendar}
                iconColor="text-orange-500"
              />
              <StatsCard
                title="Taux de conversion"
                value={`${totals.signups > 0 ? ((totals.ftd / totals.signups) * 100).toFixed(2) : "0.00"} %`}
                icon={ArrowDownUp}
                iconColor="text-pink-500"
              />
            </div>
            
            {/* Zone pour le graphique de conversion */}
            <div className="h-80 flex items-center justify-center bg-[#141414] border border-[#323232] rounded-lg">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 border-4 border-t-purple-500 border-purple-500/30 rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-400 text-sm">Chargement des données...</p>
                </div>
              ) : !chartData.length ? (
                <div className="text-gray-400">
                  Aucune donnée disponible pour cette période
                </div>
              ) : (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#ECECEC' }}
                      />
                      <YAxis 
                        tick={{ fill: '#ECECEC' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {metrics.filter(m => m.includes('SIGNUP') || m.includes('FTD')).map((metric, index) => (
                        <Line
                          key={metric}
                          type="monotone"
                          dataKey={metric}
                          name={METRICS.find(m => m.id === metric)?.label || metric}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "casinos" && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-80 flex items-center justify-center bg-[#141414] border border-[#323232] rounded-lg">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 border-4 border-t-blue-500 border-blue-500/30 rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-400 text-sm">Chargement des données...</p>
                  </div>
                ) : !chartData.length ? (
                  <div className="text-gray-400">
                    Aucune donnée disponible pour cette période
                  </div>
                ) : (
                  <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={casinos.map(casino => {
                            const total = chartData.reduce((sum: number, item: any) => {
                              Object.keys(item).forEach(key => {
                                if (key.startsWith(casino) && key.includes('DEPOSIT')) {
                                  sum += Number(item[key] || 0);
                                }
                              });
                              return sum;
                            }, 0);
                            return { name: casino, value: total };
                          })}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {casinos.map((_, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              <div className="h-80 flex items-center justify-center bg-[#141414] border border-[#323232] rounded-lg">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 border-4 border-t-green-500 border-green-500/30 rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-400 text-sm">Chargement des données...</p>
                  </div>
                ) : !chartData.length ? (
                  <div className="text-gray-400">
                    Aucune donnée disponible pour cette période
                  </div>
                ) : (
                  <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={casinos.map(casino => {
                            const total = chartData.reduce((sum: number, item: any) => {
                              Object.keys(item).forEach(key => {
                                if (key.startsWith(casino) && key.includes('PROFITS')) {
                                  sum += Number(item[key] || 0);
                                }
                              });
                              return sum;
                            }, 0);
                            return { name: casino, value: total };
                          })}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {casinos.map((_, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              
              <div className="col-span-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1d1d1d]">
                      <th className="py-2 px-4 text-left border-b border-[#323232]">Casino</th>
                      <th className="py-2 px-4 text-left border-b border-[#323232]">Dépôts</th>
                      <th className="py-2 px-4 text-left border-b border-[#323232]">Profits</th>
                      <th className="py-2 px-4 text-left border-b border-[#323232]">Inscriptions</th>
                      <th className="py-2 px-4 text-left border-b border-[#323232]">FTD</th>
                      <th className="py-2 px-4 text-left border-b border-[#323232]">Marge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CASINOS.map((casino, index) => (
                      <tr key={casino} className={index % 2 === 0 ? 'bg-[#141414]' : 'bg-[#171717]'}>
                        <td className="py-2 px-4 border-b border-[#323232]">{casino}</td>
                        <td className="py-2 px-4 border-b border-[#323232]">
                          {/* Simulation de données */}
                          {(Math.random() * 10000).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="py-2 px-4 border-b border-[#323232]">
                          {(Math.random() * 5000).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="py-2 px-4 border-b border-[#323232]">
                          {Math.floor(Math.random() * 100)}
                        </td>
                        <td className="py-2 px-4 border-b border-[#323232]">
                          {Math.floor(Math.random() * 50)}
                        </td>
                        <td className="py-2 px-4 border-b border-[#323232]">
                          {(Math.random() * 30).toFixed(2)} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </AdminCardContent>
      
      <AdminCardFooter className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Données du {new Date(dateRange.startDate).toLocaleDateString('fr-FR')} au {new Date(dateRange.endDate).toLocaleDateString('fr-FR')}
        </p>
        <AdminButton variant="secondary" size="sm">
          <Download className="mr-1 h-4 w-4" />
          Exporter les données
        </AdminButton>
      </AdminCardFooter>
    </AdminCard>
  );
} 