import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { AdminCard, AdminCardContent } from "./ui/AdminCard";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-500",
  trend,
  className,
}: StatsCardProps) {
  return (
    <AdminCard className={cn("overflow-hidden", className)}>
      <AdminCardContent className="flex justify-between items-center">
        <div className="flex-1">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.positive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1.5">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-full bg-opacity-10", iconColor.replace("text", "bg"))}>
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
      </AdminCardContent>
    </AdminCard>
  );
} 