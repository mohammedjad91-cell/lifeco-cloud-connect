import { useEffect, useState } from "react";
import { DEPARTMENTS } from "@/lib/departments";
import { getDeptBg, setDeptBg, clearDeptBg, fileToDataUrl } from "@/lib/dept-backgrounds";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, Upload, Trash2 } from "lucide-react";

const DeptBackgroundManager = () => {
  const { toast } = useToast();
  const [bgs, setBgs] = useState<Record<string, string | null>>({});

  const refresh = () => {
    const map: Record<string, string | null> = {};
    DEPARTMENTS.forEach(d => { map[d.id] = getDeptBg(d.id); });
    setBgs(map);
  };

  useEffect(() => { refresh(); }, []);

  const handleUpload = async (deptId: string, file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "الصورة كبيرة (الحد الأقصى 3MB)", variant: "destructive" });
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setDeptBg(deptId, dataUrl);
      refresh();
      toast({ title: "تم حفظ الخلفية" });
    } catch {
      toast({ title: "فشل رفع الصورة", variant: "destructive" });
    }
  };

  const handleClear = (deptId: string) => {
    clearDeptBg(deptId);
    refresh();
    toast({ title: "تمت إزالة الخلفية" });
  };

  return (
    <div className="glass-card p-4 md:p-6 neon-border">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-lg">خلفيات الإدارات</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        ارفع صورة لكل إدارة لتظهر كخلفية في لوحة تحكم القسم. الصور تُحفظ محلياً على الجهاز.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DEPARTMENTS.map(d => {
          const bg = bgs[d.id];
          return (
            <div key={d.id} className="rounded-lg bg-secondary/30 p-3 flex items-center gap-3">
              <div
                className="w-20 h-14 rounded-md border border-border bg-cover bg-center bg-secondary/50 flex-shrink-0"
                style={bg ? { backgroundImage: `url(${bg})` } : {}}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{d.label}</div>
                <div className="text-xs text-muted-foreground">
                  {bg ? "خلفية مخصصة" : "الخلفية الافتراضية"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(d.id, f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors">
                    <Upload className="w-3 h-3" /> رفع
                  </span>
                </label>
                {bg && (
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleClear(d.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeptBackgroundManager;
