import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Info, Gauge, Activity, ShieldAlert, Wrench, FileText, 
  Layers, Factory, Settings2, Thermometer, Clock, Droplets,
  AlertTriangle, CheckCircle2, AlertCircle, Bookmark, FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface EquipmentDetailViewProps {
  tag: string;
  plantCode: string;
  lang: "ar" | "en";
  onClose: () => void;
}

export function EquipmentDetailView({ tag, plantCode, lang, onClose }: EquipmentDetailViewProps) {
  const isAr = lang === "ar";
  const [activeTab, setActiveTab] = useState("identity");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [tag]);

  const tabs = [
    { id: "identity", label: isAr ? "بطاقة التعريف" : "IDENTITY", icon: Info },
    { id: "operating", label: isAr ? "التشغيل" : "OPERATING", icon: Activity },
    { id: "protection", label: isAr ? "الحماية والإنذارات" : "PROTECTION & ALARMS", icon: ShieldAlert },
    { id: "process", label: isAr ? "العملية والتوصيلات" : "PROCESS & CONNECTIONS", icon: Layers },
    { id: "maintenance", label: isAr ? "الصيانة" : "MAINTENANCE", icon: Wrench },
    { id: "documents", label: isAr ? "الوثائق" : "DOCUMENTS", icon: FileText },
  ];

  const DataField = ({ label, value, warning = false, full = false }: any) => (
    <div className={`p-4 rounded-lg bg-white/5 border border-white/10 ${full ? 'col-span-full' : ''}`}>
      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-bold">{label}</div>
      <div className={`text-sm font-mono break-words ${value === "Pending Verification" || warning ? 'text-amber-500/70 italic' : 'text-white font-bold'}`}>
        {value || "Pending Verification"}
      </div>
    </div>
  );

  const SectionHeader = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10">
      <div className="p-2 rounded-lg bg-primary/20 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 font-mono text-sm animate-pulse">LOADING EQUIPMENT DATA...</p>
        </div>
      </div>
    );
  }

  const identity = data || {};
  const asset = data?.asset || {};
  const matrix = data?.protection_matrix || {};
  const control = data?.operating_control || {};
  const running = data?.detailed_running_data || {};

  // Custom data overrides based on user instructions for specific tags
  const getCustomValue = (field: string, defaultValue: any) => {
    if (tag === "60-2002") {
      if (field === "Function") return "Air Receiver / Buffer";
      if (field === "Upstream") return "60-1001A/B/C";
      if (field === "Downstream") return "60-2201 / 60-2202";
      if (field === "Operating Pressure") return "approximately 9.1 bar";
    }
    if (tag === "60-2201" || tag === "60-2202") {
      if (field === "Type") return "Dryer";
      if (field === "Model") return "BD 1100 ZP";
      if (field === "Vessel Count") return "2";
      if (field === "Upstream") return "60-2002";
      if (field === "Downstream") return "60-2003";
    }
    if (tag === "60-2003") {
      if (field === "Type") return "Air Receiver / Distribution";
      if (field === "Upstream") return "60-2201 / 60-2202";
      if (field === "Function") return "Dry Air Buffer / Distribution";
      if (field === "Service") return "Critical Instrument Air Distribution";
    }
    if (tag === "04-04") {
      if (field === "Type") return "Control Valve";
      if (field === "Service") return "Main Air Distribution";
      if (field === "Upstream") return "60-2003";
    }
    if (tag === "Nitrogen PSA Unit") {
      if (field === "Name") return "Nitrogen PSA Unit";
      if (field === "Type") return "PSA Nitrogen Generator";
      if (field === "Upstream") return "60-2003 → 04-04";
      if (field === "Function") return "Nitrogen Generation";
    }
    if (tag.startsWith("60-1001")) {
      if (field === "Operating Pressure") return "approximately 9.1 bar";
    }
    return defaultValue;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-background/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-6xl min-h-[80vh] bg-slate-950 border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Factory className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase mb-1">
                <span>Plant: {plantCode}</span>
                <span className="text-white/20">|</span>
                <span>Area: {asset.location || "NITROGEN GENERATION"}</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                EQUIPMENT: <span className="text-primary">{tag}</span>
              </h2>
              <div className="text-[10px] font-mono text-primary/60 font-bold tracking-widest mt-0.5 uppercase">
                STATUS: {asset.status || "Pending Verification"}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white hover:bg-white/10 rounded-full h-12 w-12">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto bg-slate-900/50 border-b border-white/10 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap
                ${activeTab === tab.id 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-white/40 hover:text-white/70 hover:bg-white/5"}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-950 to-slate-900/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              {activeTab === "identity" && (
                <div className="space-y-8">
                  <SectionHeader title={isAr ? "بيانات التعريف" : "IDENTITY CARD"} icon={Info} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DataField label="Tag" value={tag} />
                    <DataField label="Name" value={getCustomValue("Name", identity.equipment_name || asset.asset_name)} />
                    <DataField label="Type" value={getCustomValue("Type", identity.equipment_type)} />
                    <DataField label="Service" value={getCustomValue("Service", identity.service)} />
                    <DataField label="Function" value={getCustomValue("Function", identity.description)} />
                    <DataField label="Plant" value={plantCode} />
                    <DataField label="Area" value={asset.location || "NITROGEN GENERATION"} />
                    <DataField label="Manufacturer" value={identity.manufacturer || asset.manufacturer} />
                    <DataField label="Model" value={getCustomValue("Model", identity.model)} />
                    <DataField label="Serial Number" value="Pending Verification" />
                    <DataField label="Capacity" value={identity.capacity} />
                    <DataField label="Upstream" value={getCustomValue("Upstream", identity.upstream)} />
                    <DataField label="Downstream" value={getCustomValue("Downstream", identity.downstream)} />
                  </div>
                </div>
              )}

              {activeTab === "process" && (
                <div className="space-y-8">
                  <SectionHeader title={isAr ? "بيانات العمليات" : "PROCESS DATA"} icon={Layers} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataField label="Process Function" value={getCustomValue("Function", identity.description)} full />
                    <DataField label="Inlet" value="Pending Verification" />
                    <DataField label="Outlet" value="Pending Verification" />
                    <DataField label="Upstream Equipment" value={getCustomValue("Upstream", identity.upstream)} />
                    <DataField label="Downstream Equipment" value={getCustomValue("Downstream", identity.downstream)} />
                    <DataField label="Process Description" value={getCustomValue("Function", identity.description)} full />
                  </div>
                </div>
              )}

              {activeTab === "operating" && (
                <div className="space-y-8">
                  <SectionHeader title={isAr ? "البيانات التشغيلية" : "OPERATING DATA"} icon={Activity} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tag.startsWith("60-1001") ? (
                      <>
                        <DataField label="Element 1 Outlet Temperature" value="Pending Verification" />
                        <DataField label="Element 2 Outlet Temperature" value="Pending Verification" />
                        <DataField label="Element 2 Inlet Temperature" value="Pending Verification" />
                        <DataField label="Oil Pressure" value={control.oil_pressure || "Pending Verification"} />
                        <DataField label="Oil Temperature" value={control.oil_temperature || "Pending Verification"} />
                        <DataField label="M1 Temperature" value={identity.m1_temperature || "Pending Verification"} />
                        <DataField label="M2 Temperature" value={identity.m2_temperature || "Pending Verification"} />
                        <DataField label="Outlet Pressure" value={identity.discharge_pressure || "Pending Verification"} />
                        <DataField label="Loading Status" value={running.loading_status || "Pending Verification"} />
                        <DataField label="Unloading Status" value={running.unloading_status || "Pending Verification"} />
                        <DataField label="Running Hours" value={running.running_hours || asset.running_hours} />
                        <DataField label="Loaded Hours" value={running.loaded_hours || "Pending Verification"} />
                      </>
                    ) : (
                      <>
                        <DataField label="Operating Pressure" value={getCustomValue("Operating Pressure", control.operating_pressure || identity.discharge_pressure || "Pending Verification")} />
                        <DataField label="Outlet Pressure" value={identity.discharge_pressure || "Pending Verification"} />
                        <DataField label="M1 Temperature" value={identity.m1_temperature || "Pending Verification"} />
                        <DataField label="M2 Temperature" value={identity.m2_temperature || "Pending Verification"} />
                        <DataField label="Oil Pressure" value={control.oil_pressure || "Pending Verification"} />
                        <DataField label="Oil Temperature" value={control.oil_temperature || "Pending Verification"} />
                        <DataField label="Loading Status" value={running.loading_status || "Pending Verification"} />
                        <DataField label="Unloading Status" value={running.unloading_status || "Pending Verification"} />
                        <DataField label="Running Hours" value={running.running_hours || asset.running_hours} />
                        <DataField label="Loaded Hours" value={running.loaded_hours || "Pending Verification"} />
                        <DataField label="Start/Stop Status" value={asset.status || identity.operating_status} />
                        <DataField label="Normal Operating Range" value={identity.normal_operating_range} />
                      </>
                    )}
                  </div>
                  {tag.startsWith("60-1001") && (
                    <div className="mt-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-200/60 leading-relaxed italic">
                      "M1/M2 are not assumed to correspond to Element 1/2 until verified from the actual local/DCS display."
                    </div>
                  )}
                </div>
              )}

              {activeTab === "protection" && (
                <div className="space-y-8">
                  <SectionHeader title={isAr ? "نظام الحماية" : "PROTECTION SYSTEM"} icon={ShieldAlert} />
                  
                  {/* Compressors specific protection view if tag matches */}
                  {tag.startsWith("60-1001") ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="glass-card p-6 border-l-2 border-l-primary/40">
                          <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                            <Gauge className="w-4 h-4" /> PRESSURE PROTECTION
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs py-1 border-b border-white/5">
                              <span className="text-white/60">LOW PRESSURE SAFETY VALVE</span>
                              <span className="font-mono font-bold text-white">
                                {matrix.pressure?.low_pressure_safety_valve || "3.7 bar(e)"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs py-1 border-b border-white/5">
                              <span className="text-white/60">HIGH PRESSURE SAFETY VALVE</span>
                              <span className="font-mono font-bold text-white">
                                {matrix.pressure?.high_pressure_safety_valve || "11.0 bar(e)"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                              <span className="text-white/60 text-[10px]">COMPRESSOR OUTLET PRESSURE</span>
                              <div className="flex justify-between">
                                <span className="text-white/40">Warning:</span>
                                <span className="font-mono font-bold text-amber-500 text-xs">
                                  {matrix.pressure?.outlet_pressure_warning || "14.0 bar(e)"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Shutdown:</span>
                                <span className="font-mono font-bold text-red-500 text-xs">
                                  {matrix.pressure?.outlet_pressure_shutdown || "15.0 bar(e)"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="glass-card p-6 border-l-2 border-l-amber-500/40">
                          <h4 className="text-sm font-bold text-amber-500 mb-4 flex items-center gap-2">
                            <Thermometer className="w-4 h-4" /> TEMPERATURE PROTECTION
                          </h4>
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                              <span className="text-white/60 text-[10px]">ELEMENT 1 OUTLET TEMPERATURE</span>
                              <div className="flex justify-between">
                                <span className="text-white/40">Warning:</span>
                                <span className="font-mono font-bold text-amber-500 text-xs">
                                  {matrix.temperature?.element_1_outlet?.warning || "225 °C"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Shutdown:</span>
                                <span className="font-mono font-bold text-red-500 text-xs">
                                  {matrix.temperature?.element_1_outlet?.shutdown || "235 °C"}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                              <span className="text-white/60 text-[10px]">ELEMENT 2 OUTLET TEMPERATURE</span>
                              <div className="flex justify-between">
                                <span className="text-white/40">Warning:</span>
                                <span className="font-mono font-bold text-amber-500 text-xs">
                                  {matrix.temperature?.element_2_outlet?.warning || "225 °C"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Shutdown:</span>
                                <span className="font-mono font-bold text-red-500 text-xs">
                                  {matrix.temperature?.element_2_outlet?.shutdown || "235 °C"}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                              <span className="text-white/60 text-[10px]">ELEMENT 2 INLET TEMPERATURE</span>
                              <div className="flex justify-between">
                                <span className="text-white/40">Warning:</span>
                                <span className="font-mono font-bold text-amber-500 text-xs">
                                  {matrix.temperature?.element_2_inlet?.warning || "65 °C"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Shutdown:</span>
                                <span className="font-mono font-bold text-red-500 text-xs">
                                  {matrix.temperature?.element_2_inlet?.shutdown || "70 °C"}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                              <span className="text-white/60 text-[10px]">OIL TEMPERATURE</span>
                              <div className="flex justify-between">
                                <span className="text-white/40">Warning:</span>
                                <span className="font-mono font-bold text-amber-500 text-xs">
                                  {matrix.temperature?.oil_temperature?.warning || "65 °C"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Shutdown:</span>
                                <span className="font-mono font-bold text-red-500 text-xs">
                                  {matrix.temperature?.oil_temperature?.shutdown || "70 °C"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="glass-card p-6 border-l-2 border-l-blue-500/40">
                          <h4 className="text-sm font-bold text-blue-500 mb-4 flex items-center gap-2">
                            <Droplets className="w-4 h-4" /> OIL PROTECTION
                          </h4>
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                              <span className="text-white/60 text-[10px]">OIL PRESSURE</span>
                              <div className="flex justify-between">
                                <span className="text-white/40">Warning:</span>
                                <span className="font-mono font-bold text-amber-500 text-xs">
                                  {matrix.oil?.shutdown_warning || matrix.oil_protections?.[0]?.warning || "1.3 bar(e)"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Shutdown:</span>
                                <span className="font-mono font-bold text-red-500 text-xs">
                                  {matrix.oil?.shutdown || matrix.oil_protections?.[0]?.shutdown || "1.2 bar(e)"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="glass-card p-6 border-l-2 border-l-red-500/40">
                          <h4 className="text-sm font-bold text-red-500 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> MOTOR PROTECTION (PENDING VERIFICATION)
                          </h4>
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                              <span className="text-white/60 text-[10px]">M1 TEMPERATURE</span>
                              <div className="flex justify-between">
                                <span className="text-white/40 italic">Warning:</span>
                                <span className="font-mono font-bold text-amber-500/70 italic text-xs">
                                  {matrix.temperature?.m1_temperature?.warning || "Pending Verification"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40 italic">Shutdown:</span>
                                <span className="font-mono font-bold text-amber-500/70 italic text-xs">
                                  {matrix.temperature?.m1_temperature?.shutdown || "Pending Verification"}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                              <span className="text-white/60 text-[10px]">M2 TEMPERATURE</span>
                              <div className="flex justify-between">
                                <span className="text-white/40 italic">Warning:</span>
                                <span className="font-mono font-bold text-amber-500/70 italic text-xs">
                                  {matrix.temperature?.m2_temperature?.warning || "Pending Verification"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40 italic">Shutdown:</span>
                                <span className="font-mono font-bold text-amber-500/70 italic text-xs">
                                  {matrix.temperature?.m2_temperature?.shutdown || "Pending Verification"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 p-3 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200/60 leading-relaxed italic">
                              "M1/M2 are not assumed to correspond to Element 1/2 until verified from the actual local/DCS display."
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <DataField label="Alarm" value={identity.alarm} />
                      <DataField label="Trip" value={identity.trip} />
                      <DataField label="Interlock" value={identity.interlock} />
                      <DataField label="Safety Valve" value={matrix.safety_valve || "Pending Verification"} />
                      <DataField label="Warning Limits" value="Pending Verification" />
                      <DataField label="Shutdown Limits" value="Pending Verification" />
                      <DataField label="Protection Notes" value={matrix.notes || "Pending Verification"} full />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "maintenance" && (
                <div className="space-y-8">
                  <SectionHeader title={isAr ? "بيانات الصيانة" : "MAINTENANCE DATA"} icon={Wrench} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DataField label="Running Hours" value={asset.running_hours || "0"} />
                    <DataField label="Maintenance Hours" value="Pending Verification" />
                    <DataField label="Last Maintenance" value={asset.last_maintenance_at || "Pending Verification"} />
                    <DataField label="Next Maintenance" value={asset.next_maintenance_at || "Pending Verification"} />
                    <DataField label="Inspection" value="Pending Verification" />
                    <DataField label="Maintenance Notes" value={identity.maintenance_notes} full />
                    <div className="col-span-full space-y-4">
                      <DataField label="Spare Parts" value="Pending Verification" />
                      {(tag === "60-2201" || tag === "60-2202") && (
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="text-[10px] text-primary uppercase tracking-widest mb-2 font-bold">Vessel Configuration</div>
                          <div className="text-sm text-white font-bold">Dual Vessel System (Vessel 1 & 2)</div>
                        </div>
                      )}
                      {tag === "60-2003" && (
                        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                          <div className="text-[10px] text-red-500 uppercase tracking-widest mb-2 font-bold">Critical Consumers</div>
                          <ul className="text-xs text-white/80 space-y-1 list-disc list-inside">
                            <li>Ammonia Plant 1</li>
                            <li>Ammonia Plant 2</li>
                            <li>Ammonia Storage</li>
                          </ul>
                          <div className="mt-3 p-2 bg-red-500/10 rounded text-[10px] text-red-200 italic">
                            Classification: Critical Continuous Service
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-8">
                  <SectionHeader title={isAr ? "الوثائق الفنية" : "TECHNICAL DOCUMENTS"} icon={FileText} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "P&ID", type: "Drawing" },
                      { name: "Datasheet", type: "Technical Sheet" },
                      { name: "Instruction Book", type: "Manual" },
                      { name: "SOP", type: "Procedure" },
                      { name: "Parts List", type: "Reference" },
                    ].map(doc => (
                      <div key={doc.name} className="glass-card p-6 flex flex-col items-center text-center gap-3 group hover:border-primary/50 transition-all cursor-pointer">
                        <div className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                          <FileSearch className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase">{doc.name}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-tighter">{doc.type}</div>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-white/10 text-white/30 italic">
                          Pending Verification
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-900/80 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/20">
          <div>LIFECO PMS | ASSET MANAGEMENT SYSTEM</div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" /> VERIFIED: FALSE</span>
            <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> CRITICALITY: {asset.criticality?.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}