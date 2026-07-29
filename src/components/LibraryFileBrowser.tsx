import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Download, ExternalLink, Trash2, Upload, FileText, Loader2 } from "lucide-react";

export interface LibraryFile {
  id: string;
  file_name: string;
  category: string;
  plant_code: string | null;
  department_key: string | null;
  process_name: string | null;
  description: string | null;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: string[];
  title: string;
  plantCode?: string;
  onUpload?: () => void;
}

function humanSize(bytes: number | null) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

const LibraryFileBrowser = ({ open, onOpenChange, categories, title, plantCode, onUpload }: Props) => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyThisPlant, setOnlyThisPlant] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("library_files")
      .select("*")
      .in("category", categories)
      .order("created_at", { ascending: false });
    if (plantCode && onlyThisPlant) q = q.eq("plant_code", plantCode);
    const { data, error } = await q;
    if (error) {
      toast({ title: lang === "ar" ? "تعذر جلب الملفات" : "Failed to load files", description: error.message, variant: "destructive" });
    }
    setFiles((data as LibraryFile[]) || []);
    setLoading(false);
  }, [categories, plantCode, onlyThisPlant, lang, toast]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const openFile = async (f: LibraryFile, download = false) => {
    const { data, error } = await supabase.storage
      .from("digital-library")
      .createSignedUrl(f.storage_path, 3600, download ? { download: f.file_name } : undefined);
    if (error || !data) {
      toast({ title: lang === "ar" ? "تعذر فتح الملف" : "Cannot open file", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (f: LibraryFile) => {
    if (!confirm(lang === "ar" ? `حذف الملف "${f.file_name}"؟` : `Delete "${f.file_name}"?`)) return;
    await supabase.storage.from("digital-library").remove([f.storage_path]);
    const { error } = await supabase.from("library_files").delete().eq("id", f.id);
    if (error) {
      toast({ title: lang === "ar" ? "تعذر الحذف" : "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: lang === "ar" ? "تم حذف الملف" : "File deleted" });
    load();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto glass-card border-white/20">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {lang === "ar"
              ? "الملفات المرفوعة في هذا القسم — يمكنك فتحها أو تنزيلها أو حذفها."
              : "Files uploaded in this section — open, download or delete."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          {plantCode && (
            <Button
              size="sm"
              variant={onlyThisPlant ? "default" : "secondary"}
              onClick={() => setOnlyThisPlant((v) => !v)}
            >
              {onlyThisPlant
                ? (lang === "ar" ? `ملفات ${plantCode} فقط` : `${plantCode} only`)
                : (lang === "ar" ? "كل المصانع" : "All plants")}
            </Button>
          )}
          {onUpload && (
            <Button size="sm" variant="secondary" onClick={onUpload} className="gap-2">
              <Upload className="w-4 h-4" />
              {lang === "ar" ? "رفع ملف جديد" : "Upload file"}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="py-10 flex justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            {lang === "ar" ? "لا توجد ملفات مرفوعة في هذا القسم بعد." : "No files uploaded in this section yet."}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{f.file_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[f.category, f.plant_code, f.process_name, humanSize(f.size_bytes),
                      new Date(f.created_at).toLocaleDateString(lang === "ar" ? "ar-LY" : "en-GB"),
                      f.uploaded_by].filter(Boolean).join(" • ")}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => openFile(f)} title={lang === "ar" ? "فتح" : "Open"}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openFile(f, true)} title={lang === "ar" ? "تنزيل" : "Download"}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(f)} title={lang === "ar" ? "حذف" : "Delete"}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LibraryFileBrowser;
