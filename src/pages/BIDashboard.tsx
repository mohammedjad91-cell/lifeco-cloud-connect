import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { format, subDays, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Activity, Database, FlaskConical, Wrench, ClipboardList,
  TrendingUp, TrendingDown, RefreshCw, Download, Zap, Clock,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const PALETTE = [
  "hsl(190 100% 55%)", "hsl(280 80% 65%)", "hsl(340 80% 60%)",
  "hsl(45 90% 60%)", "hsl(140 70% 50%)", "hsl(20 90% 60%)",
  "hsl(220 90% 65%)", "hsl(160 80% 50%)",
];

const RANGES = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

interface KpiProps {
  icon: any;
  label: string;
  value: string | number;
  delta?: number;
  color: string;
}

const KpiCard = ({ icon: Icon, label, value, delta, color }: KpiProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="glass-card p-4 relative overflow-hidden"
  >
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: color }} />
    <div className="flex items-center justify-between mb-2 relative">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div className="flex items-end justify-between relative">
      <span className="text-3xl font-bold" style={{ color }}>{value}</span>
      {delta !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-medium ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      )}
    </div>
  </motion.div>
);

const BIDashboard = () => {
  const navigate = useNavigate();
  const [rangeDays, setRangeDays] = useState(7);
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const [opsLogs, setOpsLogs] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [fieldOps, setFieldOps] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    const since = subDays(new Date(), rangeDays).toISOString();
    const [ops, lab, samp, fOps, act] = await Promise.all([
      supabase.from("operations_logs").select("*").gte("timestamp", since).order("timestamp", { ascending: true }),
      supabase.from("lab_results").select("*").gte("timestamp", since).order("timestamp", { ascending: true }),
      supabase.from("samples").select("*").gte("sample_date", since).order("sample_date", { ascending: true }),
      supabase.from("field_ops_logs" as any).select("*").gte("timestamp", since).order("timestamp", { ascending: true }),
      supabase.from("activity_logs").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(200),
    ]);
    setOpsLogs(ops.data || []);
    setLabResults(lab.data || []);
    setSamples(samp.data || []);
    setFieldOps((fOps.data as any[]) || []);
    setActivity(act.data || []);
    setLastSync(new Date());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [rangeDays]);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("bi-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "operations_logs" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "samples" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "field_ops_logs" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [rangeDays]);

  // Filter helpers
  const filterDept = <T extends { department?: string; plant?: string }>(arr: T[]) =>
    deptFilter === "ALL" ? arr : arr.filter(r => (r.department || r.plant) === deptFilter);

  const opsF = useMemo(() => filterDept(opsLogs), [opsLogs, deptFilter]);
  const labF = useMemo(() => filterDept(labResults), [labResults, deptFilter]);
  const sampF = useMemo(() => filterDept(samples), [samples, deptFilter]);
  const fOpsF = useMemo(() => filterDept(fieldOps), [fieldOps, deptFilter]);

  // KPIs with previous period delta
  const computeDelta = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;
  const halfTs = subDays(new Date(), rangeDays / 2).getTime();
  const splitCount = (arr: any[], key = "timestamp") => {
    let c = 0, p = 0;
    arr.forEach(r => {
      const t = new Date(r[key] || r.created_at || r.sample_date).getTime();
      if (t >= halfTs) c++; else p++;
    });
    return { c, p };
  };
  const opsK = splitCount(opsF);
  const labK = splitCount(labF);
  const sampK = splitCount(sampF, "sample_date");
  const fOpsK = splitCount(fOpsF);

  // Time series — daily aggregate
  const timeSeries = useMemo(() => {
    const buckets: Record<string, any> = {};
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "MM/dd");
      buckets[d] = { date: d, ops: 0, lab: 0, samples: 0, field: 0 };
    }
    const bump = (ts: string, field: string) => {
      const k = format(new Date(ts), "MM/dd");
      if (buckets[k]) buckets[k][field] += 1;
    };
    opsF.forEach(r => bump(r.timestamp, "ops"));
    labF.forEach(r => bump(r.timestamp, "lab"));
    sampF.forEach(r => bump(r.sample_date, "samples"));
    fOpsF.forEach(r => bump(r.timestamp, "field"));
    return Object.values(buckets);
  }, [opsF, labF, sampF, fOpsF, rangeDays]);

  // Department distribution
  const deptDist = useMemo(() => {
    const map: Record<string, number> = {};
    [...opsLogs, ...fieldOps].forEach((r: any) => {
      const d = r.department || "—";
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [opsLogs, fieldOps]);

  // Top tags by volume
  const topTags = useMemo(() => {
    const map: Record<string, number> = {};
    opsF.forEach(r => { map[r.unit_tag] = (map[r.unit_tag] || 0) + 1; });
    fOpsF.forEach((r: any) => { map[r.equipment_tag] = (map[r.equipment_tag] || 0) + 1; });
    return Object.entries(map)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count).slice(0, 10);
  }, [opsF, fOpsF]);

  // Lab parameter averages
  const labAvg = useMemo(() => {
    const map: Record<string, { sum: number; n: number }> = {};
    labF.forEach((r: any) => {
      if (!map[r.parameter_name]) map[r.parameter_name] = { sum: 0, n: 0 };
      map[r.parameter_name].sum += Number(r.value) || 0;
      map[r.parameter_name].n += 1;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ parameter: name, average: +(v.sum / v.n).toFixed(2) }))
      .sort((a, b) => b.average - a.average).slice(0, 8);
  }, [labF]);

  // Sample status
  const sampleStatus = useMemo(() => {
    const map: Record<string, number> = {};
    sampF.forEach((r: any) => { map[r.status || "unknown"] = (map[r.status || "unknown"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sampF]);

  // Department radar
  const radarData = useMemo(() => {
    return DEPARTMENTS.filter(d => !["LABORATORY", "PLANTVIEW"].includes(d.id)).map(d => ({
      dept: d.label,
      Ops: opsLogs.filter((r: any) => r.department === d.id).length,
      Lab: labResults.filter((r: any) => r.plant === d.id).length,
      Field: fieldOps.filter((r: any) => r.department === d.id).length,
    }));
  }, [opsLogs, labResults, fieldOps]);

  const exportCsv = () => {
    const rows: string[] = ["table,timestamp,department,detail,value"];
    opsF.forEach(r => rows.push(`ops,${r.timestamp},${r.department},${r.unit_tag},${r.value}`));
    labF.forEach(r => rows.push(`lab,${r.timestamp},${r.plant},${r.parameter_name},${r.value}`));
    sampF.forEach((r: any) => rows.push(`sample,${r.sample_date},${r.department},${r.sample_name},${r.status}`));
    fOpsF.forEach((r: any) => rows.push(`field,${r.timestamp},${r.department},${r.equipment_tag},${r.running_hours || ""}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bi-export-${format(new Date(), "yyyyMMdd-HHmm")}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const tooltipStyle = {
    background: "hsl(230 40% 10%)",
    border: "1px solid hsl(190 100% 50% / 0.3)",
    borderRadius: "10px",
    color: "hsl(210 40% 95%)",
    fontSize: "12px",
  } as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 md:px-6 py-3 glass-card rounded-none flex items-center gap-3 sticky top-0 z-30">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-lg md:text-xl font-bold neon-text truncate">
            Live BI · لوحة التحكم
          </h1>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            آخر تحديث: {format(lastSync, "HH:mm:ss")}
            <span className="inline-flex items-center gap-1 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map(r => (
            <Button key={r.days} size="sm"
              variant={rangeDays === r.days ? "default" : "outline"}
              onClick={() => setRangeDays(r.days)}
              className="h-8 px-2 text-xs">
              {r.label}
            </Button>
          ))}
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل الأقسام</SelectItem>
              {DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={fetchAll} className="h-8 gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv} className="h-8 gap-1.5">
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={Activity} label="Operations Logs" value={opsF.length}
            delta={computeDelta(opsK.c, opsK.p)} color="hsl(190 100% 55%)" />
          <KpiCard icon={FlaskConical} label="Lab Results" value={labF.length}
            delta={computeDelta(labK.c, labK.p)} color="hsl(280 80% 65%)" />
          <KpiCard icon={ClipboardList} label="Samples" value={sampF.length}
            delta={computeDelta(sampK.c, sampK.p)} color="hsl(340 80% 60%)" />
          <KpiCard icon={Wrench} label="Field Ops" value={fOpsF.length}
            delta={computeDelta(fOpsK.c, fOpsK.p)} color="hsl(45 90% 60%)" />
        </div>

        {/* Main time series */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> الأنشطة اليومية حسب المصدر
            </h3>
            <Badge variant="outline">{rangeDays}d</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeries as any[]}>
              <defs>
                {["ops", "lab", "samples", "field"].map((k, i) => (
                  <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE[i]} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={PALETTE[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 30% 20%)" />
              <XAxis dataKey="date" stroke="hsl(215 20% 55%)" fontSize={11} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="ops" name="Operations" stroke={PALETTE[0]} fill="url(#g-ops)" strokeWidth={2} />
              <Area type="monotone" dataKey="lab" name="Lab" stroke={PALETTE[1]} fill="url(#g-lab)" strokeWidth={2} />
              <Area type="monotone" dataKey="samples" name="Samples" stroke={PALETTE[2]} fill="url(#g-samples)" strokeWidth={2} />
              <Area type="monotone" dataKey="field" name="Field" stroke={PALETTE[3]} fill="url(#g-field)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 2x2 charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" /> توزيع الأقسام
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deptDist} dataKey="value" cx="50%" cy="50%" outerRadius={95} innerRadius={55} paddingAngle={2}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {deptDist.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> أعلى المعدات نشاطاً
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topTags} layout="vertical" margin={{ left: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 30% 20%)" />
                <XAxis type="number" stroke="hsl(215 20% 55%)" fontSize={11} />
                <YAxis dataKey="tag" type="category" stroke="hsl(215 20% 55%)" fontSize={10} width={70} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={PALETTE[0]} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" /> متوسطات معاملات المختبر
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={labAvg}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 30% 20%)" />
                <XAxis dataKey="parameter" stroke="hsl(215 20% 55%)" fontSize={10} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="average" fill={PALETTE[1]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" /> حالة العينات
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sampleStatus} dataKey="value" cx="50%" cy="50%" outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {sampleStatus.map((_, i) => <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> مقارنة شاملة بين الأقسام
          </h3>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(230 30% 22%)" />
              <PolarAngleAxis dataKey="dept" stroke="hsl(215 20% 60%)" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(215 20% 50%)" fontSize={9} />
              <Radar name="Operations" dataKey="Ops" stroke={PALETTE[0]} fill={PALETTE[0]} fillOpacity={0.25} />
              <Radar name="Lab" dataKey="Lab" stroke={PALETTE[1]} fill={PALETTE[1]} fillOpacity={0.25} />
              <Radar name="Field" dataKey="Field" stroke={PALETTE[3]} fill={PALETTE[3]} fillOpacity={0.25} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> سجل النشاط الأخير
          </h3>
          <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
            {activity.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">لا توجد سجلات</p>}
            {activity.slice(0, 50).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 py-2 text-xs">
                <Badge variant="outline" className="font-mono text-[10px]">{a.action}</Badge>
                {a.department && <span className="text-muted-foreground">{a.department}</span>}
                <span className="flex-1 truncate text-foreground/80">{a.details}</span>
                <span className="text-muted-foreground text-[11px]">{format(new Date(a.created_at), "MM/dd HH:mm")}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BIDashboard;
