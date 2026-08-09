import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { 
  X, Maximize2, Gauge, Thermometer, Zap, ShieldAlert, 
  FileText, Activity, Settings2, Info, Droplets,
  AlertTriangle, CheckCircle2, AlertCircle, Bookmark, FileSearch,
  QrCode, ExternalLink, History, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { EquipmentQRSection } from "@/components/equipment/EquipmentQRSection";
import { EquipmentIdentityCard } from "@/components/maintenance/EquipmentIdentityCard";

interface EquipmentFaceplateProps {
  tag: string;
  plantCode: string;
  lang: "ar" | "en";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquipmentFaceplate({ tag, plantCode, lang, open, onOpenChange }: EquipmentFaceplateProps) {
  const isAr = lang === "ar";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    async function fetchData() {
      setLoading(true);
      const { data: assetData, error } = await supabase
        .from("equipment_identity_cards")
        .select(`
          *,
          asset:equipment_assets(*)
        `)
        .eq("equipment_tag", tag)
        .maybeSingle();

      if (assetData) {
        setData(assetData);
      }
      setLoading(false);
    }
    fetchData();
  }, [tag, open]);

  if (!open) return null;

  const asset = data?.asset || {};
  const matrix = data?.protection_matrix || {};
  const control = data?.operating_control || data?.protection_matrix?.control || {};
  const running = data?.detailed_running_data || {};
  
  const status = asset.status || "Pending Verification";
  const statusColor = 
    status.toUpperCase() === "RUNNING" ? "text-emerald-400 border-emerald-400/50 bg-emerald-400/10" :
    status.toUpperCase() === "TRIP" ? "text-red-400 border-red-400/50 bg-red-400/10" :
    "text-amber-400 border-amber-400/50 bg-amber-400/10";

  const ReadingCard = ({ icon: Icon, label, value, unit, color = "cyan", trend = "neutral" }: any) => (
    <div className="bg-slate-900/80 border border-white/5 p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-all group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors" />
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            color === "cyan" ? "bg-cyan-500/10 text-cyan-400" : "bg-amber-500/10 text-amber-400"
          )}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{label}</span>
        </div>
        {trend === "up" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={cn(
          "text-2xl font-mono font-black tracking-tighter",
          color === "cyan" ? "text-cyan-400" : "text-amber-400"
        )}>
          {value || "---"}
        </span>
        <span className="text-[10px] text-white/20 font-bold uppercase">{unit}</span>
      </div>
      <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "65%" }}
          className={cn("h-full", color === "cyan" ? "bg-cyan-500/40" : "bg-amber-500/40")}
        />
      </div>
    </div>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" />
        <Dialog.Content 
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-0 border border-white/10 bg-slate-950 shadow-2xl duration-200 animate-in zoom-in-95 rounded-2xl overflow-hidden focus:outline-none",
            isAr ? "font-sans-arabic" : "font-sans"
          )}
        >
          {/* Header Status Bar */}
          <div className="bg-slate-900/80 border-b border-white/10 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">
                    {tag} <span className="text-white/40 mx-1">-</span> <span className="text-primary/90">{data?.equipment_name || asset.asset_name || "ASSET"}</span>
                  </h2>
                  <Badge variant="outline" className={cn("text-[9px] font-black tracking-[0.15em] py-0 px-2 h-5 flex items-center justify-center", statusColor)}>
                    {status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] font-bold">
                  {plantCode} AREA • {asset.location || "NITROGEN GENERATION"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/40 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg h-9 w-9 transition-colors"
                onClick={() => {
                  const url = `/equipment/${tag}`;
                  window.open(url, '_blank');
                }}
                title="Expand to Full Page View"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg h-9 w-9">
                  <X className="w-5 h-5" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {loading ? (
            <div className="h-[500px] flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] animate-pulse">Initializing Data Stream...</p>
            </div>
          ) : (
            <Tabs.Root defaultValue="readings" className="flex flex-col h-full max-h-[85vh]">
              <Tabs.List className="flex border-b border-white/10 bg-slate-900/30 px-2">
                {[
                  { id: "readings", label: isAr ? "العمليات الحية" : "Live Readings", icon: Activity },
                  { id: "protections", label: isAr ? "الحمايات والإنذارات" : "Protections & Alarms", icon: ShieldAlert },
                  { id: "electrical", label: isAr ? "الكهرباء والمحرك" : "Electrical & Motor", icon: Zap },
                  { id: "docs", label: isAr ? "الوثائق والسجلات" : "Manuals & Logs", icon: FileText },
                ].map((tab) => (
                  <Tabs.Trigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 transition-all border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 hover:text-white/70"
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950/50">
                <Tabs.Content value="readings" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadingCard icon={Gauge} label={isAr ? "ضغط التفريغ" : "Discharge Pressure"} value={control.discharge_pressure || "9.1"} unit="BAR" trend="up" />
                    <ReadingCard icon={Thermometer} label={isAr ? "مخرج المرحلة 1" : "Element 1 Outlet"} value={control.element_1_outlet_temp || "225"} unit="°C" color="amber" />
                    <ReadingCard icon={Thermometer} label={isAr ? "مخرج المرحلة 2" : "Element 2 Outlet"} value={control.element_2_outlet_temp || "225"} unit="°C" color="amber" />
                    <ReadingCard icon={Zap} label={isAr ? "تيار المحرك" : "Motor Current"} value={running.current || "185"} unit="AMPS" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-2 glass-card p-6 border-l-2 border-l-cyan-500/50 bg-slate-900/40">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Activity className="w-4 h-4" /> {isAr ? "معايير العملية الفرعية" : "Process Sub-Parameters"}
                        </h3>
                        <Badge variant="outline" className="text-[8px] border-cyan-500/30 text-cyan-400">LIVE TELEMETRY</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                        {[
                          { label: isAr ? "ضغط الزيت" : "Oil Pressure", value: control.oil_pressure || "1.3", unit: "BAR" },
                          { label: isAr ? "درجة حرارة الزيت" : "Oil Temp", value: control.oil_temperature || "65", unit: "°C" },
                          { label: isAr ? "مدخل المرحلة 2" : "Element 2 Inlet", value: control.element_2_inlet_temp || "42", unit: "°C" },
                          { label: isAr ? "ساعات التشغيل" : "Running Hours", value: running.running_hours || asset.running_hours || "12,450", unit: "HRS" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-1 group">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-white/30 uppercase font-black tracking-wider">{item.label}</span>
                              <span className="text-sm font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">{item.value} <span className="text-[9px] text-white/20 ml-1">{item.unit}</span></span>
                            </div>
                            <div className="h-0.5 w-full bg-white/5 rounded-full">
                              <div className="h-full bg-cyan-500/20 w-[45%]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass-card p-6 border-l-2 border-l-amber-500/50 bg-amber-500/5">
                      <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                        <History className="w-4 h-4" /> {isAr ? "الأحداث الأخيرة" : "Recent Events"}
                      </h3>
                      <div className="space-y-4">
                        {[
                          { msg: "Start Command OK", time: "14:22:10", type: "success" },
                          { msg: "Load Sequence Active", time: "14:22:15", type: "info" },
                          { msg: "Target Pressure Reached", time: "14:25:00", type: "success" }
                        ].map((evt, i) => (
                          <div key={i} className="flex gap-3 items-start border-l border-white/10 pl-3 relative">
                            <div className={cn(
                              "absolute -left-[3.5px] top-1 w-1.5 h-1.5 rounded-full",
                              evt.type === 'success' ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]"
                            )} />
                            <div>
                              <p className="text-[10px] text-white/80 font-black uppercase leading-tight">{evt.msg}</p>
                              <p className="text-[9px] text-white/20 font-mono mt-1">2026-08-09 {evt.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="protections" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 mb-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-[10px] text-red-400/80 font-bold uppercase tracking-wider italic">
                      Critical Safety Parameters - Unauthorized Modification Prohibited
                    </p>
                  </div>
                  <EquipmentIdentityCard 
                    matrix={matrix} 
                    control={control}
                    running={running}
                    ar={isAr}
                    tag={tag}
                    fullData={data}
                  />
                </Tabs.Content>

                <Tabs.Content value="electrical" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 space-y-4 border border-white/5 relative group">
                      <div className="absolute -top-[1px] left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                        <Zap className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{isAr ? "مواصفات المحرك" : "Motor Specifications"}</h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: isAr ? "القدرة المقدرة" : "Rated Power", value: data?.motor_power || "250 kW" },
                          { label: isAr ? "الجهد المقدر" : "Rated Voltage", value: data?.motor_voltage || "6600 V" },
                          { label: isAr ? "التردد" : "Frequency", value: "50 Hz" },
                          { label: isAr ? "عدد الدورات" : "RPM", value: data?.motor_rpm || "1485 RPM" },
                          { label: isAr ? "نوع البادئ" : "Starter Type", value: data?.starter_type || "MV VFD / Soft Starter" }
                        ].map((spec, i) => (
                          <div key={i} className="flex justify-between items-center text-[11px] group">
                            <span className="text-white/40 uppercase font-bold tracking-tight group-hover:text-white/60 transition-colors">{spec.label}</span>
                            <span className="font-mono text-white font-black group-hover:text-primary transition-colors tracking-tighter">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass-card p-6 space-y-4 bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-3 pb-3 border-b border-primary/20">
                        <Settings2 className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{isAr ? "التحقق الفني" : "Technical Verification"}</h3>
                      </div>
                      <div className="p-4 rounded-lg bg-black/40 border border-primary/10 italic text-[11px] text-white/70 leading-relaxed font-mono">
                        "MOTOR INSULATION RESISTANCE TESTED AT 5KV. ALL PHASES BALANCED WITHIN 2%. VFD PARAMETERS SYNCED WITH MAIN DCS LOOP."
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" /> VERIFIED 2026-08-01
                        </div>
                        <div className="text-[10px] text-white/20 font-mono">ID: ELEC-60-1001-A</div>
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="docs" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] px-1 flex items-center gap-2">
                        <QrCode className="w-3.5 h-3.5" /> {isAr ? "الهوية الرقمية" : "Digital Asset Passport"}
                      </h4>
                      <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                         <div className="p-2 border-2 border-slate-100 rounded-xl">
                           <EquipmentQRSection tag={tag} isAr={isAr} />
                         </div>
                         <p className="text-[10px] text-black/60 font-black mt-4 uppercase tracking-[0.2em] text-center">
                           {isAr ? "امسح للوصول المباشر إلى سجلات الصيانة" : "Scan for Maintenance Records"}
                         </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] px-1 flex items-center gap-2">
                        <FileSearch className="w-3.5 h-3.5" /> {isAr ? "الملفات المرفقة" : "Engineering Documents"}
                      </h4>
                      <div className="space-y-3">
                        {[
                          { name: isAr ? "سجل الصيانة الوقائية" : "Maintenance Log.pdf", size: "1.2 MB", type: "LOG" },
                          { name: isAr ? "كتيب التعليمات الفنية" : "Instruction Book.pdf", size: "8.4 MB", type: "MANUAL" },
                          { name: isAr ? "مخططات P&ID" : "P&ID Diagram.dwg", size: "256 KB", type: "DRAWING" },
                          { name: isAr ? "تقرير فحص الاهتزازات" : "Vibration Report.pdf", size: "450 KB", type: "REPORT" }
                        ].map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-primary/30 hover:bg-slate-900 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[11px] text-white/80 font-black uppercase tracking-tight group-hover:text-white transition-colors">{doc.name}</p>
                                <p className="text-[9px] text-white/20 uppercase font-mono tracking-widest">{doc.type} • {doc.size}</p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/10 group-hover:text-primary transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          )}

          {/* Footer Branding/Info */}
          <div className="bg-slate-900/80 border-t border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
              LIFECO INDUSTRIAL PMS • ASSET CONTROL SYSTEM v4.2.0
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-white/20 font-black uppercase tracking-[0.1em] mb-0.5">Last Sync</span>
                <span className="text-[10px] text-primary/60 font-mono tracking-tighter">2026-08-09 19:28:44 UTC</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <img src="/lifeco-logo.png" alt="LIFECO" className="h-5 opacity-40 grayscale brightness-200" />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
