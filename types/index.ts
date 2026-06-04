export type Level = "L3"|"L4"|"L5"|"L6"|"SDE_I"|"SDE_II"|"SDE_III"|"STAFF"|"PRINCIPAL"|"IC4"|"IC5";
export type Currency = "INR"|"USD"|"GBP"|"EUR";
export type Source = "CONTRIBUTOR"|"SCRAPED"|"AI_INFERRED";
export type DisplayCurrency = "INR"|"USD";

export interface SalaryRecord {
  id: string; company_id: string; company_slug: string; company_name: string;
  role: string; level: Level; location: string; currency: Currency;
  experience_years: number; base_salary: number; bonus: number; stock: number;
  total_compensation: number; source: Source; confidence_score: number;
  is_verified: boolean; submitted_at: string;
}

export interface CompareDelta {
  base_delta: number; bonus_delta: number; stock_delta: number;
  tc_delta: number; experience_delta: number;
}

export interface CompareResponse {
  record1: SalaryRecord; record2: SalaryRecord; delta: CompareDelta;
}

export const LEVEL_COLORS: Record<Level, { bg: string; text: string; label: string }> = {
  L3:        { bg: "bg-slate-100",  text: "text-slate-700",  label: "L3"        },
  L4:        { bg: "bg-blue-100",   text: "text-blue-700",   label: "L4"        },
  L5:        { bg: "bg-indigo-100", text: "text-indigo-700", label: "L5"        },
  L6:        { bg: "bg-purple-100", text: "text-purple-700", label: "L6"        },
  SDE_I:     { bg: "bg-slate-100",  text: "text-slate-700",  label: "SDE-I"     },
  SDE_II:    { bg: "bg-blue-100",   text: "text-blue-700",   label: "SDE-II"    },
  SDE_III:   { bg: "bg-indigo-100", text: "text-indigo-700", label: "SDE-III"   },
  STAFF:     { bg: "bg-purple-100", text: "text-purple-700", label: "Staff"     },
  PRINCIPAL: { bg: "bg-[#1e1b4b]",  text: "text-white",      label: "Principal" },
  IC4:       { bg: "bg-blue-100",   text: "text-blue-700",   label: "IC4"       },
  IC5:       { bg: "bg-indigo-100", text: "text-indigo-700", label: "IC5"       },
};

export const ALL_LEVELS: Level[] = ["L3","L4","L5","L6","SDE_I","SDE_II","SDE_III","STAFF","PRINCIPAL","IC4","IC5"];