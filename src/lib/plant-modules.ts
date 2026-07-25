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
  { key: "digital-library", label: "Digital Library ⭐", labelAr: "المكتبة الرقمية ⭐", route: "/digital-library" },
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

// ============= HSE (Safety & OHS) modules =============
const HSE_DASHBOARD_MODULES: PlantModule[] = [
  { key: "live", label: "Live Safety Dashboard", labelAr: "لوحة السلامة المباشرة", route: "/dashboard" },
  { key: "kpi", label: "Safety KPIs", labelAr: "مؤشرات السلامة" },
  { key: "lti", label: "Days Without LTI", labelAr: "أيام بدون إصابات" },
  { key: "permits", label: "Active Work Permits", labelAr: "تصاريح العمل النشطة" },
  { key: "incidents", label: "Open Incidents", labelAr: "الحوادث المفتوحة" },
  { key: "alerts", label: "Safety Alerts", labelAr: "تنبيهات السلامة" },
  { key: "emergency", label: "Emergency Status", labelAr: "حالة الطوارئ" },
  { key: "stats", label: "Safety Statistics", labelAr: "إحصائيات السلامة" },
];

const HSE_PTW_MODULES: PlantModule[] = [
  { key: "hot", label: "Hot Work Permit", labelAr: "تصريح عمل ساخن" },
  { key: "cold", label: "Cold Work Permit", labelAr: "تصريح عمل بارد" },
  { key: "confined", label: "Confined Space Permit", labelAr: "تصريح الأماكن المغلقة" },
  { key: "electrical", label: "Electrical Work Permit", labelAr: "تصريح عمل كهربائي" },
  { key: "excavation", label: "Excavation Permit", labelAr: "تصريح حفر" },
  { key: "height", label: "Working at Height Permit", labelAr: "تصريح العمل على ارتفاع" },
  { key: "lifting", label: "Lifting Operation Permit", labelAr: "تصريح رفع" },
  { key: "line-break", label: "Line Breaking Permit", labelAr: "تصريح فتح خطوط" },
  { key: "approval", label: "Permit Approval", labelAr: "اعتماد التصاريح" },
  { key: "history", label: "Permit History", labelAr: "سجل التصاريح" },
  { key: "archive", label: "Permit Archive", labelAr: "أرشيف التصاريح" },
];

const HSE_INCIDENT_MODULES: PlantModule[] = [
  { key: "report", label: "Incident Reporting", labelAr: "تبليغ الحوادث" },
  { key: "nearmiss", label: "Near Miss Reporting", labelAr: "تبليغ الحوادث الوشيكة" },
  { key: "investigation", label: "Accident Investigation", labelAr: "التحقيق في الحوادث" },
  { key: "rca", label: "Root Cause Analysis", labelAr: "تحليل السبب الجذري" },
  { key: "corrective", label: "Corrective Actions", labelAr: "الإجراءات التصحيحية" },
  { key: "preventive", label: "Preventive Actions", labelAr: "الإجراءات الوقائية" },
  { key: "stats", label: "Incident Statistics", labelAr: "إحصائيات الحوادث" },
];

const HSE_RISK_MODULES: PlantModule[] = [
  { key: "hazid", label: "Hazard Identification", labelAr: "تحديد المخاطر" },
  { key: "assessment", label: "Risk Assessment", labelAr: "تقييم المخاطر" },
  { key: "jsa", label: "Job Safety Analysis (JSA)", labelAr: "تحليل سلامة العمل" },
  { key: "matrix", label: "Risk Matrix", labelAr: "مصفوفة المخاطر" },
  { key: "controls", label: "Control Measures", labelAr: "إجراءات التحكم" },
  { key: "register", label: "Risk Register", labelAr: "سجل المخاطر" },
];

const HSE_LOTO_MODULES: PlantModule[] = [
  { key: "lockout", label: "Lockout Procedures", labelAr: "إجراءات الإقفال" },
  { key: "tagout", label: "Tagout Procedures", labelAr: "إجراءات الوسم" },
  { key: "isolation", label: "Isolation Records", labelAr: "سجلات العزل" },
  { key: "checklists", label: "LOTO Checklists", labelAr: "قوائم التحقق" },
  { key: "history", label: "LOTO History", labelAr: "سجل LOTO" },
];

const HSE_FIRE_MODULES: PlantModule[] = [
  { key: "extinguishers", label: "Fire Extinguishers", labelAr: "طفايات الحريق" },
  { key: "hydrants", label: "Fire Hydrants", labelAr: "حنفيات الحريق" },
  { key: "pumps", label: "Fire Pumps", labelAr: "مضخات الحريق" },
  { key: "alarm", label: "Fire Alarm System", labelAr: "نظام إنذار الحريق" },
  { key: "schedule", label: "Inspection Schedule", labelAr: "جدول التفتيش" },
  { key: "maint-hist", label: "Maintenance History", labelAr: "سجل الصيانة" },
  { key: "certs", label: "Certificates", labelAr: "الشهادات" },
];

const HSE_GAS_MODULES: PlantModule[] = [
  { key: "fixed", label: "Fixed Gas Detectors", labelAr: "كاشفات ثابتة" },
  { key: "portable", label: "Portable Gas Detectors", labelAr: "كاشفات محمولة" },
  { key: "calibration", label: "Calibration Records", labelAr: "سجلات المعايرة" },
  { key: "results", label: "Gas Test Results", labelAr: "نتائج فحص الغاز" },
  { key: "alarms", label: "Alarm History", labelAr: "سجل الإنذارات" },
];

const HSE_PPE_MODULES: PlantModule[] = [
  { key: "inventory", label: "PPE Inventory", labelAr: "مخزون معدات الوقاية" },
  { key: "distribution", label: "PPE Distribution", labelAr: "توزيع معدات الوقاية" },
  { key: "inspection", label: "PPE Inspection", labelAr: "تفتيش المعدات" },
  { key: "replacement", label: "PPE Replacement", labelAr: "استبدال المعدات" },
  { key: "reports", label: "PPE Reports", labelAr: "التقارير", route: "/bi" },
];

const HSE_EMERGENCY_MODULES: PlantModule[] = [
  { key: "plans", label: "Emergency Plans", labelAr: "خطط الطوارئ" },
  { key: "contacts", label: "Emergency Contacts", labelAr: "جهات اتصال الطوارئ" },
  { key: "maps", label: "Evacuation Maps", labelAr: "خرائط الإخلاء" },
  { key: "drills", label: "Emergency Drills", labelAr: "التدريبات" },
  { key: "assembly", label: "Assembly Points", labelAr: "نقاط التجمع" },
  { key: "reports", label: "Emergency Reports", labelAr: "التقارير" },
];

const HSE_INSPECTION_MODULES: PlantModule[] = [
  { key: "daily", label: "Daily Inspection", labelAr: "تفتيش يومي" },
  { key: "weekly", label: "Weekly Inspection", labelAr: "تفتيش أسبوعي" },
  { key: "monthly", label: "Monthly Inspection", labelAr: "تفتيش شهري" },
  { key: "audit", label: "Audit Checklist", labelAr: "قائمة التدقيق" },
  { key: "findings", label: "Findings", labelAr: "الملاحظات" },
  { key: "corrective", label: "Corrective Actions", labelAr: "الإجراءات التصحيحية" },
];

const HSE_ENV_MODULES: PlantModule[] = [
  { key: "air", label: "Air Monitoring", labelAr: "مراقبة الهواء" },
  { key: "water", label: "Water Monitoring", labelAr: "مراقبة المياه" },
  { key: "waste", label: "Waste Management", labelAr: "إدارة النفايات" },
  { key: "reports", label: "Environmental Reports", labelAr: "التقارير البيئية" },
  { key: "compliance", label: "Compliance Records", labelAr: "سجلات الامتثال" },
];

const HSE_TRAINING_MODULES: PlantModule[] = [
  { key: "schedule", label: "Training Schedule", labelAr: "جدول التدريب" },
  { key: "records", label: "Training Records", labelAr: "سجلات التدريب" },
  { key: "certs", label: "Certificates", labelAr: "الشهادات" },
  { key: "matrix", label: "Competency Matrix", labelAr: "مصفوفة الكفاءات" },
  { key: "expired", label: "Expired Certificates", labelAr: "الشهادات المنتهية" },
];

const HSE_MEDICAL_MODULES: PlantModule[] = [
  { key: "exam", label: "Medical Examination", labelAr: "الفحص الطبي" },
  { key: "firstaid", label: "First Aid Cases", labelAr: "حالات الإسعاف الأولي" },
  { key: "reports", label: "Medical Reports", labelAr: "التقارير الطبية" },
  { key: "fitness", label: "Fitness for Work", labelAr: "اللياقة للعمل" },
  { key: "vaccination", label: "Vaccination Records", labelAr: "سجلات التطعيم" },
];

const HSE_REPORTS_MODULES: PlantModule[] = [
  { key: "daily", label: "Daily Reports", labelAr: "التقارير اليومية" },
  { key: "weekly", label: "Weekly Reports", labelAr: "التقارير الأسبوعية" },
  { key: "monthly", label: "Monthly Reports", labelAr: "التقارير الشهرية" },
  { key: "incident", label: "Incident Reports", labelAr: "تقارير الحوادث" },
  { key: "audit", label: "Audit Reports", labelAr: "تقارير التدقيق" },
  { key: "inspection", label: "Inspection Reports", labelAr: "تقارير التفتيش" },
  { key: "env", label: "Environmental Reports", labelAr: "التقارير البيئية" },
  { key: "kpi", label: "KPI Reports", labelAr: "تقارير المؤشرات" },
  { key: "bi", label: "BI Dashboard", labelAr: "لوحة BI", route: "/bi" },
];

// ============= Materials Management Department =============
const MAT_DASHBOARD_MODULES: PlantModule[] = [
  { key: "overview", label: "Materials Overview", labelAr: "نظرة عامة" },
  { key: "inventory", label: "Live Inventory Status", labelAr: "المخزون المباشر" },
  { key: "critical", label: "Critical Stock", labelAr: "المخزون الحرج" },
  { key: "requests", label: "Purchase Requests", labelAr: "طلبات الشراء" },
  { key: "orders", label: "Purchase Orders", labelAr: "أوامر الشراء" },
  { key: "pending", label: "Pending Deliveries", labelAr: "التسليمات المعلقة" },
  { key: "consumption", label: "Material Consumption", labelAr: "استهلاك المواد" },
  { key: "supplier-perf", label: "Supplier Performance", labelAr: "أداء الموردين" },
  { key: "cost", label: "Material Cost Analysis", labelAr: "تحليل التكاليف" },
  { key: "stats", label: "Monthly Statistics", labelAr: "الإحصائيات الشهرية" },
  { key: "notifications", label: "Notifications", labelAr: "التنبيهات" },
];

const MAT_PR_MODULES: PlantModule[] = [
  { key: "create", label: "Create Request", labelAr: "إنشاء طلب" },
  { key: "approve", label: "Request Approval", labelAr: "اعتماد الطلب" },
  { key: "emergency", label: "Emergency Request", labelAr: "طلب طارئ" },
  { key: "dept", label: "Department Requests", labelAr: "طلبات الإدارات" },
  { key: "tracking", label: "Request Tracking", labelAr: "تتبع الطلبات" },
  { key: "history", label: "Request History", labelAr: "سجل الطلبات" },
  { key: "cancel", label: "Cancel Request", labelAr: "إلغاء الطلب" },
  { key: "docs", label: "Attach Documents", labelAr: "إرفاق المستندات" },
];

const MAT_PO_MODULES: PlantModule[] = [
  { key: "create", label: "Create Purchase Order", labelAr: "إنشاء أمر شراء" },
  { key: "approve", label: "Purchase Approval", labelAr: "اعتماد الشراء" },
  { key: "tracking", label: "Purchase Tracking", labelAr: "تتبع الشراء" },
  { key: "schedule", label: "Delivery Schedule", labelAr: "جدول التسليم" },
  { key: "open", label: "Open Orders", labelAr: "الأوامر المفتوحة" },
  { key: "closed", label: "Closed Orders", labelAr: "الأوامر المغلقة" },
  { key: "history", label: "Purchase History", labelAr: "سجل المشتريات" },
];

const MAT_SUPPLIER_MODULES: PlantModule[] = [
  { key: "list", label: "Suppliers List", labelAr: "قائمة الموردين" },
  { key: "info", label: "Supplier Information", labelAr: "معلومات المورد" },
  { key: "approved", label: "Approved Suppliers", labelAr: "الموردون المعتمدون" },
  { key: "evaluation", label: "Vendor Evaluation", labelAr: "تقييم المورد" },
  { key: "performance", label: "Supplier Performance", labelAr: "أداء الموردين" },
  { key: "contracts", label: "Contracts", labelAr: "العقود" },
  { key: "contact", label: "Contact Information", labelAr: "بيانات الاتصال" },
  { key: "docs", label: "Supplier Documents", labelAr: "مستندات المورد" },
];

const MAT_RECEIVING_MODULES: PlantModule[] = [
  { key: "goods", label: "Goods Receiving", labelAr: "استلام البضائع" },
  { key: "inspection", label: "Receiving Inspection", labelAr: "فحص الاستلام" },
  { key: "notes", label: "Delivery Notes", labelAr: "بيانات التسليم" },
  { key: "qty", label: "Quantity Verification", labelAr: "التحقق من الكمية" },
  { key: "quality", label: "Quality Verification", labelAr: "التحقق من الجودة" },
  { key: "accepted", label: "Accepted Materials", labelAr: "المواد المقبولة" },
  { key: "rejected", label: "Rejected Materials", labelAr: "المواد المرفوضة" },
  { key: "reports", label: "Receiving Reports", labelAr: "تقارير الاستلام" },
];

const MAT_INSPECTION_MODULES: PlantModule[] = [
  { key: "technical", label: "Technical Inspection", labelAr: "الفحص الفني" },
  { key: "quality", label: "Quality Inspection", labelAr: "فحص الجودة" },
  { key: "verify", label: "Material Verification", labelAr: "التحقق من المواد" },
  { key: "reports", label: "Inspection Reports", labelAr: "تقارير الفحص" },
  { key: "ncr", label: "NCR", labelAr: "تقارير عدم المطابقة" },
  { key: "approve", label: "Approval", labelAr: "الاعتماد" },
];

const MAT_INVENTORY_MODULES: PlantModule[] = [
  { key: "overview", label: "Inventory Overview", labelAr: "نظرة عامة على المخزون" },
  { key: "available", label: "Available Stock", labelAr: "المخزون المتاح" },
  { key: "reserved", label: "Reserved Stock", labelAr: "المخزون المحجوز" },
  { key: "incoming", label: "Incoming Stock", labelAr: "المخزون الوارد" },
  { key: "outgoing", label: "Outgoing Stock", labelAr: "المخزون الصادر" },
  { key: "value", label: "Inventory Value", labelAr: "قيمة المخزون" },
  { key: "locations", label: "Stock Locations", labelAr: "مواقع المخزون" },
  { key: "map", label: "Warehouse Mapping", labelAr: "خريطة المستودع" },
];

const MAT_CATEGORIES_MODULES: PlantModule[] = [
  { key: "mech", label: "Mechanical Spare Parts", labelAr: "قطع غيار ميكانيكية" },
  { key: "elec", label: "Electrical Spare Parts", labelAr: "قطع غيار كهربائية" },
  { key: "inst", label: "Instrumentation Parts", labelAr: "قطع أجهزة القياس" },
  { key: "safety", label: "Safety Equipment", labelAr: "معدات السلامة" },
  { key: "chem", label: "Chemicals", labelAr: "المواد الكيميائية" },
  { key: "lube", label: "Lubricants", labelAr: "زيوت التشحيم" },
  { key: "pipes", label: "Pipes & Fittings", labelAr: "الأنابيب والوصلات" },
  { key: "valves", label: "Valves", labelAr: "الصمامات" },
  { key: "bearings", label: "Bearings", labelAr: "المحامل" },
  { key: "gaskets", label: "Gaskets", labelAr: "الحشوات" },
  { key: "fasteners", label: "Fasteners", labelAr: "المثبتات" },
  { key: "filters", label: "Filters", labelAr: "الفلاتر" },
  { key: "motors", label: "Motors", labelAr: "المحركات" },
  { key: "pumps", label: "Pumps", labelAr: "المضخات" },
  { key: "compressors", label: "Compressors", labelAr: "الضواغط" },
  { key: "office", label: "Office Supplies", labelAr: "لوازم مكتبية" },
  { key: "consumables", label: "General Consumables", labelAr: "مستهلكات عامة" },
];

const MAT_CARD_MODULES: PlantModule[] = [
  { key: "search", label: "Material Search", labelAr: "بحث عن المواد" },
  { key: "browse", label: "Browse Materials", labelAr: "تصفح المواد" },
  { key: "add", label: "Add New Material", labelAr: "إضافة مادة" },
  { key: "barcode", label: "Barcode / QR", labelAr: "الباركود" },
  { key: "specs", label: "Technical Specifications", labelAr: "المواصفات الفنية" },
  { key: "datasheet", label: "Datasheets", labelAr: "الجداول الفنية" },
  { key: "certs", label: "Material Certificates", labelAr: "شهادات المواد" },
  { key: "msds", label: "SDS / MSDS", labelAr: "بيانات السلامة" },
  { key: "photos", label: "Photos", labelAr: "الصور" },
  { key: "history", label: "Material History", labelAr: "سجل المادة" },
];

const MAT_PLANNING_MODULES: PlantModule[] = [
  { key: "min", label: "Minimum Stock", labelAr: "الحد الأدنى" },
  { key: "max", label: "Maximum Stock", labelAr: "الحد الأقصى" },
  { key: "reorder", label: "Reorder Point", labelAr: "نقطة إعادة الطلب" },
  { key: "consumption", label: "Consumption Analysis", labelAr: "تحليل الاستهلاك" },
  { key: "forecast", label: "Stock Forecast", labelAr: "توقعات المخزون" },
  { key: "planning", label: "Material Planning", labelAr: "تخطيط المواد" },
];

const MAT_TRANSFER_MODULES: PlantModule[] = [
  { key: "internal", label: "Internal Transfer", labelAr: "تحويل داخلي" },
  { key: "plant", label: "Plant Transfer", labelAr: "تحويل بين المصانع" },
  { key: "warehouse", label: "Warehouse Transfer", labelAr: "تحويل بين المستودعات" },
  { key: "history", label: "Transfer History", labelAr: "سجل التحويلات" },
];

const MAT_ISSUE_MODULES: PlantModule[] = [
  { key: "request", label: "Material Request", labelAr: "طلب صرف" },
  { key: "approve", label: "Material Approval", labelAr: "اعتماد الصرف" },
  { key: "issue", label: "Material Issue", labelAr: "صرف المواد" },
  { key: "dept", label: "Department Issue", labelAr: "صرف للإدارات" },
  { key: "equipment", label: "Equipment Issue", labelAr: "صرف للمعدات" },
  { key: "history", label: "Issue History", labelAr: "سجل الصرف" },
];

const MAT_RETURN_MODULES: PlantModule[] = [
  { key: "return", label: "Return Material", labelAr: "إرجاع المواد" },
  { key: "inspection", label: "Return Inspection", labelAr: "فحص المرتجعات" },
  { key: "history", label: "Return History", labelAr: "سجل الإرجاع" },
];

const MAT_COST_MODULES: PlantModule[] = [
  { key: "cost", label: "Material Cost", labelAr: "تكلفة المواد" },
  { key: "purchase", label: "Purchase Cost", labelAr: "تكلفة الشراء" },
  { key: "avg", label: "Average Cost", labelAr: "متوسط التكلفة" },
  { key: "consumption", label: "Total Consumption", labelAr: "إجمالي الاستهلاك" },
  { key: "analysis", label: "Cost Analysis", labelAr: "تحليل التكاليف" },
];

const MAT_REPORTS_MODULES: PlantModule[] = [
  { key: "daily", label: "Daily Reports", labelAr: "التقارير اليومية" },
  { key: "weekly", label: "Weekly Reports", labelAr: "التقارير الأسبوعية" },
  { key: "monthly", label: "Monthly Reports", labelAr: "التقارير الشهرية" },
  { key: "inventory", label: "Inventory Reports", labelAr: "تقارير المخزون" },
  { key: "purchase", label: "Purchase Reports", labelAr: "تقارير المشتريات" },
  { key: "supplier", label: "Supplier Reports", labelAr: "تقارير الموردين" },
  { key: "consumption", label: "Consumption Reports", labelAr: "تقارير الاستهلاك" },
  { key: "cost", label: "Cost Reports", labelAr: "تقارير التكاليف" },
  { key: "kpi", label: "KPI Reports", labelAr: "تقارير المؤشرات" },
  { key: "bi", label: "BI Dashboard", labelAr: "لوحة BI", route: "/bi" },
];

// ============= Technical Affairs Department =============
const TA_DASHBOARD_MODULES: PlantModule[] = [
  { key: "dashboard", label: "Technical Dashboard", labelAr: "لوحة القيادة الفنية" },
  { key: "projects", label: "Active Projects", labelAr: "المشاريع النشطة" },
  { key: "requests", label: "Engineering Requests", labelAr: "الطلبات الهندسية" },
  { key: "mods", label: "Plant Modifications", labelAr: "تعديلات المصنع" },
  { key: "studies", label: "Technical Studies", labelAr: "الدراسات الفنية" },
  { key: "kpi", label: "Engineering KPIs", labelAr: "المؤشرات الهندسية" },
  { key: "tasks", label: "Open Tasks", labelAr: "المهام المفتوحة" },
  { key: "notifications", label: "Notifications", labelAr: "التنبيهات" },
];

const TA_PROCESS_MODULES: PlantModule[] = [
  { key: "calc", label: "Process Calculations", labelAr: "حسابات العمليات" },
  { key: "monitor", label: "Process Monitoring", labelAr: "مراقبة العمليات" },
  { key: "optimize", label: "Process Optimization", labelAr: "تحسين العمليات" },
  { key: "performance", label: "Plant Performance", labelAr: "أداء المصنع" },
  { key: "mass", label: "Mass Balance", labelAr: "توازن الكتلة" },
  { key: "energy", label: "Energy Balance", labelAr: "توازن الطاقة" },
  { key: "utility", label: "Utility Analysis", labelAr: "تحليل المرافق" },
  { key: "reports", label: "Process Reports", labelAr: "تقارير العمليات" },
];

const TA_DOCS_MODULES: PlantModule[] = [
  { key: "pfd", label: "PFD Library", labelAr: "مكتبة PFD" },
  { key: "pid", label: "P&ID Library", labelAr: "مكتبة P&ID" },
  { key: "iso", label: "Isometric Drawings", labelAr: "الرسومات الأيزومترية" },
  { key: "ga", label: "General Arrangement Drawings", labelAr: "رسومات الترتيب العام" },
  { key: "equipment", label: "Equipment Drawings", labelAr: "رسومات المعدات" },
  { key: "instrument", label: "Instrument Drawings", labelAr: "رسومات الأجهزة" },
  { key: "electrical", label: "Electrical Drawings", labelAr: "الرسومات الكهربائية" },
  { key: "civil", label: "Civil Drawings", labelAr: "الرسومات المدنية" },
  { key: "standards", label: "Engineering Standards", labelAr: "المعايير الهندسية" },
];

const TA_LIBRARY_MODULES: PlantModule[] = [
  { key: "operating", label: "Operating Manuals", labelAr: "أدلة التشغيل" },
  { key: "maintenance", label: "Maintenance Manuals", labelAr: "أدلة الصيانة" },
  { key: "vendor", label: "Vendor Manuals", labelAr: "أدلة الموردين" },
  { key: "datasheets", label: "Datasheets", labelAr: "الجداول الفنية" },
  { key: "specs", label: "Technical Specifications", labelAr: "المواصفات الفنية" },
  { key: "design", label: "Design Documents", labelAr: "وثائق التصميم" },
  { key: "intl", label: "International Standards", labelAr: "المعايير الدولية" },
  { key: "procedures", label: "Engineering Procedures", labelAr: "الإجراءات الهندسية" },
];

const TA_MOC_MODULES: PlantModule[] = [
  { key: "new", label: "New MOC", labelAr: "طلب تعديل جديد" },
  { key: "approve", label: "MOC Approval", labelAr: "اعتماد التعديل" },
  { key: "workflow", label: "MOC Workflow", labelAr: "سير العمل" },
  { key: "risk", label: "Risk Assessment", labelAr: "تقييم المخاطر" },
  { key: "review", label: "Engineering Review", labelAr: "المراجعة الهندسية" },
  { key: "implement", label: "Implementation Status", labelAr: "حالة التنفيذ" },
  { key: "history", label: "MOC History", labelAr: "سجل التعديلات" },
];

const TA_PROJECTS_MODULES: PlantModule[] = [
  { key: "planning", label: "Project Planning", labelAr: "تخطيط المشروع" },
  { key: "schedule", label: "Project Schedule", labelAr: "الجدول الزمني" },
  { key: "budget", label: "Budget", labelAr: "الميزانية" },
  { key: "resources", label: "Resources", labelAr: "الموارد" },
  { key: "progress", label: "Progress Monitoring", labelAr: "متابعة التقدم" },
  { key: "milestones", label: "Milestones", labelAr: "المعالم" },
  { key: "reports", label: "Technical Reports", labelAr: "التقارير الفنية" },
];

const TA_PERFORMANCE_MODULES: PlantModule[] = [
  { key: "production", label: "Production Efficiency", labelAr: "كفاءة الإنتاج" },
  { key: "energy", label: "Energy Consumption", labelAr: "استهلاك الطاقة" },
  { key: "utility", label: "Utility Consumption", labelAr: "استهلاك المرافق" },
  { key: "equipment", label: "Equipment Performance", labelAr: "أداء المعدات" },
  { key: "kpi", label: "Process KPIs", labelAr: "مؤشرات العمليات" },
  { key: "improve", label: "Improvement Opportunities", labelAr: "فرص التحسين" },
];

const TA_CALC_MODULES: PlantModule[] = [
  { key: "hydraulic", label: "Hydraulic Calculations", labelAr: "الحسابات الهيدروليكية" },
  { key: "pipe", label: "Pipe Sizing", labelAr: "تحجيم الأنابيب" },
  { key: "pump", label: "Pump Calculations", labelAr: "حسابات المضخات" },
  { key: "compressor", label: "Compressor Calculations", labelAr: "حسابات الضواغط" },
  { key: "hx", label: "Heat Exchanger Calculations", labelAr: "حسابات المبادلات الحرارية" },
  { key: "dp", label: "Pressure Drop", labelAr: "هبوط الضغط" },
  { key: "valve", label: "Valve Sizing", labelAr: "تحجيم الصمامات" },
];

const TA_REPORTS_MODULES: PlantModule[] = [
  { key: "daily", label: "Daily Reports", labelAr: "التقارير اليومية" },
  { key: "weekly", label: "Weekly Reports", labelAr: "التقارير الأسبوعية" },
  { key: "monthly", label: "Monthly Reports", labelAr: "التقارير الشهرية" },
  { key: "studies", label: "Engineering Studies", labelAr: "الدراسات الهندسية" },
  { key: "evaluation", label: "Technical Evaluation", labelAr: "التقييم الفني" },
  { key: "mods", label: "Modification Reports", labelAr: "تقارير التعديلات" },
  { key: "performance", label: "Performance Reports", labelAr: "تقارير الأداء" },
  { key: "bi", label: "BI Dashboard", labelAr: "لوحة BI", route: "/bi" },
];

const TA_DOCMGMT_MODULES: PlantModule[] = [
  { key: "pdf", label: "PDF Archive", labelAr: "أرشيف PDF" },
  { key: "drawings", label: "Drawings", labelAr: "الرسومات" },
  { key: "photos", label: "Photos", labelAr: "الصور" },
  { key: "videos", label: "Videos", labelAr: "الفيديو" },
  { key: "files", label: "Technical Files", labelAr: "الملفات الفنية" },
  { key: "revision", label: "Revision Control", labelAr: "التحكم في الإصدارات" },
  { key: "history", label: "Version History", labelAr: "سجل الإصدارات" },
];

export function getModulesForPlant(code: string): PlantModule[] {
  const c = code.toUpperCase();
  if (c.startsWith("TA-DASH")) return TA_DASHBOARD_MODULES;
  if (c.startsWith("TA-PROC")) return TA_PROCESS_MODULES;
  if (c.startsWith("TA-DOCS")) return TA_DOCS_MODULES;
  if (c.startsWith("TA-LIB")) return TA_LIBRARY_MODULES;
  if (c.startsWith("TA-MOC")) return TA_MOC_MODULES;
  if (c.startsWith("TA-PROJ")) return TA_PROJECTS_MODULES;
  if (c.startsWith("TA-PERF")) return TA_PERFORMANCE_MODULES;
  if (c.startsWith("TA-CALC")) return TA_CALC_MODULES;
  if (c.startsWith("TA-REP")) return TA_REPORTS_MODULES;
  if (c.startsWith("TA-DOCMGMT")) return TA_DOCMGMT_MODULES;
  if (c.startsWith("MAT-DASH")) return MAT_DASHBOARD_MODULES;
  if (c.startsWith("MAT-PR")) return MAT_PR_MODULES;
  if (c.startsWith("MAT-PO")) return MAT_PO_MODULES;
  if (c.startsWith("MAT-SUP")) return MAT_SUPPLIER_MODULES;
  if (c.startsWith("MAT-RECV")) return MAT_RECEIVING_MODULES;
  if (c.startsWith("MAT-INSP")) return MAT_INSPECTION_MODULES;
  if (c.startsWith("MAT-INV")) return MAT_INVENTORY_MODULES;
  if (c.startsWith("MAT-CAT")) return MAT_CATEGORIES_MODULES;
  if (c.startsWith("MAT-CARD")) return MAT_CARD_MODULES;
  if (c.startsWith("MAT-PLAN")) return MAT_PLANNING_MODULES;
  if (c.startsWith("MAT-TRANS")) return MAT_TRANSFER_MODULES;
  if (c.startsWith("MAT-ISSUE")) return MAT_ISSUE_MODULES;
  if (c.startsWith("MAT-RET")) return MAT_RETURN_MODULES;
  if (c.startsWith("MAT-COST")) return MAT_COST_MODULES;
  if (c.startsWith("MAT-REP")) return MAT_REPORTS_MODULES;
  if (c.startsWith("HSE-DASH")) return HSE_DASHBOARD_MODULES;
  if (c.startsWith("HSE-PTW")) return HSE_PTW_MODULES;
  if (c.startsWith("HSE-INC")) return HSE_INCIDENT_MODULES;
  if (c.startsWith("HSE-RISK")) return HSE_RISK_MODULES;
  if (c.startsWith("HSE-LOTO")) return HSE_LOTO_MODULES;
  if (c.startsWith("HSE-FIRE")) return HSE_FIRE_MODULES;
  if (c.startsWith("HSE-GAS")) return HSE_GAS_MODULES;
  if (c.startsWith("HSE-PPE")) return HSE_PPE_MODULES;
  if (c.startsWith("HSE-EMER")) return HSE_EMERGENCY_MODULES;
  if (c.startsWith("HSE-INSP")) return HSE_INSPECTION_MODULES;
  if (c.startsWith("HSE-ENV")) return HSE_ENV_MODULES;
  if (c.startsWith("HSE-TRAIN")) return HSE_TRAINING_MODULES;
  if (c.startsWith("HSE-MED")) return HSE_MEDICAL_MODULES;
  if (c.startsWith("HSE-REP")) return HSE_REPORTS_MODULES;
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

