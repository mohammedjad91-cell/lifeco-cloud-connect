import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { DEPARTMENTS } from "@/lib/departments";
import { Globe, Factory, FlaskConical, Gauge, Wrench, PackageOpen, Beaker, Flame, Settings, BarChart3, Network } from "lucide-react";
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
      {/* Language Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setLang(lang === "en" ? "ar" : "en")}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm"
      >
        <Globe className="w-4 h-4" />
        {t.language}
      </motion.button>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        transition={{ type: "spring", stiffness: 200 }}
        onClick={() => navigate("/admin")}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
        title={lang === "ar" ? "إعدادات المنظومة" : "System Settings"}
      >
        <Settings className="w-5 h-5" />
        <span className="font-semibold text-sm md:text-base tracking-wide">{lang === "ar" ? "الإعدادات" : "Admin"}</span>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200 }}
        onClick={() => navigate("/bi")}
        className="absolute top-4 left-32 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
      >
        <BarChart3 className="w-5 h-5" />
        <span className="font-semibold text-sm md:text-base tracking-wide">{lang === "ar" ? "لوحة التحكم" : "Live BI"}</span>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200 }}
        onClick={() => navigate("/hierarchy")}
        className="absolute top-4 left-60 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
      >
        <Network className="w-5 h-5" />
        <span className="font-semibold text-sm md:text-base tracking-wide">{lang === "ar" ? "الهيكل" : "Hierarchy"}</span>
      </motion.button>

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
        <motion.img
          src={lifecoLogo}
          alt="LIFECO PMS 2026"
          className="mx-auto mb-3 drop-shadow-2xl"
          width={100}
          height={100}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        />
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wider">
          {t.lifecoDigital}
        </h1>
        <p className="text-white/90 mt-1 text-xs tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          {t.opsLoggingSystem}
        </p>
        <p className="text-white/85 mt-2 text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          Prepared by Eng. Mohamed Gadalla
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
