import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { LAB_PARAMETERS } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  LogOut, FlaskConical, Clock, Loader2, Trash2,
  CalendarIcon, Globe, User, FileDown, FileSpreadsheet, Save,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import ExportPreviewDialog, { ExportPreviewData } from "@/components/ExportPreviewDialog";
import { getLabRange, isInRange, statusColorClasses } from "@/lib/ranges";

interface LabEntry {
  id: string;
  plant: string;
  sample_type: string;
  parameter_name: string;
  value: number;
  technician_name: string;
  employee_id: string;
  timestamp: string;
  created_at: string;
}

interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  dropdown_options: string[];
  department: string | null;
  is_active: boolean;
}

interface SampleEntry {
  id: string;
  sample_name: string;
  department: string;
  analysis_type: string;
  status: string;
  employee_id: string;
  technician_name: string;
  sample_date: string;
  dynamic_data: Record<string, any>;
  notes: string | null;
  created_at: string;
}

const PLANTS = ["AMM1", "AMM2", "NITROGEN", "DEMIN1", "DEMIN2", "UTILITIES"];

const LabDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang, setLang } = useI18n();

  const [technicianName, setTechnicianName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [plant, setPlant] = useState("");
  const [sampleType, setSampleType] = useState<"daily" | "weekly">("daily");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<LabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Dynamic fields & samples
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [sampleName, setSampleName] = useState("");
  const [analysisType, setAnalysisType] = useState("routine");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [sampleNotes, setSampleNotes] = useState("");
  const [savingSample, setSavingSample] = useState(false);
  const [samples, setSamples] = useState<SampleEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"classic" | "samples">("classic");
  const [previewData, setPreviewData] = useState<ExportPreviewData | null>(null);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const parameters = plant && LAB_PARAMETERS[plant] ? LAB_PARAMETERS[plant][sampleType] || [] : [];

  useEffect(() => {
    const dept = sessionStorage.getItem("lifeco_dept");
    if (dept !== "LABORATORY") { navigate("/"); return; }
    fetchDynamicFields();
    // Realtime — keep results & samples in sync with other modules
    const ch = supabase.channel("lab_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results" }, () => fetchResults())
      .on("postgres_changes", { event: "*", schema: "public", table: "samples" }, () => fetchSamples())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => { fetchResults(); fetchSamples(); }, [selectedDate]);

  const fetchDynamicFields = async () => {
    const { data } = await supabase.from("dynamic_fields").select("*")
      .eq("is_active", true).order("sort_order");
    if (data) setDynamicFields(data as DynamicField[]);
  };

  const fetchResults = async () => {
    setLoading(true);
    const start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate); end.setHours(23, 59, 59, 999);
    const { data } = await supabase.from("lab_results").select("*")
      .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString())
      .order("timestamp", { ascending: false });
    if (data) setResults(data as LabEntry[]);
    setLoading(false);
  };

  const fetchSamples = async () => {
    const { data } = await supabase.from("samples").select("*")
      .eq("sample_date", format(selectedDate, "yyyy-MM-dd"))
      .order("created_at", { ascending: false });
    if (data) setSamples(data as SampleEntry[]);
  };

  const filteredDynamicFields = dynamicFields.filter(f =>
    !f.department || f.department === "all" || f.department === plant
  );

  const handleSaveAll = async () => {
    if (!technicianName || !employeeId || !plant) {
      toast({ title: t.labMissingFields, variant: "destructive" });
      return;
    }
    const entries = Object.entries(paramValues).filter(([_, v]) => v !== "" && !isNaN(parseFloat(v)));
    if (entries.length === 0) {
      toast({ title: t.labMissingFields, variant: "destructive" });
      return;
    }
    setSaving(true);
    const rows = entries.map(([param, val]) => ({
      plant, sample_type: sampleType, parameter_name: param,
      value: parseFloat(val), technician_name: technicianName,
      employee_id: employeeId, timestamp: new Date().toISOString(),
    }));
    const { error } = await supabase.from("lab_results").insert(rows);
    if (error) {
      toast({ title: t.errorSaving, variant: "destructive" });
    } else {
      toast({ title: t.labSaved });
      setParamValues({});
      fetchResults();
      supabase.from("activity_logs").insert({
        action: "LAB_ENTRY", department: "LABORATORY",
        details: `${plant} ${sampleType}: ${entries.length} params by ${technicianName} (${employeeId})`,
      });
    }
    setSaving(false);
  };

  const handleSaveSample = async () => {
    if (!technicianName || !employeeId || !plant || !sampleName) {
      toast({ title: t.labMissingFields, variant: "destructive" });
      return;
    }
    setSavingSample(true);
    const dynData: Record<string, any> = {};
    filteredDynamicFields.forEach(f => {
      const v = dynamicValues[f.field_name];
      if (v !== undefined && v !== "") {
        dynData[f.field_name] = f.field_type === "number" ? parseFloat(v) : v;
      }
    });

    const { error } = await supabase.from("samples").insert({
      sample_name: sampleName,
      department: plant,
      analysis_type: analysisType,
      employee_id: employeeId,
      technician_name: technicianName,
      sample_date: format(selectedDate, "yyyy-MM-dd"),
      dynamic_data: dynData,
      notes: sampleNotes || null,
      status: "pending",
    });

    if (error) {
      toast({ title: t.errorSaving, variant: "destructive" });
    } else {
      toast({ title: lang === "ar" ? "تم حفظ العينة" : "Sample saved" });
      setDynamicValues({}); setSampleName(""); setSampleNotes("");
      fetchSamples();
    }
    setSavingSample(false);
  };

  const handleDeleteEntry = async (id: string) => {
    await supabase.from("lab_results").delete().eq("id", id);
    toast({ title: t.deleted }); fetchResults();
  };

  const handleDeleteSample = async (id: string) => {
    await supabase.from("samples").delete().eq("id", id);
    toast({ title: t.deleted }); fetchSamples();
  };

  const handleUpdateSampleStatus = async (id: string, status: string) => {
    await supabase.from("samples").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    fetchSamples();
  };

  const buildLabPreview = (): ExportPreviewData => {
    const headers = ["#", lang === "ar" ? "المصنع" : "Plant", lang === "ar" ? "نوع العينة" : "Sample Type",
      lang === "ar" ? "الرقم الوظيفي" : "Employee ID", lang === "ar" ? "الفني" : "Technician",
      lang === "ar" ? "المعامل" : "Parameter", lang === "ar" ? "القيمة" : "Value", lang === "ar" ? "الوقت" : "Time"];
    const rows = results.map((r, i) => [
      i + 1, r.plant, r.sample_type, r.employee_id, r.technician_name,
      r.parameter_name, r.value, format(new Date(r.timestamp), "HH:mm:ss"),
    ]);
    // Add samples if any
    if (samples.length > 0) {
      const dynFieldNames = dynamicFields.filter(f => f.is_active).map(f => f.field_label);
      const sHeaders = ["#", lang === "ar" ? "العينة" : "Sample", lang === "ar" ? "القسم" : "Dept",
        lang === "ar" ? "التحليل" : "Analysis", lang === "ar" ? "الحالة" : "Status",
        lang === "ar" ? "الموظف" : "Employee", lang === "ar" ? "الفني" : "Technician", ...dynFieldNames];
      // Combine both for preview
    }
    return {
      title: "LIFECO PMS 2026 — " + (lang === "ar" ? "المختبر" : "LABORATORY"),
      subtitle: `${format(selectedDate, "dd/MM/yyyy")} — ${results.length} ${lang === "ar" ? "نتيجة" : "results"}`,
      headers, rows,
    };
  };

  const openPreview = () => {
    setPreviewData(buildLabPreview());
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text("LIFECO PMS 2026 - Lab Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date: ${format(selectedDate, "dd/MM/yyyy")}`, 14, 32);

    const grouped: Record<string, LabEntry[]> = {};
    results.forEach(r => { (grouped[r.plant] = grouped[r.plant] || []).push(r); });

    let startY = 40;
    const colors: Record<string, [number, number, number]> = {
      AMM1: [0, 100, 140], AMM2: [0, 80, 120], NITROGEN: [40, 100, 60],
      DEMIN1: [120, 60, 20], DEMIN2: [100, 50, 30],
    };

    Object.entries(grouped).forEach(([p, entries]) => {
      autoTable(doc, {
        startY,
        head: [[p, "Sample Type", "Employee ID", "Technician", "Parameter", "Value", "Time"]],
        body: entries.map((e, i) => [i + 1, e.sample_type, e.employee_id, e.technician_name, e.parameter_name, e.value, format(new Date(e.timestamp), "HH:mm:ss")]),
        theme: "grid",
        headStyles: { fillColor: colors[p] || [0, 60, 100], fontSize: 10 },
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    if (samples.length > 0) {
      const dynFieldNames = dynamicFields.filter(f => f.is_active).map(f => f.field_label);
      autoTable(doc, {
        startY,
        head: [["Sample", "Dept", "Analysis", "Status", "Employee", "Technician", ...dynFieldNames]],
        body: samples.map(s => [
          s.sample_name, s.department, s.analysis_type, s.status,
          s.employee_id, s.technician_name,
          ...dynamicFields.filter(f => f.is_active).map(f => s.dynamic_data?.[f.field_name] ?? "-"),
        ]),
        theme: "grid",
        headStyles: { fillColor: [80, 40, 120], fontSize: 9 },
      });
    }

    doc.setFontSize(9);
    doc.text("LIFECO PMS 2026 | Prepared by: Eng. Mohammed Gadallah", 14, doc.internal.pageSize.height - 10);
    doc.save(`LIFECO_Lab_${selectedDateStr}.pdf`);
  };

  // Power BI Ready Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Fact: Lab Results (normalized)
    const factRows = results.map(r => ({
      record_id: r.id,
      date: format(new Date(r.timestamp), "yyyy-MM-dd"),
      time: format(new Date(r.timestamp), "HH:mm:ss"),
      timestamp_iso: r.timestamp,
      plant_id: r.plant,
      sample_type: r.sample_type,
      parameter_name: r.parameter_name,
      reading_value: r.value,
      employee_id: r.employee_id,
      technician_name: r.technician_name,
    }));
    const ws1 = XLSX.utils.json_to_sheet(factRows);
    ws1["!cols"] = [{ wch: 36 }, { wch: 12 }, { wch: 10 }, { wch: 24 }, { wch: 12 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, "FactLabResults");

    // Fact: Samples (normalized - flatten dynamic_data)
    if (samples.length > 0) {
      const sampleRows = samples.map(s => {
        const row: Record<string, any> = {
          record_id: s.id,
          date: s.sample_date,
          sample_name: s.sample_name,
          department_id: s.department,
          analysis_type: s.analysis_type,
          status: s.status,
          employee_id: s.employee_id,
          technician_name: s.technician_name,
        };
        dynamicFields.filter(f => f.is_active).forEach(f => {
          row[`field_${f.field_name}`] = s.dynamic_data?.[f.field_name] ?? "";
        });
        row["notes"] = s.notes || "";
        return row;
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sampleRows), "FactSamples");
    }

    // Dim: Plants
    const plantSet = new Set(results.map(r => r.plant));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      Array.from(plantSet).map(p => ({ plant_id: p, plant_name: p }))
    ), "DimPlant");

    // Dim: Parameters
    const paramSet = new Set(results.map(r => r.parameter_name));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      Array.from(paramSet).map(p => ({ parameter_name: p, plant_id: results.find(r => r.parameter_name === p)?.plant || "" }))
    ), "DimParameter");

    XLSX.writeFile(wb, `LIFECO_Lab_PowerBI_${selectedDateStr}.xlsx`);
  };

  const now = new Date();
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    alert: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between glass-card rounded-none">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold neon-text tracking-wider">{t.lifecoDigital}</h1>
          <p className="text-muted-foreground text-xs tracking-widest uppercase mt-1">{t.laboratory}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="gap-1.5">
            <Globe className="w-4 h-4" /> {t.language}
          </Button>
          <Button variant="outline" size="sm" onClick={openPreview} className="gap-1.5">
            <FileDown className="w-4 h-4" /> {t.pdf}
          </Button>
          <Button variant="outline" size="sm" onClick={openPreview} className="gap-1.5">
            <FileSpreadsheet className="w-4 h-4" /> {t.excel}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5 text-muted-foreground">
            <LogOut className="w-4 h-4" /> {t.exit}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Date Filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 flex flex-wrap items-center gap-4">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground font-medium">{t.dateFilter}</span>
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
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>{format(now, "dd/MM/yyyy")} — {format(now, "HH:mm:ss")}</span>
          </div>
        </motion.div>

        {/* Tab Selector */}
        <div className="flex gap-2">
          <Button variant={activeTab === "classic" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("classic")}>
            {lang === "ar" ? "الإدخال الكلاسيكي" : "Classic Entry"}
          </Button>
          <Button variant={activeTab === "samples" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("samples")}>
            {lang === "ar" ? "العينات الديناميكية" : "Dynamic Samples"}
          </Button>
        </div>

        {activeTab === "classic" ? (
          <>
            {/* Classic Entry Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 neon-border">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-primary" />
                <h2 className="text-foreground font-semibold">{t.newLogEntry}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {t.technicianName}
                  </label>
                  <Input value={technicianName} onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder={t.technicianNamePlaceholder} className="bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {t.employeeId}
                  </label>
                  <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder={t.employeeIdPlaceholder} className="bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5">{t.selectPlant}</label>
                  <Select value={plant} onValueChange={(v) => { setPlant(v); setParamValues({}); }}>
                    <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder={t.selectPlant} /></SelectTrigger>
                    <SelectContent>{PLANTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5">{t.sampleType}</label>
                  <Select value={sampleType} onValueChange={(v) => { setSampleType(v as "daily" | "weekly"); setParamValues({}); }}>
                    <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t.daily}</SelectItem>
                      <SelectItem value="weekly">{t.weekly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {parameters.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">{t.parameter} — {plant} ({sampleType})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {parameters.map((param, idx) => (
                      <div key={param} className="bg-secondary/30 rounded-lg p-3">
                        <label className="text-xs text-muted-foreground block mb-1">{param}</label>
                        <Input type="number" value={paramValues[param] || ""}
                          id={`param-${idx}`}
                          onChange={(e) => setParamValues(prev => ({ ...prev, [param]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const next = document.getElementById(`param-${idx + 1}`);
                              if (next) (next as HTMLInputElement).focus();
                              else handleSaveAll();
                            }
                          }}
                          placeholder="0.00" className="bg-secondary/50 border-border text-lg font-bold text-primary h-10" />
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveAll} disabled={saving} className="w-full md:w-auto gap-2 mt-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t.saveSample}
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Classic Results */}
            <div>
              <h2 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" /> {t.labResults} — {format(selectedDate, "dd/MM/yyyy")}
              </h2>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : results.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">{t.noLabResults}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {results.map((entry, i) => {
                      const range = getLabRange(entry.parameter_name);
                      const ok = isInRange(entry.value, range);
                      const colors = statusColorClasses(ok);
                      return (
                      <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`glass-card p-4 hover:neon-border transition-all duration-300 border ${colors.border}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-primary font-semibold text-sm">{entry.parameter_name}</span>
                              <span className="text-[10px] bg-secondary/50 text-muted-foreground px-1.5 py-0.5 rounded">{entry.plant}</span>
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{entry.sample_type}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                                {ok ? (lang === "ar" ? "طبيعي" : "Normal") : (lang === "ar" ? "خارج النطاق" : "Out of Range")}
                              </span>
                            </div>
                            <p className={`text-3xl font-bold mt-1 ${colors.text}`}>{entry.value}{range?.unit ? <span className="text-sm opacity-60 ml-1">{range.unit}</span> : null}</p>
                            <p className="text-xs text-muted-foreground mt-1">{entry.technician_name} • {entry.employee_id}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground">{format(new Date(entry.timestamp), "dd/MM/yyyy — HH:mm:ss")}</span>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => handleDeleteEntry(entry.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Dynamic Sample Entry */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 neon-border">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-primary" />
                <h2 className="text-foreground font-semibold">
                  {lang === "ar" ? "إدخال عينة جديدة" : "New Sample Entry"}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {t.technicianName}
                  </label>
                  <Input value={technicianName} onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder={t.technicianNamePlaceholder} className="bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {t.employeeId}
                  </label>
                  <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder={t.employeeIdPlaceholder} className="bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5">
                    {lang === "ar" ? "اسم العينة" : "Sample Name"}
                  </label>
                  <Input value={sampleName} onChange={(e) => setSampleName(e.target.value)}
                    placeholder={lang === "ar" ? "أدخل اسم العينة..." : "Enter sample name..."}
                    className="bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5">{t.selectPlant}</label>
                  <Select value={plant} onValueChange={setPlant}>
                    <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder={t.selectPlant} /></SelectTrigger>
                    <SelectContent>{PLANTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5">
                    {lang === "ar" ? "نوع التحليل" : "Analysis Type"}
                  </label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">{lang === "ar" ? "روتيني" : "Routine"}</SelectItem>
                      <SelectItem value="special">{lang === "ar" ? "خاص" : "Special"}</SelectItem>
                      <SelectItem value="emergency">{lang === "ar" ? "طارئ" : "Emergency"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5">
                    {lang === "ar" ? "ملاحظات" : "Notes"}
                  </label>
                  <Input value={sampleNotes} onChange={(e) => setSampleNotes(e.target.value)}
                    placeholder={lang === "ar" ? "ملاحظات اختيارية..." : "Optional notes..."}
                    className="bg-secondary/50 border-border" />
                </div>
              </div>

              {/* Dynamic Fields */}
              {filteredDynamicFields.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {lang === "ar" ? "الحقول الديناميكية" : "Dynamic Fields"}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredDynamicFields.map(field => (
                      <div key={field.id} className="bg-secondary/30 rounded-lg p-3">
                        <label className="text-xs text-muted-foreground block mb-1">{field.field_label}</label>
                        {field.field_type === "dropdown" ? (
                          <Select value={dynamicValues[field.field_name] || ""} onValueChange={(v) => setDynamicValues(prev => ({ ...prev, [field.field_name]: v }))}>
                            <SelectTrigger className="bg-secondary/50 border-border h-10"><SelectValue placeholder="..." /></SelectTrigger>
                            <SelectContent>
                              {(field.dropdown_options || []).map((opt: string) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.field_type === "number" ? "number" : "text"}
                            value={dynamicValues[field.field_name] || ""}
                            onChange={(e) => setDynamicValues(prev => ({ ...prev, [field.field_name]: e.target.value }))}
                            placeholder={field.field_type === "number" ? "0.00" : "..."}
                            className="bg-secondary/50 border-border text-lg font-bold text-primary h-10"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveSample} disabled={savingSample} className="w-full md:w-auto gap-2 mt-2">
                    {savingSample ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {lang === "ar" ? "حفظ العينة" : "Save Sample"}
                  </Button>
                </div>
              )}
              {filteredDynamicFields.length === 0 && plant && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  {lang === "ar" ? "لا توجد حقول ديناميكية. أضف حقول من لوحة الإعدادات." : "No dynamic fields configured. Add fields from Admin Settings."}
                </p>
              )}
            </motion.div>

            {/* Samples List */}
            <div>
              <h2 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                {lang === "ar" ? "العينات" : "Samples"} — {format(selectedDate, "dd/MM/yyyy")}
              </h2>
              {samples.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  {lang === "ar" ? "لا توجد عينات لهذا التاريخ" : "No samples for this date"}
                </div>
              ) : (
                <div className="space-y-3">
                  {samples.map((sample, i) => (
                    <motion.div key={sample.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }} className="glass-card p-4 hover:neon-border transition-all duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-primary font-semibold">{sample.sample_name}</span>
                          <Badge variant="outline" className="text-[10px]">{sample.department}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{sample.analysis_type}</Badge>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[sample.status]}`}>
                            {sample.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Select value={sample.status} onValueChange={(v) => handleUpdateSampleStatus(sample.id, v)}>
                            <SelectTrigger className="w-28 h-7 text-xs bg-secondary/50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="alert">Alert</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => handleDeleteSample(sample.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {Object.entries(sample.dynamic_data || {}).map(([key, val]) => {
                          const fieldDef = dynamicFields.find(f => f.field_name === key);
                          return (
                            <div key={key} className="bg-secondary/20 rounded p-2">
                              <span className="text-xs text-muted-foreground">{fieldDef?.field_label || key}</span>
                              <p className="text-foreground font-semibold">{String(val)}</p>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {sample.technician_name} • {sample.employee_id}
                        {sample.notes && ` • ${sample.notes}`}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border px-6 py-3 text-center">
        <p className="text-muted-foreground text-xs" dir="rtl">{t.footer}</p>
      </footer>

      {previewData && (
        <ExportPreviewDialog
          open={!!previewData}
          onClose={() => setPreviewData(null)}
          data={previewData}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />
      )}
    </div>
  );
};

export default LabDashboard;
