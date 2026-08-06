import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getDeptBg } from "@/lib/dept-backgrounds";
import { getDepartmentById } from "@/lib/departments";
import { type PlantModule } from "@/lib/plant-modules";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, LayoutDashboard, FileText, Wrench, Factory, FlaskConical,
  Image as ImageIcon, Video, BookOpen, ClipboardList, Package, Droplets,
  Activity, Gauge, Cog, FileBarChart, History, FileSpreadsheet, Layers,
  Files,
} from "lucide-react";
import heroPlant from "@/assets/lifeco-hero-1.webp";


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
  shutdown: <History className="w-6 h-6" />,
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
};


const SIMPLE_MODULES: PlantModule[] = [
  { key: "ops-logs", label: "Operations & Records", labelAr: "السجلات والتشغيل" },
  { key: "lab-readings", label: "Lab Readings", labelAr: "قراءات المعمل" },
  { key: "work-permit", label: "Work Permit", labelAr: "تصريح عمل" },
  { key: "electrical-permit", label: "Electrical Permit", labelAr: "تصريح كهرباء" },
  { key: "scaffolding-permit", label: "Scaffolding Permit", labelAr: "تصريح سقالات" },
  { key: "safety-valve-permit", label: "Safety Valve Permit", labelAr: "تصريح صمام أمان" },
  { key: "work-request", label: "Work Request", labelAr: "طلب عمل" },
  { key: "form-history", label: "Forms History", labelAr: "سجل النماذج" },
  { key: "general-info", label: "General Information", labelAr: "المعلومات العامة" },
];

const OPS_TAB: Record<string, string> = {
  "ops-logs": "logs",
  "ops-fieldops": "fieldOps",
  "ops-maintenance": "assets",
  "ops-report": "report",
  "ops-ots": "ots",
  "ops-analytics": "analytics",
};


// خانات خاصة بإدارة المعمل فقط
const LAB_MODULES: PlantModule[] = [
  { key: "lab", label: "Samples & Results", labelAr: "العينات والنتائج" },
  { key: "lab-reports", label: "Laboratory Reports", labelAr: "تقارير المعمل" },
];

// معمل الأمونيا / معمل اليوريا — يفتح مباشرة على العينات والنتائج الخاصة بالإدارة
const LAB_AMM_MODULES: PlantModule[] = [
  { key: "lab-dept-ammonia", label: "Ammonia Samples & Results", labelAr: "عينات ونتائج الأمونيا" },
];
const LAB_UREA_MODULES: PlantModule[] = [
  { key: "lab-dept-urea", label: "Urea Samples & Results", labelAr: "عينات ونتائج اليوريا" },
];

// معدات المختبر (المعدات المستخدمة داخل المعمل فقط)
const LAB_EQUIPMENT_MODULES: PlantModule[] = [
  { key: "lab-equipment", label: "Laboratory Equipment", labelAr: "معدات المختبر" },
];

// المخزن الكيميائي (قائمة تخزين المواد)
const LAB_CHEM_MODULES: PlantModule[] = [
  { key: "chemical-store", label: "Chemical Store", labelAr: "المخزن الكيميائي" },
];






const PlantModules = ({ plantCode }: { plantCode: string }) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [bg, setBg] = useState<string | null>(null);

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
    window.addEventListener("lifeco:bg-changed", handler);
    return () => window.removeEventListener("lifeco:bg-changed", handler);
  }, [plant]);

  const dept = plant ? getDepartmentById(plant.department_key) : null;
  const bgImage = bg || heroPlant;
  // خانة التشغيل متاحة فقط لمصانع الأمونيا واليوريا (والمعمل له خاناته)
  const OPS_DEPTS = ["AMMONIA", "UREA"];
  const deptKey = plant?.department_key || "";
  const modules =
    deptKey === "LAB"
      ? plantCode === "LAB-EQ"
        ? LAB_EQUIPMENT_MODULES
        : plantCode === "LAB-CHEM"
          ? LAB_CHEM_MODULES
          : plantCode === "LAB-AMM"
            ? LAB_AMM_MODULES
            : plantCode === "LAB-UREA"
              ? LAB_UREA_MODULES
              : LAB_MODULES
      : OPS_DEPTS.includes(deptKey)
        ? SIMPLE_MODULES
        : [];



  const openModule = (m: PlantModule) => {
    const key = m.key.toLowerCase();
    const name = m.label.toLowerCase();
    const text = `${key} ${name}`;
    const departmentKey = plant?.department_key || sessionStorage.getItem("lifeco_dept") || "AMMONIA";

    sessionStorage.setItem("lifeco_plant", plantCode);
    sessionStorage.setItem("lifeco_dept", departmentKey);
    sessionStorage.setItem("lifeco_module", m.key);
    sessionStorage.setItem("lifeco_module_label", m.labelAr || m.label);

    // Unified view for Operations, Logs, Records, and Maintenance
    if (key === "ops-logs") {
      // Default to logs tab but keep navigation bar hidden in Dashboard
      sessionStorage.setItem("lifeco_dashboard_tab", "logs");
      navigate("/dashboard");
      return;
    }

    if (key === "general-info") {
      navigate("/overview");
      return;
    }

    // تقارير مشرف المعمل (إدارة المختبر فقط)
    if (key === "lab-reports") {
      navigate("/lab-reports");
      return;
    }

    // معمل الأمونيا / معمل اليوريا — يفتح مباشرة على العينات والنتائج الخاصة بالإدارة
const LAB_AMM_MODULES: PlantModule[] = [
  { key: "lab-dept-ammonia", label: "Ammonia Samples & Results", labelAr: "عينات ونتائج الأمونيا" },
];
const LAB_UREA_MODULES: PlantModule[] = [
  { key: "lab-dept-urea", label: "Urea Samples & Results", labelAr: "عينات ونتائج اليوريا" },
];

// معدات المختبر
    if (key === "lab-equipment") {
      navigate("/lab-equipment");
      return;
    }

    // المخزن الكيميائي
    if (key === "chemical-store") {
      navigate("/chemical-store");
      return;
    }




    // المعمل → شاشة المعمل مع القراءات
    if (key === "lab") {
      sessionStorage.setItem("lifeco_lab_tab", "samples");
      sessionStorage.removeItem("lifeco_lab_plant");
      sessionStorage.removeItem("lifeco_lab_dept");
      navigate("/lab");
      return;
    }

    // قراءات المعمل الخاصة بهذا المصنع
    if (key === "lab-readings") {
      sessionStorage.setItem("lifeco_lab_tab", "samples");
      sessionStorage.setItem("lifeco_lab_plant", plantCode);
      sessionStorage.removeItem("lifeco_lab_dept");
      navigate("/lab");
      return;
    }





    if (text.includes("sample") || text.includes("analysis") || text.includes("laboratory") || m.route?.startsWith("/lab")) {
      sessionStorage.setItem("lifeco_lab_tab", text.includes("sample") || text.includes("analysis") ? "samples" : "classic");
      navigate("/lab");
      return;
    }


    if (
      text.includes("document") || text.includes("manual") || text.includes("drawing") ||
      text.includes("archive") || text.includes("library") || text.includes("photo") ||
      text.includes("video") || text.includes("certificate") || text.includes("datasheet") ||
      text.includes("procedure") || text.includes("standard") || text.includes("msds") ||
      key === "sop" || key === "pfd" || key === "pid" || key === "pdf"
    ) {
      sessionStorage.setItem("lifeco_library_category", key);
      navigate("/digital-library");
      return;
    }

    if (text.includes("report") || text.includes("analytics") || key === "bi") {
      navigate("/bi");
      return;
    }

    if (departmentKey === "SAFETY" || key.startsWith("hse")) {
      navigate("/hse-center");
      return;
    }

    // مركز الصيانة يُفتح فقط للوحدات الخاصة بسجل المعدات/بطاقات المعدات/أوامر العمل
    if (
      key === "maintenance" || key === "cmms" || text.includes("passport") ||
      text.includes("work order") || text.includes("أوامر العمل") ||
      (text.includes("maintenance") && (text.includes("asset") || text.includes("equipment") || text.includes("command")))
    ) {
      navigate("/mnt-command");
      return;
    }

    if (text.includes("equipment register") || key === "equipment" || key === "assets") {
      sessionStorage.setItem("lifeco_dashboard_tab", "assets");
      navigate("/dashboard");
      return;
    }


    if (m.route) {
      navigate(m.route.split("#")[0]);
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
      </div>

    </div>
  );
};

export default PlantModules;
