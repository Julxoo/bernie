import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminTabsProps {
  tabs: {
    id: string;
    label: React.ReactNode;
    disabled?: boolean;
  }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function AdminTabs({ tabs, activeTab, onChange, className }: AdminTabsProps) {
  return (
    <div className={cn("border-b border-[#323232] overflow-x-auto", className)}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors relative",
              activeTab === tab.id
                ? "text-white"
                : "text-gray-400 hover:text-gray-300",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 