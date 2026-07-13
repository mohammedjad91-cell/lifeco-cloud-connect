import type { PlantState, Compressor, Valve, Pump } from "@/lib/ots-engine";

interface Props {
  plant: PlantState;
  onCompressor: (tag: string, patch: Partial<Compressor>) => void;
  onValve: (tag: string, patch: Partial<Valve>) => void;
  onPump: (tag: string, patch: Partial<Pump>) => void;
}

// Pipe color legend: Cyan = Air, Green = Water, Blue = Gas
const PIPE = { air: "#22d3ee", water: "#16a34a", gas: "#2563eb" };

export function PlantMimic({ plant, onCompressor, onValve, onPump }: Props) {
  const isAmm = plant.id.startsWith("AMM");
  return (
    <div className="bg-black border-2 border-cyan-500/40 rounded-md p-4">
      <div className="text-cyan-300 font-mono text-sm mb-3 flex items-center justify-between">
        <span>P&amp;ID MIMIC — {plant.name}</span>
        <span className="text-[10px] text-slate-500">
          <span className="inline-block w-3 h-1 mr-1 align-middle" style={{ background: PIPE.air }} /> Air
          <span className="inline-block w-3 h-1 mx-1 ml-3 align-middle" style={{ background: PIPE.water }} /> Water
          <span className="inline-block w-3 h-1 mx-1 ml-3 align-middle" style={{ background: PIPE.gas }} /> Gas
        </span>
      </div>

      <svg viewBox="0 0 800 320" className="w-full h-64">
        {isAmm ? <AmmMimic plant={plant} /> : <DeminMimic plant={plant} />}
      </svg>

      {/* Compressors LOAD/UNLOAD */}
      {plant.compressors.length > 0 && (
        <div className="mt-4 grid gap-3">
          {plant.compressors.map((c) => (
            <div key={c.tag} className="border-2 border-blue-500/40 bg-slate-950 rounded p-3 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-300 font-bold">{c.tag}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{c.label}</div>
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.running ? "bg-emerald-500 text-black" : "bg-slate-700 text-slate-300"}`}>
                  {c.running ? "RUNNING" : "STOPPED"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-center text-xs">
                <div className="bg-black/60 p-1 rounded">
                  <div className="text-slate-400 text-[9px]">CURRENT</div>
                  <div className="text-amber-300 font-black text-base">{c.amps.toFixed(0)} A</div>
                </div>
                <div className="bg-black/60 p-1 rounded">
                  <div className="text-slate-400 text-[9px]">DISCHARGE</div>
                  <div className="text-cyan-300 font-black text-base">{c.dischargePressure.toFixed(1)} bar</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2">
                <button onClick={() => onCompressor(c.tag, { loaded: true, running: true })}
                  className={`py-1.5 text-xs font-bold border-2 ${c.loaded && c.running ? "bg-emerald-500 text-black border-emerald-300" : "bg-slate-800 text-slate-200 border-slate-600"}`}>LOAD</button>
                <button onClick={() => onCompressor(c.tag, { loaded: false })}
                  className={`py-1.5 text-xs font-bold border-2 ${!c.loaded && c.running ? "bg-amber-500 text-black border-amber-300" : "bg-slate-800 text-slate-200 border-slate-600"}`}>UNLOAD</button>
                <button onClick={() => onCompressor(c.tag, { running: !c.running, loaded: false })}
                  className={`py-1.5 text-xs font-bold border-2 ${!c.running ? "bg-red-500 text-white border-red-300" : "bg-slate-800 text-slate-200 border-slate-600"}`}>
                  {c.running ? "STOP" : "START"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Valves */}
      {plant.valves.length > 0 && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {plant.valves.map((v) => (
            <div key={v.tag} className="border border-cyan-500/30 bg-slate-950 rounded p-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-300 font-bold">{v.tag}</span>
                <span className="text-slate-400">{v.label}</span>
                <span className="text-amber-300 font-black">{v.open.toFixed(0)}%</span>
              </div>
              <input type="range" min={0} max={100} value={v.open}
                onChange={(e) => onValve(v.tag, { open: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Dosing pumps */}
      {plant.pumps.length > 0 && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {plant.pumps.map((p) => (
            <div key={p.tag} className="border border-emerald-500/30 bg-slate-950 rounded p-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-bold">{p.tag}</span>
                <span className="text-slate-400">{p.label}</span>
                <button onClick={() => onPump(p.tag, { running: !p.running })}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${p.running ? "bg-emerald-500 text-black" : "bg-red-500 text-white"}`}>
                  {p.running ? "RUN" : "OFF"}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400">SPM</span>
                <input type="range" min={0} max={100} value={p.strokes}
                  onChange={(e) => onPump(p.tag, { strokes: parseFloat(e.target.value) })}
                  className="flex-1 accent-emerald-400" />
                <span className="text-amber-300 font-black text-xs w-8 text-right">{p.strokes.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AmmMimic({ plant }: { plant: PlantState }) {
  const press = plant.loops.find((l) => l.tag === "60PIC006");
  const temp = plant.loops.find((l) => l.tag === "21TIC340");
  const flow = plant.loops.find((l) => l.tag === "21FIC101");
  const comp = plant.compressors[0];
  return (
    <g fontFamily="monospace" fontSize="12">
      {/* Feed gas (blue) */}
      <line x1="20" y1="80" x2="200" y2="80" stroke={PIPE.gas} strokeWidth="6" />
      <text x="30" y="70" fill="#93c5fd">FEED GAS</text>
      <PVBox x={140} y={95} label="FI" value={flow?.pv.toFixed(0) ?? "—"} unit="kNm³/h" />

      {/* Compressor block */}
      <rect x="200" y="55" width="90" height="60" fill={comp?.loaded ? "#1e40af" : "#334155"} stroke="#60a5fa" strokeWidth="3" />
      <text x="245" y="88" fill="#fff" textAnchor="middle" fontWeight="bold">COMP</text>
      <text x="245" y="102" fill="#cbd5e1" textAnchor="middle" fontSize="10">{comp?.loaded ? "LOADED" : "UNLOAD"}</text>

      {/* Pipe to converter */}
      <line x1="290" y1="80" x2="500" y2="80" stroke={PIPE.gas} strokeWidth="6" />
      <PVBox x={370} y={55} label="PI" value={press?.pv.toFixed(0) ?? "—"} unit="bar"
        alarm={!!press && (press.pv > press.hi || press.pv < press.lo)} />

      {/* Converter */}
      <rect x="500" y="30" width="120" height="180" fill="#111827" stroke="#f59e0b" strokeWidth="3" />
      <text x="560" y="55" fill="#fbbf24" textAnchor="middle" fontWeight="bold">CONVERTER</text>
      <text x="560" y="130" fill="#fff" textAnchor="middle" fontSize="20" fontWeight="900">
        {temp?.pv.toFixed(0) ?? "—"}°C
      </text>
      <PVBox x={560} y={170} label="TI" value={temp?.pv.toFixed(0) ?? "—"} unit="°C"
        alarm={!!temp && (temp.pv > temp.hi || temp.pv < temp.lo)} centered />

      {/* Product line (cyan air-style, ammonia gas out) */}
      <line x1="620" y1="120" x2="780" y2="120" stroke={PIPE.gas} strokeWidth="6" />
      <text x="700" y="110" fill="#93c5fd" textAnchor="middle">NH₃ PRODUCT</text>

      {/* Cooling water */}
      <line x1="500" y1="240" x2="620" y2="240" stroke={PIPE.water} strokeWidth="5" />
      <line x1="560" y1="210" x2="560" y2="240" stroke={PIPE.water} strokeWidth="5" />
      <text x="560" y="260" fill="#86efac" textAnchor="middle" fontSize="10">COOLING WATER</text>
    </g>
  );
}

function DeminMimic({ plant }: { plant: PlantState }) {
  const flow = plant.loops.find((l) => l.tag === "DM-FIC-101");
  const ph = plant.loops.find((l) => l.tag === "DM-AIC-201");
  const cond = plant.loops.find((l) => l.tag === "DM-CIC-301");
  const level = plant.loops.find((l) => l.tag === "DM-LIC-401");
  const lvlPct = level ? Math.max(0, Math.min(100, level.pv)) : 0;
  return (
    <g fontFamily="monospace" fontSize="12">
      {/* Raw water in (green) */}
      <line x1="20" y1="80" x2="200" y2="80" stroke={PIPE.water} strokeWidth="6" />
      <text x="30" y="70" fill="#86efac">RAW WATER</text>
      <PVBox x={140} y={95} label="FI" value={flow?.pv.toFixed(0) ?? "—"} unit="m³/h"
        alarm={!!flow && (flow.pv > flow.hi || flow.pv < flow.lo)} />

      {/* Ion exchange trains */}
      <rect x="200" y="40" width="80" height="90" fill="#052e16" stroke="#16a34a" strokeWidth="3" />
      <text x="240" y="90" fill="#86efac" textAnchor="middle" fontWeight="bold">CATION</text>
      <rect x="300" y="40" width="80" height="90" fill="#052e16" stroke="#16a34a" strokeWidth="3" />
      <text x="340" y="90" fill="#86efac" textAnchor="middle" fontWeight="bold">ANION</text>
      <line x1="280" y1="85" x2="300" y2="85" stroke={PIPE.water} strokeWidth="6" />
      <line x1="380" y1="85" x2="500" y2="85" stroke={PIPE.water} strokeWidth="6" />

      {/* Analyzers */}
      <PVBox x={430} y={50} label="pH" value={ph?.pv.toFixed(2) ?? "—"} unit=""
        alarm={!!ph && (ph.pv > ph.hi || ph.pv < ph.lo)} centered />
      <PVBox x={430} y={130} label="µS" value={cond?.pv.toFixed(2) ?? "—"} unit=""
        alarm={!!cond && (cond.pv > cond.hi || cond.pv < cond.lo)} centered />

      {/* Tank */}
      <rect x="540" y="40" width="180" height="220" fill="#0f172a" stroke="#22d3ee" strokeWidth="3" />
      <rect x="540" y={40 + (220 - (220 * lvlPct) / 100)} width="180" height={(220 * lvlPct) / 100} fill="#0e7490" opacity="0.7" />
      <text x="630" y="30" fill="#67e8f9" textAnchor="middle" fontWeight="bold">DEMIN STORAGE</text>
      <text x="630" y="160" fill="#fff" textAnchor="middle" fontSize="26" fontWeight="900">
        {lvlPct.toFixed(0)}%
      </text>

      {/* Chemical lines */}
      <line x1="240" y1="130" x2="240" y2="200" stroke="#f59e0b" strokeWidth="4" />
      <line x1="340" y1="130" x2="340" y2="200" stroke="#8b5cf6" strokeWidth="4" />
      <text x="240" y="215" fill="#fbbf24" textAnchor="middle" fontSize="10">ACID</text>
      <text x="340" y="215" fill="#c4b5fd" textAnchor="middle" fontSize="10">CAUSTIC</text>
    </g>
  );
}

function PVBox({ x, y, label, value, unit, alarm, centered }: {
  x: number; y: number; label: string; value: string; unit: string; alarm?: boolean; centered?: boolean;
}) {
  const w = 64, h = 30;
  const xx = centered ? x - w / 2 : x;
  return (
    <g>
      <rect x={xx} y={y} width={w} height={h} fill="#000" stroke={alarm ? "#ef4444" : "#22d3ee"} strokeWidth="2" />
      <text x={xx + 4} y={y + 11} fill="#94a3b8" fontSize="9">{label}</text>
      <text x={xx + w - 4} y={y + 22} fill={alarm ? "#f87171" : "#4ade80"} fontSize="14" fontWeight="900" textAnchor="end">{value}</text>
      {unit && <text x={xx + 4} y={y + 26} fill="#64748b" fontSize="8">{unit}</text>}
    </g>
  );
}
