// Central navigation taxonomy for the hierarchical LIFECO PMS.
// Home → Department → Plant → Section → Equipment → Details.

export interface HomeItem {
  id: string;
  labelEn: string;
  labelAr: string;
  icon: string;                 // emoji for at-a-glance recognition
  kind: "department" | "center";
  href?: string;                // for centers that map to existing routes
  gradient: string;             // tailwind gradient class fragment
}

export const HOME_DEPARTMENTS: HomeItem[] = [
  { id: "AMMONIA",     labelEn: "Ammonia Department",         labelAr: "قسم الأمونيا",       icon: "🏭", kind: "department", gradient: "from-cyan-500/25 to-blue-600/25" },
  { id: "UREA",        labelEn: "Urea Department",            labelAr: "قسم اليوريا",         icon: "🏭", kind: "department", gradient: "from-emerald-500/25 to-teal-600/25" },
  { id: "LAB",         labelEn: "Laboratory Department",      labelAr: "قسم المختبرات",       icon: "🧪", kind: "department", gradient: "from-violet-500/25 to-purple-600/25" },
  { id: "MAINTENANCE", labelEn: "Maintenance Department",     labelAr: "قسم الصيانة",         icon: "🔧", kind: "department", gradient: "from-amber-500/25 to-orange-600/25" },
  { id: "WAREHOUSE",   labelEn: "Warehouse Department",       labelAr: "قسم المخازن",         icon: "📦", kind: "department", gradient: "from-orange-500/25 to-red-600/25" },
  { id: "MATERIALS",   labelEn: "Materials Management",       labelAr: "إدارة المواد",        icon: "📋", kind: "department", gradient: "from-yellow-500/25 to-amber-600/25" },
  { id: "HSE",         labelEn: "HSE Department",             labelAr: "السلامة والصحة",     icon: "🛡", kind: "department", gradient: "from-red-500/25 to-rose-600/25" },
  { id: "TECHAFFAIRS", labelEn: "Technical Affairs",          labelAr: "الشؤون الفنية",       icon: "⚙",  kind: "department", gradient: "from-fuchsia-500/25 to-pink-600/25" },
];

export const HOME_CENTERS: HomeItem[] = [
  { id: "REPORTS",   labelEn: "Reports Center",   labelAr: "مركز التقارير",    icon: "📊", kind: "center", href: "/bi",         gradient: "from-sky-500/25 to-indigo-600/25" },
  { id: "EQUIPMENT", labelEn: "Equipment Center", labelAr: "مركز المعدات",     icon: "📂", kind: "center", href: "/hierarchy",  gradient: "from-blue-500/25 to-cyan-600/25" },
  { id: "DOCS",      labelEn: "Document Center",  labelAr: "مركز الوثائق",     icon: "📚", kind: "center", href: "/documents",  gradient: "from-slate-500/25 to-gray-600/25" },
  { id: "AI",        labelEn: "AI Center",        labelAr: "مركز الذكاء",      icon: "🤖", kind: "center", href: "/assistant",  gradient: "from-purple-500/25 to-indigo-600/25" },
  { id: "ADMIN",     labelEn: "Administration",   labelAr: "الإدارة",          icon: "⚙",  kind: "center", href: "/admin",      gradient: "from-zinc-500/25 to-slate-700/25" },
  { id: "DEV",       labelEn: "Developer Panel",  labelAr: "لوحة المطور",      icon: "👨‍💻", kind: "center", href: "/admin",   gradient: "from-neutral-500/25 to-stone-700/25" },
];

export function getHomeItem(id: string): HomeItem | undefined {
  return [...HOME_DEPARTMENTS, ...HOME_CENTERS].find((d) => d.id === id);
}

// ---------------------------------------------------------------------------
// Fixed section grid shown on every plant page (Step 3).
// ---------------------------------------------------------------------------

export interface PlantSection {
  id: string;
  labelEn: string;
  labelAr: string;
  icon: string;
  // If set, section deep-links into an existing screen (e.g. dashboard tab).
  deepLink?: (ctx: { deptId: string; plantId: string }) => string;
  disabled?: boolean;
}

export const PLANT_SECTIONS: PlantSection[] = [
  { id: "overview",    labelEn: "Overview",       labelAr: "نظرة عامة",   icon: "📊" },
  { id: "operations",  labelEn: "Operations",     labelAr: "التشغيل",     icon: "⚡", deepLink: ({ plantId }) => `/dashboard?dept=${plantId}&tab=logs` },
  { id: "equipment",   labelEn: "Equipment",      labelAr: "المعدات",     icon: "🔩" },
  { id: "maintenance", labelEn: "Maintenance",    labelAr: "الصيانة",     icon: "🔧", deepLink: ({ plantId }) => `/dashboard?dept=${plantId}&tab=assets` },
  { id: "laboratory",  labelEn: "Laboratory",     labelAr: "المختبر",     icon: "🧪", deepLink: ({ plantId }) => `/dashboard?dept=${plantId}&tab=labReadings` },
  { id: "engineering", labelEn: "Engineering",    labelAr: "الهندسة",     icon: "📐" },
  { id: "documents",   labelEn: "Documents",      labelAr: "الوثائق",     icon: "📄", deepLink: () => `/documents` },
  { id: "reports",     labelEn: "Reports",        labelAr: "التقارير",     icon: "📈", deepLink: ({ plantId }) => `/dashboard?dept=${plantId}&tab=report` },
  { id: "photos",      labelEn: "Photos",         labelAr: "الصور",       icon: "🖼" },
  { id: "pid",         labelEn: "P&ID",           labelAr: "الرسوم",      icon: "🗺" },
  { id: "manuals",     labelEn: "Manuals",        labelAr: "الأدلة",      icon: "📕" },
  { id: "spares",      labelEn: "Spare Parts",    labelAr: "قطع الغيار",  icon: "⚙" },
  { id: "kpis",        labelEn: "KPIs",           labelAr: "المؤشرات",    icon: "📉", deepLink: () => `/bi` },
  { id: "live",        labelEn: "Live Dashboard", labelAr: "لوحة مباشرة", icon: "📡", deepLink: ({ plantId }) => `/dashboard?dept=${plantId}` },
];

// ---------------------------------------------------------------------------
// Equipment profile tabs (Step 5).
// ---------------------------------------------------------------------------

export const EQUIPMENT_TABS = [
  { id: "general",     labelEn: "General",        labelAr: "عام" },
  { id: "specs",       labelEn: "Specifications", labelAr: "المواصفات" },
  { id: "schedule",    labelEn: "Schedule",       labelAr: "الجدولة" },
  { id: "history",     labelEn: "History",        labelAr: "السجل" },
  { id: "inspection",  labelEn: "Inspection",     labelAr: "التفتيش" },
  { id: "lubrication", labelEn: "Lubrication",    labelAr: "التزييت" },
  { id: "oil",         labelEn: "Oil Info",       labelAr: "معلومات الزيت" },
  { id: "spares",      labelEn: "Spare Parts",    labelAr: "قطع الغيار" },
  { id: "manuals",     labelEn: "Manuals",        labelAr: "الأدلة" },
  { id: "photos",      labelEn: "Photos",         labelAr: "الصور" },
  { id: "videos",      labelEn: "Videos",         labelAr: "الفيديو" },
  { id: "drawings",    labelEn: "Drawings",       labelAr: "الرسومات" },
  { id: "datasheets",  labelEn: "Datasheets",     labelAr: "البيانات" },
  { id: "attachments", labelEn: "Attachments",    labelAr: "المرفقات" },
  { id: "reports",     labelEn: "Reports",        labelAr: "التقارير" },
] as const;
