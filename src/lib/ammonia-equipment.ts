// Official Ammonia (Haber-Bosch) equipment registry.
// Industry-standard reference data for a ~1200 MTPD steam-reforming ammonia
// train (Kellogg-style numbering). Used to pre-fill the Equipment Description
// Card (بطاقة وصف المعدة) and the spare-parts requisition flow.

export type AmmoniaSubsystem =
  | "Reforming"
  | "Purification"
  | "Synthesis"
  | "Refrigeration"
  | "Utilities";

export interface AmmoniaSpare {
  partNo: string;
  name: string;
  uom: string;
  typicalQty: number;
}

export interface AmmoniaEquipment {
  tag: string;
  name: string;
  nameAr: string;
  subsystem: AmmoniaSubsystem;
  type: string;
  manufacturer: string;
  designPressureBar: number;
  operatingPressureBar: number;
  operatingTempC: string;
  flowRate: string;
  catalyst?: string;
  maintenanceInterval: string;
  lubricant: string;
  electrical: string;
  criticality: "high" | "medium" | "low";
  notes: string;
  spares: AmmoniaSpare[];
}

export const AMMONIA_EQUIPMENT: AmmoniaEquipment[] = [
  // ---------------- Reforming ----------------
  {
    tag: "101-B",
    name: "Primary Reformer (Top-Fired Furnace)",
    nameAr: "المُصلِح الأولي",
    subsystem: "Reforming",
    type: "Fired Tubular Reformer",
    manufacturer: "M.W. Kellogg",
    designPressureBar: 45,
    operatingPressureBar: 36,
    operatingTempC: "Inlet 520 / Outlet 800–820",
    flowRate: "150,000 Nm³/h process gas • S/C ratio 3.0",
    catalyst: "Nickel on alpha-alumina (Ni 15–18%), ring type — 4 yr life",
    maintenanceInterval: "Tube inspection every 8,000 operating hours / annual T&I",
    lubricant: "N/A (fired equipment) — burner linkage grease NLGI 2",
    electrical: "ID/FD fans 6.6 kV 3-Phase 50 Hz",
    criticality: "high",
    notes: "Monitor tube skin temperature and catalyst pressure drop; creep-life tracking on radiant tubes.",
    spares: [
      { partNo: "AMM-101B-TB", name: "Reformer Radiant Tube HP-Micro Alloy", uom: "EA", typicalQty: 4 },
      { partNo: "AMM-101B-BR", name: "Arch Burner Assembly", uom: "EA", typicalQty: 8 },
      { partNo: "AMM-101B-CAT", name: "Primary Reforming Nickel Catalyst", uom: "M3", typicalQty: 2 },
    ],
  },
  {
    tag: "103-D",
    name: "Secondary Reformer",
    nameAr: "المُصلِح الثانوي",
    subsystem: "Reforming",
    type: "Refractory-lined Vessel with Air Burner",
    manufacturer: "M.W. Kellogg",
    designPressureBar: 42,
    operatingPressureBar: 33,
    operatingTempC: "Inlet 800 / Outlet 980–1000",
    flowRate: "Process air 60,000 Nm³/h",
    catalyst: "Nickel on alumina, two-layer (target + main bed)",
    maintenanceInterval: "Refractory inspection every 3 years / catalyst change 5 years",
    lubricant: "N/A",
    electrical: "Instrument loop 24 VDC",
    criticality: "high",
    notes: "Shell hot-spot survey each shift; air/gas ratio controls methane slip (<0.35 mol%).",
    spares: [
      { partNo: "AMM-103D-REF", name: "High-Alumina Refractory Brick Set", uom: "SET", typicalQty: 1 },
      { partNo: "AMM-103D-BRN", name: "Secondary Reformer Air Burner Nozzle", uom: "EA", typicalQty: 1 },
    ],
  },
  {
    tag: "104-D1",
    name: "High Temperature Shift Converter (HTS)",
    nameAr: "محول الإزاحة عالي الحرارة",
    subsystem: "Reforming",
    type: "Fixed Bed Reactor",
    manufacturer: "Haldor Topsøe",
    designPressureBar: 40,
    operatingPressureBar: 31,
    operatingTempC: "Inlet 350 / Outlet 430",
    flowRate: "170,000 Nm³/h",
    catalyst: "Iron-Chrome (Fe3O4/Cr2O3) — SK-201-2, 4 yr life",
    maintenanceInterval: "Catalyst activity check yearly / change every 4 years",
    lubricant: "N/A",
    electrical: "Instrument loop 24 VDC",
    criticality: "high",
    notes: "CO slip target < 3.0 mol% dry.",
    spares: [
      { partNo: "AMM-104D-CAT", name: "HTS Iron-Chrome Catalyst", uom: "M3", typicalQty: 1 },
      { partNo: "AMM-104D-SCR", name: "Catalyst Support Screen", uom: "EA", typicalQty: 2 },
    ],
  },
  {
    tag: "104-D2",
    name: "Low Temperature Shift Converter (LTS)",
    nameAr: "محول الإزاحة منخفض الحرارة",
    subsystem: "Reforming",
    type: "Fixed Bed Reactor",
    manufacturer: "Haldor Topsøe",
    designPressureBar: 38,
    operatingPressureBar: 30,
    operatingTempC: "Inlet 200 / Outlet 235",
    flowRate: "170,000 Nm³/h",
    catalyst: "Copper-Zinc-Alumina (LK-821-2) — 3 yr life",
    maintenanceInterval: "Guard bed inspection yearly / catalyst change 3 years",
    lubricant: "N/A",
    electrical: "Instrument loop 24 VDC",
    criticality: "high",
    notes: "Keep above dew point to avoid catalyst condensation damage; CO slip < 0.3 mol%.",
    spares: [
      { partNo: "AMM-104D2-CAT", name: "LTS Copper-Zinc Catalyst", uom: "M3", typicalQty: 1 },
    ],
  },

  // ---------------- Purification ----------------
  {
    tag: "106-F",
    name: "CO2 Absorber (Benfield / aMDEA)",
    nameAr: "برج امتصاص ثاني أكسيد الكربون",
    subsystem: "Purification",
    type: "Packed Absorption Column",
    manufacturer: "UOP / BASF aMDEA",
    designPressureBar: 36,
    operatingPressureBar: 29,
    operatingTempC: "Lean solution 70 / Bottom 120",
    flowRate: "Solution circulation 900 m³/h",
    maintenanceInterval: "Internal packing inspection every 4 years / annual solution survey",
    lubricant: "N/A",
    electrical: "Level & analyzer loops 24 VDC",
    criticality: "high",
    notes: "CO2 slip target < 500 ppmv; monitor solution foaming and corrosion inhibitor (V2O5).",
    spares: [
      { partNo: "AMM-106F-PCK", name: "Structured Packing Module", uom: "M3", typicalQty: 5 },
      { partNo: "AMM-106F-GSK", name: "Manway Gasket Spiral Wound", uom: "EA", typicalQty: 6 },
    ],
  },
  {
    tag: "107-F",
    name: "CO2 Regenerator / Stripper",
    nameAr: "برج تجديد المحلول",
    subsystem: "Purification",
    type: "Packed Stripping Column",
    manufacturer: "UOP",
    designPressureBar: 4,
    operatingPressureBar: 1.7,
    operatingTempC: "Top 90 / Bottom 125",
    flowRate: "CO2 product 42,000 Nm³/h",
    maintenanceInterval: "Every 8,000 operating hours (internal wash & inspection)",
    lubricant: "N/A",
    electrical: "24 VDC instrument loops",
    criticality: "medium",
    notes: "Reboiler duty and stripping steam ratio drive lean loading.",
    spares: [
      { partNo: "AMM-107F-PCK", name: "Random Packing Pall Rings SS316", uom: "M3", typicalQty: 3 },
    ],
  },
  {
    tag: "105-D",
    name: "Methanator",
    nameAr: "مفاعل المثنة",
    subsystem: "Purification",
    type: "Fixed Bed Reactor",
    manufacturer: "Haldor Topsøe",
    designPressureBar: 36,
    operatingPressureBar: 28,
    operatingTempC: "Inlet 300 / Outlet 330",
    flowRate: "140,000 Nm³/h",
    catalyst: "Nickel on alumina (PK-7R) — 6 yr life",
    maintenanceInterval: "Catalyst inspection every 2 years / change every 6 years",
    lubricant: "N/A",
    electrical: "Trip loop 24 VDC — high temperature interlock",
    criticality: "high",
    notes: "CO + CO2 slip must stay < 10 ppmv to protect the synthesis catalyst.",
    spares: [
      { partNo: "AMM-105D-CAT", name: "Methanation Nickel Catalyst", uom: "M3", typicalQty: 1 },
      { partNo: "AMM-105D-TC", name: "Bed Thermocouple Multipoint", uom: "EA", typicalQty: 2 },
    ],
  },
  {
    tag: "102-D",
    name: "Hydro-desulphurizer & ZnO Guard Bed",
    nameAr: "وحدة إزالة الكبريت",
    subsystem: "Purification",
    type: "Fixed Bed Vessel (2 in series)",
    manufacturer: "Haldor Topsøe",
    designPressureBar: 48,
    operatingPressureBar: 40,
    operatingTempC: "350–400",
    flowRate: "48,000 Nm³/h natural gas",
    catalyst: "CoMo (TK-250) + Zinc Oxide (HTZ-51)",
    maintenanceInterval: "ZnO change every 12–18 months (sulphur slip < 0.05 ppm)",
    lubricant: "N/A",
    electrical: "Preheater 415 V 3-Phase",
    criticality: "high",
    notes: "Sulphur breakthrough poisons reforming and LTS catalyst.",
    spares: [
      { partNo: "AMM-102D-ZNO", name: "Zinc Oxide Absorbent", uom: "M3", typicalQty: 2 },
      { partNo: "AMM-102D-COM", name: "CoMo Hydrogenation Catalyst", uom: "M3", typicalQty: 1 },
    ],
  },

  // ---------------- Synthesis ----------------
  {
    tag: "103-J",
    name: "Synthesis Gas Compressor (Syngas)",
    nameAr: "ضاغط غاز التخليق",
    subsystem: "Synthesis",
    type: "Centrifugal, Steam-Turbine Driven (2 casings + recycle)",
    manufacturer: "Elliott / Nuovo Pignone",
    designPressureBar: 250,
    operatingPressureBar: 220,
    operatingTempC: "Suction 38 / Discharge 120",
    flowRate: "140,000 Nm³/h • Speed 10,500 rpm",
    maintenanceInterval: "Every 8,000 operating hours (minor) / 32,000 h major overhaul",
    lubricant: "Turbine oil ISO VG 46 (lube) • ISO VG 68 (seal oil), 12,000 L system",
    electrical: "Aux. lube oil pump 6.6 kV 3-Phase • emergency pump 220 VDC",
    criticality: "high",
    notes: "Continuous vibration (API 670) and axial displacement monitoring; dry gas seal panel checks each shift.",
    spares: [
      { partNo: "AMM-103J-DGS", name: "Dry Gas Seal Cartridge", uom: "EA", typicalQty: 2 },
      { partNo: "AMM-103J-BRG", name: "Tilting Pad Journal Bearing", uom: "SET", typicalQty: 1 },
      { partNo: "AMM-103J-TBR", name: "Thrust Bearing Assembly", uom: "EA", typicalQty: 1 },
      { partNo: "AMM-103J-OIL", name: "Turbine Oil ISO VG 46", uom: "L", typicalQty: 400 },
    ],
  },
  {
    tag: "105-D-CONV",
    name: "Ammonia Synthesis Converter",
    nameAr: "مفاعل تخليق الأمونيا",
    subsystem: "Synthesis",
    type: "Multi-bed Radial Flow Converter (S-200 type)",
    manufacturer: "Haldor Topsøe",
    designPressureBar: 250,
    operatingPressureBar: 210,
    operatingTempC: "Bed inlet 370 / Bed outlet 500",
    flowRate: "Recycle 500,000 Nm³/h • 1,200 MTPD NH3",
    catalyst: "Promoted magnetite iron KM1R / KM-111 — 10 yr life",
    maintenanceInterval: "Internal inspection every 4 years / catalyst change 8–10 years",
    lubricant: "N/A",
    electrical: "Multipoint thermocouples 24 VDC",
    criticality: "high",
    notes: "Ammonia conversion 16–18% per pass; watch bed ΔT profile for catalyst deactivation.",
    spares: [
      { partNo: "AMM-CONV-CAT", name: "Iron Promoted Synthesis Catalyst", uom: "M3", typicalQty: 3 },
      { partNo: "AMM-CONV-BSK", name: "Converter Basket Screen Segment", uom: "EA", typicalQty: 2 },
    ],
  },
  {
    tag: "104-J",
    name: "Ammonia Synthesis Recycle Compressor",
    nameAr: "ضاغط إعادة التدوير",
    subsystem: "Synthesis",
    type: "Centrifugal, single casing",
    manufacturer: "Elliott",
    designPressureBar: 250,
    operatingPressureBar: 205,
    operatingTempC: "Suction 30 / Discharge 60",
    flowRate: "500,000 Nm³/h recycle",
    maintenanceInterval: "Every 8,000 operating hours / overhaul 32,000 h",
    lubricant: "Turbine oil ISO VG 46",
    electrical: "6.6 kV 3-Phase motor-driven aux systems",
    criticality: "high",
    notes: "Loop pressure control; surge protection line to converter inlet.",
    spares: [
      { partNo: "AMM-104J-SEAL", name: "Compressor Labyrinth Seal Set", uom: "SET", typicalQty: 1 },
      { partNo: "AMM-104J-BRG", name: "Journal Bearing Pair", uom: "SET", typicalQty: 1 },
    ],
  },
  {
    tag: "101-J",
    name: "Process Air Compressor",
    nameAr: "ضاغط هواء العملية",
    subsystem: "Synthesis",
    type: "Axial + Centrifugal, Steam Turbine Driven",
    manufacturer: "MAN Energy Solutions",
    designPressureBar: 45,
    operatingPressureBar: 36,
    operatingTempC: "Suction 35 / Discharge 190",
    flowRate: "60,000 Nm³/h air",
    maintenanceInterval: "Every 8,000 operating hours / major every 4 years",
    lubricant: "Turbine oil ISO VG 46 • gear oil ISO VG 68",
    electrical: "Aux oil pump 415 V 3-Phase • turning gear 6.6 kV",
    criticality: "high",
    notes: "Anti-surge controller and inlet filter ΔP monitoring.",
    spares: [
      { partNo: "AMM-101J-FLT", name: "Air Inlet Filter Cartridge", uom: "EA", typicalQty: 24 },
      { partNo: "AMM-101J-BRG", name: "Thrust Bearing Assembly", uom: "EA", typicalQty: 1 },
    ],
  },
  {
    tag: "102-J",
    name: "Natural Gas Feed Compressor",
    nameAr: "ضاغط الغاز الطبيعي",
    subsystem: "Synthesis",
    type: "Centrifugal, Turbine Driven",
    manufacturer: "Nuovo Pignone",
    designPressureBar: 55,
    operatingPressureBar: 45,
    operatingTempC: "Suction 25 / Discharge 95",
    flowRate: "48,000 Nm³/h",
    maintenanceInterval: "Every 8,000 operating hours",
    lubricant: "Turbine oil ISO VG 46",
    electrical: "Aux lube pump 415 V 3-Phase",
    criticality: "medium",
    notes: "Maintain suction knock-out drum level to avoid liquid carry-over.",
    spares: [
      { partNo: "AMM-102J-DGS", name: "Dry Gas Seal Cartridge", uom: "EA", typicalQty: 1 },
    ],
  },

  // ---------------- Refrigeration ----------------
  {
    tag: "105-J",
    name: "Ammonia Refrigeration Compressor",
    nameAr: "ضاغط تبريد الأمونيا",
    subsystem: "Refrigeration",
    type: "Centrifugal, 3-stage, Turbine Driven",
    manufacturer: "Elliott",
    designPressureBar: 20,
    operatingPressureBar: 16,
    operatingTempC: "Suction −33 / Discharge 95",
    flowRate: "1,200 MTPD NH3 refrigeration duty",
    maintenanceInterval: "Every 8,000 operating hours / overhaul every 4 years",
    lubricant: "Refrigeration-grade turbine oil ISO VG 46",
    electrical: "Aux pump 415 V 3-Phase • vibration monitoring 24 VDC",
    criticality: "high",
    notes: "Three side-load stages at −33/−13/+13 °C; oil carry-over to chillers must be avoided.",
    spares: [
      { partNo: "AMM-105J-SEAL", name: "Mechanical Seal Cartridge", uom: "EA", typicalQty: 2 },
      { partNo: "AMM-105J-OIL", name: "Refrigeration Turbine Oil ISO VG 46", uom: "L", typicalQty: 200 },
    ],
  },
  {
    tag: "120-CF",
    name: "Ammonia Chiller / Refrigerant Exchanger",
    nameAr: "مبرد الأمونيا",
    subsystem: "Refrigeration",
    type: "Kettle Type Shell & Tube Exchanger",
    manufacturer: "Alfa Laval",
    designPressureBar: 250,
    operatingPressureBar: 205,
    operatingTempC: "Shell −33 / Tube 30 → −5",
    flowRate: "Duty 12 MW",
    maintenanceInterval: "Tube bundle inspection every 4 years / eddy current every 8 years",
    lubricant: "N/A",
    electrical: "Level transmitters 24 VDC",
    criticality: "medium",
    notes: "Level control critical to prevent liquid carry-over into 105-J suction.",
    spares: [
      { partNo: "AMM-120CF-TUB", name: "Tube Bundle Plug Set", uom: "SET", typicalQty: 1 },
      { partNo: "AMM-120CF-GSK", name: "Channel Cover Gasket", uom: "EA", typicalQty: 4 },
    ],
  },
  {
    tag: "109-F",
    name: "Ammonia Let-Down / Flash Drum",
    nameAr: "وعاء التمدد",
    subsystem: "Refrigeration",
    type: "Horizontal Separator Vessel",
    manufacturer: "Local Fabrication (ASME VIII Div.1)",
    designPressureBar: 25,
    operatingPressureBar: 18,
    operatingTempC: "−15 to +5",
    flowRate: "Liquid NH3 55 t/h",
    maintenanceInterval: "Internal inspection every 4 years / PSV test yearly",
    lubricant: "N/A",
    electrical: "Level & pressure transmitters 24 VDC",
    criticality: "medium",
    notes: "Purge gas routed to hydrogen recovery unit.",
    spares: [
      { partNo: "AMM-109F-PSV", name: "Pressure Safety Valve 2\"x3\"", uom: "EA", typicalQty: 1 },
    ],
  },
  {
    tag: "P-401A/B",
    name: "Liquid Ammonia Transfer Pumps",
    nameAr: "مضخات نقل الأمونيا السائلة",
    subsystem: "Refrigeration",
    type: "Centrifugal, API 610 OH2 (2 x 100%)",
    manufacturer: "Sulzer",
    designPressureBar: 40,
    operatingPressureBar: 24,
    operatingTempC: "−33",
    flowRate: "120 m³/h @ 180 m head",
    maintenanceInterval: "Every 8,000 operating hours (seal & bearing check)",
    lubricant: "Bearing oil ISO VG 32 • grease NLGI 2 (motor)",
    electrical: "Motor 250 kW, 6.6 kV 3-Phase 50 Hz",
    criticality: "medium",
    notes: "Cold service — verify minimum flow recycle and cool-down procedure before start.",
    spares: [
      { partNo: "AMM-P401-SEAL", name: "Cartridge Mechanical Seal Cold Service", uom: "EA", typicalQty: 2 },
      { partNo: "AMM-P401-BRG", name: "Pump Bearing Set", uom: "SET", typicalQty: 2 },
    ],
  },

  // ---------------- Utilities ----------------
  {
    tag: "101-BJ",
    name: "Auxiliary Boiler / Steam Generation",
    nameAr: "الغلاية المساعدة",
    subsystem: "Utilities",
    type: "Water Tube Package Boiler",
    manufacturer: "Babcock & Wilcox",
    designPressureBar: 110,
    operatingPressureBar: 105,
    operatingTempC: "Steam 510 (superheated)",
    flowRate: "120 t/h HP steam",
    maintenanceInterval: "Annual internal inspection / burner service every 8,000 h",
    lubricant: "Fan bearing grease NLGI 2 • FD fan oil ISO VG 46",
    electrical: "FD fan motor 6.6 kV 3-Phase • BFW pump 6.6 kV",
    criticality: "high",
    notes: "BFW chemistry: silica < 0.02 ppm, conductivity < 10 µS/cm.",
    spares: [
      { partNo: "AMM-101BJ-BRN", name: "Boiler Burner Tip", uom: "EA", typicalQty: 2 },
      { partNo: "AMM-101BJ-PSV", name: "Boiler Safety Valve", uom: "EA", typicalQty: 1 },
    ],
  },
  {
    tag: "P-101A/B",
    name: "Boiler Feed Water Pumps",
    nameAr: "مضخات مياه التغذية",
    subsystem: "Utilities",
    type: "Multistage Barrel Pump API 610 BB5",
    manufacturer: "KSB",
    designPressureBar: 140,
    operatingPressureBar: 125,
    operatingTempC: "115",
    flowRate: "220 m³/h @ 1,350 m head",
    maintenanceInterval: "Every 8,000 operating hours / overhaul every 3 years",
    lubricant: "Bearing oil ISO VG 68",
    electrical: "Motor 1,600 kW, 6.6 kV 3-Phase 50 Hz",
    criticality: "high",
    notes: "Minimum-flow valve must be proven open before start; monitor balance-drum leak-off.",
    spares: [
      { partNo: "AMM-P101-SEAL", name: "Mechanical Seal API Plan 53B", uom: "EA", typicalQty: 2 },
      { partNo: "AMM-P101-WRN", name: "Wear Ring Set", uom: "SET", typicalQty: 1 },
    ],
  },
  {
    tag: "127-C",
    name: "Ammonia Product Water Cooler",
    nameAr: "مبرد المنتج بالماء",
    subsystem: "Utilities",
    type: "Shell & Tube Exchanger (TEMA AES)",
    manufacturer: "Alfa Laval",
    designPressureBar: 250,
    operatingPressureBar: 205,
    operatingTempC: "Inlet 120 / Outlet 40",
    flowRate: "Cooling water 1,800 m³/h",
    maintenanceInterval: "Tube cleaning every 8,000 operating hours",
    lubricant: "N/A",
    electrical: "N/A",
    criticality: "medium",
    notes: "Cooling-water side fouling drives loop pressure; monitor approach temperature.",
    spares: [
      { partNo: "AMM-127C-GSK", name: "Exchanger Gasket Set", uom: "SET", typicalQty: 1 },
      { partNo: "AMM-127C-PLG", name: "Tube Plug Set", uom: "SET", typicalQty: 1 },
    ],
  },
  {
    tag: "HRU-01",
    name: "Purge Gas Hydrogen Recovery Unit",
    nameAr: "وحدة استرجاع الهيدروجين",
    subsystem: "Utilities",
    type: "Membrane / Cryogenic Recovery Skid",
    manufacturer: "Air Liquide",
    designPressureBar: 140,
    operatingPressureBar: 130,
    operatingTempC: "Ambient to −180 (cryo section)",
    flowRate: "Purge gas 8,000 Nm³/h • H2 recovery 90%",
    maintenanceInterval: "Membrane inspection yearly / element change every 5 years",
    lubricant: "N/A",
    electrical: "Skid panel 415 V 3-Phase",
    criticality: "medium",
    notes: "Recovered hydrogen returns to 103-J second-stage suction.",
    spares: [
      { partNo: "AMM-HRU-MEM", name: "Hollow Fiber Membrane Module", uom: "EA", typicalQty: 2 },
    ],
  },
  {
    tag: "TK-501",
    name: "Ammonia Atmospheric Storage Tank",
    nameAr: "خزان تخزين الأمونيا",
    subsystem: "Utilities",
    type: "Double-wall Refrigerated Tank",
    manufacturer: "Whessoe",
    designPressureBar: 1.1,
    operatingPressureBar: 1.05,
    operatingTempC: "−33",
    flowRate: "Capacity 20,000 t",
    maintenanceInterval: "Annual external / full internal inspection every 10 years",
    lubricant: "In-tank pump grease NLGI 2",
    electrical: "Boil-off compressor 415 V 3-Phase • level radar 24 VDC",
    criticality: "high",
    notes: "Boil-off gas compressor must stay available; monitor tank pressure and nitrogen blanket.",
    spares: [
      { partNo: "AMM-TK501-PSV", name: "Tank Pressure/Vacuum Relief Valve", uom: "EA", typicalQty: 1 },
      { partNo: "AMM-TK501-LVL", name: "Radar Level Transmitter", uom: "EA", typicalQty: 1 },
    ],
  },
];

export const AMMONIA_BY_TAG: Record<string, AmmoniaEquipment> = Object.fromEntries(
  AMMONIA_EQUIPMENT.map((e) => [e.tag.toUpperCase(), e]),
);

export function getAmmoniaSpec(
  tag?: string | null,
  code?: string | null,
): AmmoniaEquipment | undefined {
  const keys = [tag, code].filter(Boolean).map((v) => String(v).toUpperCase());
  for (const k of keys) if (AMMONIA_BY_TAG[k]) return AMMONIA_BY_TAG[k];
  return undefined;
}

export const AMMONIA_SPARES: AmmoniaSpare[] = AMMONIA_EQUIPMENT.flatMap((e) => e.spares);
