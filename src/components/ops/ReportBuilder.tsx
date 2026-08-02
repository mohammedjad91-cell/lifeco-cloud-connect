import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, PlusCircle, ShieldAlert, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/form/FormField";
import { useToast } from "@/hooks/use-toast";
import { getOperator } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABEL,
  PERIOD_LABEL,
  PLANTS,
  LAB_UNITS,
  PLANT_UNITS,
  SEVERITY_LABEL,
  SHIFT_LABEL,
  STATUS_LABEL,
  createReport,
  type ReportSection,
  type PeriodType,
  type PlantKey,
  type ReportStatus,
  type Severity,
  type Shift,
  type WorkCategory,
} from "@/lib/ops-reports";

interface Props {
  plantKey: PlantKey;
  lockPlant?: boolean;
  /** "OPS" = plant operations reports, "LAB" = laboratory supervisor reports. */
  section?: ReportSection;
}

export default function ReportBuilder({ plantKey, lockPlant = true, section = "OPS" }: Props) {
  const unitsFor = (k: PlantKey) => (section === "LAB" ? LAB_UNITS[k] : PLANT_UNITS[k]);
  const { toast } = useToast();
  const qc = useQueryClient();
  const op = getOperator();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [plant, setPlant] = useState<PlantKey>(plantKey);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [shift, setShift] = useState<Shift>("morning");
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [category, setCategory] = useState<WorkCategory>("routine");
  const [unit, setUnit] = useState<string>((section === "LAB" ? LAB_UNITS : PLANT_UNITS)[plantKey][0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState("");
  const [severity, setSeverity] = useState<Severity>("low");
  const [supervisor, setSupervisor] = useState(op?.name ?? "");
  const [signed, setSigned] = useState(false);
  const [status, setStatus] = useState<ReportStatus>("submitted");

  const reset = () => {
    setTitle("");
    setDescription("");
    setEquipment("");
    setSeverity("low");
    setSigned(false);
    setCategory("routine");
  };

  const submit = async () => {
    if (!title.trim()) {
      toast({ title: "العنوان مطلوب", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await createReport({
        plant_key: plant,
        section,
        plant_code: unit,
        report_date: date,
        shift,
        period_type: period,
        work_category: category,
        title: title.trim(),
        description: description.trim() || null,
        equipment_tag: equipment.trim() || null,
        severity,
        supervisor_name: supervisor.trim() || null,
        signed,
        status,
      });
      await qc.invalidateQueries({ queryKey: ["ops-reports"] });
      toast({ title: "تم تسجيل التقرير", description: `${PLANTS[plant].name} — ${PERIOD_LABEL[period]}` });
      reset();
      setOpen(false);
    } catch (e: any) {
      toast({ title: "فشل الحفظ", description: String(e?.message ?? e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" /> {section === "LAB" ? "تقرير معمل جديد" : "تقرير وردية جديد"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="neon-text">{section === "LAB" ? "منشئ تقرير المعمل" : "منشئ تقرير الوردية"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label={section === "LAB" ? "المعمل" : "المصنع"} hint="عزل كامل للبيانات بين الأمونيا واليوريا.">
            {(id) => (
              <Select value={plant} onValueChange={(v) => { setPlant(v as PlantKey); setUnit(unitsFor(v as PlantKey)[0]); }} disabled={lockPlant}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PLANTS) as PlantKey[]).map((k) => (
                    <SelectItem key={k} value={k}>{PLANTS[k].name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField label={section === "LAB" ? "قسم المعمل" : "الوحدة / الرمز"}>
            {(id) => (
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {unitsFor(plant).map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField label="التاريخ">
            {(id) => <Input id={id} dir="ltr" type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
          </FormField>

          <FormField label="الوردية">
            {(id) => (
              <Select value={shift} onValueChange={(v) => setShift(v as Shift)}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(SHIFT_LABEL) as Shift[]).map((s) => (<SelectItem key={s} value={s}>{SHIFT_LABEL[s]}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField label="نوع الفترة" hint="يومي / أسبوعي / شهري.">
            {(id) => (
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERIOD_LABEL) as PeriodType[]).map((p) => (<SelectItem key={p} value={p}>{PERIOD_LABEL[p]}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField label="الحالة">
            {(id) => (
              <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus)}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as ReportStatus[]).map((s) => (<SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        </div>

        <FormField
          label="تصنيف العمل"
          hint="روتيني: فحوصات مجدولة، عيّنات، تدوير معدات، تسجيل قراءات. غير روتيني: انحرافات، توقفات (Trip)، صيانة طارئة، تصاريح عمل ساخن، حوادث سلامة."
        >
          {() => (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory("routine")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all",
                  category === "routine"
                    ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                    : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
                )}
              >
                <Wrench className="w-4 h-4" /> {CATEGORY_LABEL.routine}
              </button>
              <button
                type="button"
                onClick={() => { setCategory("non_routine"); if (severity === "low") setSeverity("high"); }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all",
                  category === "non_routine"
                    ? "border-red-400/60 bg-red-500/15 text-red-200 shadow-[0_0_24px_-8px_hsl(0_80%_60%/0.7)]"
                    : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60",
                )}
              >
                <ShieldAlert className="w-4 h-4" /> {CATEGORY_LABEL.non_routine}
              </button>
            </div>
          )}
        </FormField>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="عنوان التقرير" className="md:col-span-2">
            {(id) => <Input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: تدوير مضخة التغذية P-101B" />}
          </FormField>
          <FormField label="مستوى الأهمية">
            {(id) => (
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger id={id}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(SEVERITY_LABEL) as Severity[]).map((s) => (<SelectItem key={s} value={s}>{SEVERITY_LABEL[s]}</SelectItem>))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        </div>

        <FormField label="السرد التفصيلي" hint="يدعم تنسيق Markdown — النقاط والعناوين تُحفظ كما هي.">
          {(id) => (
            <Textarea
              id={id}
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={"## ملخص\n- الحالة التشغيلية\n- الإجراءات المتخذة\n- التوصيات"}
              className="font-mono text-xs"
            />
          )}
        </FormField>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="رقم/وسم المعدة">
            {(id) => <Input id={id} dir="ltr" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="P-101B" />}
          </FormField>
          <FormField label="اسم المشرف">
            {(id) => <Input id={id} value={supervisor} onChange={(e) => setSupervisor(e.target.value)} />}
          </FormField>
          <FormField label="توقيع المشرف" hint="يُعتمد التقرير بعد التوقيع.">
            {(id) => (
              <div className="flex h-10 items-center gap-3 rounded-md border border-border bg-secondary/30 px-3">
                <Switch id={id} checked={signed} onCheckedChange={setSigned} />
                <span className="text-sm text-muted-foreground">{signed ? "موقّع" : "غير موقّع"}</span>
              </div>
            )}
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={submit} disabled={busy} className="gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} حفظ التقرير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
