import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { getDepartmentById } from "@/lib/departments";
import { supabase } from "@/integrations/supabase/client";
import { getDeptBg } from "@/lib/dept-backgrounds";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Factory, LayoutDashboard, Plus } from "lucide-react";
import heroPlant from "@/assets/lifeco-hero-1.webp";

interface Plant {
  id: string;
  name: string;
  code: string;
  department_key: string;
}

const DepartmentPlants = ({ deptId }: { deptId: string }) => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const department = getDepartmentById(deptId);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [bg, setBg] = useState<string | null>(null);

  useEffect(() => {
    if (!department) {
      navigate("/");
      return;
    }
    setBg(getDeptBg(department.id));
    const handler = () => setBg(getDeptBg(department.id));
    window.addEventListener("lifeco:bg-changed", handler);
    return () => window.removeEventListener("lifeco:bg-changed", handler);
  }, [department, navigate]);

  useEffect(() => {
    if (!department) return;
    (async () => {
      const { data } = await supabase
        .from("plants")
        .select("*")
        .eq("department_key", department.id)
        .order("code", { ascending: true });
      setPlants((data as Plant[]) || []);
      setLoading(false);
    })();
  }, [department]);

  if (!department) return null;
  const bgImage = bg || heroPlant;

  const openDashboard = () => {
    sessionStorage.setItem("lifeco_dept", department.id);
    navigate(department.id === "LAB" ? "/lab" : "/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background — same style as main screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/70" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/")}
          className="bg-white/10 border border-white/30 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {lang === "ar" ? "الرئيسية" : "Home"}
        </Button>
        <Button
          onClick={openDashboard}
          className="bg-primary/90 hover:bg-primary text-primary-foreground"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
        </Button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-4 pb-6 relative z-10"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wider">
          {department.label}
        </h1>
        <p className="text-white/85 mt-2 text-sm tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          {lang === "ar" ? "مصانع الإدارة" : "Department Plants"}
        </p>
      </motion.div>

      {/* Plants grid */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10 relative z-10">
        <div className="w-full max-w-5xl">
          {loading ? (
            <p className="text-center text-white/70">
              {lang === "ar" ? "جارِ التحميل..." : "Loading..."}
            </p>
          ) : plants.length === 0 ? (
            <div className="glass-card p-8 text-center max-w-md mx-auto">
              <Factory className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">
                {lang === "ar" ? "لا توجد مصانع مسجلة" : "No plants registered"}
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                {lang === "ar"
                  ? "أضف المصانع من صفحة الهيكل"
                  : "Add plants from the Hierarchy page"}
              </p>
              <Button onClick={() => navigate("/hierarchy")}>
                <Plus className="w-4 h-4 mr-2" />
                {lang === "ar" ? "إضافة مصنع" : "Add plant"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {plants.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={openDashboard}
                  className="glass-card p-5 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden hover:neon-border"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      department.color || "from-primary/10 to-primary/5"
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <div className="relative z-10">
                    <div className="mx-auto mb-3 w-14 h-14 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Factory className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-base tracking-wide text-foreground group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30">
                      <span className="text-[11px] uppercase tracking-widest text-primary font-mono">
                        {lang === "ar" ? "رمز:" : "Code:"} {p.code}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentPlants;
