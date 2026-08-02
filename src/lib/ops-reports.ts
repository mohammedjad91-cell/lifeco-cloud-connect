import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";

export type PlantKey = "AMMONIA" | "UREA";
export type Shift = "morning" | "evening" | "night";
export type PeriodType = "daily" | "weekly" | "monthly";
export type WorkCategory = "routine" | "non_routine";
export type Severity = "low" | "medium" | "high" | "critical";
export type ReportStatus = "draft" | "submitted" | "approved";

export interface OperationalReport {
  id: string;
  plant_key: PlantKey;
  plant_code: string | null;
  report_date: string;
  shift: Shift;
  period_type: PeriodType;
  work_category: WorkCategory;
  title: string;
  description: string | null;
  equipment_tag: string | null;
  severity: Severity;
  supervisor_name: string | null;
  signed: boolean;
  status: ReportStatus;
  created_at: string;
}

export const PLANTS: Record<PlantKey, { name: string; nameEn: string; accent: string; ring: string; chip: string }> = {
  AMMONIA: {
    name: "مصنع الأمونيا",
    nameEn: "Ammonia Plant",
    accent: "text-sky-300",
    ring: "border-sky-400/40 shadow-[0_0_30px_-10px_hsl(199_89%_60%/0.6)]",
    chip: "bg-sky-500/15 text-sky-200 border-sky-400/40",
  },
  UREA: {
    name: "مصنع اليوريا",
    nameEn: "Urea Plant",
    accent: "text-amber-300",
    ring: "border-amber-400/40 shadow-[0_0_30px_-10px_hsl(43_96%_56%/0.6)]",
    chip: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  },
};

export const SHIFT_LABEL: Record<Shift, string> = {
  morning: "الوردية الصباحية",
  evening: "الوردية المسائية",
  night: "الوردية الليلية",
};

export const PERIOD_LABEL: Record<PeriodType, string> = {
  daily: "تقرير يومي",
  weekly: "ملخص أسبوعي",
  monthly: "مراجعة شهرية",
};

export const CATEGORY_LABEL: Record<WorkCategory, string> = {
  routine: "عمل روتيني",
  non_routine: "عمل غير روتيني",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  low: "عادي",
  medium: "متوسط",
  high: "عالي",
  critical: "حرج",
};

export const STATUS_LABEL: Record<ReportStatus, string> = {
  draft: "مسودة",
  submitted: "مُرسل",
  approved: "معتمد",
};

export const SEVERITY_CLASS: Record<Severity, string> = {
  low: "bg-slate-500/15 text-slate-200 border-slate-400/30",
  medium: "bg-sky-500/15 text-sky-200 border-sky-400/30",
  high: "bg-orange-500/15 text-orange-200 border-orange-400/40",
  critical: "bg-red-500/20 text-red-200 border-red-400/50",
};

/** Sub-units available for tagging inside each plant hub. */
export const PLANT_UNITS: Record<PlantKey, string[]> = {
  AMMONIA: ["AMM-1", "AMM-2", "N2-1", "DEMIN-1", "DEMIN-2", "PROC-ENG"],
  UREA: ["UREA-1", "UREA-2", "GRAN-1", "BAGGING", "UTIL-UREA"],
};

/** Laboratory sections — reports belonging to the lab department only. */
export const LAB_UNITS: Record<PlantKey, string[]> = {
  AMMONIA: ["LAB-AMM-WATER", "LAB-AMM-GAS", "LAB-AMM-CATALYST", "LAB-AMM-BOILER", "LAB-AMM-DEMIN", "LAB-AMM-N2"],
  UREA: ["LAB-UREA-PRODUCT", "LAB-UREA-SOLUTION", "LAB-UREA-GRAN", "LAB-UREA-EFFLUENT", "LAB-UREA-BOILER"],
};

export const LAB_TITLES: Record<PlantKey, { name: string; nameEn: string }> = {
  AMMONIA: { name: "معمل الأمونيا", nameEn: "Ammonia Laboratory" },
  UREA: { name: "معمل اليوريا", nameEn: "Urea Laboratory" },
};

/** Inclusive date range (yyyy-MM-dd) for a period anchored on `anchor`. */
export function periodRange(period: PeriodType, anchor: Date) {
  if (period === "weekly") {
    return { from: format(subDays(anchor, 6), "yyyy-MM-dd"), to: format(anchor, "yyyy-MM-dd") };
  }
  if (period === "monthly") {
    return { from: format(startOfMonth(anchor), "yyyy-MM-dd"), to: format(endOfMonth(anchor), "yyyy-MM-dd") };
  }
  const d = format(anchor, "yyyy-MM-dd");
  return { from: d, to: d };
}

export interface ReportFilters {
  plantKey?: PlantKey | "ALL";
  from?: string;
  to?: string;
  category?: WorkCategory | "ALL";
  periodType?: PeriodType | "ALL";
  shift?: Shift | "ALL";
  section?: ReportSection;
}

const table = () => (supabase as any).from("operational_reports");

export async function fetchReports(f: ReportFilters): Promise<OperationalReport[]> {
  let q = table().select("*").order("report_date", { ascending: false }).order("created_at", { ascending: false }).limit(500);
  q = q.eq("section", f.section ?? "OPS");
  if (f.plantKey && f.plantKey !== "ALL") q = q.eq("plant_key", f.plantKey);
  if (f.category && f.category !== "ALL") q = q.eq("work_category", f.category);
  if (f.periodType && f.periodType !== "ALL") q = q.eq("period_type", f.periodType);
  if (f.shift && f.shift !== "ALL") q = q.eq("shift", f.shift);
  if (f.from) q = q.gte("report_date", f.from);
  if (f.to) q = q.lte("report_date", f.to);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as OperationalReport[];
}

export async function createReport(payload: Partial<OperationalReport>) {
  const { error } = await table().insert(payload);
  if (error) throw error;
}

export async function setReportStatus(id: string, status: ReportStatus, signed?: boolean) {
  const patch: Record<string, unknown> = { status };
  if (typeof signed === "boolean") patch.signed = signed;
  const { error } = await table().update(patch).eq("id", id);
  if (error) throw error;
}

export function summarize(rows: OperationalReport[]) {
  return {
    total: rows.length,
    routine: rows.filter((r) => r.work_category === "routine").length,
    nonRoutine: rows.filter((r) => r.work_category === "non_routine").length,
    critical: rows.filter((r) => r.severity === "critical" || r.severity === "high").length,
    approved: rows.filter((r) => r.status === "approved").length,
    pending: rows.filter((r) => r.status !== "approved").length,
  };
}
