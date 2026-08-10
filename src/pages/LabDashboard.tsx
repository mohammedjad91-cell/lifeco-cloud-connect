import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@/lib/router-compat";
import { 
  FlaskConical, ArrowLeft, Globe, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import AmmoniaLab from "@/components/lab/AmmoniaLab";

const LabDashboard = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  
  // Initialize view based on session storage
  const [view, setView] = useState<"DEPT_SELECT" | "AMMONIA_LAB">(
    sessionStorage.getItem("lifeco_lab_plant") ? "AMMONIA_LAB" : "DEPT_SELECT"
  );

  const handleBack = () => {
    if (view === "AMMONIA_LAB") {
      sessionStorage.removeItem("lifeco_lab_plant");
      setView("DEPT_SELECT");
    } else {
      navigate("/");
    }
  };

  const preSelected = sessionStorage.getItem("lifeco_lab_plant");

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="border-b border-border px-6 py-4 flex items-center justify-between glass-card rounded-none sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground">
            <ArrowLeft className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
          </Button>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold neon-text tracking-wider">{t.lifecoDigital}</h1>
            <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1">
              {lang === "ar" ? "إدارة المختبرات" : "LABORATORY MANAGEMENT"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="gap-1.5 h-9">
            <Globe className="w-4 h-4" /> {t.language}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5 text-muted-foreground h-9">
            <LogOut className="w-4 h-4" /> {t.exit}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {view === "DEPT_SELECT" && (
            <div className="space-y-12 pt-10">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">
                  {lang === "ar" ? "نظام إدارة المختبرات" : "Laboratory Management System"}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {lang === "ar" ? "اختر مختبر المصنع لبدء تسجيل عينات التحاليل" : "Select a plant laboratory to begin analytical sampling."}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <motion.button 
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  onClick={() => setView("AMMONIA_LAB")} 
                  className="glass-card p-16 text-center hover:neon-border transition-all group relative overflow-hidden border-primary/40 shadow-2xl shadow-primary/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FlaskConical className="w-24 h-24 mx-auto mb-8 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="text-3xl font-bold mb-3 tracking-wide">Ammonia Laboratories</h3>
                  <p className="text-xl text-muted-foreground">مختبرات الأمونيا</p>
                  <div className="mt-6 flex justify-center">
                    <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30 uppercase tracking-widest">Active System</span>
                  </div>
                </motion.button>

                <div className="glass-card p-16 text-center opacity-40 cursor-not-allowed group relative overflow-hidden grayscale">
                  <FlaskConical className="w-24 h-24 mx-auto mb-8 text-muted-foreground" />
                  <h3 className="text-3xl font-bold mb-3 tracking-wide">Urea Laboratories</h3>
                  <p className="text-xl text-muted-foreground">مختبرات اليوريا</p>
                  <div className="mt-6 flex justify-center">
                    <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full border border-border uppercase tracking-widest">In Development</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "AMMONIA_LAB" && (
            <AmmoniaLab 
              onBack={handleBack} 
              preSelectedPlant={preSelected} 
            />
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default LabDashboard;