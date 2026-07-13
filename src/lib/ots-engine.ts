// Operator Training Simulator (OTS) engine — lightweight digital-twin logic
// for 4 plants: AMM1, AMM2, DEMIN1, DEMIN2. Runs entirely in the browser.

export type LoopMode = "AUTO" | "MAN";

export interface Loop {
  tag: string;
  label: string;
  unit: string;
  pv: number;          // Process Variable (measured)
  sv: number;          // Setpoint (auto target)
  mv: number;          // Manipulated Variable / output % (0-100)
  mode: LoopMode;
  pvMin: number;       // display range
  pvMax: number;
  hi: number;          // alarm high
  lo: number;          // alarm low
  kp: number;          // process response
  noise: number;
  // Physical coupling — how the "load" (mv) drives PV toward this target
  driveTarget: number; // PV target when mv = 100%
  driveZero: number;   // PV target when mv = 0%
}

export interface Compressor {
  tag: string;
  label: string;
  loaded: boolean;     // LOAD / UNLOAD
  running: boolean;
  amps: number;
  dischargePressure: number;
}

export interface Valve {
  tag: string;
  label: string;
  open: number;        // 0-100 %
}

export interface Pump {
  tag: string;
  label: string;
  running: boolean;
  strokes: number;     // for dosing pumps (spm)
}

export interface PlantState {
  id: "AMM1" | "AMM2" | "DEMIN1" | "DEMIN2";
  name: string;
  loops: Loop[];
  compressors: Compressor[];
  valves: Valve[];
  pumps: Pump[];
}

export type Alarm = {
  plantId: PlantState["id"];
  tag: string;
  label: string;
  kind: "HI" | "LO";
  value: number;
  limit: number;
  since: number;
};

// ---------- Initial states ----------
const mkAmm = (id: "AMM1" | "AMM2", name: string): PlantState => ({
  id, name,
  loops: [
    { tag: "60PIC006", label: "Syn Gas Pressure", unit: "bar", pv: 145, sv: 145, mv: 55, mode: "AUTO",
      pvMin: 0, pvMax: 220, hi: 180, lo: 120, kp: 0.15, noise: 0.4, driveTarget: 210, driveZero: 40 },
    { tag: "21TIC340", label: "Converter Inlet Temp", unit: "°C", pv: 480, sv: 480, mv: 60, mode: "AUTO",
      pvMin: 300, pvMax: 600, hi: 540, lo: 420, kp: 0.08, noise: 0.6, driveTarget: 600, driveZero: 250 },
    { tag: "21FIC101", label: "Feed Gas Flow", unit: "kNm³/h", pv: 120, sv: 120, mv: 50, mode: "AUTO",
      pvMin: 0, pvMax: 180, hi: 160, lo: 80, kp: 0.25, noise: 0.3, driveTarget: 180, driveZero: 0 },
    { tag: "21LIC220", label: "Separator Level", unit: "%", pv: 55, sv: 55, mv: 50, mode: "AUTO",
      pvMin: 0, pvMax: 100, hi: 85, lo: 20, kp: 0.2, noise: 0.15, driveTarget: 100, driveZero: 0 },
  ],
  compressors: [
    { tag: id === "AMM1" ? "60-M-1001A" : "60-M-1001B", label: "Syn Gas Compressor", loaded: true, running: true, amps: 180, dischargePressure: 145 },
  ],
  valves: [
    { tag: "XV-1001", label: "Main Feed Valve", open: 100 },
    { tag: "XV-2002", label: "Purge Valve", open: 15 },
  ],
  pumps: [],
});

const mkDemin = (id: "DEMIN1" | "DEMIN2", name: string): PlantState => ({
  id, name,
  loops: [
    { tag: "DM-FIC-101", label: "Raw Water Flow", unit: "m³/h", pv: 80, sv: 80, mv: 55, mode: "AUTO",
      pvMin: 0, pvMax: 150, hi: 130, lo: 40, kp: 0.3, noise: 0.4, driveTarget: 150, driveZero: 0 },
    { tag: "DM-AIC-201", label: "pH Control", unit: "pH", pv: 7.2, sv: 7.2, mv: 50, mode: "AUTO",
      pvMin: 4, pvMax: 10, hi: 8.5, lo: 6.5, kp: 0.1, noise: 0.02, driveTarget: 9.5, driveZero: 4.5 },
    { tag: "DM-CIC-301", label: "Conductivity", unit: "µS/cm", pv: 2.0, sv: 2.0, mv: 40, mode: "AUTO",
      pvMin: 0, pvMax: 20, hi: 10, lo: 0, kp: 0.15, noise: 0.05, driveTarget: 18, driveZero: 0.1 },
    { tag: "DM-LIC-401", label: "Storage Tank Level", unit: "%", pv: 65, sv: 65, mv: 50, mode: "AUTO",
      pvMin: 0, pvMax: 100, hi: 90, lo: 15, kp: 0.18, noise: 0.1, driveTarget: 100, driveZero: 0 },
  ],
  compressors: [],
  valves: [
    { tag: "FV-101", label: "Inlet Control Valve", open: 75 },
    { tag: "PV-201", label: "Acid Dosing Valve", open: 40 },
    { tag: "PV-202", label: "Caustic Dosing Valve", open: 40 },
  ],
  pumps: [
    { tag: "P-301", label: "Acid Dosing Pump", running: true, strokes: 45 },
    { tag: "P-302", label: "Caustic Dosing Pump", running: true, strokes: 45 },
  ],
});

export const INITIAL_PLANTS: PlantState[] = [
  mkAmm("AMM1", "AMMONIA 1"),
  mkAmm("AMM2", "AMMONIA 2"),
  mkDemin("DEMIN1", "DEMIN 1"),
  mkDemin("DEMIN2", "DEMIN 2"),
];

// ---------- Simulation step ----------
export function stepPlant(p: PlantState, dt: number): PlantState {
  // Compressor influence — if unloaded, drops the syn-gas pressure loop's drive
  const compressorLoadFactor = p.compressors.length
    ? p.compressors.reduce((s, c) => s + (c.running && c.loaded ? 1 : 0.15), 0) / p.compressors.length
    : 1;

  const loops = p.loops.map((l) => {
    // Auto mode: simple P-controller adjusts MV toward SV
    let mv = l.mv;
    if (l.mode === "AUTO") {
      const err = l.sv - l.pv;
      mv = Math.max(0, Math.min(100, l.mv + err * l.kp * 2 * dt / (l.pvMax - l.pvMin) * 100));
    }
    // Valve influence for demin flow
    let valveFactor = 1;
    if (l.tag === "DM-FIC-101") {
      const v = p.valves.find((v) => v.tag === "FV-101");
      valveFactor = v ? v.open / 100 : 1;
    }
    if (l.tag === "60PIC006" || l.tag === "21FIC101") {
      valveFactor *= compressorLoadFactor;
      const main = p.valves.find((v) => v.tag === "XV-1001");
      if (main) valveFactor *= main.open / 100;
    }
    if (l.tag === "DM-AIC-201") {
      // pH driven by acid vs caustic pump balance
      const acid = p.pumps.find((x) => x.tag === "P-301");
      const caustic = p.pumps.find((x) => x.tag === "P-302");
      const acidEff = acid && acid.running ? acid.strokes : 0;
      const causticEff = caustic && caustic.running ? caustic.strokes : 0;
      const balance = (causticEff - acidEff) / 100; // -1..1
      const target = 7 + balance * 2.5;
      const pv = l.pv + (target - l.pv) * l.kp * dt + (Math.random() - 0.5) * l.noise;
      return { ...l, pv, mv };
    }
    const target = l.driveZero + (l.driveTarget - l.driveZero) * (mv / 100) * valveFactor;
    const pv = l.pv + (target - l.pv) * l.kp * dt + (Math.random() - 0.5) * l.noise;
    return { ...l, pv, mv };
  });

  const compressors = p.compressors.map((c) => ({
    ...c,
    amps: c.running ? (c.loaded ? 180 + (Math.random() - 0.5) * 4 : 60 + (Math.random() - 0.5) * 3) : 0,
    dischargePressure: c.running && c.loaded ? loops[0]?.pv ?? c.dischargePressure : Math.max(2, c.dischargePressure - 5 * dt),
  }));

  return { ...p, loops, compressors };
}

export function collectAlarms(plants: PlantState[], now: number): Alarm[] {
  const out: Alarm[] = [];
  for (const p of plants) {
    for (const l of p.loops) {
      if (l.pv > l.hi) out.push({ plantId: p.id, tag: l.tag, label: l.label, kind: "HI", value: l.pv, limit: l.hi, since: now });
      else if (l.pv < l.lo) out.push({ plantId: p.id, tag: l.tag, label: l.label, kind: "LO", value: l.pv, limit: l.lo, since: now });
    }
  }
  return out;
}

// ---------- Audible siren (WebAudio, no external asset) ----------
let audioCtx: AudioContext | null = null;
let sirenNodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode; lfoGain: GainNode } | null = null;

export function startSiren() {
  if (typeof window === "undefined") return;
  if (sirenNodes) return;
  const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  audioCtx = audioCtx ?? new Ctx();
  const ctx = audioCtx;
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 620;

  const gain = ctx.createGain();
  gain.gain.value = 0.18;

  // LFO to sweep frequency — classic control-room warble
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 2.2;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain).connect(osc.frequency);

  osc.connect(gain).connect(ctx.destination);
  osc.start();
  lfo.start();
  sirenNodes = { osc, gain, lfo, lfoGain };
}

export function stopSiren() {
  if (!sirenNodes) return;
  try {
    sirenNodes.osc.stop();
    sirenNodes.lfo.stop();
    sirenNodes.osc.disconnect();
    sirenNodes.lfo.disconnect();
    sirenNodes.gain.disconnect();
    sirenNodes.lfoGain.disconnect();
  } catch { /* noop */ }
  sirenNodes = null;
}
