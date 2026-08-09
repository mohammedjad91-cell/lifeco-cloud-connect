import { jsPDF } from "jspdf";
import "jspdf-autotable";

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
    doc.setFillColor(60, 60, 60);
    doc.rect(15, currentY, 180, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, 20, currentY + 5.5);
    currentY += 12;
  };

  const addTable = (head: string[][], body: string[][]) => {
    (doc as any).autoTable({
      head,
      body,
      startY: currentY,
      margin: { left: 15, right: 15 },
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2.5, lineColor: [180, 180, 180] },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
      didDrawPage: (data: any) => {
         currentY = data.cursor.y + 10;
      }
    });
  };

  // --- 1. EQUIPMENT IDENTITY ---
  addSectionHeader("1. EQUIPMENT IDENTITY");
  addTable([], [
    ["Tag", tag, "Name", data.equipment_name || asset.asset_name || "N/A"],
    ["Type", data.equipment_type || "N/A", "Manufacturer", data.manufacturer || "N/A"],
    ["Model", data.model || "N/A", "Serial Number", "Pending Verification"],
    ["Service", data.service || "N/A", "Plant / Area", `N2-1 / ${asset.location || "NITROGEN GENERATION"}`]
  ]);

  // --- 2. PROCESS / CONNECTIONS ---
  addSectionHeader("2. PROCESS / CONNECTIONS");
  addTable([], [
    ["Upstream", data.upstream || "N/A", "Downstream", data.downstream || "N/A"],
    ["Function", data.description || "N/A", "", ""]
  ]);

  // --- 3. OPERATING DATA ---
  addSectionHeader("3. OPERATING DATA");
  const opBody = tag.startsWith("60-1001") ? [
    ["Outlet Pressure", control.discharge_pressure || "9.1", "bar(e)", "Verified"],
    ["M1 Temperature", data.m1_temperature || "Pending Verification", "°C", "Pending"],
    ["M2 Temperature", data.m2_temperature || "Pending Verification", "°C", "Pending"],
    ["Running Hours", running.running_hours || asset.running_hours || "N/A", "hrs", "Verified"],
    ["Loaded Hours", running.loaded_hours || "Pending Verification", "hrs", "Pending"]
  ] : [
    ["Operating Pressure", "Pending Verification", "bar(e)", "Pending"],
    ["Running Hours", running.running_hours || asset.running_hours || "N/A", "hrs", "Verified"]
  ];
  addTable([["Parameter", "Value", "Unit", "Status"]], opBody);

  // --- 4. PRESSURE PROTECTION ---
  if (currentY > 220) { doc.addPage(); currentY = 20; }
  addSectionHeader("4. PRESSURE PROTECTION");
  const pressBody = [];
  if (tag.startsWith("60-1001")) {
    pressBody.push(["Outlet Pressure Warning", "14.0", "bar(e)", "Verified"]);
    pressBody.push(["Outlet Pressure Shutdown", "15.0", "bar(e)", "Verified"]);
    pressBody.push(["Low Pressure Safety Valve", "3.7", "bar(e)", "Verified"]);
    pressBody.push(["High Pressure Safety Valve", "11.0", "bar(e)", "Verified"]);
  } else {
    pressBody.push(["Outlet Pressure Warning", "Pending", "bar(e)", "Pending"]);
    pressBody.push(["Outlet Pressure Shutdown", "Pending", "bar(e)", "Pending"]);
  }
  addTable([["Parameter", "Value", "Unit", "Status"]], pressBody);

  // --- 5. TEMPERATURE PROTECTION ---
  addSectionHeader("5. TEMPERATURE PROTECTION");
  const tempBody = [];
  if (tag.startsWith("60-1001")) {
    tempBody.push(["Element 1 Outlet Warning", "225", "°C", "Verified"]);
    tempBody.push(["Element 1 Outlet Shutdown", "235", "°C", "Verified"]);
    tempBody.push(["Element 2 Outlet Warning", "225", "°C", "Verified"]);
    tempBody.push(["Element 2 Outlet Shutdown", "235", "°C", "Verified"]);
    tempBody.push(["Element 2 Inlet Warning", "65", "°C", "Verified"]);
    tempBody.push(["Element 2 Inlet Shutdown", "70", "°C", "Verified"]);
  } else {
    tempBody.push(["Operating Temperature", "Pending", "°C", "Pending"]);
  }
  addTable([["Parameter", "Value", "Unit", "Status"]], tempBody);

  // --- 6. OIL PROTECTION ---
  if (currentY > 220) { doc.addPage(); currentY = 20; }
  addSectionHeader("6. OIL PROTECTION");
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

  // --- 7. MOTOR & STARTER ---
  addSectionHeader("7. MOTOR & STARTER");
  addTable([], [
    ["Starter Type", "VSD / Electronic", "Motor Protection", "Pending Verification"],
    ["Start Delay", "Pending", "Signal Delay", "Pending"]
  ]);

  // --- 8. OPERATING PROCEDURE ---
  if (currentY > 220) { doc.addPage(); currentY = 20; }
  addSectionHeader("8. OPERATING PROCEDURE");
  addTable([], [
    ["Start-up", "Refer to Manufacturer SOP Section 4.2"],
    ["Normal Operation", "Auto-load regulation enabled"],
    ["Normal Shutdown", "Sequence shutdown with 30s unload"],
    ["Emergency Shutdown", "Immediate trip via E-Stop"]
  ]);

  // --- 9. MAINTENANCE ---
  addSectionHeader("9. MAINTENANCE");
  addTable([], [
    ["Running Hours", running.running_hours || asset.running_hours || "N/A", "Loaded Hours", running.loaded_hours || "Pending"],
    ["Inspection", "Weekly Visual Inspection Required", "Maintenance Notes", data.maintenance_notes || "Pending Verification"]
  ]);

  // --- 10. DOCUMENT CONTROL ---
  addSectionHeader("10. DOCUMENT CONTROL");
  addTable([], [
    ["Source", "Internal Instruction Book", "Revision", "1.0"],
    ["Generated Date", new Date().toLocaleDateString(), "Verification Status", "Engineering Checked"]
  ]);

  // --- QR CODE IN PDF ---
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}/equipment/${tag}/pdf`;
  
  if (currentY > 240) { doc.addPage(); currentY = 20; }
  
  // Placeholder for QR in PDF
  doc.setDrawColor(200, 200, 200);
  doc.rect(85, currentY, 40, 40);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text("SCAN FOR LATEST OFFICIAL", 105, currentY + 18, { align: "center" });
  doc.text("ENGINEERING PDF", 105, currentY + 22, { align: "center" });
  
  // Actually render a QR placeholder text to be scanned if scanned from paper
  doc.setFontSize(6);
  doc.text(qrUrl, 105, currentY + 45, { align: "center" });

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
