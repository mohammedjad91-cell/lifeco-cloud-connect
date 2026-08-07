// Reference ranges for parameters. Used to color-code readings as
// "Normal Operations" (green) or "Out of Range" (red) across the app.

export interface Range {
  min: number;
  max: number;
  unit?: string;
}

export const LAB_RANGES: Record<string, Range> = {
  pH: { min: 6.5, max: 8.5 },
  Conductivity: { min: 0, max: 10, unit: "µS/cm" },
  Hardness: { min: 0, max: 5, unit: "ppm" },
  "Dew Point": { min: -80, max: -40, unit: "°C" },
  NH3: { min: 0, max: 25 },
  H2: { min: 60, max: 75 },
  N2: { min: 20, max: 30 },
  CH4: { min: 0, max: 5 },
  CO: { min: 0, max: 10 },
  CO2: { min: 0, max: 20 },
  O2: { min: 0, max: 5 },
  Temp: { min: 10, max: 60, unit: "°C" },
  Pressure: { min: 0, max: 50, unit: "bar" },
  "N2 Purity": { min: 99, max: 100, unit: "%" },
  Silica: { min: 0, max: 0.02, unit: "ppm" },
  Chlorides: { min: 0, max: 250, unit: "ppm" },
  TDS: { min: 0, max: 500, unit: "ppm" },
  Iron: { min: 0, max: 0.3, unit: "ppm" },
  Sodium: { min: 0, max: 50, unit: "ppm" },
  "Dissolved Oxygen": { min: 0, max: 10, unit: "ppm" },
};

export const FIELD_OPS_RANGES = {
  running_hours: { min: 0, max: 24000 } as Range,
  discharge_pressure: { min: 0, max: 60, unit: "bar" } as Range,
  temperature: { min: 5, max: 95, unit: "°C" } as Range,
};

export type FieldOpsMetric = keyof typeof FIELD_OPS_RANGES;

export const isInRange = (value: number, range?: Range): boolean => {
  if (!range || !Number.isFinite(value)) return true;
  return value >= range.min && value <= range.max;
};

export const getLabRange = (parameter: string): Range | undefined => LAB_RANGES[parameter];

export const statusColorClasses = (inRange: boolean) =>
  inRange
    ? { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40" }
    : { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/40" };

export const statusHex = (inRange: boolean) => (inRange ? "#10b981" : "#ef4444");
