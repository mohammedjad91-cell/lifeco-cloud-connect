import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getDeptBg } from "@/lib/dept-backgrounds";
import { getDepartmentById } from "@/lib/departments";
import { type PlantModule, getModulesForPlant } from "@/lib/plant-modules";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, LayoutDashboard, FileText, Wrench, Factory, FlaskConical,
  Image as ImageIcon, Video, BookOpen, ClipboardList, Package, Droplets,
  Activity, Gauge, Cog, FileBarChart, History as HistoryIcon, FileSpreadsheet, Layers,
  Files, ShieldCheck, ClipboardCheck, Info,
} from "lucide-react";
import heroPlant from "@/assets/lifeco-hero-1.webp";
import { PlantProcessOverview } from "@/components/maintenance/PlantProcessOverview";
import { NitrogenGenerationProcess } from "@/components/maintenance/NitrogenGenerationProcess";
import { N2PlantPage } from "@/components/maintenance/N2PlantPage";
import { EquipmentDetailView } from "@/components/maintenance/EquipmentDetailView";
import { N2EquipmentRegister } from "@/components/maintenance/N2EquipmentRegister";

interface Plant {
  id: string;
  name: string;
  code: string;
  department_key: string;
}

const ICONS: Record<string, React.ReactNode> = {
  overview: <Factory className="w-6 h-6" />,
  live: <Activity className="w-6 h-6" />,
  operations: <Gauge className="w-6 h-6" />,
  equipment: <Cog className="w-6 h-6" />,
  maintenance: <Wrench className="w-6 h-6" />,
  lab: <FlaskConical className="w-6 h-6" />,
  "lab-readings": <FlaskConical className="w-6 h-6" />,
  "lab-equipment": <Cog className="w-6 h-6" />,
  "chemical-store": <Package className="w-6 h-6" />,
  process: <Layers className="w-6 h-6" />,
  utilities: <Droplets className="w-6 h-6" />,
  documents: <FileText className="w-6 h-6" />,
  reports: <FileBarChart className="w-6 h-6" />,
  spares: <Package className="w-6 h-6" />,
  shutdown: <HistoryIcon className="w-6 h-6" />,
  photos: <ImageIcon className="w-6 h-6" />,
  videos: <Video className="w-6 h-6" />,
  pfd: <Files className="w-6 h-6" />,
  pid: <Files className="w-6 h-6" />,
  sop: <ClipboardList className="w-6 h-6" />,
  manuals: <BookOpen className="w-6 h-6" />,
  datasheets: <FileSpreadsheet className="w-6 h-6" />,
  production: <LayoutDashboard className="w-6 h-6" />,
  drawings: <Files className="w-6 h-6" />,
  water: <Droplets className="w-6 h-6" />,
  "ops-logs": <ClipboardList className="w-6 h-6" />,
  "ops-fieldops": <Gauge className="w-6 h-6" />,
  "ops-maintenance": <Wrench className="w-6 h-6" />,
  "ops-report": <FileBarChart className="w-6 h-6" />,
  "ops-ots": <Activity className="w-6 h-6" />,
  "ops-analytics": <LayoutDashboard className="w-6 h-6" />,
  permits: <ClipboardCheck className="w-6 h-6" />,
  safety: <ShieldCheck className="w-6 h-6" />,
  history: <HistoryIcon className="w-6 h-6" />,
};

const SIMPLE_MODULES: PlantModule[] = [
  { key: "ops-logs", label: "Operations & Records", labelAr: "السجلات والتشغيل" },
  { key: "lab-readings", label: "Lab Readings", labelAr: "قراءات المعمل" },
  { key: "work-permit", label: "Work Permit", labelAr: "تصريح عمل" },
  { key: "electrical-permit", label: "Electrical Permit", labelAr: "تصريح كهرباء" },
  { key: "work-request", label: "Work Request", labelAr: "طلب عمل" },
  { key: "maintenance", label: "Maintenance Hub", labelAr: "مركز الصيانة (المعدات)" },
  { key: "form-history", label: "Forms History", labelAr: "سجل النماذج" },
  { key: "general-info", label: "General Information", labelAr: "المعلومات العامة" },
];

const PlantModules = ({ plantCode }: { plantCode: string }) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showEquipmentRegister, setShowEquipmentRegister] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("plants").select("*").eq("code", plantCode).maybeSingle();
      if (data) {
        setPlant(data as Plant);
        setBg(getDeptBg((data as Plant).department_key));
      }
    })();
  }, [plantCode]);

  useEffect(() => {
    const handler = () => plant && setBg(getDeptBg(plant.department_key));
    const eqHandler = () => setShowEquipmentRegister(true);
    window.addEventListener("lifeco:bg-changed", handler);
    window.addEventListener("lifeco:open-equipment", eqHandler);
    return () => {
      window.removeEventListener("lifeco:bg-changed", handler);
      window.removeEventListener("lifeco:open-equipment", eqHandler);
    };
  }, [plant]);

  const dept = plant ? getDepartmentById(plant.department_key) : null;
  const bgImage = bg || heroPlant;
  const OPS_DEPTS = ["AMMONIA", "UREA"];
  const deptKey = plant?.department_key || "";
  
  const modules = OPS_DEPTS.includes(deptKey) ? SIMPLE_MODULES : [];

  const openModule = (m: PlantModule) => {
    const key = m.key.toLowerCase();
    const departmentKey = plant?.department_key || "AMMONIA";

    sessionStorage.setItem("lifeco_plant", plantCode);
    sessionStorage.setItem("lifeco_dept", departmentKey);
    sessionStorage.setItem("lifeco_module", m.key);
    sessionStorage.setItem("lifeco_module_label", m.labelAr || m.label);

    if (key === "ops-logs" && plantCode === "N2-1") {
      // In N2-1, we open a specialized dashboard view where we can also see the equipment button.
      sessionStorage.setItem("lifeco_dashboard_tab", "logs");
      navigate("/dashboard");
      return;
    }

    const plantWorkspaces: Record<string, string> = {
      "work-permit": "work-permit",
      "electrical-permit": "electrical-work-permit",
      "work-request": "work-request",
      "maintenance": "maintenance",
      "form-history": "form-history",
    };

    if (plantWorkspaces[key]) {
      navigate(`/module/${plantCode}/${plantWorkspaces[key]}`);
      return;
    }

    if (key === "general-info") {
      navigate("/overview");
      return;
    }

    const dashboardTabs: Record<string, string> = {
      "ops-logs": "logs",
      "lab-readings": "labReadings",
    };

    if (dashboardTabs[key]) {
      sessionStorage.setItem("lifeco_dashboard_tab", dashboardTabs[key]);
      navigate("/dashboard");
      return;
    }

    navigate(`/module/${plantCode}/${encodeURIComponent(m.key)}`);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background/80" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 py-4">
        <Button
          variant="secondary"
          onClick={() => plant ? navigate(`/dept/${plant.department_key}`) : navigate("/")}
          className="bg-white/10 border border-white/30 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {lang === "ar" ? "رجوع" : "Back"}
        </Button>
        <Button
          onClick={() => { sessionStorage.setItem("lifeco_plant", plantCode); navigate("/dashboard"); }}
          className="bg-primary/90 hover:bg-primary text-primary-foreground"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          {lang === "ar" ? "لوحة التحكم" : "Live Dashboard"}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center pt-2 pb-6 relative z-10"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wider">
          {plant?.name || plantCode}
        </h1>
        <div className="mt-2 inline-flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-primary/20 border border-primary/40 text-primary text-xs font-mono tracking-widest">
            {lang === "ar" ? "رمز:" : "Code:"} {plantCode}
          </span>
          {dept && (
            <span className="px-3 py-1 rounded-md bg-white/10 border border-white/30 text-white/90 text-xs tracking-widest">
              {lang === "ar" ? dept.labelAr || dept.label : dept.label}
            </span>
          )}
        </div>
      </motion.div>

      <div className="flex-1 px-4 pb-10 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m, i) => (
                <motion.button
                  key={m.key}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openModule(m)}
                  className="glass-card p-6 text-left hover:neon-border transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/20">
                      {ICONS[m.key] || <FileText className="w-7 h-7" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-foreground font-bold text-lg leading-tight">
                        {lang === "ar" ? m.labelAr || m.label : m.label}
                      </div>
                      <div className="text-muted-foreground text-xs mt-1" dir={lang === "ar" ? "ltr" : "rtl"}>
                        {lang === "ar" ? m.label : m.labelAr}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            {modules.length === 0 && (
              <div className="glass-card p-6 text-center text-muted-foreground">
                {lang === "ar"
                  ? "لا توجد خانات متاحة لهذا المصنع"
                  : "No modules available for this plant"}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showEquipmentRegister && plantCode === "N2-1" && (
              <N2EquipmentRegister 
                plantCode={plantCode} 
                lang={lang as any} 
                onSelectEquipment={(tag) => setSelectedTag(tag)}
                onClose={() => setShowEquipmentRegister(false)}
              />
            )}
            {selectedTag && (
              <EquipmentDetailView 
                tag={selectedTag} 
                plantCode={plantCode} 
                lang={lang as any} 
                onClose={() => setSelectedTag(null)} 
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PlantModules;
