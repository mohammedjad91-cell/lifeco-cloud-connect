import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS } from "@/lib/departments";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts";

interface LogEntry {
  id: string;
  department: string;
  unit_tag: string;
  value: number;
  timestamp: string;
}

const CHART_COLORS = [
  "hsl(190, 100%, 50%)", "hsl(280, 80%, 60%)", "hsl(340, 80%, 55%)",
  "hsl(45, 90%, 55%)", "hsl(140, 70%, 45%)", "hsl(20, 90%, 55%)",
];

const AnalyticsDashboard = () => {
  const [date1, setDate1] = useState<Date>(new Date());
  const [date2, setDate2] = useState<Date>(new Date());
  const [selectedTag, setSelectedTag] = useState("");
  const [logsDate1, setLogsDate1] = useState<LogEntry[]>([]);
  const [logsDate2, setLogsDate2] = useState<LogEntry[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const allTags = useMemo(() => DEPARTMENTS.flatMap(d => d.tags).filter((v, i, a) => a.indexOf(v) === i), []);

  const fetchLogsForDate = async (date: Date) => {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    const { data } = await supabase.from("operations_logs").select("*")
      .gte("timestamp", start.toISOString()).lte("timestamp", end.toISOString());
    return (data || []) as LogEntry[];
  };

  useEffect(() => {
    fetchLogsForDate(date1).then(setLogsDate1);
  }, [date1]);

  useEffect(() => {
    fetchLogsForDate(date2).then(setLogsDate2);
  }, [date2]);

  useEffect(() => {
    if (!selectedTag) return;
    const fetchTrend = async () => {
      const { data } = await supabase.from("operations_logs").select("*")
        .eq("unit_tag", selectedTag).order("timestamp", { ascending: true }).limit(100);
      setTrendData((data || []).map((d: any) => ({
        date: format(new Date(d.timestamp), "MM/dd HH:mm"),
        value: d.value,
      })));
    };
    fetchTrend();
  }, [selectedTag]);

  const pieData = useMemo(() => {
    const deptMap: Record<string, number> = {};
    logsDate1.forEach(l => { deptMap[l.department] = (deptMap[l.department] || 0) + l.value; });
    return Object.entries(deptMap).map(([name, value]) => ({ name, value }));
  }, [logsDate1]);

  const radarData = useMemo(() => {
    const tags = new Set([...logsDate1.map(l => l.unit_tag), ...logsDate2.map(l => l.unit_tag)]);
    return Array.from(tags).slice(0, 8).map(tag => ({
      tag,
      [format(date1, "dd/MM")]: logsDate1.filter(l => l.unit_tag === tag).reduce((s, l) => s + l.value, 0),
      [format(date2, "dd/MM")]: logsDate2.filter(l => l.unit_tag === tag).reduce((s, l) => s + l.value, 0),
    }));
  }, [logsDate1, logsDate2, date1, date2]);

  const DatePicker = ({ date, onSelect, label }: { date: Date; onSelect: (d: Date) => void; label: string }) => (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal gap-2")}>
            <CalendarIcon className="w-4 h-4" />
            {format(date, "dd/MM/yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => d && onSelect(d)} className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-foreground font-semibold">Comparison Analytics</h2>
      </div>

      {/* Date selectors */}
      <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <DatePicker date={date1} onSelect={setDate1} label="Date A" />
        <DatePicker date={date2} onSelect={setDate2} label="Date B" />
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Trend Unit/Tag</label>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger><SelectValue placeholder="Select tag..." /></SelectTrigger>
            <SelectContent>{allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Department Distribution (Date A)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(230, 40%, 12%)", border: "1px solid hsl(190, 100%, 50%, 0.3)", borderRadius: "8px", color: "hsl(210, 40%, 93%)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Trend: {selectedTag || "Select a tag"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 30%, 20%)" />
              <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={10} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(230, 40%, 12%)", border: "1px solid hsl(190, 100%, 50%, 0.3)", borderRadius: "8px", color: "hsl(210, 40%, 93%)" }} />
              <Line type="monotone" dataKey="value" stroke="hsl(190, 100%, 50%)" strokeWidth={2} dot={{ fill: "hsl(190, 100%, 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="glass-card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Multi-Variable Comparison: {format(date1, "dd/MM")} vs {format(date2, "dd/MM")}
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(230, 30%, 20%)" />
              <PolarAngleAxis dataKey="tag" stroke="hsl(215, 20%, 55%)" fontSize={10} />
              <PolarRadiusAxis stroke="hsl(215, 20%, 55%)" fontSize={9} />
              <Radar name={format(date1, "dd/MM")} dataKey={format(date1, "dd/MM")} stroke="hsl(190, 100%, 50%)" fill="hsl(190, 100%, 50%)" fillOpacity={0.2} />
              <Radar name={format(date2, "dd/MM")} dataKey={format(date2, "dd/MM")} stroke="hsl(280, 80%, 60%)" fill="hsl(280, 80%, 60%)" fillOpacity={0.2} />
              <Legend />
              <Tooltip contentStyle={{ background: "hsl(230, 40%, 12%)", border: "1px solid hsl(190, 100%, 50%, 0.3)", borderRadius: "8px", color: "hsl(210, 40%, 93%)" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Date A Entries</p>
          <p className="text-2xl font-bold text-primary">{logsDate1.length}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Date B Entries</p>
          <p className="text-2xl font-bold text-primary">{logsDate2.length}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Date A Avg</p>
          <p className="text-2xl font-bold text-primary">{logsDate1.length ? (logsDate1.reduce((s, l) => s + l.value, 0) / logsDate1.length).toFixed(1) : "—"}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-xs text-muted-foreground">Date B Avg</p>
          <p className="text-2xl font-bold text-primary">{logsDate2.length ? (logsDate2.reduce((s, l) => s + l.value, 0) / logsDate2.length).toFixed(1) : "—"}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
