import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, VolumeX, Volume2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Breach {
  id: string;
  tag: string;
  metric: string;
  value: number;
  limit: number;
  ts: string;
}

const PRESSURE_LIMIT = 10.0;
const TEMP_LIMIT = 210;

// Tiny WebAudio chime — avoids needing external mp3
function useAlarmChime() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const playingRef = useRef(false);

  const start = () => {
    if (playingRef.current) return;
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      if (!Ctx) return;
      const ctx = ctxRef.current ?? new Ctx();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      // pulse the frequency for an alarm feel
      const interval = setInterval(() => {
        if (!playingRef.current) return clearInterval(interval);
        osc.frequency.value = osc.frequency.value === 880 ? 660 : 880;
      }, 400);
      oscRef.current = osc;
      gainRef.current = gain;
      playingRef.current = true;
    } catch {
      /* ignore */
    }
  };

  const stop = () => {
    playingRef.current = false;
    try {
      oscRef.current?.stop();
      oscRef.current?.disconnect();
      gainRef.current?.disconnect();
    } catch { /* ignore */ }
    oscRef.current = null;
    gainRef.current = null;
  };

  useEffect(() => () => stop(), []);
  return { start, stop };
}

export default function SafetyMonitor() {
  const [breach, setBreach] = useState<Breach | null>(null);
  const [muted, setMuted] = useState(false);
  const { start, stop } = useAlarmChime();

  const evaluate = (row: any) => {
    const dp = Number(row?.discharge_pressure);
    const tmp = Number(row?.temperature);
    if (!Number.isNaN(dp) && dp > PRESSURE_LIMIT) {
      return {
        id: row.id ?? String(Date.now()),
        tag: row.equipment_tag ?? "—",
        metric: "Discharge Pressure",
        value: dp,
        limit: PRESSURE_LIMIT,
        ts: row.timestamp ?? new Date().toISOString(),
      } as Breach;
    }
    if (!Number.isNaN(tmp) && tmp > TEMP_LIMIT) {
      return {
        id: row.id ?? String(Date.now()),
        tag: row.equipment_tag ?? "—",
        metric: "Temperature",
        value: tmp,
        limit: TEMP_LIMIT,
        ts: row.timestamp ?? new Date().toISOString(),
      } as Breach;
    }
    return null;
  };

  useEffect(() => {
    // Initial sweep: check the most recent rows in case something already breached
    (async () => {
      const { data } = await supabase
        .from("field_ops_logs")
        .select("id,equipment_tag,discharge_pressure,temperature,timestamp")
        .order("timestamp", { ascending: false })
        .limit(25);
      data?.forEach((row) => {
        const b = evaluate(row);
        if (b) setBreach((prev) => prev ?? b);
      });
    })();

    const channel = supabase
      .channel("safety_field_ops")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "field_ops_logs" },
        (payload) => {
          const b = evaluate(payload.new);
          if (b) setBreach(b);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "field_ops_logs" },
        (payload) => {
          const b = evaluate(payload.new);
          if (b) setBreach(b);
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (breach && !muted) start(); else stop();
  }, [breach, muted, start, stop]);

  const acknowledge = () => { setBreach(null); stop(); };

  return (
    <AnimatePresence>
      {breach && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          {/* Red flashing overlay */}
          <motion.div
            className="absolute inset-0 bg-destructive/25"
            animate={{ opacity: [0.15, 0.45, 0.15] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
          {/* Danger banner */}
          <div className="absolute top-0 inset-x-0 flex justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card border-2 border-destructive shadow-[0_0_40px_hsl(var(--destructive)/0.6)] px-6 py-4 flex items-center gap-4 max-w-3xl w-full"
            >
              <AlertTriangle className="w-8 h-8 text-destructive animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-display text-destructive text-lg font-bold tracking-widest">⚠ DANGER — SAFETY LIMIT BREACHED</div>
                <div className="text-sm text-foreground mt-0.5 truncate">
                  <span className="font-semibold">{breach.tag}</span> · {breach.metric}:{" "}
                  <span className="text-destructive font-bold">{breach.value}</span> (limit {breach.limit})
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMuted((m) => !m)}
                className="gap-1.5"
                title={muted ? "Unmute alarm" : "Mute alarm"}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="destructive" onClick={acknowledge} className="gap-1.5">
                <X className="w-4 h-4" /> Acknowledge
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
