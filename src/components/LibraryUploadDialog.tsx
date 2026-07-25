import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOperator } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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

interface Plant { id: string; code: string; name: string; }
interface Equipment { id: string; tag: string | null; asset_name: string; }

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
  const [equipmentId, setEquipmentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [plants, setPlants] = useState<Plant[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase.from("plants").select("id, code, name").order("code");
      setPlants((data as Plant[]) || []);
    })();
  }, [open]);

  useEffect(() => {
    if (!plantCode) { setEquipment([]); return; }
    (async () => {
      const { data } = await supabase
        .from("equipment_assets")
        .select("id, tag, asset_name")
        .eq("plant_code", plantCode)
        .order("tag");
      setEquipment((data as Equipment[]) || []);
    })();
  }, [plantCode]);

  const reset = () => {
    setFileName(""); setFile(null); setDescription("");
    setPlantCode(""); setEquipmentId("");
  };

  const handleSave = async () => {
    if (!fileName.trim()) return toast({ title: lang === "ar" ? "أدخل اسم الملف" : "Enter file name", variant: "destructive" });
    if (!file) return toast({ title: lang === "ar" ? "اختر ملفًا" : "Choose a file", variant: "destructive" });
    if (file.size > 20 * 1024 * 1024) return toast({ title: lang === "ar" ? "الحد الأقصى 20 ميغابايت" : "Max 20 MB", variant: "destructive" });

    setSaving(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${category}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("digital-library").upload(path, file, {
        contentType: file.type || undefined,
      });
      if (upErr) throw upErr;

      const session = getUserSession();
      const { error: insErr } = await supabase.from("library_files").insert({
        file_name: fileName.trim(),
        category,
        plant_code: plantCode || null,
        equipment_id: equipmentId || null,
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
          <div>
            <Label>{lang === "ar" ? "اسم الملف" : "File Name"} *</Label>
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} maxLength={150} placeholder="e.g. Ammonia Reactor P&ID Rev.3" />
          </div>

          <div>
            <Label>{lang === "ar" ? "اختر ملف" : "Choose File"} *</Label>
            <Input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f && !fileName) setFileName(f.name.replace(/\.[^.]+$/, ""));
              }}
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>

          <div>
            <Label>{lang === "ar" ? "فئة الملف" : "File Category"} *</Label>
            <RadioGroup value={category} onValueChange={setCategory} className="grid grid-cols-2 gap-2 mt-2">
              {CATEGORIES.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 cursor-pointer hover:border-primary/50 transition"
                >
                  <RadioGroupItem value={c.key} />
                  <span className="text-sm">{lang === "ar" ? c.labelAr : c.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label>{lang === "ar" ? "المصنع" : "Plant"}</Label>
            <Select value={plantCode} onValueChange={setPlantCode}>
              <SelectTrigger><SelectValue placeholder={lang === "ar" ? "اختر المصنع" : "Select plant"} /></SelectTrigger>
              <SelectContent>
                {plants.map((p) => (
                  <SelectItem key={p.id} value={p.code}>{p.code} — {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{lang === "ar" ? "المعدة (اختياري)" : "Equipment (Optional)"}</Label>
            <Select value={equipmentId} onValueChange={setEquipmentId} disabled={!plantCode || equipment.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={
                  !plantCode ? (lang === "ar" ? "اختر مصنعًا أولًا" : "Select a plant first")
                             : (lang === "ar" ? "اختر المعدة" : "Select equipment")
                } />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.tag} — {e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{lang === "ar" ? "الوصف" : "Description"}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} />
          </div>
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
