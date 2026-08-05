import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Send, FileDown, Printer, History } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";

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
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 bg-white/80 backdrop-blur px-4 py-3 border rounded-xl shadow-sm no-print">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> رجوع
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-lg font-bold">{title}</h1>
              {formNumber && <p className="text-xs text-slate-500 uppercase tracking-wider">{formNumber}</p>}
            </div>
            {status && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted && (
              <>
                <Button variant="outline" size="sm" onClick={onSave} disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-1" /> حفظ مسودة
                </Button>
                <Button variant="default" size="sm" onClick={onSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Send className="w-4 h-4 mr-1" /> تقديم
                </Button>
              </>
            )}
            {isSubmitted && (
               <Button variant="outline" size="sm" onClick={() => {}} className="text-slate-400 cursor-not-allowed">
                تم التقديم
              </Button>
            )}
            <div className="h-6 w-px bg-slate-200" />
            <Button variant="outline" size="sm" onClick={onExportPDF}>
              <FileDown className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="w-4 h-4 mr-1" /> طباعة
            </Button>
          </div>
        </div>

        {/* Form Content - Replicating LIFECO Paper Document Identity */}
        <Card className="bg-white shadow-2xl border-slate-300 overflow-hidden print:shadow-none print:border-none">
          <div className="p-8 md:p-12 space-y-8">
             {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white font-bold text-xl rounded">L</div>
                   <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">LIFECO</h2>
                    <p className="text-[10px] font-bold text-slate-600">Libyan Norwegian Fertilizer Company</p>
                   </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <h3 className="text-xl font-bold uppercase">{title}</h3>
                <div className="text-[10px] space-y-0.5 text-slate-500 font-mono">
                   <p>FORM NO: LIFECO-HSE-WP-01</p>
                   <p>REV: 02 / 2026</p>
                </div>
              </div>
            </div>

            {children}

            {/* Document Footer */}
            <div className="pt-8 border-t border-slate-200 mt-12 text-[9px] text-slate-400 flex justify-between items-center italic">
              <p>© 2026 LIFECO Digital Transformation Platform - Official Document</p>
              <p>Page 1 of 1</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
