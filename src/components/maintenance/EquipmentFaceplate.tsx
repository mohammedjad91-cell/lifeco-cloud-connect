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

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950">
                <Tabs.Content value="readings" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ReadingCard icon={Gauge} label="Discharge Pressure" value={control.discharge_pressure || "9.1"} unit="BAR" />
                    <ReadingCard icon={Thermometer} label="Element 1 Outlet" value={control.element_1_outlet_temp || "225"} unit="°C" color="amber" />
                    <ReadingCard icon={Thermometer} label="Element 2 Outlet" value={control.element_2_outlet_temp || "225"} unit="°C" color="amber" />
                    <ReadingCard icon={Zap} label="Motor Current" value={running.current || "---"} unit="AMPS" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-2 glass-card p-5 border-l-2 border-l-cyan-500/50">
                      <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" /> Process Sub-Parameters
                      </h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        {[
                          { label: "Oil Pressure", value: control.oil_pressure || "1.3", unit: "BAR" },
                          { label: "Oil Temp", value: control.oil_temperature || "65", unit: "°C" },
                          { label: "Element 2 Inlet", value: control.element_2_inlet_temp || "65", unit: "°C" },
                          { label: "Running Hours", value: running.running_hours || asset.running_hours || "0", unit: "HRS" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] text-white/40 uppercase font-bold">{item.label}</span>
                            <span className="text-sm font-mono font-bold text-white">{item.value} <span className="text-[9px] text-white/20 ml-1">{item.unit}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass-card p-5 border-l-2 border-l-amber-500/50 bg-amber-500/5">
                      <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <History className="w-3.5 h-3.5" /> Recent Events
                      </h3>
                      <div className="space-y-3">
                        <div className="flex gap-3 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                          <div>
                            <p className="text-[10px] text-white/80 font-bold uppercase leading-tight">Start Command Acknowledged</p>
                            <p className="text-[9px] text-white/30 font-mono mt-0.5">2026-08-09 14:22:10</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-start opacity-50">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />
                          <div>
                            <p className="text-[10px] text-white/80 font-bold uppercase leading-tight">High Temp Warning (E1)</p>
                            <p className="text-[9px] text-white/30 font-mono mt-0.5">2026-08-09 10:45:00</p>
                          </div>
                        </div>
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
                    <div className="glass-card p-6 space-y-4">
                      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                        <Zap className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Motor Specifications</h3>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: "Rated Power", value: data?.motor_power || "Pending Verification" },
                          { label: "Rated Voltage", value: data?.motor_voltage || "Pending Verification" },
                          { label: "Frequency", value: "50 Hz" },
                          { label: "RPM", value: data?.motor_rpm || "Pending Verification" },
                          { label: "Starter Type", value: data?.starter_type || "YD (Star-Delta)" }
                        ].map((spec, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-white/40 uppercase font-bold tracking-tight">{spec.label}</span>
                            <span className="font-mono text-white font-black">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass-card p-6 space-y-4 bg-primary/5">
                      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                        <Settings2 className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Technical Verification</h3>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5 border border-white/10 italic text-[11px] text-white/60 leading-relaxed">
                        "Electrical verification required for all local panel indicators. Ensure phase balance is monitored during full load operation."
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest mt-4">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Checked 2026-08-01
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="docs" className="space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 px-1">Digital Identity</h4>
                      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex gap-4 items-center">
                        <div className="bg-white p-2 rounded-lg">
                          <QrCode className="w-16 h-16 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-white font-bold uppercase mb-1">Asset QR Passport</p>
                          <p className="text-[9px] text-white/40 leading-tight mb-3 italic">Scan for direct engineering PDF access without app login.</p>
                          <Button size="sm" className="h-7 text-[9px] font-black uppercase bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                            Download QR Label
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 px-1">Attached Files</h4>
                      <div className="space-y-2">
                        {[
                          { name: "Maintenance Log.pdf", size: "1.2 MB", type: "LOG" },
                          { name: "Instruction Book.pdf", size: "8.4 MB", type: "MANUAL" },
                          { name: "P&ID Diagram.dwg", size: "256 KB", type: "DRAWING" }
                        ].map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <FileSearch className="w-4 h-4 text-white/20 group-hover:text-primary" />
                              <div>
                                <p className="text-xs text-white font-bold uppercase tracking-tight">{doc.name}</p>
                                <p className="text-[9px] text-white/20 uppercase font-mono">{doc.type} • {doc.size}</p>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-white/20" />
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
          <div className="bg-slate-900/50 border-t border-white/10 px-6 py-3 flex items-center justify-between">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em]">
              LIFECO INDUSTRIAL PMS • SYSTEM v4.2.0
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest">DCS Link Active</span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
