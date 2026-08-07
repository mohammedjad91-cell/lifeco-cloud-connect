import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, RefreshCw, AlertCircle } from "lucide-react";

export function ThresholdsManager() {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ equipment_tag: "", metric_key: "discharge_pressure", min_value: "", max_value: "", severity: "warning" });

  const load = useCallback(async () => {
    setLoading(true);
    const [tRes, aRes] = await Promise.all([
      supabase.from("equipment_thresholds").select("*").order("equipment_tag"),
      supabase.from("equipment_assets").select("tag_number, name").order("tag_number")
    ]);
    setRows(tRes.data || []);
    setAssets(aRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.equipment_tag) return toast({ title: "يرجى اختيار المعدة", variant: "destructive" });
    const { error } = await supabase.from("equipment_thresholds").upsert({
      equipment_tag: form.equipment_tag,
      metric_key: form.metric_key,
      min_value: form.min_value ? parseFloat(form.min_value) : null,
      max_value: form.max_value ? parseFloat(form.max_value) : null,
      severity: form.severity,
      updated_at: new Date().toISOString()
    }, { onConflict: "equipment_tag,metric_key" });

    if (error) return toast({ title: "فشل الحفظ", description: error.message, variant: "destructive" });
    toast({ title: "تم حفظ الإعدادات" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("هل تريد حذف هذا الحد؟")) return;
    const { error } = await supabase.from("equipment_thresholds").delete().eq("id", id);
    if (error) return toast({ title: "فشل الحذف", description: error.message, variant: "destructive" });
    toast({ title: "تم الحذف" });
    load();
  };

  const metrics = [
    { key: "discharge_pressure", label: "ضغط التصريف (Discharge Pressure)" },
    { key: "temperature", label: "درجة الحرارة (Temperature)" },
    { key: "vibration", label: "الاهتزاز (Vibration)" },
    { key: "flow", label: "التدفق (Flow)" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 p-4 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
        <div className="flex items-center gap-2 text-blue-200/90 text-sm font-semibold mb-4">
          <Plus className="w-4 h-4" />
          إضافة/تعديل حد تنبيه
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          <select value={form.equipment_tag} onChange={(e)=>setForm({...form, equipment_tag:e.target.value})}
            className="bg-slate-800 border border-white/10 rounded-md px-3 text-sm h-10 text-white">
            <option value="">اختر المعدة...</option>
            {assets.map(a => <option key={a.tag_number} value={a.tag_number}>{a.tag_number} - {a.name}</option>)}
          </select>
          <select value={form.metric_key} onChange={(e)=>setForm({...form, metric_key:e.target.value})}
            className="bg-slate-800 border border-white/10 rounded-md px-3 text-sm h-10 text-white">
            {metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
          <Input placeholder="الحد الأدنى" type="number" value={form.min_value} onChange={(e)=>setForm({...form, min_value:e.target.value})} className="bg-white/5 border-white/10 text-white h-10" />
          <Input placeholder="الحد الأقصى" type="number" value={form.max_value} onChange={(e)=>setForm({...form, max_value:e.target.value})} className="bg-white/5 border-white/10 text-white h-10" />
          <Button onClick={save} className="bg-blue-600 hover:bg-blue-500 h-10"><Save className="w-4 h-4 mr-1"/>حفظ</Button>
        </div>
      </div>

      <div className="rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 p-4 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-200/90 text-sm font-semibold">
            <AlertCircle className="w-4 h-4" />
            قائمة حدود التنبيهات ({rows.length})
          </div>
          <Button size="sm" variant="ghost" onClick={load} className="text-white/50 hover:text-white">
            <RefreshCw className="w-4 h-4"/>
          </Button>
        </div>
        {loading ? <div className="p-4 text-center text-white/40">جارٍ التحميل...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-white">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="p-2 text-right">المعدة</th>
                  <th className="p-2 text-right">البارامتر</th>
                  <th className="p-2 text-right">الأدنى</th>
                  <th className="p-2 text-right">الأقصى</th>
                  <th className="p-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-2 font-mono">{r.equipment_tag}</td>
                    <td className="p-2">{metrics.find(m => m.key === r.metric_key)?.label || r.metric_key}</td>
                    <td className="p-2 font-mono">{r.min_value ?? "—"}</td>
                    <td className="p-2 font-mono">{r.max_value ?? "—"}</td>
                    <td className="p-2">
                      <Button size="sm" variant="ghost" onClick={()=>remove(r.id)} className="text-red-300 hover:text-red-200">
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/30 italic">لا توجد حدود تنبيهات مخصصة بعد.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
