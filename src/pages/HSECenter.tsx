import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, ShieldCheck, FileCheck2, AlertTriangle, HardHat, Eye,
  Activity, MapPin, Flame, HeartPulse, DoorOpen, Users, Bell, Phone,
  Droplets, CheckCircle2, XCircle, Clock, Plus, Camera,
} from "lucide-react";

type Permit = any; type Incident = any; type PPE = any; type EmgPoint = any;

const permitTypes = ["Hot Work","Cold Work","Confined Space","Electrical","Excavation","Working at Height","Lifting","Line Breaking"];
const severities = ["low","medium","high","critical"];
const ppeTypes = ["Safety Helmet","Safety Shoes","Safety Glasses","Gloves","Ear Protection","Respirator","Coverall","Full Body Harness","Face Shield","Gas Mask"];

const pointIcons: Record<string, any> = {
  exit: DoorOpen, assembly: Users, extinguisher: Flame,
  firstaid: HeartPulse, eyewash: Droplets, alarm: Bell, phone: Phone,
};
const pointColors: Record<string, string> = {
  exit: "bg-green-500", assembly: "bg-blue-500", extinguisher: "bg-red-500",
  firstaid: "bg-pink-500", eyewash: "bg-cyan-500", alarm: "bg-orange-500", phone: "bg-purple-500",
};

export default function HSECenter() {
  const navigate = useNavigate();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [ppe, setPPE] = useState<PPE[]>([]);
  const [points, setPoints] = useState<EmgPoint[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [p, i, pp, ep] = await Promise.all([
      supabase.from("work_permits").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("safety_incidents").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("ppe_issuances").select("*").order("issued_at", { ascending: false }).limit(200),
      supabase.from("emergency_points").select("*"),
    ]);
    setPermits(p.data || []); setIncidents(i.data || []);
    setPPE(pp.data || []); setPoints(ep.data || []);
    setLoading(false);
  }
  useEffect(() => { loadAll(); }, []);

  // ===== KPIs =====
  const today = new Date().toISOString().slice(0, 10);
  const kpi = useMemo(() => {
    const activePermits = permits.filter((p) => p.status === "approved").length;
    const pendingPermits = permits.filter((p) => p.status?.startsWith("pending")).length;
    const openIncidents = incidents.filter((i) => i.status === "open" && i.entry_type === "incident").length;
    const nearMiss = incidents.filter((i) => i.entry_type === "near_miss").length;
    const observations = incidents.filter((i) => i.entry_type === "observation").length;
    const heightWork = permits.filter((p) => p.permit_type === "Working at Height" && p.status === "approved").length;
    const hotWork = permits.filter((p) => p.permit_type === "Hot Work" && p.status === "approved").length;
    const todayGas = 0; // placeholder for gas tests today
    const inspectionsDone = incidents.filter((i) => i.entry_type === "inspection").length;
    const openCorrective = incidents.filter((i) => i.status !== "closed" && i.corrective_action).length;
    const totalRec = incidents.filter((i) => i.entry_type === "incident").length;
    // Days without LTI: days since last "critical" incident
    const lastCritical = incidents.find((i) => i.severity === "critical" && i.entry_type === "incident");
    const daysNoLTI = lastCritical
      ? Math.floor((Date.now() - new Date(lastCritical.created_at).getTime()) / 86400000)
      : 365;
    const ptwCompliance = permits.length ? Math.round((permits.filter((p) => p.status === "approved" || p.status === "closed").length / permits.length) * 100) : 100;
    return { activePermits, pendingPermits, openIncidents, nearMiss, observations, heightWork, hotWork, todayGas, inspectionsDone, openCorrective, totalRec, daysNoLTI, ptwCompliance };
  }, [permits, incidents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dept/SAFETY")} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> رجوع
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-wide">مركز قيادة السلامة والصحة المهنية</h1>
          </div>
          <Button size="sm" onClick={loadAll} disabled={loading} className="bg-emerald-500/80 hover:bg-emerald-500">
            <Activity className="w-4 h-4 mr-1" /> تحديث
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* ===== 1 & 6: Live Dashboard + KPIs ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <KPI icon={CheckCircle2} label="تصاريح نشطة" value={kpi.activePermits} color="from-emerald-500 to-emerald-700" />
          <KPI icon={Clock} label="تصاريح بالانتظار" value={kpi.pendingPermits} color="from-amber-500 to-amber-700" />
          <KPI icon={AlertTriangle} label="حوادث مفتوحة" value={kpi.openIncidents} color="from-red-500 to-red-700" />
          <KPI icon={Eye} label="حالات وشيكة" value={kpi.nearMiss} color="from-orange-500 to-orange-700" />
          <KPI icon={ShieldCheck} label="أيام بلا إصابات" value={kpi.daysNoLTI} color="from-blue-500 to-blue-700" />
          <KPI icon={Flame} label="أعمال ساخنة" value={kpi.hotWork} color="from-rose-500 to-rose-700" />
          <KPI icon={HardHat} label="عمل على ارتفاع" value={kpi.heightWork} color="from-purple-500 to-purple-700" />
          <KPI icon={Activity} label="اختبارات غاز" value={kpi.todayGas} color="from-cyan-500 to-cyan-700" />
          <KPI icon={FileCheck2} label="تفتيشات" value={kpi.inspectionsDone} color="from-teal-500 to-teal-700" />
          <KPI icon={AlertTriangle} label="إجمالي الحوادث" value={kpi.totalRec} color="from-pink-500 to-pink-700" />
          <KPI icon={Eye} label="ملاحظات سلامة" value={kpi.observations} color="from-indigo-500 to-indigo-700" />
          <KPI icon={CheckCircle2} label="نسبة الامتثال لتصاريح العمل" value={`${kpi.ptwCompliance}%`} color="from-green-500 to-green-700" />
        </div>

        <Tabs defaultValue="ptw" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-white/5 backdrop-blur-md p-2 h-auto">
            <TabsTrigger value="ptw" className="data-[state=active]:bg-emerald-500/80">تصاريح العمل</TabsTrigger>
            <TabsTrigger value="obs" className="data-[state=active]:bg-orange-500/80">ملاحظات السلامة</TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-blue-500/80">خريطة الطوارئ</TabsTrigger>
            <TabsTrigger value="ppe" className="data-[state=active]:bg-purple-500/80">PPE</TabsTrigger>
            <TabsTrigger value="kpi" className="data-[state=active]:bg-teal-500/80">KPIs</TabsTrigger>
          </TabsList>

          {/* ===== 2. Digital Permit Approval ===== */}
          <TabsContent value="ptw" className="mt-4">
            <PermitPanel permits={permits} onChange={loadAll} />
          </TabsContent>

          {/* ===== 5. Safety Observation ===== */}
          <TabsContent value="obs" className="mt-4">
            <ObservationPanel incidents={incidents} onChange={loadAll} />
          </TabsContent>

          {/* ===== 3. Emergency Map ===== */}
          <TabsContent value="map" className="mt-4">
            <EmergencyMap points={points} onChange={loadAll} />
          </TabsContent>

          {/* ===== 4. PPE Tracking ===== */}
          <TabsContent value="ppe" className="mt-4">
            <PPEPanel items={ppe} onChange={loadAll} />
          </TabsContent>

          {/* ===== 6. KPI Detail ===== */}
          <TabsContent value="kpi" className="mt-4">
            <KPIPanel k={kpi} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ================ KPI Card ================
function KPI({ icon: Icon, label, value, color }: any) {
  return (
    <Card className={`p-3 bg-gradient-to-br ${color} border-white/20 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 opacity-80" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs mt-1 opacity-90">{label}</p>
    </Card>
  );
}

// ================ Permit Panel ================
function PermitPanel({ permits, onChange }: any) {
  const [form, setForm] = useState({
    permit_type: "Hot Work", location: "", description: "", hazards: "",
    controls: "", requested_by: "", supervisor: "", hse_officer: "", workers_count: 1,
  });
  const [creating, setCreating] = useState(false);

  async function create() {
    if (!form.location || !form.requested_by) { toast.error("املأ الحقول المطلوبة"); return; }
    const { error } = await supabase.from("work_permits").insert({ ...form, status: "pending_supervisor" });
    if (error) return toast.error(error.message);
    toast.success("تم إنشاء التصريح — بانتظار اعتماد المشرف");
    setCreating(false); onChange();
  }

  async function approve(id: string, level: "supervisor" | "hse", by: string) {
    if (!by.trim()) return toast.error("أدخل اسم المعتمد");
    const patch: any = level === "supervisor"
      ? { supervisor_approved_at: new Date().toISOString(), supervisor_approved_by: by, status: "pending_hse" }
      : { hse_approved_at: new Date().toISOString(), hse_approved_by: by, status: "approved" };
    const { error } = await supabase.from("work_permits").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الاعتماد"); onChange();
  }
  async function reject(id: string) {
    const reason = prompt("سبب الرفض؟"); if (!reason) return;
    await supabase.from("work_permits").update({ status: "rejected", rejected_reason: reason }).eq("id", id);
    toast.success("تم الرفض"); onChange();
  }
  async function close(id: string) {
    await supabase.from("work_permits").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", id);
    toast.success("تم إغلاق التصريح"); onChange();
  }

  const statusColors: Record<string, string> = {
    pending_supervisor: "bg-amber-500", pending_hse: "bg-orange-500",
    approved: "bg-emerald-500", rejected: "bg-red-500", closed: "bg-slate-500",
  };

  return (
    <Card className="p-4 bg-white/5 backdrop-blur-md border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">تصريح العمل الرقمي</h3>
        <Button size="sm" onClick={() => setCreating(!creating)} className="bg-emerald-500/80">
          <Plus className="w-4 h-4 mr-1" /> تصريح جديد
        </Button>
      </div>

      {creating && (
        <div className="grid md:grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-slate-900/50">
          <Select value={form.permit_type} onValueChange={(v) => setForm({ ...form, permit_type: v })}>
            <SelectTrigger className="bg-slate-800/50 border-white/20"><SelectValue /></SelectTrigger>
            <SelectContent>{permitTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="الموقع *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Input placeholder="مقدم الطلب *" value={form.requested_by} onChange={(e) => setForm({ ...form, requested_by: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Input placeholder="المشرف" value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Input placeholder="مسؤول HSE" value={form.hse_officer} onChange={(e) => setForm({ ...form, hse_officer: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Input type="number" placeholder="عدد العمال" value={form.workers_count} onChange={(e) => setForm({ ...form, workers_count: +e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Textarea placeholder="وصف العمل" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-slate-800/50 border-white/20 md:col-span-3" rows={2} />
          <Textarea placeholder="المخاطر" value={form.hazards} onChange={(e) => setForm({ ...form, hazards: e.target.value })} className="bg-slate-800/50 border-white/20 md:col-span-3" rows={2} />
          <Textarea placeholder="إجراءات التحكم" value={form.controls} onChange={(e) => setForm({ ...form, controls: e.target.value })} className="bg-slate-800/50 border-white/20 md:col-span-3" rows={2} />
          <Button onClick={create} className="bg-emerald-500 md:col-span-3">إنشاء التصريح</Button>
        </div>
      )}

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {permits.map((p: any) => (
          <div key={p.id} className="p-3 rounded-lg bg-slate-900/50 border border-white/10">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-cyan-300">{p.permit_no}</span>
                  <Badge className={`${statusColors[p.status] || "bg-gray-500"} text-white text-xs`}>{p.status}</Badge>
                  <Badge variant="outline" className="text-xs border-white/30">{p.permit_type}</Badge>
                </div>
                <p className="text-sm mt-1">{p.location} — {p.description || "-"}</p>
                <p className="text-xs opacity-70 mt-1">
                  مقدم: {p.requested_by} • عمال: {p.workers_count}
                  {p.supervisor_approved_by && ` • مشرف: ${p.supervisor_approved_by} ✓`}
                  {p.hse_approved_by && ` • HSE: ${p.hse_approved_by} ✓`}
                </p>
              </div>
              <div className="flex gap-1 flex-wrap">
                {p.status === "pending_supervisor" && (
                  <>
                    <Button size="sm" className="bg-emerald-500 h-7" onClick={() => approve(p.id, "supervisor", prompt("اسم المشرف؟") || "")}>اعتماد المشرف</Button>
                    <Button size="sm" variant="destructive" className="h-7" onClick={() => reject(p.id)}>رفض</Button>
                  </>
                )}
                {p.status === "pending_hse" && (
                  <>
                    <Button size="sm" className="bg-emerald-500 h-7" onClick={() => approve(p.id, "hse", prompt("اسم مسؤول HSE؟") || "")}>اعتماد HSE</Button>
                    <Button size="sm" variant="destructive" className="h-7" onClick={() => reject(p.id)}>رفض</Button>
                  </>
                )}
                {p.status === "approved" && <Button size="sm" className="bg-slate-500 h-7" onClick={() => close(p.id)}>إغلاق</Button>}
              </div>
            </div>
          </div>
        ))}
        {permits.length === 0 && <p className="text-center opacity-50 py-8">لا توجد تصاريح بعد</p>}
      </div>
    </Card>
  );
}

// ================ Observation Panel ================
function ObservationPanel({ incidents, onChange }: any) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    entry_type: "observation", severity: "low", location: "", description: "",
    reported_by: "", suggested_action: "", photo_url: "",
  });
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    if (!form.description || !form.reported_by) { toast.error("املأ الحقول"); return; }
    let photo_url = "";
    if (file) {
      const path = `hse/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("field-ops-photos").upload(path, file);
      if (!upErr) {
        const { data } = supabase.storage.from("field-ops-photos").getPublicUrl(path);
        photo_url = data.publicUrl;
      }
    }
    const { error } = await supabase.from("safety_incidents").insert({ ...form, photo_url });
    if (error) return toast.error(error.message);
    toast.success("تم تسجيل الملاحظة");
    setCreating(false); setFile(null); onChange();
  }

  async function updateStatus(id: string, patch: any) {
    await supabase.from("safety_incidents").update(patch).eq("id", id);
    onChange();
  }

  const sevColors: Record<string, string> = {
    low: "bg-blue-500", medium: "bg-amber-500", high: "bg-orange-500", critical: "bg-red-600 animate-pulse",
  };

  return (
    <Card className="p-4 bg-white/5 backdrop-blur-md border-white/10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">ملاحظات وحوادث السلامة</h3>
        <Button size="sm" onClick={() => setCreating(!creating)} className="bg-orange-500/80">
          <Plus className="w-4 h-4 mr-1" /> تسجيل جديد
        </Button>
      </div>

      {creating && (
        <div className="grid md:grid-cols-2 gap-2 mb-4 p-3 rounded-lg bg-slate-900/50">
          <Select value={form.entry_type} onValueChange={(v) => setForm({ ...form, entry_type: v })}>
            <SelectTrigger className="bg-slate-800/50 border-white/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="observation">ملاحظة سلامة</SelectItem>
              <SelectItem value="near_miss">حالة وشيكة</SelectItem>
              <SelectItem value="incident">حادث</SelectItem>
              <SelectItem value="inspection">تفتيش</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
            <SelectTrigger className="bg-slate-800/50 border-white/20"><SelectValue /></SelectTrigger>
            <SelectContent>{severities.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="الموقع" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Input placeholder="المُبلِّغ *" value={form.reported_by} onChange={(e) => setForm({ ...form, reported_by: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Textarea placeholder="الوصف *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-slate-800/50 border-white/20 md:col-span-2" rows={2} />
          <Textarea placeholder="الإجراء المقترح" value={form.suggested_action} onChange={(e) => setForm({ ...form, suggested_action: e.target.value })} className="bg-slate-800/50 border-white/20 md:col-span-2" rows={2} />
          <div className="md:col-span-2">
            <Label className="text-xs opacity-80 flex items-center gap-1"><Camera className="w-3 h-3" /> صورة (اختياري)</Label>
            <Input type="file" accept="image/*" capture="environment" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-slate-800/50 border-white/20 mt-1" />
          </div>
          <Button onClick={submit} className="bg-orange-500 md:col-span-2">تسجيل</Button>
        </div>
      )}

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {incidents.map((i: any) => (
          <div key={i.id} className="p-3 rounded-lg bg-slate-900/50 border border-white/10">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-cyan-300">{i.incident_no}</span>
                  <Badge className={`${sevColors[i.severity]} text-white text-xs`}>{i.severity}</Badge>
                  <Badge variant="outline" className="text-xs border-white/30">{i.entry_type}</Badge>
                  <Badge className={i.status === "closed" ? "bg-emerald-500" : "bg-amber-500"}>{i.status}</Badge>
                </div>
                <p className="text-sm mt-1">{i.description}</p>
                <p className="text-xs opacity-70">📍 {i.location || "-"} • {i.reported_by}</p>
                {i.suggested_action && <p className="text-xs opacity-70 mt-1">💡 {i.suggested_action}</p>}
                {i.corrective_action && <p className="text-xs text-emerald-300 mt-1">✓ {i.corrective_action}</p>}
                {i.photo_url && <img src={i.photo_url} alt="" className="mt-2 rounded max-h-32" />}
              </div>
              <div className="flex flex-col gap-1">
                {i.status !== "closed" && (
                  <>
                    <Button size="sm" className="bg-blue-500 h-7 text-xs" onClick={() => {
                      const a = prompt("الإجراء التصحيحي:"); if (a) updateStatus(i.id, { corrective_action: a, status: "investigating" });
                    }}>إجراء</Button>
                    <Button size="sm" className="bg-emerald-500 h-7 text-xs" onClick={() => updateStatus(i.id, { status: "closed", closed_at: new Date().toISOString() })}>إغلاق</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {incidents.length === 0 && <p className="text-center opacity-50 py-8">لا توجد ملاحظات بعد</p>}
      </div>
    </Card>
  );
}

// ================ Emergency Map ================
function EmergencyMap({ points, onChange }: any) {
  const [addMode, setAddMode] = useState<string | null>(null);

  async function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!addMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const label = prompt("اسم النقطة؟"); if (!label) { setAddMode(null); return; }
    await supabase.from("emergency_points").insert({ plant_code: "SITE", point_type: addMode, label, x_pct: x, y_pct: y });
    toast.success("تم إضافة النقطة"); setAddMode(null); onChange();
  }
  async function remove(id: string) {
    if (!confirm("حذف؟")) return;
    await supabase.from("emergency_points").delete().eq("id", id);
    onChange();
  }

  const types = [
    { k: "exit", label: "مخرج", icon: DoorOpen },
    { k: "assembly", label: "تجمع", icon: Users },
    { k: "extinguisher", label: "طفاية", icon: Flame },
    { k: "firstaid", label: "إسعافات", icon: HeartPulse },
    { k: "eyewash", label: "غسل عيون", icon: Droplets },
    { k: "alarm", label: "إنذار", icon: Bell },
    { k: "phone", label: "هاتف طوارئ", icon: Phone },
  ];

  return (
    <Card className="p-4 bg-white/5 backdrop-blur-md border-white/10">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h3 className="font-bold text-lg">خريطة الطوارئ التفاعلية</h3>
        <div className="flex flex-wrap gap-1">
          {types.map((t) => (
            <Button key={t.k} size="sm" variant={addMode === t.k ? "default" : "outline"} onClick={() => setAddMode(addMode === t.k ? null : t.k)} className={`h-7 text-xs ${addMode === t.k ? "bg-emerald-500" : "border-white/30 text-white bg-white/5"}`}>
              <t.icon className="w-3 h-3 mr-1" /> {t.label}
            </Button>
          ))}
        </div>
      </div>
      {addMode && <p className="text-xs text-emerald-300 mb-2">👆 اضغط على الخريطة لإضافة نقطة {types.find((t) => t.k === addMode)?.label}</p>}

      <div
        onClick={handleClick}
        className="relative w-full aspect-video rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white/20 cursor-crosshair overflow-hidden"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      >
        <div className="absolute top-2 left-2 text-xs opacity-50">LIFECO Site Plan</div>
        {points.map((p: any) => {
          const Icon = pointIcons[p.point_type] || MapPin;
          return (
            <div key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${p.x_pct}%`, top: `${p.y_pct}%` }}>
              <div className={`${pointColors[p.point_type]} p-2 rounded-full shadow-lg ring-2 ring-white/50 hover:scale-125 transition`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black/80 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                {p.label}
                <button onClick={(e) => { e.stopPropagation(); remove(p.id); }} className="ml-2 text-red-400 pointer-events-auto">✕</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        {types.map((t) => (
          <span key={t.k} className="flex items-center gap-1">
            <span className={`${pointColors[t.k]} w-3 h-3 rounded-full inline-block`} /> {t.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ================ PPE Panel ================
function PPEPanel({ items, onChange }: any) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    employee_id: "", employee_name: "", department: "", ppe_type: "Safety Helmet",
    issued_at: new Date().toISOString().slice(0, 10), replacement_due: "", condition: "good",
  });

  async function issue() {
    if (!form.employee_id || !form.employee_name) { toast.error("املأ بيانات الموظف"); return; }
    const due = form.replacement_due || new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10);
    const { error } = await supabase.from("ppe_issuances").insert({ ...form, replacement_due: due });
    if (error) return toast.error(error.message);
    toast.success("تم تسجيل التسليم"); setCreating(false); onChange();
  }

  const isExpiring = (due: string) => {
    if (!due) return false;
    const days = (new Date(due).getTime() - Date.now()) / 86400000;
    return days < 30;
  };
  const isExpired = (due: string) => due && new Date(due).getTime() < Date.now();

  return (
    <Card className="p-4 bg-white/5 backdrop-blur-md border-white/10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">تتبع معدات الوقاية الشخصية</h3>
        <Button size="sm" onClick={() => setCreating(!creating)} className="bg-purple-500/80">
          <Plus className="w-4 h-4 mr-1" /> تسليم PPE
        </Button>
      </div>

      {creating && (
        <div className="grid md:grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-slate-900/50">
          <Input placeholder="رقم الموظف *" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Input placeholder="اسم الموظف *" value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Input placeholder="الإدارة" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Select value={form.ppe_type} onValueChange={(v) => setForm({ ...form, ppe_type: v })}>
            <SelectTrigger className="bg-slate-800/50 border-white/20"><SelectValue /></SelectTrigger>
            <SelectContent>{ppeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" value={form.issued_at} onChange={(e) => setForm({ ...form, issued_at: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Input type="date" placeholder="تاريخ الاستبدال" value={form.replacement_due} onChange={(e) => setForm({ ...form, replacement_due: e.target.value })} className="bg-slate-800/50 border-white/20" />
          <Button onClick={issue} className="bg-purple-500 md:col-span-3">تسجيل التسليم</Button>
        </div>
      )}

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/70 sticky top-0">
            <tr>
              <th className="p-2 text-right">الموظف</th>
              <th className="p-2 text-right">النوع</th>
              <th className="p-2 text-right">تاريخ التسليم</th>
              <th className="p-2 text-right">الاستبدال</th>
              <th className="p-2 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p: any) => (
              <tr key={p.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-2">
                  <div className="font-medium">{p.employee_name}</div>
                  <div className="text-xs opacity-70">{p.employee_id} • {p.department}</div>
                </td>
                <td className="p-2">{p.ppe_type}</td>
                <td className="p-2">{p.issued_at}</td>
                <td className="p-2">
                  {p.replacement_due}
                  {isExpired(p.replacement_due) && <Badge className="bg-red-600 ml-2 text-xs">منتهي</Badge>}
                  {!isExpired(p.replacement_due) && isExpiring(p.replacement_due) && <Badge className="bg-amber-500 ml-2 text-xs">قريب</Badge>}
                </td>
                <td className="p-2">
                  <Badge className={p.condition === "good" ? "bg-emerald-500" : p.condition === "damaged" ? "bg-red-500" : "bg-amber-500"}>{p.condition}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center opacity-50 py-8">لا توجد سجلات PPE</p>}
      </div>
    </Card>
  );
}

// ================ KPI Panel ================
function KPIPanel({ k }: any) {
  const rows = [
    { label: "أيام بلا إصابات مسجلة", value: k.daysNoLTI, target: 365, unit: "يوم" },
    { label: "إجمالي الحوادث المسجلة", value: k.totalRec, target: 0, unit: "" },
    { label: "تقارير الحالات الوشيكة", value: k.nearMiss, target: 10, unit: "" },
    { label: "الإجراءات التصحيحية المفتوحة", value: k.openCorrective, target: 0, unit: "" },
    { label: "نسبة الامتثال لتصاريح العمل", value: k.ptwCompliance, target: 100, unit: "%" },
    { label: "إتمام التدريب على السلامة", value: 85, target: 100, unit: "%" },
    { label: "معدل إتمام التفتيشات", value: k.inspectionsDone, target: 30, unit: "" },
    { label: "أداء تمارين الطوارئ", value: 92, target: 100, unit: "%" },
  ];
  return (
    <Card className="p-4 bg-white/5 backdrop-blur-md border-white/10">
      <h3 className="font-bold text-lg mb-4">لوحة مؤشرات أداء السلامة</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {rows.map((r) => {
          const pct = Math.min(100, (r.value / (r.target || 1)) * 100);
          const good = r.label.includes("الحوادث") || r.label.includes("التصحيحية")
            ? r.value <= r.target : pct >= 80;
          return (
            <div key={r.label} className="p-3 rounded-lg bg-slate-900/50 border border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-sm">{r.label}</span>
                <span className={`font-bold ${good ? "text-emerald-400" : "text-amber-400"}`}>{r.value}{r.unit} / {r.target}{r.unit}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${good ? "bg-emerald-500" : "bg-amber-500"} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
