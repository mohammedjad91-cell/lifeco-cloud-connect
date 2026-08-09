export interface Department {
  id: string;
  label: string;
  labelAr?: string;
  pin: string;
  tags: string[];
  icon?: string;
  color?: string;
}

// =====================================================================
// LAB PARAMETERS — extended per official log to include
// pH / Conductivity / Hardness / Dew Point on every relevant unit.
// =====================================================================
export const LAB_PARAMETERS: Record<string, Record<string, string[]>> = {
  AMM1: {
    daily: [
      "pH", "Conductivity", "Hardness", "Dew Point",
      "NH3", "H2", "N2", "CH4", "CO", "CO2", "O2",
      "Temp", "Pressure", "Steam Pressure",
    ],
    weekly: ["Oil & Grease", "Iron", "Silica", "Hardness", "Chlorides", "Sulfates", "TDS", "Alkalinity"],
  },
  AMM2: {
    daily: [
      "pH", "Conductivity", "Hardness", "Dew Point",
      "NH3", "H2", "N2", "CH4", "CO", "CO2", "O2",
      "Temp", "Pressure", "Steam Flow",
    ],
    weekly: ["Oil & Grease", "Iron", "Silica", "Hardness", "Chlorides", "Sulfates", "TDS", "Alkalinity"],
  },
  NITROGEN: {
    daily: [
      "Oxygen content (60-AL-003)",
      "Main Dew Point (60-AT-001 / 60-AI-001)",
      "N2 Purity %",
      "Instrument Air Moisture",
      "Pressure",
      "Temp",
      "Flow Rate",
      "Compressor Oil"
    ],
    weekly: [
      "Cooling Water Analysis",
      "Air Dryers Oil/Moisture",
      "Filters Condensate",
      "Oxygen Analyzer Check",
      "Nitrogen Purity Check",
      "Moisture Analyzer"
    ],
  },
  DEMIN1: {
    daily: ["pH", "Conductivity", "Hardness", "Dew Point", "Silica", "Chlorides", "TDS", "Temp", "Iron", "Sodium", "Dissolved Oxygen"],
    weekly: ["Sulfates", "Calcium", "Magnesium", "Phosphate", "Oil & Grease", "COD", "BOD", "Alkalinity"],
  },
  DEMIN2: {
    daily: ["pH", "Conductivity", "Hardness", "Dew Point", "Silica", "Chlorides", "TDS", "Temp", "Iron", "Sodium", "Dissolved Oxygen"],
    weekly: ["Sulfates", "Calcium", "Magnesium", "Phosphate", "Oil & Grease", "COD", "BOD", "Alkalinity"],
  },
  UTILITIES: {
    daily: ["pH", "Conductivity", "Hardness", "Dew Point", "Temp", "Pressure", "TDS", "Chlorides"],
    weekly: ["Iron", "Silica", "Sulfates", "Alkalinity", "Oil & Grease"],
  },
};

// =====================================================================
// ASSET REGISTER — Official LIFECO log
// =====================================================================
const AMMONIA_ASSETS = ["AMM1 21340", "AMM2 21152"];
const UTILITIES_ASSETS = ["SEA WATER", "DESAL WATER", "DEMIN-1", "DEMIN-2", "P.COND", "M.COND"];
const ELECTRICAL_AIR_ASSETS = ["ELECTRICAL", "INCOMER-A", "INCOMER-B", "INST AIR", "NITROGEN PLANT"];
const KEY_EQUIPMENT = [
  "60-M-1001A", "60-M-1001B", "60-M-1001C",
  "23-MK-101", "13-MK-101",
  "B-1.9 T-1", "B-2.12 T-2",
];

// Equipment that participates in Field Ops (compressors / pumps / turbines).
export const FIELD_OPS_EQUIPMENT: Record<string, string[]> = {
  AMM1: ["AMM1 21340", "60-M-1001A", "B-1.9 T-1", "B-2.12 T-2", "13-MK-101"],
  AMM2: ["AMM2 21152", "60-M-1001B", "60-M-1001C", "23-MK-101"],
  NITROGEN: ["NITROGEN PLANT", "INST AIR"],
  UTILITIES: ["SEA WATER", "DESAL WATER", "P.COND", "M.COND"],
  DEMIN1: ["DEMIN-1"],
  DEMIN2: ["DEMIN-2"],
  OPERATIONS: [
    ...AMMONIA_ASSETS, ...KEY_EQUIPMENT,
    "NITROGEN PLANT", "INST AIR",
    "SEA WATER", "DESAL WATER", "P.COND", "M.COND",
    "DEMIN-1", "DEMIN-2",
  ],
};

// كل مصانع إدارة الأمونيا واليوريا متاحة داخل عينات المعمل
export const PLANT_GROUPS: { dept: string; deptAr: string; plants: { code: string; ar: string }[] }[] = [
  {
    dept: "AMMONIA", deptAr: "إدارة الأمونيا",
    plants: [
      { code: "AMM1", ar: "مصنع الأمونيا 1" },
      { code: "AMM2", ar: "مصنع الأمونيا 2" },
      { code: "NITROGEN", ar: "مصنع النيتروجين" },
      { code: "DEMIN1", ar: "مصنع الديمن 1" },
      { code: "DEMIN2", ar: "مصنع الديمن 2" },
      { code: "UTILITIES", ar: "الخدمات (Utilities)" },
      { code: "PROC-ENG", ar: "هندسة العمليات" },
    ],
  },
  {
    dept: "UREA", deptAr: "إدارة اليوريا",
    plants: [
      { code: "UREA-1", ar: "مصنع اليوريا 1" },
      { code: "UREA-2", ar: "مصنع اليوريا 2" },
      { code: "AMM-STORAGE", ar: "خزانات الأمونيا" },
      { code: "AMM-LOAD", ar: "تحميل الأمونيا" },
      { code: "UREA-LOAD", ar: "تحميل اليوريا" },
      { code: "WATER-1", ar: "وحدة معالجة المياه" },
    ],
  },
];

export const DEPARTMENTS: Department[] = [
  {
    id: "AMMONIA",
    label: "AMMONIA",
    labelAr: "إدارة الأمونيا",
    pin: "1001",
    color: "from-cyan-500/20 to-blue-600/20",
    tags: [
      ...AMMONIA_ASSETS,
      "60-M-1001A", "60-M-1001B", "60-M-1001C",
      "13-MK-101", "23-MK-101",
      "B-1.9 T-1", "B-2.12 T-2",
    ],
  },
  {
    id: "UREA",
    label: "UREA",
    labelAr: "إدارة اليوريا",
    pin: "1002",
    color: "from-emerald-500/20 to-teal-600/20",
    tags: ["UREA REACTOR", "PRILLING TOWER", "CO2 COMPRESSOR", "UREA PUMP"],
  },
  {
    id: "LAB",
    label: "LABORATORY",
    labelAr: "إدارة المختبرات",
    pin: "1003",
    color: "from-violet-500/20 to-purple-600/20",
    tags: [],
  },
  {
    id: "MAINTENANCE",
    label: "MAINTENANCE",
    labelAr: "إدارة الصيانة",
    pin: "1004",
    color: "from-amber-500/20 to-orange-600/20",
    tags: [
      ...AMMONIA_ASSETS, ...UTILITIES_ASSETS, ...ELECTRICAL_AIR_ASSETS, ...KEY_EQUIPMENT,
    ],
  },
  {
    id: "WAREHOUSE",
    label: "WAREHOUSE",
    labelAr: "إدارة المخازن",
    pin: "1005",
    color: "from-orange-500/20 to-red-600/20",
    tags: [],
  },
  {
    id: "MATERIALS",
    label: "MATERIALS MGMT",
    labelAr: "إدارة المواد",
    pin: "1006",
    color: "from-yellow-500/20 to-amber-600/20",
    tags: [],
  },
  {
    id: "SAFETY",
    label: "SAFETY & OHS",
    labelAr: "إدارة السلامة والصحة المهنية",
    pin: "1007",
    color: "from-red-500/20 to-rose-600/20",
    tags: [],
  },
  {
    id: "TECHNICAL",
    label: "TECHNICAL AFFAIRS",
    labelAr: "إدارة الشؤون الفنية",
    pin: "1008",
    color: "from-sky-500/20 to-indigo-600/20",
    tags: [],
  },
];

export function getDepartmentByPin(pin: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.pin === pin);
}

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}
