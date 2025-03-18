// src/app/dashboard/admin/types.ts
export interface Metric {
  id: string;
  label: string;
  type: "currency" | "number" | "text";
}

export interface CasinoReport {
  id?: number;
  user_id?: string;
  template_id: number;
  template_name: string;
  day: number;
  month: string;
  year: number;
  date: string; // Format: YYYY-MM-DD
  created_at: string;
  data: {
    [key: string]: string;
  };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface StatFilter {
  dateRange: DateRange;
  metrics: string[];
  casinos: string[];
  groupBy: "day" | "week" | "month" | "year";
}

export interface Stat {
  date: string;
  [key: string]: string | number;
}

export interface StatResponse {
  data: Stat[];
  previousPeriod?: {
    deposits: number;
    profits: number;
    signups: number;
    ftd: number;
    ngr: number;
  };
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface DailyReport {
  id?: string | number;
  date: string; // Format: YYYY-MM-DD
  year: number;
  month: string;
  day: number;
  data: {
    [key: string]: string | number;
  };
}
