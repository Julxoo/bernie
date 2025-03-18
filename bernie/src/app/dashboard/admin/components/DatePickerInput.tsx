import React from "react";
import { Calendar } from "lucide-react";
import { formatDateFr } from "../constants";

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  className?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  className = "",
  min,
  max,
  disabled = false,
}) => {
  return (
    <div className={`relative ${className}`}>
      <label className="block mb-2 text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Calendar size={16} className="text-gray-400" />
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 p-2.5 bg-[#171717] border border-[#424242] text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          min={min}
          max={max}
          disabled={disabled}
        />
        {value && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-xs text-gray-400">{formatDateFr(value)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePickerInput; 