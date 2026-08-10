import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { DEPARTMENTS } from "@/lib/departments";
import { Globe, Factory, FlaskConical, Gauge, Wrench, PackageOpen, Beaker, Flame, Settings, BarChart3, Network, Presentation } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import lifecoLogo from "@/assets/lifeco-logo.png";
import heroPlant from "@/assets/lifeco-hero-1.webp";

const DEPT_ICONS: Record<string, React.ReactNode> = {
  AMMONIA: <Flame className="w-8 h-8" />,
  UREA: <Beaker className="w-8 h-8" />,
  LAB: <FlaskConical className="w-8 h-8" />,
  MAINTENANCE: <Wrench className="w-8 h-8" />,
  WAREHOUSE: <PackageOpen className="w-8 h-8" />,
};

const Login = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();

  const goToDept = (deptId: string) => {
    sessionStorage.setItem("lifeco_dept", deptId);
    navigate(`/dept/${deptId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Unified Action Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:neon-border transition-all shadow-lg backdrop-blur-md"
            title={lang === "ar" ? "إعدادات المنظومة" : "System Settings"}
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold text-xs md:text-sm tracking-wide">{lang === "ar" ? "الإعدادات" : "Admin"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/bi")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:neon-border transition-all shadow-lg backdrop-blur-md"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold text-xs md:text-sm tracking-wide">{lang === "ar" ? "لوحة التحكم" : "Live BI"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/hierarchy")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:neon-border transition-all shadow-lg backdrop-blur-md"
          >
            <Network className="w-5 h-5" />
            <span className="font-semibold text-xs md:text-sm tracking-wide">{lang === "ar" ? "الهيكل" : "Hierarchy"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/overview")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:neon-border transition-all shadow-lg backdrop-blur-md"
          >
            <Gauge className="w-5 h-5" />
            <span className="font-semibold text-xs md:text-sm tracking-wide">
              {lang === "ar" ? "تقارير المشرفين" : "Supervisor Reports"}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/presentation")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/20 border border-primary/40 text-white hover:bg-primary/30 hover:neon-border transition-all shadow-lg backdrop-blur-md"
            title={lang === "ar" ? "عرض مجلس الإدارة" : "Board Presentation"}
          >
            <Presentation className="w-5 h-5 text-primary" />
            <span className="font-semibold text-xs md:text-sm tracking-wide">
              {lang === "ar" ? "عرض الإدارة" : "Presentation"}
            </span>
          </motion.button>
        </div>

        {/* Removed language selector button as requested */}
      </div>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img src={heroPlant} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/60" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-6 pb-3 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            LIFE<span className="text-[#F5B800]">O</span>
          </span>
          <div className="flex flex-col items-start border-l-2 border-white pl-4 text-white">
            <span className="text-xl font-bold tracking-normal drop-shadow-md">الشركة الليبية للأسمدة</span>
            <span className="text-xs font-medium uppercase tracking-widest opacity-90">Libyan Fertilizer Company</span>
          </div>
        </div>
        <p className="text-white/90 mt-1 text-xs tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          {t.opsLoggingSystem}
        </p>
        <p className="text-white/85 mt-2 text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          {lang === "ar" ? "إعداد: المهندس محمد جاد الله" : "Prepared by Eng. Mohamed Gadalla"}
        </p>
      </motion.div>

      {/* Department Grid — direct navigation, no PIN */}
      <div className="flex-1 flex items-start justify-center px-4 pb-4 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {DEPARTMENTS.map((dept, i) => (
              <motion.button
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => goToDept(dept.id)}
                className="glass-card p-4 md:p-6 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden hover:neon-border"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dept.color || "from-primary/10 to-primary/5"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="mx-auto mb-3 w-14 h-14 rounded-xl flex items-center justify-center transition-colors text-muted-foreground group-hover:text-primary">
                    {DEPT_ICONS[dept.id] || <Gauge className="w-8 h-8" />}
                  </div>
                  <h3 className="font-semibold text-sm md:text-base tracking-wide transition-colors text-foreground group-hover:text-primary">
                    {lang === "ar" ? dept.labelAr || dept.label : dept.label}
                  </h3>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
