import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, LayoutDashboard, Building2, Wrench, FolderOpen, Users, ShieldCheck,
  FileText, Bell, BarChart3, Palette, Languages, Database, Lock, Settings,
  Bot, Activity, ClipboardList, Terminal, Info, Server,
  CheckCircle2, AlertCircle, Search, Plus, Trash2, Save, RefreshCw, Pencil,
} from "lucide-react";

type SectionKey =
  | "dashboard" | "org" | "equipment" | "library" | "users" | "roles"
  | "reports" | "notifications" | "builder" | "branding" | "language"
  | "database" | "security" | "settings" | "ai" | "monitoring"
  | "audit" | "devtools" | "about";

const SECTIONS: { key: SectionKey; label: string; icon: any }[] = [
  { key: "dashboard",     label: "لوحة التحكم",              icon: LayoutDashboard },
  { key: "org",           label: "الهيكل التنظيمي",           icon: Building2 },
  { key: "equipment",     label: "المعدات",              icon: Wrench },
  { key: "library",       label: "المكتبة الرقمية",        icon: FolderOpen },
  { key: "users",         label: "المستخدمون",                  icon: Users },
  { key: "roles",         label: "الأدوار والصلاحيات",    icon: ShieldCheck },
  { key: "reports",       label: "التقارير",                icon: FileText },
  { key: "notifications", label: "الإشعارات",          icon: Bell },
  { key: "builder",       label: "منشئ لوحات التحكم",      icon: BarChart3 },
  { key: "branding",      label: "الهوية البصرية",               icon: Palette },
  { key: "language",      label: "اللغة",               icon: Languages },
  { key: "database",      label: "قاعدة البيانات",               icon: Database },
  { key: "security",      label: "الأمان",               icon: Lock },
  { key: "settings",      label: "إعدادات النظام",        icon: Settings },
  { key: "ai",            label: "إعدادات الذكاء الاصطناعي",            icon: Bot },
  { key: "monitoring",    label: "مراقبة النظام",      icon: Activity },
  { key: "audit",         label: "مركز التدقيق",           icon: ClipboardList },
  { key: "devtools",      label: "أدوات المطور",        icon: Terminal },
  { key: "about",         label: "حول النظام",           icon: Info },
];

const AUTH_KEY = "lifeco.devpanel.auth";
const DEV_PIN = "9999";

export default function DeveloperPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [active, setActive] = useState<SectionKey>("dashboard");

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
  }, []);

  const tryLogin = () => {
    if (pin === DEV_PIN) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
    } else {
      toast({ title: "تم رفض الوصول", description: "رمز المطور غير صحيح", variant: "destructive" });
      setPin("");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_60px_rgba(59,130,246,0.15)]">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-blue-500/20 border border-blue-400/30">
              <Terminal className="w-8 h-8 text-blue-300" />
            </div>
            <h1 className="text-xl font-bold text-white">لوحة المطور</h1>
            <p className="text-xs text-blue-200/70">للدخول المصرح به فقط</p>
          </div>
          <Input type="password" placeholder="رمز المطور" value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryLogin()}
            className="bg-white/5 border-white/10 text-white text-center tracking-widest" autoFocus />
          <Button onClick={tryLogin} className="w-full mt-4 bg-blue-600 hover:bg-blue-500">فتح القفل</Button>
          <Button variant="ghost" onClick={() => navigate("/")} className="w-full mt-2 text-white/60">
            <ArrowLeft className="w-4 h-4 mr-2" />رجوع
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <aside className="w-64 shrink-0 border-r border-white/10 backdrop-blur-xl bg-white/5 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-300" />
            <div>
              <div className="text-sm font-bold">لوحة المطور</div>
              <div className="text-[10px] text-blue-200/60">وحدة تحكم LIFECO الرئيسية</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.key;
            return (
              <button key={s.key} onClick={() => setActive(s.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition
                  ${isActive
                    ? "bg-blue-500/20 border border-blue-400/40 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                    : "hover:bg-white/5 text-white/70 border border-transparent"}`}>
                <Icon className="w-4 h-4" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="w-full text-white/70">
            <ArrowLeft className="w-4 h-4 mr-2" />خروج
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }}
            className="w-full text-red-300/80">
            <Lock className="w-4 h-4 mr-2" />قفل
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <SectionRenderer active={active} />
      </main>
    </div>
  );
}

function SectionRenderer({ active }: { active: SectionKey }) {
  const label = SECTIONS.find((s) => s.key === active)?.label ?? "";
  return (
    <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{label}</h1>
        <div className="h-[2px] w-16 bg-gradient-to-r from-blue-500 to-cyan-400 mt-2 rounded-full" />
      </header>

      {active === "dashboard"     && <DashboardSection />}
      {active === "org"           && <OrgSection />}
      {active === "equipment"     && <EquipmentSection />}
      {active === "library"       && <LibrarySection />}
      {active === "users"         && <UsersSection />}
      {active === "roles"         && <RolesSection />}
      {active === "branding"      && <BrandingSection />}
      {active === "settings"      && <SystemSettingsSection />}
      {active === "database"      && <DatabaseSection />}
      {active === "monitoring"    && <MonitoringSection />}
      {active === "about"         && <AboutSection />}

      {!["dashboard","org","equipment","library","users","roles","branding","settings","database","monitoring","about"].includes(active) && (
        <PlaceholderSection sectionKey={active} />
      )}
    </motion.div>
  );
}

/* ---------------- Helpers ---------------- */
function Card({ title, children, icon: Icon, action }: any) {
  return (
    <div className="rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 p-4 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
      {title && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-blue-200/90 text-sm font-semibold">
            {Icon && <Icon className="w-4 h-4" />}
            {title}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function StatTile({ label, value, sub, tone = "blue" }: any) {
  const tones: Record<string, string> = {
    blue: "from-blue-500/20 to-cyan-500/10 border-blue-400/30",
    green: "from-emerald-500/20 to-green-500/10 border-emerald-400/30",
    orange: "from-orange-500/20 to-amber-500/10 border-orange-400/30",
    red: "from-red-500/20 to-rose-500/10 border-red-400/30",
  };
  return (
    <div className={`rounded-xl bg-gradient-to-br ${tones[tone]} border p-4 backdrop-blur-xl`}>
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-white/60 mt-1">{sub}</div>}
    </div>
  );
}

async function loadSetting<T = any>(key: string, fallback: T): Promise<T> {
  const { data } = await (supabase.from("system_settings" as any) as any).select("value").eq("key", key).maybeSingle();
  return ((data as any)?.value as T) ?? fallback;
}
async function saveSetting(key: string, value: any) {
  return (supabase.from("system_settings" as any) as any).upsert({ key, value, updated_at: new Date().toISOString() });
}

/* ---------------- Dashboard ---------------- */
function DashboardSection() {
  const [stats, setStats] = useState({ users: 0, plants: 0, equipment: 0, files: 0, logs: 0 });
  useEffect(() => {
    (async () => {
      const [u, p, e, f, l] = await Promise.all([
        supabase.from("user_roles").select("id", { count: "exact", head: true }),
        supabase.from("plants").select("id", { count: "exact", head: true }),
        supabase.from("equipment_assets").select("id", { count: "exact", head: true }),
        supabase.from("library_files").select("id", { count: "exact", head: true }),
        supabase.from("activity_logs").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        users: u.count || 0, plants: p.count || 0, equipment: e.count || 0,
        files: f.count || 0, logs: l.count || 0,
      });
    })();
  }, []);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="حالة المنصة"  value="متصلة" sub="جميع الخدمات تعمل بشكل جيد" tone="green" />
        <StatTile label="قاعدة البيانات"         value="متصلة" sub="Lovable Cloud" tone="blue" />
        <StatTile label="النسخ الاحتياطي"           value="تلقائي"      sub="نسخ يومية" tone="blue" />
        <StatTile label="الخادم"           value="Edge"      sub="Cloudflare Workers" tone="green" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatTile label="المستخدمون"      value={stats.users} tone="blue" />
        <StatTile label="المصانع"     value={stats.plants} tone="blue" />
        <StatTile label="المعدات"  value={stats.equipment} tone="orange" />
        <StatTile label="الملفات"      value={stats.files} tone="green" />
        <StatTile label="سجلات النشاط" value={stats.logs} tone="orange" />
      </div>
      <Card title="إشعارات النظام" icon={Bell}>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="w-4 h-4"/>جميع الوحدات تعمل بشكل طبيعي</div>
          <div className="flex items-center gap-2 text-blue-200"><CheckCircle2 className="w-4 h-4"/>مساحة التخزين ضمن الحد المسموح</div>
          <div className="flex items-center gap-2 text-amber-300"><AlertCircle className="w-4 h-4"/>راجع نتائج الأمان أسبوعياً</div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Organization (CRUD Plants) ---------------- */
function OrgSection() {
  const { toast } = useToast();
  const [plants, setPlants] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ code: "", name: "", department: DEPARTMENTS[0].id });

  const load = useCallback(async () => {
    const { data } = await supabase.from("plants").select("*").order("department");
    setPlants(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const addPlant = async () => {
    if (!form.code || !form.name) return toast({ title: "يرجى إدخال الرمز والاسم", variant: "destructive" });
    const { error } = await supabase.from("plants").insert(form as any);
    if (error) return toast({ title: "فشل الإضافة", description: error.message, variant: "destructive" });
    toast({ title: "تمت إضافة المصنع" });
    setForm({ code: "", name: "", department: DEPARTMENTS[0].id });
    load();
  };
  const removePlant = async (id: string) => {
    if (!confirm("هل تريد حذف هذا المصنع؟")) return;
    const { error } = await supabase.from("plants").delete().eq("id", id);
    if (error) return toast({ title: "فشل الحذف", description: error.message, variant: "destructive" });
    toast({ title: "تم حذف المصنع" });
    load();
  };

  const filtered = plants.filter((p) =>
    (String(p.code) + p.name + p.department).toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6">
      <Card title="الإدارات" icon={Building2}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DEPARTMENTS.map((d) => (
            <div key={d.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/50">{d.id}</div>
              <div className="font-semibold">{d.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="إضافة مصنع" icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input placeholder="الرمز (مثال: AMM-3)" value={form.code} onChange={(e)=>setForm({...form, code:e.target.value})} className="bg-white/5 border-white/10 text-white" />
          <Input placeholder="الاسم" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="bg-white/5 border-white/10 text-white" />
          <select value={form.department} onChange={(e)=>setForm({...form, department:e.target.value})}
            className="bg-slate-800 border border-white/10 rounded-md px-3 text-sm">
            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <Button onClick={addPlant} className="bg-emerald-600 hover:bg-emerald-500"><Plus className="w-4 h-4 mr-1"/>إضافة</Button>
        </div>
      </Card>

      <Card title={`المصانع (${plants.length})`} icon={Building2}
        action={<Button size="sm" variant="ghost" onClick={load}><RefreshCw className="w-4 h-4"/></Button>}>
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-white/40" />
          <Input placeholder="بحث..." value={filter} onChange={(e)=>setFilter(e.target.value)}
            className="bg-white/5 border-white/10 text-white" />
        </div>
        <div className="max-h-96 overflow-y-auto space-y-1">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 border-blue-400/30 text-blue-200">{p.code}</Badge>
                <span>{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">{p.department}</span>
                <Button size="sm" variant="ghost" onClick={()=>removePlant(p.id)} className="text-red-300 hover:text-red-200">
                  <Trash2 className="w-4 h-4"/>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Equipment (CRUD) ---------------- */
function EquipmentSection() {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ tag_number: "", name: "", category: "", location: "", status: "active" });

  const load = useCallback(async () => {
    const { data } = await supabase.from("equipment_assets").select("*").order("created_at", { ascending: false }).limit(500);
    setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.tag_number) return toast({ title: "رقم العلامة مطلوب", variant: "destructive" });
    const { error } = await supabase.from("equipment_assets").insert(form as any);
    if (error) return toast({ title: "فشل الإضافة", description: error.message, variant: "destructive" });
    toast({ title: "تمت إضافة المعدة" });
    setForm({ tag_number: "", name: "", category: "", location: "", status: "active" });
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("هل تريد حذف هذه المعدة؟")) return;
    const { error } = await supabase.from("equipment_assets").delete().eq("id", id);
    if (error) return toast({ title: "فشل الحذف", description: error.message, variant: "destructive" });
    load();
  };

  return (
    <div className="space-y-6">
      <Card title="إضافة معدة" icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <Input placeholder="رقم العلامة" value={form.tag_number} onChange={(e)=>setForm({...form, tag_number:e.target.value})} className="bg-white/5 border-white/10 text-white"/>
          <Input placeholder="الاسم" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="bg-white/5 border-white/10 text-white"/>
          <Input placeholder="الفئة" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} className="bg-white/5 border-white/10 text-white"/>
          <Input placeholder="الموقع" value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} className="bg-white/5 border-white/10 text-white"/>
          <Button onClick={add} className="bg-emerald-600 hover:bg-emerald-500"><Plus className="w-4 h-4 mr-1"/>إضافة</Button>
        </div>
      </Card>
      <Card title={`سجل المعدات (${rows.length})`} icon={Wrench}
        action={<Button size="sm" variant="ghost" onClick={load}><RefreshCw className="w-4 h-4"/></Button>}>
        <div className="max-h-[600px] overflow-y-auto space-y-1">
          {rows.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
              <div>
                <div className="font-semibold">{e.name || e.tag_number}</div>
                <div className="text-xs text-white/50">{e.category} · {e.location}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/10">{e.status || "active"}</Badge>
                <Button size="sm" variant="ghost" onClick={()=>remove(e.id)} className="text-red-300"><Trash2 className="w-4 h-4"/></Button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="text-white/50 text-sm p-6 text-center">لا توجد سجلات معدات.</div>}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Library ---------------- */
function LibrarySection() {
  const [files, setFiles] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("library_files").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setFiles(data || []));
  }, []);
  const byCategory = files.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1; return acc;
  }, {});
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(byCategory).map(([k, v]) => (<StatTile key={k} label={k} value={v} tone="blue" />))}
      </div>
      <Card title={`الملفات الحديثة (${files.length})`} icon={FolderOpen}>
        <div className="max-h-[500px] overflow-y-auto space-y-1">
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
              <div>
                <div className="font-semibold">{f.file_name}</div>
                <div className="text-xs text-white/50">{f.category} · {f.plant || "—"}</div>
              </div>
              <span className="text-xs text-white/50">{new Date(f.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Users (Role Editor) ---------------- */
const APP_ROLES = ["super_admin","dept_manager","engineer","supervisor","technician","lab_user","warehouse","read_only"];
function UsersSection() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState({ user_id: "", role: "engineer" });

  const load = useCallback(async () => {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    setRoles(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.user_id) return toast({ title: "معرّف المستخدم مطلوب", variant: "destructive" });
    const { error } = await supabase.from("user_roles").insert(form as any);
    if (error) return toast({ title: "فشل الإضافة", description: error.message, variant: "destructive" });
    toast({ title: "تم تعيين الصلاحية" });
    setForm({ user_id: "", role: "engineer" });
    load();
  };
  const updateRole = async (id: string, role: string) => {
    const { error } = await supabase.from("user_roles").update({ role: role as any }).eq("id", id);
    if (error) return toast({ title: "فشل التحديث", description: error.message, variant: "destructive" });
    toast({ title: "تم تحديث الصلاحية" });
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("هل تريد إزالة تعيين الصلاحية هذا؟")) return;
    await supabase.from("user_roles").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <Card title="تعيين صلاحية" icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input placeholder="معرّف المستخدم" value={form.user_id} onChange={(e)=>setForm({...form, user_id:e.target.value})} className="bg-white/5 border-white/10 text-white font-mono text-xs"/>
          <select value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})} className="bg-slate-800 border border-white/10 rounded-md px-3 text-sm">
            {APP_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button onClick={add} className="bg-emerald-600 hover:bg-emerald-500"><Plus className="w-4 h-4 mr-1"/>تعيين</Button>
        </div>
      </Card>
      <Card title={`صلاحيات المستخدمين (${roles.length})`} icon={Users}
        action={<Button size="sm" variant="ghost" onClick={load}><RefreshCw className="w-4 h-4"/></Button>}>
        <div className="space-y-1 max-h-[600px] overflow-y-auto">
          {roles.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
              <div>
                <div className="font-mono text-xs text-white/70">{r.user_id}</div>
                <div className="text-xs text-white/50">تم التعيين بتاريخ {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <select value={r.role} onChange={(e)=>updateRole(r.id, e.target.value)}
                  className="bg-slate-800 border border-white/10 rounded-md px-2 py-1 text-xs">
                  {APP_ROLES.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
                <Button size="sm" variant="ghost" onClick={()=>remove(r.id)} className="text-red-300"><Trash2 className="w-4 h-4"/></Button>
              </div>
            </div>
          ))}
          {roles.length === 0 && <div className="text-white/50 text-sm p-6 text-center">لم يتم تعيين أي صلاحيات بعد.</div>}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Roles Info ---------------- */
function RolesSection() {
  const roles = [
    { key: "super_admin",  label: "مدير عام", desc: "تحكم كامل بالمنصة" },
    { key: "dept_manager", label: "مدير قسم",  desc: "إدارة قسم واحد" },
    { key: "engineer",     label: "مهندس",            desc: "العمليات الفنية والتقارير" },
    { key: "supervisor",   label: "مشرف",          desc: "اعتماد الورديات وتصاريح العمل" },
    { key: "technician",   label: "فني",          desc: "تنفيذ مهام الصيانة" },
    { key: "lab_user",     label: "مستخدم مختبر",     desc: "إدخال العينات والنتائج" },
    { key: "warehouse",    label: "مستخدم مستودع",      desc: "المواد وقطع الغيار" },
    { key: "read_only",    label: "قراءة فقط",           desc: "صلاحية عرض فقط" },
  ];
  return (
    <Card title="تعريفات الصلاحيات" icon={ShieldCheck}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map((r) => (
          <div key={r.key} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{r.label}</div>
              <Badge className="bg-white/10 text-white/70">{r.key}</Badge>
            </div>
            <div className="text-xs text-white/60 mt-1">{r.desc}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- Branding (editable) ---------------- */
function BrandingSection() {
  const { toast } = useToast();
  const [b, setB] = useState({ company_name: "LIFECO", primary_color: "#3B82F6", accent_color: "#06B6D4", footer_text: "إعداد م. محمد جاد الله" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSetting("branding", b).then((v) => { setB({ ...b, ...v }); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    const { error } = await saveSetting("branding", b);
    if (error) return toast({ title: "فشل الحفظ", description: error.message, variant: "destructive" });
    localStorage.setItem("lifeco.branding", JSON.stringify(b));
    document.documentElement.style.setProperty("--brand-primary", b.primary_color);
    document.documentElement.style.setProperty("--brand-accent", b.accent_color);
    toast({ title: "تم حفظ الهوية البصرية", description: "تم تطبيقها على مستوى المنصة." });
  };

  if (loading) return <div className="text-white/60">جارٍ التحميل...</div>;
  return (
    <Card title="الهوية البصرية" icon={Palette}
      action={<Button onClick={save} size="sm" className="bg-blue-600 hover:bg-blue-500"><Save className="w-4 h-4 mr-1"/>حفظ</Button>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm space-y-1">
          <div className="text-white/70">اسم الشركة</div>
          <Input value={b.company_name} onChange={(e)=>setB({...b, company_name:e.target.value})} className="bg-white/5 border-white/10 text-white"/>
        </label>
        <label className="text-sm space-y-1">
          <div className="text-white/70">نص التذييل</div>
          <Input value={b.footer_text} onChange={(e)=>setB({...b, footer_text:e.target.value})} className="bg-white/5 border-white/10 text-white"/>
        </label>
        <label className="text-sm space-y-1">
          <div className="text-white/70">اللون الأساسي</div>
          <div className="flex gap-2">
            <input type="color" value={b.primary_color} onChange={(e)=>setB({...b, primary_color:e.target.value})} className="w-12 h-10 rounded bg-transparent border border-white/10"/>
            <Input value={b.primary_color} onChange={(e)=>setB({...b, primary_color:e.target.value})} className="bg-white/5 border-white/10 text-white"/>
          </div>
        </label>
        <label className="text-sm space-y-1">
          <div className="text-white/70">لون التمييز</div>
          <div className="flex gap-2">
            <input type="color" value={b.accent_color} onChange={(e)=>setB({...b, accent_color:e.target.value})} className="w-12 h-10 rounded bg-transparent border border-white/10"/>
            <Input value={b.accent_color} onChange={(e)=>setB({...b, accent_color:e.target.value})} className="bg-white/5 border-white/10 text-white"/>
          </div>
        </label>
      </div>
      <div className="mt-6 p-4 rounded-lg border border-white/10" style={{ background: `linear-gradient(135deg, ${b.primary_color}33, ${b.accent_color}22)` }}>
        <div className="text-lg font-bold">{b.company_name}</div>
        <div className="text-xs text-white/70">{b.footer_text}</div>
        <div className="text-[10px] text-white/50 mt-2">معاينة حية</div>
      </div>
    </Card>
  );
}

/* ---------------- System Settings (editable) ---------------- */
function SystemSettingsSection() {
  const { toast } = useToast();
  const [s, setS] = useState({ company_name: "LIFECO", timezone: "Africa/Tripoli", date_format: "YYYY-MM-DD", file_upload_limit_mb: 50, language: "en", email: "", phone: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSetting("company", s).then((v)=>{ setS({...s, ...v}); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    const { error } = await saveSetting("company", s);
    if (error) return toast({ title: "فشل الحفظ", description: error.message, variant: "destructive" });
    localStorage.setItem("lifeco.company", JSON.stringify(s));
    toast({ title: "تم حفظ الإعدادات" });
  };

  if (loading) return <div className="text-white/60">جارٍ التحميل...</div>;
  return (
    <Card title="إعدادات النظام" icon={Settings}
      action={<Button size="sm" onClick={save} className="bg-blue-600 hover:bg-blue-500"><Save className="w-4 h-4 mr-1"/>حفظ</Button>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["اسم الشركة","company_name","text"],["البريد الإلكتروني للتواصل","email","email"],["رقم التواصل","phone","text"],
          ["المنطقة الزمنية","timezone","text"],["تنسيق التاريخ","date_format","text"],
          ["اللغة","language","text"],["حد رفع الملفات (ميجابايت)","file_upload_limit_mb","number"],
        ].map(([label, key, type]) => (
          <label key={key} className="text-sm space-y-1">
            <div className="text-white/70">{label}</div>
            <Input type={type as any} value={(s as any)[key as string] ?? ""}
              onChange={(e)=>setS({...s, [key as string]: type === "number" ? Number(e.target.value) : e.target.value})}
              className="bg-white/5 border-white/10 text-white"/>
          </label>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- Database ---------------- */
function DatabaseSection() {
  const { toast } = useToast();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const tables = ["plants","equipment_assets","library_files","user_roles","activity_logs","maintenance_records","field_ops_logs","work_permits","safety_incidents","operations_logs"];

  const refresh = useCallback(async () => {
    const results = await Promise.all(tables.map(t =>
      supabase.from(t as any).select("*", { count: "exact", head: true }).then(r => [t, r.count || 0] as const)
    ));
    setCounts(Object.fromEntries(results));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const exportJSON = async () => {
    const dump: Record<string, any> = {};
    for (const t of tables) {
      const { data } = await supabase.from(t as any).select("*").limit(1000);
      dump[t] = data || [];
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lifeco-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "تم تصدير النسخة الاحتياطية" });
  };

  return (
    <div className="space-y-6">
      <Card title="حالة قاعدة البيانات" icon={Database}
        action={<Button size="sm" variant="ghost" onClick={refresh}><RefreshCw className="w-4 h-4"/></Button>}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(counts).map(([k, v]) => (<StatTile key={k} label={k} value={v} tone="blue" />))}
        </div>
      </Card>
      <Card title="النسخ الاحتياطي / التصدير" icon={Database}>
        <Button onClick={exportJSON} className="bg-emerald-600 hover:bg-emerald-500">تصدير نسخة JSON</Button>
        <div className="text-xs text-white/50 mt-2">تنزيل نسخة JSON لأول 1000 سجل من كل جدول.</div>
      </Card>
    </div>
  );
}

/* ---------------- Monitoring ---------------- */
function MonitoringSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatTile label="المعالج"     value="—"  sub="Edge worker" tone="blue" />
      <StatTile label="الذاكرة"  value="—"  sub="مُدارة"     tone="blue" />
      <StatTile label="التخزين" value="سليم" sub="Supabase"    tone="green" />
      <StatTile label="الشبكة" value="متصلة" sub="شبكة CDN عالمية"  tone="green" />
      <Card title="الخدمات الفعالة" icon={Server}>
        <ul className="text-sm space-y-1">
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/>المصادقة</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/>قاعدة البيانات</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/>التخزين</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/>وظائف Edge</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/>بوابة الذكاء الاصطناعي</li>
        </ul>
      </Card>
    </div>
  );
}

/* ---------------- About ---------------- */
function AboutSection() {
  return (
    <Card title="معلومات المنصة" icon={Info}>
      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        <dt className="text-white/60">المنصة</dt><dd>التحول الرقمي لـ LIFECO</dd>
        <dt className="text-white/60">الإصدار</dt><dd>2.6.0</dd>
        <dt className="text-white/60">تاريخ الإصدار</dt><dd>{new Date().toISOString().slice(0,10)}</dd>
        <dt className="text-white/60">بيئة التشغيل</dt><dd>TanStack Start · Cloudflare Workers</dd>
        <dt className="text-white/60">قاعدة البيانات</dt><dd>Lovable Cloud (Postgres)</dd>
        <dt className="text-white/60">إعداد</dt><dd>م. محمد جاد الله</dd>
        <dt className="text-white/60">الترخيص</dt><dd>داخلي — LIFECO</dd>
      </dl>
    </Card>
  );
}

/* ---------------- Placeholder (editable notes) ---------------- */
function PlaceholderSection({ sectionKey }: { sectionKey: SectionKey }) {
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const key = `notes.${sectionKey}`;

  useEffect(() => {
    loadSetting<{ text?: string }>(key, {}).then((v) => { setNote(v.text || ""); setLoading(false); });
  }, [key]);

  const save = async () => {
    const { error } = await saveSetting(key, { text: note });
    if (error) return toast({ title: "فشل الحفظ", description: error.message, variant: "destructive" });
    toast({ title: "تم الحفظ" });
  };

  const items: Record<string, string[]> = {
    reports:       ["إنشاء التقارير", "تعديل التقارير", "جدولة التقارير", "قوالب التصدير"],
    notifications: ["البريد الإلكتروني", "Outlook", "واتساب", "تنبيهات النظام"],
    builder:       ["إنشاء لوحة تحكم", "تعديل لوحة تحكم", "أدوات مؤشرات الأداء", "الرسوم البيانية", "بطاقات مباشرة"],
    language:      ["الإنجليزية", "العربية", "إدارة الترجمة"],
    security:      ["سجل تسجيل الدخول", "سجلات التدقيق", "سجلات الوصول", "إدارة الجلسات", "المصادقة الثنائية"],
    ai:            ["المساعد الذكي", "قاعدة المعرفة", "بحث المستندات بالذكاء الاصطناعي"],
    audit:         ["سجلات المستخدمين", "سجلات الملفات", "تغييرات المعدات", "تغييرات النظام", "سجلات الأخطاء"],
    devtools:      ["مفاتيح API", "تشخيص النظام", "إدارة التخزين المؤقت", "وضع الصيانة", "سجلات التطبيق"],
  };
  const list = items[sectionKey] || [];

  return (
    <div className="space-y-4">
      <Card title="ملاحظات الوحدة" icon={Pencil}
        action={<Button size="sm" onClick={save} className="bg-blue-600 hover:bg-blue-500"><Save className="w-4 h-4 mr-1"/>حفظ</Button>}>
        {loading ? <div className="text-white/60">جارٍ التحميل...</div> : (
          <Textarea value={note} onChange={(e)=>setNote(e.target.value)} rows={5}
            placeholder="اكتب ملاحظات التهيئة أو الخطط لهذه الوحدة..."
            className="bg-white/5 border-white/10 text-white"/>
        )}
      </Card>
      {list.length > 0 && (
        <Card title="الوحدات الفرعية">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {list.map((i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">{i}</div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
