import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Zap, Shield, HelpCircle, History, ArrowRight, ClipboardList } from "lucide-react";
import WorkPermitForm from "./forms/lifeco/WorkPermitForm";

interface PermitCenterProps {
  plantCode: string;
  departmentKey: string;
}

const PermitCenter: React.FC<PermitCenterProps> = ({ plantCode, departmentKey }) => {
  const { lang } = useI18n();
  const [view, setView] = useState<"list" | "categories" | "form">("list");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const categories = [
    { 
      id: "work_permit", 
      title: "تصريح عمل", 
      subtitle: "WORK PERMIT", 
      icon: <FileText className="w-8 h-8" />,
      description: "Hot, Cold, and Confined Space Entry"
    },
    { 
      id: "electrical_permit", 
      title: "تصريح عمل كهربائي", 
      subtitle: "ELECTRICAL WORK PERMIT", 
      icon: <Zap className="w-8 h-8" />,
      description: "Electrical isolation and high voltage work"
    },
    { 
      id: "scaffolding_permit", 
      title: "تصريح سقالات", 
      subtitle: "SCAFFOLDING PERMIT", 
      icon: <Shield className="w-8 h-8" />,
      description: "Scaffold erection and safe access"
    },
    { 
      id: "safety_valve_permit", 
      title: "تصريح صمام أمان", 
      subtitle: "SAFETY VALVE WORK PERMIT", 
      icon: <HelpCircle className="w-8 h-8" />,
      description: "Safety valve maintenance and testing"
    }
  ];

  const handleCreateNew = () => {
    setView("categories");
  };

  const handleSelectCategory = (typeId: string) => {
    if (typeId === "work_permit") {
      setSelectedType(typeId);
      setView("form");
    } else {
      // Temporary placeholder for others
      alert(lang === "ar" ? "سيتم توفير هذا النموذج قريباً" : "This form will be available soon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {lang === "ar" ? `التصاريح الخاصة بمصنع ${plantCode}` : `Permits for Plant ${plantCode}`}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "إدارة تصاريح العمل الرسمية" : "Manage official work permits"}
          </p>
        </div>
        
        {view === "list" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => (window as any).location.href = (window as any).location.pathname.replace('/permits', '/form-history')} className="gap-2 border-white/20 text-white hover:bg-white/10">
              <ClipboardList className="w-4 h-4" />
              {lang === "ar" ? "سجل النماذج" : "Form History"}
            </Button>
            <Button onClick={handleCreateNew} className="gap-2 neon-border">
              <Plus className="w-4 h-4" />
              {lang === "ar" ? "إنشاء تصريح" : "Create Permit"}
            </Button>
          </div>
        )}
        
        {view !== "list" && (
          <Button variant="ghost" onClick={() => {
            if (view === "form") setView("categories");
            else setView("list");
          }} className="text-muted-foreground gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            {lang === "ar" ? "رجوع" : "Back"}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Active", "Under Review", "Approved", "Closed", "Rejected"].map((status) => (
                <div key={status} className="glass-card p-4 hover:neon-border cursor-pointer group transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-primary tracking-widest uppercase">{status}</span>
                    <History className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === "ar" ? "لا توجد سجلات حالياً" : "No records currently"}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="glass-card p-12 text-center border-dashed border-2">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">
                {lang === "ar" ? "لا توجد تصاريح نشطة في هذا المصنع حالياً. يمكنك مراجعة 'سجل النماذج' في صفحة الصيانة." : "No active permits in this plant currently. You can check 'Form History' in the Maintenance page."}
              </p>
            </div>
          </motion.div>
        )}

        {view === "categories" && (
          <motion.div 
            key="categories"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectCategory(cat.id)}
                className="glass-card p-8 text-left hover:neon-border transition-all flex items-center gap-6 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  {cat.icon}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors shrink-0">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-mono text-primary/60 tracking-tighter mb-2">
                    {cat.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
              </motion.button>
            ))}
          </motion.div>
        )}

        {view === "form" && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {selectedType === "work_permit" && (
              <WorkPermitForm plantCode={plantCode} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PermitCenter;
