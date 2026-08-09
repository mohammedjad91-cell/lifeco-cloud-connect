import { jsPDF } from "jspdf";
import "jspdf-autotable";

export async function generateEquipmentPDF(data: any, tag: string) {
  const isAr = false; // Standardizing on English for engineering docs as requested
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4"
  });

  const asset = data?.asset || {};
  const matrix = data?.protection_matrix || {};
  const control = data?.operating_control || data?.protection_matrix?.control || {};
  const running = data?.detailed_running_data || {};

  // Header
  doc.setFillColor(2, 6, 23); // bg-slate-950
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("N2-1 — NITROGEN GENERATION", 15, 15);
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`Equipment Tag: ${tag}`, 15, 28);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Equipment Name: ${data.equipment_name || asset.asset_name || "N/A"}`, 140, 15);
  doc.text(`Equipment Type: ${data.equipment_type || "N/A"}`, 140, 21);
  doc.text(`Service: ${data.service || "N/A"}`, 140, 27);
  doc.text(`Status: ${asset.status || "Pending Verification"}`, 140, 33);

  let currentY = 50;

  const addSectionHeader = (title: string) => {
    doc.setFillColor(240, 240, 240);
    doc.rect(15, currentY, 180, 8, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, 20, currentY + 6);
    currentY += 12;
  };

  const addTable = (head: string[][], body: string[][]) => {
    (doc as any).autoTable({
      head,
      body,
      startY: currentY,
      margin: { left: 15, right: 15 },
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
      didDrawPage: (data: any) => {
         currentY = data.cursor.y + 10;
      }
    });
  };

  // IDENTITY
  addSectionHeader("IDENTITY");
  addTable([], [
    ["Tag", tag, "Plant", "N2-1"],
    ["Name", data.equipment_name || asset.asset_name || "N/A", "Area", asset.location || "NITROGEN GENERATION"],
    ["Type", data.equipment_type || "N/A", "Service", data.service || "N/A"],
    ["Manufacturer", data.manufacturer || "N/A", "Model", data.model || "N/A"],
    ["Serial Number", "Pending Verification", "Function", data.description || "N/A"]
  ]);

  // PROCESS
  addSectionHeader("PROCESS");
  addTable([], [
    ["Upstream", data.upstream || "N/A", "Downstream", data.downstream || "N/A"],
    ["Process Function", data.description || "N/A", "", ""]
  ]);

  // OPERATING DATA
  addSectionHeader("OPERATING DATA");
  const opBody = tag.startsWith("60-1001") ? [
    ["M1 Temperature", data.m1_temperature || "Pending Verification", "°C", "Pending"],
    ["M2 Temperature", data.m2_temperature || "Pending Verification", "°C", "Pending"],
    ["Outlet Pressure", control.discharge_pressure || "9.1", "bar(e)", "Verified"],
    ["Running Hours", running.running_hours || asset.running_hours || "N/A", "hrs", "Verified"],
    ["Loaded Hours", running.loaded_hours || "Pending Verification", "hrs", "Pending"]
  ] : [
    ["Operating Pressure", "Pending Verification", "bar(e)", "Pending"],
    ["Running Hours", running.running_hours || asset.running_hours || "N/A", "hrs", "Verified"]
  ];
  addTable([["Parameter", "Value", "Unit", "Status"]], opBody);

  // PROTECTION MATRIX
  if (currentY > 230) { doc.addPage(); currentY = 20; }
  addSectionHeader("PROTECTION MATRIX");
  const protBody = [];
  if (tag.startsWith("60-1001")) {
    protBody.push(["Outlet Pressure", "14.0", "15.0", "bar(e)"]);
    protBody.push(["Element 1 Outlet Temp", "225", "235", "°C"]);
    protBody.push(["Element 2 Outlet Temp", "225", "235", "°C"]);
    protBody.push(["Element 2 Inlet Temp", "65", "70", "°C"]);
    protBody.push(["Oil Temperature", "65", "70", "°C"]);
    protBody.push(["Oil Pressure", "1.3", "1.2", "bar(e)"]);
  } else {
    protBody.push(["Outlet Pressure", "Pending", "Pending", "bar(e)"]);
  }
  addTable([["Parameter", "Warning", "Shutdown", "Unit"]], protBody);

  // SAFETY VALVES
  addSectionHeader("SAFETY VALVES");
  addTable([], [
    ["Low Pressure Safety Valve", tag.startsWith("60-1001") ? "3.7 bar(e)" : "Pending Verification"],
    ["High Pressure Safety Valve", tag.startsWith("60-1001") ? "11.0 bar(e)" : "Pending Verification"]
  ]);

  // FOOTER with QR Placeholder logic (QR will be added as image if possible, or just text)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`LIFECO PMS - ${tag} - Page ${i} of ${pageCount}`, 15, 285);
    doc.text(`Generated: ${new Date().toLocaleString()} - Rev: 1.0`, 140, 285);
  }

  return doc;
}
