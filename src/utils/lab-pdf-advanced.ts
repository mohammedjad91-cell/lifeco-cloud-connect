import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import QRCode from "qrcode";

export interface LabPdfData {
  plant: string;
  sampleType: string;
  analyst: string;
  badge: string;
  readings: Record<string, any>;
  timestamp: string;
}

export const generateLabPdf = async (data: LabPdfData) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), "dd MMM yyyy HH:mm");
  const reportId = `LAB-${data.plant.substring(0, 3)}-${Date.now()}`;

  // --- OFFICIAL HEADER ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 45, "F");
  
  // LIFECO LOGO TEXT
  doc.setTextColor(10, 37, 64); // #0A2540
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("LIFE", 150, 20);
  
  // The Golden Drop O
  doc.setTextColor(245, 184, 0); // #F5B800
  doc.text("O", 175, 20);
  
  // Arabic/English Subtext
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(10);
  doc.text("الشركة الليبية للأسمدة", 163, 28, { align: "center" });
  doc.setFontSize(7);
  doc.text("Libyan Fertilizer Company", 163, 33, { align: "center" });
  
  // Left side: Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LABORATORY ANALYTICAL REPORT", 15, 25);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`REPORT ID: ${reportId}`, 15, 32);
  doc.text(`GENERATED: ${dateStr}`, 15, 37);

  doc.setDrawColor(10, 37, 64);
  doc.setLineWidth(1);
  doc.line(15, 42, 195, 42);

  // Verification Seal
  doc.setDrawColor(59, 130, 246); // primary
  doc.setLineWidth(0.5);
  doc.rect(150, 25, 45, 10);
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(9);
  doc.text("VERIFIED ANALYST", 155, 31);

  // Metadata Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PLANT ANALYTICAL DATA SHEET", 15, 55);
  
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.line(15, 58, 195, 58);

  const metaData = [
    ["PLANT NAME", data.plant, "ANALYST NAME", data.analyst],
    ["SAMPLE CATEGORY", data.sampleType.toUpperCase(), "BADGE NUMBER", data.badge],
    ["COLLECTION TIME", format(new Date(data.timestamp), "yyyy-MM-dd HH:mm:ss"), "STATUS", "PUBLISHED & SYNCED"]
  ];

  autoTable(doc, {
    startY: 65,
    body: metaData,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [100, 116, 139] },
      2: { fontStyle: "bold", textColor: [100, 116, 139] }
    }
  });

  // Main Readings Table
  const tableData = Object.entries(data.readings).map(([param, value]) => [
    param,
    value,
    "NORMAL",
    "SCADA SYNCED"
  ]);

  autoTable(doc, {
    startY: 95,
    head: [["PARAMETER / INSTRUMENT TAG", "MEASURED VALUE", "SPECIFICATION", "DATA STATUS"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 10, halign: "center" },
    styles: { fontSize: 9, halign: "center", fontStyle: "bold" },
    columnStyles: {
      0: { halign: "left", cellWidth: 80 }
    }
  });

  // Reciprocal QR Code
  const qrUrl = `${window.location.origin}/lab`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl);
  doc.addImage(qrDataUrl, "PNG", 165, doc.internal.pageSize.height - 45, 30, 30);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("SCAN TO VERIFY RECORD", 165, doc.internal.pageSize.height - 10);

  // Footer
  doc.setFontSize(8);
  doc.text("CONFIDENTIAL ENGINEERING DOCUMENT | LIFECO PMS ECOSYSTEM 2026", 15, doc.internal.pageSize.height - 15);
  doc.setDrawColor(15, 23, 42);
  doc.line(15, doc.internal.pageSize.height - 20, 195, doc.internal.pageSize.height - 20);

  return doc;
};

export const shareLabPdf = async (doc: jsPDF, filename: string) => {
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "LIFECO Lab Report",
        text: "Official Analytical Report from Nitrogen/Ammonia Lab."
      });
      return true;
    } catch (error) {
      console.error("Error sharing:", error);
      return false;
    }
  } else {
    doc.save(filename);
    return false;
  }
};
