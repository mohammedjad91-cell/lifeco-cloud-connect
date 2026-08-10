import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { getBackTarget } from "@/lib/nav-back";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  LogOut, FlaskConical, Clock, Loader2, Save, FileDown, 
  FileSpreadsheet, Share2, ShieldCheck, Factory, Beaker
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { AnalystVerificationModal } from "@/components/lab/AnalystVerificationModal";
import { exportLabToExcel } from "@/utils/lab-excel";
import { generateLabPdf, shareLabPdf } from "@/utils/lab-pdf-advanced";

// --- 5 ACTIVE PLANTS ---
const AMMONIA_LAB_PLANTS = [
  { id: "AMM1", name: "Ammonia Plant 1", nameAr: "مصنع الأمونيا الأول", icon: <Factory className="w-5 h-5" /> },
  { id: "AMM2", name: "Ammonia Plant 2", nameAr: "مصنع الأمونيا الثاني", icon: <Factory className="w-5 h-5" /> },
  { id: "NITROGEN", name: "Nitrogen Plant", nameAr: "مصنع النيتروجين", icon: <Beaker className="w-5 h-5" /> },
  { id: "DEMIN1", name: "Demin Water Plant 1", nameAr: "مصنع الدمن الأول", icon: <FlaskConical className="w-5 h-5" /> },
  { id: "DEMIN2", name: "Demin Water Plant 2", nameAr: "مصنع الدمن الثاني", icon: <FlaskConical className="w-5 h-5" /> }
];

// --- NITROGEN DUMMY DATA ---
const N2_DEFAULTS = {
  daily: {
    "Oxygen Content in N2 (60-AL-003)": "3.2",
    "Nitrogen Purity %": "99.98",
    "Main N2 Dew Point (60-AT-001 / 60-AI-001)": "-48.5",
    "Instrument Air Dew Point & Moisture Check": "Normal"
  },
  weekly: {
    "Cooling Water pH": "7.8",
    "Cooling Water Conductivity (µS/cm)": "420",
    "Boiler Feed Condensate Silica & Hardness (ppm)": "0.02",
    "Air Dryer & Filter Condensate Oil Carryover": "Pass"
  }
};

const LabDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { lang } = useI18n();
  
  // Auth & Access
  const [isVerified, setIsVerified] = useState(false);
  const [analyst, setAnalyst] = useState({ name: "", badge: "" });
  
  // Selection
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [sampleType, setSampleType] = useState<"daily" | "weekly">("daily");
  
  // Data Entry
  const [readings, setReadings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const savedName = sessionStorage.getItem("lifeco_analyst_name");
    const savedBadge = sessionStorage.getItem("lifeco_analyst_badge");
    if (savedName && savedBadge) {
      setAnalyst({ name: savedName, badge: savedBadge });
      setIsVerified(true);
    }
  }, []);

  useEffect(() => {
    if (selectedPlant === "NITROGEN") {
      setReadings(N2_DEFAULTS[sampleType]);
    } else if (selectedPlant === "AMM1" || selectedPlant === "AMM2") {
      // Mock data for Ammonia Plants
      setReadings({
        "NH3 Concentration": selectedPlant === "AMM1" ? "99.8" : "99.7",
        "H2 Content": "74.5",
        "N2 Content": "24.8",
        "CH4 Content": "0.5",
        "CO + CO2": "0.1",
        "Dew Point": "-45.0"
      });
    } else if (selectedPlant === "DEMIN1" || selectedPlant === "DEMIN2") {
      setReadings({
        "pH": "7.2",
        "Conductivity": "0.1",
        "Silica": "0.01",
        "Hardness": "0.0"
      });
    } else {
      setReadings({});
    }
  }, [selectedPlant, sampleType]);

  const handleVerified = (name: string, badge: string) => {
    setAnalyst({ name, badge });
    setIsVerified(true);
  };

  const handleSave = async () => {
    if (!selectedPlant) return;
    setIsSaving(true);
    
    try {
      // 1. Save to Central Database (lab_results table)
      const timestamp = new Date().toISOString();
      const insertRows = Object.entries(readings).map(([param, val]) => ({
        plant: selectedPlant,
        sample_type: sampleType,
        parameter_name: param,
        value: parseFloat(val) || 0,
        technician_name: analyst.name,
        employee_id: analyst.badge,
        timestamp: timestamp
      }));

      const { error: labError } = await supabase.from("lab_results").insert(insertRows);
      if (labError) throw labError;

      // 2. Sync to Operations (operations_logs)
      const opsRows = Object.entries(readings).map(([param, val]) => ({
        department: selectedPlant,
        unit_tag: `LAB|${param}`,
        value: parseFloat(val) || 0,
        employee_id: analyst.badge,
        timestamp: timestamp
      }));

      const { error: opsError } = await supabase.from("operations_logs").insert(opsRows);
      if (opsError) throw opsError;

      toast({ title: lang === "ar" ? "تم الحفظ والمزامنة" : "Saved & Synced Successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportExcel = () => {
    if (!selectedPlant) return;
    exportLabToExcel({
      plant: selectedPlant,
      sampleType,
      analyst: analyst.name,
      badge: analyst.badge,
      readings,
      timestamp: new Date().toISOString()
    });
  };

  const handleExportPdf = async (share = false) => {
    if (!selectedPlant) return;
    const doc = await generateLabPdf({
      plant: selectedPlant,
      sampleType,
      analyst: analyst.name,
      badge: analyst.badge,
      readings,
      timestamp: new Date().toISOString()
    });
    
    if (share) {
      await shareLabPdf(doc, `LIFECO_LAB_${selectedPlant}.pdf`);
    } else {
      doc.save(`LIFECO_LAB_${selectedPlant}.pdf`);
    }
  };

  if (!isVerified) {
    return <AnalystVerificationModal isOpen={true} onVerified={handleVerified} />;
  }

  return (
    <div className="min-h-screen bg-[#050b18] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 p-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">{lang === "ar" ? "مركز قيادة المختبرات" : "Laboratory Command Center"}</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              {lang === "ar" ? "المحلل المعتمد" : "Verified Analyst"}: {analyst.name} ({analyst.badge})
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="bg-white/10 border border-white/30 text-white hover:bg-white/20" 
             onClick={() => {
               // If we have a specific plant context, go back to its modules. 
               // Otherwise go to the LAB department screen.
               const plant = sessionStorage.getItem("lifeco_plant");
               if (plant) {
                 navigate(`/modules/${plant}`);
               } else {
                 navigate("/dept/LAB");
               }
             }}
           >
             <LogOut className="w-4 h-4 mr-2" /> {lang === "ar" ? "رجوع" : "Back"}
           </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        
        {/* Plant Selector */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">{lang === "ar" ? "اختر المصنع التشغيلي" : "Select Operational Plant"}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {AMMONIA_LAB_PLANTS.map(p => (
              <motion.button
                key={p.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlant(p.id)}
                className={`p-6 rounded-xl border transition-all flex flex-col items-center gap-4 text-center ${
                  selectedPlant === p.id 
                  ? "bg-primary/20 border-primary shadow-[0_0_25px_rgba(59,130,246,0.2)]" 
                  : "bg-slate-900/40 border-white/5 hover:border-white/20"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                  selectedPlant === p.id ? "border-primary bg-primary/20" : "border-white/10 bg-white/5"
                }`}>
                  {p.icon}
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-tighter">{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold mt-1" dir="rtl">{p.nameAr}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {selectedPlant && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* Form Header / Actions */}
            <div className="glass-card p-6 border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <Clock className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">{selectedPlant} {lang === "ar" ? "نموذج التحليل" : "Analysis Form"}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{format(new Date(), "dd MMMM yyyy | HH:mm")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleExportExcel} className="bg-slate-800 hover:bg-slate-700 text-white border-none">
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                </Button>
                <Button variant="secondary" onClick={() => handleExportPdf(false)} className="bg-slate-800 hover:bg-slate-700 text-white border-none">
                  <FileDown className="w-4 h-4 mr-2" /> PDF
                </Button>
                <Button variant="secondary" onClick={() => handleExportPdf(true)} className="bg-slate-800 hover:bg-slate-700 text-white border-none">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white border-none px-8">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {lang === "ar" ? "حفظ ونشر" : "Save & Publish"}
                </Button>
              </div>
            </div>

            {/* Entry Grid */}
            <Tabs value={sampleType} onValueChange={(v) => setSampleType(v as any)} className="w-full">
              <TabsList className="bg-slate-900/80 border border-white/10 p-1 mb-6">
                <TabsTrigger value="daily" className="data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-black text-xs px-8">
                  Daily Samples (العينات اليومية)
                </TabsTrigger>
                <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-black text-xs px-8">
                  Weekly Samples (العينات الأسبوعية)
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {Object.keys(readings).map(param => (
                     <div key={param} className="p-4 rounded-lg border-4 border-slate-900 bg-slate-900/40 hover:border-primary transition-all group shadow-xl">
                        <label className="text-[11px] font-bold uppercase text-slate-400 mb-2 block group-hover:text-primary transition-colors">{param}</label>
                        <div className="relative">
                          <Input 
                            value={readings[param]}
                            onChange={(e) => setReadings(prev => ({ ...prev, [param]: e.target.value }))}
                            className="bg-slate-950 border-slate-800 text-primary font-black text-2xl h-14 text-center border-2 focus:border-primary"
                          />
                        </div>
                     </div>
                   ))}
                   {Object.keys(readings).length === 0 && (
                     <div className="col-span-full py-20 text-center text-slate-500 italic bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                       No parameters defined for this plant/type.
                     </div>
                   )}
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {Object.keys(readings).map(param => (
                     <div key={param} className="p-4 rounded-lg border-4 border-slate-900 bg-slate-900/40 hover:border-primary transition-all group shadow-xl">
                        <label className="text-[11px] font-bold uppercase text-slate-400 mb-2 block group-hover:text-primary transition-colors">{param}</label>
                        <div className="relative">
                          <Input 
                            value={readings[param]}
                            onChange={(e) => setReadings(prev => ({ ...prev, [param]: e.target.value }))}
                            className="bg-slate-950 border-slate-800 text-primary font-black text-2xl h-14 text-center border-2 focus:border-primary"
                          />
                        </div>
                     </div>
                   ))}
                   {Object.keys(readings).length === 0 && (
                     <div className="col-span-full py-20 text-center text-slate-500 italic bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                       No weekly parameters defined.
                     </div>
                   )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>

      <footer className="p-4 border-t border-white/5 text-center text-[9px] text-slate-600 font-mono uppercase tracking-widest">
        LIFECO PMS 2026 | Analytical Data Integrity Protocol | Secure Environment
      </footer>
    </div>
  );
};

export default LabDashboard;
