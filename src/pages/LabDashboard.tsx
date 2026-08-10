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
      {/* 1. TOP CONTROL BAR */}
      <header className="border-b-4 border-slate-900 p-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-950 border-2 border-slate-800 p-2 rounded-lg px-4 shadow-inner">
            <Clock className="w-5 h-5 text-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <span className="text-xl font-black font-mono text-primary tracking-tighter">
              {format(new Date(), "dd/MM/yyyy")}
            </span>
          </div>
          
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shadow-xl">
            <button className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase rounded shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              Classic Entry
            </button>
            <button className="px-6 py-2 text-slate-500 text-[10px] font-black uppercase hover:text-white transition-colors">
              Dynamic Samples
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportExcel} className="bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700 font-black uppercase text-[10px]">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button variant="secondary" onClick={() => handleExportPdf(false)} className="bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700 font-black uppercase text-[10px]">
            <FileDown className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white border-none px-8 font-black uppercase text-[10px] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save & Publish
          </Button>
          <Button 
             variant="ghost" 
             className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 font-black uppercase text-[10px]" 
             onClick={() => {
               const plant = sessionStorage.getItem("lifeco_plant");
               if (plant) navigate(`/modules/${plant}`);
               else navigate("/dept/LAB");
             }}
           >
             <LogOut className="w-4 h-4 mr-2" /> {lang === "ar" ? "رجوع" : "Back"}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 max-w-[1600px] mx-auto w-full">
        
        {/* 2. NEW LOG ENTRY CONTAINER */}
        <section className="bg-slate-900/50 border-4 border-slate-900 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-4 border-b-4 border-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/40">
                <FlaskConical className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">New Log Entry</h2>
            </div>
            <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded border border-slate-800">
              PROTOCOL: LIFECO-LAB-V3.4
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-950/40">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Technician Name</label>
              <Input 
                value={analyst.name}
                onChange={(e) => setAnalyst(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter technician name..."
                className="bg-slate-950 border-2 border-slate-800 text-white font-bold focus:border-primary h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Employee ID</label>
              <Input 
                value={analyst.badge}
                onChange={(e) => setAnalyst(prev => ({ ...prev, badge: e.target.value }))}
                placeholder="Enter Employee ID..."
                className="bg-slate-950 border-2 border-slate-800 text-white font-mono font-bold focus:border-primary h-12 tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Plant</label>
              <select 
                value={selectedPlant || ""}
                onChange={(e) => setSelectedPlant(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-800 text-white font-black h-12 px-4 rounded-md focus:border-primary outline-none appearance-none"
              >
                <option value="" disabled>Select Plant...</option>
                {AMMONIA_LAB_PLANTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sample Type</label>
              <select 
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value as any)}
                className="w-full bg-slate-950 border-2 border-slate-800 text-white font-black h-12 px-4 rounded-md focus:border-primary outline-none appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. PARAMETER INPUT CARDS */}
        {selectedPlant && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-l-8 border-primary pl-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                Parameter — {selectedPlant} ({sampleType})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.keys(readings).map(param => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={param} 
                  className="bg-slate-900 border-4 border-slate-800 rounded-xl overflow-hidden hover:border-primary transition-all shadow-2xl group"
                >
                  <div className="bg-slate-800 p-3 border-b-2 border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-tighter truncate w-3/4">
                      {param}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  </div>
                  <div className="p-4 bg-slate-950">
                    <Input 
                      value={readings[param]}
                      onChange={(e) => setReadings(prev => ({ ...prev, [param]: e.target.value }))}
                      className="bg-transparent border-none text-primary font-black text-4xl h-20 text-center focus:ring-0 focus:outline-none p-0 selection:bg-primary/20"
                    />
                    <div className="flex justify-between items-center mt-2 border-t border-slate-900 pt-2">
                      <span className="text-[8px] font-bold text-slate-600 uppercase">Input Value</span>
                      <span className="text-[8px] font-bold text-slate-600 uppercase">Unit: Tag-Based</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {Object.keys(readings).length === 0 && (
                <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-900 rounded-2xl bg-slate-900/20">
                  <FlaskConical className="w-16 h-16 text-slate-800 mx-auto mb-4 opacity-20" />
                  <p className="text-slate-600 font-black uppercase tracking-widest">No Engineering Parameters Defined</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedPlant && (
          <div className="py-40 text-center border-4 border-dashed border-slate-900 rounded-2xl bg-slate-900/10">
            <Factory className="w-20 h-20 text-slate-800 mx-auto mb-6 opacity-20" />
            <h3 className="text-2xl font-black uppercase text-slate-700 tracking-[0.3em]">Waiting for Plant Selection</h3>
            <p className="text-slate-800 font-bold mt-2 uppercase text-xs">Protocol requires active plant context to mount parameter grid</p>
          </div>
        )}
      </main>

      <footer className="p-4 bg-slate-950 border-t-4 border-slate-900 text-center text-[9px] text-slate-600 font-mono uppercase tracking-[0.5em] font-black">
        LIFECO PMS 2026 | DATA INTEGRITY SECURED | WORKSTATION 09
      </footer>
    </div>
  );
};

export default LabDashboard;
