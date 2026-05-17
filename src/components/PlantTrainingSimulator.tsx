import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Gauge, Play, RotateCcw, Wind, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ------------------------------------------------------------------
// Plant Training Simulator (OTS) — Nitrogen Plant
// Simplified mimic of 60-1001A/C compressors → PSA → N2 header
// with clickable control valves and live process logic.
// ------------------------------------------------------------------

type ValveState = "OPEN" | "CLOSED";
type CompState = "LOADING" | "STANDBY" | "TRIPPED";

interface ValveMap {
  dischargeA: ValveState;
  dischargeC: ValveState;
  vent: ValveState;
  psaInlet: ValveState;
}

interface SimState {
  pressure: number;        // discharge header barg — reference 9.04
  compA: CompState;
  compC: CompState;
  tripped: boolean;
  valves: ValveMap;
}

const REF_PRESSURE = 9.04;
const TRIP_PRESSURE = 10.0;
const MIN_PRESSURE = 0.2;

const SCENARIOS = [
  {
    id: "safe-startup",
    title: "Scenario 1 — Safe Compressor Startup",
    brief:
      "Start 60-1001A safely: confirm discharge valve OPEN, PSA inlet OPEN, vent CLOSED, then load the compressor. Hold pressure at ~9.0 barg.",
    success: (s: SimState) =>
      s.compA === "LOADING" &&
      s.valves.dischargeA === "OPEN" &&
      s.valves.psaInlet === "OPEN" &&
      s.valves.vent === "CLOSED" &&
      !s.tripped &&
      s.pressure >= 8.5 && s.pressure <= 9.5,
  },
  {
    id: "high-pressure",
    title: "Scenario 2 — Handle High Pressure Blockage",
    brief:
      "Compressor 60-1001A is LOADING and the discharge valve was inadvertently CLOSED. Pressure is climbing. Vent the system and prevent (or recover from) the HIGH PRESSURE TRIP before damage occurs.",
    success: (s: SimState) =>
      s.valves.vent === "OPEN" &&
      s.pressure < 9.5 &&
      !s.tripped,
  },
  {
    id: "psa-isolation",
    title: "Scenario 3 — PSA Isolation",
    brief:
      "PSA unit must be isolated for maintenance. Close PSA inlet valve, open vent valve to relieve trapped pressure, and ensure compressors do not trip.",
    success: (s: SimState) =>
      s.valves.psaInlet === "CLOSED" &&
      s.valves.vent === "OPEN" &&
      !s.tripped,
  },
] as const;

const INITIAL: SimState = {
  pressure: REF_PRESSURE,
  compA: "STANDBY",
  compC: "STANDBY",
  tripped: false,
  valves: {
    dischargeA: "OPEN",
    dischargeC: "OPEN",
    vent: "CLOSED",
    psaInlet: "OPEN",
  },
};

function scenarioPreset(id: string): SimState {
  if (id === "high-pressure") {
    return {
      ...INITIAL,
      compA: "LOADING",
      valves: { ...INITIAL.valves, dischargeA: "CLOSED" },
      pressure: 9.4,
    };
  }
  if (id === "psa-isolation") {
    return { ...INITIAL, compA: "LOADING", compC: "LOADING" };
  }
  return INITIAL;
}

export default function PlantTrainingSimulator() {
  const { toast } = useToast();
  const [state, setState] = useState<SimState>(INITIAL);
  const [scenario, setScenario] = useState<string>("safe-startup");
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const scen = useMemo(() => SCENARIOS.find((s) => s.id === scenario)!, [scenario]);

  // Process simulation tick (every 800 ms)
  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setState((prev) => {
        if (prev.tripped) return prev;
        const next = { ...prev, valves: { ...prev.valves } };

        const loadingCount =
          (prev.compA === "LOADING" ? 1 : 0) + (prev.compC === "LOADING" ? 1 : 0);

        // Vent open → pressure drops fast toward atmospheric
        if (prev.valves.vent === "OPEN") {
          next.pressure = Math.max(MIN_PRESSURE, prev.pressure - 0.45);
        } else if (loadingCount > 0) {
          // Compressor producing flow; check downstream path
          const dischargeOpen =
            (prev.compA === "LOADING" && prev.valves.dischargeA === "OPEN") ||
            (prev.compC === "LOADING" && prev.valves.dischargeC === "OPEN");
          const downstreamOpen = prev.valves.psaInlet === "OPEN";

          if (!dischargeOpen || !downstreamOpen) {
            // Blocked outlet — pressure builds up
            next.pressure = prev.pressure + 0.18 * loadingCount + Math.random() * 0.08;
          } else {
            // Normal operation — converge toward reference
            const delta = REF_PRESSURE - prev.pressure;
            next.pressure = prev.pressure + delta * 0.25 + (Math.random() - 0.5) * 0.06;
          }
        } else {
          // No production — slowly bleeds toward reference / low
          const target = prev.valves.dischargeA === "OPEN" || prev.valves.dischargeC === "OPEN"
            ? Math.max(MIN_PRESSURE, prev.pressure - 0.05)
            : prev.pressure;
          next.pressure = target;
        }

        // HIGH PRESSURE TRIP interlock
        if (next.pressure >= TRIP_PRESSURE) {
          next.tripped = true;
          next.compA = prev.compA === "LOADING" ? "TRIPPED" : prev.compA;
          next.compC = prev.compC === "LOADING" ? "TRIPPED" : prev.compC;
        }

        return next;
      });
    }, 800);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [running]);

  // Trip alarm toast
  useEffect(() => {
    if (state.tripped) {
      toast({
        title: "⚠ HIGH PRESSURE TRIP",
        description: `Discharge header ${state.pressure.toFixed(2)} barg ≥ ${TRIP_PRESSURE} barg. Compressors interlocked.`,
        variant: "destructive",
      });
    }
  }, [state.tripped]); // eslint-disable-line

  // Scenario success detection
  useEffect(() => {
    if (!running || completedRef.current) return;
    if (scen.success(state)) {
      completedRef.current = true;
      toast({
        title: "✓ Scenario complete",
        description: `${scen.title} — correct operator response.`,
      });
    }
  }, [state, scen, running, toast]);

  const toggleValve = (k: keyof ValveMap) => {
    if (state.tripped) return;
    setState((s) => ({
      ...s,
      valves: { ...s.valves, [k]: s.valves[k] === "OPEN" ? "CLOSED" : "OPEN" },
    }));
  };

  const toggleComp = (k: "compA" | "compC") => {
    if (state.tripped) return;
    setState((s) => ({
      ...s,
      [k]: s[k] === "LOADING" ? "STANDBY" : "LOADING",
    }));
  };

  const loadScenario = (id: string) => {
    setScenario(id);
    setState(scenarioPreset(id));
    setRunning(false);
    completedRef.current = false;
  };

  const reset = () => {
    setState(scenarioPreset(scenario));
    setRunning(false);
    completedRef.current = false;
  };

  const pressureColor =
    state.pressure >= TRIP_PRESSURE
      ? "text-destructive"
      : state.pressure >= 9.6
      ? "text-amber-400"
      : "text-primary";

  return (
    <div className="space-y-4">
      {/* Header & controls */}
      <div className="glass-card neon-border p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-display text-lg neon-text tracking-wider">
              Plant Training Simulator (OTS)
            </h2>
            <p className="text-xs text-muted-foreground">
              Nitrogen Plant — 60-1001A/C → PSA Unit. Click valves & compressors to interact.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={scenario} onValueChange={loadScenario}>
            <SelectTrigger className="w-[280px] bg-secondary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCENARIOS.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant={running ? "secondary" : "default"}
            onClick={() => setRunning((r) => !r)}
            className="gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> {running ? "Pause" : "Start"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Scenario brief */}
      <div className="glass-card p-4 border-l-4 border-primary/60">
        <div className="text-xs uppercase tracking-wider text-primary/80 mb-1">Operator Brief</div>
        <p className="text-sm text-foreground/90">{scen.brief}</p>
      </div>

      {/* Trip banner */}
      <AnimatePresence>
        {state.tripped && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card p-4 border border-destructive bg-destructive/10 flex items-center gap-3"
            style={{ boxShadow: "0 0 32px rgba(239,68,68,0.45)" }}
          >
            <AlertTriangle className="w-6 h-6 text-destructive animate-pulse" />
            <div className="flex-1">
              <div className="font-bold text-destructive tracking-wider">HIGH PRESSURE TRIP — INTERLOCK ACTIVE</div>
              <div className="text-xs text-destructive/80">
                60-PIC-006 ≥ {TRIP_PRESSURE} barg. Compressors stopped. Press Reset to acknowledge.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mimic */}
      <div className="glass-card neon-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center">
          {/* Compressors column */}
          <div className="space-y-3">
            <CompressorCard
              tag="60-1001A" state={state.compA}
              onClick={() => toggleComp("compA")}
            />
            <CompressorCard
              tag="60-1001C" state={state.compC}
              onClick={() => toggleComp("compC")}
            />
          </div>

          {/* Discharge valves */}
          <div className="flex flex-col items-center gap-6">
            <ValveButton label="DCH-A" state={state.valves.dischargeA} onClick={() => toggleValve("dischargeA")} />
            <ValveButton label="DCH-C" state={state.valves.dischargeC} onClick={() => toggleValve("dischargeC")} />
          </div>

          {/* Header / pressure gauge */}
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="text-[10px] text-muted-foreground tracking-wider">60-PIC-006</div>
            <div className="relative w-32 h-32 rounded-full border-2 border-primary/40 flex items-center justify-center bg-background/40"
                 style={{ boxShadow: state.pressure >= 9.6 ? "0 0 28px rgba(239,68,68,0.5)" : "0 0 24px rgba(56,189,248,0.35)" }}>
              <div className="text-center">
                <div className={`font-display text-2xl ${pressureColor}`}>{state.pressure.toFixed(2)}</div>
                <div className="text-[10px] text-muted-foreground">barg</div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">Discharge Header</div>
            <ValveButton
              label="VENT"
              state={state.valves.vent}
              onClick={() => toggleValve("vent")}
              icon={<Wind className="w-3 h-3" />}
            />
          </div>

          {/* PSA inlet valve */}
          <div className="flex flex-col items-center">
            <ValveButton label="PSA-IN" state={state.valves.psaInlet} onClick={() => toggleValve("psaInlet")} />
          </div>

          {/* PSA Unit */}
          <div className="glass-card neon-border p-4 text-center">
            <div className="text-[10px] text-muted-foreground tracking-wider mb-1">PSA UNIT</div>
            <div className="font-display text-md text-primary">60-PSA-001</div>
            <div className="mt-2 text-xs">
              <div className="text-muted-foreground">N2 Outlet</div>
              <div className={`font-mono ${state.valves.psaInlet === "OPEN" && (state.compA === "LOADING" || state.compC === "LOADING") && !state.tripped ? "text-primary" : "text-muted-foreground/60"}`}>
                {state.valves.psaInlet === "OPEN" && (state.compA === "LOADING" || state.compC === "LOADING") && !state.tripped ? "3.01 barg" : "0.00 barg"}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> OPEN / LOADING</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> CLOSED / TRIPPED</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60" /> STANDBY</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-primary" /> Trip set @ {TRIP_PRESSURE} barg</span>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components -------------------------------------------------------

function ValveButton({
  label, state, onClick, icon,
}: { label: string; state: ValveState; onClick: () => void; icon?: React.ReactNode }) {
  const open = state === "OPEN";
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-xs font-mono tracking-wider transition-all border-2 ${
        open
          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
          : "bg-destructive/20 border-destructive text-red-300"
      }`}
      style={{
        boxShadow: open
          ? "0 0 18px rgba(16,185,129,0.55)"
          : "0 0 18px rgba(239,68,68,0.55)",
      }}
    >
      <div className="flex items-center gap-1.5 justify-center">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-[9px] mt-0.5 opacity-80">{state}</div>
    </button>
  );
}

function CompressorCard({
  tag, state, onClick,
}: { tag: string; state: CompState; onClick: () => void }) {
  const cls =
    state === "LOADING"
      ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
      : state === "TRIPPED"
      ? "border-destructive bg-destructive/15 text-red-300"
      : "border-muted-foreground/40 bg-secondary/40 text-muted-foreground";
  const glow =
    state === "LOADING"
      ? "0 0 22px rgba(16,185,129,0.45)"
      : state === "TRIPPED"
      ? "0 0 22px rgba(239,68,68,0.55)"
      : "none";
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${cls}`}
      style={{ boxShadow: glow }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-md tracking-wider">{tag}</div>
          <div className="text-[10px] opacity-80">Air Compressor</div>
        </div>
        <Zap className={`w-5 h-5 ${state === "LOADING" ? "animate-pulse" : ""}`} />
      </div>
      <div className="mt-2 text-[10px] font-mono tracking-wider">{state}</div>
    </button>
  );
}
