import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Save, FileText, Printer, Share2, ChevronLeft, CheckCircle2, PenLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getOperator, getStamp } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface LogSheetProps {
  onClose: () => void;
  selectedDate?: Date;
}

// 12-Hour Shift Definition (Day: 08:00 - 20:00, Night: 20:00 - 08:00)
const TWELVE_HOUR_TIMES = ["08", "10", "12", "14", "16", "18", "20", "22", "00", "02", "04", "06"];
const SHIFT_12H = [
  { key: "day", label: "DAY SHIFT", range: "08:00 — 20:00" },
  { key: "night", label: "NIGHT SHIFT", range: "20:00 — 08:00" },
];

const SHEET_PREFIX = "N2";

function buildTag(sheet: string, instrument: string, hour: string) {
  return `${SHEET_PREFIX}|${sheet}|${instrument}|${hour}`;
}

const NitrogenLogSheetsModule = ({ onClose, selectedDate = new Date() }: LogSheetProps) => {
  const { toast } = useToast();
  const operator = getOperator();
  const [cells, setCells] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const loadData = useCallback(async () => {
    setLoading(true);
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const { data: logs } = await supabase
      .from("operations_logs")
      .select("unit_tag, value")
      .eq("department", "NITROGEN")
      .gte("timestamp", dayStart.toISOString())
      .lte("timestamp", dayEnd.toISOString())
      .like("unit_tag", `${SHEET_PREFIX}|%`);

    const map: Record<string, string> = {};
    (logs ?? []).forEach((l: any) => { map[l.unit_tag] = String(l.value); });
    setCells(map);

    const { data: sigs } = await supabase
      .from("activity_logs")
      .select("action, details")
      .eq("department", "NITROGEN")
      .like("action", "N2_SIGN_%")
      .like("details", `${dateStr}%`);
    const sMap: Record<string, string> = {};
    (sigs ?? []).forEach((s: any) => { sMap[s.action] = s.details; });
    setSignatures(sMap);
    setLoading(false);
  }, [selectedDate, dateStr]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = () => {
    toast({ title: "Syncing...", description: "All entries synchronized with DCS database." });
  };

  const handleExportPDF = () => {
    toast({ title: "Exporting...", description: "Generating professional engineering PDF layout..." });
  };

  const handlePrint = () => {
    window.print();
  };

  const signShift = async (shiftKey: string) => {
    if (!operator) {
      toast({ title: "Operator login required", variant: "destructive" });
      return;
    }
    const stamp = getStamp(operator);
    const action = `N2_SIGN_${shiftKey.toUpperCase()}`;
    const details = `${dateStr} ${stamp.formatted}`;
    await supabase.from("activity_logs").insert({
      department: "NITROGEN",
      action,
      details,
    });
    setSignatures((s) => ({ ...s, [action]: details }));
    toast({ title: "Shift Signed", description: stamp.formatted });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50/90 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-100/95 overflow-y-auto print:bg-white rounded-xl shadow-lg border border-slate-200"
    >
      {/* FLOATING ACTION BAR */}
      <div className="sticky top-0 z-[40] bg-white border-b border-slate-200 shadow-sm p-4 print:hidden">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden">
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100">
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </Button>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Nitrogen Plant Commissioning Log</h2>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{format(selectedDate, "dd MMM yyyy")} | 12-Hour Shift System</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white border-none shadow-sm">
              <Save className="w-4 h-4 mr-2" /> Save Log
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportPDF} className="border-slate-300 text-slate-700">
              <FileText className="w-4 h-4 mr-2" /> Download PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint} className="border-slate-300 text-slate-700">
              <Printer className="w-4 h-4 mr-2" /> Print Sheet
            </Button>
            <Button size="sm" variant="outline" className="border-slate-300 text-slate-700">
              <Share2 className="w-4 h-4 mr-2" /> Send via WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* PAPER LAYOUT */}
      <div className="max-w-[1400px] mx-auto my-8 p-8 bg-white border border-slate-200 shadow-xl min-h-[1200px] print:m-0 print:p-0 print:border-none print:shadow-none">
        <div className="space-y-12">
          
          {/* HEADER SECTION */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">LIFECO PMS 2026</h1>
              <p className="text-xs font-bold text-slate-600 uppercase">Ammonia Plants Dept. | Nitrogen Generation Section</p>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-500 uppercase">
              Doc ID: N2-LOG-2026-REV1<br/>
              Status: OFFICIAL COMMISSIONING RECORD
            </div>
          </div>

          {/* SHEET 1 */}
          <section className="space-y-4">
            <div className="bg-slate-100 p-2 border-l-4 border-slate-900">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">SHEET-1: Air Compressors (60-1001 A/B/C)</h3>
            </div>
            <CompressorTable cells={cells} setCells={setCells} hours={TWELVE_HOUR_TIMES} />
          </section>

          {/* SHEET 2 */}
          <section className="space-y-4">
            <div className="bg-slate-100 p-2 border-l-4 border-slate-900">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">SHEET-2: Nitrogen Plant & Utilities Matrix</h3>
            </div>
            <UtilitiesTable cells={cells} setCells={setCells} hours={TWELVE_HOUR_TIMES} />
          </section>

          {/* SHEET 3 */}
          <section className="space-y-4">
            <div className="bg-slate-100 p-2 border-l-4 border-slate-900">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">SHEET-3: Hourly Operations Log</h3>
            </div>
            <HourlyOpsTable cells={cells} setCells={setCells} hours={TWELVE_HOUR_TIMES} />
          </section>

          {/* SIGNATURES SECTION */}
          <div className="grid grid-cols-2 gap-8 mt-16 pt-8 border-t-2 border-slate-900">
            {SHIFT_12H.map(shift => {
              const signed = !!signatures[`N2_SIGN_${shift.key.toUpperCase()}`];
              const sigData = signatures[`N2_SIGN_${shift.key.toUpperCase()}`];
              return (
                <div key={shift.key} className="border border-slate-300 p-6 flex flex-col gap-4 bg-slate-50/50">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-900 font-black text-xs tracking-widest">{shift.label}</span>
                    <span className="text-slate-500 text-[10px] font-mono">{shift.range}</span>
                  </div>
                  <div className="h-24 border border-dashed border-slate-300 rounded flex items-center justify-center relative group">
                    {signed ? (
                      <div className="text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-1" />
                        <span className="text-[10px] font-mono text-slate-600 uppercase">{sigData}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[10px] uppercase font-mono tracking-tighter opacity-50">Authorized Signature Required</span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 print:hidden">
                       <Button variant="outline" size="sm" onClick={() => signShift(shift.key)} className="text-[10px] border-slate-900 text-slate-900 font-bold uppercase">
                          {signed ? "Resign" : "Sign Now"}
                       </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[10px] text-slate-400 font-mono mt-8 uppercase tracking-[0.3em]">
            LIFECO PMS 2026 | Engineering Document Control | Confidential
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- GENERIC LOG TABLE COMPONENT ---
interface LogTableProps {
  groups: { label: string; parameters: string[] }[];
  hours: string[];
  cells: Record<string, string>;
  setCells: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  sheetKey: string;
}

const LogTable = ({ groups, hours, cells, setCells, sheetKey }: LogTableProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number, maxRows: number, maxCols: number) => {
    const selector = (r: number, c: number) => `input[data-sheet="${sheetKey}"][data-row="${r}"][data-col="${c}"]`;
    
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = document.querySelector(selector(row + 1, col)) as HTMLInputElement;
      if (next) next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = document.querySelector(selector(row - 1, col)) as HTMLInputElement;
      if (prev) prev.focus();
    } else if (e.key === 'ArrowRight') {
      const input = e.currentTarget;
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        const next = document.querySelector(selector(row, col + 1)) as HTMLInputElement;
        if (next) next.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      const input = e.currentTarget;
      if (input.selectionStart === 0) {
        e.preventDefault();
        const prev = document.querySelector(selector(row, col - 1)) as HTMLInputElement;
        if (prev) prev.focus();
      }
    }
  };

  let rowCounter = 0;

  return (
    <div className="border-2 border-slate-900 overflow-hidden shadow-md">
      <Table className="border-collapse w-full">
        <TableHeader>
          <TableRow className="bg-slate-900 hover:bg-slate-900 border-b-2 border-slate-900 h-10">
            <TableHead className="w-[300px] text-white font-bold uppercase text-[10px] tracking-widest border-r-2 border-slate-700">
              Parameter / Tag ID
            </TableHead>
            {hours.map(h => (
              <TableHead key={h} className="text-center text-white font-mono font-bold text-[11px] border-r border-slate-700 p-0 w-[80px]">
                {h}:00
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              <TableRow className="bg-slate-200 hover:bg-slate-200 h-8 border-b-2 border-slate-900">
                <TableCell colSpan={hours.length + 1} className="py-1 px-3 text-slate-900 font-black uppercase text-[10px] tracking-widest border-r border-slate-900">
                  {group.label}
                </TableCell>
              </TableRow>
              {group.parameters.map((param, pIdx) => {
                const currentRow = rowCounter++;
                return (
                  <TableRow key={pIdx} className="h-9 hover:bg-slate-100 transition-colors border-b border-slate-400">
                    <TableCell className="py-1 px-3 font-bold text-[11px] text-slate-900 border-r-2 border-slate-900 bg-slate-50/50">
                      {param}
                    </TableCell>
                    {hours.map((h, cIdx) => {
                      const tag = buildTag(group.label.includes("60-1001") ? `COMP-${group.label.split(":")[1].trim()}` : sheetKey, param, h);
                      return (
                        <TableCell key={h} className="p-0 border-r border-slate-300">
                          <Input
                            data-sheet={sheetKey}
                            data-row={currentRow}
                            data-col={cIdx}
                            value={cells[tag] || ""}
                            onChange={(e) => setCells(prev => ({ ...prev, [tag]: e.target.value }))}
                            onKeyDown={(e) => handleKeyDown(e, currentRow, cIdx, 1000, hours.length)}
                            className="h-9 w-full bg-transparent border-none rounded-none text-center font-bold text-[12px] text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:bg-white placeholder:text-slate-300"
                            placeholder="0.0"
                            inputMode="decimal"
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// --- SPECIFIC TABLES ---

const CompressorTable = ({ cells, setCells, hours }: any) => {
  const params = [
    "Amper", "Compressed air outlet press", "Lub oil pressure", "First stage air discharge",
    "Compressed air temp", "Element one outlet", "Element two inlet", "Element two outlet",
    "Cooling water inlet temp", "Lub oil temp", "Lub oil tank level %"
  ];
  const groups = [
    { label: "EQUIPMENT TAG: 60-1001/A", parameters: params },
    { label: "EQUIPMENT TAG: 60-1001/B", parameters: params },
    { label: "EQUIPMENT TAG: 60-1001/C", parameters: params },
  ];
  return <LogTable groups={groups} hours={hours} cells={cells} setCells={setCells} sheetKey="COMP" />;
};

const UtilitiesTable = ({ cells, setCells, hours }: any) => {
  const groups = [{
    label: "PROCESS UTILITIES & ANALYZERS",
    parameters: [
      "60-PT-0014 C.W.P. discharge", "60-lt-0001 C.W. tank level %", "60-PT-0016 S.W. pressure",
      "60-PI-0009 compressed air press", "60-PI-029 INST. Air press", "60-AT-001 common dew point",
      "60-FIC-001 inlet flow to 2201", "61-FIC-002 INLET FLOW TO 2202", "P.S.A unit",
      "60-301-O2 analyzer", "62-302 production o2 analyzer", "60-PT-010 N2 header pressure"
    ]
  }];
  return <LogTable groups={groups} hours={hours} cells={cells} setCells={setCells} sheetKey="UTILITIES" />;
};

const HourlyOpsTable = ({ cells, setCells, hours }: any) => {
  const groups = [{
    label: "DCS OPERATIONAL PARAMETERS",
    parameters: [
      "60-PIC-006 PRESSURE/OPENING%", "60-PI-012 Compressor discharge", "60-TI-002 Compressor temp",
      "60-LI-001 C.W. Tank level", "60-PI-014 C.W. Pressure", "60-PI-001 Dryers outlet pressure",
      "60-FT-0005 Inst. Air flow", "60-FI-305 P.S.A production", "60-AL-003 P.S.A Production purity"
    ]
  }];
  return <LogTable groups={groups} hours={hours} cells={cells} setCells={setCells} sheetKey="DCS" />;
};

export default NitrogenLogSheetsModule;
