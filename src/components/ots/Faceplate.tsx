import { useMemo } from "react";
import type { Loop } from "@/lib/ots-engine";

interface Props {
  loop: Loop;
  onChange: (patch: Partial<Loop>) => void;
}

export function Faceplate({ loop, onChange }: Props) {
  const pct = useMemo(() => {
    const p = ((loop.pv - loop.pvMin) / (loop.pvMax - loop.pvMin)) * 100;
    return Math.max(0, Math.min(100, p));
  }, [loop.pv, loop.pvMin, loop.pvMax]);

  const alarm =
    loop.pv > loop.hi ? "HI" : loop.pv < loop.lo ? "LO" : null;

  const barColor = alarm ? "bg-red-500" : "bg-cyan-400";

  return (
    <div className={`border-2 ${alarm ? "border-red-500 animate-pulse" : "border-cyan-500/50"} bg-black rounded-md p-3 font-mono text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-cyan-300 text-sm font-bold tracking-wider">{loop.tag}</div>
          <div className="text-[10px] uppercase text-slate-400">{loop.label}</div>
        </div>
        <div className={`px-2 py-0.5 text-[10px] font-bold rounded ${loop.mode === "AUTO" ? "bg-emerald-500 text-black" : "bg-amber-500 text-black"}`}>
          {loop.mode}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[9px] text-slate-400">PV</div>
          <div className={`text-lg font-black tabular-nums ${alarm ? "text-red-400" : "text-emerald-400"}`}>
            {loop.pv.toFixed(loop.unit === "pH" ? 2 : 1)}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400">SV</div>
          <div className="text-lg font-black tabular-nums text-cyan-300">
            {loop.sv.toFixed(loop.unit === "pH" ? 2 : 1)}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400">MV%</div>
          <div className="text-lg font-black tabular-nums text-amber-300">
            {loop.mv.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="mt-2 h-3 bg-slate-800 border border-slate-700 relative">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0" style={{ left: `${((loop.lo - loop.pvMin) / (loop.pvMax - loop.pvMin)) * 100}%` }}>
          <div className="w-px h-full bg-red-500/70" />
        </div>
        <div className="absolute inset-y-0" style={{ left: `${((loop.hi - loop.pvMin) / (loop.pvMax - loop.pvMin)) * 100}%` }}>
          <div className="w-px h-full bg-red-500/70" />
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
        <span>{loop.pvMin}</span><span>{loop.unit}</span><span>{loop.pvMax}</span>
      </div>

      <div className="mt-2 space-y-1.5">
        <label className="text-[10px] text-slate-400 flex justify-between">
          <span>Setpoint (SV)</span><span className="text-cyan-300">{loop.sv.toFixed(2)}</span>
        </label>
        <input
          type="range" min={loop.pvMin} max={loop.pvMax} step={(loop.pvMax - loop.pvMin) / 200}
          value={loop.sv} onChange={(e) => onChange({ sv: parseFloat(e.target.value) })}
          className="w-full accent-cyan-400"
        />
        <label className="text-[10px] text-slate-400 flex justify-between">
          <span>Manual Output (MV%)</span><span className="text-amber-300">{loop.mv.toFixed(0)}%</span>
        </label>
        <input
          type="range" min={0} max={100} step={1}
          value={loop.mv} disabled={loop.mode === "AUTO"}
          onChange={(e) => onChange({ mv: parseFloat(e.target.value) })}
          className="w-full accent-amber-400 disabled:opacity-40"
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1">
        <button
          onClick={() => onChange({ mode: "AUTO" })}
          className={`py-1 text-xs font-bold border ${loop.mode === "AUTO" ? "bg-emerald-500 text-black border-emerald-400" : "bg-slate-800 text-slate-300 border-slate-600"}`}
        >AUTO</button>
        <button
          onClick={() => onChange({ mode: "MAN" })}
          className={`py-1 text-xs font-bold border ${loop.mode === "MAN" ? "bg-amber-500 text-black border-amber-400" : "bg-slate-800 text-slate-300 border-slate-600"}`}
        >MANUAL</button>
      </div>
    </div>
  );
}
