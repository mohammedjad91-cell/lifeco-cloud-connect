import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, VolumeX, Volume2, ZoomIn, ZoomOut, X, ChevronUp, ChevronDown } from "lucide-react";

// =============================================================================
// LIFECO PMS 2026 — Operator Training Simulator (OTS)
// Industrial Yokogawa-style mimic clone — GP01 LIFECO IA & N2 GENERATION UNIT
// =============================================================================

type ValveState = "OPEN" | "CLOSED";
type CompState = "LOAD" | "UNLOAD";

interface SimState {
  pv: number;          // 60PIC006 PV — header pressure barg
  sv: number;          // setpoint
  mv: number;          // valve opening %
  vent: ValveState;
  psaInlet: ValveState;
  compA: CompState;
  compB: CompState;
  compC: CompState;
  tripped: boolean;
}

const DEFAULTS: SimState = {
  pv: 9.04, sv: 9.05, mv: 26.3,
  vent: "CLOSED" as ValveState, psaInlet: "OPEN" as ValveState,
  compA: "LOAD" as CompState, compB: "UNLOAD" as CompState, compC: "LOAD" as CompState,
  tripped: false as boolean,
};

const TRIP = 10.5;

// ---------- Audio engine (Web Audio API — no external mp3 needed) ----------
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
    setTimeout(() => {
      try { n.osc?.stop(); n.noise?.stop(); } catch {}
      delete nodesRef.current[key];
    }, 120);
  };

  const playHiss = (key: string) => {
    if (muted) return;
    const ctx = ensureCtx();
    if (nodesRef.current[key]) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
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
    // pulse between 660 and 1320 Hz
    const t0 = ctx.currentTime;
    for (let i = 0; i < 60; i++) {
      osc.frequency.setValueAtTime(i % 2 ? 1320 : 660, t0 + i * 0.35);
    }
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

  // ---- Process simulation tick (every 600ms) ----
  useEffect(() => {
    const id = window.setInterval(() => {
      setS((prev) => {
        if (prev.tripped) return prev;
        const loading = [prev.compA, prev.compB, prev.compC].filter((c) => c === "LOAD").length;
        let pv = prev.pv;

        if (prev.vent === "OPEN") {
          pv = Math.max(0.2, pv - 0.55);
        } else {
          // production minus outflow via MV opening
          const production = 0.18 * loading;
          const outflow = (prev.mv / 100) * 0.42 * (prev.psaInlet === "OPEN" ? 1 : 0.15);
          pv = pv + production - outflow + (Math.random() - 0.5) * 0.04;
          // gentle pull toward SV when balanced
          pv = pv + (prev.sv - pv) * 0.02;
        }
        pv = Math.max(0, Math.min(15, pv));

        let tripped: boolean = prev.tripped;
        if (pv >= TRIP) tripped = true;

        return { ...prev, pv: +pv.toFixed(2), tripped };
      });
    }, 600);
    return () => window.clearInterval(id);
  }, []);

  // ---- Audio reactions ----
  useEffect(() => {
    if (s.vent === "OPEN") audio.playHiss("vent"); else audio.stop("vent");
  }, [s.vent]); // eslint-disable-line
  useEffect(() => {
    const loading = [s.compA, s.compB, s.compC].some((c) => c === "LOAD");
    if (loading) audio.playHum("hum"); else audio.stop("hum");
  }, [s.compA, s.compB, s.compC]); // eslint-disable-line
  useEffect(() => {
    if (s.tripped || (s.pv >= TRIP && s.mv < 20)) audio.playSiren("siren"); else audio.stop("siren");
  }, [s.tripped, s.pv, s.mv]); // eslint-disable-line

  const reset = useCallback(() => {
    audio.stopAll();
    setS(DEFAULTS);
  }, [audio]);

  const toggleVent = () => setS((p) => ({ ...p, vent: p.vent === "OPEN" ? "CLOSED" : "OPEN" }));
  const togglePSA = () => setS((p) => ({ ...p, psaInlet: p.psaInlet === "OPEN" ? "CLOSED" : "OPEN" }));
  const toggleComp = (k: "compA" | "compB" | "compC") =>
    setS((p) => ({ ...p, [k]: p[k] === "LOAD" ? "UNLOAD" : "LOAD" }));

  const setPV = (delta: number) => setS((p) => ({ ...p, pv: Math.max(0, Math.min(15, +(p.pv + delta).toFixed(2))) }));

  // ---- Colors (Yokogawa-ish) ----
  const C = {
    air: "#00d4ff",       // glowing cyan
    water: "#0d7a3a",     // dark green
    n2: "#5cb8ff",        // vivid light blue
    pipeStroke: 3,
    label: "#cfd6dd",
    grid: "#1a1a1a",
  };

  return (
    <div className="space-y-3">
      {/* ===== Top status bar (mimic DCS title bar) ===== */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] font-mono text-[11px] text-[#cfd6dd]">
        <div className="flex items-center gap-4">
          <span className="text-[#00d4ff]">●</span>
          <span className="tracking-widest">GP01 — LIFECO IA &amp; N2 GENERATION UNIT — PLANT OVERVIEW</span>
        </div>
        <div className="flex items-center gap-3">
          <span>LIFECO PMS 2026 / OTS</span>
          <span className="text-[#888]">{new Date().toLocaleString()}</span>
          <span className="text-[#00d4ff]">YOKOGAWA ◆</span>
        </div>
      </div>

      {/* ===== Floating toolbar ===== */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#1f1f1f]">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
            className="px-2 py-1 bg-[#141414] border border-[#2a2a2a] text-[#cfd6dd] hover:bg-[#1c1c1c] flex items-center gap-1">
            <ZoomIn className="w-3 h-3" /> Zoom +
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="px-2 py-1 bg-[#141414] border border-[#2a2a2a] text-[#cfd6dd] hover:bg-[#1c1c1c] flex items-center gap-1">
            <ZoomOut className="w-3 h-3" /> Zoom −
          </button>
          <span className="text-[#666] ml-1">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button onClick={() => setMuted((m) => !m)}
            className={`px-3 py-1 border flex items-center gap-1.5 ${muted ? "bg-[#141414] border-[#2a2a2a] text-[#888]" : "bg-[#3a0d0d] border-[#ff3333] text-[#ff8c8c]"}`}>
            {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />} MUTE ALARM
          </button>
          <button onClick={reset}
            className="px-3 py-1 bg-[#0d2a3a] border border-[#00d4ff] text-[#00d4ff] hover:bg-[#0f3a4a] flex items-center gap-1.5">
            <RotateCcw className="w-3 h-3" /> RESET SIMULATOR
          </button>
        </div>
      </div>

      {/* ===== Trip banner ===== */}
      <AnimatePresence>
        {s.tripped && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 py-2 bg-[#3a0d0d] border-2 border-[#ff3333] font-mono text-sm text-[#ff8080] tracking-widest animate-pulse">
            ▲ HIGH PRESSURE INTERLOCK — 60PIC006 PV {s.pv.toFixed(2)} barg ≥ {TRIP} barg — COMPRESSORS TRIPPED
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Mimic canvas ===== */}
      <div className="relative bg-black border border-[#1f1f1f] overflow-auto" style={{ minHeight: 620 }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: 1280, height: 620 }}>
          <MimicSVG s={s} C={C} onOpenPIC={() => setShowPIC(true)} onToggleVent={toggleVent} onTogglePSA={togglePSA} />

          {/* Compressor manual toggles overlay (positioned absolutely over SVG blocks) */}
          <CompressorToggle x={170} y={170} tag="60-1001A" state={s.compA} onToggle={() => toggleComp("compA")} />
          <CompressorToggle x={170} y={290} tag="60-1001B" state={s.compB} onToggle={() => toggleComp("compB")} />
          <CompressorToggle x={170} y={410} tag="60-1001C" state={s.compC} onToggle={() => toggleComp("compC")} />
        </div>
      </div>

      {/* ===== 60PIC006 Faceplate overlay ===== */}
      <AnimatePresence>
        {showPIC && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowPIC(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1d24] border-2 border-[#3a4250] font-mono text-[#e6e9ef] w-[300px] shadow-[0_0_40px_rgba(0,212,255,0.3)]">
              <Faceplate s={s} setPV={setPV} onClose={() => setShowPIC(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// SVG MIMIC — process flow diagram
// =============================================================================
function MimicSVG({
  s, C, onOpenPIC, onToggleVent, onTogglePSA,
}: {
  s: SimState; C: any;
  onOpenPIC: () => void; onToggleVent: () => void; onTogglePSA: () => void;
}) {
  const pipe = (d: string, color: string) => (
    <path d={d} fill="none" stroke={color} strokeWidth={C.pipeStroke}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
  );

  return (
    <svg width={1280} height={620} className="block">
      {/* faint grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0d0d0d" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1280" height="620" fill="#000" />
      <rect width="1280" height="620" fill="url(#grid)" />

      {/* === Utility feed labels (top-left) === */}
      <g fontFamily="monospace" fontSize="11" fill={C.label}>
        <rect x={20} y={50} width={90} height={18} fill="none" stroke="#2a2a2a" />
        <text x={28} y={63}>WATER</text>
        <rect x={20} y={72} width={90} height={18} fill="none" stroke="#2a2a2a" />
        <text x={28} y={85}>WATER</text>
        <rect x={20} y={94} width={90} height={18} fill="none" stroke="#2a2a2a" />
        <text x={28} y={107}>LP STEAM</text>
        <rect x={20} y={130} width={90} height={18} fill="none" stroke="#2a2a2a" />
        <text x={28} y={143}>SERVICE AIR</text>
        <rect x={20} y={210} width={90} height={18} fill="none" stroke="#2a2a2a" />
        <text x={28} y={223}>PLANT AIR</text>
        <rect x={20} y={510} width={90} height={18} fill="none" stroke="#2a2a2a" />
        <text x={28} y={523}>SEA WATER</text>
        <rect x={20} y={532} width={90} height={18} fill="none" stroke="#2a2a2a" />
        <text x={28} y={545}>SEA WATER</text>
      </g>

      {/* === Service / Plant air header to compressors === */}
      {pipe("M 110 139 L 350 139", C.air)}
      {pipe("M 110 219 L 350 219", C.air)}
      {/* feeds to A/B/C compressor blocks (right angles) */}
      {pipe("M 350 139 L 350 230 L 380 230", C.air)}
      {pipe("M 350 219 L 350 350 L 380 350", C.air)}
      {pipe("M 350 219 L 350 470 L 380 470", C.air)}

      {/* Service air reading card */}
      <DataCard x={130} y={108} w={90} value="0.00 barg" />
      <DataCard x={130} y={158} w={90} value="8.95 barg" />
      <DataCard x={230} y={108} w={90} value="9.18 barg" />

      {/* === Compressor block frames (RACKIN/RACKOUT visuals) === */}
      <CompBlock x={380} y={180} loaded={s.compA === "LOAD"} />
      <CompBlock x={380} y={300} loaded={s.compB === "LOAD"} />
      <CompBlock x={380} y={420} loaded={s.compC === "LOAD"} />

      {/* === Discharge pipes to common header → 60-2002 === */}
      {pipe("M 500 230 L 580 230 L 580 360", C.air)}
      {pipe("M 500 350 L 580 350", C.air)}
      {pipe("M 500 470 L 580 470 L 580 360", C.air)}

      {/* Vertical pipe to 60-2002 vessel */}
      {pipe("M 580 360 L 580 280", C.air)}
      {pipe("M 580 280 L 700 280", C.air)}

      {/* === 60PIC006 valve symbol on header above 60-2002 === */}
      <g onClick={onOpenPIC} style={{ cursor: "pointer" }}>
        <polygon points="640,265 660,265 650,280" fill="#0a0a0a" stroke={C.air} strokeWidth="2" />
        <polygon points="640,295 660,295 650,280" fill="#0a0a0a" stroke={C.air} strokeWidth="2" />
        <circle cx="650" cy="255" r="9" fill="#0a0a0a" stroke={C.air} strokeWidth="1.5" />
        <text x="650" y="259" textAnchor="middle" fontFamily="monospace" fontSize="9" fill={C.air}>M</text>
        <rect x={605} y={232} width={90} height={18} fill="#0a0a0a" stroke={C.air} />
        <text x={650} y={245} textAnchor="middle" fontFamily="monospace" fontSize="10" fill={C.air}>60PIC006</text>
        <text x={695} y={310} fontFamily="monospace" fontSize="11" fill="#ffd86b">{s.mv.toFixed(1)}%</text>
      </g>

      {/* === 60-2002 vessel === */}
      <rect x={685} y={310} width={50} height={130} fill="#0a0a0a" stroke="#888" strokeWidth="1.5" />
      <rect x={685} y={310} width={50} height={130} fill="url(#vesselGloss)" opacity="0.2" />
      <text x={710} y={460} textAnchor="middle" fontFamily="monospace" fontSize="10" fill={C.label}>60-2002</text>

      {/* Discharge header pressure card */}
      <DataCard x={620} y={460} w={110} value={`${s.pv.toFixed(2)} barg`} highlight />

      {/* === Pipe to dryers 60-2201 A/B and 60-2202 A/B === */}
      {pipe("M 735 360 L 820 360", C.air)}
      {pipe("M 820 360 L 820 280", C.air)}
      {pipe("M 820 360 L 820 440", C.air)}

      {/* Dryer blocks */}
      <DryerBlock x={830} y={250} tag="60-2201A/B" flow="2838 Nm³/h" />
      <DryerBlock x={830} y={410} tag="60-2202A/B" flow="2758 Nm³/h" />

      {/* === Out from dryers to PSA vessel 60-2003 === */}
      {pipe("M 920 280 L 980 280 L 980 470", C.air)}
      {pipe("M 920 440 L 980 440", C.air)}

      {/* PSA inlet valve (clickable) */}
      <g onClick={onTogglePSA} style={{ cursor: "pointer" }}>
        <polygon points="965,460 995,460 980,475"
          fill={s.psaInlet === "OPEN" ? "#0a3a0a" : "#3a0a0a"}
          stroke={s.psaInlet === "OPEN" ? "#3aff6e" : "#ff3a3a"} strokeWidth="2" />
        <polygon points="965,490 995,490 980,475"
          fill={s.psaInlet === "OPEN" ? "#0a3a0a" : "#3a0a0a"}
          stroke={s.psaInlet === "OPEN" ? "#3aff6e" : "#ff3a3a"} strokeWidth="2" />
        <text x={1000} y={478} fontFamily="monospace" fontSize="9" fill={s.psaInlet === "OPEN" ? "#3aff6e" : "#ff3a3a"}>
          PSA-IN {s.psaInlet}
        </text>
      </g>

      {/* === PSA UNIT === */}
      {pipe("M 980 500 L 1080 500", C.n2)}
      <rect x={1080} y={440} width={140} height={90} fill="#0a0a0a" stroke="#888" strokeWidth="1.5" />
      <text x={1150} y={460} textAnchor="middle" fontFamily="monospace" fontSize="11" fill={C.label}>PSA UNIT</text>
      <text x={1150} y={480} textAnchor="middle" fontFamily="monospace" fontSize="13" fill={C.n2}>
        {s.psaInlet === "OPEN" && !s.tripped ? "3.01 barg" : "0.00 barg"}
      </text>
      <text x={1150} y={498} textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#ff8c4a">11951 ppm</text>
      <circle cx={1110} cy={518} r="5" fill="#3aff6e" /><text x={1120} y={522} fontFamily="monospace" fontSize="9" fill={C.label}>XA1</text>
      <circle cx={1160} cy={518} r="5" fill="#3aff6e" /><text x={1170} y={522} fontFamily="monospace" fontSize="9" fill={C.label}>XA2</text>

      {/* === N2 product line === */}
      {pipe("M 1220 485 L 1260 485", C.n2)}
      <text x={1230} y={478} fontFamily="monospace" fontSize="10" fill={C.n2}>N2</text>

      {/* === VENT valve (top center) === */}
      <g onClick={onToggleVent} style={{ cursor: "pointer" }}>
        {pipe("M 580 280 L 580 200 L 540 200", C.air)}
        <polygon points="510,190 540,190 525,200"
          fill={s.vent === "OPEN" ? "#0a3a0a" : "#3a0a0a"}
          stroke={s.vent === "OPEN" ? "#3aff6e" : "#ff3a3a"} strokeWidth="2" />
        <polygon points="510,210 540,210 525,200"
          fill={s.vent === "OPEN" ? "#0a3a0a" : "#3a0a0a"}
          stroke={s.vent === "OPEN" ? "#3aff6e" : "#ff3a3a"} strokeWidth="2" />
        <text x={460} y={185} fontFamily="monospace" fontSize="10" fill={s.vent === "OPEN" ? "#3aff6e" : "#ff3a3a"}>
          VENT {s.vent}
        </text>
        <text x={500} y={175} fontFamily="monospace" fontSize="9" fill={C.label}>↑ VENT</text>
      </g>

      {/* === Cooling water (sea water) feed bottom === */}
      {pipe("M 110 519 L 300 519 L 300 560 L 800 560", C.water)}
      <DataCard x={130} y={540} w={90} value="0.96 barg" />
      <DataCard x={230} y={540} w={90} value="21.44 °C" />

      {/* === LIQUID N2 STORAGE (offline notice) === */}
      <rect x={1080} y={310} width={140} height={90} fill="#0a0a0a" stroke="#444" strokeWidth="1" strokeDasharray="4 3" />
      <text x={1150} y={328} textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#666">LIQUID N2 STORAGE</text>
      <text x={1150} y={344} textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#666">LIQUID N2 PUMP</text>
      <text x={1150} y={364} textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#ff8c4a">-0.9%</text>
      <text x={1150} y={380} textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#ff8c4a">0.00 barg</text>
      <text x={1150} y={395} textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#666">— NOT COMMISSIONED —</text>

      {/* === Inlet air pressure reading (right) === */}
      <DataCard x={1110} y={570} w={120} value="6.64 barg" />
      <text x={1170} y={595} textAnchor="middle" fontFamily="monospace" fontSize="9" fill={C.label}>INLET AIR HDR</text>

      {/* Bottom tabs (mimic) */}
      <g fontFamily="monospace" fontSize="10" fill="#888">
        {["CG1","CG2","CG3","CG4","CG5","TG1","INTERLOCK","MOTOR SUMMARY"].map((t, i) => (
          <g key={t}>
            <rect x={500 + i * 90} y={595} width={85} height={18} fill="#0a0a0a" stroke="#2a2a2a" />
            <text x={500 + i * 90 + 42} y={608} textAnchor="middle">{t}</text>
          </g>
        ))}
      </g>

      {/* gradients */}
      <defs>
        <linearGradient id="vesselGloss" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ---- Data card ----
function DataCard({ x, y, w, value, highlight = false }: { x: number; y: number; w: number; value: string; highlight?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} fill="#0a0a0a"
        stroke={highlight ? "#00d4ff" : "#2a2a2a"} strokeWidth={highlight ? 1.5 : 1}
        style={highlight ? { filter: "drop-shadow(0 0 6px rgba(0,212,255,0.6))" } : undefined} />
      <text x={x + w / 2} y={y + 18} textAnchor="middle" fontFamily="monospace"
        fontSize={highlight ? 15 : 13} fill={highlight ? "#00d4ff" : "#e6e9ef"} fontWeight="bold">
        {value}
      </text>
    </g>
  );
}

// ---- Compressor block frame (RACKIN green / RACKOUT red glow) ----
function CompBlock({ x, y, loaded }: { x: number; y: number; loaded: boolean }) {
  const color = loaded ? "#3aff6e" : "#ff3333";
  return (
    <g>
      <rect x={x} y={y} width={120} height={70} fill="#0a0a0a" stroke={color} strokeWidth={loaded ? 1.5 : 3}
        style={{ filter: loaded ? "drop-shadow(0 0 4px #3aff6e)" : "drop-shadow(0 0 10px #ff3333)" }} />
      <rect x={x + 8} y={y + 8} width={70} height={22} fill={loaded ? "#0a3a0a" : "#3a0a0a"} stroke={color} />
      <text x={x + 43} y={y + 24} textAnchor="middle" fontFamily="monospace" fontSize="11" fill={color} fontWeight="bold">
        {loaded ? "RACKIN" : "RACKOUT"}
      </text>
      <circle cx={x + 90} cy={y + 19} r="7" fill={loaded ? "#3aff6e" : "#ff3333"}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <text x={x + 105} y={y + 23} fontFamily="monospace" fontSize="10" fill="#ccc">M</text>
      <text x={x + 105} y={y + 38} fontFamily="monospace" fontSize="10" fill="#ccc">R</text>
    </g>
  );
}

// ---- Dryer block ----
function DryerBlock({ x, y, tag, flow }: { x: number; y: number; tag: string; flow: string }) {
  return (
    <g>
      <rect x={x} y={y} width={28} height={60} fill="#1a1a1a" stroke="#666" />
      <rect x={x + 38} y={y} width={28} height={60} fill="#1a1a1a" stroke="#666" />
      <text x={x + 33} y={y - 4} textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#cfd6dd">{tag}</text>
      <text x={x + 33} y={y + 75} textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#00d4ff" fontWeight="bold">{flow}</text>
    </g>
  );
}

// =============================================================================
// Compressor manual toggle widget
// =============================================================================
function CompressorToggle({
  x, y, tag, state, onToggle,
}: { x: number; y: number; tag: string; state: CompState; onToggle: () => void }) {
  return (
    <div className="absolute font-mono text-[10px]" style={{ left: x - 130, top: y - 10 }}>
      <div className="px-2 py-1 bg-[#0a0a0a] border border-[#2a2a2a] text-[#cfd6dd] mb-1 text-center w-[120px]">
        {tag}
      </div>
      <button onClick={onToggle}
        className={`w-[120px] py-1.5 border-2 tracking-widest font-bold ${
          state === "LOAD"
            ? "bg-[#0a3a0a] border-[#3aff6e] text-[#3aff6e]"
            : "bg-[#3a0a0a] border-[#ff3333] text-[#ff8080]"
        }`}
        style={{
          boxShadow: state === "LOAD"
            ? "0 0 10px rgba(58,255,110,0.5)"
            : "0 0 12px rgba(255,51,51,0.6)",
        }}>
        ▣ {state}
      </button>
    </div>
  );
}

// =============================================================================
// 60PIC006 Faceplate
// =============================================================================
function Faceplate({
  s, setPV, onClose,
}: { s: SimState; setPV: (d: number) => void; onClose: () => void }) {
  const pct = Math.max(0, Math.min(1, s.pv / 15));
  const spPct = Math.max(0, Math.min(1, s.sv / 15));
  return (
    <>
      <div className="flex items-center justify-between px-2 py-1 bg-[#0d2a3a] border-b border-[#3a4250]">
        <span className="text-[10px] tracking-widest text-[#00d4ff]">60PIC006 COMPRESSED AIR HEADER PR</span>
        <button onClick={onClose} className="text-[#888] hover:text-white"><X className="w-3 h-3" /></button>
      </div>

      {/* Mode badges */}
      <div className="flex gap-1 px-2 py-2 border-b border-[#3a4250]">
        <span className="px-2 py-0.5 bg-[#3aff6e] text-black text-[10px] font-bold tracking-widest">AUT</span>
        <span className="px-2 py-0.5 bg-[#2a2e36] text-[#cfd6dd] text-[10px] font-bold tracking-widest border border-[#3a4250]">NR</span>
      </div>

      <div className="flex">
        {/* Vertical bar gauge */}
        <div className="relative w-14 h-[260px] m-2 bg-[#0a0d12] border border-[#3a4250]">
          {/* scale ticks */}
          {[0, 3, 6, 9, 12, 15].map((v) => (
            <div key={v} className="absolute right-full pr-1 text-[8px] text-[#888]"
              style={{ bottom: `${(v / 15) * 100}%`, transform: "translateY(50%)" }}>{v.toFixed(2)}</div>
          ))}
          {/* PV bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#3aff6e] transition-all"
            style={{ height: `${pct * 100}%`, boxShadow: "0 0 8px #3aff6e" }} />
          {/* SP arrow */}
          <div className="absolute left-full pl-1" style={{ bottom: `${spPct * 100}%`, transform: "translateY(50%)" }}>
            <div className="text-[#ff3333] text-sm leading-none">◄</div>
          </div>
        </div>

        {/* Parameter readouts */}
        <div className="flex-1 p-2 space-y-2">
          <ParamRow label="PV" value={s.pv.toFixed(2)} unit="barg" color="#3aff6e" editable
            onUp={() => setPV(0.1)} onDown={() => setPV(-0.1)} />
          <ParamRow label="SV" value={s.sv.toFixed(2)} unit="barg" color="#ff3333" />
          <ParamRow label="MV" value={s.mv.toFixed(1)} unit="%" color="#00d4ff" />
        </div>
      </div>

      <div className="px-2 py-1 border-t border-[#3a4250] text-[9px] text-[#666] tracking-widest text-center">
        TRIP @ {TRIP.toFixed(1)} barg • CLICK PV ▲▼ TO TEST
      </div>
    </>
  );
}

function ParamRow({
  label, value, unit, color, editable, onUp, onDown,
}: { label: string; value: string; unit: string; color: string; editable?: boolean; onUp?: () => void; onDown?: () => void }) {
  return (
    <div className="flex items-center justify-between bg-[#0a0d12] border border-[#3a4250] px-2 py-1.5">
      <span className="text-[10px] text-[#888] tracking-widest">{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>{value}</span>
        <span className="text-[9px] text-[#666]">{unit}</span>
        {editable && (
          <div className="flex flex-col ml-1">
            <button onClick={onUp} className="bg-[#1a1d24] border border-[#3a4250] hover:bg-[#2a2e36]">
              <ChevronUp className="w-3 h-3 text-[#cfd6dd]" />
            </button>
            <button onClick={onDown} className="bg-[#1a1d24] border border-[#3a4250] hover:bg-[#2a2e36]">
              <ChevronDown className="w-3 h-3 text-[#cfd6dd]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
