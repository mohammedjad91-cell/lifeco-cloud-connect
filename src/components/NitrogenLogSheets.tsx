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

// ---- Sheet definitions ---------------------------------------------------

const DCS_TIMES = ["08", "10", "12", "14", "16", "18", "20", "24", "02", "04", "06"];
const LOCAL_TIMES = ["08", "12", "16", "20", "24", "04"];

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

const SHIFTS = [
  { key: "morning", label: "Morning Shift", range: "06:00 — 14:00" },
  { key: "afternoon", label: "Afternoon Shift", range: "14:00 — 22:00" },
  { key: "night", label: "Night Shift", range: "22:00 — 06:00" },
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

// ---- Component -----------------------------------------------------------

type CellMap = Record<string, string>; // key=tag -> value

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
  const isNightHour = useMemo(() => {
    const h = new Date().getHours();
    return h >= 22 || h < 6;
  }, []);

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
      toast({ title: "Invalid number", description: `${instrument} @ ${hour}:00`, variant: "destructive" });
      return;
    }
    setSaving(tag);
    const ts = hourToTimestamp(selectedDate, hour);
    // upsert: delete existing then insert
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
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    const stamp = getStamp();
    await supabase.from("activity_logs").insert({
      department: "NITROGEN",
      action: "N2_LOG_CELL",
      details: `${tag} = ${num} ${stamp.formatted}`,
    });
  };

  const saveRow = async (sheet: string, instrument: string, hours: string[]) => {
    for (const h of hours) {
      const tag = buildTag(sheet, instrument, h);
      if (cells[tag]?.trim()) await saveCell(sheet, instrument, h);
    }
    toast({ title: "Row saved", description: instrument });
  };

  const signShift = async (shiftKey: string) => {
    if (!operator) {
      toast({ title: "Operator required", description: "Please log in as operator first.", variant: "destructive" });
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
    toast({ title: "Shift signed", description: stamp.formatted });
  };

  if (loading) {
    return (
      <div className="glass-card p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card neon-border p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-display text-lg neon-text tracking-wider">NITROGEN PLANT — Digital Log Sheets</h2>
            <p className="text-xs text-muted-foreground">
              {format(selectedDate, "EEEE, dd MMM yyyy")} — Operator: {operator ? `${operator.name} (${operator.employeeId})` : "—"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {SHIFTS.map((s) => {
            const signed = !!signatures[`N2_SIGN_${s.key.toUpperCase()}`];
            return (
              <Button
                key={s.key}
                size="sm"
                variant={signed ? "default" : "outline"}
                onClick={() => signShift(s.key)}
                className="gap-1.5"
                title={s.range}
              >
                {signed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PenLine className="w-3.5 h-3.5" />}
                {s.label}
              </Button>
            );
          })}
        </div>
      </motion.div>

      {/* Sheet 1 — DCS PANEL */}
      <SheetTable
        title="Table 1 — D.C.S. PANEL SHEET"
        sheetKey="DCS"
        instruments={DCS_INSTRUMENTS}
        hours={DCS_TIMES}
        cells={cells}
        saving={saving}
        isNightHour={isNightHour}
        onChange={handleChange}
        onSaveCell={saveCell}
        onSaveRow={saveRow}
      />

      {/* Sheet 2 — LOCAL Compressors */}
      <div className="space-y-4">
        <h3 className="font-display text-md neon-text tracking-wider">Table 2 — LOCAL SHEET (Compressors)</h3>
        {COMPRESSOR_UNITS.map((unit) => (
          <SheetTable
            key={unit}
            title={`Compressor ${unit}`}
            sheetKey={`COMP-${unit}`}
            instruments={COMPRESSOR_INSTRUMENTS}
            hours={LOCAL_TIMES}
            cells={cells}
            saving={saving}
            isNightHour={isNightHour}
            onChange={handleChange}
            onSaveCell={saveCell}
            onSaveRow={saveRow}
            compact
          />
        ))}
      </div>

      {/* Sheet 3 — LOCAL General */}
      <SheetTable
        title="Table 3 — LOCAL SHEET (General System)"
        sheetKey="LOCAL-GEN"
        instruments={LOCAL2_INSTRUMENTS}
        hours={LOCAL_TIMES}
        cells={cells}
        saving={saving}
        isNightHour={isNightHour}
        onChange={handleChange}
        onSaveCell={saveCell}
        onSaveRow={saveRow}
      />
    </div>
  );
}

// ---- Sheet sub-table -----------------------------------------------------

interface SheetTableProps {
  title: string;
  sheetKey: string;
  instruments: string[];
  hours: string[];
  cells: CellMap;
  saving: string | null;
  isNightHour: boolean;
  onChange: (tag: string, v: string) => void;
  onSaveCell: (sheet: string, instrument: string, hour: string) => void;
  onSaveRow: (sheet: string, instrument: string, hours: string[]) => void;
  compact?: boolean;
}

function SheetTable({
  title, sheetKey, instruments, hours, cells, saving, isNightHour,
  onChange, onSaveCell, onSaveRow, compact,
}: SheetTableProps) {
  const currentHour = new Date().getHours();
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card neon-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
        <h3 className={`font-semibold text-foreground ${compact ? "text-sm" : ""}`}>{title}</h3>
        <span className="text-[10px] text-muted-foreground">All values auto-stamped on save</span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead className="sticky left-0 bg-secondary/80 z-10 min-w-[260px]">Instrument</TableHead>
              {hours.map((h) => {
                const hr = parseInt(h, 10);
                const active = hr === currentHour || (h === "24" && currentHour === 0);
                return (
                  <TableHead key={h} className={`text-center text-xs ${active ? "text-primary neon-text" : ""}`}>
                    {h}:00
                  </TableHead>
                );
              })}
              <TableHead className="text-center text-xs">Save</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instruments.map((ins, idx) => {
              const rowHighlight = isNightHour && idx % 2 === 0 ? "bg-primary/5" : "";
              return (
                <TableRow key={ins} className={`${rowHighlight} hover:bg-primary/10 transition-colors`}>
                  <TableCell className="sticky left-0 bg-background/80 z-10 font-mono text-[11px] text-foreground/90">
                    {ins}
                  </TableCell>
                  {hours.map((h) => {
                    const tag = buildTag(sheetKey, ins, h);
                    const hr = parseInt(h, 10);
                    const isCurrent = hr === currentHour || (h === "24" && currentHour === 0);
                    return (
                      <TableCell key={h} className="p-1">
                        <Input
                          value={cells[tag] ?? ""}
                          onChange={(e) => onChange(tag, e.target.value)}
                          onBlur={() => cells[tag]?.trim() && onSaveCell(sheetKey, ins, h)}
                          placeholder="—"
                          inputMode="decimal"
                          className={`h-8 text-center text-xs bg-secondary/40 border-border ${
                            isCurrent ? "ring-1 ring-primary/60 neon-border" : ""
                          } ${saving === tag ? "opacity-60" : ""}`}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell className="p-1 text-center">
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => onSaveRow(sheetKey, ins, hours)}
                      className="h-7 px-2"
                      title="Save all values in this row"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

function buildTagExport(sheet: string, ins: string, hour: string) {
  return buildTag(sheet, ins, hour);
}
export { buildTagExport };
