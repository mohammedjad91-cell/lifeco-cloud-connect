import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@/lib/router-compat";
import { 
  FlaskConical, ArrowLeft, Globe, LogOut, Loader2,
  Settings, Database, ClipboardList, Beaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

// New Components
import LabManagementDashboard from "@/components/lab/LabManagementDashboard";
import SampleManagementScreen from "@/components/lab/SampleManagementScreen";
import SampleEntryForm from "@/components/lab/SampleEntryForm";
import SampleDetailPage from "@/components/lab/SampleDetailPage";
import AmmoniaLab from "@/components/lab/AmmoniaLab";

const LabDashboard = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();

  // Navigation State
  const [currentView, setCurrentView] = useState<"DEPT_SELECT" | "AMMONIA_DASHBOARD" | "SAMPLE_LIST" | "ADD_SAMPLE" | "SAMPLE_DETAIL" | "AMMONIA_LAB_NEW">("DEPT_SELECT");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedSampleId, setSelectedSampleId] = useState<string>("");

  // Handle browser back button or escape via reset
  const handleBack = () => {
    if (currentView === "SAMPLE_DETAIL") setCurrentView("SAMPLE_LIST");
    else if (currentView === "ADD_SAMPLE") setCurrentView("SAMPLE_LIST");
    else if (currentView === "SAMPLE_LIST") setCurrentView("AMMONIA_DASHBOARD");
    else if (currentView === "AMMONIA_DASHBOARD") setCurrentView("DEPT_SELECT");
    else if (currentView === "AMMONIA_LAB_NEW") setCurrentView("DEPT_SELECT");
    else navigate("/");
  };

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
              {currentView !== "DEPT_SELECT" && (
                 <span className="opacity-60">
                   {lang === "ar" ? " — مختبرات الأمونيا" : " — Ammonia Laboratories"}
                 </span>
              )}
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
          key={currentView + selectedSource}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentView === "DEPT_SELECT" && (
            <div className="space-y-8 pt-10">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-3xl font-bold">{lang === "ar" ? "نظام إدارة المختبرات المتكامل" : "Integrated Lab Management System"}</h2>
                <p className="text-muted-foreground">{lang === "ar" ? "اختر القسم لبدء إدارة العينات والتحاليل المخبرية" : "Select a department to start managing samples and laboratory analysis"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <button 
                  onClick={() => setCurrentView("AMMONIA_LAB_NEW")} 
                  className="glass-card p-12 text-center hover:neon-border transition-all group relative overflow-hidden border-primary/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FlaskConical className="w-20 h-20 mx-auto mb-6 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold mb-2">Ammonia Laboratories</h3>
                  <p className="text-lg text-muted-foreground">مختبرات الأمونيا</p>
                </button>
                <button 
                  className="glass-card p-12 text-center opacity-60 cursor-not-allowed group relative overflow-hidden grayscale"
                >
                  <Beaker className="w-20 h-20 mx-auto mb-6 text-emerald-500" />
                  <h3 className="text-2xl font-bold mb-2">Urea Laboratories</h3>
                  <p className="text-lg text-muted-foreground">مختبرات اليوريا</p>
                  <div className="absolute top-4 right-4 rotate-12">
                     <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-1 rounded">COMING SOON</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentView === "AMMONIA_LAB_NEW" && (
            <AmmoniaLab onBack={() => setCurrentView("DEPT_SELECT")} />
          )}

          {currentView === "AMMONIA_DASHBOARD" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{lang === "ar" ? "لوحة تحكم مختبرات الأمونيا" : "Ammonia Laboratories Dashboard"}</h2>
                  <p className="text-muted-foreground">{lang === "ar" ? "اختر مصدر العينة للمتابعة" : "Select a sample source to proceed"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2"><Settings className="w-4 h-4" /> {lang === "ar" ? "الإعدادات" : "Settings"}</Button>
                  <Button variant="outline" className="gap-2"><Database className="w-4 h-4" /> {lang === "ar" ? "الأرشيف" : "Archives"}</Button>
                </div>
              </div>
              <LabManagementDashboard onSelectSource={(source) => {
                setSelectedSource(source);
                setCurrentView("SAMPLE_LIST");
              }} />
            </div>
          )}

          {currentView === "SAMPLE_LIST" && (
            <SampleManagementScreen 
              sourceId={selectedSource} 
              onAddSample={() => setCurrentView("ADD_SAMPLE")}
              onViewSample={(id) => {
                setSelectedSampleId(id);
                setCurrentView("SAMPLE_DETAIL");
              }}
            />
          )}

          {currentView === "ADD_SAMPLE" && (
            <SampleEntryForm 
              sourceId={selectedSource} 
              onCancel={() => setCurrentView("SAMPLE_LIST")}
              onSuccess={() => setCurrentView("SAMPLE_LIST")}
            />
          )}

          {currentView === "SAMPLE_DETAIL" && (
            <SampleDetailPage 
              sampleId={selectedSampleId} 
              onBack={() => setCurrentView("SAMPLE_LIST")}
            />
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default LabDashboard;
