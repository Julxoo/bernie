// src/app/dashboard/admin/components/CasinoPerformanceCard.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CasinoPerformanceCardProps {
  casinoName: string;
  data: {
    totalDeposit: number;
    totalSignup: number;
    totalFtd: number;
    totalNgr: number;
    totalProfits: number;
    monthlyData: {
      month: string;
      deposit: number;
      signup: number;
      ftd: number;
      ngr: number;
      profits: number;
    }[];
  };
}

const CasinoPerformanceCard: React.FC<CasinoPerformanceCardProps> = ({ casinoName, data }) => {
  // Calculer les tendances (comparaison entre les deux derniers mois)
  const calculateTrend = (metricKey: string) => {
    if (data.monthlyData.length < 2) return { trend: 0, icon: <Minus size={16} /> };
    
    const sortedData = [...data.monthlyData].sort((a, b) => {
      const monthsOrder = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
      return monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month);
    });
    
    const lastMonth = sortedData[sortedData.length - 1];
    const previousMonth = sortedData[sortedData.length - 2];
    
    // @ts-ignore - Dynamic property access
    const currentValue = lastMonth[metricKey] || 0;
    // @ts-ignore - Dynamic property access
    const previousValue = previousMonth[metricKey] || 0;
    
    if (previousValue === 0) return { trend: 0, icon: <Minus size={16} /> };
    
    const trendPercentage = ((currentValue - previousValue) / previousValue) * 100;
    
    if (trendPercentage > 0) {
      return { 
        trend: trendPercentage, 
        icon: <TrendingUp size={16} className="text-green-500" /> 
      };
    } else if (trendPercentage < 0) {
      return { 
        trend: trendPercentage, 
        icon: <TrendingDown size={16} className="text-red-500" /> 
      };
    } else {
      return { trend: 0, icon: <Minus size={16} /> };
    }
  };

  const depositTrend = calculateTrend("deposit");
  const signupTrend = calculateTrend("signup");
  const ftdTrend = calculateTrend("ftd");
  const profitsTrend = calculateTrend("profits");
  
  // Formatter pour afficher les valeurs monétaires
  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  // Formatage pour le pourcentage de conversion
  const conversionRate = data.totalSignup > 0 ? (data.totalFtd / data.totalSignup) * 100 : 0;

  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#424242]">
      <h3 className="text-xl font-medium mb-3">{casinoName}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Total Dépôts</span>
            <div className="flex items-center gap-1">
              {depositTrend.icon}
              <span className={`text-xs ${depositTrend.trend > 0 ? 'text-green-500' : depositTrend.trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {Math.abs(depositTrend.trend).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(data.totalDeposit)}</p>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Profits</span>
            <div className="flex items-center gap-1">
              {profitsTrend.icon}
              <span className={`text-xs ${profitsTrend.trend > 0 ? 'text-green-500' : profitsTrend.trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {Math.abs(profitsTrend.trend).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(data.totalProfits)}</p>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Inscriptions</span>
            <div className="flex items-center gap-1">
              {signupTrend.icon}
              <span className={`text-xs ${signupTrend.trend > 0 ? 'text-green-500' : signupTrend.trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {Math.abs(signupTrend.trend).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-lg font-semibold">{data.totalSignup}</p>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">FTD</span>
            <div className="flex items-center gap-1">
              {ftdTrend.icon}
              <span className={`text-xs ${ftdTrend.trend > 0 ? 'text-green-500' : ftdTrend.trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {Math.abs(ftdTrend.trend).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-lg font-semibold">{data.totalFtd}</p>
          <p className="text-xs text-gray-400">{conversionRate.toFixed(1)}% de conversion</p>
        </div>
      </div>
      
      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-3 gap-2 mb-4 border-t border-[#333] pt-3">
        <div>
          <p className="text-xs text-gray-400">Dépôt/Inscr.</p>
          <p className="text-sm">
            {formatCurrency(data.totalSignup > 0 ? data.totalDeposit / data.totalSignup : 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Dépôt/FTD</p>
          <p className="text-sm">
            {formatCurrency(data.totalFtd > 0 ? data.totalDeposit / data.totalFtd : 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">NGR</p>
          <p className="text-sm">{formatCurrency(data.totalNgr)}</p>
        </div>
      </div>
      
      {/* Mini graphique des dépôts et profits */}
      <div className="h-24 mt-4">
        <p className="text-xs text-gray-400 mb-1">Évolution mensuelle</p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.monthlyData}>
            <XAxis 
              dataKey="month" 
              tick={false}
              axisLine={false}
            />
            <YAxis 
              hide={true}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "deposit" || name === "profits" || name === "ngr") {
                  return [formatCurrency(value), name === "deposit" ? "Dépôts" : name === "profits" ? "Profits" : "NGR"];
                }
                return [value, name === "signup" ? "Inscriptions" : "FTD"];
              }}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
            />
            <Line 
              type="monotone" 
              dataKey="deposit" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={false}
              name="deposit"
            />
            <Line 
              type="monotone" 
              dataKey="profits" 
              stroke="#82ca9d" 
              strokeWidth={2}
              dot={false}
              name="profits"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Ratio Performance */}
      <div className="mt-3 text-center border-t border-[#333] pt-3">
        <p className="text-xs text-gray-400 mb-1">
          Ratio Profits/Dépôts: 
          <span className="ml-1 font-semibold text-sm">
            {data.totalDeposit > 0 ? ((data.totalProfits / data.totalDeposit) * 100).toFixed(1) + '%' : '0%'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CasinoPerformanceCard;