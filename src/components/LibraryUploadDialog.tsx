import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOperator } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form/FormField";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CATEGORIES = [
  { key: "process",     label: "Process Documents",   labelAr: "وثائق العمليات" },
  { key: "equipment",   label: "Equipment Documents", labelAr: "وثائق المعدات" },
  { key: "reports",     label: "Reports",             labelAr: "التقارير" },
  { key: "photos",      label: "Photos",              labelAr: "الصور" },
  { key: "videos",      label: "Videos",              labelAr: "الفيديو" },
  { key: "drawings",    label: "Drawings",            labelAr: "الرسومات" },
  { key: "certificates",label: "Certificates",        labelAr: "الشهادات" },
  { key: "sop",         label: "SOP",                 labelAr: "SOP" },
  { key: "manuals",     label: "Manuals",             labelAr: "الأدلة" },
];

interface Plant { id: string; code: string; name: string; department_key: string; }
interface Equipment { id: string; tag: string | null; asset_name: string; asset_code: string | null; }

const DEPT_LABELS: Record<string, { ar: string; en: string }> = {
  AMMONIA:     { ar: "إدارة الأمونيا",            en: "Ammonia" },
  UREA:        { ar: "إدارة اليوريا",             en: "Urea" },
  LAB:         { ar: "إدارة المختبر",             en: "Laboratory" },
  MAINTENANCE: { ar: "إدارة الصيانة",             en: "Maintenance" },
  SAFETY:      { ar: "إدارة السلامة والصحة",      en: "Safety & OHS" },
  MATERIALS:   { ar: "إدارة المواد",              en: "Materials" },
  TECHNICAL:   { ar: "إدارة الشؤون الفنية",       en: "Technical Affairs" },
  WAREHOUSE:   { ar: "المخازن",                   en: "Warehouse" },
};

/** AMM-1 / amm_1 → AMM1 so plant codes match equipment department codes. */
const norm = (v: string) => v.replace(/[^a-z0-9]/gi, "").toUpperCase();

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultCategory?: string;
  onSaved?: () => void;
}

export default function LibraryUploadDialog({ open, onOpenChange, defaultCategory, onSaved }: Props) {
  const { lang } = useI18n();
  const { toast } = useToast();
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(defaultCategory ?? "process");
  const [plantCode, setPlantCode] = useState<string>("");
  const [linkType, setLinkType] = useState<"equipment" | "process">("equipment");
  const [equipmentId, setEquipmentId] = useState<string>("");
  const [processName, setProcessName] = useState("");
  const [description, setDescription] = useState("");
  const [plants, setPlants] = useState<Plant[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loadingEq, setLoadingEq] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("plants")
        .select("id, code, name, department_key")
        .order("department_key")
        .order("code");
      setPlants((data as Plant[]) || []);
    })();
  }, [open]);

  const selectedPlant = plants.find((p) => p.code === plantCode);

  useEffect(() => {
    if (!plantCode) { setEquipment([]); return; }
    let cancelled = false;
    (async () => {
      setLoadingEq(true);
      const key = norm(plantCode);
      const dept = selectedPlant?.department_key ?? "";
      // Equipment is stored either by plant_code or by a department code
      // (e.g. plant "AMM-1" ↔ equipment department "AMM1"), so match both.
      const { data } = await supabase
        .from("equipment_assets")
        .select("id, tag, asset_name, asset_code, plant_code, department")
        .order("asset_name");
      if (cancelled) return;
      const rows = ((data as any[]) || []).filter((e) => {
        const pc = norm(e.plant_code ?? "");
        const dp = norm(e.department ?? "");
        return pc === key || dp === key || (!e.plant_code && dp === norm(dept));
      });
      setEquipment(rows as Equipment[]);
      setLoadingEq(false);
    })();
    return () => { cancelled = true; };
  }, [plantCode, selectedPlant?.department_key]);

  const groupedPlants = plants.reduce<Record<string, Plant[]>>((acc, p) => {
    (acc[p.department_key] ||= []).push(p);
    return acc;
  }, {});

  const reset = () => {
    setFileName(""); setFile(null); setDescription("");
    setPlantCode(""); setEquipmentId(""); setProcessName(""); setLinkType("equipment");
  };


  const handleSave = async () => {
    if (!fileName.trim()) return toast({ title: lang === "ar" ? "أدخل اسم الملف" : "Enter file name", variant: "destructive" });
    if (!file) return toast({ title: lang === "ar" ? "اختر ملفًا" : "Choose a file", variant: "destructive" });
    if (file.size > 20 * 1024 * 1024) return toast({ title: lang === "ar" ? "الحد الأقصى 20 ميغابايت" : "Max 20 MB", variant: "destructive" });
    if (!plantCode) return toast({ title: lang === "ar" ? "اختر المصنع" : "Select a plant", variant: "destructive" });
    if (linkType === "equipment" && !equipmentId)
      return toast({ title: lang === "ar" ? "اختر اسم المعدة" : "Select the equipment", variant: "destructive" });
    if (linkType === "process" && !processName.trim())
      return toast({ title: lang === "ar" ? "أدخل اسم عملية التشغيل" : "Enter the operating process", variant: "destructive" });

    setSaving(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${category}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("digital-library").upload(path, file, {
        contentType: file.type || undefined,
      });
      if (upErr) throw upErr;

      const session = getOperator();
      const { error: insErr } = await supabase.from("library_files").insert({
        file_name: fileName.trim(),
        category,
        plant_code: plantCode || null,
        department_key: selectedPlant?.department_key ?? null,
        equipment_id: linkType === "equipment" ? equipmentId || null : null,
        process_name: linkType === "process" ? processName.trim() : null,
        description: description.trim() || null,
        storage_path: path,
        mime_type: file.type || null,
        size_bytes: file.size,
        uploaded_by: session?.name || session?.employeeId || null,
      });
      if (insErr) throw insErr;


      toast({ title: lang === "ar" ? "تم الحفظ" : "Saved" });
      reset();
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast({ title: lang === "ar" ? "فشل الرفع" : "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg glass-card border-white/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {lang === "ar" ? "رفع ملف للمكتبة الرقمية" : "Upload to Digital Library"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FormField
            label={lang === "ar" ? "الملف" : "File"}
            required
            hint={
              file
                ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`
                : lang === "ar"
                  ? "الحد الأقصى 20 ميغابايت. يُملأ اسم الملف تلقائيًا بعد الاختيار."
                  : "Max 20 MB. The display name below is filled in automatically after you choose a file."
            }
          >
            {(id) => (
              <Input
                id={id}
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  if (f && !fileName) setFileName(f.name.replace(/\.[^.]+$/, ""));
                }}
              />
            )}
          </FormField>

          <FormField
            label={lang === "ar" ? "اسم العرض" : "Display Name"}
            required
            tooltip={
              lang === "ar"
                ? "الاسم الذي يظهر في المكتبة والبحث — لا يغيّر اسم الملف الأصلي."
                : "The name shown in the library and search results. It does not rename the stored file."
            }
          >
            {(id) => (
              <Input
                id={id}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                maxLength={150}
                placeholder="مثال: مخطط مفاعل الأمونيا P&ID مراجعة 3"
              />
            )}
          </FormField>

          <FormField
            label={lang === "ar" ? "فئة الملف" : "File Category"}
            required
            hint={
              lang === "ar"
                ? "تحدد الفئة مكان ظهور الملف داخل المكتبة الرقمية."
                : "Determines where the file appears inside the Digital Library."
            }
          >
            {() => (
              <RadioGroup
                value={category}
                onValueChange={setCategory}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {CATEGORIES.map((c) => (
                  <label
                    key={c.key}
                    className="flex min-h-11 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 cursor-pointer hover:border-primary/50 transition"
                  >
                    <RadioGroupItem value={c.key} />
                    <span className="text-sm">{lang === "ar" ? c.labelAr : c.label}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
          </FormField>

          <FormField
            label={lang === "ar" ? "المصنع / الوحدة" : "Plant / Unit"}
            required
            hint={
              lang === "ar"
                ? "كل مصانع المنظومة مرتبة حسب الإدارة."
                : "Every plant in the system, grouped by department."
            }
          >
            {(id) => (
              <Select value={plantCode} onValueChange={(v) => { setPlantCode(v); setEquipmentId(""); }}>
                <SelectTrigger id={id}>
                  <SelectValue placeholder={lang === "ar" ? "اختر المصنع" : "Select plant"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {Object.entries(groupedPlants).map(([dept, list]) => (
                    <SelectGroup key={dept}>
                      <SelectLabel>
                        {DEPT_LABELS[dept] ? (lang === "ar" ? DEPT_LABELS[dept].ar : DEPT_LABELS[dept].en) : dept}
                      </SelectLabel>
                      {list.map((p) => (
                        <SelectItem key={p.id} value={p.code}>{p.code} — {p.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField
            label={lang === "ar" ? "الملف يخص" : "This file relates to"}
            required
            hint={
              lang === "ar"
                ? "اختر إمّا معدة محددة أو عملية تشغيل."
                : "Choose either a specific equipment item or an operating process."
            }
          >
            {() => (
              <RadioGroup
                value={linkType}
                onValueChange={(v) => setLinkType(v as "equipment" | "process")}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                <label className="flex min-h-11 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 cursor-pointer hover:border-primary/50 transition">
                  <RadioGroupItem value="equipment" />
                  <span className="text-sm">{lang === "ar" ? "معدة" : "Equipment"}</span>
                </label>
                <label className="flex min-h-11 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 cursor-pointer hover:border-primary/50 transition">
                  <RadioGroupItem value="process" />
                  <span className="text-sm">{lang === "ar" ? "عملية تشغيل" : "Operating process"}</span>
                </label>
              </RadioGroup>
            )}
          </FormField>

          {linkType === "equipment" ? (
            <FormField
              label={lang === "ar" ? "اسم المعدة" : "Equipment name"}
              required
              hint={
                !plantCode
                  ? (lang === "ar" ? "اختر المصنع أولًا لعرض معداته." : "Select a plant first to list its equipment.")
                  : loadingEq
                    ? (lang === "ar" ? "جارٍ تحميل المعدات…" : "Loading equipment…")
                    : equipment.length === 0
                      ? (lang === "ar" ? "لا توجد معدات مسجلة لهذا المصنع — اكتب اسم المعدة يدويًا." : "No equipment registered for this plant — type the equipment name manually.")
                      : (lang === "ar" ? `${equipment.length} معدة متاحة` : `${equipment.length} items available`)
              }
            >
              {(id) =>
                plantCode && !loadingEq && equipment.length === 0 ? (
                  <Input
                    id={id}
                    value={manualEquipment}
                    onChange={(e) => setManualEquipment(e.target.value)}
                    maxLength={150}
                    placeholder={lang === "ar" ? "مثال: ضاغط الهواء 101-J" : "e.g. Air compressor 101-J"}
                  />
                ) : (
                  <Select
                    value={equipmentId}
                    onValueChange={setEquipmentId}
                    disabled={!plantCode || loadingEq}
                  >
                    <SelectTrigger id={id}>
                      <SelectValue placeholder={
                        !plantCode ? (lang === "ar" ? "اختر مصنعًا أولًا" : "Select a plant first")
                                   : (lang === "ar" ? "اختر المعدة" : "Select equipment")
                      } />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {equipment.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {(e.tag || e.asset_code) ? `${e.tag ?? e.asset_code} — ` : ""}{e.asset_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }
            </FormField>
          ) : (
            <FormField
              label={lang === "ar" ? "اسم عملية التشغيل" : "Operating process name"}
              required
              hint={
                lang === "ar"
                  ? "مثال: بدء تشغيل قسم التحويل، إيقاف طارئ لوحدة PSA."
                  : "e.g. Reforming section start-up, PSA unit emergency shutdown."
              }
            >
              {(id) => (
                <Input
                  id={id}
                  value={processName}
                  onChange={(e) => setProcessName(e.target.value)}
                  maxLength={150}
                  placeholder={lang === "ar" ? "مثال: إجراء بدء تشغيل ضاغط الهواء" : "e.g. Air compressor start-up procedure"}
                />
              )}
            </FormField>
          )}


          <FormField
            label={lang === "ar" ? "الوصف" : "Description"}
            hint={
              lang === "ar"
                ? "ملخص قصير يساعد زملاءك في العثور على الملف."
                : "A short summary that helps colleagues find this file later."
            }
          >
            {(id) => (
              <Textarea
                id={id}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
              />
            )}
          </FormField>
        </div>


        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {lang === "ar" ? "حفظ" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
