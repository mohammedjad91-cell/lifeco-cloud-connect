import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Wrench, Loader2, CheckCircle, User, Hash, Gauge, Thermometer, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { FIELD_OPS_EQUIPMENT } from "@/lib/departments";
import { FIELD_OPS_RANGES, isInRange, statusColorClasses } from "@/lib/ranges";

interface Props {
  department: string;
  onSaved?: () => void;
}

const FieldOpsForm = ({ department, onSaved }: Props) => {
  const { toast } = useToast();
  const { t, lang } = useI18n();

  const [equipmentTag, setEquipmentTag] = useState("");
  const [runningHours, setRunningHours] = useState("");
  const [dischargePressure, setDischargePressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const equipmentList = FIELD_OPS_EQUIPMENT[department] || FIELD_OPS_EQUIPMENT.OPERATIONS;

  const rh = parseFloat(runningHours);
  const dp = parseFloat(dischargePressure);
  const tp = parseFloat(temperature);

  const rhOk = !runningHours || isInRange(rh, FIELD_OPS_RANGES.running_hours);
  const dpOk = !dischargePressure || isInRange(dp, FIELD_OPS_RANGES.discharge_pressure);
  const tpOk = !temperature || isInRange(tp, FIELD_OPS_RANGES.temperature);

  const handleSave = async () => {
    if (!employeeId || !equipmentTag) {
      toast({ title: t.fieldOpsMissing, variant: "destructive" });
      return;
    }
    if (!runningHours && !dischargePressure && !temperature) {
      toast({ title: t.fieldOpsMissing, variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      department,
      equipment_tag: equipmentTag,
      employee_id: employeeId,
      technician_name: technicianName || null,
      notes: notes || null,
      timestamp: new Date().toISOString(),
    };
    if (runningHours) payload.running_hours = parseFloat(runningHours);
    if (dischargePressure) payload.discharge_pressure = parseFloat(dischargePressure);
    if (temperature) payload.temperature = parseFloat(temperature);

    // The table is created via supabase_setup_field_ops.sql.
    // We bypass type checking because the generated types file is regenerated separately.
    const { error } = await (supabase as unknown as {
      from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> };
    }).from("field_ops_logs").insert(payload);

    if (error) {
      const msg = (error as { message?: string }).message || "";
      if (/relation .*field_ops_logs.* does not exist/i.test(msg)) {
        toast({
          title: lang === "ar" ? "الجدول غير موجود" : "Table not created",
          description: lang === "ar"
            ? "يرجى تنفيذ ملف supabase_setup_field_ops.sql في Supabase SQL Editor."
            : "Please run supabase_setup_field_ops.sql in your Supabase SQL Editor.",
          variant: "destructive",
        });
      } else {
        toast({ title: t.errorSaving, description: msg, variant: "destructive" });
      }
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setRunningHours(""); setDischargePressure(""); setTemperature(""); setNotes("");
      toast({ title: t.saved, description: t.fieldOpsSaved });
      // Activity log mirroring existing modules
      supabase.from("activity_logs").insert({
        action: "FIELD_OPS_ENTRY",
        department,
        details: `${equipmentTag} | RH:${runningHours || "-"} DP:${dischargePressure || "-"} T:${temperature || "-"} (EID:${employeeId})`,
      });
      onSaved?.();
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 neon-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-5 h-5 text-primary" />
        <h2 className="text-foreground font-semibold">{t.fieldOpsEntry}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> {t.employeeId}
          </label>
          <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
            placeholder={t.employeeIdPlaceholder}
            className="bg-secondary/50 border-border" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> {t.technicianName}
          </label>
          <Input value={technicianName} onChange={(e) => setTechnicianName(e.target.value)}
            placeholder={t.technicianNamePlaceholder}
            className="bg-secondary/50 border-border" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" /> {t.equipmentTag}
          </label>
          <Select value={equipmentTag} onValueChange={setEquipmentTag}>
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder={t.selectEquipment} />
            </SelectTrigger>
            <SelectContent>
              {equipmentList.map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberField
          icon={<Clock className="w-3.5 h-3.5" />}
          label={t.runningHours}
          value={runningHours}
          setValue={setRunningHours}
          unit="hrs"
          ok={rhOk}
        />
        <NumberField
          icon={<Gauge className="w-3.5 h-3.5" />}
          label={t.dischargePressure}
          value={dischargePressure}
          setValue={setDischargePressure}
          unit={FIELD_OPS_RANGES.discharge_pressure.unit}
          ok={dpOk}
        />
        <NumberField
          icon={<Thermometer className="w-3.5 h-3.5" />}
          label={t.temperature}
          value={temperature}
          setValue={setTemperature}
          unit={FIELD_OPS_RANGES.temperature.unit}
          ok={tpOk}
        />
      </div>

      <div className="mt-4">
        <label className="text-sm text-muted-foreground mb-1.5 block">{t.notes}</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          className="bg-secondary/50 border-border min-h-[60px]" />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="h-11 px-6 gap-2 font-semibold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
            saved ? <CheckCircle className="w-4 h-4" /> : null}
          {t.saveEntry}
        </Button>
      </div>
    </motion.div>
  );
};

const NumberField = ({
  icon, label, value, setValue, unit, ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  setValue: (v: string) => void;
  unit?: string;
  ok: boolean;
}) => {
  const colors = statusColorClasses(ok);
  return (
    <div>
      <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
        {icon} {label} {unit && <span className="opacity-60">({unit})</span>}
      </label>
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0.00"
        className={`h-12 text-2xl font-bold border ${value ? `${colors.bg} ${colors.text} ${colors.border}` : "bg-secondary/50 border-border"}`}
      />
    </div>
  );
};

export default FieldOpsForm;
