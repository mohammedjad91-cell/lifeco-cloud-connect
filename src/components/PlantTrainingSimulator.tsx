import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, VolumeX, Volume2, ZoomIn, ZoomOut, X, ChevronUp, ChevronDown, Pencil, Plus, Minus, Trash2, Spline, MousePointer2, Save } from "lucide-react";

// ---- Editor types ----
type EditTool = "select" | "valve" | "pipe" | "label" | "delete";
interface CustomValve { id: string; x: number; y: number; state: "OPEN" | "CLOSED"; label: string; }
interface CustomPipe { id: string; x1: number; y1: number; x2: number; y2: number; color: string; }
interface CustomLabel { id: string; x: number; y: number; text: string; }
interface CustomLayer { valves: CustomValve[]; pipes: CustomPipe[]; labels: CustomLabel[]; }
const EMPTY_LAYER: CustomLayer = { valves: [], pipes: [], labels: [] };
const LS_KEY = "lifeco_ots_custom_layer_v1";

// =============================================================================
// LIFECO PMS 2026 — Operator Training Simulator (OTS)
// Authentic Yokogawa GP01 mimic clone — LIFECO IA & N2 GENERATION UNIT
// Light DCS aesthetic (gray bg, thin black lines) matching live screen.
// =============================================================================

type ValveState = "OPEN" | "CLOSED";
type CompState = "LOAD" | "UNLOAD";

interface SimState {
  pv: number; sv: number; mv: number;
  vent: ValveState; psaInlet: ValveState;
  compA: CompState; compB: CompState; compC: CompState;
  tripped: boolean;
}

const DEFAULTS: SimState = {
  pv: 9.04, sv: 9.05, mv: 26.3,
  vent: "CLOSED", psaInlet: "OPEN",
  compA: "LOAD", compB: "UNLOAD", compC: "LOAD",
  tripped: false,
};
const TRIP = 10.5;

// Yokogawa palette
const YK = {
  bg: "#d6d6d6",
  panel: "#e8e8e8",
  line: "#1a1a1a",
  text: "#111",
  dim: "#444",
  green: "#1b8a2e",
  red: "#d61f1f",
  orange: "#d96a18",
  blue: "#1b4fa6",
  cyan: "#0aa3c2",
  header: "#a0a0a0",
};

// ---------- Audio engine ----------
function useAudioEngine(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Record<string, { osc?: OscillatorNode; gain: GainNode; noise?: AudioBufferSourceNode }>>({});
  const ensureCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };
  const stop = (key: string) => {
    const n = nodesRef.current[key];
    if (!n) return;
    try { n.gain.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.05); } catch {}
    setTimeout(() => { try { n.osc?.stop(); n.noise?.stop(); } catch {} delete nodesRef.current[key]; }, 120);
  };
  const playHiss = (key: string) => {
    if (muted) return;
    const ctx = ensureCtx();
    if (nodesRef.current[key]) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1800;
    const gain = ctx.createGain(); gain.gain.value = 0; gain.gain.setTargetAtTime(0.15, ctx.currentTime, 0.05);
    src.connect(hp); hp.connect(gain); gain.connect(ctx.destination); src.start();
    nodesRef.current[key] = { noise: src, gain };
  };
  const playHum = (key: string) => {
    if (muted) return;
    const ctx = ensureCtx();
    if (nodesRef.current[key]) return;
    const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 75;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 220;
    const gain = ctx.createGain(); gain.gain.value = 0; gain.gain.setTargetAtTime(0.08, ctx.currentTime, 0.1);
    osc.connect(lp); lp.connect(gain); gain.connect(ctx.destination); osc.start();
    nodesRef.current[key] = { osc, gain };
  };
  const playSiren = (key: string) => {
    if (muted) return;
    const ctx = ensureCtx();
    if (nodesRef.current[key]) return;
    const osc = ctx.createOscillator(); osc.type = "square"; osc.frequency.value = 880;
    const gain = ctx.createGain(); gain.gain.value = 0.18;
    osc.connect(gain); gain.connect(ctx.destination); osc.start();
    const t0 = ctx.currentTime;
    for (let i = 0; i < 60; i++) osc.frequency.setValueAtTime(i % 2 ? 1320 : 660, t0 + i * 0.35);
    nodesRef.current[key] = { osc, gain };
  };
  const stopAll = () => Object.keys(nodesRef.current).forEach(stop);
  useEffect(() => { if (muted) stopAll(); }, [muted]);
  useEffect(() => () => stopAll(), []);
  return { playHiss, playHum, playSiren, stop, stopAll };
}

// ---------- Component ----------
export default function PlantTrainingSimulator() {
  const [s, setS] = useState<SimState>(DEFAULTS);
  const [zoom, setZoom] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showPIC, setShowPIC] = useState(false);
  const audio = useAudioEngine(muted);

  // ---- Editor state ----
  const [editMode, setEditMode] = useState(false);
  const [tool, setTool] = useState<EditTool>("select");
  const [layer, setLayer] = useState<CustomLayer>(() => {
    try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : EMPTY_LAYER; } catch { return EMPTY_LAYER; }
  });
  const [pipeStart, setPipeStart] = useState<{ x: number; y: number } | null>(null);
  const [pipeColor, setPipeColor] = useState("#1a1a1a");
  const [drag, setDrag] = useState<{ id: string; kind: "valve" | "label" } | null>(null);

  // Persist
  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(layer)); } catch {} }, [layer]);

  const svgPoint = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    return { x: Math.round((e.clientX - r.left) / zoom), y: Math.round((e.clientY - r.top) / zoom) };
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!editMode) return;
    const p = svgPoint(e);
    if (tool === "valve") {
      const id = "v_" + Date.now();
      setLayer((l) => ({ ...l, valves: [...l.valves, { id, x: p.x, y: p.y, state: "CLOSED", label: "VLV" }] }));
    } else if (tool === "pipe") {
      if (!pipeStart) setPipeStart(p);
      else {
        const id = "p_" + Date.now();
        setLayer((l) => ({ ...l, pipes: [...l.pipes, { id, x1: pipeStart.x, y1: pipeStart.y, x2: p.x, y2: p.y, color: pipeColor }] }));
        setPipeStart(null);
      }
    } else if (tool === "label") {
      const text = window.prompt("Label text:", "TAG");
      if (text) {
        const id = "l_" + Date.now();
        setLayer((l) => ({ ...l, labels: [...l.labels, { id, x: p.x, y: p.y, text }] }));
      }
    }
  };

  const handleItemClick = (kind: "valve" | "pipe" | "label", id: string) => {
    if (!editMode) {
      if (kind === "valve") {
        setLayer((l) => ({
          ...l,
          valves: l.valves.map((v) => v.id === id ? { ...v, state: v.state === "OPEN" ? "CLOSED" : "OPEN" } : v),
        }));
      }
      return;
    }
    if (tool === "delete") {
      setLayer((l) => ({
        valves: l.valves.filter((v) => v.id !== id),
        pipes: l.pipes.filter((p) => p.id !== id),
        labels: l.labels.filter((x) => x.id !== id),
      }));
    } else if (tool === "select" && (kind === "valve" || kind === "label")) {
      setDrag({ id, kind });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drag) return;
    const p = svgPoint(e);
    setLayer((l) => ({
      ...l,
      valves: drag.kind === "valve" ? l.valves.map((v) => v.id === drag.id ? { ...v, x: p.x, y: p.y } : v) : l.valves,
      labels: drag.kind === "label" ? l.labels.map((x) => x.id === drag.id ? { ...x, x: p.x, y: p.y } : x) : l.labels,
    }));
  };

  const handleMouseUp = () => setDrag(null);
  const clearLayer = () => { if (window.confirm("Clear all custom items?")) setLayer(EMPTY_LAYER); };


  useEffect(() => {
    const id = window.setInterval(() => {
      setS((prev) => {
        if (prev.tripped) return prev;
        const loading = [prev.compA, prev.compB, prev.compC].filter((c) => c === "LOAD").length;
        let pv = prev.pv;
        if (prev.vent === "OPEN") {
          pv = Math.max(0.2, pv - 0.55);
        } else {
          const production = 0.18 * loading;
          const outflow = (prev.mv / 100) * 0.42 * (prev.psaInlet === "OPEN" ? 1 : 0.15);
          pv = pv + production - outflow + (Math.random() - 0.5) * 0.04;
          pv = pv + (prev.sv - pv) * 0.02;
        }
        pv = Math.max(0, Math.min(15, pv));
        const tripped = pv >= TRIP ? true : prev.tripped;
        return { ...prev, pv: +pv.toFixed(2), tripped };
      });
    }, 600);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => { s.vent === "OPEN" ? audio.playHiss("vent") : audio.stop("vent"); }, [s.vent]); // eslint-disable-line
  useEffect(() => {
    const loading = [s.compA, s.compB, s.compC].some((c) => c === "LOAD");
    loading ? audio.playHum("hum") : audio.stop("hum");
  }, [s.compA, s.compB, s.compC]); // eslint-disable-line
  useEffect(() => {
    (s.tripped || (s.pv >= TRIP && s.mv < 20)) ? audio.playSiren("siren") : audio.stop("siren");
  }, [s.tripped, s.pv, s.mv]); // eslint-disable-line

  const reset = useCallback(() => { audio.stopAll(); setS(DEFAULTS); }, [audio]);
  const toggleVent = () => setS((p) => ({ ...p, vent: p.vent === "OPEN" ? "CLOSED" : "OPEN" }));
  const togglePSA = () => setS((p) => ({ ...p, psaInlet: p.psaInlet === "OPEN" ? "CLOSED" : "OPEN" }));
  const toggleComp = (k: "compA" | "compB" | "compC") =>
    setS((p) => ({ ...p, [k]: p[k] === "LOAD" ? "UNLOAD" : "LOAD" }));
  const setPV = (delta: number) =>
    setS((p) => ({ ...p, pv: Math.max(0, Math.min(15, +(p.pv + delta).toFixed(2))) }));

  return (
    <div className="space-y-2 select-none">
      {/* Yokogawa title bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#c0c0c0] border border-[#888] font-sans text-[11px] text-black">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span className="w-4 h-4 bg-[#e0e0e0] border border-[#888] text-center leading-3 text-[10px]">0</span>
            <span className="w-4 h-4 bg-[#e0e0e0] border border-[#888] text-center leading-3 text-[10px]">0</span>
            <span className="w-5 h-4 bg-[#ffd86b] border border-[#888] text-center leading-3 text-[10px]">15</span>
          </div>
          <span className="text-black">.AL Process Alarm</span>
          <span className="px-2 py-0.5 bg-white border border-[#888] text-black">GP0001 OVERVIEW ✕</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{new Date().toLocaleString()}</span>
          <span className="font-bold tracking-wider">YOKOGAWA ◆</span>
          <span className="text-[#444]">ONUSER (U1)</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1 bg-[#c8c8c8] border border-[#999] font-sans text-[11px]">
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
            className="px-2 py-0.5 bg-[#e0e0e0] border border-[#888] text-black hover:bg-white flex items-center gap-1">
            <ZoomIn className="w-3 h-3" /> Zoom +
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="px-2 py-0.5 bg-[#e0e0e0] border border-[#888] text-black hover:bg-white flex items-center gap-1">
            <ZoomOut className="w-3 h-3" /> Zoom −
          </button>
          <span className="text-[#555]">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditMode((e) => !e); setTool("select"); setPipeStart(null); }}
            className={`px-3 py-0.5 border flex items-center gap-1.5 ${editMode ? "bg-[#fff4b8] border-[#a07a00] text-[#604a00] font-bold" : "bg-[#e0e0e0] border-[#888] text-black"}`}>
            <Pencil className="w-3 h-3" /> {editMode ? "EDIT: ON" : "EDIT MODE"}
          </button>
          <button onClick={() => setMuted((m) => !m)}
            className={`px-3 py-0.5 border flex items-center gap-1.5 ${muted ? "bg-[#e0e0e0] border-[#888] text-[#444]" : "bg-[#ffd0d0] border-[#d61f1f] text-[#a01010]"}`}>
            {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />} MUTE ALARM
          </button>
          <button onClick={reset}
            className="px-3 py-0.5 bg-[#d0e0ff] border border-[#1b4fa6] text-[#1b4fa6] hover:bg-[#e0eaff] flex items-center gap-1.5">
            <RotateCcw className="w-3 h-3" /> RESET SIMULATOR
          </button>
        </div>
      </div>

      {editMode && (
        <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 bg-[#fff4b8] border border-[#a07a00] font-sans text-[11px] text-[#604a00]">
          <span className="font-bold tracking-widest">TOOLS:</span>
          {([
            { k: "select" as EditTool, label: "Select / Drag", icon: MousePointer2 },
            { k: "valve" as EditTool, label: "+ Valve", icon: Plus },
            { k: "pipe" as EditTool, label: "+ Pipe", icon: Spline },
            { k: "label" as EditTool, label: "+ Label", icon: Plus },
            { k: "delete" as EditTool, label: "Delete", icon: Trash2 },
          ]).map(({ k, label, icon: Ic }) => (
            <button key={k} onClick={() => { setTool(k); setPipeStart(null); }}
              className={`px-2 py-0.5 border flex items-center gap-1 ${tool === k ? "bg-[#604a00] text-white border-[#604a00]" : "bg-white border-[#a07a00] hover:bg-[#fff8d8]"}`}>
              <Ic className="w-3 h-3" /> {label}
            </button>
          ))}
          <span className="ml-2">Pipe color:</span>
          {["#1a1a1a", "#0aa3c2", "#1b4fa6", "#1b8a2e", "#d61f1f", "#d96a18"].map((c) => (
            <button key={c} onClick={() => setPipeColor(c)}
              className={`w-5 h-5 border-2 ${pipeColor === c ? "border-black" : "border-[#888]"}`}
              style={{ background: c }} aria-label={`pipe color ${c}`} />
          ))}
          <button onClick={clearLayer}
            className="ml-auto px-2 py-0.5 bg-[#ffd0d0] border border-[#d61f1f] text-[#a01010] flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Clear custom
          </button>
          <span className="px-2 py-0.5 bg-white border border-[#a07a00] flex items-center gap-1">
            <Save className="w-3 h-3" /> Auto-saved
          </span>
          {tool === "pipe" && pipeStart && (
            <span className="px-2 py-0.5 bg-[#cce0ff] border border-[#1b4fa6] text-[#1b4fa6]">
              Click second point to finish ({pipeStart.x},{pipeStart.y})
            </span>
          )}
        </div>
      )}

      <AnimatePresence>
        {s.tripped && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 py-1.5 bg-[#ffd0d0] border-2 border-[#d61f1f] font-mono text-sm text-[#a01010] tracking-widest animate-pulse">
            ▲ HIGH PRESSURE INTERLOCK — 60PIC006 PV {s.pv.toFixed(2)} barg ≥ {TRIP} barg — COMPRESSORS TRIPPED
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="relative bg-[#d6d6d6] border border-[#888] overflow-auto" style={{ minHeight: 720 }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: 1280, height: 720 }}>
          <MimicSVG
            s={s} onOpenPIC={() => setShowPIC(true)} onToggleVent={toggleVent} onTogglePSA={togglePSA} onToggleComp={toggleComp}
            editMode={editMode} tool={tool} layer={layer} pipeStart={pipeStart}
            onCanvasClick={handleCanvasClick} onItemClick={handleItemClick}
            onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
          />
        </div>
      </div>

      <AnimatePresence>
        {showPIC && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowPIC(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#c8c8c8] border-2 border-[#666] font-sans text-black w-[300px] shadow-2xl">
              <Faceplate s={s} setPV={setPV} onClose={() => setShowPIC(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// SVG MIMIC — authentic Yokogawa schematic (light theme, thin black pipes)
// =============================================================================
function MimicSVG({
  s, onOpenPIC, onToggleVent, onTogglePSA, onToggleComp,
  editMode, tool, layer, pipeStart, onCanvasClick, onItemClick, onMouseMove, onMouseUp,
}: {
  s: SimState;
  onOpenPIC: () => void; onToggleVent: () => void; onTogglePSA: () => void;
  onToggleComp: (k: "compA" | "compB" | "compC") => void;
  editMode: boolean; tool: EditTool; layer: CustomLayer; pipeStart: { x: number; y: number } | null;
  onCanvasClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  onItemClick: (kind: "valve" | "pipe" | "label", id: string) => void;
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseUp: () => void;
}) {
  const Pipe = ({ d }: { d: string }) => <path d={d} fill="none" stroke={YK.line} strokeWidth={1.4} />;
  // Inline label rectangle (white box with thin black border) like the DCS
  const Tag = ({ x, y, w = 70, h = 14, t, fs = 10, color = YK.text }: { x: number; y: number; w?: number; h?: number; t: string; fs?: number; color?: string }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#ffffff" stroke={YK.line} strokeWidth={0.8} />
      <text x={x + w / 2} y={y + h - 3} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={fs} fill={color}>{t}</text>
    </g>
  );
  // Diamond (instrument symbol)
  const Diamond = ({ cx, cy, r = 9, fill = "#ffffff" }: { cx: number; cy: number; r?: number; fill?: string }) => (
    <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} fill={fill} stroke={YK.line} strokeWidth={0.8} />
  );
  // Valve hourglass
  const Valve = ({ cx, cy, w = 14, h = 14, fillTop = "#ffffff", fillBot = "#ffffff", stroke = YK.line, sw = 1 }: any) => (
    <g>
      <polygon points={`${cx - w / 2},${cy - h / 2} ${cx + w / 2},${cy - h / 2} ${cx},${cy}`} fill={fillTop} stroke={stroke} strokeWidth={sw} />
      <polygon points={`${cx - w / 2},${cy + h / 2} ${cx + w / 2},${cy + h / 2} ${cx},${cy}`} fill={fillBot} stroke={stroke} strokeWidth={sw} />
    </g>
  );

  return (
    <svg width={1280} height={720} className="block"
      style={{ background: YK.bg, cursor: editMode ? (tool === "delete" ? "not-allowed" : tool === "select" ? "move" : "crosshair") : "default" }}
      onClick={onCanvasClick} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      {editMode && (
        <g>
          <defs>
            <pattern id="ots-grid" width={20} height={20} patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#b0b0b0" strokeWidth={0.4} />
            </pattern>
          </defs>
          <rect x={0} y={22} width={1280} height={698} fill="url(#ots-grid)" />
        </g>
      )}
      {/* === Title strip === */}
      <rect x={0} y={0} width={1280} height={22} fill="#bfbfbf" stroke={YK.line} strokeWidth={0.5} />
      <text x={10} y={16} fontFamily="Arial" fontSize={12} fill={YK.text} fontWeight="bold">
        GP01 - LIFECO IA &amp; N2 GENERATION UNIT - PLANT OVERVIEW
      </text>

      {/* === Utility feeds (top-left) === */}
      <Tag x={10} y={40} w={80} t="WATER" />
      <Tag x={10} y={58} w={80} t="WATER" />
      <Tag x={10} y={76} w={80} t="LP STEAM" />
      <Tag x={10} y={130} w={80} t="SERVICE AIR" />
      <Tag x={10} y={195} w={80} t="PLANT AIR" />

      {/* SERVICE AIR pressure readings */}
      <text x={130} y={120} fontFamily="Arial" fontSize={11} fill={YK.text}>0.00barg</text>
      <text x={130} y={155} fontFamily="Arial" fontSize={11} fill={YK.text}>8.95barg</text>
      <text x={230} y={120} fontFamily="Arial" fontSize={11} fill={YK.text}>9.18barg</text>

      {/* horizontal service/plant air pipes */}
      <Pipe d="M 90 137 L 360 137" />
      <Pipe d="M 90 202 L 360 202" />

      {/* Valves on service & plant air */}
      <Diamond cx={195} cy={137} />
      <text x={195} y={141} textAnchor="middle" fontFamily="Arial" fontSize={9} fill={YK.text}>M</text>
      <text x={210} y={155} fontFamily="Arial" fontSize={10} fill={YK.text}>0.0%</text>

      <Diamond cx={290} cy={202} />
      <text x={290} y={206} textAnchor="middle" fontFamily="Arial" fontSize={9} fill={YK.text}>M</text>
      <text x={305} y={220} fontFamily="Arial" fontSize={10} fill={YK.text}>22.8%</text>

      {/* === Three compressor blocks (60-1001A/B/C) === */}
      {/* feeds dropping to each compressor */}
      <Pipe d="M 360 137 L 360 215 L 395 215" />
      <Pipe d="M 360 202 L 360 305 L 395 305" />
      <Pipe d="M 360 202 L 360 405 L 395 405" />

      <CompUnit x={395} y={195} tag="60-1001A" loaded={s.compA === "LOAD"} loadLabel="LOADING" onClick={() => onToggleComp("compA")} />
      <CompUnit x={395} y={285} tag="60-1001B" loaded={s.compB === "LOAD"} loadLabel="UNLOAD" onClick={() => onToggleComp("compB")} />
      <CompUnit x={395} y={385} tag="60-1001C" loaded={s.compC === "LOAD"} loadLabel="LOADING" onClick={() => onToggleComp("compC")} />

      {/* === Discharge header to common point === */}
      <Pipe d="M 525 215 L 590 215" />
      <Pipe d="M 525 305 L 590 305" />
      <Pipe d="M 525 405 L 590 405" />
      <Pipe d="M 590 215 L 590 405" />
      <Pipe d="M 590 310 L 660 310" />

      {/* Vertical riser to dryers area */}
      <Pipe d="M 660 310 L 660 245" />
      {/* 60PIC006 valve on header (clickable) */}
      <g onClick={onOpenPIC} style={{ cursor: "pointer" }}>
        <Valve cx={660} cy={232} w={18} h={18} stroke={YK.blue} sw={1.4} />
        <Diamond cx={660} cy={213} r={7} fill="#fff" />
        <text x={660} y={216} textAnchor="middle" fontFamily="Arial" fontSize={8} fill={YK.text}>M</text>
      </g>
      <text x={680} y={235} fontFamily="Arial" fontSize={11} fill={YK.text}>9.01barg</text>

      {/* Riser to top header line */}
      <Pipe d="M 660 213 L 660 130 L 760 130" />

      {/* === Process value 36.47 °C label after-cooler === */}
      <Pipe d="M 590 310 L 590 380 L 700 380" />
      <text x={605} y={350} fontFamily="Arial" fontSize={11} fill={YK.text}>36.47°C</text>

      {/* === 60-2002 vessel === */}
      <rect x={680} y={395} width={50} height={130} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <ellipse cx={705} cy={395} rx={25} ry={6} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <ellipse cx={705} cy={525} rx={25} ry={6} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <text x={705} y={555} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text}>60-2002</text>

      {/* Discharge header pressure (locked reference) */}
      <text x={620} y={555} fontFamily="Arial" fontSize={12} fill={YK.blue} fontWeight="bold">{s.pv.toFixed(2)}barg</text>
      <text x={695} y={580} textAnchor="middle" fontFamily="Arial" fontSize={11} fill={YK.text}>43.89°C</text>

      {/* === Header top line crossing screen === */}
      <Pipe d="M 760 130 L 1140 130" />
      <text x={780} y={125} fontFamily="Arial" fontSize={10} fill={YK.text}>1Nm³/h</text>
      <text x={780} y={155} fontFamily="Arial" fontSize={10} fill={YK.red}>-0.05barg</text>
      <Diamond cx={800} cy={140} r={6} />
      <text x={800} y={144} textAnchor="middle" fontFamily="Arial" fontSize={8} fill={YK.text}>&lt;</text>

      {/* === LINDE N2 PLANT box === */}
      <rect x={770} y={70} width={150} height={50} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <text x={845} y={100} textAnchor="middle" fontFamily="Arial" fontSize={11} fill={YK.text} fontWeight="bold">LINDE N2 PLANT</text>

      {/* VENT pipe up from LINDE */}
      <Pipe d="M 845 70 L 845 40 L 920 40" />
      <text x={845} y={36} fontFamily="Arial" fontSize={10} fill={YK.text}>VENT</text>
      <g onClick={onToggleVent} style={{ cursor: "pointer" }}>
        <Valve cx={905} cy={40} w={14} h={14}
          fillTop={s.vent === "OPEN" ? "#b8f0c0" : "#ffd0d0"}
          fillBot={s.vent === "OPEN" ? "#b8f0c0" : "#ffd0d0"}
          stroke={s.vent === "OPEN" ? YK.green : YK.red} sw={1.6} />
        <text x={925} y={44} fontFamily="Arial" fontSize={10} fill={s.vent === "OPEN" ? YK.green : YK.red} fontWeight="bold">{s.vent}</text>
      </g>

      {/* === LIQUID N2 STORAGE box === */}
      <rect x={930} y={140} width={150} height={70} fill="#f4f4f4" stroke={YK.line} strokeDasharray="4 2" strokeWidth={1} />
      <text x={1005} y={158} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text} fontWeight="bold">LIQUID N2 STORAGE</text>
      <text x={1005} y={172} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text} fontWeight="bold">LIQUID N2 PUMP</text>
      <text x={1005} y={189} textAnchor="middle" fontFamily="Arial" fontSize={11} fill={YK.orange}>-0.9%</text>
      <text x={1005} y={203} textAnchor="middle" fontFamily="Arial" fontSize={11} fill={YK.red}>0.00barg</text>
      <text x={1005} y={216} fontFamily="Arial" fontSize={9} fill={YK.dim} textAnchor="middle">(not commissioned)</text>

      {/* === 60-2201 A/B dryer pair === */}
      <Pipe d="M 730 310 L 830 310" />
      <Pipe d="M 830 310 L 830 250" />
      <DryerPair x={815} y={250} tag="60-2201A/B" flow="2838Nm³/h" valvePct={48.0} />

      {/* === 60-2202 A/B dryer pair === */}
      <Pipe d="M 830 310 L 830 420" />
      <DryerPair x={815} y={420} tag="60-2202A/B" flow="2758Nm³/h" valvePct={48.0} />

      {/* === Combined to 60-2003 vessel === */}
      <Pipe d="M 880 280 L 940 280 L 940 450" />
      <Pipe d="M 880 450 L 940 450" />
      <Pipe d="M 940 450 L 990 450" />

      {/* PSA inlet valve (clickable) */}
      <g onClick={onTogglePSA} style={{ cursor: "pointer" }}>
        <Valve cx={970} cy={450} w={16} h={16}
          fillTop={s.psaInlet === "OPEN" ? "#b8f0c0" : "#ffd0d0"}
          fillBot={s.psaInlet === "OPEN" ? "#b8f0c0" : "#ffd0d0"}
          stroke={s.psaInlet === "OPEN" ? YK.green : YK.red} sw={1.6} />
        <text x={970} y={478} textAnchor="middle" fontFamily="Arial" fontSize={9} fill={s.psaInlet === "OPEN" ? YK.green : YK.red} fontWeight="bold">PSA-IN</text>
      </g>

      {/* Mid pressures */}
      <text x={755} y={295} fontFamily="Arial" fontSize={11} fill={YK.text}>7.61barg</text>
      <text x={755} y={335} fontFamily="Arial" fontSize={11} fill={YK.text}>-65.92°C</text>
      <text x={755} y={350} fontFamily="Arial" fontSize={11} fill={YK.text}>42.5°C</text>

      {/* === 60-2003 receiver === */}
      <rect x={990} y={480} width={50} height={110} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <ellipse cx={1015} cy={480} rx={25} ry={6} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <ellipse cx={1015} cy={590} rx={25} ry={6} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <text x={1015} y={615} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text}>60-2003</text>

      {/* === PSA UNIT === */}
      <rect x={1080} y={380} width={140} height={90} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.4} />
      <text x={1150} y={400} textAnchor="middle" fontFamily="Arial" fontSize={11} fill={YK.text} fontWeight="bold">PSA UNIT</text>
      <text x={1150} y={420} textAnchor="middle" fontFamily="Arial" fontSize={13} fill={YK.blue} fontWeight="bold">
        {s.psaInlet === "OPEN" && !s.tripped ? "3.01barg" : "0.00barg"}
      </text>
      <text x={1150} y={436} textAnchor="middle" fontFamily="Arial" fontSize={11} fill={YK.orange}>11951PPM</text>
      <circle cx={1110} cy={455} r={5} fill={YK.green} />
      <text x={1120} y={459} fontFamily="Arial" fontSize={10} fill={YK.text}>XA1</text>
      <circle cx={1160} cy={455} r={5} fill={YK.green} />
      <text x={1170} y={459} fontFamily="Arial" fontSize={10} fill={YK.text}>XA2</text>
      <Pipe d="M 1040 450 L 1080 450" />

      {/* === Product N2 lines === */}
      <Pipe d="M 1220 425 L 1260 425" />
      <text x={1240} y={420} fontFamily="Arial" fontSize={11} fill={YK.text}>N2</text>
      <text x={1230} y={460} fontFamily="Arial" fontSize={10} fill={YK.text}>61NM³/H</text>
      <text x={1230} y={472} fontFamily="Arial" fontSize={9} fill={YK.text}>962ppm</text>

      {/* === N2 SOC top-right === */}
      <Pipe d="M 1080 130 L 1260 130" />
      <Diamond cx={1140} cy={130} r={6} />
      <text x={1140} y={134} textAnchor="middle" fontFamily="Arial" fontSize={8} fill={YK.text}>M</text>
      <text x={1265} y={134} fontFamily="Arial" fontSize={11} fill={YK.text}>N2</text>
      <text x={1100} y={155} fontFamily="Arial" fontSize={10} fill={YK.text}>2.07barg</text>
      <text x={1100} y={170} fontFamily="Arial" fontSize={10} fill={YK.text}>0.56barg</text>
      <Pipe d="M 1140 130 L 1140 240 L 1260 240" />
      <text x={1265} y={244} fontFamily="Arial" fontSize={11} fill={YK.text}>N2 SOC</text>
      <text x={1180} y={258} fontFamily="Arial" fontSize={10} fill={YK.text}>284Nm³/h</text>

      {/* === IA SOC & INLET AIR (bottom right) === */}
      <Pipe d="M 1040 590 L 1180 590 L 1180 640 L 1260 640" />
      <text x={1265} y={644} fontFamily="Arial" fontSize={11} fill={YK.text}>IA SOC</text>
      <text x={1100} y={585} fontFamily="Arial" fontSize={10} fill={YK.text}>0.14barg</text>
      <Pipe d="M 1180 590 L 1260 590" />
      <text x={1100} y={612} fontFamily="Arial" fontSize={11} fill={YK.text}>6.68barg</text>
      <text x={1265} y={594} fontFamily="Arial" fontSize={11} fill={YK.text}>INLET AIR</text>
      <text x={1140} y={670} fontFamily="Arial" fontSize={11} fill={YK.blue} fontWeight="bold">6.64barg</text>

      {/* === Sea water cooling exchangers (bottom-left) === */}
      <Tag x={10} y={510} w={80} t="SEA WATER" />
      <Tag x={10} y={528} w={80} t="SEA WATER" />
      <rect x={120} y={500} width={90} height={45} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <text x={165} y={555} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text}>60-2102</text>
      <text x={120} y={490} fontFamily="Arial" fontSize={10} fill={YK.red}>0.96barg</text>
      <text x={120} y={478} fontFamily="Arial" fontSize={10} fill={YK.red}>21.44°C</text>

      <Tag x={10} y={620} w={80} t="WATER" />
      <Tag x={10} y={638} w={80} t="WATER" />
      <rect x={120} y={615} width={90} height={45} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <text x={165} y={670} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text}>60-2101</text>
      <text x={120} y={605} fontFamily="Arial" fontSize={10} fill={YK.text}>2.13barg</text>
      <text x={120} y={593} fontFamily="Arial" fontSize={10} fill={YK.text}>34.92°C</text>

      {/* Two recirc pumps */}
      <circle cx={290} cy={630} r={14} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <text x={290} y={634} textAnchor="middle" fontFamily="Arial" fontSize={9} fill={YK.text}>M</text>
      <text x={310} y={628} fontFamily="Arial" fontSize={9} fill={YK.text}>R 60-1101A</text>
      <rect x={272} y={650} width={36} height={12} fill="#b8f0c0" stroke={YK.green} />
      <text x={290} y={659} textAnchor="middle" fontFamily="Arial" fontSize={8} fill={YK.green} fontWeight="bold">RACKIN</text>

      <circle cx={290} cy={690} r={14} fill="#f4f4f4" stroke={YK.line} strokeWidth={1.2} />
      <text x={290} y={694} textAnchor="middle" fontFamily="Arial" fontSize={9} fill={YK.text}>M</text>
      <text x={310} y={688} fontFamily="Arial" fontSize={9} fill={YK.text}>R 60-1101B</text>
      <rect x={272} y={702} width={36} height={11} fill="#b8f0c0" stroke={YK.green} />
      <text x={290} y={710} textAnchor="middle" fontFamily="Arial" fontSize={8} fill={YK.green} fontWeight="bold">RACKIN</text>

      {/* Blue tank 60-2001 (cooler / chilled water tank) */}
      <rect x={365} y={490} width={75} height={55} fill="#5cb8ff" stroke={YK.line} strokeWidth={1.2} />
      <text x={402} y={555} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text}>60-2001</text>
      <text x={402} y={520} textAnchor="middle" fontFamily="Arial" fontSize={12} fill="#fff" fontWeight="bold">93.8%</text>
      <text x={355} y={485} fontFamily="Arial" fontSize={9} fill={YK.text}>VENT</text>

      {/* === Bottom tabs === */}
      <g fontFamily="Arial" fontSize={10} fill={YK.text}>
        {["CG1", "CG2", "CG3", "CG4", "CG5", "TG1", "INTERLOCK", "MOTOR SUMMARY"].map((t, i) => (
          <g key={t}>
            <rect x={510 + i * 92} y={695} width={88} height={20} fill="#e8e8e8" stroke={YK.line} strokeWidth={0.6} />
            <text x={510 + i * 92 + 44} y={709} textAnchor="middle">{t}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ---- Compressor (Yokogawa-style green/red panel with M/R indicator) ----
function CompUnit({
  x, y, tag, loaded, loadLabel, onClick,
}: { x: number; y: number; tag: string; loaded: boolean; loadLabel: string; onClick: () => void }) {
  const color = loaded ? YK.green : YK.red;
  const fill = loaded ? "#c8f0d0" : "#ffd0d0";
  const stateLabel = loaded ? "RACKIN" : "RACKOUT";
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* status pill (LOADING / UNLOAD) to the left */}
      <rect x={x - 70} y={y + 5} width={60} height={16} fill={loaded ? "#cce0ff" : "#ffe6c2"} stroke={YK.line} strokeWidth={0.8} />
      <text x={x - 40} y={y + 17} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text} fontWeight="bold">{loadLabel}</text>

      {/* main framed compressor */}
      <rect x={x} y={y} width={130} height={50} fill="#f4f4f4" stroke={color} strokeWidth={loaded ? 1.4 : 2.2}
        style={loaded ? undefined : { filter: "drop-shadow(0 0 6px rgba(214,31,31,0.7))" }} />
      {/* status block */}
      <rect x={x + 6} y={y + 6} width={70} height={18} fill={fill} stroke={color} strokeWidth={1.2} />
      <text x={x + 41} y={y + 19} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={color} fontWeight="bold">{stateLabel}</text>
      {/* M/R column */}
      <text x={x + 92} y={y + 16} fontFamily="Arial" fontSize={10} fill={YK.text}>M</text>
      <text x={x + 92} y={y + 32} fontFamily="Arial" fontSize={10} fill={YK.text}>R</text>
      <circle cx={x + 110} cy={y + 14} r={6} fill={color} />
      <circle cx={x + 110} cy={y + 30} r={6} fill="#f4f4f4" stroke={YK.line} strokeWidth={0.8} />
      {/* tag */}
      <text x={x + 65} y={y + 62} textAnchor="middle" fontFamily="Arial" fontSize={10} fill={YK.text}>{tag}</text>
    </g>
  );
}

// ---- Dryer pair block (two columns) ----
function DryerPair({ x, y, tag, flow, valvePct }: { x: number; y: number; tag: string; flow: string; valvePct: number }) {
  return (
    <g>
      <text x={x + 30} y={y - 4} textAnchor="middle" fontFamily="Arial" fontSize={10} fill="#111">{tag}</text>
      <rect x={x} y={y} width={26} height={55} fill="#cccccc" stroke="#1a1a1a" strokeWidth={1.2} />
      <text x={x + 22} y={y + 8} fontFamily="Arial" fontSize={8} fill="#111">M</text>
      <rect x={x + 34} y={y} width={26} height={55} fill="#cccccc" stroke="#1a1a1a" strokeWidth={1.2} />
      <text x={x + 56} y={y + 8} fontFamily="Arial" fontSize={8} fill="#111">M</text>
      {/* flow + valve % below */}
      <polygon points={`${x + 18},${y + 70} ${x + 38},${y + 70} ${x + 28},${y + 82}`}
        fill="#b8f0c0" stroke="#1b8a2e" strokeWidth={1.2} />
      <polygon points={`${x + 18},${y + 94} ${x + 38},${y + 94} ${x + 28},${y + 82}`}
        fill="#b8f0c0" stroke="#1b8a2e" strokeWidth={1.2} />
      <text x={x + 60} y={y + 88} fontFamily="Arial" fontSize={10} fill="#111">{valvePct.toFixed(1)}%</text>
      <text x={x - 5} y={y + 110} fontFamily="Arial" fontSize={11} fill="#0aa3c2" fontWeight="bold">{flow}</text>
    </g>
  );
}

// ---- 60PIC006 Faceplate (Yokogawa controller faceplate) ----
function Faceplate({
  s, setPV, onClose,
}: { s: SimState; setPV: (d: number) => void; onClose: () => void }) {
  const pct = Math.max(0, Math.min(1, s.pv / 15));
  const spPct = Math.max(0, Math.min(1, s.sv / 15));
  return (
    <>
      <div className="flex items-center justify-between px-2 py-1 bg-[#1b4fa6] border-b border-[#666]">
        <span className="text-[11px] tracking-wider text-white font-bold">60PIC006 — COMPRESSED AIR HEADER PR</span>
        <button onClick={onClose} className="text-white hover:text-red-300"><X className="w-3 h-3" /></button>
      </div>
      <div className="flex gap-1 px-2 py-1 border-b border-[#888] bg-[#d8d8d8]">
        <span className="px-2 py-0.5 bg-[#1b8a2e] text-white text-[10px] font-bold tracking-widest">AUT</span>
        <span className="px-2 py-0.5 bg-[#e8e8e8] text-black text-[10px] font-bold tracking-widest border border-[#888]">NR</span>
      </div>
      <div className="flex bg-[#c8c8c8]">
        <div className="relative w-14 h-[260px] m-2 bg-white border border-[#666]">
          {[0, 3, 6, 9, 12, 15].map((v) => (
            <div key={v} className="absolute right-full pr-1 text-[8px] text-[#333]"
              style={{ bottom: `${(v / 15) * 100}%`, transform: "translateY(50%)" }}>{v.toFixed(2)}</div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 bg-[#1b8a2e] transition-all" style={{ height: `${pct * 100}%` }} />
          <div className="absolute left-full pl-1" style={{ bottom: `${spPct * 100}%`, transform: "translateY(50%)" }}>
            <div className="text-[#d61f1f] text-sm leading-none">◄</div>
          </div>
        </div>
        <div className="flex-1 p-2 space-y-2">
          <ParamRow label="PV" value={s.pv.toFixed(2)} unit="barg" color="#1b8a2e" editable
            onUp={() => setPV(0.1)} onDown={() => setPV(-0.1)} />
          <ParamRow label="SV" value={s.sv.toFixed(2)} unit="barg" color="#d61f1f" />
          <ParamRow label="MV" value={s.mv.toFixed(1)} unit="%" color="#1b4fa6" />
        </div>
      </div>
      <div className="px-2 py-1 border-t border-[#888] bg-[#c0c0c0] text-[9px] text-[#333] tracking-widest text-center">
        TRIP @ {TRIP.toFixed(1)} barg • CLICK PV ▲▼ TO TEST
      </div>
    </>
  );
}

function ParamRow({
  label, value, unit, color, editable, onUp, onDown,
}: { label: string; value: string; unit: string; color: string; editable?: boolean; onUp?: () => void; onDown?: () => void }) {
  return (
    <div className="flex items-center justify-between bg-white border border-[#888] px-2 py-1.5">
      <span className="text-[10px] text-[#333] tracking-widest font-bold">{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>{value}</span>
        <span className="text-[9px] text-[#555]">{unit}</span>
        {editable && (
          <div className="flex flex-col ml-1">
            <button onClick={onUp} className="bg-[#e0e0e0] border border-[#888] hover:bg-white">
              <ChevronUp className="w-3 h-3 text-black" />
            </button>
            <button onClick={onDown} className="bg-[#e0e0e0] border border-[#888] hover:bg-white">
              <ChevronDown className="w-3 h-3 text-black" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
