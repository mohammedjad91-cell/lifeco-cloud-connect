import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Save, Trash2, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { exportSampleResultsPDF } from "@/lib/lab-pdf";

export interface SampleRecord {
  id: string;
  sample_name: string;
  department: string;
  analysis_type: string;
  status: string;
  employee_id: string;
  technician_name: string;
  sample_date: string;
  dynamic_data: Record<string, any> | null;
  notes: string | null;
}

interface Props {
  sample: SampleRecord | null;
  onClose: () => void;
  onSaved: () => void;
  labelOf?: (key: string) => string;
}

const SampleResultsDialog = ({ sample, onClose, onSaved, labelOf }: Props) => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const ar = lang === "ar";
  const [rows, setRows] = useState<{ name: string; value: string }[]>([]);
  const [status, setStatus] = useState("completed");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sample) return;
    const existing = Object.entries(sample.dynamic_data || {}).map(([k, v]) => ({
      name: k, value: String(v),
    }));
    setRows(existing.length ? existing : [{ name: "", value: "" }]);
    setStatus(sample.status === "pending" ? "completed" : sample.status);
    setNotes(sample.notes || "");
  }, [sample]);

  const save = async () => {
    if (!sample) return;
    setSaving(true);
    const data: Record<string, any> = {};
    rows.forEach(r => {
      const key = r.name.trim();
      if (!key || r.value === "") return;
      const num = parseFloat(r.value);
      data[key] = Number.isNaN(num) ? r.value : num;
    });
    const { error } = await supabase.from("samples").update({
      dynamic_data: data,
      status,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }).eq("id", sample.id);
    setSaving(false);
    if (error) {
      toast({ title: ar ? "تعذّر حفظ النتائج" : "Failed to save results", variant: "destructive" });
      return;
    }
    toast({ title: ar ? "تم حفظ نتائج العينة" : "Sample results saved" });
    onSaved();
    onClose();
  };

  return (
    <Dialog open={!!sample} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="neon-text">
            {ar ? "كتابة نتائج العينة" : "Write Sample Results"} — {sample?.sample_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            {sample?.department} • {sample?.analysis_type} • {sample?.sample_date} •{" "}
            {sample?.technician_name} ({sample?.employee_id})
          </div>

          <div className="space-y-2">
            {rows.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={r.name}
                  onChange={(e) => setRows(prev => prev.map((c, i) => i === idx ? { ...c, name: e.target.value } : c))}
                  placeholder={ar ? "اسم المعامل (مثال: pH)" : "Parameter name"}
                  className="bg-secondary/50 border-border"
                />
                <Input
                  value={r.value}
                  onChange={(e) => setRows(prev => prev.map((c, i) => i === idx ? { ...c, value: e.target.value } : c))}
                  placeholder={ar ? "النتيجة" : "Result"}
                  className="bg-secondary/50 border-border w-36 font-bold text-primary"
                />
                <Button variant="ghost" size="icon"
                  onClick={() => setRows(prev => prev.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5"
              onClick={() => setRows(prev => [...prev, { name: "", value: "" }])}>
              <Plus className="w-3.5 h-3.5" /> {ar ? "إضافة نتيجة" : "Add Result"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{ar ? "الحالة" : "Status"}</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{ar ? "معلّق" : "Pending"}</SelectItem>
                  <SelectItem value="completed">{ar ? "مكتمل" : "Completed"}</SelectItem>
                  <SelectItem value="alert">{ar ? "تنبيه" : "Alert"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{ar ? "ملاحظات" : "Notes"}</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)}
                className="bg-secondary/50 border-border" />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="gap-1.5"
            onClick={() => sample && exportSampleResultsPDF(
              { ...sample, dynamic_data: rows.reduce((acc, r) => {
                if (r.name.trim() && r.value !== "") acc[r.name.trim()] = r.value;
                return acc;
              }, {} as Record<string, any>), status, notes },
              labelOf,
            )}>
            <FileDown className="w-4 h-4" /> {ar ? "سحب PDF" : "Export PDF"}
          </Button>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {ar ? "حفظ النتائج" : "Save Results"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SampleResultsDialog;
