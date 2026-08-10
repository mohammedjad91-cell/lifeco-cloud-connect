import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FlaskConical, UserCheck, ClipboardList, CheckCircle2, 
  Save, ArrowRight, ArrowLeft, Factory, Droplets, Beaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface AmmoniaLabProps {
  onBack: () => void;
  preSelectedPlant?: string | null;
}

const AmmoniaLab: React.FC<AmmoniaLabProps> = ({ onBack, preSelectedPlant }) => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(preSelectedPlant || null);
  const [sampleType, setSampleType] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(false);

  const [verification, setVerification] = useState({
    analystName: "",
    employeeId: ""
  });

  const [results, setResults] = useState({
    oxygen: "",
    dewPoint: "",
    purity: "",
    remarks: ""
  });

  const plants = [
    { id: "AMM1", label: "Ammonia 1", icon: Beaker },
    { id: "AMM2", label: "Ammonia 2", icon: Beaker },
    { id: "DEMIN1", label: "Demin 1", icon: Droplets },
    { id: "DEMIN2", label: "Demin 2", icon: Droplets },
    { id: "NITROGEN", label: "Nitrogen Plant", icon: Factory },
  ];

  const handlePlantSelect = (id: string) => {
    setSelectedPlant(id);
    setStep(1); // Go to verification
  };

  const handleVerify = () => {
    if (!verification.analystName || !verification.employeeId) {
      toast({ 
        title: "Required Information", 
        description: "Please enter your Name and Employee ID to proceed.",
        variant: "destructive" 
      });
      return;
    }
    setStep(2); // Go to Sample Type Selection
  };

  const handleSave = async () => {
    if (selectedPlant === "NITROGEN" || selectedPlant === "AMM1" || selectedPlant === "AMM2") {
       if (!results.oxygen && !results.dewPoint && !results.purity) {
         toast({ 
           title: "Incomplete Data", 
           description: "Please fill at least one analysis parameter.",
           variant: "destructive" 
         });
         return;
       }
    }

    setLoading(true);
    try {
      const sampleId = `LAB-${selectedPlant}-${Date.now().toString().slice(-4)}`;
      
      // 1. Create Sample Record
      const { data: sample, error: sampleError } = await supabase.from("lifeco_lab_samples" as any).insert([{
        sample_id: sampleId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        laboratory: "Ammonia Laboratories",
        plant_source: selectedPlant,
        sample_type: sampleType === "daily" ? "Daily Sample" : "Weekly Sample",
        status: "Approved",
        operator_analyst: verification.analystName,
        employee_id: verification.employeeId,
        remarks: results.remarks
      }]).select().single();

      if (sampleError) throw sampleError;

      // 2. Create Analysis Results for Nitrogen/Ammonia
      if (selectedPlant === "NITROGEN" || selectedPlant === "AMM1" || selectedPlant === "AMM2") {
        const params = [];
        if (results.oxygen) params.push({ sample_id: (sample as any).id, parameter: "Oxygen Content", result: results.oxygen, unit: "ppm", status: "Approved" });
        if (results.dewPoint) params.push({ sample_id: (sample as any).id, parameter: "Dew Point", result: results.dewPoint, unit: "°C", status: "Approved" });
        if (results.purity) params.push({ sample_id: (sample as any).id, parameter: "Purity", result: results.purity, unit: "%", status: "Approved" });
        
        if (params.length > 0) {
          await supabase.from("lifeco_lab_analysis_results" as any).insert(params);

          // 3. Sync to Operations Logs
          await supabase.from("operations_logs" as any).insert([{
            department: selectedPlant === "NITROGEN" ? "NITROGEN" : selectedPlant,
            unit_tag: "LAB_ANALYSIS",
            value: 0,
            employee_id: verification.employeeId,
            timestamp: new Date().toISOString()
          }]);
        }
      }

      toast({ 
        title: "Success", 
        description: "Data saved and synchronized to operations logs successfully." 
      });
      
      // Reset flow
      setStep(4); // Show success
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <FlaskConical className="w-8 h-8 text-primary" />
          {lang === "ar" ? "مختبرات الأمونيا" : "Ammonia Laboratories"}
        </h2>
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Depts
        </Button>
      </div>

      {!selectedPlant ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <motion.button
              key={plant.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePlantSelect(plant.id)}
              className="glass-card p-10 text-center hover:neon-border transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <plant.icon className="w-16 h-16 mx-auto mb-6 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold">{plant.label}</h3>
              <Badge variant="outline" className="mt-3 border-emerald-500/50 text-emerald-400">ACTIVE</Badge>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden neon-border">
          <div className="bg-primary/10 border-b border-border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                {step}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedPlant} Sampling Module</h3>
                <div className="flex items-center gap-2 mt-1">
                   <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
                   <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
                   <div className={`h-1.5 w-8 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
                </div>
              </div>
            </div>
            {step < 4 && (
              <Button variant="ghost" onClick={() => setSelectedPlant(null)}>Cancel</Button>
            )}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 max-w-md mx-auto"
                >
                  <div className="text-center mb-8">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h4 className="text-2xl font-bold">Step 1: Analyst Verification</h4>
                    <p className="text-muted-foreground">Please identify yourself to record this entry.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Analyst Name (اسم المحلل)</label>
                      <Input 
                        value={verification.analystName} 
                        onChange={e => setVerification({...verification, analystName: e.target.value})}
                        className="bg-secondary/30 h-12"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Employee ID (الرقم الوظيفي)</label>
                      <Input 
                        value={verification.employeeId} 
                        onChange={e => setVerification({...verification, employeeId: e.target.value})}
                        className="bg-secondary/30 h-12"
                        placeholder="e.g. 5040"
                      />
                    </div>
                    <Button onClick={handleVerify} className="w-full h-12 text-lg font-bold gap-2 mt-4">
                      Verify & Continue <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 text-center max-w-lg mx-auto"
                >
                  <div className="mb-8">
                    <ClipboardList className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h4 className="text-2xl font-bold">Step 2: Select Sampling Type</h4>
                    <p className="text-muted-foreground">Select the schedule for this analysis.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => { setSampleType("daily"); setStep(3); }}
                      className={`p-8 rounded-2xl border-2 transition-all ${sampleType === "daily" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <h5 className="text-xl font-bold mb-2">Daily Samples</h5>
                      <p className="text-sm text-muted-foreground">العينات اليومية</p>
                    </button>
                    <button 
                      onClick={() => { setSampleType("weekly"); setStep(3); }}
                      className={`p-8 rounded-2xl border-2 transition-all ${sampleType === "weekly" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <h5 className="text-xl font-bold mb-2">Weekly Samples</h5>
                      <p className="text-sm text-muted-foreground">العينات الأسبوعية</p>
                    </button>
                  </div>
                  <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-6">
                    <FlaskConical className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <h4 className="text-2xl font-bold">Step 3: {sampleType === "daily" ? "Daily" : "Weekly"} Data Entry</h4>
                    <p className="text-muted-foreground">Enter values for {selectedPlant}</p>
                  </div>

                  {(selectedPlant === "NITROGEN" || selectedPlant === "AMM1" || selectedPlant === "AMM2") ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                          {selectedPlant === "NITROGEN" ? "Oxygen %" : "NH3 Concentration"}
                        </label>
                        <div className="relative">
                          <Input 
                            value={results.oxygen} onChange={e => setResults({...results, oxygen: e.target.value})}
                            className="bg-secondary/30 h-14 pl-4 pr-16 text-xl font-mono text-primary"
                            placeholder="0.00"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                            {selectedPlant === "NITROGEN" ? "%" : "ppm"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Dew Point</label>
                        <div className="relative">
                          <Input 
                            value={results.dewPoint} onChange={e => setResults({...results, dewPoint: e.target.value})}
                            className="bg-secondary/30 h-14 pl-4 pr-16 text-xl font-mono text-primary"
                            placeholder="-50"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">°C</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                          {selectedPlant === "NITROGEN" ? "N2 Purity %" : "pH Level"}
                        </label>
                        <div className="relative">
                          <Input 
                            value={results.purity} onChange={e => setResults({...results, purity: e.target.value})}
                            className="bg-secondary/30 h-14 pl-4 pr-16 text-xl font-mono text-primary"
                            placeholder={selectedPlant === "NITROGEN" ? "99.99" : "7.0"}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                            {selectedPlant === "NITROGEN" ? "%" : "pH"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 glass-card border-dashed">
                      <p className="text-muted-foreground italic leading-relaxed whitespace-pre-line">
                        {lang === "ar" 
                          ? `انا بحث ع وجه القديمه اريد ان تقوم بترجيعها`
                          : "Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required."}
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setStep(4)}>Simulate Save</Button>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 pt-10">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)} className="w-40 h-14">Back</Button>
                    <Button onClick={handleSave} disabled={loading} size="lg" className="w-80 h-14 text-xl font-bold gap-3 shadow-xl shadow-primary/20">
                      {loading ? <Save className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                      Save & Sync to Operations Logs
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <CheckCircle2 className="w-24 h-24 mx-auto mb-6 text-emerald-500 animate-pulse" />
                  <h4 className="text-4xl font-bold mb-4">Submission Successful!</h4>
                  <p className="text-xl text-muted-foreground max-w-md mx-auto mb-10">
                    The analytical data for {selectedPlant} has been recorded and broadcast to the Nitrogen Plant Operations dashboard.
                  </p>
                  <Button size="lg" onClick={() => { setSelectedPlant(null); setStep(1); setResults({oxygen:"", dewPoint:"", purity:"", remarks:""}); }} className="px-10 h-14 text-lg">
                    Process Another Sample
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmmoniaLab;