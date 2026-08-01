import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export interface SamplePdfInput {
  sample_name: string;
  department: string;
  analysis_type: string;
  status: string;
  employee_id: string;
  technician_name: string;
  sample_date: string;
  dynamic_data: Record<string, any> | null;
  notes: string | null;
}

const footer = (doc: jsPDF) => {
  doc.setFontSize(9);
  doc.text(
    "LIFECO PMS 2026 | Laboratory | Prepared by: Eng. Mohammed Gadallah",
    14,
    doc.internal.pageSize.height - 10,
  );
};

/** Certificate of analysis for a single sample */
export const exportSampleResultsPDF = (sample: SamplePdfInput, labelOf?: (key: string) => string) => {
  const doc = new jsPDF();
  doc.setFontSize(17);
  doc.text("LIFECO PMS 2026 - Certificate of Analysis", 14, 20);
  doc.setFontSize(11);
  doc.text(`Sample: ${sample.sample_name}`, 14, 30);
  doc.text(`Plant / Dept: ${sample.department}`, 14, 37);
  doc.text(`Analysis Type: ${sample.analysis_type}   |   Status: ${sample.status}`, 14, 44);
  doc.text(`Date: ${sample.sample_date}`, 14, 51);
  doc.text(`Technician: ${sample.technician_name} (${sample.employee_id})`, 14, 58);

  const rows = Object.entries(sample.dynamic_data || {}).map(([k, v], i) => [
    i + 1,
    labelOf ? labelOf(k) : k,
    String(v),
  ]);

  autoTable(doc, {
    startY: 66,
    head: [["#", "Parameter", "Result"]],
    body: rows.length ? rows : [["-", "No results recorded", "-"]],
    theme: "grid",
    headStyles: { fillColor: [0, 80, 120], fontSize: 10 },
  });

  if (sample.notes) {
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Notes: ${sample.notes}`, 14, y);
  }

  footer(doc);
  doc.save(`LIFECO_Sample_${sample.sample_name.replace(/\s+/g, "_")}_${sample.sample_date}.pdf`);
};

/** All sample results for a day */
export const exportAllSampleResultsPDF = (
  samples: SamplePdfInput[],
  date: Date,
  labelOf?: (key: string) => string,
) => {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(17);
  doc.text("LIFECO PMS 2026 - Laboratory Sample Results", 14, 20);
  doc.setFontSize(11);
  doc.text(`Date: ${format(date, "dd/MM/yyyy")}   |   Samples: ${samples.length}`, 14, 29);

  const body: (string | number)[][] = [];
  samples.forEach((s, i) => {
    const entries = Object.entries(s.dynamic_data || {});
    if (entries.length === 0) {
      body.push([i + 1, s.sample_name, s.department, s.analysis_type, "-", "-", s.status, s.technician_name]);
      return;
    }
    entries.forEach(([k, v], j) => {
      body.push([
        j === 0 ? i + 1 : "",
        j === 0 ? s.sample_name : "",
        j === 0 ? s.department : "",
        j === 0 ? s.analysis_type : "",
        labelOf ? labelOf(k) : k,
        String(v),
        j === 0 ? s.status : "",
        j === 0 ? s.technician_name : "",
      ]);
    });
  });

  autoTable(doc, {
    startY: 36,
    head: [["#", "Sample", "Plant", "Analysis", "Parameter", "Result", "Status", "Technician"]],
    body: body.length ? body : [["-", "No samples", "-", "-", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: { fillColor: [0, 80, 120], fontSize: 10 },
  });

  footer(doc);
  doc.save(`LIFECO_Lab_Sample_Results_${format(date, "yyyy-MM-dd")}.pdf`);
};
