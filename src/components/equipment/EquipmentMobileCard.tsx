import React, { useState } from "react";
import { 
  Info, Activity, ShieldAlert, Layers, Wrench, FileText, 
  MapPin, Factory, AlertTriangle, FileDown, Printer, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EquipmentIdentityCard } from "@/components/maintenance/EquipmentIdentityCard";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface EquipmentMobileCardProps {
  data: any;
}

export function EquipmentMobileCard({ data }: EquipmentMobileCardProps) {
  const [activeTab, setActiveTab] = useState("identity");
  const asset = data?.asset || {};
  const tag = data?.equipment_tag;
  const plantCode = "N2-1"; // Specific to this request scope

  const tabs = [
    { id: "identity", label: "Identity", icon: Info },
    { id: "process", label: "Process", icon: Layers },
    { id: "operating", label: "Operating", icon: Activity },
    { id: "protection", label: "Protection", icon: ShieldAlert },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  const DataField = ({ label, value, warning = false }: any) => (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="text-[9px] text-white/40 uppercase tracking-widest mb-1 font-bold">{label}</div>
      <div className={`text-sm font-mono break-words ${value === "Pending Verification" || warning ? 'text-amber-500/70 italic' : 'text-white font-bold'}`}>
        {value || "Pending Verification"}
      </div>
    </div>
  );

  const generatePDF = async () => {
    const element = document.getElementById("mobile-card-content");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#020617" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${tag}-identity-card.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Mobile Header */}
      <div className="p-5 bg-slate-900 border-b border-white/10 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-primary/80 uppercase mb-1">
          <MapPin className="w-3 h-3" /> {plantCode} | {asset.location || "NITROGEN GENERATION"}
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">{tag}</h1>
        <div className="text-xs text-white/60 mb-3">{data.equipment_name || asset.asset_name}</div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]">
            {asset.status || "ACTIVE"}
          </Badge>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 text-[10px] bg-white/5 border-white/10" onClick={generatePDF}>
              <FileDown className="w-3 h-3 mr-1" /> PDF
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-[10px] bg-white/5 border-white/10" onClick={() => window.print()}>
              <Printer className="w-3 h-3 mr-1" /> PRINT
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation - Horizontal Scroll */}
      <div className="flex overflow-x-auto bg-slate-900/50 border-b border-white/10 no-scrollbar sticky top-[133px] z-10 backdrop-blur-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap
              ${activeTab === tab.id 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-white/40"}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 overflow-y-auto" id="mobile-card-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "identity" && (
              <div className="grid grid-cols-2 gap-3">
                <DataField label="Manufacturer" value={data.manufacturer} />
                <DataField label="Model" value={data.model} />
                <DataField label="Serial No" value="Pending Verification" />
                <DataField label="Capacity" value={data.capacity} />
                <DataField label="Service" value={data.service} />
                <DataField label="Upstream" value={data.upstream} />
                <DataField label="Downstream" value={data.downstream} />
              </div>
            )}

            {activeTab === "protection" && (
              <div className="space-y-4">
                <EquipmentIdentityCard 
                  matrix={data.protection_matrix} 
                  control={data.operating_control}
                  running={data.detailed_running_data}
                  ar={false}
                />
              </div>
            )}

            {activeTab === "operating" && (
              <div className="grid grid-cols-2 gap-3">
                <DataField label="Operating Pressure" value={data.operating_control?.operating_pressure || "9.1 bar"} />
                <DataField label="Running Hours" value={data.detailed_running_data?.running_hours || asset.running_hours} />
                <DataField label="Status" value={asset.status} />
              </div>
            )}
            
            {/* Other tabs simplified for mobile overview */}
            {["process", "maintenance", "documents"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-10 text-white/20">
                <AlertTriangle className="w-12 h-12 mb-2" />
                <p className="text-xs uppercase tracking-widest font-bold">Standard Data Applies</p>
                <p className="text-[10px] mt-2">View full desktop card for documentation.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-5 border-t border-white/10 text-center bg-slate-900/30">
        <div className="flex justify-center mb-4 opacity-50">
          <QrCode className="w-12 h-12" />
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
          LIFECO DIGITAL EQUIPMENT CARD • SECURE SYSTEM
        </p>
      </div>
    </div>
  );
}
