import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileDown, FlaskRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CATEGORY: Record<string, string> = {
  reagent: "كاشف تحليلي",
  standard: "محلول معياري",
  acid: "حمض",
  base: "قاعدة",
  solvent: "مذيب",
  indicator: "دليل لوني",
  gas: "غاز معمل",
  consumable: "مستهلكات",
};

const HAZARD: Record<string, string> = {
  none: "غير خطر",
  corrosive: "أكّال",
  toxic: "سام",
  flammable: "قابل للاشتعال",
  oxidizer: "مؤكسد",
  irritant: "مهيّج",
};

interface Chemical {
  id: string;
  name: string;
  code: string | null;
  category: string;
  concentration: string | null;
  manufacturer: string | null;
  qty: number;
  uom: string;
  location: string | null;
  batch_no: string | null;
  expiry_date: string | null;
  min_qty: number;
  hazard: string | null;
  notes: string | null;
  recorded_by: string | null;
}

const emptyForm = {
  name: "", code: "", category: "reagent", concentration: "", manufacturer: "",
  qty: "", uom: "L", location: "", batch_no: "", expiry_date: "", min_qty: "",
  hazard: "none", notes: "",
};

export default function ChemicalStore() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...emptyForm });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["lab-chemicals"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_chemicals").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as Chemical[];
    },
  });

  const addItem = useMutation({
    mutationFn: async (p: typeof form) => {
      const { error } = await (supabase as any).from("lab_chemicals").insert({
        name: p.name.trim(),
        code: p.code.trim() || null,
        category: p.category,
        concentration: p.concentration.trim() || null,
        manufacturer: p.manufacturer.trim() || null,
        qty: Number(p.qty || 0),
        uom: p.uom,
        location: p.location.trim() || null,
        batch_no: p.batch_no.trim() || null,
        expiry_date: p.expiry_date || null,
        min_qty: Number(p.min_qty || 0),
        hazard: p.hazard,
        notes: p.notes.trim() || null,
        recorded_by: sessionStorage.getItem("lifeco_user_name") || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تمت إضافة المادة للمخزن");
      setForm({ ...emptyForm });
      qc.invalidateQueries({ queryKey: ["lab-chemicals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("lab_chemicals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["lab-chemicals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    if (!form.name.trim()) { toast.error("أدخل اسم المادة"); return; }
    addItem.mutate(form);
  };

  const today = new Date().toISOString().slice(0, 10);
  const low = rows.filter((r) => r.min_qty > 0 && r.qty <= r.min_qty).length;
  const expired = rows.filter((r) => r.expiry_date && r.expiry_date < today).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 p-2.5 text-emerald-200">
            <FlaskRound className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold neon-text">المخزن الكيميائي</h1>
            <p className="text-xs text-muted-foreground">قائمة تخزين المواد — يدخلها موظف المعمل ويتابع الكميات والصلاحية</p>
          </div>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/dept/LAB"><ArrowRight className="h-4 w-4" /> رجوع لإدارة المعمل</Link>
        </Button>
      </header>

      <section className="mb-6 grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl border p-4">
          <p className="text-[11px] text-muted-foreground">عدد المواد</p>
          <p className="text-2xl font-bold text-foreground">{rows.length}</p>
        </div>
        <div className="glass-card rounded-xl border border-orange-400/40 p-4">
          <p className="text-[11px] text-muted-foreground">تحت الحد الأدنى</p>
          <p className="text-2xl font-bold text-orange-300">{low}</p>
        </div>
        <div className="glass-card rounded-xl border border-red-400/40 p-4">
          <p className="text-[11px] text-muted-foreground">منتهية الصلاحية</p>
          <p className="text-2xl font-bold text-red-300">{expired}</p>
        </div>
      </section>

      <section className="glass-card mb-6 rounded-2xl border p-5">
        <h2 className="mb-4 text-sm font-bold text-foreground">إدخال مادة كيميائية</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label className="text-xs">اسم المادة</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sulfuric Acid — حمض الكبريتيك" />
          </div>
          <div>
            <Label className="text-xs">الكود / رقم الصنف</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CHM-001" />
          </div>
          <div>
            <Label className="text-xs">التصنيف</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">التركيز</Label>
            <Input value={form.concentration} onChange={(e) => setForm({ ...form, concentration: e.target.value })} placeholder="98% / 0.1 N" />
          </div>
          <div>
            <Label className="text-xs">الشركة المصنعة</Label>
            <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} placeholder="Merck" />
          </div>
          <div>
            <Label className="text-xs">الكمية</Label>
            <Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs">وحدة القياس</Label>
            <Select value={form.uom} onValueChange={(v) => setForm({ ...form, uom: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["L", "mL", "kg", "g", "عبوة", "زجاجة", "أسطوانة"].map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">الحد الأدنى</Label>
            <Input type="number" value={form.min_qty} onChange={(e) => setForm({ ...form, min_qty: e.target.value })} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs">مكان التخزين</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="رف A2 / خزانة الأحماض" />
          </div>
          <div>
            <Label className="text-xs">رقم التشغيلة</Label>
            <Input value={form.batch_no} onChange={(e) => setForm({ ...form, batch_no: e.target.value })} placeholder="Batch / Lot" />
          </div>
          <div>
            <Label className="text-xs">تاريخ الانتهاء</Label>
            <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">درجة الخطورة</Label>
            <Select value={form.hazard} onValueChange={(v) => setForm({ ...form, hazard: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(HAZARD).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Label className="text-xs">ملاحظات</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <div className="md:col-span-4">
            <Button onClick={submit} disabled={addItem.isPending} className="gap-2">
              <Plus className="h-4 w-4" /> إضافة للمخزن
            </Button>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-2xl border p-5">
        <h2 className="mb-3 text-sm font-bold text-foreground">قائمة تخزين المواد ({rows.length})</h2>
        {isLoading ? (
          <p className="text-xs text-muted-foreground">جارٍ التحميل…</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">المخزن فارغ — أضف أول مادة.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-white/10">
                  <th className="p-2">المادة</th>
                  <th className="p-2">التصنيف</th>
                  <th className="p-2">التركيز</th>
                  <th className="p-2">الكمية</th>
                  <th className="p-2">التخزين</th>
                  <th className="p-2">الانتهاء</th>
                  <th className="p-2">الخطورة</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isLow = r.min_qty > 0 && r.qty <= r.min_qty;
                  const isExp = !!r.expiry_date && r.expiry_date < today;
                  return (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="p-2 font-semibold text-foreground">
                        {r.name}
                        {r.code && <span className="ms-2 font-mono text-[10px] text-muted-foreground">{r.code}</span>}
                      </td>
                      <td className="p-2">{CATEGORY[r.category] ?? r.category}</td>
                      <td className="p-2">{r.concentration || "—"}</td>
                      <td className={`p-2 ${isLow ? "font-bold text-orange-300" : ""}`}>{r.qty} {r.uom}</td>
                      <td className="p-2">{r.location || "—"}</td>
                      <td className={`p-2 ${isExp ? "font-bold text-red-300" : ""}`}>{r.expiry_date || "—"}</td>
                      <td className="p-2">{HAZARD[r.hazard ?? "none"] ?? r.hazard}</td>
                      <td className="p-2">
                        <Button size="icon" variant="ghost" onClick={() => removeItem.mutate(r.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
