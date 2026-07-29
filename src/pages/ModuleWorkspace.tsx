import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getDeptBg } from "@/lib/dept-backgrounds";
import { getDepartmentById } from "@/lib/departments";
import { getModulesForPlant } from "@/lib/plant-modules";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, Printer, RefreshCw, Loader2 } from "lucide-react";
import heroPlant from "@/assets/lifeco-hero-1.webp";

interface Plant {
  id: string;
  name: string;
  code: string;
  department_key: string;
}

type Row = Record<string, unknown>;

interface Panel {
  title: string;
  titleAr: string;
  columns: { key: string; label: string }[];
  rows: Row[];
}

const fmt = (v: unknown) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return String(v);
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return new Date(s).toLocaleString();
  return s;
};

const ModuleWorkspace = ({ plantCode, moduleKey }: { plantCode: string; moduleKey: string }) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [plant, setPlant] = useState<Plant | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<{ label: string; labelAr: string; value: number }[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);

  const mod = useMemo(
    () => getModulesForPlant(plantCode).find((m) => m.key === moduleKey),
    [plantCode, moduleKey],
  );
  const dept = plant ? getDepartmentById(plant.department_key) : null;

  const load = async () => {
    setLoading(true);
    const { data: p } = await supabase
      .from("plants").select("*").eq("code", plantCode).maybeSingle();
    const plantRow = (p as Plant) || null;
    setPlant(plantRow);
    if (plantRow) setBg(getDeptBg(plantRow.department_key));
    const deptKey = plantRow?.department_key || sessionStorage.getItem("lifeco_dept") || "AMMONIA";
    const k = moduleKey.toLowerCase();

    const [assets, opsLogs, fieldLogs, files, records, spares] = await Promise.all([
      supabase.from("equipment_assets").select("*").eq("department", deptKey).order("created_at", { ascending: false }).limit(50),
      supabase.from("operations_logs").select("*").eq("department", deptKey).order("timestamp", { ascending: false }).limit(50),
      supabase.from("field_ops_logs").select("*").eq("department", deptKey).order("timestamp", { ascending: false }).limit(50),
      supabase.from("library_files").select("*").eq("plant_code", plantCode).order("created_at", { ascending: false }).limit(50),
      supabase.from("maintenance_records").select("*").order("recorded_at", { ascending: false }).limit(50),
      supabase.from("spare_parts").select("*").order("name").limit(100),
    ]);

    const assetRows = assets.data ?? [];
    const opsRows = opsLogs.data ?? [];
    const fieldRows = fieldLogs.data ?? [];
    const fileRows = files.data ?? [];
    const recRows = records.data ?? [];
    const spareRows = spares.data ?? [];

    setKpis([
      { label: "Equipment", labelAr: "المعدات", value: assetRows.length },
      { label: "Readings", labelAr: "القراءات", value: opsRows.length },
      { label: "Field Logs", labelAr: "سجلات الميدان", value: fieldRows.length },
      { label: "Documents", labelAr: "الوثائق", value: fileRows.length },
    ]);

    const opsPanel: Panel = {
      title: "Latest Readings", titleAr: "أحدث القراءات",
      columns: [
        { key: "unit_tag", label: ar ? "الوحدة" : "Unit / Tag" },
        { key: "value", label: ar ? "القيمة" : "Value" },
        { key: "employee_id", label: ar ? "الموظف" : "Employee" },
        { key: "timestamp", label: ar ? "التاريخ" : "Timestamp" },
      ],
      rows: opsRows,
    };
    const fieldPanel: Panel = {
      title: "Field Operations", titleAr: "العمليات الميدانية",
      columns: [
        { key: "equipment_tag", label: ar ? "المعدة" : "Equipment" },
        { key: "technician_name", label: ar ? "الفني" : "Technician" },
        { key: "running_hours", label: ar ? "ساعات التشغيل" : "Run Hours" },
        { key: "temperature", label: ar ? "الحرارة" : "Temp" },
        { key: "timestamp", label: ar ? "التاريخ" : "Timestamp" },
      ],
      rows: fieldRows,
    };
    const assetPanel: Panel = {
      title: "Equipment Register", titleAr: "سجل المعدات",
      columns: [
        { key: "asset_code", label: ar ? "الرمز" : "Code" },
        { key: "asset_name", label: ar ? "الاسم" : "Name" },
        { key: "status", label: ar ? "الحالة" : "Status" },
        { key: "criticality", label: ar ? "الأهمية" : "Criticality" },
        { key: "location", label: ar ? "الموقع" : "Location" },
      ],
      rows: assetRows,
    };
    const docPanel: Panel = {
      title: "Documents", titleAr: "الوثائق",
      columns: [
        { key: "file_name", label: ar ? "الملف" : "File" },
        { key: "category", label: ar ? "التصنيف" : "Category" },
        { key: "uploaded_by", label: ar ? "بواسطة" : "Uploaded by" },
        { key: "created_at", label: ar ? "التاريخ" : "Date" },
      ],
      rows: fileRows,
    };
    const maintPanel: Panel = {
      title: "Maintenance History", titleAr: "سجل الصيانة",
      columns: [
        { key: "type", label: ar ? "النوع" : "Type" },
        { key: "notes", label: ar ? "الملاحظات" : "Notes" },
        { key: "technician", label: ar ? "الفني" : "Technician" },
        { key: "hours", label: ar ? "الساعات" : "Hours" },
        { key: "recorded_at", label: ar ? "التاريخ" : "Date" },
      ],
      rows: recRows,
    };
    const sparePanel: Panel = {
      title: "Spare Parts", titleAr: "قطع الغيار",
      columns: [
        { key: "part_no", label: ar ? "رقم القطعة" : "Part No" },
        { key: "name", label: ar ? "الاسم" : "Name" },
        { key: "stock_qty", label: ar ? "المخزون" : "Stock" },
        { key: "min_qty", label: ar ? "الحد الأدنى" : "Min" },
        { key: "location", label: ar ? "الموقع" : "Location" },
      ],
      rows: spareRows,
    };

    let chosen: Panel[];
    if (k.includes("spare") || k.includes("store") || k.includes("inventory")) chosen = [sparePanel, assetPanel];
    else if (k.includes("shutdown") || k.includes("history") || k.includes("maint")) chosen = [maintPanel, assetPanel];
    else if (k.includes("equipment") || k.includes("asset")) chosen = [assetPanel, maintPanel];
    else if (k.includes("doc") || k.includes("manual") || k.includes("draw")) chosen = [docPanel];
    else if (k === "overview") chosen = [opsPanel, assetPanel, docPanel];
    else chosen = [opsPanel, fieldPanel];

    setPanels(chosen);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantCode, moduleKey, lang]);

  const title = ar ? mod?.labelAr || mod?.label || moduleKey : mod?.label || moduleKey;
  const bgImage = bg || heroPlant;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/85" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 py-4 gap-2">
        <Button
          variant="secondary"
          onClick={() => navigate(`/modules/${plantCode}`)}
          className="bg-white/10 border border-white/30 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {ar ? "رجوع" : "Back"}
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => load()}
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20">
            <RefreshCw className="w-4 h-4 mr-2" />{ar ? "تحديث" : "Refresh"}
          </Button>
          <Button variant="secondary" onClick={() => window.print()}
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20">
            <Printer className="w-4 h-4 mr-2" />{ar ? "طباعة" : "Print"}
          </Button>
          <Button onClick={() => { sessionStorage.setItem("lifeco_plant", plantCode); navigate("/dashboard"); }}
            className="bg-primary/90 hover:bg-primary text-primary-foreground">
            <LayoutDashboard className="w-4 h-4 mr-2" />{ar ? "لوحة التحكم" : "Live Dashboard"}
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center pb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wider">
          {title}
        </h1>
        <div className="mt-2 inline-flex flex-wrap justify-center items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-primary/20 border border-primary/40 text-primary text-xs font-mono tracking-widest">
            {plant?.name || plantCode} • {plantCode}
          </span>
          {dept && (
            <span className="px-3 py-1 rounded-md bg-white/10 border border-white/30 text-white/90 text-xs tracking-widest">
              {dept.label}
            </span>
          )}
        </div>
      </motion.div>

      <div className="flex-1 px-4 pb-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="glass-card p-4">
                <div className="text-muted-foreground text-xs uppercase tracking-widest">
                  {ar ? kpi.labelAr : kpi.label}
                </div>
                <div className="text-2xl font-bold text-primary mt-1">{kpi.value}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="glass-card p-10 flex items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> {ar ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : (
            panels.map((panel) => (
              <section key={panel.title} className="glass-card p-4">
                <h2 className="text-foreground font-semibold mb-3">
                  {ar ? panel.titleAr : panel.title}
                </h2>
                {panel.rows.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                    {ar ? "لا توجد بيانات بعد لهذه الوحدة." : "No records yet for this module."}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                          {panel.columns.map((c) => (
                            <th key={c.key} className="text-left font-medium py-2 pr-4 whitespace-nowrap">{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {panel.rows.slice(0, 25).map((row, i) => (
                          <tr key={i} className="border-t border-white/10">
                            {panel.columns.map((c) => (
                              <td key={c.key} className="py-2 pr-4 text-foreground/90 whitespace-nowrap">
                                {fmt(row[c.key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleWorkspace;
