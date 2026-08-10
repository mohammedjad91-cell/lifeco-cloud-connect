import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { LAB_PARAMETERS, PLANT_GROUPS } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  FlaskConical, User, Save, ArrowLeft, Factory, 
  Calendar, CheckCircle2, AlertCircle, Loader2,
  Clock, LogOut, Globe, FileDown, FileSpreadsheet,
  Plus, Trash2, CalendarIcon, Edit2
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getLabRange, isInRange, statusColorClasses } from "@/lib/ranges";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";

interface LabEntry {
  id: string;
  plant: string;
  sample_type: string;
  parameter_name: string;
  value: number;
  technician_name: string;
  employee_id: string;
  timestamp: string;
  created_at: string;
}

const LabDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang, setLang } = useI18n();

  const [technicianName, setTechnicianName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [verified, setVerified] = useState(false);
  const [plant, setPlant] = useState("");
  const [sampleType, setSampleType] = useState<"daily" | "weekly">("daily");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<LabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [deptScope, setDeptScope] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("lifeco_lab_dept") || "";
  });
  const [plantFilter, setPlantFilter] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("lifeco_lab_plant") || "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isVerified = sessionStorage.getItem("lifeco_lab_verified") === "true";
      const savedName = sessionStorage.getItem("lifeco_lab_tech_name") || "";
      const savedId = sessionStorage.getItem("lifeco_lab_tech_id") || "";
      const savedPlant = sessionStorage.getItem("lifeco_lab_plant") || "";
      
      if (isVerified && savedName && savedId && savedPlant) {
        setVerified(true);
        setTechnicianName(savedName);
        setEmployeeId(savedId);
        setPlant(savedPlant);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (deptScope) sessionStorage.setItem("lifeco_lab_dept", deptScope);
      else sessionStorage.removeItem("lifeco_lab_dept");
      
      if (plantFilter) sessionStorage.setItem("lifeco_lab_plant", plantFilter);
      else sessionStorage.removeItem("lifeco_lab_plant");
    }
  }, [deptScope, plantFilter]);

  const parameters = !plant ? [] : (LAB_PARAMETERS[plant]?.[sampleType] || []);
  const hasModules = !!parameters.length;

  // Sync plant state to plantFilter to ensure UI consistency
  useEffect(() => {
    if (plantFilter && !verified) {
      setPlant(plantFilter);
    }
  }, [plantFilter, verified]);

  useEffect(() => {
    fetchResults();
    const ch = supabase.channel("lab_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results" }, () => fetchResults())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedDate, plantFilter, deptScope]);

  const fetchResults = async () => {
    setLoading(true);
    const start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate); end.setHours(23, 59, 59, 999);
    
    let q = supabase.from("lab_results").select("*")
      .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString());
      
    if (plantFilter) q = q.eq("plant", plantFilter);
    else if (deptScope) {
      const codes = PLANT_GROUPS.find((g: any) => g.dept === deptScope)?.plants.map((p: any) => p.code) || [];
      if (codes.length) q = q.in("plant", codes);
    }

    const { data } = await q.order("timestamp", { ascending: false });
    if (data) setResults(data as LabEntry[]);
    setLoading(false);
  };

  const handleVerify = () => {
    if (!technicianName || !employeeId) {
      toast({ title: lang === "ar" ? "يرجى إدخال اسم المحلل والرقم الوظيفي" : "Please enter Analyst Name and ID", variant: "destructive" });
      return;
    }
    
    // Clear previous values when verifying a new plant entry session
    setParamValues({});
    setVerified(true);
    setPlant(plantFilter);
    
    // Persist to session storage to ensure state is maintained on refresh/navigation
    sessionStorage.setItem("lifeco_lab_verified", "true");
    sessionStorage.setItem("lifeco_lab_tech_name", technicianName);
    sessionStorage.setItem("lifeco_lab_tech_id", employeeId);
    sessionStorage.setItem("lifeco_lab_plant", plantFilter);
  };

  const handleSaveAll = async () => {
    if (!technicianName || !employeeId || !plant) return;
    
    const entries = Object.entries(paramValues).filter(([_, v]) => v !== "" && !isNaN(parseFloat(v)));
    if (entries.length === 0) {
      toast({ title: t.labMissingFields, variant: "destructive" });
      return;
    }

    setSaving(true);
    const timestamp = new Date().toISOString();
    
    // 1. Insert into lab_results
    const labRows = entries.map(([param, val]) => ({
      plant,
      sample_type: sampleType,
      parameter_name: param,
      value: parseFloat(val),
      technician_name: technicianName,
      employee_id: employeeId,
      timestamp,
    }));

    const { error: labError } = await supabase.from("lab_results").insert(labRows);

    // 2. Critical Sync to operations_logs (Schedules & Operations)
    const opsRows = entries.map(([param, val]) => ({
      department: plant,
      unit_tag: `LAB|${param}`,
      value: parseFloat(val),
      employee_id: employeeId,
      timestamp,
    }));
    
    await supabase.from("operations_logs").insert(opsRows);

    if (labError) {
      toast({ title: t.errorSaving, variant: "destructive" });
    } else {
      toast({ title: lang === "ar" ? "تم الحفظ والنشر بنجاح" : "Saved & Published successfully" });
      setParamValues({});
      fetchResults();
      
      await supabase.from("activity_logs").insert({
        action: "LAB_PUBLISH",
        department: plant,
        details: `Lab results published for ${plant} by ${technicianName}`,
      });
    }
    setSaving(false);
  };

  const handleDeleteEntry = async (id: string) => {
    await supabase.from("lab_results").delete().eq("id", id);
    toast({ title: t.deleted });
    fetchResults();
  };

  const resetSelection = () => {
    if (verified) {
      setVerified(false);
      sessionStorage.removeItem("lifeco_lab_verified");
    } else if (plantFilter) {
      setPlantFilter("");
      sessionStorage.removeItem("lifeco_lab_plant");
    } else {
      setDeptScope("");
      sessionStorage.removeItem("lifeco_lab_dept");
    }
  };

  const now = new Date();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between glass-card rounded-none sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {(deptScope || plantFilter || verified) && (
            <Button variant="ghost" size="icon" onClick={resetSelection} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold neon-text tracking-wider">{t.lifecoDigital}</h1>
            <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1">
              {t.laboratory}
              {deptScope && ` — ${deptScope === "AMMONIA" ? "مختبر الأمونيا" : "مختبر اليوريا"}`}
              {plantFilter && ` — ${PLANT_GROUPS.flatMap((g: any) => g.plants).find((p: any) => p.code === plantFilter)?.ar || plantFilter}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="gap-1.5">
            <Globe className="w-4 h-4" /> {t.language}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5 text-muted-foreground">
            <LogOut className="w-4 h-4" /> {t.exit}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6">
        {!deptScope && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
            <button onClick={() => setDeptScope("AMMONIA")} className="glass-card p-10 text-center hover:neon-border transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FlaskConical className="w-16 h-16 mx-auto mb-6 text-primary group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Ammonia Lab</h2>
              <h3 className="text-xl text-muted-foreground">مختبر الأمونيا</h3>
            </button>
            <button onClick={() => setDeptScope("UREA")} className="glass-card p-10 text-center hover:neon-border transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FlaskConical className="w-16 h-16 mx-auto mb-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Urea Lab</h2>
              <h3 className="text-xl text-muted-foreground">مختبر اليوريا</h3>
            </button>
          </motion.div>
        )}

        {deptScope && !plantFilter && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Factory className="w-6 h-6 text-primary" />
              {deptScope === "AMMONIA" ? "Ammonia Department Plants" : "Urea Department Plants"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {PLANT_GROUPS.find((g: any) => g.dept === deptScope)?.plants.map((pl: any, i: number) => (
                <button key={pl.code} onClick={() => setPlantFilter(pl.code)} className="glass-card p-6 text-center hover:neon-border transition-all group">
                  <Factory className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="font-bold text-lg">{pl.ar}</div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">{pl.code}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {plantFilter && !verified && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto pt-10">
            <div className="glass-card p-8 neon-border space-y-6">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto text-primary mb-2" />
                <h2 className="text-xl font-bold">{lang === "ar" ? "تحقق المحلل" : "Analyst Verification"}</h2>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "يرجى إدخال البيانات للمتابعة" : "Enter details to proceed"}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">{lang === "ar" ? "اسم المحلل" : "Employee Name"}</label>
                  <Input value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} placeholder="Name..." className="bg-secondary/50" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">{lang === "ar" ? "الرقم الوظيفي" : "Employee ID / Badge"}</label>
                  <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="ID..." className="bg-secondary/50" />
                </div>
                <Button onClick={handleVerify} className="w-full h-12 text-lg font-bold">
                  {lang === "ar" ? "دخول ونظام العينات" : "Verify & Open Samples"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {verified && (
          <div className="space-y-6">
            <div className="glass-card p-6 neon-border">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span className="font-bold">{format(selectedDate, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-mono font-bold">{technicianName} ({employeeId})</span>
                  </div>
                </div>
                <div className="flex bg-secondary/50 p-1 rounded-lg">
                  <button onClick={() => setSampleType("daily")} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${sampleType === "daily" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}>
                    {lang === "ar" ? "العينات اليومية" : "Daily Samples"}
                  </button>
                  <button onClick={() => setSampleType("weekly")} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${sampleType === "weekly" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}>
                    {lang === "ar" ? "العينات الأسبوعية" : "Weekly Samples"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {parameters.map((param) => (
                  <div key={param} className="bg-secondary/30 p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                    <label className="text-xs font-black uppercase text-muted-foreground mb-2 block tracking-tighter">{param}</label>
                    <Input 
                      type="number" 
                      value={paramValues[param] || ""} 
                      onChange={(e) => setParamValues(prev => ({ ...prev, [param]: e.target.value }))}
                      placeholder="0.00" 
                      className="text-2xl font-black bg-background border-none text-primary h-12"
                    />
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleSaveAll} 
                disabled={saving || !parameters.length} 
                className="w-full h-14 text-xl font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
              >
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {lang === "ar" ? "حفظ ونشر لسجلات التشغيل (Save & Publish)" : "Save & Publish to Operations Logs"}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                {lang === "ar" ? "النتائج المسجلة اليوم" : "Results Logged Today"}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : results.length === 0 ? (
                <div className="glass-card p-12 text-center text-muted-foreground italic border-dashed">
                  {lang === "ar" ? "لا توجد نتائج مسجلة لهذا اليوم" : "No results logged for today yet"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((r) => {
                    const range = getLabRange(r.parameter_name);
                    const ok = isInRange(r.value, range);
                    return (
                      <motion.div key={r.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`glass-card p-5 border-l-4 ${ok ? "border-l-emerald-500" : "border-l-red-500"}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-black uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground">{r.sample_type}</span>
                            <h4 className="font-bold text-lg leading-tight mt-1">{r.parameter_name}</h4>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(r.id)} className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl font-black ${ok ? "text-emerald-500" : "text-red-500"}`}>{r.value}</span>
                          <span className="text-xs text-muted-foreground">{range?.unit}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                          <span>{format(new Date(r.timestamp), "HH:mm:ss")}</span>
                          <span>{r.technician_name}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LabDashboard;
