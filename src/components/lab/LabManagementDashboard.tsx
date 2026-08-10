import React from "react";
import { motion } from "framer-motion";
import { Factory, Droplets, FlaskConical, Beaker } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface LabManagementDashboardProps {
  onSelectSource: (source: string) => void;
}

const LabManagementDashboard: React.FC<LabManagementDashboardProps> = ({ onSelectSource }) => {
  const { lang } = useI18n();
  
  const sources = [
    {
      id: "NITROGEN",
      label: "Nitrogen Plant Samples",
      labelAr: "عينات مصنع النيتروجين",
      sub: "Process / Quality Samples",
      subAr: "عينات العمليات / الجودة",
      icon: Factory,
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/50"
    },
    {
      id: "AMM1",
      label: "Ammonia Plant 1 Samples",
      labelAr: "عينات مصنع الأمونيا 1",
      sub: "Process / Quality Samples",
      subAr: "عينات العمليات / الجودة",
      icon: Beaker,
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/50"
    },
    {
      id: "AMM2",
      label: "Ammonia Plant 2 Samples",
      labelAr: "عينات مصنع الأمونيا 2",
      sub: "Process / Quality Samples",
      subAr: "عينات العمليات / الجودة",
      icon: FlaskConical,
      color: "from-violet-500/20 to-purple-500/20",
      borderColor: "border-violet-500/50"
    },
    {
      id: "AMM_STORAGE",
      label: "Ammonia Storage Samples",
      labelAr: "عينات خزانات الأمونيا",
      sub: "Storage / Product Samples",
      subAr: "عينات التخزين / المنتج",
      icon: Droplets,
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
      {sources.map((source, index) => (
        <motion.button
          key={source.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelectSource(source.id)}
          className={`glass-card p-6 text-left hover:neon-border transition-all group relative overflow-hidden ${source.borderColor}`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${source.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-secondary/50 group-hover:bg-primary/20 transition-colors">
              <source.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                {lang === "ar" ? source.labelAr : source.label}
              </h3>
              <p className="text-muted-foreground mt-1">
                {lang === "ar" ? source.subAr : source.sub}
              </p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default LabManagementDashboard;
