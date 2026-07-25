export interface Department {
  id: string;
  label: string;
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
    daily: ["pH", "Conductivity", "Hardness", "Dew Point", "N2 Purity", "O2", "Pressure", "Temp", "Flow Rate", "Moisture", "Compressor Oil"],
    weekly: ["Oil Content", "Filter Condition", "Oxygen Analyzer Check", "Nitrogen Purity Check", "Moisture Analyzer"],
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

export const DEPARTMENTS: Department[] = [
  {
    id: "AMMONIA",
    label: "AMMONIA",
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
    pin: "1002",
    color: "from-emerald-500/20 to-teal-600/20",
    tags: ["UREA REACTOR", "PRILLING TOWER", "CO2 COMPRESSOR", "UREA PUMP"],
  },
  {
    id: "LAB",
    label: "LABORATORY",
    pin: "1003",
    color: "from-violet-500/20 to-purple-600/20",
    tags: [],
  },
  {
    id: "MAINTENANCE",
    label: "MAINTENANCE",
    pin: "1004",
    color: "from-amber-500/20 to-orange-600/20",
    tags: [
      ...AMMONIA_ASSETS, ...UTILITIES_ASSETS, ...ELECTRICAL_AIR_ASSETS, ...KEY_EQUIPMENT,
    ],
  },
  {
    id: "WAREHOUSE",
    label: "WAREHOUSE",
    pin: "1005",
    color: "from-orange-500/20 to-red-600/20",
    tags: [],
  },
  {
    id: "HSE",
    label: "HSE (SAFETY)",
    pin: "1007",
    color: "from-red-500/20 to-rose-600/20",
    tags: [],
  },
  {
    id: "MATERIALS",
    label: "MATERIALS MGMT",
    pin: "1008",
    color: "from-yellow-500/20 to-amber-600/20",
    tags: [],
  },
  {
    id: "TECHAFFAIRS",
    label: "TECHNICAL AFFAIRS",
    pin: "1009",
    color: "from-fuchsia-500/20 to-pink-600/20",
    tags: [],
  },
];

export function getDepartmentByPin(pin: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.pin === pin);
}

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}
