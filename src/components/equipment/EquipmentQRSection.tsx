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
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}/equipment/${tag}`;

  const downloadLabel = async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current, { scale: 3, backgroundColor: "#ffffff" });
    const link = document.createElement("a");
    link.download = `QR-Label-${tag}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const printLabel = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" /> Equipment QR Management
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={downloadLabel}>
            <Download className="w-3 h-3 mr-1" /> Download Label
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={printLabel}>
            <Printer className="w-3 h-3 mr-1" /> Print Label
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Printable Label View */}
        <div 
          ref={qrRef}
          className="bg-white p-6 rounded-lg flex flex-col items-center text-black border-4 border-black"
          style={{ width: "300px", margin: "0 auto" }}
        >
          <div className="mb-4 bg-white p-2 border border-slate-200">
            <QRCodeSVG value={qrUrl} size={180} level="H" />
          </div>
          <div className="text-center font-black uppercase">
            <div className="text-2xl tracking-tighter mb-1">{tag}</div>
            <div className="text-[10px] leading-tight mb-1">{assetName}</div>
            <div className="text-[10px] bg-black text-white px-2 py-0.5 mb-2">{plantCode} • NITROGEN GENERATION</div>
            <div className="text-[8px] tracking-widest text-slate-500 mt-2">SCAN FOR DIGITAL EQUIPMENT CARD</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="text-xs font-bold text-primary uppercase mb-2">QR Status: Active & Static</h4>
            <p className="text-[10px] text-white/60 leading-relaxed">
              This QR code is uniquely linked to the equipment identity. It remains fixed even when maintenance records or technical thresholds are updated.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="text-xs font-bold text-white/80 uppercase mb-2">Security Note</h4>
            <p className="text-[10px] text-white/40 leading-relaxed">
              Scanning this code provides read-only access to the digital equipment card. Any modifications require secure authenticated access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
