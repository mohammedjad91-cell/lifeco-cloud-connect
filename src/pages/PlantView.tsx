import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  LogOut, Search, CalendarIcon, FileDown, FileSpreadsheet,
  Globe, Filter, Loader2, Factory, Activity, TrendingUp,
} from "lucide-react";
import { format, subHours } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useI18n } from "@/lib/i18n";
import ExportPreviewDialog, { ExportPreviewData } from "@/components/ExportPreviewDialog";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";

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

interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  department: string | null;
  is_active: boolean;
}

interface OpsLog {
  id: string;
  department: string;
  unit_tag: string;
  value: number;
  timestamp: string;
}

const PLANTS = ["AMM1", "AMM2", "NITROGEN", "DEMIN1", "DEMIN2"];

const PlantView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang, setLang } = useI18n();

  const initialPlant = searchParams.get("plant") || "";
  const [plant, setPlant] = useState(initialPlant);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [samples, setSamples] = useState<SampleEntry[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ExportPreviewData | null>(null);

  // Equipment status & trends
  const [latestLogs, setLatestLogs] = useState<OpsLog[]>([]);
  const [trendTag, setTrendTag] = useState("");
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    fetchDynamicFields();
  }, []);

  useEffect(() => {
    if (plant) {
      fetchSamples();
      fetchLatestLogs();
    }
  }, [plant, startDate, endDate]);

  useEffect(() => {
    if (trendTag) fetchTrendData();
  }, [trendTag]);

  const fetchDynamicFields = async () => {
    const { data } = await supabase.from("dynamic_fields").select("*")
      .eq("is_active", true).order("sort_order");
    if (data) setDynamicFields(data as DynamicField[]);
  };

  const fetchSamples = async () => {
    setLoading(true);
    let query = supabase.from("samples").select("*")
      .gte("sample_date", format(startDate, "yyyy-MM-dd"))
      .lte("sample_date", format(endDate, "yyyy-MM-dd"))
      .order("created_at", { ascending: false });

    if (plant && plant !== "all") {
      query = query.eq("department", plant);
    }

    const { data } = await query;
    if (data) setSamples(data as SampleEntry[]);
    setLoading(false);
  };

  const fetchLatestLogs = async () => {
    if (!plant || plant === "all") return;
    const since = subHours(new Date(), 24).toISOString();
    const { data } = await supabase.from("operations_logs").select("*")
      .eq("department", plant)
      .gte("timestamp", since)
      .order("timestamp", { ascending: false });
    if (data) setLatestLogs(data as OpsLog[]);
  };

  const fetchTrendData = async () => {
    const since = subHours(new Date(), 24).toISOString();
    let query = supabase.from("operations_logs").select("*")
      .eq("unit_tag", trendTag)
      .gte("timestamp", since)
      .order("timestamp", { ascending: true });
    if (plant && plant !== "all") query = query.eq("department", plant);
    const { data } = await query;
    setTrendData((data || []).map((d: any) => ({
      time: format(new Date(d.timestamp), "HH:mm"),
      value: d.value,
    })));
  };

  // Get unique tags from latest logs for equipment status
  const equipmentStatus = useMemo(() => {
    const tagMap = new Map<string, OpsLog>();
    latestLogs.forEach(log => {
      if (!tagMap.has(log.unit_tag)) tagMap.set(log.unit_tag, log);
    });
    return Array.from(tagMap.values());
  }, [latestLogs]);

  const uniqueTags = useMemo(() => equipmentStatus.map(e => e.unit_tag), [equipmentStatus]);

  const relevantFields = useMemo(() =>
    dynamicFields.filter(f => !f.department || f.department === "all" || f.department === plant || plant === "all"),
    [dynamicFields, plant]
  );

  const filteredSamples = useMemo(() => {
    let result = samples;
    if (statusFilter !== "all") {
      result = result.filter(s => s.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.sample_name.toLowerCase().includes(q) ||
        s.technician_name.toLowerCase().includes(q) ||
        s.employee_id.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }
    return result;
  }, [samples, statusFilter, searchQuery]);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    alert: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const buildPlantPreview = (): ExportPreviewData => {
    const dynLabels = relevantFields.map(f => f.field_label);
    const headers = ["#", lang === "ar" ? "العينة" : "Sample", lang === "ar" ? "القسم" : "Dept",
      lang === "ar" ? "التحليل" : "Analysis", lang === "ar" ? "الحالة" : "Status",
      lang === "ar" ? "الموظف" : "Employee", lang === "ar" ? "الفني" : "Technician",
      lang === "ar" ? "التاريخ" : "Date", ...dynLabels, lang === "ar" ? "ملاحظات" : "Notes"];
    const rows = filteredSamples.map((s, i) => [
      i + 1, s.sample_name, s.department, s.analysis_type, s.status,
      s.employee_id, s.technician_name, s.sample_date,
      ...relevantFields.map(f => s.dynamic_data?.[f.field_name] ?? "-"),
      s.notes || "",
    ]);
    return {
      title: `LIFECO PMS 2026 — ${lang === "ar" ? "عرض المصنع" : "Plant View"}: ${plant || "All"}`,
      subtitle: `${format(startDate, "dd/MM/yyyy")} → ${format(endDate, "dd/MM/yyyy")} — ${filteredSamples.length} ${lang === "ar" ? "عينة" : "samples"}`,
      headers, rows,
    };
  };

  const openPreview = () => {
    setPreviewData(buildPlantPreview());
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text(`LIFECO PMS 2026 - Plant View: ${plant || "All"}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`${format(startDate, "dd/MM/yyyy")} — ${format(endDate, "dd/MM/yyyy")}`, 14, 32);

    const dynLabels = relevantFields.map(f => f.field_label);
    autoTable(doc, {
      startY: 40,
      head: [["#", "Sample", "Dept", "Analysis", "Status", "Employee", "Technician", "Date", ...dynLabels, "Notes"]],
      body: filteredSamples.map((s, i) => [
        i + 1, s.sample_name, s.department, s.analysis_type, s.status,
        s.employee_id, s.technician_name, s.sample_date,
        ...relevantFields.map(f => s.dynamic_data?.[f.field_name] ?? "-"),
        s.notes || "",
      ]),
      theme: "grid",
      headStyles: { fillColor: [0, 80, 140], fontSize: 8 },
      styles: { fontSize: 7 },
    });

    doc.setFontSize(9);
    doc.text("LIFECO PMS 2026 | Prepared by: Eng. Mohammed Gadallah", 14, doc.internal.pageSize.height - 10);
    doc.save(`LIFECO_PlantView_${plant || "All"}_${format(startDate, "yyyyMMdd")}.pdf`);
  };

  // Power BI Ready Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Fact: Samples (normalized flat table)
    const factRows = filteredSamples.map(s => {
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
      relevantFields.forEach(f => {
        const val = s.dynamic_data?.[f.field_name];
        row[`measure_${f.field_name}`] = val !== undefined && val !== null ? (typeof val === "number" ? val : String(val)) : "";
      });
      row["notes"] = s.notes || "";
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(factRows);
    XLSX.utils.book_append_sheet(wb, ws, "FactSamples");

    // Dim: Department
    const deptSet = new Set(filteredSamples.map(s => s.department));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      Array.from(deptSet).map(d => ({ department_id: d, department_name: d }))
    ), "DimDepartment");

    // Dim: Date
    const dateSet = new Set(filteredSamples.map(s => s.sample_date));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      Array.from(dateSet).map(d => {
        const dt = new Date(d);
        return { date: d, year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate(), day_name: format(dt, "EEEE") };
      })
    ), "DimDate");

    // Dim: Status
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      [{ status: "pending" }, { status: "completed" }, { status: "alert" }]
    ), "DimStatus");

    XLSX.writeFile(wb, `LIFECO_PlantView_PowerBI_${plant || "All"}_${format(startDate, "yyyyMMdd")}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between glass-card rounded-none">
        <div className="flex items-center gap-3">
          <Factory className="w-6 h-6 text-primary" />
          <div>
            <h1 className="font-display text-xl font-bold neon-text tracking-wider">{t.lifecoDigital}</h1>
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              {lang === "ar" ? "عرض المصنع" : "PLANT VIEW"}
            </p>
          </div>
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

      <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full space-y-4">
        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-primary" />
            <Select value={plant} onValueChange={setPlant}>
              <SelectTrigger className="w-40 bg-secondary/50">
                <SelectValue placeholder={lang === "ar" ? "اختر المصنع" : "Select Plant"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "ar" ? "الكل" : "All Plants"}</SelectItem>
                {PLANTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(startDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-sm">→</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(endDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-secondary/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === "ar" ? "كل الحالات" : "All Status"}</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "ar" ? "بحث..." : "Search samples..."}
                className="pl-9 bg-secondary/50"
              />
            </div>

            <Button onClick={fetchSamples} size="sm" className="gap-1.5">
              <Search className="w-4 h-4" /> {lang === "ar" ? "بحث" : "Search"}
            </Button>
          </div>
        </motion.div>

        {/* Equipment Status Summary */}
        {plant && plant !== "all" && equipmentStatus.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {lang === "ar" ? "حالة المعدات الحية" : "Live Equipment Status"} — {lang === "ar" ? "آخر 24 ساعة" : "Last 24h"}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {equipmentStatus.map((eq) => {
                // Simple threshold: green if value > 0, red if 0 or negative. Customize as needed.
                const isNormal = eq.value > 0;
                return (
                  <motion.button
                    key={eq.id}
                    onClick={() => setTrendTag(eq.unit_tag)}
                    className={`glass-card p-3 text-center cursor-pointer transition-all hover:neon-border ${
                      trendTag === eq.unit_tag ? "neon-border" : ""
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-[10px] text-muted-foreground truncate mb-1">{eq.unit_tag}</p>
                    <p className={`text-xl font-bold ${isNormal ? "text-emerald-400" : "text-red-400"}`}>
                      {eq.value}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      {format(new Date(eq.timestamp), "HH:mm")}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Trend Chart */}
        {trendTag && trendData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {lang === "ar" ? "اتجاه" : "Trend"}: {trendTag} — {lang === "ar" ? "آخر 24 ساعة" : "Last 24h"}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 30%, 20%)" />
                <XAxis dataKey="time" stroke="hsl(215, 20%, 55%)" fontSize={10} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(230, 40%, 12%)", border: "1px solid hsl(190, 100%, 50%, 0.3)", borderRadius: "8px", color: "hsl(210, 40%, 93%)" }} />
                <Line type="monotone" dataKey="value" stroke="hsl(190, 100%, 50%)" strokeWidth={2} dot={{ fill: "hsl(190, 100%, 50%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: lang === "ar" ? "إجمالي العينات" : "Total Samples", value: filteredSamples.length, color: "text-primary" },
            { label: lang === "ar" ? "معلّقة" : "Pending", value: filteredSamples.filter(s => s.status === "pending").length, color: "text-yellow-400" },
            { label: lang === "ar" ? "مكتملة" : "Completed", value: filteredSamples.filter(s => s.status === "completed").length, color: "text-emerald-400" },
            { label: lang === "ar" ? "تنبيه" : "Alert", value: filteredSamples.filter(s => s.status === "alert").length, color: "text-red-400" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass-card p-4 text-center">
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filteredSamples.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {lang === "ar" ? "لا توجد بيانات. اختر مصنع وتاريخ." : "No data found. Select a plant and date range."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-primary font-semibold">#</TableHead>
                    <TableHead className="text-primary font-semibold">{lang === "ar" ? "العينة" : "Sample"}</TableHead>
                    <TableHead className="text-primary font-semibold">{lang === "ar" ? "القسم" : "Dept"}</TableHead>
                    <TableHead className="text-primary font-semibold">{lang === "ar" ? "التحليل" : "Analysis"}</TableHead>
                    <TableHead className="text-primary font-semibold">{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-primary font-semibold">{lang === "ar" ? "الموظف" : "Employee"}</TableHead>
                    <TableHead className="text-primary font-semibold">{lang === "ar" ? "الفني" : "Technician"}</TableHead>
                    <TableHead className="text-primary font-semibold">{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
                    {relevantFields.map(f => (
                      <TableHead key={f.id} className="text-primary font-semibold">{f.field_label}</TableHead>
                    ))}
                    <TableHead className="text-primary font-semibold">{lang === "ar" ? "ملاحظات" : "Notes"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSamples.map((sample, i) => (
                    <TableRow key={sample.id} className="border-border hover:bg-secondary/20">
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{sample.sample_name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{sample.department}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{sample.analysis_type}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[sample.status]}`}>
                          {sample.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{sample.employee_id}</TableCell>
                      <TableCell className="text-muted-foreground">{sample.technician_name}</TableCell>
                      <TableCell className="text-muted-foreground">{sample.sample_date}</TableCell>
                      {relevantFields.map(f => (
                        <TableCell key={f.id} className="font-semibold text-foreground">
                          {sample.dynamic_data?.[f.field_name] ?? "-"}
                        </TableCell>
                      ))}
                      <TableCell className="text-muted-foreground text-xs">{sample.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
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

export default PlantView;
