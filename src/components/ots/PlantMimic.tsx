import { useEffect, useRef, useState } from "react";
import type { PlantState, Compressor, Valve, Pump } from "@/lib/ots-engine";
import { Pencil, Plus, Trash2, Save, X, Move } from "lucide-react";

interface Props {
  plant: PlantState;
  onCompressor: (tag: string, patch: Partial<Compressor>) => void;
  onValve: (tag: string, patch: Partial<Valve>) => void;
  onPump: (tag: string, patch: Partial<Pump>) => void;
}

const PIPE = { air: "#22d3ee", water: "#16a34a", gas: "#2563eb" };

type CustomValve = { id: string; x: number; y: number; label: string; open: boolean };
type CustomPipe = { id: string; x1: number; y1: number; x2: number; y2: number; color: keyof typeof PIPE };
type CustomLabel = { id: string; x: number; y: number; text: string };
type CustomLayer = { valves: CustomValve[]; pipes: CustomPipe[]; labels: CustomLabel[] };

const EMPTY: CustomLayer = { valves: [], pipes: [], labels: [] };
const storageKey = (id: string) => `ots-mimic-edit-${id}`;

type Tool = "select" | "valve" | "pipe" | "label" | "delete";

export function PlantMimic({ plant, onCompressor, onValve, onPump }: Props) {
  const isAmm = plant.id.startsWith("AMM");
  const [editMode, setEditMode] = useState(false);
  const [tool, setTool] = useState<Tool>("select");
  const [pipeColor, setPipeColor] = useState<keyof typeof PIPE>("gas");
  const [layer, setLayer] = useState<CustomLayer>(EMPTY);
  const [pipeStart, setPipeStart] = useState<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState<{ kind: "valve" | "label"; id: string; dx: number; dy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load per-plant layer
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(plant.id));
      setLayer(raw ? JSON.parse(raw) : EMPTY);
    } catch { setLayer(EMPTY); }
    setPipeStart(null);
  }, [plant.id]);

  // Persist
  useEffect(() => {
    try { localStorage.setItem(storageKey(plant.id), JSON.stringify(layer)); } catch { /* noop */ }
  }, [layer, plant.id]);

  const toSvgCoords = (evt: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: Math.round(p.x), y: Math.round(p.y) };
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (!editMode) return;
    if (drag) return;
    const p = toSvgCoords(e);
    if (tool === "valve") {
      const label = prompt("Valve tag (e.g. XV-9001)", "XV-NEW") || "XV-NEW";
      setLayer((L) => ({ ...L, valves: [...L.valves, { id: crypto.randomUUID(), x: p.x, y: p.y, label, open: true }] }));
    } else if (tool === "label") {
      const text = prompt("Label text", "LABEL") || "LABEL";
      setLayer((L) => ({ ...L, labels: [...L.labels, { id: crypto.randomUUID(), x: p.x, y: p.y, text }] }));
    } else if (tool === "pipe") {
      if (!pipeStart) setPipeStart(p);
      else {
        setLayer((L) => ({ ...L, pipes: [...L.pipes, { id: crypto.randomUUID(), x1: pipeStart.x, y1: pipeStart.y, x2: p.x, y2: p.y, color: pipeColor }] }));
        setPipeStart(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drag) return;
    const p = toSvgCoords(e);
    setLayer((L) => {
      if (drag.kind === "valve") {
        return { ...L, valves: L.valves.map(v => v.id === drag.id ? { ...v, x: p.x - drag.dx, y: p.y - drag.dy } : v) };
      }
      return { ...L, labels: L.labels.map(v => v.id === drag.id ? { ...v, x: p.x - drag.dx, y: p.y - drag.dy } : v) };
    });
  };

  const deleteItem = (kind: "valve" | "pipe" | "label", id: string) => {
    setLayer((L) => ({
      ...L,
      valves: kind === "valve" ? L.valves.filter(v => v.id !== id) : L.valves,
      pipes: kind === "pipe" ? L.pipes.filter(v => v.id !== id) : L.pipes,
      labels: kind === "label" ? L.labels.filter(v => v.id !== id) : L.labels,
    }));
  };

  const startDrag = (kind: "valve" | "label", id: string, cx: number, cy: number) => (e: React.MouseEvent) => {
    if (!editMode) return;
    if (tool === "delete") { deleteItem(kind, id); return; }
    if (tool !== "select") return;
    e.stopPropagation();
    const p = toSvgCoords(e);
    setDrag({ kind, id, dx: p.x - cx, dy: p.y - cy });
  };

  return (
    <div className="bg-black border-2 border-cyan-500/40 rounded-md p-4">
      <div className="text-cyan-300 font-mono text-sm mb-3 flex items-center justify-between gap-2 flex-wrap">
        <span>P&amp;ID MIMIC — {plant.name}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditMode(m => !m); setTool("select"); setPipeStart(null); setDrag(null); }}
            className={`px-2 py-1 text-[10px] font-bold border-2 flex items-center gap-1 ${editMode ? "bg-amber-500 text-black border-amber-300" : "bg-slate-800 text-cyan-300 border-cyan-500/50"}`}
          >
            {editMode ? <><Save size={12} /> DONE</> : <><Pencil size={12} /> EDIT</>}
          </button>
          <span className="text-[10px] text-slate-500">
            <span className="inline-block w-3 h-1 mr-1 align-middle" style={{ background: PIPE.air }} /> Air
            <span className="inline-block w-3 h-1 mx-1 ml-3 align-middle" style={{ background: PIPE.water }} /> Water
            <span className="inline-block w-3 h-1 mx-1 ml-3 align-middle" style={{ background: PIPE.gas }} /> Gas
          </span>
        </div>
      </div>

      {editMode && (
        <div className="mb-2 flex items-center gap-1 flex-wrap bg-slate-950 border border-amber-500/40 p-2 rounded font-mono text-[10px]">
          {([
            ["select", "SELECT / DRAG", Move],
            ["valve", "+ VALVE", Plus],
            ["pipe", "+ PIPE", Plus],
            ["label", "+ LABEL", Plus],
            ["delete", "DELETE", Trash2],
          ] as [Tool, string, typeof Move][]).map(([t, lbl, Icon]) => (
            <button key={t} onClick={() => { setTool(t); setPipeStart(null); }}
              className={`px-2 py-1 border-2 flex items-center gap-1 ${tool === t ? "bg-cyan-500 text-black border-cyan-300" : "bg-slate-800 text-slate-200 border-slate-600"}`}>
              <Icon size={11} /> {lbl}
            </button>
          ))}
          {tool === "pipe" && (
            <>
              <span className="text-slate-400 ml-2">Color:</span>
              {(Object.keys(PIPE) as (keyof typeof PIPE)[]).map(c => (
                <button key={c} onClick={() => setPipeColor(c)}
                  className={`px-2 py-1 border-2 ${pipeColor === c ? "border-white" : "border-slate-600"}`}
                  style={{ background: PIPE[c], color: "#000" }}>{c.toUpperCase()}</button>
              ))}
              {pipeStart && <span className="text-amber-300 ml-2">click endpoint…</span>}
            </>
          )}
          <button onClick={() => { if (confirm("Clear all custom edits for this plant?")) setLayer(EMPTY); }}
            className="ml-auto px-2 py-1 border-2 border-red-500 bg-red-900/40 text-red-200 flex items-center gap-1">
            <X size={11} /> CLEAR
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 800 320"
        className={`w-full h-64 ${editMode ? "cursor-crosshair" : ""}`}
        onClick={handleSvgClick}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}
      >
        {isAmm ? <AmmMimic plant={plant} /> : <DeminMimic plant={plant} />}

        {/* Custom layer */}
        {layer.pipes.map(pp => (
          <g key={pp.id} onClick={(e) => { e.stopPropagation(); if (editMode && tool === "delete") deleteItem("pipe", pp.id); }}>
            <line x1={pp.x1} y1={pp.y1} x2={pp.x2} y2={pp.y2} stroke={PIPE[pp.color]} strokeWidth={6}
              style={{ cursor: editMode && tool === "delete" ? "not-allowed" : "default" }} />
          </g>
        ))}
        {layer.valves.map(v => (
          <g key={v.id} transform={`translate(${v.x} ${v.y})`}
            onMouseDown={startDrag("valve", v.id, v.x, v.y)}
            onClick={(e) => {
              e.stopPropagation();
              if (editMode && tool === "delete") { deleteItem("valve", v.id); return; }
              if (!editMode) setLayer(L => ({ ...L, valves: L.valves.map(x => x.id === v.id ? { ...x, open: !x.open } : x) }));
            }}
            style={{ cursor: editMode ? (tool === "delete" ? "not-allowed" : "move") : "pointer" }}
          >
            <polygon points="-12,-10 12,-10 -12,10 12,10" fill={v.open ? "#16a34a" : "#dc2626"} stroke="#e2e8f0" strokeWidth={1.5} />
            <text y={-14} textAnchor="middle" fill="#e2e8f0" fontSize={9} fontFamily="monospace">{v.label}</text>
            <text y={22} textAnchor="middle" fill={v.open ? "#4ade80" : "#f87171"} fontSize={8} fontFamily="monospace" fontWeight="bold">
              {v.open ? "OPEN" : "SHUT"}
            </text>
          </g>
        ))}
        {layer.labels.map(l => (
          <g key={l.id} transform={`translate(${l.x} ${l.y})`}
            onMouseDown={startDrag("label", l.id, l.x, l.y)}
            onClick={(e) => { e.stopPropagation(); if (editMode && tool === "delete") deleteItem("label", l.id); }}
            style={{ cursor: editMode ? (tool === "delete" ? "not-allowed" : "move") : "default" }}>
            <text fill="#fde68a" fontSize={12} fontFamily="monospace" fontWeight="bold">{l.text}</text>
          </g>
        ))}
        {pipeStart && editMode && tool === "pipe" && (
          <circle cx={pipeStart.x} cy={pipeStart.y} r={5} fill="#f59e0b" />
        )}
      </svg>

      {editMode && (
        <div className="mt-2 text-[10px] text-amber-300/80 font-mono">
          {tool === "select" && "Drag valves/labels to reposition. Switch to DELETE to remove."}
          {tool === "valve" && "Click on the diagram to place a valve."}
          {tool === "pipe" && "Click start point, then click end point to draw a pipe."}
          {tool === "label" && "Click to add a text label."}
          {tool === "delete" && "Click any custom valve, pipe, or label to delete it."}
        </div>
      )}

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
      <line x1="20" y1="80" x2="200" y2="80" stroke={PIPE.gas} strokeWidth="6" />
      <text x="30" y="70" fill="#93c5fd">FEED GAS</text>
      <PVBox x={140} y={95} label="FI" value={flow?.pv.toFixed(0) ?? "—"} unit="kNm³/h" />
      <rect x="200" y="55" width="90" height="60" fill={comp?.loaded ? "#1e40af" : "#334155"} stroke="#60a5fa" strokeWidth="3" />
      <text x="245" y="88" fill="#fff" textAnchor="middle" fontWeight="bold">COMP</text>
      <text x="245" y="102" fill="#cbd5e1" textAnchor="middle" fontSize="10">{comp?.loaded ? "LOADED" : "UNLOAD"}</text>
      <line x1="290" y1="80" x2="500" y2="80" stroke={PIPE.gas} strokeWidth="6" />
      <PVBox x={370} y={55} label="PI" value={press?.pv.toFixed(0) ?? "—"} unit="bar"
        alarm={!!press && (press.pv > press.hi || press.pv < press.lo)} />
      <rect x="500" y="30" width="120" height="180" fill="#111827" stroke="#f59e0b" strokeWidth="3" />
      <text x="560" y="55" fill="#fbbf24" textAnchor="middle" fontWeight="bold">CONVERTER</text>
      <text x="560" y="130" fill="#fff" textAnchor="middle" fontSize="20" fontWeight="900">
        {temp?.pv.toFixed(0) ?? "—"}°C
      </text>
      <PVBox x={560} y={170} label="TI" value={temp?.pv.toFixed(0) ?? "—"} unit="°C"
        alarm={!!temp && (temp.pv > temp.hi || temp.pv < temp.lo)} centered />
      <line x1="620" y1="120" x2="780" y2="120" stroke={PIPE.gas} strokeWidth="6" />
      <text x="700" y="110" fill="#93c5fd" textAnchor="middle">NH₃ PRODUCT</text>
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
      <line x1="20" y1="80" x2="200" y2="80" stroke={PIPE.water} strokeWidth="6" />
      <text x="30" y="70" fill="#86efac">RAW WATER</text>
      <PVBox x={140} y={95} label="FI" value={flow?.pv.toFixed(0) ?? "—"} unit="m³/h"
        alarm={!!flow && (flow.pv > flow.hi || flow.pv < flow.lo)} />
      <rect x="200" y="40" width="80" height="90" fill="#052e16" stroke="#16a34a" strokeWidth="3" />
      <text x="240" y="90" fill="#86efac" textAnchor="middle" fontWeight="bold">CATION</text>
      <rect x="300" y="40" width="80" height="90" fill="#052e16" stroke="#16a34a" strokeWidth="3" />
      <text x="340" y="90" fill="#86efac" textAnchor="middle" fontWeight="bold">ANION</text>
      <line x1="280" y1="85" x2="300" y2="85" stroke={PIPE.water} strokeWidth="6" />
      <line x1="380" y1="85" x2="500" y2="85" stroke={PIPE.water} strokeWidth="6" />
      <PVBox x={430} y={50} label="pH" value={ph?.pv.toFixed(2) ?? "—"} unit=""
        alarm={!!ph && (ph.pv > ph.hi || ph.pv < ph.lo)} centered />
      <PVBox x={430} y={130} label="µS" value={cond?.pv.toFixed(2) ?? "—"} unit=""
        alarm={!!cond && (cond.pv > cond.hi || cond.pv < cond.lo)} centered />
      <rect x="540" y="40" width="180" height="220" fill="#0f172a" stroke="#22d3ee" strokeWidth="3" />
      <rect x="540" y={40 + (220 - (220 * lvlPct) / 100)} width="180" height={(220 * lvlPct) / 100} fill="#0e7490" opacity="0.7" />
      <text x="630" y="30" fill="#67e8f9" textAnchor="middle" fontWeight="bold">DEMIN STORAGE</text>
      <text x="630" y="160" fill="#fff" textAnchor="middle" fontSize="26" fontWeight="900">
        {lvlPct.toFixed(0)}%
      </text>
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
