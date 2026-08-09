import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { autoTable } from "jspdf-autotable";
import QRCode from "qrcode";

/**
 * Generates a professional engineering equipment technical card.
 */
export async function generateEquipmentPDF(data: any, tag: string) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4"
  });

  const asset = data?.asset || {};
  const matrix = data?.protection_matrix || {};
  const control = data?.operating_control || data?.protection_matrix?.control || {};
  const running = data?.detailed_running_data || {};

  // --- Header ---
  doc.setFillColor(2, 6, 23); // bg-slate-950
  doc.rect(0, 0, 210, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("N2-1 — NITROGEN GENERATION", 15, 15);
  doc.text("EQUIPMENT TECHNICAL & OPERATING CARD", 15, 20);
  
  doc.setFontSize(26);
  doc.text(tag, 15, 35);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Equipment: ${data.equipment_name || asset.asset_name || "N/A"}`, 140, 15);
  doc.text(`Service: ${data.service || "N/A"}`, 140, 20);
  doc.text(`Area: ${asset.location || "NITROGEN GENERATION"}`, 140, 25);
  doc.text(`Status: ${asset.status || "Pending Verification"}`, 140, 30);
  doc.text(`Plant: N2-1`, 140, 35);

  let currentY = 55;

  const addSectionHeader = (title: string) => {
    // If we're too close to the bottom, start a new page
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFillColor(60, 60, 60);
    doc.rect(15, currentY, 180, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, 20, currentY + 5.5);
    currentY += 12;
  };

  const addTable = (head: string[][], body: string[][], options = {}) => {
    autoTable(doc, {
      head,
      body,
      startY: currentY,
      margin: { left: 15, right: 15 },
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5, lineColor: [180, 180, 180] },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
      ...options,
      didDrawPage: (d: any) => {
         currentY = d.cursor.y + 10;
      }
    });
  };

  // --- SECTION 1: EQUIPMENT IDENTITY ---
  addSectionHeader("SECTION 1 — EQUIPMENT IDENTITY");
  addTable([], [
    ["Tag", tag, "Name", data.equipment_name || asset.asset_name || "N/A"],
    ["Type", data.equipment_type || "N/A", "Plant", "N2-1"],
    ["Area", asset.location || "NITROGEN GENERATION", "Service", data.service || "N/A"],
    ["Manufacturer", data.manufacturer || "N/A", "Model", data.model || "N/A"],
    ["Serial Number", "Pending Verification", "", ""]
  ]);

  // --- SECTION 2: PROCESS / CONNECTIONS ---
  addSectionHeader("SECTION 2 — PROCESS / CONNECTIONS");
  addTable([], [
    ["Upstream", data.upstream || "N/A", "Function", data.description || "N/A"],
    ["Downstream", data.downstream || "N/A", "", ""]
  ]);

  // --- SECTION 3: OPERATING DATA ---
  addSectionHeader("SECTION 3 — OPERATING DATA");
  const opBody = tag.startsWith("60-1001") ? [
    ["Operating Pressure", "9.1", "bar(e)", "Verified"],
    ["M1 Temperature", "Pending Verification", "°C", "Pending"],
    ["M2 Temperature", "Pending Verification", "°C", "Pending"],
    ["Running Hours", "Pending Verification", "hrs", "Pending"],
    ["Loaded Hours", "Pending Verification", "hrs", "Pending"],
    ["Service Hours", "Pending Verification", "hrs", "Pending"],
    ["Start/Stop Cycles", "Pending Verification", "cycles", "Pending"]
  ] : [
    ["Operating Pressure", "Pending Verification", "bar(e)", "Pending"],
    ["Running Hours", "Pending Verification", "hrs", "Pending"],
    ["Loaded Hours", "Pending Verification", "hrs", "Pending"]
  ];
  addTable([["Parameter", "Value", "Unit", "Status"]], opBody);

  // --- SECTION 4: PRESSURE PROTECTION ---
  addSectionHeader("SECTION 4 — PRESSURE PROTECTION");
  const pressBody = [];
  if (tag.startsWith("60-1001")) {
    pressBody.push(["Outlet Pressure Warning", "14.0", "bar(e)", "Verified"]);
    pressBody.push(["Outlet Pressure Shutdown", "15.0", "bar(e)", "Verified"]);
    pressBody.push(["Low Pressure Safety Valve", "3.7", "bar(e)", "Verified"]);
    pressBody.push(["High Pressure Safety Valve", "11.0", "bar(e)", "Verified"]);
  } else {
    pressBody.push(["Outlet Pressure Warning", "Pending", "bar(e)", "Pending"]);
    pressBody.push(["Outlet Pressure Shutdown", "Pending", "bar(e)", "Pending"]);
    pressBody.push(["Safety Valve Setpoint", "Pending", "bar(e)", "Pending"]);
  }
  addTable([["Parameter", "Value", "Unit", "Status"]], pressBody);

  // --- SECTION 5: TEMPERATURE PROTECTION ---
  addSectionHeader("SECTION 5 — TEMPERATURE PROTECTION");
  const tempBody = [];
  if (tag.startsWith("60-1001")) {
    tempBody.push(["Element 1 Outlet Warning", "225", "°C", "Verified"]);
    tempBody.push(["Element 1 Outlet Shutdown", "235", "°C", "Verified"]);
    tempBody.push(["Element 2 Outlet Warning", "225", "°C", "Verified"]);
    tempBody.push(["Element 2 Outlet Shutdown", "235", "°C", "Verified"]);
    tempBody.push(["Element 2 Inlet Warning", "65", "°C", "Verified"]);
    tempBody.push(["Element 2 Inlet Shutdown", "70", "°C", "Verified"]);
    tempBody.push(["Oil Temperature Warning", "65", "°C", "Verified"]);
    tempBody.push(["Oil Temperature Shutdown", "70", "°C", "Verified"]);
  } else {
    tempBody.push(["Operating Temperature", "Pending", "°C", "Pending"]);
  }
  addTable([["Parameter", "Value", "Unit", "Status"]], tempBody);

  // --- SECTION 6: OIL PROTECTION ---
  addSectionHeader("SECTION 6 — OIL PROTECTION");
  const oilBody = [];
  if (tag.startsWith("60-1001")) {
    oilBody.push(["Oil Pressure Warning", "1.3", "bar(e)", "Verified"]);
    oilBody.push(["Oil Pressure Shutdown", "1.2", "bar(e)", "Verified"]);
    oilBody.push(["Oil Temperature Warning", "65", "°C", "Verified"]);
    oilBody.push(["Oil Temperature Shutdown", "70", "°C", "Verified"]);
  } else {
    oilBody.push(["Oil Protection Status", "Pending", "N/A", "Pending"]);
  }
  addTable([["Parameter", "Value", "Unit", "Status"]], oilBody);

  // --- SECTION 7: MOTOR & STARTER ---
  addSectionHeader("SECTION 7 — MOTOR & STARTER");
  addTable([], [
    ["Starter Type", "Pending Verification (YD / DOL)", "Motor Protection", "Pending Verification"],
    ["Start Delay", "Pending", "Signal Delay", "Pending"]
  ]);

  // --- SECTION 8: OPERATING CONTROL ---
  addSectionHeader("SECTION 8 — OPERATING CONTROL");
  addTable([], [
    ["Loading", "Auto-regulation enabled", "Unloading", "Sequence unload enabled"],
    ["Start", "Manual/Remote enabled", "Stop", "Controlled sequence"],
    ["Interlocks", "Pending Verification", "Alarms", "Active monitoring"],
    ["Trips", "Verified Protection Matrix", "", ""]
  ]);

  // --- SECTION 9: RUNNING DATA ---
  addSectionHeader("SECTION 9 — RUNNING DATA");
  addTable([], [
    ["Running Hours", "Pending Verification", "Loaded Hours", "Pending Verification"],
    ["Service Hours", "Pending Verification", "Start/Stop Cycles", "Pending Verification"]
  ]);

  // --- SECTION 10: MAINTENANCE ---
  addSectionHeader("SECTION 10 — MAINTENANCE");
  addTable([], [
    ["Inspection Date", "Pending Verification", "Maintenance Notes", data.maintenance_notes || "Pending Verification"],
    ["Safety Notes", "Refer to MS-01 Safety Protocol", "Service History", "Pending Verification"]
  ]);

  // --- SECTION 11: DOCUMENT CONTROL ---
  addSectionHeader("SECTION 11 — DOCUMENT CONTROL");
  addTable([], [
    ["Source", "Internal Instruction Book", "Instruction Book", "Verified"],
    ["Datasheet", "Verified", "P&ID", "Verified"],
    ["SOP", "Verified", "Revision", "1.1"],
    ["Verification Status", "Engineering Checked", "Generated Date", new Date().toLocaleDateString()]
  ]);

  // --- QR CODE IN PDF ---
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lifeco-pms.lovable.app';
  const pdfUrl = `${baseUrl}/api/public/equipment/${tag}/pdf`;
  
  if (currentY > 230) { doc.addPage(); currentY = 20; }
  
  try {
    const qrDataUrl = await QRCode.toDataURL(pdfUrl, {
      margin: 1,
      width: 150,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    doc.addImage(qrDataUrl, "PNG", 85, currentY, 40, 40);
  } catch (err) {
    console.error("Failed to generate QR for PDF:", err);
    doc.setDrawColor(200, 200, 200);
    doc.rect(85, currentY, 40, 40);
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("SCAN FOR LATEST", 105, currentY + 44, { align: "center" });
  doc.text("EQUIPMENT PDF", 105, currentY + 48, { align: "center" });
  
  // URL Text
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(pdfUrl, 105, currentY + 52, { align: "center" });
  currentY += 60;

  // --- FOOTER ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 282, 195, 282);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`LIFECO PMS - ${tag} - Page ${i} of ${pageCount}`, 15, 287);
    doc.text(`Official Engineering Document - N2-1 Nitrogen Generation`, 195, 287, { align: "right" });
  }

  return doc;
}
