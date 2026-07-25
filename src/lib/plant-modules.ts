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

const UREA_MODULES: PlantModule[] = [
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

const WATER_MODULES: PlantModule[] = [
  { key: "overview", label: "Plant Overview", labelAr: "نظرة عامة" },
  { key: "water", label: "Water Quality", labelAr: "جودة المياه" },
  { key: "operations", label: "Operations", labelAr: "التشغيل", route: "/dashboard" },
  { key: "equipment", label: "Equipment", labelAr: "المعدات" },
  { key: "maintenance", label: "Maintenance", labelAr: "الصيانة" },
  { key: "lab", label: "Laboratory", labelAr: "المختبر", route: "/lab" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
  { key: "manuals", label: "Manuals", labelAr: "الأدلة" },
];

const AMMONIA_STORAGE_MODULES: PlantModule[] = [
  { key: "overview", label: "Tank Overview", labelAr: "نظرة عامة على الخزان" },
  { key: "status", label: "Tank Status", labelAr: "حالة الخزان" },
  { key: "level", label: "Tank Level", labelAr: "مستوى الخزان" },
  { key: "pressure", label: "Pressure Monitoring", labelAr: "مراقبة الضغط" },
  { key: "temperature", label: "Temperature Monitoring", labelAr: "مراقبة الحرارة" },
  { key: "safety", label: "Safety Inspection", labelAr: "تفتيش السلامة" },
  { key: "equipment", label: "Equipment", labelAr: "المعدات" },
  { key: "maintenance", label: "Maintenance", labelAr: "الصيانة" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
];

const UREA_LOADING_MODULES: PlantModule[] = [
  { key: "schedule", label: "Loading Schedule", labelAr: "جدول التحميل" },
  { key: "trucks", label: "Truck Management", labelAr: "إدارة الشاحنات" },
  { key: "weighbridge", label: "Weighbridge Records", labelAr: "سجلات الميزان" },
  { key: "dispatch", label: "Dispatch Reports", labelAr: "تقارير الإرسال" },
  { key: "equipment", label: "Loading Equipment", labelAr: "معدات التحميل" },
  { key: "maintenance", label: "Maintenance", labelAr: "الصيانة" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

const AMMONIA_LOADING_MODULES: PlantModule[] = [
  { key: "schedule", label: "Loading Schedule", labelAr: "جدول التحميل" },
  { key: "trucks", label: "Truck Management", labelAr: "إدارة الشاحنات" },
  { key: "tanker", label: "Tanker Information", labelAr: "معلومات الناقلة" },
  { key: "equipment", label: "Loading Equipment", labelAr: "معدات التحميل" },
  { key: "safety", label: "Safety Procedures", labelAr: "إجراءات السلامة" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
];

const LAB_AMMONIA_MODULES: PlantModule[] = [
  { key: "dashboard", label: "Laboratory Dashboard", labelAr: "لوحة المختبر", route: "/lab" },
  { key: "sample-reg", label: "Sample Registration", labelAr: "تسجيل العينات" },
  { key: "sample-track", label: "Sample Tracking", labelAr: "تتبع العينات" },
  { key: "chem-analysis", label: "Chemical Analysis", labelAr: "التحليل الكيميائي" },
  { key: "gas-analysis", label: "Gas Analysis", labelAr: "تحليل الغازات" },
  { key: "water-analysis", label: "Water Analysis", labelAr: "تحليل المياه" },
  { key: "qc", label: "Quality Control", labelAr: "ضبط الجودة" },
  { key: "equipment", label: "Laboratory Equipment", labelAr: "معدات المختبر" },
  { key: "calibration", label: "Calibration", labelAr: "المعايرة" },
  { key: "certificates", label: "Certificates", labelAr: "الشهادات" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
  { key: "pdf", label: "PDF Archive", labelAr: "أرشيف PDF" },
  { key: "photos", label: "Photos", labelAr: "الصور" },
];

const LAB_UREA_MODULES: PlantModule[] = [
  { key: "dashboard", label: "Laboratory Dashboard", labelAr: "لوحة المختبر", route: "/lab" },
  { key: "sample-reg", label: "Sample Registration", labelAr: "تسجيل العينات" },
  { key: "sample-track", label: "Sample Tracking", labelAr: "تتبع العينات" },
  { key: "prod-analysis", label: "Product Analysis", labelAr: "تحليل المنتج" },
  { key: "water-analysis", label: "Water Analysis", labelAr: "تحليل المياه" },
  { key: "qc", label: "Quality Control", labelAr: "ضبط الجودة" },
  { key: "equipment", label: "Laboratory Equipment", labelAr: "معدات المختبر" },
  { key: "calibration", label: "Calibration", labelAr: "المعايرة" },
  { key: "certificates", label: "Certificates", labelAr: "الشهادات" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
  { key: "pdf", label: "PDF Archive", labelAr: "أرشيف PDF" },
  { key: "photos", label: "Photos", labelAr: "الصور" },
];

const LAB_EQUIPMENT_MODULES: PlantModule[] = [
  { key: "list", label: "Equipment List", labelAr: "قائمة المعدات" },
  { key: "cards", label: "Equipment Cards", labelAr: "بطاقات المعدات" },
  { key: "cal-sched", label: "Calibration Schedule", labelAr: "جدول المعايرة" },
  { key: "cal-hist", label: "Calibration History", labelAr: "سجل المعايرة" },
  { key: "pm", label: "Preventive Maintenance", labelAr: "الصيانة الوقائية" },
  { key: "cm", label: "Corrective Maintenance", labelAr: "الصيانة التصحيحية" },
  { key: "manuals", label: "Equipment Manuals", labelAr: "أدلة المعدات" },
  { key: "pdf", label: "PDF Documents", labelAr: "وثائق PDF" },
  { key: "spares", label: "Spare Parts", labelAr: "قطع الغيار" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

const LAB_CHEM_STORE_MODULES: PlantModule[] = [
  { key: "inventory", label: "Chemical Inventory", labelAr: "مخزون الكيماويات" },
  { key: "categories", label: "Chemical Categories", labelAr: "فئات الكيماويات" },
  { key: "msds", label: "MSDS / SDS", labelAr: "صحائف السلامة" },
  { key: "receive", label: "Chemical Receiving", labelAr: "استلام الكيماويات" },
  { key: "issue", label: "Chemical Issuing", labelAr: "صرف الكيماويات" },
  { key: "stock", label: "Stock Monitoring", labelAr: "مراقبة المخزون" },
  { key: "expiry", label: "Expiry Date Tracking", labelAr: "تتبع تاريخ الانتهاء" },
  { key: "suppliers", label: "Suppliers", labelAr: "الموردون" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

const LAB_REPORTS_MODULES: PlantModule[] = [
  { key: "daily", label: "Daily Reports", labelAr: "التقارير اليومية" },
  { key: "weekly", label: "Weekly Reports", labelAr: "التقارير الأسبوعية" },
  { key: "monthly", label: "Monthly Reports", labelAr: "التقارير الشهرية" },
  { key: "quality", label: "Quality Reports", labelAr: "تقارير الجودة" },
  { key: "sample", label: "Sample Reports", labelAr: "تقارير العينات" },
  { key: "cert", label: "Certificate Reports", labelAr: "تقارير الشهادات" },
  { key: "bi", label: "BI Dashboard", labelAr: "لوحة BI", route: "/bi" },
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

const MAINT_PLANT_MODULES: PlantModule[] = [
  { key: "dashboard", label: "Maintenance Dashboard", labelAr: "لوحة الصيانة", route: "/dashboard" },
  { key: "mech", label: "Mechanical Maintenance", labelAr: "الصيانة الميكانيكية" },
  { key: "elec", label: "Electrical Maintenance", labelAr: "الصيانة الكهربائية" },
  { key: "inst", label: "Instrumentation Maintenance", labelAr: "صيانة الأجهزة" },
  { key: "civil", label: "Civil Maintenance", labelAr: "الصيانة المدنية" },
  { key: "utility", label: "Utility Maintenance", labelAr: "صيانة المرافق" },
  { key: "workshop", label: "Workshop", labelAr: "الورشة" },
  { key: "wo", label: "Work Orders", labelAr: "أوامر العمل" },
  { key: "pm", label: "Preventive Maintenance", labelAr: "الصيانة الوقائية" },
  { key: "pdm", label: "Predictive Maintenance", labelAr: "الصيانة التنبؤية" },
  { key: "cm", label: "Corrective Maintenance", labelAr: "الصيانة التصحيحية" },
  { key: "bm", label: "Breakdown Maintenance", labelAr: "صيانة الأعطال" },
  { key: "shutdown", label: "Shutdown Management", labelAr: "إدارة التوقفات" },
  { key: "inspection", label: "Inspection", labelAr: "التفتيش" },
  { key: "lube", label: "Lubrication", labelAr: "التزييت" },
  { key: "history", label: "Equipment History", labelAr: "سجل المعدات" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

const MAINT_PLANNING_MODULES: PlantModule[] = [
  { key: "annual", label: "Annual Maintenance Plan", labelAr: "الخطة السنوية" },
  { key: "monthly", label: "Monthly Plan", labelAr: "الخطة الشهرية" },
  { key: "weekly", label: "Weekly Plan", labelAr: "الخطة الأسبوعية" },
  { key: "daily", label: "Daily Schedule", labelAr: "الجدول اليومي" },
  { key: "shutdown", label: "Shutdown Planning", labelAr: "تخطيط التوقفات" },
  { key: "resource", label: "Resource Planning", labelAr: "تخطيط الموارد" },
  { key: "manpower", label: "Manpower Planning", labelAr: "تخطيط القوى العاملة" },
  { key: "material", label: "Material Planning", labelAr: "تخطيط المواد" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

const MAINT_WORKSHOP_MODULES: PlantModule[] = [
  { key: "machine", label: "Machine Shop", labelAr: "ورشة المكائن" },
  { key: "welding", label: "Welding Shop", labelAr: "ورشة اللحام" },
  { key: "fab", label: "Fabrication Shop", labelAr: "ورشة التصنيع" },
  { key: "req", label: "Repair Requests", labelAr: "طلبات الإصلاح" },
  { key: "jobs", label: "Workshop Jobs", labelAr: "مهام الورشة" },
  { key: "done", label: "Completed Jobs", labelAr: "المهام المنجزة" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

const MAINT_WO_MODULES: PlantModule[] = [
  { key: "create", label: "Create Work Order", labelAr: "إنشاء أمر عمل" },
  { key: "assign", label: "Assign Technician", labelAr: "تعيين فني" },
  { key: "status", label: "Work Status", labelAr: "حالة العمل" },
  { key: "priority", label: "Priority", labelAr: "الأولوية" },
  { key: "approval", label: "Approval", labelAr: "الاعتماد" },
  { key: "completion", label: "Completion", labelAr: "الإنجاز" },
  { key: "history", label: "History", labelAr: "السجل" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

const MAINT_EQUIPMENT_MODULES: PlantModule[] = [
  { key: "list", label: "Equipment List", labelAr: "قائمة المعدات" },
  { key: "card", label: "Equipment Card", labelAr: "بطاقة المعدة" },
  { key: "specs", label: "Technical Specifications", labelAr: "المواصفات الفنية" },
  { key: "schedule", label: "Maintenance Schedule", labelAr: "جدول الصيانة" },
  { key: "maint-hist", label: "Maintenance History", labelAr: "سجل الصيانة" },
  { key: "insp-hist", label: "Inspection History", labelAr: "سجل التفتيش" },
  { key: "fail-hist", label: "Failure History", labelAr: "سجل الأعطال" },
  { key: "spares", label: "Spare Parts", labelAr: "قطع الغيار" },
  { key: "lube", label: "Lubrication", labelAr: "التزييت" },
  { key: "oil", label: "Oil Information", labelAr: "معلومات الزيت" },
  { key: "bearings", label: "Bearings", labelAr: "الكراسي" },
  { key: "manuals", label: "Manuals", labelAr: "الأدلة" },
  { key: "datasheets", label: "Datasheets", labelAr: "الجداول الفنية" },
  { key: "pid", label: "P&ID", labelAr: "P&ID", route: "/ots" },
  { key: "photos", label: "Photos", labelAr: "الصور" },
  { key: "videos", label: "Videos", labelAr: "الفيديو" },
  { key: "pdf", label: "PDF Archive", labelAr: "أرشيف PDF" },
];

const MAINT_SPARES_MODULES: PlantModule[] = [
  { key: "inventory", label: "Spare Parts Inventory", labelAr: "مخزون قطع الغيار" },
  { key: "available", label: "Available Quantity", labelAr: "الكمية المتاحة" },
  { key: "reserved", label: "Reserved Parts", labelAr: "القطع المحجوزة" },
  { key: "requested", label: "Requested Parts", labelAr: "القطع المطلوبة" },
  { key: "purchase", label: "Purchase Requests", labelAr: "طلبات الشراء" },
  { key: "suppliers", label: "Suppliers", labelAr: "الموردون" },
  { key: "reports", label: "Reports", labelAr: "التقارير", route: "/bi" },
];

const MAINT_REPORTS_MODULES: PlantModule[] = [
  { key: "daily", label: "Daily Reports", labelAr: "التقارير اليومية" },
  { key: "weekly", label: "Weekly Reports", labelAr: "التقارير الأسبوعية" },
  { key: "monthly", label: "Monthly Reports", labelAr: "التقارير الشهرية" },
  { key: "equipment", label: "Equipment Reports", labelAr: "تقارير المعدات" },
  { key: "failure", label: "Failure Reports", labelAr: "تقارير الأعطال" },
  { key: "shutdown", label: "Shutdown Reports", labelAr: "تقارير التوقفات" },
  { key: "kpi", label: "KPI Reports", labelAr: "تقارير مؤشرات الأداء" },
  { key: "bi", label: "BI Dashboard", labelAr: "لوحة BI", route: "/bi" },
];

export function getModulesForPlant(code: string): PlantModule[] {
  const c = code.toUpperCase();
  if (c.startsWith("MNT-PLAN")) return MAINT_PLANNING_MODULES;
  if (c.startsWith("MNT-WORKSHOP")) return MAINT_WORKSHOP_MODULES;
  if (c.startsWith("MNT-WO")) return MAINT_WO_MODULES;
  if (c.startsWith("MNT-EQ")) return MAINT_EQUIPMENT_MODULES;
  if (c.startsWith("MNT-SPARES")) return MAINT_SPARES_MODULES;
  if (c.startsWith("MNT-REP")) return MAINT_REPORTS_MODULES;
  if (c.startsWith("MNT-")) return MAINT_PLANT_MODULES;
  if (c.startsWith("LAB-AMM")) return LAB_AMMONIA_MODULES;
  if (c.startsWith("LAB-UREA")) return LAB_UREA_MODULES;
  if (c.startsWith("LAB-EQ")) return LAB_EQUIPMENT_MODULES;
  if (c.startsWith("LAB-CHEM")) return LAB_CHEM_STORE_MODULES;
  if (c.startsWith("LAB-REP")) return LAB_REPORTS_MODULES;
  if (c.startsWith("AMM-STORAGE") || c.includes("STORAGE")) return AMMONIA_STORAGE_MODULES;
  if (c.startsWith("UREA-LOAD")) return UREA_LOADING_MODULES;
  if (c.startsWith("AMM-LOAD")) return AMMONIA_LOADING_MODULES;
  if (c.startsWith("UREA")) return UREA_MODULES;
  if (c.startsWith("WATER") || c.startsWith("WTU")) return WATER_MODULES;
  if (c.startsWith("AMM")) return AMMONIA_MODULES;
  if (c.startsWith("N2") || c.includes("NITROGEN")) return NITROGEN_MODULES;
  if (c.startsWith("DEMIN")) return DEMIN_MODULES;
  if (c.startsWith("PROC")) return PROC_ENG_MODULES;
  return AMMONIA_MODULES;
}
