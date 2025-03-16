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
  month: string;
  year: number;
  created_at: string;
  data: {
    [key: string]: string;
  };
}
