import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getDeptBg } from "@/lib/dept-backgrounds";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Activity, AlertTriangle, CheckCircle2, Wrench, Clock,
  TrendingUp, Search, QrCode, DollarSign, History, Factory, Cog,
  Zap, ShieldAlert, Timer, Gauge,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getAmmoniaSpec } from "@/lib/ammonia-equipment";
import { TechSpecPanel, SparesRequisition } from "@/components/maintenance/EquipmentTechCard";
import heroPlant from "@/assets/lifeco-hero-1.webp";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface Asset {
  id: string;
  asset_code: string;
  asset_name: string;
  tag: string | null;
  plant_code: string | null;
  location: string | null;
  manufacturer: string | null;
  install_year: number | null;
  status: string;
  criticality: string;
  running_hours: number;
  department: string;
  last_maintenance_at: string | null;
  next_maintenance_at: string | null;
  image_url: string | null;
}

interface MaintRec {
  id: string;
  asset_id: string;
  notes: string;
  recorded_at: string;
  recorded_by: string | null;
  type: string;
  cost_parts: number;
  cost_labor: number;
  hours: number;
  technician: string | null;
  failure_cause: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  running: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  stopped: "bg-red-500/20 text-red-300 border-red-500/40",
  under_maintenance: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};
const STATUS_DOT: Record<string, string> = {
  running: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]",
  stopped: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]",
  under_maintenance: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]",
};
const CRIT_COLOR: Record<string, string> = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};

export default function MaintenanceCommand() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [records, setRecords] = useState<MaintRec[]>([]);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [bg, setBg] = useState<string | null>(getDeptBg("MAINTENANCE"));

  useEffect(() => {
    const h = () => setBg(getDeptBg("MAINTENANCE"));
    window.addEventListener("lifeco:bg-changed", h);
    return () => window.removeEventListener("lifeco:bg-changed", h);
  }, []);

  useEffect(() => {
    (async () => {
      const [a, r] = await Promise.all([
        supabase.from("equipment_assets").select("*").order("plant_code"),
        supabase.from("maintenance_records").select("*").order("recorded_at", { ascending: false }),
      ]);
      setAssets((a.data as Asset[]) || []);
      setRecords((r.data as MaintRec[]) || []);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = assets.length;
    const running = assets.filter(a => a.status === "running").length;
    const stopped = assets.filter(a => a.status === "stopped").length;
    const underMaint = assets.filter(a => a.status === "under_maintenance").length;
    const critical = assets.filter(a => a.criticality === "high").length;
    const now = Date.now();
    const overdue = assets.filter(a => a.next_maintenance_at && new Date(a.next_maintenance_at).getTime() < now).length;
    const upcoming = assets.filter(a => {
      if (!a.next_maintenance_at) return false;
      const t = new Date(a.next_maintenance_at).getTime();
      return t > now && t < now + 7 * 24 * 3600 * 1000;
    }).length;
    const availability = total ? (running / total) * 100 : 0;
    const totalCost = records.reduce((s, r) => s + Number(r.cost_parts) + Number(r.cost_labor), 0);
    const totalHours = records.reduce((s, r) => s + Number(r.hours), 0);
    const failures = records.filter(r => r.type === "breakdown" || r.type === "corrective").length;
    const mttr = failures ? totalHours / failures : 0;
    const totalRunHrs = assets.reduce((s, a) => s + a.running_hours, 0);
    const mtbf = failures ? totalRunHrs / failures : totalRunHrs;

    return { total, running, stopped, underMaint, critical, overdue, upcoming, availability, totalCost, failures, mttr, mtbf };
  }, [assets, records]);

  const filtered = useMemo(() => {
    return assets.filter(a => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return [a.asset_code, a.asset_name, a.tag, a.plant_code, a.manufacturer]
        .some(v => v?.toLowerCase().includes(s));
    });
  }, [assets, search, filterStatus]);

  const selectedRecords = useMemo(
    () => records.filter(r => r.asset_id === selected?.id),
    [records, selected]
  );

  const costByType = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r => {
      map[r.type] = (map[r.type] || 0) + Number(r.cost_parts) + Number(r.cost_labor);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [records]);

  const PIE = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#a855f7", "#06b6d4"];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <img src={bg || heroPlant} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background/90" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4">
        <Button variant="secondary" onClick={() => navigate("/dept/MAINTENANCE")}
          className="bg-white/10 border border-white/30 text-white hover:bg-white/20">
          <ArrowLeft className="w-4 h-4 mr-2" />{ar ? "رجوع" : "Back"}
        </Button>
        <div className="text-center">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            {ar ? "مركز قيادة الصيانة" : "Maintenance Command Center"}
          </h1>
          <p className="text-xs text-white/70 tracking-widest mt-1">LIFECO • REAL-TIME OPS</p>
        </div>
        <div className="w-24" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-10 space-y-6">
        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <KpiCard icon={<Factory className="w-5 h-5" />} label={ar ? "إجمالي المعدات" : "Total Assets"} value={stats.total} color="text-white" />
          <KpiCard icon={<CheckCircle2 className="w-5 h-5" />} label={ar ? "تعمل" : "Running"} value={stats.running} color="text-emerald-400" />
          <KpiCard icon={<Wrench className="w-5 h-5" />} label={ar ? "تحت الصيانة" : "Under Maint."} value={stats.underMaint} color="text-amber-400" />
          <KpiCard icon={<ShieldAlert className="w-5 h-5" />} label={ar ? "متوقفة" : "Stopped"} value={stats.stopped} color="text-red-400" />
          <KpiCard icon={<AlertTriangle className="w-5 h-5" />} label={ar ? "متأخرة" : "Overdue"} value={stats.overdue} color="text-red-400" />
          <KpiCard icon={<Zap className="w-5 h-5" />} label={ar ? "حرجة" : "Critical"} value={stats.critical} color="text-red-400" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={<Activity className="w-5 h-5" />} label={ar ? "الجاهزية" : "Availability"} value={`${stats.availability.toFixed(1)}%`} color="text-emerald-400" />
          <KpiCard icon={<Timer className="w-5 h-5" />} label="MTTR" value={`${stats.mttr.toFixed(1)}h`} color="text-cyan-400" />
          <KpiCard icon={<Gauge className="w-5 h-5" />} label="MTBF" value={`${(stats.mtbf/1000).toFixed(1)}k h`} color="text-cyan-400" />
          <KpiCard icon={<DollarSign className="w-5 h-5" />} label={ar ? "إجمالي التكاليف" : "Total Cost"} value={`$${stats.totalCost.toLocaleString()}`} color="text-amber-400" />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h3 className="text-sm text-white/80 tracking-widest uppercase mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {ar ? "توزيع تكاليف الصيانة" : "Maintenance Cost by Type"}
            </h3>
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={costByType} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={3}>
                    {costByType.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm text-white/80 tracking-widest uppercase mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {ar ? "ساعات التشغيل حسب المعدة" : "Running Hours per Asset"}
            </h3>
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={assets.slice(0, 12).map(a => ({ name: a.tag || a.asset_code, hours: a.running_hours }))}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={ar ? "بحث بالرقم/الاسم/المصنع..." : "Search tag / name / plant..."}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
          </div>
          {(["all","running","under_maintenance","stopped"] as const).map(s => (
            <Button key={s} size="sm"
              onClick={() => setFilterStatus(s)}
              variant={filterStatus === s ? "default" : "secondary"}
              className={filterStatus === s ? "" : "bg-white/10 border border-white/20 text-white hover:bg-white/20"}>
              {s === "all" ? (ar ? "الكل" : "All")
                : s === "running" ? (ar ? "تعمل" : "Running")
                : s === "under_maintenance" ? (ar ? "صيانة" : "Maint.")
                : (ar ? "متوقف" : "Stopped")}
            </Button>
          ))}
        </div>

        {/* Fleet grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a, i) => (
            <motion.button key={a.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              onClick={() => setSelected(a)}
              className="glass-card p-4 text-left hover:neon-border transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_DOT[a.status]}`} />
                    <span className="text-primary font-mono text-xs">{a.tag || a.asset_code}</span>
                    <span className={`text-[10px] uppercase ${CRIT_COLOR[a.criticality]}`}>● {a.criticality}</span>
                  </div>
                  <div className="text-white font-semibold text-sm mt-1 truncate">{a.asset_name}</div>
                  <div className="text-white/60 text-xs mt-1">
                    {a.plant_code} • {a.manufacturer || "—"}
                  </div>
                </div>
                <Cog className="w-8 h-8 text-white/30 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-center justify-between mt-3">
                <Badge variant="outline" className={`text-[10px] ${STATUS_COLOR[a.status]}`}>
                  {a.status.replace("_"," ")}
                </Badge>
                <span className="text-white/60 text-[11px]">{a.running_hours.toLocaleString()} h</span>
              </div>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full glass-card p-8 text-center text-white/60">
              {ar ? "لا توجد معدات مطابقة" : "No assets match the filters"}
            </div>
          )}
        </div>
      </div>

      {/* Digital Equipment Passport */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl bg-slate-900/95 border-white/10 text-white">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className={`inline-block w-3 h-3 rounded-full ${STATUS_DOT[selected.status]}`} />
                  <span className="text-primary font-mono">{selected.tag || selected.asset_code}</span>
                  <span>—</span>
                  <span>{selected.asset_name}</span>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info">
                <TabsList className="bg-white/5 border border-white/10">
                  <TabsTrigger value="info">{ar ? "البطاقة" : "Passport"}</TabsTrigger>
                  <TabsTrigger value="qr">QR</TabsTrigger>
                  <TabsTrigger value="timeline"><History className="w-3 h-3 mr-1" />{ar ? "السجل الزمني" : "Timeline"}</TabsTrigger>
                  <TabsTrigger value="cost"><DollarSign className="w-3 h-3 mr-1" />{ar ? "التكاليف" : "Costs"}</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label={ar ? "الرقم" : "Tag"} value={selected.tag} />
                    <Field label={ar ? "الرمز" : "Code"} value={selected.asset_code} />
                    <Field label={ar ? "المصنع" : "Plant"} value={selected.plant_code} />
                    <Field label={ar ? "الموقع" : "Location"} value={selected.location} />
                    <Field label={ar ? "الشركة المصنعة" : "Manufacturer"} value={selected.manufacturer} />
                    <Field label={ar ? "سنة التركيب" : "Install Year"} value={selected.install_year} />
                    <Field label={ar ? "الحالة" : "Status"} value={selected.status.replace("_"," ")} />
                    <Field label={ar ? "الحرجية" : "Criticality"} value={selected.criticality} />
                    <Field label={ar ? "ساعات التشغيل" : "Running Hours"} value={selected.running_hours.toLocaleString() + " h"} />
                    <Field label={ar ? "آخر صيانة" : "Last Maint."} value={fmtDate(selected.last_maintenance_at)} />
                    <Field label={ar ? "الصيانة القادمة" : "Next Maint."} value={fmtDate(selected.next_maintenance_at)} />
                    <Field label={ar ? "عدد سجلات الصيانة" : "Records"} value={selectedRecords.length} />
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="mt-4 flex flex-col items-center gap-3">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG value={JSON.stringify({
                      tag: selected.tag, code: selected.asset_code, plant: selected.plant_code, id: selected.id
                    })} size={200} level="M" />
                  </div>
                  <p className="text-xs text-white/60 text-center max-w-sm">
                    {ar ? "امسح الرمز بالجوال لفتح بطاقة المعدة الرقمية." : "Scan with a phone to open this asset's digital passport."}
                  </p>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  {selectedRecords.length === 0 ? (
                    <p className="text-white/60 text-sm text-center py-6">{ar ? "لا يوجد سجل صيانة." : "No maintenance history yet."}</p>
                  ) : (
                    <ol className="relative border-l border-primary/40 space-y-4 pl-5">
                      {selectedRecords.map(r => (
                        <li key={r.id} className="relative">
                          <span className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            {fmtDate(r.recorded_at)} • <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                          </div>
                          <div className="text-white font-medium mt-1">{r.notes}</div>
                          <div className="text-xs text-white/60 mt-1">
                            {r.technician && <>👷 {r.technician} • </>}
                            {r.hours > 0 && <>⏱ {r.hours}h • </>}
                            💵 ${(Number(r.cost_parts)+Number(r.cost_labor)).toLocaleString()}
                            {r.failure_cause && <> • ⚠ {r.failure_cause}</>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </TabsContent>

                <TabsContent value="cost" className="mt-4">
                  {(() => {
                    const parts = selectedRecords.reduce((s, r) => s + Number(r.cost_parts), 0);
                    const labor = selectedRecords.reduce((s, r) => s + Number(r.cost_labor), 0);
                    const hours = selectedRecords.reduce((s, r) => s + Number(r.hours), 0);
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <KpiCard icon={<Cog className="w-5 h-5" />} label={ar ? "قطع الغيار" : "Parts"} value={`$${parts.toLocaleString()}`} color="text-primary" />
                        <KpiCard icon={<Wrench className="w-5 h-5" />} label={ar ? "العمالة" : "Labor"} value={`$${labor.toLocaleString()}`} color="text-amber-400" />
                        <KpiCard icon={<Clock className="w-5 h-5" />} label={ar ? "ساعات العمل" : "Work Hrs"} value={`${hours}h`} color="text-cyan-400" />
                        <KpiCard icon={<DollarSign className="w-5 h-5" />} label={ar ? "الإجمالي" : "Total"} value={`$${(parts+labor).toLocaleString()}`} color="text-emerald-400" />
                      </div>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-white/60">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div className={`font-display text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass-card p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
      <div className="text-white text-sm mt-0.5 truncate">{value ?? "—"}</div>
    </div>
  );
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return "—"; }
}
