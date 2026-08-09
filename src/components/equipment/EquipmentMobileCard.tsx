import React, { useState } from "react";
import { 
  Info, Activity, ShieldAlert, Layers, Wrench, FileText, 
  MapPin, Factory, AlertTriangle, FileDown, Printer, QrCode, Share2, Download, FileType
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EquipmentIdentityCard } from "@/components/maintenance/EquipmentIdentityCard";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";

interface EquipmentMobileCardProps {
  data: any;
}

export function EquipmentMobileCard({ data }: EquipmentMobileCardProps) {
  const [activeTab, setActiveTab] = useState("identity");
  const asset = data?.asset || {};
  const tag = data?.equipment_tag;
  const plantCode = "N2-1";
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/equipment/${tag}`;

  const tabs = [
    { id: "identity", label: "IDENTITY", icon: Info },
    { id: "process", label: "PROCESS", icon: Layers },
    { id: "operating", label: "OPERATING", icon: Activity },
    { id: "protection", label: "PROTECTION", icon: ShieldAlert },
    { id: "maintenance", label: "MAINTENANCE", icon: Wrench },
    { id: "documents", label: "DOCUMENTS", icon: FileText },
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
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${tag}-Equipment-Card.pdf`);
  };

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LIFECO Equipment Card: ${tag}`,
          text: `Digital Identity Card for ${tag} (${data.equipment_name})`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans pb-10">
      {/* Mobile Header */}
      <div className="p-5 bg-slate-900 border-b border-white/10 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-primary/80 uppercase mb-1">
          <MapPin className="w-3 h-3" /> {plantCode} | {asset.location || "NITROGEN GENERATION"}
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">{tag}</h1>
        <div className="text-xs text-white/60 mb-4">{data.equipment_name || asset.asset_name}</div>
        
        <div className="flex flex-col gap-2">
          <Button className="w-full h-10 font-bold bg-primary text-white" onClick={generatePDF}>
            <FileType className="w-4 h-4 mr-2" /> 📄 Equipment Card PDF
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-10 text-xs bg-white/5" onClick={shareCard}>
              <Share2 className="w-4 h-4 mr-2" /> 📤 Share
            </Button>
            <Button variant="outline" className="h-10 text-xs bg-white/5" onClick={generatePDF}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex overflow-x-auto bg-slate-900/50 border-b border-white/10 no-scrollbar sticky top-[180px] z-10 backdrop-blur-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap
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
            className="space-y-6"
          >
            {activeTab === "identity" && (
              <div className="grid grid-cols-2 gap-3">
                <DataField label="Tag" value={tag} />
                <DataField label="Plant" value={plantCode} />
                <DataField label="Manufacturer" value={data.manufacturer} />
                <DataField label="Model" value={data.model} />
                <DataField label="Service" value={data.service} />
                <DataField label="Status" value={asset.status || "ACTIVE"} />
              </div>
            )}

            {activeTab === "protection" && (
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <EquipmentIdentityCard 
                  matrix={data.protection_matrix} 
                  control={data.operating_control}
                  running={data.detailed_running_data}
                  ar={false}
                  tag={tag}
                />
              </div>
            )}
            
            {/* QR Section - Specific requirement */}
            <div className="p-6 rounded-2xl bg-white flex flex-col items-center mt-6">
              <QRCodeSVG value={shareUrl} size={200} level="H" />
              <p className="text-black text-xs font-bold mt-4 uppercase tracking-widest text-center">
                Scan for latest Digital Equipment Card
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
