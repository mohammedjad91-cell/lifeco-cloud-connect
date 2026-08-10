import * as XLSX from "xlsx";
import { format } from "date-fns";

export interface LabExportData {
  plant: string;
  sampleType: string;
  analyst: string;
  badge: string;
  readings: Record<string, any>;
  timestamp: string;
}

export const exportLabToExcel = (data: LabExportData) => {
  const wb = XLSX.utils.book_new();
  
  // Header Info
  const headerData = [
    ["LIFECO PMS 2026 — LABORATORY REPORT"],
    ["Generated on:", format(new Date(), "dd/MM/yyyy HH:mm:ss")],
    [],
    ["ANALYST INFORMATION"],
    ["Name:", data.analyst],
    ["Badge ID:", data.badge],
    [],
    ["PLANT DETAILS"],
    ["Plant:", data.plant],
    ["Sample Type:", data.sampleType],
    ["Sample Timestamp:", format(new Date(data.timestamp), "dd/MM/yyyy HH:mm:ss")],
    [],
    ["ANALYTICAL READINGS"],
    ["Parameter", "Value", "Status"]
  ];

  const readingsRows = Object.entries(data.readings).map(([param, value]) => [
    param,
    value,
    "PUBLISHED"
  ]);

  const finalData = [...headerData, ...readingsRows];
  
  const ws = XLSX.utils.aoa_to_sheet(finalData);
  
  // Set column widths
  ws["!cols"] = [
    { wch: 40 },
    { wch: 30 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Lab Report");
  
  const fileName = `LIFECO_LAB_${data.plant}_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
