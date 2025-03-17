// src/app/dashboard/admin/components/DashboardStats.tsx
import React, { useMemo, useState } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CasinoReport } from "../types";
import { CASINOS, MONTHS, METRICS } from "../constants";
import CasinoPerformanceCard from "./CasinoPerformanceCard";
import YearlyComparison from "./YearlyComparison";

interface DashboardStatsProps {
  reports: CasinoReport[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardStats: React.FC<DashboardStatsProps> = ({ reports }) => {
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    // Par défaut, sélectionner l'année la plus récente disponible dans les rapports
    if (reports.length === 0) return new Date().getFullYear();
    const years = reports.map(report => report.year);
    return Math.max(...years);
  });

  const [selectedMetric, setSelectedMetric] = useState<string>("TOTAL_DEPOSIT");
  
  // Calculer les données annuelles pour la comparaison
  const yearlyData = useMemo(() => {
    const years = Array.from(new Set(reports.map(report => report.year)));
    
    return years.map(year => {
      const yearReports = reports.filter(report => report.year === year);
      let totalDeposit = 0;
      let totalSignup = 0;
      let totalFtd = 0;
      let totalNgr = 0;
      let totalProfits = 0;
      
      yearReports.forEach(report => {
        CASINOS.forEach(casino => {
          totalDeposit += parseFloat(report.data[`${casino}_TOTAL_DEPOSIT`] || "0");
          totalSignup += parseInt(report.data[`${casino}_SIGNUP`] || "0");
          totalFtd += parseInt(report.data[`${casino}_FTD`] || "0");
          totalNgr += parseFloat(report.data[`${casino}_NGR`] || "0");
          totalProfits += parseFloat(report.data[`${casino}_PROFITS`] || "0");
        });
      });
      
      return {
        year,
        totalDeposit,
        totalSignup,
        totalFtd,
        totalNgr,
        totalProfits
      };
    }).sort((a, b) => b.year - a.year); // Trier par année décroissante
  }, [reports]);

  // Fonction pour obtenir tous les années disponibles dans les rapports
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(reports.map(report => report.year)));
    return years.sort((a, b) => b - a); // Trier par ordre décroissant
  }, [reports]);

  // Filtrer les rapports pour l'année sélectionnée
  const yearReports = useMemo(() => {
    return reports.filter(report => report.year === selectedYear);
  }, [reports, selectedYear]);

  // Récupérer les données mensuelles pour chaque casino
  const monthlyData = useMemo(() => {
    // Initialiser un tableau avec tous les mois de l'année
    const data = MONTHS.map(month => ({
      month,
      monthIndex: MONTHS.indexOf(month),
      totalDeposit: 0,
      totalSignup: 0,
      totalFtd: 0,
      totalNgr: 0,
      totalProfits: 0,
      ...CASINOS.reduce((acc, casino) => {
        acc[`${casino}_TOTAL_DEPOSIT`] = 0;
        acc[`${casino}_SIGNUP`] = 0;
        acc[`${casino}_FTD`] = 0;
        acc[`${casino}_NGR`] = 0;
        acc[`${casino}_PROFITS`] = 0;
        return acc;
      }, {} as Record<string, number>)
    }));

    // Remplir avec les données réelles des rapports
    yearReports.forEach(report => {
      const monthIndex = MONTHS.indexOf(report.month);
      if (monthIndex === -1) return;

      CASINOS.forEach(casino => {
        // Pour chaque casino et chaque métrique
        METRICS.forEach(metric => {
          const key = `${casino}_${metric.id}`;
          const value = parseFloat(report.data[key] || "0");
          data[monthIndex][key] = value;

          // Ajouter également au total du mois
          if (metric.id === "TOTAL_DEPOSIT") {
            data[monthIndex].totalDeposit += value;
          } else if (metric.id === "SIGNUP") {
            data[monthIndex].totalSignup += value;
          } else if (metric.id === "FTD") {
            data[monthIndex].totalFtd += value;
          } else if (metric.id === "NGR") {
            data[monthIndex].totalNgr += value;
          } else if (metric.id === "PROFITS") {
            data[monthIndex].totalProfits += value;
          }
        });
      });
    });

    // Trier par ordre chronologique des mois
    return data.sort((a, b) => a.monthIndex - b.monthIndex);
  }, [yearReports]);

  // Calculer les totaux annuels par casino et les données mensuelles
  const annualStatsByCasino = useMemo(() => {
    const stats = CASINOS.map(casino => {
      let totalDeposit = 0;
      let totalSignup = 0;
      let totalFtd = 0;
      let totalNgr = 0;
      let totalProfits = 0;
      let monthsWithData = 0;
      
      // Pour les données mensuelles du casino
      const monthlyData = MONTHS.map(month => ({
        month,
        deposit: 0,
        signup: 0,
        ftd: 0,
        ngr: 0,
        profits: 0
      }));

      yearReports.forEach(report => {
        const deposit = parseFloat(report.data[`${casino}_TOTAL_DEPOSIT`] || "0");
        const signup = parseInt(report.data[`${casino}_SIGNUP`] || "0");
        const ftd = parseInt(report.data[`${casino}_FTD`] || "0");
        const ngr = parseFloat(report.data[`${casino}_NGR`] || "0");
        const profits = parseFloat(report.data[`${casino}_PROFITS`] || "0");
        
        totalDeposit += deposit;
        totalSignup += signup;
        totalFtd += ftd;
        totalNgr += ngr;
        totalProfits += profits;

        if (deposit > 0) {
          monthsWithData++;
        }
        
        // Mettre à jour les données mensuelles
        const monthIndex = MONTHS.indexOf(report.month);
        if (monthIndex !== -1) {
          monthlyData[monthIndex].deposit = deposit;
          monthlyData[monthIndex].signup = signup;
          monthlyData[monthIndex].ftd = ftd;
          monthlyData[monthIndex].ngr = ngr;
          monthlyData[monthIndex].profits = profits;
        }
      });

      // Calculer les moyennes
      const avgDepositPerSignup = totalSignup > 0 ? totalDeposit / totalSignup : 0;
      const avgDepositPerFtd = totalFtd > 0 ? totalDeposit / totalFtd : 0;
      const avgMonthlyDeposit = monthsWithData > 0 ? totalDeposit / monthsWithData : 0;
      
      // Calculer le taux de conversion
      const conversionRate = totalSignup > 0 ? (totalFtd / totalSignup) * 100 : 0;

      return {
        casino,
        totalDeposit,
        totalSignup,
        totalFtd,
        totalNgr,
        totalProfits,
        avgDepositPerSignup,
        avgDepositPerFtd,
        avgMonthlyDeposit,
        conversionRate,
        monthsWithData,
        monthlyData: monthlyData.filter(m => {
          // Ne retourner que les mois pour lesquels nous avons des données
          return yearReports.some(r => r.month === m.month);
        })
      };
    });

    return stats.sort((a, b) => b.totalDeposit - a.totalDeposit);
  }, [yearReports]);

  // Calculer les totaux annuels globaux
  const annualTotals = useMemo(() => {
    let totalDeposit = 0;
    let totalSignup = 0;
    let totalFtd = 0;
    let totalNgr = 0;
    let totalProfits = 0;
    let monthsWithData = 0;
    const monthsSet = new Set();

    yearReports.forEach(report => {
      let monthHasData = false;
      
      CASINOS.forEach(casino => {
        totalDeposit += parseFloat(report.data[`${casino}_TOTAL_DEPOSIT`] || "0");
        totalSignup += parseInt(report.data[`${casino}_SIGNUP`] || "0");
        totalFtd += parseInt(report.data[`${casino}_FTD`] || "0");
        totalNgr += parseFloat(report.data[`${casino}_NGR`] || "0");
        totalProfits += parseFloat(report.data[`${casino}_PROFITS`] || "0");
        
        if (parseFloat(report.data[`${casino}_TOTAL_DEPOSIT`] || "0") > 0) {
          monthHasData = true;
        }
      });
      
      if (monthHasData) {
        monthsSet.add(report.month);
      }
    });

    monthsWithData = monthsSet.size;

    // Calculer les moyennes
    const avgDepositPerSignup = totalSignup > 0 ? totalDeposit / totalSignup : 0;
    const avgDepositPerFtd = totalFtd > 0 ? totalDeposit / totalFtd : 0;
    const avgMonthlyDeposit = monthsWithData > 0 ? totalDeposit / monthsWithData : 0;
    
    // Calculer le taux de conversion
    const conversionRate = totalSignup > 0 ? (totalFtd / totalSignup) * 100 : 0;

    return {
      totalDeposit,
      totalSignup,
      totalFtd,
      totalNgr,
      totalProfits,
      avgDepositPerSignup,
      avgDepositPerFtd,
      avgMonthlyDeposit,
      conversionRate,
      monthsWithData
    };
  }, [yearReports]);

  // Données pour le graphique en camembert des dépôts par casino
  const depositPieData = useMemo(() => {
    return annualStatsByCasino
      .filter(stat => stat.totalDeposit > 0)
      .map(stat => ({
        name: stat.casino,
        value: stat.totalDeposit
      }));
  }, [annualStatsByCasino]);

  // Données pour le graphique en camembert des profits par casino
  const profitPieData = useMemo(() => {
    return annualStatsByCasino
      .filter(stat => stat.totalProfits !== 0)
      .map(stat => ({
        name: stat.casino,
        value: stat.totalProfits
      }));
  }, [annualStatsByCasino]);

  // Formatter pour afficher les valeurs monétaires
  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  // Formatter pour le tooltip des graphiques
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey.includes("DEPOSIT") || entry.dataKey.includes("NGR") || entry.dataKey.includes("PROFITS") 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Fonction pour filtrer les données selon la métrique sélectionnée
  const getMetricData = (dataKey: string) => {
    return CASINOS.map(casino => ({
      casino,
      ...METRICS.reduce((acc, metric) => {
        if (metric.id === dataKey) {
          const total = annualStatsByCasino.find(stat => stat.casino === casino)?.[`total${dataKey.charAt(0).toUpperCase() + dataKey.slice(1).replace('_', '')}`] || 0;
          acc[metric.id] = total;
        }
        return acc;
      }, {} as Record<string, number>)
    }));
  };

  // Formate le nom de métrique pour l'affichage
  const formatMetricName = (metricId: string) => {
    const metric = METRICS.find(m => m.id === metricId);
    return metric ? metric.label : metricId;
  };

  return (
    <div className="space-y-8">
      {/* Sélecteurs */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Année</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 rounded bg-[#212121] border border-[#424242] text-white"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Métrique</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="p-2 rounded bg-[#212121] border border-[#424242] text-white"
          >
            {METRICS.map(metric => (
              <option key={metric.id} value={metric.id}>{metric.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Comparaison annuelle */}
      <YearlyComparison 
        years={availableYears} 
        yearlyData={yearlyData} 
      />

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Total Dépôts</h3>
          <p className="text-2xl font-bold">{formatCurrency(annualTotals.totalDeposit)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Moyenne: {formatCurrency(annualTotals.avgMonthlyDeposit)}/mois
          </p>
        </div>
        
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Inscriptions</h3>
          <p className="text-2xl font-bold">{annualTotals.totalSignup.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            Conversion: {annualTotals.conversionRate.toFixed(1)}% en FTD
          </p>
        </div>
        
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Premier Dépôt (FTD)</h3>
          <p className="text-2xl font-bold">{annualTotals.totalFtd.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            Dépôt moyen: {formatCurrency(annualTotals.avgDepositPerFtd)}/FTD
          </p>
        </div>
        
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Profits</h3>
          <p className="text-2xl font-bold">{formatCurrency(annualTotals.totalProfits)}</p>
          <p className="text-xs text-gray-400 mt-1">
            NGR: {formatCurrency(annualTotals.totalNgr)}
          </p>
        </div>
      </div>

      {/* Graphique des tendances mensuelles */}
      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
        <h3 className="text-lg font-medium mb-4">Évolution mensuelle {selectedYear}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData.filter(m => {
                // Ne montrer que les mois pour lesquels nous avons des données
                const hasData = yearReports.some(r => r.month === m.month);
                return hasData;
              })}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#ECECEC' }}
              />
              <YAxis 
                tick={{ fill: '#ECECEC' }}
                tickFormatter={(value) => selectedMetric.includes("DEPOSIT") || selectedMetric.includes("NGR") || selectedMetric.includes("PROFITS") 
                  ? `${value.toLocaleString('fr-FR')} €`
                  : value.toLocaleString('fr-FR')
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {CASINOS.map((casino, index) => (
                <Line
                  key={casino}
                  type="monotone"
                  dataKey={`${casino}_${selectedMetric}`}
                  name={casino}
                  stroke={COLORS[index % COLORS.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cartes de performance des casinos */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Performance par casino</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {annualStatsByCasino
            .filter(stat => stat.totalDeposit > 0 || stat.totalSignup > 0) // Afficher seulement les casinos actifs
            .map(casino => (
              <CasinoPerformanceCard 
                key={casino.casino}
                casinoName={casino.casino}
                data={{
                  totalDeposit: casino.totalDeposit,
                  totalSignup: casino.totalSignup,
                  totalFtd: casino.totalFtd,
                  totalNgr: casino.totalNgr,
                  totalProfits: casino.totalProfits,
                  monthlyData: casino.monthlyData
                }}
              />
            ))}
        </div>
      </div>

      {/* Distribution par casino */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graphique en camembert des dépôts */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
          <h3 className="text-lg font-medium mb-4">Distribution des dépôts par casino</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={depositPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {depositPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique en camembert des profits */}
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
          <h3 className="text-lg font-medium mb-4">Distribution des profits par casino</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={profitPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {profitPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Graphique en barres pour la métrique sélectionnée */}
      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
        <h3 className="text-lg font-medium mb-4">{formatMetricName(selectedMetric)} par casino</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getMetricData(selectedMetric)}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="casino" tick={{ fill: '#ECECEC' }} />
              <YAxis 
                tick={{ fill: '#ECECEC' }}
                tickFormatter={(value) => selectedMetric.includes("DEPOSIT") || selectedMetric.includes("NGR") || selectedMetric.includes("PROFITS") 
                  ? `${value.toLocaleString('fr-FR')} €`
                  : value.toLocaleString('fr-FR')
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey={selectedMetric} 
                name={formatMetricName(selectedMetric)}
                fill="#8884d8" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau des performances par casino */}
      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
        <h3 className="text-lg font-medium mb-4">Récapitulatif annuel par casino ({selectedYear})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#424242]">
                <th className="p-3 text-left">Casino</th>
                <th className="p-3 text-right">Dépôts</th>
                <th className="p-3 text-right">Inscriptions</th>
                <th className="p-3 text-right">FTD</th>
                <th className="p-3 text-right">Taux Conv.</th>
                <th className="p-3 text-right">Dépôt/Inscr.</th>
                <th className="p-3 text-right">NGR</th>
                <th className="p-3 text-right">Profits</th>
              </tr>
            </thead>
            <tbody>
              {annualStatsByCasino.map((stat) => (
                <tr key={stat.casino} className="border-b border-[#424242]">
                  <td className="p-3 font-medium">{stat.casino}</td>
                  <td className="p-3 text-right">{formatCurrency(stat.totalDeposit)}</td>
                  <td className="p-3 text-right">{stat.totalSignup}</td>
                  <td className="p-3 text-right">{stat.totalFtd}</td>
                  <td className="p-3 text-right">{stat.conversionRate.toFixed(1)}%</td>
                  <td className="p-3 text-right">{formatCurrency(stat.avgDepositPerSignup)}</td>
                  <td className="p-3 text-right">{formatCurrency(stat.totalNgr)}</td>
                  <td className="p-3 text-right">{formatCurrency(stat.totalProfits)}</td>
                </tr>
              ))}
              {/* Ligne de total */}
              <tr className="bg-[#1d1d1d] font-bold">
                <td className="p-3">TOTAL</td>
                <td className="p-3 text-right">{formatCurrency(annualTotals.totalDeposit)}</td>
                <td className="p-3 text-right">{annualTotals.totalSignup}</td>
                <td className="p-3 text-right">{annualTotals.totalFtd}</td>
                <td className="p-3 text-right">{annualTotals.conversionRate.toFixed(1)}%</td>
                <td className="p-3 text-right">{formatCurrency(annualTotals.avgDepositPerSignup)}</td>
                <td className="p-3 text-right">{formatCurrency(annualTotals.totalNgr)}</td>
                <td className="p-3 text-right">{formatCurrency(annualTotals.totalProfits)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;