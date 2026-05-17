// Equipment-specific parameter profiles. Each equipment tag exposes a set of
// dynamic input fields with safe operating ranges used for the field-ops form.

import type { Range } from "./ranges";

export interface ParamSpec {
  key: string;
  label: string;
  unit?: string;
  range?: Range;
}

export interface EquipmentProfile {
  type: "compressor" | "pump" | "turbine" | "reactor" | "utility" | "generic";
  description: string;
  params: ParamSpec[];
}

const COMMON_RUN: ParamSpec = {
  key: "running_hours", label: "Running Hours", unit: "hrs",
  range: { min: 0, max: 24000 },
};

// Profile builders ----------------------------------------------------------
const compressorProfile = (label: string): EquipmentProfile => ({
  type: "compressor",
  description: `${label} — multistage compressor`,
  params: [
    COMMON_RUN,
    { key: "suction_pressure", label: "Suction Pressure", unit: "bar", range: { min: 0, max: 5 } },
    { key: "discharge_pressure", label: "Discharge Pressure", unit: "bar", range: { min: 0, max: 60 } },
    { key: "stage1_temp", label: "Stage 1 Element Temp", unit: "°C", range: { min: 20, max: 110 } },
    { key: "stage2_temp", label: "Stage 2 Element Temp", unit: "°C", range: { min: 20, max: 110 } },
    { key: "oil_pressure", label: "Oil Pressure", unit: "bar", range: { min: 1, max: 6 } },
    { key: "oil_temp", label: "Oil Temperature", unit: "°C", range: { min: 30, max: 80 } },
    { key: "vibration", label: "Vibration", unit: "mm/s", range: { min: 0, max: 7 } },
  ],
});

const pumpProfile = (label: string): EquipmentProfile => ({
  type: "pump",
  description: `${label} — centrifugal pump`,
  params: [
    COMMON_RUN,
    { key: "suction_pressure", label: "Suction Pressure", unit: "bar", range: { min: 0, max: 10 } },
    { key: "discharge_pressure", label: "Discharge Pressure", unit: "bar", range: { min: 0, max: 40 } },
    { key: "flow_rate", label: "Flow Rate", unit: "m³/h", range: { min: 0, max: 500 } },
    { key: "bearing_temp", label: "Bearing Temperature", unit: "°C", range: { min: 20, max: 85 } },
    { key: "motor_current", label: "Motor Current", unit: "A", range: { min: 0, max: 400 } },
    { key: "vibration", label: "Vibration", unit: "mm/s", range: { min: 0, max: 7 } },
  ],
});

const turbineProfile = (label: string): EquipmentProfile => ({
  type: "turbine",
  description: `${label} — steam turbine`,
  params: [
    COMMON_RUN,
    { key: "steam_inlet_pressure", label: "Steam Inlet Pressure", unit: "bar", range: { min: 0, max: 120 } },
    { key: "steam_inlet_temp", label: "Steam Inlet Temp", unit: "°C", range: { min: 200, max: 540 } },
    { key: "exhaust_pressure", label: "Exhaust Pressure", unit: "bar", range: { min: 0, max: 10 } },
    { key: "rpm", label: "Speed", unit: "rpm", range: { min: 0, max: 12000 } },
    { key: "bearing_temp", label: "Bearing Temperature", unit: "°C", range: { min: 20, max: 95 } },
    { key: "vibration", label: "Vibration", unit: "mm/s", range: { min: 0, max: 7 } },
  ],
});

const reactorProfile = (label: string): EquipmentProfile => ({
  type: "reactor",
  description: `${label} — catalytic reactor`,
  params: [
    { key: "inlet_temp", label: "Inlet Temperature", unit: "°C", range: { min: 100, max: 550 } },
    { key: "outlet_temp", label: "Outlet Temperature", unit: "°C", range: { min: 100, max: 550 } },
    { key: "bed1_temp", label: "Catalyst Bed 1 Temp", unit: "°C", range: { min: 100, max: 550 } },
    { key: "bed2_temp", label: "Catalyst Bed 2 Temp", unit: "°C", range: { min: 100, max: 550 } },
    { key: "bed3_temp", label: "Catalyst Bed 3 Temp", unit: "°C", range: { min: 100, max: 550 } },
    { key: "pressure_drop", label: "Pressure Drop", unit: "bar", range: { min: 0, max: 5 } },
    { key: "inlet_pressure", label: "Inlet Pressure", unit: "bar", range: { min: 0, max: 200 } },
  ],
});

const utilityProfile = (label: string): EquipmentProfile => ({
  type: "utility",
  description: `${label} — utility line`,
  params: [
    { key: "pressure", label: "Line Pressure", unit: "bar", range: { min: 0, max: 20 } },
    { key: "temperature", label: "Temperature", unit: "°C", range: { min: 5, max: 95 } },
    { key: "flow_rate", label: "Flow Rate", unit: "m³/h", range: { min: 0, max: 1000 } },
    { key: "ph", label: "pH", range: { min: 6.5, max: 8.5 } },
    { key: "conductivity", label: "Conductivity", unit: "µS/cm", range: { min: 0, max: 50 } },
  ],
});

const genericProfile = (label: string): EquipmentProfile => ({
  type: "generic",
  description: label,
  params: [
    COMMON_RUN,
    { key: "discharge_pressure", label: "Discharge Pressure", unit: "bar", range: { min: 0, max: 60 } },
    { key: "temperature", label: "Temperature", unit: "°C", range: { min: 5, max: 95 } },
  ],
});

export const EQUIPMENT_PROFILES: Record<string, EquipmentProfile> = {
  // Nitrogen plant compressors (60-1001 series). LOCKED REFERENCE (May 2026):
  // discharge header 9.04 barg, after-cooler outlet 36.47 °C.
  // 60-1001A and 60-1001C are RACKIN/LOADING; 60-1001B is RACKOUT/UNLOAD (standby).
  "60-M-1001A": compressorProfile("60-1001A Air Compressor (RACKIN/LOADING)"),
  "60-M-1001B": compressorProfile("60-1001B Air Compressor (RACKOUT/STANDBY)"),
  "60-M-1001C": compressorProfile("60-1001C Air Compressor (RACKIN/LOADING)"),
  "60-1001A": compressorProfile("60-1001A Air Compressor (RACKIN/LOADING)"),
  "60-1001B": compressorProfile("60-1001B Air Compressor (RACKOUT/STANDBY)"),
  "60-1001C": compressorProfile("60-1001C Air Compressor (RACKIN/LOADING)"),
  "INST AIR": compressorProfile("Instrument Air Compressor (ZR 460)"),
  "ZR 460": compressorProfile("ZR 460 Instrument Air Compressor"),

  // Turbines
  "B-1.9 T-1": turbineProfile("B-1.9 T-1 Steam Turbine"),
  "B-2.12 T-2": turbineProfile("B-2.12 T-2 Steam Turbine"),
  "13-MK-101": turbineProfile("13-MK-101 Turbine"),
  "23-MK-101": turbineProfile("23-MK-101 Turbine"),

  // Reactors
  "R-501": reactorProfile("R-501 Methanator"),
  "101-J": reactorProfile("101-J Primary Reformer"),
  "AMM1 21340": reactorProfile("AMM1 21340 Ammonia Converter"),
  "AMM2 21152": reactorProfile("AMM2 21152 Ammonia Converter"),

  // Utility lines
  "SEA WATER": utilityProfile("Sea Water Line"),
  "DESAL WATER": utilityProfile("Desalinated Water Line"),
  "DEMIN-1": utilityProfile("Demin Water Train 1"),
  "DEMIN-2": utilityProfile("Demin Water Train 2"),
  "P.COND": utilityProfile("Process Condensate"),
  "M.COND": utilityProfile("Mixed Condensate"),

  // Pumps (default for unknown pumps)
  "NITROGEN PLANT": utilityProfile("Nitrogen Plant Header"),
  "P.S.A UNIT": utilityProfile("PSA Unit"),
};

export function getEquipmentProfile(tag: string): EquipmentProfile {
  return EQUIPMENT_PROFILES[tag] ?? genericProfile(tag || "Equipment");
}
