import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Gauge, Layers, Droplets, ArrowRight, Settings2, ShieldAlert, Activity, FileText, Wrench, BookOpen, ChevronRight, X, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  plantCode: string;
  lang: "ar" | "en";
  onSelectEquipment: (tag: string) => void;
  onClose: () => void;
}

export function N2EquipmentRegister({ plantCode, lang, onSelectEquipment, onClose }: Props) {
  const isAr = lang === "ar";
  
  const equipment = [
    { tag: "60-1001A", name: isAr ? "ضاغط" : "Compressor" },
    { tag: "60-1001B", name: isAr ? "ضاغط" : "Compressor" },
    { tag: "60-1001C", name: isAr ? "ضاغط" : "Compressor" },
    { tag: "60-2002", name: isAr ? "خزان هواء" : "Air Receiver" },
    { tag: "60-2201", name: isAr ? "مجفف" : "Dryer" },
    { tag: "60-2202", name: isAr ? "مجفف" : "Dryer" },
    { tag: "60-2003", name: isAr ? "خزان هواء / توزيع" : "Air Receiver / Distribution" },
    { tag: "04-04", name: isAr ? "صمام تحكم" : "Control Valve" },
    { tag: "Nitrogen PSA Unit", name: isAr ? "وحدة فصل النيتروجين (في انتظار التحقق)" : "Nitrogen PSA Unit - Pending Tag Verification" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-background/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-4xl bg-slate-950 border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden min-h-[60vh]">
        <div className="p-6 bg-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Factory className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
                {isAr ? "معدات المصنع" : "N2-1 Equipment Register"}
              </h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                {isAr ? "سجل معدات N2-1" : "N2-1 ASSET INVENTORY"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white hover:bg-white/10 rounded-full h-12 w-12">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipment.map((eq) => (
              <button
                key={eq.tag}
                onClick={() => onSelectEquipment(eq.tag)}
                className="glass-card p-6 text-left hover:neon-border transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-primary font-mono text-lg font-black tracking-tighter group-hover:scale-105 transition-transform origin-left">
                    {eq.tag}
                  </div>
                  <div className="text-white/60 text-sm font-bold uppercase mt-1">
                    {eq.name}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border-t border-white/10 text-[10px] font-mono text-white/20 text-center">
          LIFECO PMS | N2-1 ASSET MANAGEMENT
        </div>
      </div>
    </motion.div>
  );
}
