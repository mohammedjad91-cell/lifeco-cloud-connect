import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "framer-motion";
import { getDepartmentById } from "@/lib/departments";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut, Plus, FileDown, FileSpreadsheet, Clock, Tag, Hash, CheckCircle,
  Loader2, Trash2, Edit2, Lock, CalendarIcon, History, BarChart3, Globe, User, FlaskConical,
  Wrench, Sparkles, FileText,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import GlassPulseChart from "@/components/GlassPulseChart";
import FieldOpsForm from "@/components/FieldOpsForm";
import AssetRegister from "@/components/AssetRegister";
import DailyReportGenerator from "@/components/DailyReportGenerator";
import DateUserBanner from "@/components/DateUserBanner";
import { LAB_PARAMETERS } from "@/lib/departments";
import { useI18n } from "@/lib/i18n";
import ExportPreviewDialog, { ExportPreviewData } from "@/components/ExportPreviewDialog";
import { getOperator, getStamp } from "@/lib/session";

interface LogEntry {
  id: string;
  department: string;
  unit_tag: string;
  value: number;
  timestamp: string;
  created_at: string;
  employee_id: string | null;
}

interface LabEntry {
  id: string;
  plant: string;
  sample_type: string;
  parameter_name: string;
  value: number;
  technician_name: string;
  employee_id: string;
  timestamp: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang, setLang } = useI18n();
  const [department, setDepartment] = useState(getDepartmentById(sessionStorage.getItem("lifeco_dept") || ""));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [unitTag, setUnitTag] = useState("");
  const [value, setValue] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lockedDates, setLockedDates] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [labResults, setLabResults] = useState<LabEntry[]>([]);
  const employeeIdRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const [previewData, setPreviewData] = useState<ExportPreviewData | null>(null);
  const [previewMode, setPreviewMode] = useState<"ops" | "lab" | null>(null);

  const isOperations = department?.id === "OPERATIONS";
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isSelectedDateToday = selectedDateStr === todayStr;
  const isDateLocked = lockedDates.includes(selectedDateStr);

  // Load custom tags from localStorage
  const deptTags = useMemo(() => {
    if (!department) return [];
    const saved = localStorage.getItem(`lifeco_tags_${department.id}`);
    return saved ? JSON.parse(saved) : department.tags;
  }, [department]);

  useEffect(() => {
    if (!department) { navigate("/"); return; }
    supabase.from("activity_logs").insert({
      action: "LOGIN", department: department.id, details: `${department.label} logged in`,
    });
    fetchLockedDates();
    const channel = supabase.channel("ops_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "operations_logs" }, () => fetchLogs())
      .on("postgres_changes", { event: "*", schema: "public", table: "locked_dates" }, () => fetchLockedDates())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [department]);

  useEffect(() => { fetchLogs(); fetchLabResults(); }, [selectedDate, department]);

  const fetchLockedDates = async () => {
    const { data } = await supabase.from("locked_dates").select("locked_date");
    if (data) setLockedDates(data.map((d: any) => d.locked_date));
  };

  const fetchLogs = async () => {
    if (!department) return;
    const start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate); end.setHours(23, 59, 59, 999);

    let query = supabase.from("operations_logs").select("*")
      .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString())
      .order("timestamp", { ascending: false });

    if (!isOperations) {
      query = query.eq("department", department.id);
    }

    const { data, error } = await query;
    if (!error && data) setLogs(data as LogEntry[]);
    setLoading(false);
  };

  const fetchLabResults = async () => {
    if (!department || isOperations) return;
    const start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate); end.setHours(23, 59, 59, 999);
    const { data } = await supabase.from("lab_results").select("*")
      .eq("plant", department.id)
      .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString())
      .order("timestamp", { ascending: false });
    if (data) setLabResults(data as LabEntry[]);
  };

  const handleEnterKey = (e: React.KeyboardEvent, nextAction: () => void) => {
    if (e.key === "Enter") { e.preventDefault(); nextAction(); }
  };

  const handleSave = async () => {
    if (!employeeId || !unitTag || !value || !department || isDateLocked) {
      toast({ title: t.missingFields, variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("operations_logs").insert({
      department: department.id, unit_tag: unitTag, value: parseFloat(value),
      timestamp: new Date().toISOString(), employee_id: employeeId,
    });
    if (error) {
      toast({ title: t.errorSaving, variant: "destructive" });
    } else {
      setSaved(true); setTimeout(() => setSaved(false), 1500);
      setUnitTag(""); setValue("");
      toast({ title: t.saved, description: t.logEntrySaved });
      supabase.from("activity_logs").insert({
        action: "LOG_CREATED", department: department.id, details: `${unitTag}: ${value} (EID: ${employeeId})`,
      });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (isDateLocked) return;
    const { error } = await supabase.from("operations_logs").delete().eq("id", id);
    if (!error) {
      toast({ title: t.deleted });
      supabase.from("activity_logs").insert({ action: "LOG_DELETED", department: department?.id, details: `Deleted log ${id}` });
      fetchLogs();
    }
  };

  const handleEdit = async (id: string) => {
    if (isDateLocked || !editValue) return;
    const { error } = await supabase.from("operations_logs").update({ value: parseFloat(editValue) }).eq("id", id);
    if (!error) {
      setEditingId(null); setEditValue("");
      toast({ title: t.updated });
      fetchLogs();
    }
  };

  const handleFinalize = async () => {
    if (!isOperations) return;
    const { error } = await supabase.from("locked_dates").insert({ locked_date: selectedDateStr, locked_by: "OPERATIONS" });
    if (error) {
      toast({ title: t.alreadyLocked, variant: "destructive" });
    } else {
      toast({ title: "تم الإدراج", description: t.dateLocked });
      supabase.from("activity_logs").insert({ action: "DATE_LOCKED", department: "OPERATIONS", details: `Locked date: ${selectedDateStr}` });
    }
  };

  const canEditLog = (log: LogEntry) => {
    if (isDateLocked) return false;
    const logDate = format(new Date(log.timestamp), "yyyy-MM-dd");
    return logDate === todayStr;
  };

  // Preview helpers
  const buildOpsPreview = (): ExportPreviewData => {
    const headers = ["#", lang === "ar" ? "القسم" : "Dept", lang === "ar" ? "الرقم الوظيفي" : "Employee ID",
      lang === "ar" ? "الوحدة" : "Unit/Tag", lang === "ar" ? "القيمة" : "Value",
      lang === "ar" ? "التاريخ" : "Date", lang === "ar" ? "الوقت" : "Time"];
    const rows = logs.map((l, i) => [
      i + 1, l.department, l.employee_id || "-", l.unit_tag, l.value,
      format(new Date(l.timestamp), "dd/MM/yyyy"), format(new Date(l.timestamp), "HH:mm:ss"),
    ]);
    return {
      title: `LIFECO PMS 2026 — ${department?.label || ""}`,
      subtitle: `${lang === "ar" ? "سجلات العمليات" : "Operations Logs"} — ${format(selectedDate, "dd/MM/yyyy")}`,
      headers, rows,
    };
  };

  const buildLabPreview = (): ExportPreviewData => {
    const headers = ["#", lang === "ar" ? "المعامل" : "Parameter", lang === "ar" ? "القيمة" : "Value",
      lang === "ar" ? "نوع العينة" : "Sample Type", lang === "ar" ? "الفني" : "Technician",
      lang === "ar" ? "الرقم الوظيفي" : "Employee ID", lang === "ar" ? "الوقت" : "Time"];
    const rows = labResults.map((e, i) => [
      i + 1, e.parameter_name, e.value, e.sample_type,
      e.technician_name, e.employee_id, format(new Date(e.timestamp), "HH:mm:ss"),
    ]);
    return {
      title: `LIFECO PMS 2026 — ${department?.label || ""}`,
      subtitle: `${lang === "ar" ? "قراءات المختبر" : "Lab Readings"} — ${format(selectedDate, "dd/MM/yyyy")}`,
      headers, rows,
    };
  };

  const openOpsPreview = () => {
    setPreviewData(buildOpsPreview());
    setPreviewMode("ops");
  };

  const openLabPreview = () => {
    if (labResults.length === 0) return;
    setPreviewData(buildLabPreview());
    setPreviewMode("lab");
  };

  const handleExportPDF = () => {
    if (!department) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text("LIFECO PMS 2026 - Operations Log Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Department: ${department.label}`, 14, 32);
    doc.text(`Date: ${format(selectedDate, "dd/MM/yyyy")}`, 14, 40);

    const grouped: Record<string, LogEntry[]> = {};
    logs.forEach(l => { (grouped[l.department] = grouped[l.department] || []).push(l); });

    let startY = 48;
    const deptColors: Record<string, [number, number, number]> = {
      AMM1: [0, 100, 140], AMM2: [0, 80, 120], NITROGEN: [40, 100, 60],
      DEMIN1: [120, 60, 20], DEMIN2: [100, 50, 30], OPERATIONS: [60, 60, 60],
    };

    Object.entries(grouped).forEach(([dept, entries]) => {
      const color = deptColors[dept] || [0, 60, 100];
      autoTable(doc, {
        startY,
        head: [[`${dept}`, "Employee ID", "Unit/Tag", "Value", "Timestamp"]],
        body: entries.map((log, i) => [i + 1, log.employee_id || "-", log.unit_tag, log.value, format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss")]),
        theme: "grid",
        headStyles: { fillColor: color, fontSize: 11 },
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.setFontSize(9);
    doc.text("LIFECO PMS 2026 | Prepared by: Eng. Mohammed Gadallah", 14, doc.internal.pageSize.height - 10);
    doc.save(`LIFECO_PMS_Report_${department.label}_${selectedDateStr}.pdf`);
  };

  // Power BI Ready Excel: normalized flat table with fact/dimension structure
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Fact table: Operations Logs (normalized for DirectQuery)
    const factRows = logs.map(l => ({
      record_id: l.id,
      date: format(new Date(l.timestamp), "yyyy-MM-dd"),
      time: format(new Date(l.timestamp), "HH:mm:ss"),
      timestamp_iso: l.timestamp,
      department_id: l.department,
      employee_id: l.employee_id || "",
      tag_name: l.unit_tag,
      reading_value: l.value,
    }));
    const ws1 = XLSX.utils.json_to_sheet(factRows);
    ws1["!cols"] = [{ wch: 36 }, { wch: 12 }, { wch: 10 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws1, "FactOperationsLog");

    // Dimension: Departments
    const deptSet = new Set(logs.map(l => l.department));
    const dimDepts = Array.from(deptSet).map(d => ({
      department_id: d,
      department_name: getDepartmentById(d)?.label || d,
    }));
    const ws2 = XLSX.utils.json_to_sheet(dimDepts);
    XLSX.utils.book_append_sheet(wb, ws2, "DimDepartment");

    // Dimension: Tags
    const tagSet = new Set(logs.map(l => l.unit_tag));
    const dimTags = Array.from(tagSet).map(t => ({
      tag_name: t,
      department_id: logs.find(l => l.unit_tag === t)?.department || "",
    }));
    const ws3 = XLSX.utils.json_to_sheet(dimTags);
    XLSX.utils.book_append_sheet(wb, ws3, "DimTags");

    // Date dimension
    const dateSet = new Set(logs.map(l => format(new Date(l.timestamp), "yyyy-MM-dd")));
    const dimDates = Array.from(dateSet).map(d => {
      const dt = new Date(d);
      return { date: d, year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate(), day_name: format(dt, "EEEE") };
    });
    const ws4 = XLSX.utils.json_to_sheet(dimDates);
    XLSX.utils.book_append_sheet(wb, ws4, "DimDate");

    XLSX.writeFile(wb, `LIFECO_PMS_PowerBI_${selectedDateStr}.xlsx`);
  };

  // Lab readings export
  const handleExportLabPDF = () => {
    if (!department || labResults.length === 0) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text(`LIFECO PMS 2026 - Lab Readings: ${department.label}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${format(selectedDate, "dd/MM/yyyy")}`, 14, 32);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Parameter", "Value", "Sample Type", "Technician", "Employee ID", "Time"]],
      body: labResults.map((e, i) => [
        i + 1, e.parameter_name, e.value, e.sample_type,
        e.technician_name, e.employee_id, format(new Date(e.timestamp), "HH:mm:ss"),
      ]),
      theme: "grid",
      headStyles: { fillColor: [0, 80, 140], fontSize: 10 },
    });

    doc.setFontSize(9);
    doc.text("LIFECO PMS 2026 | Prepared by: Eng. Mohammed Gadallah", 14, doc.internal.pageSize.height - 10);
    doc.save(`LIFECO_Lab_${department.label}_${selectedDateStr}.pdf`);
  };

  const handleExportLabExcel = () => {
    if (!department || labResults.length === 0) return;
    const wb = XLSX.utils.book_new();

    // Fact: Lab Results (Power BI normalized)
    const factRows = labResults.map(e => ({
      record_id: e.id,
      date: format(new Date(e.timestamp), "yyyy-MM-dd"),
      time: format(new Date(e.timestamp), "HH:mm:ss"),
      timestamp_iso: e.timestamp,
      plant_id: e.plant,
      sample_type: e.sample_type,
      parameter_name: e.parameter_name,
      reading_value: e.value,
      technician_name: e.technician_name,
      employee_id: e.employee_id,
    }));
    const ws = XLSX.utils.json_to_sheet(factRows);
    ws["!cols"] = [{ wch: 36 }, { wch: 12 }, { wch: 10 }, { wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws, "FactLabResults");

    // Dim: Parameters
    const paramSet = new Set(labResults.map(e => e.parameter_name));
    const dimParams = Array.from(paramSet).map(p => ({
      parameter_name: p,
      plant_id: labResults.find(e => e.parameter_name === p)?.plant || "",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dimParams), "DimParameters");

    XLSX.writeFile(wb, `LIFECO_Lab_PowerBI_${department.label}_${selectedDateStr}.xlsx`);
  };

  const now = new Date();
  if (!department) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between glass-card rounded-none">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold neon-text tracking-wider">{t.lifecoDigital}</h1>
          <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1">{department.label} {t.department}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/assistant")} className="gap-1.5 border-primary/40 text-primary">
            <Sparkles className="w-4 h-4" /> AI Assistant
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="gap-1.5">
            <Globe className="w-4 h-4" /> {t.language}
          </Button>
          <Button variant="outline" size="sm" onClick={openOpsPreview} className="gap-1.5">
            <FileDown className="w-4 h-4" /> {t.pdf}
          </Button>
          <Button variant="outline" size="sm" onClick={openOpsPreview} className="gap-1.5">
            <FileSpreadsheet className="w-4 h-4" /> {t.excel}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5 text-muted-foreground">
            <LogOut className="w-4 h-4" /> Back to Main
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">
        <DateUserBanner />
        {/* Global Date Filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground font-medium">{t.dateFilter}</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
          {isDateLocked && (
            <span className="flex items-center gap-1 text-xs text-destructive font-medium">
              <Lock className="w-3.5 h-3.5" /> {t.locked}
            </span>
          )}
          {isOperations && !isDateLocked && (
            <Button variant="outline" size="sm" onClick={handleFinalize} className="gap-1.5 border-primary/50 text-primary hover:bg-primary/10">
              <Lock className="w-4 h-4" /> {t.finalizeAndLock}
            </Button>
          )}
          {!isOperations && (
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="gap-1.5">
              <History className="w-4 h-4" /> {t.viewDailyHistory}
            </Button>
          )}
        </motion.div>

        {/* GlassPulse — primary live process pulse (preserved & enhanced) */}
        <GlassPulseChart
          departmentId={department.id}
          unitTags={deptTags}
          labParameters={LAB_PARAMETERS[department.id]?.daily ?? []}
        />

        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="glass-card border border-border">
            <TabsTrigger value="logs">{t.logs}</TabsTrigger>
            <TabsTrigger value="fieldOps" className="gap-1.5">
              <Wrench className="w-3.5 h-3.5" /> {t.fieldOps}
            </TabsTrigger>
            {!isOperations && (
              <TabsTrigger value="labReadings" className="gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" /> {t.labReadings}
              </TabsTrigger>
            )}
            <TabsTrigger value="assets" className="gap-1.5">
              <Wrench className="w-3.5 h-3.5" /> Assets
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Report
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> {t.analytics}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-6 mt-4">
            {/* Entry Form - only show if today & not locked */}
            {isSelectedDateToday && !isDateLocked && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 neon-border">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-primary" />
                  <h2 className="text-foreground font-semibold">{t.newLogEntry}</h2>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{format(now, "dd/MM/yyyy")} — {format(now, "HH:mm:ss")}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> {t.employeeId}
                    </label>
                    <Input ref={employeeIdRef} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder={t.employeeIdPlaceholder}
                      onKeyDown={(e) => handleEnterKey(e, () => document.getElementById("value-input")?.focus())}
                      className="bg-secondary/50 border-border h-12" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> {t.unitTag}
                    </label>
                    <Select value={unitTag} onValueChange={setUnitTag}>
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue placeholder={t.selectUnit} />
                      </SelectTrigger>
                      <SelectContent>
                        {deptTags.map((tag: string) => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" /> {t.value}
                    </label>
                    <Input id="value-input" ref={valueRef} type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00"
                      onKeyDown={(e) => handleEnterKey(e, handleSave)}
                      className="bg-secondary/50 border-border text-2xl font-bold h-12 text-primary" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSave} disabled={!employeeId || !unitTag || !value || saving} className="w-full h-12 gap-2 font-semibold text-base">
                      <AnimatePresence mode="wait">
                        {saving ? (
                          <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </motion.span>
                        ) : saved ? (
                          <motion.span key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <CheckCircle className="w-5 h-5" />
                          </motion.span>
                        ) : (
                          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{t.saveEntry}</motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Logs */}
            <div>
              <h2 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> {t.logs} — {format(selectedDate, "dd/MM/yyyy")}
                {isDateLocked && <Lock className="w-3.5 h-3.5 text-destructive" />}
              </h2>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : logs.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">{t.noLogs}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {logs.map((log, index) => (
                      <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} transition={{ delay: index * 0.03 }}
                        className="glass-card p-4 hover:neon-border transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-primary font-semibold text-sm">{log.unit_tag}</span>
                              {isOperations && (
                                <span className="text-[10px] bg-secondary/50 text-muted-foreground px-1.5 py-0.5 rounded">{log.department}</span>
                              )}
                              {log.employee_id && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <User className="w-2.5 h-2.5" /> {log.employee_id}
                                </span>
                              )}
                            </div>
                            {editingId === log.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                                  className="h-8 w-28 text-lg font-bold text-primary" autoFocus
                                  onKeyDown={(e) => handleEnterKey(e, () => handleEdit(log.id))} />
                                <Button size="sm" onClick={() => handleEdit(log.id)}>{t.save}</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>{t.cancel}</Button>
                              </div>
                            ) : (
                              <p className="text-3xl font-bold text-foreground mt-1">{log.value}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "dd/MM/yyyy — HH:mm:ss")}</span>
                            {canEditLog(log) && !isDateLocked && editingId !== log.id && (
                              <div className="flex gap-1 mt-1">
                                <Button variant="ghost" size="icon" className="w-7 h-7"
                                  onClick={() => { setEditingId(log.id); setEditValue(String(log.value)); }}>
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(log.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fieldOps" className="space-y-4 mt-4">
            {isSelectedDateToday && !isDateLocked ? (
              <FieldOpsForm department={department.id} />
            ) : (
              <div className="glass-card p-8 text-center text-muted-foreground">
                {isDateLocked ? t.locked : t.viewDailyHistory}
              </div>
            )}
          </TabsContent>

          {!isOperations && (
            <TabsContent value="labReadings" className="space-y-4 mt-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-foreground font-semibold flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-primary" /> {t.labReadings} — {department.label} — {format(selectedDate, "dd/MM/yyyy")}
                </h2>
                {labResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={openLabPreview} className="gap-1.5">
                      <FileDown className="w-4 h-4" /> {t.pdf}
                    </Button>
                    <Button variant="outline" size="sm" onClick={openLabPreview} className="gap-1.5">
                      <FileSpreadsheet className="w-4 h-4" /> {t.excel}
                    </Button>
                  </div>
                )}
              </div>
              {labResults.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">{t.noLabReadings}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {labResults.map((entry, i) => (
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }} className="glass-card p-4 hover:neon-border transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-primary font-semibold text-sm">{entry.parameter_name}</span>
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{entry.sample_type}</span>
                          </div>
                          <p className="text-3xl font-bold text-foreground mt-1">{entry.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{entry.technician_name} • {entry.employee_id}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{format(new Date(entry.timestamp), "dd/MM/yyyy — HH:mm:ss")}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="assets" className="mt-4">
            <AssetRegister department={department.id} />
          </TabsContent>

          <TabsContent value="report" className="mt-4">
            <DailyReportGenerator department={department.id} date={selectedDate} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border px-6 py-3 text-center">
        <p className="text-muted-foreground text-xs" dir="rtl">{t.footer}</p>
      </footer>

      {previewData && (
        <ExportPreviewDialog
          open={!!previewData}
          onClose={() => { setPreviewData(null); setPreviewMode(null); }}
          data={previewData}
          onExportPDF={previewMode === "lab" ? handleExportLabPDF : handleExportPDF}
          onExportExcel={previewMode === "lab" ? handleExportLabExcel : handleExportExcel}
        />
      )}
    </div>
  );
};

export default Dashboard;
