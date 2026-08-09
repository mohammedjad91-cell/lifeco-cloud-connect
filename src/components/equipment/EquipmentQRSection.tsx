import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Printer, Download, QrCode } from "lucide-react";
import html2canvas from "html2canvas";

interface EquipmentQRSectionProps {
  tag: string;
  assetName: string;
  plantCode: string;
}

export function EquipmentQRSection({ tag, assetName, plantCode }: EquipmentQRSectionProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lifeco-pms.lovable.app';
  const qrUrl = `${baseUrl}/equipment/${tag}/pdf`;

  const downloadLabel = async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current, { scale: 3, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    link.download = `QR-Label-${tag}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const printLabel = () => {
    const printContent = qrRef.current;
    if (!printContent) return;
    
    const windowPrint = window.open('', '', 'width=600,height=600');
    if (!windowPrint) return;
    
    windowPrint.document.write('<html><head><title>Print QR Label</title>');
    windowPrint.document.write('<style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:sans-serif;}</style>');
    windowPrint.document.write('</head><body>');
    windowPrint.document.write(printContent.innerHTML);
    windowPrint.document.write('</body></html>');
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" /> Equipment QR Management
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-[10px] bg-white/5" onClick={() => window.open(qrUrl, '_blank')}>
            <QrCode className="w-3 h-3 mr-1" /> VIEW QR PDF
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-[10px] bg-white/5" onClick={downloadLabel}>
            <Download className="w-3 h-3 mr-1" /> DOWNLOAD LABEL
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-[10px] bg-white/5" onClick={printLabel}>
            <Printer className="w-3 h-3 mr-1" /> PRINT LABEL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Printable Label View */}
        <div 
          ref={qrRef}
          className="bg-white p-8 rounded-lg flex flex-col items-center text-black border-4 border-black"
          style={{ width: "320px", margin: "0 auto" }}
        >
          <div className="mb-4 bg-white p-2 border border-slate-200">
            <QRCodeSVG value={qrUrl} size={180} level="H" />
          </div>
          <div className="text-center font-black uppercase w-full">
            <div className="text-3xl tracking-tighter mb-1 border-b-2 border-black pb-1">{tag}</div>
            <div className="text-[14px] leading-tight mb-2 py-1">{assetName}</div>
            <div className="text-[10px] bg-black text-white px-4 py-1.5 mb-2 inline-block tracking-widest">
              {plantCode} • NITROGEN GENERATION
            </div>
            <div className="text-[9px] tracking-[0.2em] text-slate-600 mt-2 font-bold uppercase">
              SCAN FOR EQUIPMENT PDF
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="text-xs font-bold text-primary uppercase mb-2">High-Resolution Engineering Label</h4>
            <p className="text-[10px] text-white/60 leading-relaxed italic">
              Use "Print Label" for physical attachment to equipment. The label contains the tag, name, plant area, and direct PDF access instructions.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="text-xs font-bold text-white/80 uppercase mb-2">QR Functionality System</h4>
            <ul className="text-[10px] text-white/40 space-y-2 list-disc pl-4">
              <li><span className="text-white/60 font-bold">Direct Access:</span> Scans bypass app UI to open engineering PDF.</li>
              <li><span className="text-white/60 font-bold">Offline Ready:</span> Label includes human-readable tag and area.</li>
              <li><span className="text-white/60 font-bold">Mobile First:</span> PDF viewer opens immediately on iOS/Android.</li>
              <li><span className="text-white/60 font-bold">Dynamic URL:</span> Always serves the latest engineering revision.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
