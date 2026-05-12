import React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FileDown, FileSpreadsheet, Printer, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export interface ExportPreviewData {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  // For Power BI Excel: separate normalized sheets
  powerBISheets?: {
    sheetName: string;
    headers: string[];
    rows: (string | number)[][];
  }[];
}

interface ExportPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  data: ExportPreviewData;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

const ExportPreviewDialog = ({ open, onClose, data, onExportPDF, onExportExcel }: ExportPreviewDialogProps) => {
  const { lang } = useI18n();

  const handlePrint = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const tableHtml = `
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: ltr; }
          h1 { color: #003366; font-size: 18px; margin-bottom: 4px; }
          h2 { color: #555; font-size: 13px; font-weight: normal; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #003366; color: #fff; padding: 8px 6px; text-align: left; }
          td { padding: 6px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f5f7fa; }
          .footer { margin-top: 24px; font-size: 10px; color: #888; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        ${data.subtitle ? `<h2>${data.subtitle}</h2>` : ""}
        <table>
          <thead><tr>${data.headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${data.rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
        <div class="footer">LIFECO PMS 2026 | إعداد م. محمد جادالله</div>
      </body>
      </html>
    `;
    printWin.document.write(tableHtml);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-lg font-bold neon-text flex items-center justify-between">
            <span>{data.title}</span>
          </DialogTitle>
          {data.subtitle && (
            <p className="text-sm text-muted-foreground">{data.subtitle}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto px-4 py-3">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  {data.headers.map((h, i) => (
                    <TableHead key={i} className="text-primary font-semibold text-xs whitespace-nowrap">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, ri) => (
                  <TableRow key={ri} className="border-border hover:bg-secondary/20">
                    {row.map((cell, ci) => (
                      <TableCell key={ci} className="text-xs whitespace-nowrap">{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.rows.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {lang === "ar" ? "لا توجد بيانات للعرض" : "No data to display"}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {data.rows.length} {lang === "ar" ? "سجل" : "records"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
                <Printer className="w-4 h-4" /> {lang === "ar" ? "طباعة" : "Print"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { onExportPDF(); }} className="gap-1.5">
                <FileDown className="w-4 h-4" /> {lang === "ar" ? "حفظ PDF" : "Save PDF"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { onExportExcel(); }} className="gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
                <FileSpreadsheet className="w-4 h-4" /> {lang === "ar" ? "حفظ Excel (Power BI)" : "Save Excel (Power BI)"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
                <X className="w-4 h-4" /> {lang === "ar" ? "إغلاق" : "Close"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPreviewDialog;
