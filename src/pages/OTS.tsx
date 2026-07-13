import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  INITIAL_PLANTS, stepPlant, collectAlarms, startSiren, stopSiren,
  type PlantState, type Loop, type Compressor, type Valve, type Pump, type Alarm,
} from "@/lib/ots-engine";
import { Faceplate } from "@/components/ots/Faceplate";
import { PlantMimic } from "@/components/ots/PlantMimic";
import { AlertTriangle, VolumeX, Volume2, Home } from "lucide-react";

export default function OTS() {
  const [plants, setPlants] = useState<PlantState[]>(INITIAL_PLANTS);
  const [activeId, setActiveId] = useState<PlantState["id"]>("AMM1");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [muted, setMuted] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(performance.now());

  // Simulation loop
  useEffect(() => {
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.5, (now - lastRef.current) / 1000);
      lastRef.current = now;
      setPlants((prev) => prev.map((p) => stepPlant(p, dt)));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Alarm collection
  useEffect(() => {
    const t = setInterval(() => {
      const a = collectAlarms(plants, Date.now());
      setAlarms(a);
      if (a.length === 0) setAcknowledged(false);
    }, 500);
    return () => clearInterval(t);
  }, [plants]);

  // Siren control
  useEffect(() => {
    if (alarms.length > 0 && !muted && !acknowledged) startSiren();
    else stopSiren();
    return () => stopSiren();
  }, [alarms.length, muted, acknowledged]);

  const active = useMemo(() => plants.find((p) => p.id === activeId)!, [plants, activeId]);

  const updateLoop = (loopTag: string, patch: Partial<Loop>) => {
    setPlants((prev) => prev.map((p) => p.id !== activeId ? p : {
      ...p, loops: p.loops.map((l) => l.tag === loopTag ? { ...l, ...patch } : l),
    }));
  };
  const updateCompressor = (tag: string, patch: Partial<Compressor>) => {
    setPlants((prev) => prev.map((p) => p.id !== activeId ? p : {
      ...p, compressors: p.compressors.map((c) => c.tag === tag ? { ...c, ...patch } : c),
    }));
  };
  const updateValve = (tag: string, patch: Partial<Valve>) => {
    setPlants((prev) => prev.map((p) => p.id !== activeId ? p : {
      ...p, valves: p.valves.map((v) => v.tag === tag ? { ...v, ...patch } : v),
    }));
  };
  const updatePump = (tag: string, patch: Partial<Pump>) => {
    setPlants((prev) => prev.map((p) => p.id !== activeId ? p : {
      ...p, pumps: p.pumps.map((x) => x.tag === tag ? { ...x, ...patch } : x),
    }));
  };

  const activeAlarms = alarms.filter((a) => a.plantId === activeId);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="border-b-2 border-cyan-500/50 bg-slate-950">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-cyan-300 hover:text-cyan-100"><Home size={18} /></Link>
            <div className="font-mono text-cyan-300 font-black text-lg tracking-widest">
              LIFECO OTS · YOKOGAWA-STYLE DCS
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              className="px-3 py-1.5 border-2 border-slate-600 bg-slate-800 font-mono text-xs flex items-center gap-1"
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />} {muted ? "MUTED" : "AUDIO ON"}
            </button>
          </div>
        </div>

        {/* Plant tabs */}
        <div className="max-w-[1600px] mx-auto px-4 pb-2 flex gap-1">
          {plants.map((p) => {
            const pAlarm = alarms.some((a) => a.plantId === p.id);
            const isActive = p.id === activeId;
            return (
              <button key={p.id} onClick={() => setActiveId(p.id)}
                className={`px-4 py-2 font-mono text-xs font-bold border-2 flex items-center gap-2
                  ${isActive ? "bg-cyan-500 text-black border-cyan-300" : "bg-slate-900 text-slate-200 border-slate-700 hover:border-cyan-500/50"}
                  ${pAlarm ? "ring-2 ring-red-500 animate-pulse" : ""}`}>
                {p.name}
                {pAlarm && <AlertTriangle size={12} className="text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alarm banner */}
      {activeAlarms.length > 0 && (
        <div className={`bg-red-600 text-white ${acknowledged ? "" : "animate-pulse"} border-y-2 border-red-300`}>
          <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center gap-3">
            <AlertTriangle className="flex-shrink-0" />
            <div className="flex-1 font-mono text-sm">
              <span className="font-black">ALARM ({activeAlarms.length}):</span>{" "}
              {activeAlarms.slice(0, 3).map((a) => (
                <span key={a.tag} className="mr-3">
                  {a.tag} {a.kind} {a.value.toFixed(1)} (limit {a.limit})
                </span>
              ))}
            </div>
            <button onClick={() => setAcknowledged(true)}
              className="px-3 py-1 bg-white text-red-700 font-mono font-black text-xs">ACK</button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-[1600px] mx-auto p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <PlantMimic
            plant={active}
            onCompressor={updateCompressor}
            onValve={updateValve}
            onPump={updatePump}
          />
        </div>

        <div className="space-y-3">
          <div className="font-mono text-cyan-300 text-sm font-bold tracking-wider">
            CONTROLLER FACEPLATES
          </div>
          {active.loops.map((l) => (
            <Faceplate key={l.tag} loop={l} onChange={(patch) => updateLoop(l.tag, patch)} />
          ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 pb-6 text-[10px] text-slate-500 font-mono">
        Training simulator — not connected to live process. Click any plant tab to switch. Use LOAD/UNLOAD, valve sliders, and setpoints to drive PVs into alarm bands and test response.
      </div>
    </div>
  );
}
