import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Send, FileDown, Printer, Shield, FileCheck, AlertTriangle } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";

interface BaseFormLayoutProps {
  title: string;
  formNumber?: string;
  status?: string;
  children: React.ReactNode;
  onSave?: () => void;
  onSubmit?: () => void;
  onExportPDF?: () => void;
  onPrint?: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
}

export const BaseFormLayout: React.FC<BaseFormLayoutProps> = ({
  title,
  formNumber,
  status,
  children,
  onSave,
  onSubmit,
  onExportPDF,
  onPrint,
  onBack,
  isSubmitting,
  isSubmitted,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-900 p-4 md:p-8 font-sans relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Modern Toolbar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 sticky top-4 z-50 glass-card px-6 py-4 border border-white/10 shadow-2xl no-print"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-1" /> رجوع
            </Button>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">{title}</h1>
              {formNumber && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">
                    {formNumber}
                  </span>
                  {status && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                      status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      status === 'submitted' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {status === 'approved' ? <FileCheck className="w-3 h-3" /> : status === 'submitted' ? <Send className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {status}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted && (
              <>
                <Button variant="outline" size="sm" onClick={onSave} disabled={isSubmitting} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <Save className="w-4 h-4 mr-2" /> حفظ مسودة
                </Button>
                <Button variant="default" size="sm" onClick={onSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border-none">
                  <Send className="w-4 h-4 mr-2" /> تقديم رسمي
                </Button>
              </>
            )}
            {isSubmitted && (
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-bold">
                 <Shield className="w-4 h-4" /> تم التقديم بنجاح
               </div>
            )}
            <div className="h-8 w-px bg-white/10 mx-2" />
            <Button variant="outline" size="sm" onClick={onExportPDF} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              <FileDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Form Content - Replicating LIFECO Paper Document Identity but with Modern Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group no-print"
        >
          {/* Decorative frame for the app view */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          
          <Card className="relative bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border-none overflow-hidden print:shadow-none print:border-none rounded-xl">
            <div className="p-8 md:p-14 space-y-10">
               {/* Document Header - Replicating Official Paper Identity */}
              <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-8 mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white font-black text-3xl rounded-lg shadow-xl">L</div>
                     <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-slate-900">LIFECO</h2>
                      <p className="text-[11px] font-bold text-slate-500 mt-1">Libyan Norwegian Fertilizer Company</p>
                      <div className="h-1 w-20 bg-blue-600 mt-2" />
                     </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tight">{title}</h3>
                  <div className="inline-block px-3 py-1 bg-slate-100 rounded text-[10px] space-y-0.5 text-slate-600 font-mono font-bold border border-slate-200">
                     <p>FORM NO: LIFECO-HSE-WP-01</p>
                     <p>REV: 02 / 2026</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="relative">
                {children}
              </div>

              {/* Document Footer */}
              <div className="pt-10 border-t-2 border-slate-100 mt-16 text-[10px] text-slate-400 flex justify-between items-center font-bold tracking-tight">
                <div className="flex items-center gap-2 uppercase">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Official Digital Document — Security Verified
                </div>
                <p className="italic">Page 1 of 1</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Print Only Version (Simple, Clean) */}
        <div className="hidden print:block bg-white text-slate-900 p-0">
           {/* Exact Paper Header */}
           <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white font-bold text-xl rounded">L</div>
                 <div>
                  <h2 className="text-xl font-bold uppercase tracking-tighter">LIFECO</h2>
                  <p className="text-[8px] font-bold text-slate-600">Libyan Norwegian Fertilizer Company</p>
                 </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold uppercase">{title}</h3>
                <p className="text-[8px] font-mono">FORM: LIFECO-HSE-WP-01 | REV: 02/2026</p>
                {formNumber && <p className="text-[10px] font-bold mt-1">NO: {formNumber}</p>}
              </div>
           </div>
           {children}
           <div className="mt-12 pt-4 border-t border-slate-200 text-[8px] text-slate-400 flex justify-between uppercase">
             <p>Digital signature verified via LIFECO PMS</p>
             <p>Printed on: {new Date().toLocaleString()}</p>
           </div>
        </div>
      </div>
    </div>
  );
};
