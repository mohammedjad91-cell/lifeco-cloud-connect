import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, ReferenceArea, Legend,
} from "recharts";
import { Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { isInRange, getLabRange, FIELD_OPS_RANGES, statusHex } from "@/lib/ranges";

type SourceKind =
  | { kind: "ops"; tag: string }
  | { kind: "lab"; parameter: string }
  | { kind: "field"; tag: string; metric: "running_hours" | "discharge_pressure" | "temperature" };

interface Props {
  /** Restrict ops/field to a single department; lab is global */
  departmentId?: string;
  /** Available process unit tags (for ops trace + field) */
  unitTags: string[];
  /** Available lab parameters */
  labParameters?: string[];
}

interface Point {
  ts: number;
  value: number;
  inRange: boolean;
  label: string;
}

const GlassPulseChart = ({ departmentId, unitTags, labParameters = [] }: Props) => {
  const { t, lang } = useI18n();
  const [sourceKey, setSourceKey] = useState<string>("");
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);

  const sources: { key: string; label: string; src: SourceKind }[] = useMemo(() => {
    const list: { key: string; label: string; src: SourceKind }[] = [];
    unitTags.forEach((tg) => list.push({
      key: `ops::${tg}`,
      label: `${lang === "ar" ? "عمليات" : "Ops"} • ${tg}`,
      src: { kind: "ops", tag: tg },
    }));
    labParameters.forEach((p) => list.push({
      key: `lab::${p}`,
      label: `${lang === "ar" ? "مختبر" : "Lab"} • ${p}`,
      src: { kind: "lab", parameter: p },
    }));
    (["running_hours", "discharge_pressure", "temperature"] as const).forEach((m) => {
      unitTags.forEach((tg) => list.push({
        key: `field::${tg}::${m}`,
        label: `${lang === "ar" ? "ميدان" : "Field"} • ${tg} • ${m.replace("_", " ")}`,
        src: { kind: "field", tag: tg, metric: m },
      }));
    });
    return list;
  }, [unitTags, labParameters, lang]);

  // Default selection
  useEffect(() => {
    if (!sourceKey && sources.length > 0) setSourceKey(sources[0].key);
  }, [sources, sourceKey]);

  const activeSource: SourceKind | undefined = useMemo(
    () => sources.find((s) => s.key === sourceKey)?.src,
    [sources, sourceKey],
  );

  const fetchData = async () => {
    if (!activeSource) return;
    setLoading(true);
    let rows: Point[] = [];

    if (activeSource.kind === "ops") {
      let q = supabase.from("operations_logs").select("value,timestamp,department")
        .eq("unit_tag", activeSource.tag)
        .order("timestamp", { ascending: true })
        .limit(120);
      if (departmentId && departmentId !== "OPERATIONS") q = q.eq("department", departmentId);
      const { data } = await q;
      rows = (data || []).map((r: { value: number; timestamp: string }) => ({
        ts: new Date(r.timestamp).getTime(),
        value: r.value,
        inRange: true, // Ops values have no global range; treat as in-range
        label: format(new Date(r.timestamp), "HH:mm:ss"),
      }));
    } else if (activeSource.kind === "lab") {
      const range = getLabRange(activeSource.parameter);
      const { data } = await supabase.from("lab_results").select("value,timestamp")
        .eq("parameter_name", activeSource.parameter)
        .order("timestamp", { ascending: true })
        .limit(120);
      rows = (data || []).map((r: { value: number; timestamp: string }) => ({
        ts: new Date(r.timestamp).getTime(),
        value: r.value,
        inRange: isInRange(r.value, range),
        label: format(new Date(r.timestamp), "HH:mm:ss"),
      }));
    } else {
      const range = FIELD_OPS_RANGES[activeSource.metric];
      const col = activeSource.metric;
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            eq: (k: string, v: string) => {
              order: (k: string, o: { ascending: boolean }) => {
                limit: (n: number) => Promise<{
                  data: Array<Record<string, number | string>> | null;
                  error: unknown;
                }>;
              };
            };
          };
        };
      })
        .from("field_ops_logs")
        .select(`${col},timestamp`)
        .eq("equipment_tag", activeSource.tag)
        .order("timestamp", { ascending: true })
        .limit(120);
      if (error) {
        rows = [];
      } else {
        rows = (data || [])
          .filter((r) => r[col] != null)
          .map((r) => ({
            ts: new Date(String(r.timestamp)).getTime(),
            value: Number(r[col]),
            inRange: isInRange(Number(r[col]), range),
            label: format(new Date(String(r.timestamp)), "HH:mm:ss"),
          }));
      }
    }
    setPoints(rows);
    setLoading(false);
  };

  // Refetch on source change + realtime sync from all 3 tables.
  useEffect(() => {
    fetchData();
    const ch = supabase.channel(`glasspulse_${sourceKey}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "operations_logs" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "field_ops_logs" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey, departmentId]);

  // Range overlay
  const overlay = useMemo(() => {
    if (!activeSource) return null;
    if (activeSource.kind === "lab") return getLabRange(activeSource.parameter) ?? null;
    if (activeSource.kind === "field") return FIELD_OPS_RANGES[activeSource.metric] ?? null;
    return null;
  }, [activeSource]);

  const outOfRangeCount = points.filter((p) => !p.inRange).length;
  const allOk = points.length > 0 && outOfRangeCount === 0;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-foreground font-semibold">
            {lang === "ar" ? "GlassPulse — العرض المباشر" : "GlassPulse — Live Process Pulse"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {points.length > 0 && (
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
              allOk
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                : "bg-red-500/15 text-red-400 border-red-500/40"
            }`}>
              {allOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {allOk
                ? (lang === "ar" ? "تشغيل طبيعي" : "Normal Operations")
                : `${outOfRangeCount} ${lang === "ar" ? "خارج النطاق" : "Out of Range"}`}
            </span>
          )}
          <Select value={sourceKey} onValueChange={setSourceKey}>
            <SelectTrigger className="w-[280px] bg-secondary/50 border-border">
              <SelectValue placeholder={lang === "ar" ? "اختر مصدر البيانات" : "Select data source"} />
            </SelectTrigger>
            <SelectContent className="max-h-[320px]">
              {sources.map((s) => (
                <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={statusHex(allOk)} stopOpacity={0.6} />
              <stop offset="100%" stopColor={statusHex(allOk)} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 30%, 20%)" />
          <XAxis dataKey="label" stroke="hsl(215, 20%, 55%)" fontSize={10} />
          <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} />
          {overlay && (
            <ReferenceArea
              y1={overlay.min}
              y2={overlay.max}
              fill="#10b981"
              fillOpacity={0.06}
              stroke="#10b981"
              strokeOpacity={0.25}
              strokeDasharray="4 4"
            />
          )}
          <Tooltip
            contentStyle={{
              background: "hsl(230, 40%, 12%)",
              border: "1px solid hsl(190, 100%, 50%, 0.3)",
              borderRadius: "8px",
              color: "hsl(210, 40%, 93%)",
            }}
            formatter={((v: unknown, _name: unknown, p: { payload?: Point }) => {
              const ok = p?.payload?.inRange ?? true;
              return [`${v} ${ok ? "✓" : "⚠"}`, ok ? (lang === "ar" ? "طبيعي" : "Normal") : (lang === "ar" ? "خارج النطاق" : "Out of Range")];
            }) as never}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="value"
            name={sources.find((s) => s.key === sourceKey)?.label || ""}
            stroke={statusHex(allOk)}
            strokeWidth={2}
            fill="url(#pulseFill)"
            dot={(props) => {
              const { cx, cy, payload, key } = props as {
                cx: number; cy: number; payload: Point; key: string;
              };
              return (
                <circle
                  key={key}
                  cx={cx}
                  cy={cy}
                  r={3.5}
                  fill={statusHex(payload.inRange)}
                  stroke="#0b1020"
                  strokeWidth={1}
                />
              );
            }}
            activeDot={{ r: 5 }}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>

      {points.length === 0 && !loading && (
        <p className="text-center text-muted-foreground text-sm mt-4">
          {lang === "ar" ? "لا توجد بيانات بعد لهذا المصدر." : "No data yet for this source."}
        </p>
      )}
      {loading && (
        <p className="text-center text-muted-foreground text-sm mt-4">
          {lang === "ar" ? "جارٍ التحميل..." : "Loading..."}
        </p>
      )}
    </div>
  );
};

export default GlassPulseChart;
