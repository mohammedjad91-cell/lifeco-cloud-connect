import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Wrench, Loader2, CheckCircle, User, Hash, Camera, X, AlertTriangle, FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { FIELD_OPS_EQUIPMENT } from "@/lib/departments";
import { isInRange, statusColorClasses } from "@/lib/ranges";
import { getEquipmentProfile, type ParamSpec } from "@/lib/equipment-profiles";
import { getOperator, getStamp } from "@/lib/session";

interface Props {
  department: string;
  onSaved?: () => void;
}

const FieldOpsForm = ({ department, onSaved }: Props) => {
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const operator = getOperator();

  const [equipmentTag, setEquipmentTag] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [employeeId, setEmployeeId] = useState(operator?.employeeId ?? "");
  const [technicianName, setTechnicianName] = useState(operator?.name ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const equipmentList = FIELD_OPS_EQUIPMENT[department] || FIELD_OPS_EQUIPMENT.OPERATIONS;
  const profile = useMemo(() => getEquipmentProfile(equipmentTag), [equipmentTag]);

  // Reset readings when equipment changes
  useEffect(() => { setValues({}); }, [equipmentTag]);

  // Auto-fill from operator session if it loads after mount
  useEffect(() => {
    if (!employeeId && operator?.employeeId) setEmployeeId(operator.employeeId);
    if (!technicianName && operator?.name) setTechnicianName(operator.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operator?.employeeId, operator?.name]);

  const outOfRangeParams = profile.params.filter((p) => {
    const v = values[p.key];
    if (!v) return false;
    const n = parseFloat(v);
    return Number.isFinite(n) && !isInRange(n, p.range);
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Photo too large (max 5MB)", variant: "destructive" });
      return;
    }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;
    setUploading(true);
    const ext = photoFile.name.split(".").pop() || "jpg";
    const path = `${department}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("field-ops-photos")
      .upload(path, photoFile, { upsert: false, contentType: photoFile.type });
    setUploading(false);
    if (error) {
      toast({ title: "Photo upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("field-ops-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast({ title: "Only PDF files are allowed", variant: "destructive" });
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      toast({ title: "PDF too large (max 15MB)", variant: "destructive" });
      return;
    }
    setPdfFile(f);
  };

  const clearPdf = () => {
    setPdfFile(null);
    if (pdfRef.current) pdfRef.current.value = "";
  };

  const uploadPdf = async (): Promise<string | null> => {
    if (!pdfFile) return null;
    setUploading(true);
    const safeTag = (equipmentTag || "doc").replace(/[^a-zA-Z0-9_-]+/g, "_");
    const path = `${department}/pdf/${safeTag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
    const { error } = await supabase.storage
      .from("field-ops-photos")
      .upload(path, pdfFile, { upsert: false, contentType: "application/pdf" });
    setUploading(false);
    if (error) {
      toast({ title: "PDF upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("field-ops-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!employeeId || !equipmentTag) {
      toast({ title: t.fieldOpsMissing, variant: "destructive" });
      return;
    }
    const hasAny = profile.params.some((p) => values[p.key]);
    if (!hasAny) {
      toast({ title: t.fieldOpsMissing, variant: "destructive" });
      return;
    }

    setSaving(true);
    const photoUrl = await uploadPhoto();
    const pdfUrl = await uploadPdf();

    const dynamicData: Record<string, number> = {};
    profile.params.forEach((p) => {
      const v = values[p.key];
      if (v) {
        const n = parseFloat(v);
        if (Number.isFinite(n)) dynamicData[p.key] = n;
      }
    });

    const stamp = getStamp(operator);
    const payload: Record<string, unknown> = {
      department,
      equipment_tag: equipmentTag,
      employee_id: employeeId,
      technician_name: technicianName || null,
      notes: notes || null,
      dynamic_data: dynamicData,
      photo_url: photoUrl,
      pdf_url: pdfUrl,
      recorded_by: stamp.formatted,
      timestamp: new Date().toISOString(),
    };
    // mirror common metrics into legacy columns when present
    if (dynamicData.running_hours !== undefined) payload.running_hours = dynamicData.running_hours;
    if (dynamicData.discharge_pressure !== undefined) payload.discharge_pressure = dynamicData.discharge_pressure;
    if (dynamicData.temperature !== undefined) payload.temperature = dynamicData.temperature;

    const { error } = await (supabase as unknown as {
      from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> };
    }).from("field_ops_logs").insert(payload);

    if (error) {
      const msg = (error as { message?: string }).message || "";
      toast({
        title: lang === "ar" ? "فشل الحفظ" : t.errorSaving,
        description: msg,
        variant: "destructive",
      });
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setValues({});
      setNotes("");
      clearPhoto();
      clearPdf();
      toast({ title: t.saved, description: t.fieldOpsSaved });
      supabase.from("activity_logs").insert({
        action: "FIELD_OPS_ENTRY",
        department,
        details: `${equipmentTag} | ${Object.entries(dynamicData)
          .map(([k, v]) => `${k}:${v}`)
          .join(" ")} (EID:${employeeId})`,
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
            {operator?.employeeId && (
              <span className="text-[10px] text-primary/70 ml-1">(auto)</span>
            )}
          </label>
          <Input
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder={t.employeeIdPlaceholder}
            className="bg-secondary/50 border-border"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> {t.technicianName}
            {operator?.name && (
              <span className="text-[10px] text-primary/70 ml-1">(auto)</span>
            )}
          </label>
          <Input
            value={technicianName}
            onChange={(e) => setTechnicianName(e.target.value)}
            placeholder={t.technicianNamePlaceholder}
            className="bg-secondary/50 border-border"
          />
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

      {equipmentTag && (
        <motion.div
          key={equipmentTag}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground italic">{profile.description}</p>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
              {profile.type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.params.map((p) => (
              <DynamicField
                key={p.key}
                spec={p}
                value={values[p.key] ?? ""}
                onChange={(v) => setValues((s) => ({ ...s, [p.key]: v }))}
              />
            ))}
          </div>

          {outOfRangeParams.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-start gap-2 p-3 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 text-sm"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong>Process warning:</strong>{" "}
                {outOfRangeParams.map((p) => p.label).join(", ")}{" "}
                {outOfRangeParams.length === 1 ? "is" : "are"} outside the design limits — verify
                the reading and notify the shift supervisor.
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="mt-4">
        <label className="text-sm text-muted-foreground mb-1.5 block">{t.notes}</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          className="bg-secondary/50 border-border min-h-[60px]"
        />

        <div className="mt-2 flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            {photoFile ? "Change Photo" : "Attach Photo"}
          </Button>
          {photoPreview && (
            <div className="relative inline-block">
              <img
                src={photoPreview}
                alt="attachment preview"
                className="h-16 w-16 object-cover rounded border border-border"
              />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                aria-label="remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <input
            ref={pdfRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pdfRef.current?.click()}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            {pdfFile ? "Change PDF" : "Attach PDF"}
          </Button>
          {pdfFile && (
            <div className="flex items-center gap-2 px-2 py-1 rounded border border-border bg-secondary/40 text-xs">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="max-w-[160px] truncate" title={pdfFile.name}>
                {pdfFile.name}
              </span>
              <span className="opacity-60">
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                onClick={clearPdf}
                className="bg-destructive text-destructive-foreground rounded-full p-0.5"
                aria-label="remove pdf"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || uploading}
          className="h-11 px-6 gap-2 font-semibold"
        >
          {saving || uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : null}
          {t.saveEntry}
        </Button>
      </div>
    </motion.div>
  );
};

const DynamicField = ({
  spec, value, onChange,
}: {
  spec: ParamSpec;
  value: string;
  onChange: (v: string) => void;
}) => {
  const n = parseFloat(value);
  const ok = !value || isInRange(n, spec.range);
  const colors = statusColorClasses(ok);
  return (
    <div>
      <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
        {spec.label}
        {spec.unit && <span className="opacity-60">({spec.unit})</span>}
        {spec.range && (
          <span className="text-[10px] opacity-50 ml-auto">
            {spec.range.min}–{spec.range.max}
          </span>
        )}
      </label>
      <Input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className={`h-12 text-xl font-bold border transition-all ${
          value
            ? ok
              ? `${colors.bg} ${colors.text} ${colors.border}`
              : `bg-red-500/15 text-red-300 border-red-500/60 shadow-[0_0_18px_rgba(239,68,68,0.55)] animate-pulse`
            : "bg-secondary/50 border-border"
        }`}
      />
    </div>
  );
};

export default FieldOpsForm;
