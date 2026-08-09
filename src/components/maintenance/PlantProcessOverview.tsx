import { motion } from "framer-motion";
import { Info, ShieldAlert, ArrowRight, Gauge, Layers, Droplets } from "lucide-react";

interface Props {
  lang: "ar" | "en";
  onSelectEquipment?: (tag: string) => void;
}

export function PlantProcessOverview({ lang, onSelectEquipment }: Props) {
  const isAr = lang === "ar";

  const flowSteps = [
    {
      tags: ["60-1001A", "60-1001B", "60-1001C"],
      name: isAr ? "ضواغط الهواء" : "Air Compressors",
      description: isAr ? "ضغط الهواء الجوي" : "Atmospheric Air Compression",
      icon: <Gauge className="w-5 h-5 text-primary" />,
    },
    {
      tags: ["60-2002"],
      name: isAr ? "خزان هواء" : "Air Receiver",
      description: isAr ? "تخزين وتخفيف النبضات" : "Storage & Pulsation Dampening",
      icon: <Layers className="w-5 h-5 text-primary" />,
    },
    {
      tags: ["60-2201", "60-2202"],
      name: isAr ? "منظومة التجفيف" : "Air Dryers",
      description: isAr ? "إزالة الرطوبة (Dew Point Control)" : "Moisture Removal",
      icon: <Droplets className="w-5 h-5 text-primary" />,
    },
    {
      tags: ["60-2003"],
      name: isAr ? "خزان توزيع الهواء" : "Air Receiver / Distribution",
      description: isAr ? "نقطة التوزيع الرئيسية" : "Main Distribution Hub",
      icon: <Layers className="w-5 h-5 text-primary" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">
          {isAr ? "نظرة عامة على سير العمليات" : "Process Flow / Operating Overview"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {flowSteps.map((step, idx) => (
          <div key={idx} className="relative group">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-4 h-full border-white/10 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  {step.icon}
                </div>
                <div className="flex flex-wrap gap-1">
                  {step.tags.map(tag => (
                    <span 
                      key={tag} 
                      onClick={() => onSelectEquipment?.(tag)}
                      className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-primary-foreground/70 cursor-pointer hover:bg-primary/20 hover:border-primary/30 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{step.name}</h3>
              <p className="text-[11px] text-white/50 leading-relaxed">{step.description}</p>
            </motion.div>
            
            {idx < flowSteps.length - 1 && (
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 border-l-4 border-l-primary"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              1. CRITICAL INSTRUMENT AIR
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Continuous Service
            </span>
          </div>
          <div className="space-y-3">
            <div className="text-xs text-white/70 flex items-center gap-2">
              <ArrowRight className="w-3 h-3" /> Ammonia Plant 1
            </div>
            <div className="text-xs text-white/70 flex items-center gap-2">
              <ArrowRight className="w-3 h-3" /> Ammonia Plant 2
            </div>
            <div className="text-xs text-white/70 flex items-center gap-2">
              <ArrowRight className="w-3 h-3" /> Ammonia Storage
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-white/40 italic">
            {isAr 
              ? "خدمة مستمرة وحرجة. فقدان هواء الآلات يؤثر على تشغيل المصانع والتحكم في التخزين."
              : "Critical Continuous Service. Loss may affect plant operation and storage controls."}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5 border-l-4 border-l-amber-500/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-amber-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              2. NITROGEN GENERATION
            </h4>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-500/5 rounded border border-amber-500/20">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-amber-500 font-bold tracking-tighter">Nitrogen PSA Unit</span>
              <div className="text-[9px] text-amber-500/70 font-medium italic">
                {isAr ? "في انتظار التحقق من البيانات الفنية" : "Pending Technical Verification"}
              </div>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-white/40 leading-relaxed">
            {isAr
              ? "يتم تزويد وحدة PSA بالهواء من 60-2003 لإنتاج النيتروجين. (Status: Pending Tag Verification)"
              : "PSA unit supplied with air from 60-2003 to produce Nitrogen. (Status: Pending Tag Verification)"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
