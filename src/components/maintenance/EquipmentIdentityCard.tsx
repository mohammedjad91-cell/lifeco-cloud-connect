import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Gauge, Thermometer, Droplets, Zap, Activity, Clock, 
  Settings2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Info, BarChart3, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProtectionMatrixProps {
  matrix: any;
  control: any;
  running: any;
  ar: boolean;
}

export function EquipmentIdentityCard({ matrix, control, running, ar }: ProtectionMatrixProps) {
  const [activeTab, setActiveTab] = useState<"protection" | "control" | "running">("protection");

  const SectionHeader = ({ icon: Icon, title, subtitle }: any) => (
    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/10">
      <div className="p-2 rounded-lg bg-primary/20 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        <p className="text-[10px] text-muted-foreground uppercase">{subtitle}</p>
      </div>
    </div>
  );

  const DataRow = ({ label, value, subValue, warning }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/60">{label}</span>
      <div className="text-right">
        <div className={`text-xs font-mono font-bold ${warning ? 'text-amber-400' : 'text-white'}`}>
          {value}
        </div>
        {subValue && <div className="text-[10px] text-muted-foreground italic">{subValue}</div>}
      </div>
    </div>
  );

  const ProtectionSection = ({ title, data, icon, type }: any) => {
    if (!data) return null;
    
    // specialized rendering for temperature to handle nested warning/shutdown objects
    if (type === 'temperature') {
      return (
        <div className="glass-card p-4 border-l-2 border-l-amber-500/40">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-amber-500 uppercase">
            {icon} {title}
          </div>
          <div className="space-y-3">
            {Object.entries(data).map(([key, val]: [string, any]) => {
              const label = key.replace(/_/g, ' ').toUpperCase();
              
              // if it's a nested object with warning/shutdown
              if (val && typeof val === 'object' && (val.warning || val.shutdown)) {
                return (
                  <div key={key} className="py-2 border-b border-white/5 last:border-0">
                    <div className="text-[10px] text-white/60 mb-1">{label}</div>
                    <div className="flex justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase">Warning</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{val.warning || "Pending"}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] text-white/40 uppercase">Shutdown</span>
                        <span className="text-xs font-mono font-bold text-red-500">{val.shutdown || "Pending"}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return <DataRow key={key} label={label} value={val} />;
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="glass-card p-4 border-l-2 border-l-primary/40">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-primary uppercase">
          {icon} {title}
        </div>
        <div className="space-y-1">
          {Object.entries(data).map(([key, val]: [string, any]) => {
            const label = key.replace(/_/g, ' ').toUpperCase();
            if (val && typeof val === 'object' && !Array.isArray(val)) {
              return (
                <DataRow 
                  key={key} 
                  label={label} 
                  value={val.factory || val.value || "Pending"} 
                  subValue={val.max ? `Max: ${val.max}` : undefined} 
                />
              );
            }
            return <DataRow key={key} label={label} value={val} />;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
        {[
          { id: "protection", icon: ShieldAlert, label: ar ? "مصفوفة الحماية" : "Protection Matrix" },
          { id: "control", icon: Settings2, label: ar ? "التحكم التشغيلي" : "Operating Control" },
          { id: "running", icon: Activity, label: ar ? "بيانات التشغيل" : "Running Data" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-bold uppercase transition-all
              ${activeTab === tab.id 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {activeTab === "protection" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <ProtectionSection 
                  title="Pressure Protection" 
                  icon={<Gauge className="w-3.5 h-3.5"/>} 
                  data={matrix?.pressure} 
                />
                <ProtectionSection 
                  title="Temperature Protection" 
                  icon={<Thermometer className="w-3.5 h-3.5"/>} 
                  data={matrix?.temperature} 
                  type="temperature"
                />
              </div>
              <div className="space-y-4">
                <ProtectionSection 
                  title="Oil Protection" 
                  icon={<Droplets className="w-3.5 h-3.5"/>} 
                  data={matrix?.oil} 
                />
                <ProtectionSection 
                  title="Motor & Starter" 
                  icon={<Zap className="w-3.5 h-3.5"/>} 
                  data={matrix?.motor_starter} 
                />
                <ProtectionSection 
                  title="Condensate Drain" 
                  icon={<Droplets className="w-3.5 h-3.5"/>} 
                  data={matrix?.electronic_drain} 
                />
              </div>
            </div>
          )}

          {activeTab === "control" && (
            <div className="glass-card p-6 border-l-2 border-l-amber-500/40">
              <SectionHeader icon={Settings2} title="Operating Control" subtitle="Loading / Unloading Parameters" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {Object.entries(control || {}).map(([key, val]: [string, any]) => (
                  <DataRow 
                    key={key} 
                    label={key.replace(/_/g, ' ').toUpperCase()} 
                    value={val} 
                    warning={val === "Pending Verification"}
                  />
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-200/70 italic leading-relaxed">
                  These parameters are critical for automated load regulation. 
                  Ensure verification from local controller or DCS before changing status.
                </p>
              </div>
            </div>
          )}

          {activeTab === "running" && (
            <div className="glass-card p-6 border-l-2 border-l-emerald-500/40">
              <SectionHeader icon={Clock} title="Running & Service Hours" subtitle="Maintenance Life Cycle Tracking" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(running || {}).map(([key, val]: [string, any]) => (
                  <div key={key} className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-[9px] text-white/40 uppercase tracking-tighter mb-1">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className={`text-lg font-mono font-bold ${val === "Pending Verification" ? 'text-white/20' : 'text-emerald-400'}`}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
