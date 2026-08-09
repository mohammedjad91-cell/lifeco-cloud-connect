import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Gauge, Thermometer, Droplets, Zap, Activity, Clock, 
  Settings2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Info, BarChart3, AlertCircle, QrCode, FileType, Eye, Download, Share2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { generateEquipmentPDF } from "@/utils/equipment-pdf";

interface ProtectionMatrixProps {
  matrix: any;
  control: any;
  running: any;
  ar: boolean;
  tag: string;
  fullData?: any;
}

export function EquipmentIdentityCard({ matrix, control, running, ar, tag, fullData }: ProtectionMatrixProps) {
  const [activeTab, setActiveTab] = useState<"protection" | "control" | "running" | "qr">("protection");
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pdfApiUrl = tag ? `${baseUrl}/api/public/equipment/${tag}/pdf` : '';

  const handleViewPDF = () => {
    if (!pdfApiUrl) return;
    const viewUrl = `${pdfApiUrl}?mode=view`;
    window.open(viewUrl, '_blank');
  };

  const handleDownloadPDF = async () => {
    if (!pdfApiUrl) return;
    try {
      const response = await fetch(pdfApiUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `N2-1_${tag}_Equipment_Card.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to direct link if fetch fails
      window.open(pdfApiUrl, '_blank');
    }
  };

  const handleSharePDF = async () => {
    if (!pdfApiUrl) return;

    try {
      const response = await fetch(pdfApiUrl);
      const blob = await response.blob();
      const file = new File([blob], `N2-1_${tag}_Equipment_Card.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `LIFECO Equipment Card: ${tag}`,
          text: `Official Technical Documentation for N2-1 ${tag}`,
        });
      } else if (navigator.share) {
        // Fallback to sharing the URL if file sharing is not supported
        await navigator.share({
          title: `LIFECO Equipment Card: ${tag}`,
          text: `Official Technical Documentation for N2-1 ${tag}`,
          url: pdfApiUrl
        });
      } else {
        throw new Error("Sharing not supported");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Error sharing:", err);
        navigator.clipboard.writeText(pdfApiUrl);
        alert(ar ? "تم نسخ رابط PDF إلى الحافظة" : "PDF link copied to clipboard");
      }
    }
  };

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
    
    return (
      <div className="glass-card p-4 border-l-2 border-l-primary/40">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-primary uppercase">
          {icon} {title}
        </div>
        <div className="space-y-1">
          {Object.entries(data).map(([key, val]: [string, any]) => {
            const label = key.replace(/_/g, ' ').toUpperCase();
            
            if (val && typeof val === 'object' && !Array.isArray(val)) {
              if (val.warning || val.shutdown) {
                return (
                  <div key={key} className="py-2 border-b border-white/5 last:border-0">
                    <div className="text-[10px] text-white/60 mb-1">{label}</div>
                    <div className="flex justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-white/40 uppercase">Warning</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{val.warning || "Pending"}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] text-white/40 uppercase">Shutdown</span>
                        <span className="text-xs font-mono font-bold text-red-500">{val.shutdown || "Pending"}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
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
          { id: "running", icon: Activity, label: ar ? "بيانات التشغيل" : "Running Data" },
          { id: "qr", icon: QrCode, label: ar ? "رمز الاستجابة" : "Digital QR" }
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

          {activeTab === "qr" && (
            <div className="glass-card p-6 border-l-2 border-l-primary/40 flex flex-col items-center text-center">
              <SectionHeader icon={QrCode} title={ar ? "رمز الهوية الرقمية" : "DIGITAL IDENTITY QR"} subtitle={ar ? "امسح للوصول إلى أحدث بطاقة" : "Scan to access latest card"} />
              
              <div className="bg-white p-6 rounded-2xl mb-6 shadow-inner border border-slate-200">
                {pdfApiUrl && <QRCodeSVG value={pdfApiUrl} size={180} level="H" includeMargin={true} />}
              </div>

              <div className="w-full space-y-4">
                <p className="text-[11px] text-white/60 max-w-xs mx-auto italic font-bold mb-4">
                  {ar 
                    ? `مسح هذا الرمز من جهاز محمول يفتح بطاقة الهوية الرقمية الموثقة لـ ${tag || 'هذه الوحدة'}.`
                    : `Scanning this code from a mobile device opens the verified digital identity card for ${tag || 'this unit'}.`}
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    className="w-full h-12 bg-primary text-white font-black uppercase tracking-tighter text-sm"
                    onClick={handleDownloadPDF}
                  >
                    <FileType className="w-5 h-5 mr-2" /> EQUIPMENT CARD PDF
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="bg-white/5 h-10 text-[10px] font-bold" onClick={handleViewPDF}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> VIEW PDF
                    </Button>
                    <Button variant="outline" className="bg-white/5 h-10 text-[10px] font-bold" onClick={handleDownloadPDF}>
                      <Download className="w-3.5 h-3.5 mr-1" /> DOWNLOAD
                    </Button>
                    <Button variant="outline" className="bg-white/5 h-10 text-[10px] font-bold" onClick={handleSharePDF}>
                      <Share2 className="w-3.5 h-3.5 mr-1" /> SHARE
                    </Button>
                  </div>
                </div>

                <div className="mt-4 text-[9px] text-white/40 uppercase tracking-widest border-t border-white/10 pt-4 w-full font-black">
                  Scan for latest digital Equipment Card
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
