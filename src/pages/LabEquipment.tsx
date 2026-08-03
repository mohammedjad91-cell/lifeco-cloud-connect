import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Microscope, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const STATUS: Record<string, string> = {
  operational: "يعمل",
  maintenance: "تحت الصيانة",
  calibration: "تحت المعايرة",
  out_of_service: "خارج الخدمة",
};

/** المعدات القياسية المستخدمة داخل المعمل فقط. */
const LAB_EQUIPMENT_PRESETS = [
  "Spectrophotometer — جهاز قياس الطيف الضوئي",
  "Gas Chromatograph (GC) — كروماتوغراف الغاز",
  "Ion Chromatograph — كروماتوغراف الأيونات",
  "Atomic Absorption (AAS) — جهاز الامتصاص الذري",
  "pH Meter — جهاز قياس الأس الهيدروجيني",
  "Conductivity Meter — جهاز قياس التوصيلية",
  "Turbidity Meter — جهاز قياس العكارة",
  "Analytical Balance — ميزان تحليلي حساس",
  "Drying Oven — فرن التجفيف",
  "Muffle Furnace — فرن الحرق",
  "Water Bath — حمام مائي",
  "Magnetic Stirrer / Hot Plate — محرّك مغناطيسي وسخّان",
  "Centrifuge — جهاز الطرد المركزي",
  "Distillation Unit (Kjeldahl) — وحدة التقطير",
  "Autoclave — جهاز التعقيم",
  "Fume Hood — خزانة الأبخرة",
  "Titrator — جهاز المعايرة الآلي",
  "COD Reactor — مفاعل الأكسجين الكيميائي",
  "Dew Point Analyzer — جهاز قياس نقطة الندى",
  "Oxygen Analyzer — محلل الأوكسجين",
  "Deionized Water Unit — وحدة الماء المقطر",
  "Sample Refrigerator — ثلاجة حفظ العينات",
];

interface Asset {
  id: string;
  asset_code: string;
  asset_name: string;
  location: string | null;
  manufacturer: string | null;
  status: string;
  next_maintenance_at: string | null;
}

const emptyForm = { asset_code: "", asset_name: "", location: "", manufacturer: "", status: "operational" };

export default function LabEquipment() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...emptyForm });
  const [preset, setPreset] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["lab-equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_assets")
        .select("id, asset_code, asset_name, location, manufacturer, status, next_maintenance_at")
        .eq("department", "LAB")
        .order("asset_name");
      if (error) throw error;
      return (data ?? []) as Asset[];
    },
  });

  const addAsset = useMutation({
    mutationFn: async (payload: typeof form) => {
      const { error } = await supabase.from("equipment_assets").insert({
        department: "LAB",
        asset_code: payload.asset_code.trim(),
        asset_name: payload.asset_name.trim(),
        location: payload.location.trim() || null,
        manufacturer: payload.manufacturer.trim() || null,
        status: payload.status,
        is_custom: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تمت إضافة المعدة");
      setForm({ ...emptyForm });
      setPreset("");
      qc.invalidateQueries({ queryKey: ["lab-equipment"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equipment_assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["lab-equipment"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    if (!form.asset_name.trim() || !form.asset_code.trim()) {
      toast.error("أدخل كود المعدة واسمها");
      return;
    }
    addAsset.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-violet-400/40 bg-violet-500/15 p-2.5 text-violet-200">
            <Microscope className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold neon-text">معدات المختبر</h1>
            <p className="text-xs text-muted-foreground">الأجهزة المستخدمة داخل المعمل فقط — إضافة وتتبع الحالة</p>
          </div>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/dept/LAB"><ArrowRight className="h-4 w-4" /> رجوع لإدارة المعمل</Link>
        </Button>
      </header>

      <section className="glass-card mb-6 rounded-2xl border p-5">
        <h2 className="mb-4 text-sm font-bold text-foreground">إضافة معدة معمل</h2>

        <div className="mb-4">
          <Label className="text-xs">اختر من الأجهزة القياسية</Label>
          <Select
            value={preset}
            onValueChange={(v) => {
              setPreset(v);
              setForm((f) => ({ ...f, asset_name: v }));
            }}
          >
            <SelectTrigger><SelectValue placeholder="أجهزة المعمل القياسية" /></SelectTrigger>
            <SelectContent>
              {LAB_EQUIPMENT_PRESETS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <div>
            <Label className="text-xs">كود المعدة</Label>
            <Input value={form.asset_code} onChange={(e) => setForm({ ...form, asset_code: e.target.value })} placeholder="LAB-EQ-001" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">اسم المعدة</Label>
            <Input value={form.asset_name} onChange={(e) => setForm({ ...form, asset_name: e.target.value })} placeholder="pH Meter" />
          </div>
          <div>
            <Label className="text-xs">الموقع داخل المعمل</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="قسم التحاليل الرطبة" />
          </div>
          <div>
            <Label className="text-xs">الشركة المصنعة</Label>
            <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} placeholder="Hach / Metrohm" />
          </div>
          <div>
            <Label className="text-xs">الحالة</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end md:col-span-4">
            <Button onClick={submit} disabled={addAsset.isPending} className="gap-2">
              <Plus className="h-4 w-4" /> إضافة
            </Button>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-2xl border p-5">
        <h2 className="mb-3 text-sm font-bold text-foreground">قائمة معدات المعمل ({rows.length})</h2>
        {isLoading ? (
          <p className="text-xs text-muted-foreground">جارٍ التحميل…</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا توجد معدات مسجّلة بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-white/10">
                  <th className="p-2">الكود</th>
                  <th className="p-2">الاسم</th>
                  <th className="p-2">الموقع</th>
                  <th className="p-2">المصنّع</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="p-2 font-mono">{r.asset_code}</td>
                    <td className="p-2 font-semibold text-foreground">{r.asset_name}</td>
                    <td className="p-2">{r.location || "—"}</td>
                    <td className="p-2">{r.manufacturer || "—"}</td>
                    <td className="p-2">{STATUS[r.status] ?? r.status}</td>
                    <td className="p-2">
                      <Button size="icon" variant="ghost" onClick={() => removeAsset.mutate(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
