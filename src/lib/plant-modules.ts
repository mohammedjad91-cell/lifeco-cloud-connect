// Module catalogs per plant type (Ammonia Department)
export interface PlantModule {
  key: string;
  label: string;
  labelAr?: string;
  route?: string; // when defined, tile navigates here
  icon?: string;
}

const AMMONIA_MODULES: PlantModule[] = [
  { key: "overview", label: "Plant Overview", labelAr: "نظرة عامة" },
  { key: "live", label: "Live Dashboard", labelAr: "لوحة مباشرة", route: "/dashboard" },
  { key: "operations", label: "Operations", labelAr: "التشغيل", route: "/dashboard" },
  { key: "equipment", label: "Equipment", labelAr: "المعدات" },
  { key: "maintenance", label: "Maintenance", labelAr: "الصيانة" },
  { key: "lab", label: "Laboratory", labelAr: "المختبر", route: "/lab" },
  { key: "process", label: "Process Engineering", labelAr: "هندسة العمليات" },
  { key: "utilities", label: "Utilities", labelAr: "المرافق" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
  { key: "spares", label: "Spare Parts", labelAr: "قطع الغيار" },
  { key: "shutdown", label: "Shutdown History", labelAr: "سجل التوقفات" },
  { key: "photos", label: "Photos", labelAr: "الصور" },
  { key: "videos", label: "Videos", labelAr: "الفيديو" },
  { key: "pfd", label: "PFD", labelAr: "PFD", route: "/ots" },
  { key: "pid", label: "P&ID", labelAr: "P&ID", route: "/ots" },
  { key: "sop", label: "SOP", labelAr: "SOP" },
  { key: "manuals", label: "Manuals", labelAr: "الأدلة" },
  { key: "datasheets", label: "Datasheets", labelAr: "الجداول الفنية" },
];

const NITROGEN_MODULES: PlantModule[] = [
  { key: "overview", label: "Plant Overview", labelAr: "نظرة عامة" },
  { key: "live", label: "Live Dashboard", labelAr: "لوحة مباشرة", route: "/dashboard" },
  { key: "equipment", label: "Equipment", labelAr: "المعدات" },
  { key: "operations", label: "Operations", labelAr: "التشغيل", route: "/dashboard" },
  { key: "maintenance", label: "Maintenance", labelAr: "الصيانة" },
  { key: "production", label: "Production", labelAr: "الإنتاج" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
  { key: "manuals", label: "Manuals", labelAr: "الأدلة" },
  { key: "drawings", label: "Drawings", labelAr: "الرسومات" },
];

const DEMIN_MODULES: PlantModule[] = [
  { key: "overview", label: "Plant Overview", labelAr: "نظرة عامة" },
  { key: "water", label: "Water Quality", labelAr: "جودة المياه" },
  { key: "operations", label: "Operations", labelAr: "التشغيل", route: "/dashboard" },
  { key: "equipment", label: "Equipment", labelAr: "المعدات" },
  { key: "maintenance", label: "Maintenance", labelAr: "الصيانة" },
  { key: "lab", label: "Laboratory", labelAr: "المختبر", route: "/lab" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
];

const PROC_ENG_MODULES: PlantModule[] = [
  { key: "pfd-lib", label: "PFD Library", labelAr: "مكتبة PFD" },
  { key: "pid-lib", label: "P&ID Library", labelAr: "مكتبة P&ID" },
  { key: "calc", label: "Process Calculations", labelAr: "حسابات العمليات" },
  { key: "sop", label: "Operating Procedures (SOP)", labelAr: "إجراءات التشغيل" },
  { key: "startup", label: "Startup Procedures", labelAr: "إجراءات بدء التشغيل" },
  { key: "shutdown", label: "Shutdown Procedures", labelAr: "إجراءات الإيقاف" },
  { key: "standards", label: "Engineering Standards", labelAr: "المعايير الهندسية" },
  { key: "reports", label: "Technical Reports", labelAr: "التقارير الفنية" },
  { key: "moc", label: "Modification Documents (MOC)", labelAr: "وثائق التعديلات" },
  { key: "archive", label: "Engineering Archive", labelAr: "الأرشيف الهندسي" },
];

export const SHARED_FEATURES: PlantModule[] = [
  { key: "overview", label: "Overview", labelAr: "نظرة عامة" },
  { key: "live", label: "Live Status", labelAr: "الحالة المباشرة", route: "/dashboard" },
  { key: "prod", label: "Production Dashboard", labelAr: "لوحة الإنتاج", route: "/dashboard" },
  { key: "equipment", label: "Equipment List", labelAr: "قائمة المعدات" },
  { key: "eq-cards", label: "Equipment Cards", labelAr: "بطاقات المعدات" },
  { key: "maint-hist", label: "Maintenance History", labelAr: "سجل الصيانة" },
  { key: "work-orders", label: "Work Orders", labelAr: "أوامر العمل" },
  { key: "inspection", label: "Inspection", labelAr: "التفتيش" },
  { key: "lube", label: "Lubrication", labelAr: "التزييت" },
  { key: "spares", label: "Spare Parts", labelAr: "قطع الغيار" },
  { key: "lab", label: "Laboratory Results", labelAr: "نتائج المختبر", route: "/lab" },
  { key: "docs", label: "Engineering Documents", labelAr: "الوثائق الهندسية" },
  { key: "pdf", label: "PDF Archive", labelAr: "أرشيف PDF" },
  { key: "photos", label: "Photo Gallery", labelAr: "معرض الصور" },
  { key: "videos", label: "Video Library", labelAr: "مكتبة الفيديو" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

export function getModulesForPlant(code: string): PlantModule[] {
  const c = code.toUpperCase();
  if (c.startsWith("AMM")) return AMMONIA_MODULES;
  if (c.startsWith("N2") || c.includes("NITROGEN")) return NITROGEN_MODULES;
  if (c.startsWith("DEMIN")) return DEMIN_MODULES;
  if (c.startsWith("PROC")) return PROC_ENG_MODULES;
  return AMMONIA_MODULES;
}
