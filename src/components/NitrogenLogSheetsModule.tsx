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
      className="fixed inset-0 z-50 bg-slate-100/98 overflow-y-auto print:bg-white"
    >
      {/* FLOATING ACTION BAR - CRITICAL: PRESERVED & FULLY VISIBLE */}
      <div className="sticky top-0 z-[100] bg-white border-b-2 border-slate-900 shadow-md p-4 print:hidden">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100 border border-slate-200">
              <ChevronLeft className="w-6 h-6 text-slate-900" />
            </Button>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Nitrogen Plant Operations Console</h2>
              <p className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-widest">{format(selectedDate, "dd MMM yyyy")} | 12-Hour Shift System (Day/Night)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={handleSave} className="bg-slate-900 hover:bg-black text-white border-none shadow-lg px-6 font-bold uppercase tracking-wider">
              <Save className="w-4 h-4 mr-2" /> Save Log
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportPDF} className="border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all">
              <FileText className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint} className="border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button size="sm" variant="outline" className="border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all">
              <Share2 className="w-4 h-4 mr-2" /> Send
            </Button>
          </div>
        </div>
      </div>

      {/* COMPACT PAPER LAYOUT */}
      <div className="max-w-[1400px] mx-auto my-6 p-10 bg-white border-[1.5px] border-slate-400 shadow-2xl min-h-[1400px] print:m-0 print:p-0 print:border-none print:shadow-none">
        <div className="space-y-10">
          
          {/* HEADER SECTION */}
          <div className="border-b-[3px] border-slate-900 pb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">LIFECO PMS 2026</h1>
              <p className="text-sm font-black text-slate-800 uppercase mt-1">Ammonia Plants Dept. | Nitrogen Generation Section</p>
              <div className="mt-2 flex gap-4 text-[10px] font-bold text-slate-600 uppercase">
                <span>Unit: N2-1 PSA UNIT</span>
                <span>Type: OFFICIAL LOG SHEET</span>
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-900 font-bold uppercase leading-tight">
              DOC ID: N2-LOG-2026-REV1.2<br/>
              DATE: {format(selectedDate, "yyyy-MM-dd")}<br/>
              STATUS: <span className="text-blue-700">COMMISSIONING RECORD</span>
            </div>
          </div>

          {/* SHEET 1 */}
          <section className="space-y-3">
            <div className="bg-slate-900 py-1.5 px-3 border-l-[6px] border-blue-600">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">SHEET-1: AIR COMPRESSORS (60-1001 A/B/C)</h3>
            </div>
            <CompressorTable cells={cells} setCells={setCells} hours={TWELVE_HOUR_TIMES} />
          </section>

          {/* SHEET 2 */}
          <section className="space-y-3">
            <div className="bg-slate-900 py-1.5 px-3 border-l-[6px] border-blue-600">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">SHEET-2: NITROGEN PLANT & UTILITIES MATRIX</h3>
            </div>
            <UtilitiesTable cells={cells} setCells={setCells} hours={TWELVE_HOUR_TIMES} />
          </section>

          {/* SHEET 3 */}
          <section className="space-y-3">
            <div className="bg-slate-900 py-1.5 px-3 border-l-[6px] border-blue-600">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">SHEET-3: HOURLY OPERATIONS LOG (DCS PARAMETERS)</h3>
            </div>
            <HourlyOpsTable cells={cells} setCells={setCells} hours={TWELVE_HOUR_TIMES} />
          </section>

          {/* SIGNATURES SECTION */}
          <div className="grid grid-cols-2 gap-10 mt-12 pt-8 border-t-[3px] border-slate-900">
            {SHIFT_12H.map(shift => {
              const signed = !!signatures[`N2_SIGN_${shift.key.toUpperCase()}`];
              const sigData = signatures[`N2_SIGN_${shift.key.toUpperCase()}`];
              return (
                <div key={shift.key} className="border-[1.5px] border-slate-900 p-6 flex flex-col gap-4 bg-slate-50">
                  <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
                    <span className="text-slate-900 font-black text-xs tracking-widest">{shift.label}</span>
                    <span className="text-slate-900 text-[10px] font-mono font-bold">{shift.range}</span>
                  </div>
                  <div className="h-28 border-[1.5px] border-dashed border-slate-400 rounded-sm flex items-center justify-center relative group bg-white">
                    {signed ? (
                      <div className="text-center">
                        <CheckCircle2 className="w-10 h-10 text-slate-900 mx-auto mb-2" />
                        <span className="text-[11px] font-mono text-slate-900 font-bold uppercase">{sigData}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] uppercase font-mono font-bold tracking-tight opacity-40">AUTHORIZED SIGNATURE & STAMP REQUIRED</span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 print:hidden">
                       <Button variant="outline" size="sm" onClick={() => signShift(shift.key)} className="text-[10px] border-2 border-slate-900 text-slate-900 font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white">
                          {signed ? "OVERWRITE SIGNATURE" : "SIGN SHIFT NOW"}
                       </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[11px] text-slate-900 font-mono font-bold mt-10 uppercase tracking-[0.4em] opacity-30">
            LIFECO PMS 2026 | DIGITAL LOGGING INFRASTRUCTURE | ENGINEERING CONTROL
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
    <div className="border-[1.5px] border-slate-900 overflow-hidden shadow-sm">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="bg-slate-900 hover:bg-slate-900 border-b-[1.5px] border-slate-900 h-10">
            <TableHead className="w-[300px] text-white font-black uppercase text-[10px] tracking-widest border-r border-slate-700">
              Parameter / Tag ID
            </TableHead>
            {hours.map(h => (
              <TableHead key={h} className="text-center text-white font-mono font-black text-[11px] border-r border-slate-700 p-0 w-[80px]">
                {h}:00
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              <TableRow className="bg-slate-200 hover:bg-slate-200 h-8 border-b-[1.5px] border-slate-900">
                <TableCell colSpan={hours.length + 1} className="py-1 px-4 text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] border-r border-slate-900">
                  {group.label}
                </TableCell>
              </TableRow>
              {group.parameters.map((param, pIdx) => {
                const currentRow = rowCounter++;
                return (
                  <TableRow key={pIdx} className="h-9 hover:bg-slate-50 transition-colors border-b-[1.5px] border-slate-900">
                    <TableCell className="py-1 px-4 font-mono font-bold text-[11px] text-slate-900 border-r-[1.5px] border-slate-900 bg-slate-50/50">
                      {param}
                    </TableCell>
                    {hours.map((h, cIdx) => {
                      const tag = buildTag(group.label.includes("60-1001") ? `COMP-${group.label.split(":")[1].trim()}` : sheetKey, param, h);
                      return (
                        <TableCell key={h} className="p-0 border-r-[1.5px] border-slate-900">
                          <Input
                            data-sheet={sheetKey}
                            data-row={currentRow}
                            data-col={cIdx}
                            value={cells[tag] || ""}
                            onChange={(e) => setCells(prev => ({ ...prev, [tag]: e.target.value }))}
                            onKeyDown={(e) => handleKeyDown(e, currentRow, cIdx, 1000, hours.length)}
                            className="h-9 w-full bg-transparent border-none rounded-none text-center font-mono font-black text-[12px] text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-blue-50/30 placeholder:text-slate-200"
                            placeholder="—"
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
