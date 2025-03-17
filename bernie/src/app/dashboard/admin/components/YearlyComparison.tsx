// src/app/dashboard/admin/components/YearlyComparison.tsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface YearlyComparisonProps {
  years: number[];
  yearlyData: {
    year: number;
    totalDeposit: number;
    totalSignup: number;
    totalFtd: number;
    totalNgr: number;
    totalProfits: number;
  }[];
}

const YearlyComparison: React.FC<YearlyComparisonProps> = ({ years, yearlyData }) => {
  // Formatter pour afficher les valeurs monétaires
  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  // Calculer la croissance année par année
  const calculateGrowth = (currentYear: number, metric: 'totalDeposit' | 'totalSignup' | 'totalFtd' | 'totalNgr' | 'totalProfits') => {
    if (years.length < 2) return { growth: 0, icon: <Minus size={16} /> };

    const currentYearData = yearlyData.find(data => data.year === currentYear);
    const previousYearIndex = years.indexOf(currentYear) + 1;
    
    if (previousYearIndex >= years.length) return { growth: 0, icon: <Minus size={16} /> };
    
    const previousYearData = yearlyData.find(data => data.year === years[previousYearIndex]);
    
    if (!currentYearData || !previousYearData) return { growth: 0, icon: <Minus size={16} /> };
    
    const currentValue = currentYearData[metric];
    const previousValue = previousYearData[metric];
    
    if (previousValue === 0) return { growth: 0, icon: <Minus size={16} /> };
    
    const growthPercentage = ((currentValue - previousValue) / previousValue) * 100;
    
    if (growthPercentage > 0) {
      return { 
        growth: growthPercentage, 
        icon: <TrendingUp size={16} className="text-green-500" /> 
      };
    } else if (growthPercentage < 0) {
      return { 
        growth: growthPercentage, 
        icon: <TrendingDown size={16} className="text-red-500" /> 
      };
    } else {
      return { growth: 0, icon: <Minus size={16} /> };
    }
  };

  // Obtenir les données du plus récent
  const mostRecentYear = years.length > 0 ? years[0] : new Date().getFullYear();
  const depositGrowth = calculateGrowth(mostRecentYear, 'totalDeposit');
  const signupGrowth = calculateGrowth(mostRecentYear, 'totalSignup');
  const ftdGrowth = calculateGrowth(mostRecentYear, 'totalFtd');
  const profitsGrowth = calculateGrowth(mostRecentYear, 'totalProfits');

  // Obtenir les données pour le graphique
  const chartData = yearlyData.map(data => ({
    year: data.year,
    "Dépôts": data.totalDeposit,
    "Profits": data.totalProfits
  }));

  // Formatter pour le tooltip du graphique
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.name === "Dépôts" || entry.name === "Profits" 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
      <h3 className="text-lg font-medium mb-4">Comparaison annuelle</h3>
      
      {yearlyData.length < 2 ? (
        <p className="text-center text-gray-400 py-4">
          Données insuffisantes pour une comparaison annuelle.
          Au moins deux années de données sont nécessaires.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#212121] p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Croissance des dépôts</span>
                {depositGrowth.icon}
              </div>
              <p className={`text-lg font-semibold ${depositGrowth.growth > 0 ? 'text-green-500' : depositGrowth.growth < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {depositGrowth.growth > 0 ? '+' : ''}{depositGrowth.growth.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-[#212121] p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Croissance des inscriptions</span>
                {signupGrowth.icon}
              </div>
              <p className={`text-lg font-semibold ${signupGrowth.growth > 0 ? 'text-green-500' : signupGrowth.growth < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {signupGrowth.growth > 0 ? '+' : ''}{signupGrowth.growth.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-[#212121] p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Croissance des FTD</span>
                {ftdGrowth.icon}
              </div>
              <p className={`text-lg font-semibold ${ftdGrowth.growth > 0 ? 'text-green-500' : ftdGrowth.growth < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {ftdGrowth.growth > 0 ? '+' : ''}{ftdGrowth.growth.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-[#212121] p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Croissance des profits</span>
                {profitsGrowth.icon}
              </div>
              <p className={`text-lg font-semibold ${profitsGrowth.growth > 0 ? 'text-green-500' : profitsGrowth.growth < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {profitsGrowth.growth > 0 ? '+' : ''}{profitsGrowth.growth.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" tick={{ fill: '#ECECEC' }} />
                <YAxis 
                  tick={{ fill: '#ECECEC' }}
                  tickFormatter={(value) => `${value.toLocaleString('fr-FR')} €`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Dépôts" fill="#8884d8" />
                <Bar dataKey="Profits" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Récapitulatif par année</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#424242]">
                    <th className="p-2 text-left">Année</th>
                    <th className="p-2 text-right">Dépôts</th>
                    <th className="p-2 text-right">Inscriptions</th>
                    <th className="p-2 text-right">FTD</th>
                    <th className="p-2 text-right">Taux Conv.</th>
                    <th className="p-2 text-right">NGR</th>
                    <th className="p-2 text-right">Profits</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((data) => {
                    const conversionRate = data.totalSignup > 0 ? (data.totalFtd / data.totalSignup) * 100 : 0;
                    
                    return (
                      <tr key={data.year} className="border-b border-[#2a2a2a]">
                        <td className="p-2 font-medium">{data.year}</td>
                        <td className="p-2 text-right">{formatCurrency(data.totalDeposit)}</td>
                        <td className="p-2 text-right">{data.totalSignup}</td>
                        <td className="p-2 text-right">{data.totalFtd}</td>
                        <td className="p-2 text-right">{conversionRate.toFixed(1)}%</td>
                        <td className="p-2 text-right">{formatCurrency(data.totalNgr)}</td>
                        <td className="p-2 text-right">{formatCurrency(data.totalProfits)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default YearlyComparison;