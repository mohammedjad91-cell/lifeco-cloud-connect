import { motion } from "framer-motion";
import { Info, Gauge, Layers, Droplets, ArrowRight, Settings2, ShieldAlert, Activity, FileText, Wrench, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  plantCode: string;
  lang: "ar" | "en";
}

export function N2PlantPage({ plantCode, lang }: Props) {
  const isAr = lang === "ar";

  const tabs = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview" },
    { id: "block-diagram", label: isAr ? "مخطط الكتلة" : "Block Diagram" },
    { id: "process-flow", label: isAr ? "سير العمليات" : "Process Flow" },
    { id: "register", label: isAr ? "سجل المعدات" : "Equipment Register" },
    { id: "procedures", label: isAr ? "إجراءات التشغيل" : "Operating Procedures" },
    { id: "maintenance", label: isAr ? "الصيانة" : "Maintenance" },
    { id: "docs", label: isAr ? "الوثائق" : "Documents" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white uppercase">{isAr ? "مصنع N2-1" : "N2-1 Plant"}</h1>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button key={tab.id} className="px-4 py-2 text-xs font-bold uppercase rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Block Diagram Section */}
      <div className="glass-card p-8 border border-primary/20">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{isAr ? "مخطط الكتلة" : "N2-1 BLOCK DIAGRAM"}</h2>
        <div className="flex flex-col items-center gap-2">
          {["60-1001A", "60-1001B", "60-1001C"].map(tag => (
            <div key={tag} className="px-4 py-2 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-sm cursor-pointer hover:bg-primary/20">{tag}</div>
          ))}
          <div className="text-white/30">↓</div>
          <div className="px-4 py-2 rounded bg-white/5 border border-white/20 text-white font-mono text-sm cursor-pointer hover:bg-white/10">60-2002</div>
          <div className="text-white/30">↓</div>
          <div className="px-4 py-2 rounded bg-white/5 border border-white/20 text-white font-mono text-sm cursor-pointer hover:bg-white/10">60-2201 / 60-2202</div>
          <div className="text-white/30">↓</div>
          <div className="px-4 py-2 rounded bg-white/5 border border-white/20 text-white font-mono text-sm cursor-pointer hover:bg-white/10">60-2003</div>
          <div className="text-white/30">↓</div>
          <div className="px-4 py-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-sm">MAIN HEADER</div>
          <div className="text-white/30">↓</div>
          <div className="px-4 py-2 rounded bg-white/5 border border-white/20 text-white font-mono text-sm cursor-pointer hover:bg-white/10">04-04</div>
          <div className="flex gap-16 mt-4 border-t border-white/10 pt-4 w-full justify-center">
            <div className="px-4 py-2 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-sm cursor-pointer">PSA</div>
            <div className="px-4 py-2 rounded bg-white/5 border border-white/20 text-white font-mono text-sm">Ammonia Plant 1</div>
            <div className="px-4 py-2 rounded bg-white/5 border border-white/20 text-white font-mono text-sm">Ammonia Plant 2</div>
          </div>
        </div>
      </div>
    </div>
  );
}
