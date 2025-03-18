import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "@/app/dashboard/admin/types";
import { formatDateFr } from "@/app/dashboard/admin/constants";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

type PredefinedRange = {
  label: string;
  getValue: () => DateRange;
};

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const predefinedRanges: PredefinedRange[] = [
    {
      label: "Aujourd'hui",
      getValue: () => {
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0];
        return {
          startDate: dateStr,
          endDate: dateStr,
        };
      },
    },
    {
      label: "Hier",
      getValue: () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const dateStr = yesterday.toISOString().split("T")[0];
        return {
          startDate: dateStr,
          endDate: dateStr,
        };
      },
    },
    {
      label: "7 derniers jours",
      getValue: () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        return {
          startDate: sevenDaysAgo.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "30 derniers jours",
      getValue: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29);
        return {
          startDate: thirtyDaysAgo.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "Ce mois",
      getValue: () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: firstDayOfMonth.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      },
    },
    {
      label: "Mois précédent",
      getValue: () => {
        const today = new Date();
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          startDate: firstDayOfLastMonth.toISOString().split("T")[0],
          endDate: lastDayOfLastMonth.toISOString().split("T")[0],
        };
      },
    },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectRange = (range: PredefinedRange) => {
    onChange(range.getValue());
    setIsOpen(false);
  };

  const handleCustomRangeChange = (field: keyof DateRange, value: string) => {
    onChange({
      ...value,
      [field]: value,
    });
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center w-full px-3 py-2 bg-[#1a1a1a] border border-[#323232] rounded-lg text-sm text-white hover:bg-[#252525] transition-colors"
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
        <span>
          {formatDateFr(value.startDate)} - {formatDateFr(value.endDate)}
        </span>
        <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-[#1a1a1a] border border-[#323232] rounded-lg shadow-lg z-10 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date de début</label>
              <input
                type="date"
                value={value.startDate}
                onChange={(e) => handleCustomRangeChange("startDate", e.target.value)}
                max={value.endDate}
                className="w-full p-2 rounded bg-[#252525] border border-[#323232] text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date de fin</label>
              <input
                type="date"
                value={value.endDate}
                onChange={(e) => handleCustomRangeChange("endDate", e.target.value)}
                min={value.startDate}
                className="w-full p-2 rounded bg-[#252525] border border-[#323232] text-white text-sm"
              />
            </div>
          </div>

          <div className="border-t border-[#323232] pt-3">
            <p className="text-xs text-gray-400 mb-2">Périodes prédéfinies</p>
            <div className="grid grid-cols-2 gap-2">
              {predefinedRanges.map((range) => (
                <AdminButton
                  key={range.label}
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSelectRange(range)}
                  className="w-full justify-start"
                >
                  {range.label}
                </AdminButton>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 