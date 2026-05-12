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
    id: "AMM1",
    label: "AMM 1",
    pin: "1111",
    color: "from-cyan-500/20 to-blue-600/20",
    tags: [
      "AMM1 21340",
      "ELECTRICAL", "B-2.12 T-2", "B-1.9 T-1",
      "60-M-1001A", "13-MK-101",
      "SEA WATER", "DESAL WATER", "NITROGEN PLANT", "INST AIR",
    ],
  },
  {
    id: "AMM2",
    label: "AMM 2",
    pin: "2222",
    color: "from-blue-500/20 to-indigo-600/20",
    tags: [
      "AMM2 21152",
      "INCOMER-A", "INCOMER-B",
      "60-M-1001B", "60-M-1001C",
      "23-MK-101",
      "M.P STEAM", "L.P STEAM",
      "SEA WATER", "DESAL WATER", "NITROGEN PLANT", "INST AIR",
    ],
  },
  {
    id: "UTILITIES",
    label: "UTILITIES",
    pin: "8888",
    color: "from-sky-500/20 to-cyan-600/20",
    tags: [...UTILITIES_ASSETS, "ELECTRICAL", "INST AIR"],
  },
  {
    id: "NITROGEN",
    label: "NITROGEN",
    pin: "3333",
    color: "from-emerald-500/20 to-teal-600/20",
    tags: ["NITROGEN PLANT", "INST AIR", "P.S.A UNIT"],
  },
  {
    id: "DEMIN1",
    label: "DEMIN 1",
    pin: "4444",
    color: "from-amber-500/20 to-orange-600/20",
    tags: ["DEMIN-1", "DESAL WATER", "M.COND", "P.COND"],
  },
  {
    id: "DEMIN2",
    label: "DEMIN 2",
    pin: "5555",
    color: "from-orange-500/20 to-red-600/20",
    tags: ["DEMIN-2", "DESAL WATER", "M.COND", "P.COND"],
  },
  {
    id: "LABORATORY",
    label: "LABORATORY",
    pin: "6666",
    color: "from-purple-500/20 to-pink-600/20",
    tags: [],
  },
  {
    id: "PLANTVIEW",
    label: "PLANT VIEW",
    pin: "7777",
    color: "from-teal-500/20 to-cyan-600/20",
    tags: [],
  },
  {
    id: "OPERATIONS",
    label: "OPERATIONS",
    pin: "0000",
    color: "from-slate-500/20 to-gray-600/20",
    tags: Array.from(
      new Set([
        ...AMMONIA_ASSETS,
        ...UTILITIES_ASSETS,
        ...ELECTRICAL_AIR_ASSETS,
        ...KEY_EQUIPMENT,
        "M.P STEAM", "L.P STEAM", "P.S.A UNIT",
      ]),
    ),
  },
];

export function getDepartmentByPin(pin: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.pin === pin);
}

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}
