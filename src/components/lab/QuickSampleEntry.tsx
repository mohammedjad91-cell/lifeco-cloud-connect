import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Zap, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface Props {
  plants: string[];
  defaultPlant?: string;
  technicianName?: string;
  employeeId?: string;
  onSaved: () => void;
}

const QuickSampleEntry = ({ plants, defaultPlant, technicianName, employeeId, onSaved }: Props) => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const ar = lang === "ar";
  const [name, setName] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [plant, setPlant] = useState(defaultPlant || plants[0] || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !date || !plant) {
      toast({ title: ar ? "أدخل اسم العينة والتاريخ والمصنع" : "Enter sample name, date and plant", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("samples").insert({
      sample_name: name.trim(),
      department: plant,
      analysis_type: "routine",
      employee_id: employeeId || "-",
      technician_name: technicianName || (ar ? "المعمل" : "Lab"),
      sample_date: date,
      dynamic_data: {},
      status: "pending",
    });
    setSaving(false);
    if (error) {
      toast({ title: ar ? "تعذّر حفظ العينة" : "Failed to save sample", variant: "destructive" });
      return;
    }
    toast({ title: ar ? "تم تسجيل العينة — اكتب النتائج لاحقًا" : "Sample logged — add results later" });
    setName("");
    onSaved();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 neon-border">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-primary" />
        <h2 className="text-foreground font-semibold text-sm">
          {ar ? "إدخال عينة سريع" : "Quick Sample Entry"}
        </h2>
        <span className="text-xs text-muted-foreground">
          {ar ? "(الاسم + التاريخ فقط — النتائج تُكتب لاحقًا)" : "(name + date only — results later)"}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">{ar ? "اسم العينة" : "Sample name"}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder={ar ? "مثال: ماء تغذية الغلاية" : "e.g. Boiler feed water"}
            className="bg-secondary/50 border-border" autoFocus />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{ar ? "تاريخ العينة" : "Sample date"}</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="bg-secondary/50 border-border" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{ar ? "المصنع" : "Plant"}</label>
          <Select value={plant} onValueChange={setPlant}>
            <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
            <SelectContent>{plants.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={save} disabled={saving} size="sm" className="gap-1.5 mt-3">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {ar ? "تسجيل سريع" : "Quick Log"}
      </Button>
    </motion.div>
  );
};

export default QuickSampleEntry;
