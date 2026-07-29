import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/form/FormField";

import { Plus, Wrench, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOperator, getStamp } from "@/lib/session";
import { getAmmoniaSpec } from "@/lib/ammonia-equipment";
import { TechSpecPanel, SparesRequisition } from "@/components/maintenance/EquipmentTechCard";

interface Asset {
  id: string;
  department: string;
  asset_code: string;
  asset_name: string;
  is_custom: boolean;
}

interface Maintenance {
  id: string;
  asset_id: string;
  notes: string;
  recorded_by: string | null;
  recorded_at: string;
}

interface Props {
  department: string;
}

export default function AssetRegister({ department }: Props) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [records, setRecords] = useState<Record<string, Maintenance[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const fetchAssets = async () => {
    const { data } = await supabase
      .from("equipment_assets")
      .select("*")
      .eq("department", department)
      .order("is_custom", { ascending: true })
      .order("asset_code");
    if (data) setAssets(data as Asset[]);
    setLoading(false);
  };

  const fetchRecords = async (assetId: string) => {
    const { data } = await supabase
      .from("maintenance_records")
      .select("*")
      .eq("asset_id", assetId)
      .order("recorded_at", { ascending: false });
    if (data) setRecords((prev) => ({ ...prev, [assetId]: data as Maintenance[] }));
  };

  useEffect(() => {
    fetchAssets();
  }, [department]);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    if (!records[id]) fetchRecords(id);
  };

  const addAsset = async () => {
    if (!newCode.trim() || !newName.trim()) return;
    const { error } = await supabase.from("equipment_assets").insert({
      department,
      asset_code: newCode.trim(),
      asset_name: newName.trim(),
      is_custom: true,
    });
    if (error) {
      toast({ title: "فشل الإضافة", variant: "destructive" });
    } else {
      toast({ title: "تمت إضافة المعدة" });
      setNewCode("");
      setNewName("");
      setAdding(false);
      fetchAssets();
    }
  };

  const addNote = async (assetId: string) => {
    const note = noteDraft[assetId]?.trim();
    if (!note) return;
    const op = getOperator();
    const stamp = getStamp(op);
    const { error } = await supabase.from("maintenance_records").insert({
      asset_id: assetId,
      notes: note,
      recorded_by: stamp.formatted,
    });
    if (!error) {
      toast({ title: "تم حفظ سجل الصيانة" });
      setNoteDraft((p) => ({ ...p, [assetId]: "" }));
      fetchRecords(assetId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> جارٍ تحميل سجل المعدات…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold neon-text flex items-center gap-2">
          <Wrench className="w-5 h-5" /> سجل المعدات — {department}
        </h3>
        <Button size="sm" onClick={() => setAdding((s) => !s)} className="gap-1.5">
          <Plus className="w-4 h-4" /> إضافة معدة
        </Button>
      </div>

      {adding && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="رمز/علامة المعدة"
              required
              hint="العلامة كما تظهر بالضبط على لوحة بيانات المعدة."
            >
              {(id) => (
                <Input id={id} value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="مثال: P-201" />
              )}
            </FormField>
            <FormField
              label="اسم المعدة"
              required
              hint="وصف مبسط يُستخدم في القوائم والتقارير."
            >
              {(id) => (
                <Input id={id} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="مثال: مضخة معززة" />
              )}
            </FormField>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>إلغاء</Button>
            <Button size="sm" onClick={addAsset}>حفظ</Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {assets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">لا توجد معدات مسجلة بعد.</p>
        )}
        {assets.map((a) => (
          <div key={a.id} className="glass-card p-3">
            <button
              onClick={() => toggle(a.id)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary text-sm">{a.asset_code}</span>
                  <span className="text-foreground font-medium">{a.asset_name}</span>
                  {a.is_custom && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                      مخصص
                    </span>
                  )}
                </div>
              </div>
              {expanded === a.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded === a.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 space-y-3 overflow-hidden"
              >
                {(() => {
                  const spec = getAmmoniaSpec(a.asset_code, a.asset_code);
                  if (!spec) return null;
                  return (
                    <div className="space-y-3">
                      <TechSpecPanel spec={spec} ar={false} />
                      <SparesRequisition spec={spec} ar={false} />
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  <FormField
                    label="إضافة سجل صيانة"
                    hint="يُختم تلقائيًا باسمك ورقمك الوظيفي والتاريخ الحالي."
                  >
                    {(id) => (
                      <Textarea
                        id={id}
                        value={noteDraft[a.id] || ""}
                        onChange={(e) => setNoteDraft((p) => ({ ...p, [a.id]: e.target.value }))}
                        placeholder="صف الفحص أو الإصلاح أو التزييت أو القطع المستبدلة…"
                        rows={2}
                      />
                    )}
                  </FormField>

                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => addNote(a.id)}>حفظ السجل</Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">السجل</Label>
                  {(records[a.id] || []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">لا توجد سجلات بعد.</p>
                  )}
                  {(records[a.id] || []).map((r) => (
                    <div key={r.id} className="text-xs p-2 rounded bg-secondary/40 border border-border">
                      <div className="text-foreground">{r.notes}</div>
                      <div className="text-muted-foreground mt-1">{r.recorded_by || "-"}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
