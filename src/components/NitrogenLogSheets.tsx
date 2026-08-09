import { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Loader2, Save, CheckCircle2, FileText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getOperator, getStamp } from "@/lib/session";

// 12-Hour Shift System Times
const TWELVE_HOUR_TIMES = ["08", "10", "12", "14", "16", "18", "20", "22", "00", "02", "04", "06"];

const DCS_INSTRUMENTS = [
  "60-PIC-006 PRESSURE/OPENING%",
  "60-PI-012 Compressor discharge",
  "60-TI-002 Compressor temp",
  "60-TI-005 C.W. Tank inlet temp",
  "60-LI-001 C.W. Tank level %",
  "60-PI-014 C.W. Pressure",
  "60-FIC-001 Inlet flow to 2201 A/B",
  "60-FIC-001 Inlet flow to 2202 A/B",
  "60-TI-001 Dryers outlet temp",
  "60-PI-001 Dryers outlet pressure",
  "60-PIC-005 Pressure / Opening %",
  "60-FT-005 Inst. Air flow",
  "60-PI-005 Inst. Air pressure",
  "60-PIC-022 pro. Air from Amm-1",
  "60-FT-004 Air flow to P.S.A",
  "60-FI-305 P.S.A production",
  "60-PI-010 P.S.A production",
  "60-TI-305 P.S.A production",
  "60-AI-001 main dew point",
  "60-AL-003 P.S.A Production purity",
];

const COMPRESSOR_INSTRUMENTS = [
  "Amper",
  "ΔP Air filter",
  "Compressed air outlet press",
  "Lub oil pressure",
  "First stage air discharge",
  "Compressed air temp",
  "Element one outlet",
  "Element two outlet",
  "Cooling water inlet temp",
  "LP. Cooling water outlet temp",
  "Lub oil tank level %",
  "Lub oil temp",
];
const COMPRESSOR_UNITS = ["60-1001/A", "60-1001/B", "60-1001/C"];

const LOCAL2_INSTRUMENTS = [
  "60-PT-0014 C.W. P. discharge",
  "60-lt-0001 C.W. tank level %",
  "60-PT-0016 S.W. pressure",
  "60-PT-0017 S.W. pressure",
  "60-PI-0009 compressed air press",
  "60-TI-029 compressed air TEMP",
  "60-AT-001 common dew point",
  "60-TI-010 inst. Air TEMP",
  "60-pt-0001 dryers outlet press",
  "61-FIC-001 inlet flow to 2201",
  "61-FIC-002 INLET FLOW TO 2202",
  "60-2201 A/B filter ΔP",
  "60-2202 A/B filter ΔP",
  "60-FT-0005 Inst. Air flow",
  "P.S.A unit",
  "60-2203 A/B inlet filter ΔP",
  "61-2203 CV/D inlet filter ΔP",
  "61-303-02 analyzer",
  "60-301-02 analyzer",
  "61-303-02 analyzer (b)",
  "62-302 production o2 analyzer",
  "60-FT-004 air flow to P.S.A",
  "60-PT-010 N2 header pressure",
  "60-PG-308 N2 Receiver pressure",
  "60-AL-003 P.S.A Oxygen cont",
];

const SHIFTS_12H = [
  { key: "day", label: "وردية النهار (Day Shift)", range: "08:00 — 20:00" },
  { key: "night", label: "الوردية الليلية (Night Shift)", range: "20:00 — 08:00" },
];

const SHEET_PREFIX = "N2";

function buildTag(sheet: string, instrument: string, hour: string) {
  return `${SHEET_PREFIX}|${sheet}|${instrument}|${hour}`;
}

function hourToTimestamp(date: Date, hour: string) {
  const d = new Date(date);
  d.setHours(parseInt(hour, 10), 0, 0, 0);
  return d.toISOString();
}

type CellMap = Record<string, string>;

interface Props {
  selectedDate?: Date;
}

export default function NitrogenLogSheets({ selectedDate = new Date() }: Props) {
  const { toast } = useToast();
  const operator = getOperator();
  const [cells, setCells] = useState<CellMap>({});
  const [saving, setSaving] = useState<string | null>(null);
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

    const map: CellMap = {};
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

  const handleChange = (tag: string, v: string) => {
    setCells((c) => ({ ...c, [tag]: v }));
  };

  const saveCell = async (sheet: string, instrument: string, hour: string) => {
    const tag = buildTag(sheet, instrument, hour);
    const raw = cells[tag]?.trim();
    if (!raw) return;
    const num = parseFloat(raw);
    if (isNaN(num)) {
      toast({ title: "Invalid Number", description: `${instrument} @ ${hour}:00`, variant: "destructive" });
      return;
    }
    setSaving(tag);
    const ts = hourToTimestamp(selectedDate, hour);
    await supabase.from("operations_logs")
      .delete()
      .eq("department", "NITROGEN")
      .eq("unit_tag", tag)
      .gte("timestamp", format(selectedDate, "yyyy-MM-dd") + "T00:00:00.000Z")
      .lte("timestamp", format(selectedDate, "yyyy-MM-dd") + "T23:59:59.999Z");

    const { error } = await supabase.from("operations_logs").insert({
      department: "NITROGEN",
      unit_tag: tag,
      value: num,
      timestamp: ts,
      employee_id: operator?.employeeId ?? null,
    });
    setSaving(null);
    if (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return;
    }
    const stamp = getStamp();
    await supabase.from("activity_logs").insert({
      department: "NITROGEN",
      action: "N2_LOG_CELL",
      details: `${tag} = ${num} ${stamp.formatted}`,
    });
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
      <div className="bg-slate-50 p-12 rounded-xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 border border-slate-200 shadow-sm space-y-12 print:p-0 print:shadow-none print:border-none">
      {/* Paper Header */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">N2 PLANT DIGITAL LOG</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Official Operations Record | {format(selectedDate, "EEEE, dd MMM yyyy")}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          {SHIFTS_12H.map((s) => {
            const signed = !!signatures[`N2_SIGN_${s.key.toUpperCase()}`];
            return (
              <Button
                key={s.key}
                size="sm"
                variant={signed ? "default" : "outline"}
                onClick={() => signShift(s.key)}
                className="h-8 text-[10px] font-bold uppercase tracking-widest border-slate-300"
                title={s.range}
              >
                {signed ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <PenLine className="w-3.5 h-3.5 mr-1" />}
                {s.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Sheet Tables Stacked */}
      <div className="space-y-10">
        <SheetTable
          title="SHEET 1: Air Compressors (60-1001 A/B/C)"
          sheetKey="DCS"
          instruments={DCS_INSTRUMENTS}
          hours={TWELVE_HOUR_TIMES}
          cells={cells}
          saving={saving}
          onChange={handleChange}
          onSaveCell={saveCell}
        />

        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-900 uppercase border-l-4 border-slate-900 pl-2">SHEET 2: Compressor Local Readings</h3>
          {COMPRESSOR_UNITS.map((unit) => (
            <SheetTable
              key={unit}
              title={`Unit ${unit}`}
              sheetKey={`COMP-${unit}`}
              instruments={COMPRESSOR_INSTRUMENTS}
              hours={TWELVE_HOUR_TIMES}
              cells={cells}
              saving={saving}
              onChange={handleChange}
              onSaveCell={saveCell}
              compact
            />
          ))}
        </div>

        <SheetTable
          title="SHEET 3: General System & Utilities"
          sheetKey="LOCAL-GEN"
          instruments={LOCAL2_INSTRUMENTS}
          hours={TWELVE_HOUR_TIMES}
          cells={cells}
          saving={saving}
          onChange={handleChange}
          onSaveCell={saveCell}
        />
      </div>

      {/* Signature Area */}
      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
        {SHIFTS_12H.map(shift => {
          const signed = !!signatures[`N2_SIGN_${shift.key.toUpperCase()}`];
          const sigData = signatures[`N2_SIGN_${shift.key.toUpperCase()}`];
          return (
            <div key={shift.key} className="border border-slate-100 p-4 bg-slate-50/50 rounded flex flex-col gap-2">
              <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-400">
                <span>{shift.label}</span>
                <span>{shift.range}</span>
              </div>
              <div className="h-16 border border-dashed border-slate-200 rounded flex items-center justify-center font-mono text-[9px] text-slate-400 uppercase italic">
                {signed ? sigData : "Waiting for Authorization"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Internal Table Component ---
function SheetTable({
  title, sheetKey, instruments, hours, cells, saving,
  onChange, onSaveCell, compact,
}: any) {
  
  const handleKeyDown = (e: any, row: number, col: number) => {
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

  return (
    <div className="border-[1.5px] border-slate-900 overflow-hidden">
      <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between">
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="bg-slate-100 hover:bg-slate-100 border-b-[1.5px] border-slate-900">
              <TableHead className="w-[280px] text-slate-900 font-black uppercase text-[10px] border-r-[1.5px] border-slate-900">Parameter</TableHead>
              {hours.map((h: string) => (
                <TableHead key={h} className="text-center text-[10px] font-mono font-black text-slate-900 border-r-[1.5px] border-slate-900 min-w-[70px]">
                  {h}:00
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {instruments.map((ins: string, rIdx: number) => (
              <TableRow key={ins} className="h-8 hover:bg-slate-50 border-b-[1.5px] border-slate-400">
                <TableCell className="py-1 px-3 font-mono font-bold text-[10px] text-slate-900 border-r-[1.5px] border-slate-900 bg-slate-50/50">
                  {ins}
                </TableCell>
                {hours.map((h: string, cIdx: number) => {
                  const tag = buildTag(sheetKey, ins, h);
                  return (
                    <TableCell key={h} className="p-0 border-r-[1.5px] border-slate-400">
                      <Input
                        data-sheet={sheetKey}
                        data-row={rIdx}
                        data-col={cIdx}
                        value={cells[tag] ?? ""}
                        onChange={(e) => onChange(tag, e.target.value)}
                        onBlur={() => cells[tag]?.trim() && onSaveCell(sheetKey, ins, h)}
                        onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                        placeholder="—"
                        inputMode="decimal"
                        className={`h-8 w-full text-center text-[11px] font-mono font-black border-none rounded-none focus-visible:ring-2 focus-visible:ring-blue-600 ${saving === tag ? "bg-blue-50" : "bg-transparent"} text-slate-900`}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

  );
}
