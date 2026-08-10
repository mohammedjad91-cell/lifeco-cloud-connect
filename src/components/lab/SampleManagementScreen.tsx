import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader2, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";

interface SampleManagementScreenProps {
  sourceId: string;
  onAddSample: () => void;
  onViewSample: (sampleId: string) => void;
}

const SampleManagementScreen: React.FC<SampleManagementScreenProps> = ({ sourceId, onAddSample, onViewSample }) => {
  const { lang } = useI18n();
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const sourceLabels: Record<string, string> = {
    "NITROGEN": lang === "ar" ? "مصنع النيتروجين" : "Nitrogen Plant",
    "AMM1": lang === "ar" ? "مصنع الأمونيا 1" : "Ammonia Plant 1",
    "AMM2": lang === "ar" ? "مصنع الأمونيا 2" : "Ammonia Plant 2",
    "AMM_STORAGE": lang === "ar" ? "خزانات الأمونيا" : "Ammonia Storage"
  };

  useEffect(() => {
    fetchSamples();
  }, [sourceId]);

  const fetchSamples = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lab_samples")
      .select("*")
      .eq("plant_source", sourceId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSamples(data);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Pending Sampling": "bg-slate-500/20 text-slate-400 border-slate-500/50",
      "Sample Collected": "bg-blue-500/20 text-blue-400 border-blue-500/50",
      "In Laboratory": "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
      "Under Analysis": "bg-amber-500/20 text-amber-400 border-amber-500/50",
      "Analysis Complete": "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      "Approved": "bg-green-500/20 text-green-400 border-green-500/50",
      "Rejected": "bg-red-500/20 text-red-400 border-red-500/50"
    };
    return (
      <Badge variant="outline" className={`px-2 py-0.5 ${variants[status] || ""}`}>
        {status}
      </Badge>
    );
  };

  const filteredSamples = samples.filter(s => 
    s.sample_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.operator_analyst.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {sourceLabels[sourceId]} {lang === "ar" ? "- سجل العينات" : "- Sample Records"}
          </h2>
          <p className="text-muted-foreground">{lang === "ar" ? "إدارة ومتابعة عينات المختبر" : "Manage and track laboratory samples"}</p>
        </div>
        <Button onClick={onAddSample} className="gap-2 h-11 px-6 font-bold shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          {lang === "ar" ? "إضافة عينة جديدة" : "Add New Sample"}
        </Button>
      </div>

      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={lang === "ar" ? "بحث برقم العينة أو المحلل..." : "Search by Sample ID or Analyst..."} 
            className="pl-10 bg-secondary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "رقم العينة" : "Sample ID"}</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "التاريخ" : "Date"}</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "المصدر" : "Source"}</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "نوع العينة" : "Sample Type"}</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "الحالة" : "Status"}</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "بواسطة" : "Entered By"}</th>
                <th className="p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">{lang === "ar" ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Loading samples...</p>
                  </td>
                </tr>
              ) : filteredSamples.length > 0 ? (
                filteredSamples.map((sample) => (
                  <tr key={sample.id} className="border-b border-border/20 hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => onViewSample(sample.id)}>
                    <td className="p-4 font-mono font-bold text-primary">{sample.sample_id}</td>
                    <td className="p-4 text-sm whitespace-nowrap">
                      <div className="font-bold">{format(new Date(sample.date), "dd/MM/yyyy")}</div>
                      <div className="text-xs text-muted-foreground">{sample.time}</div>
                    </td>
                    <td className="p-4 text-sm font-bold uppercase tracking-tighter">{sample.plant_source}</td>
                    <td className="p-4 text-sm">{sample.sample_type}</td>
                    <td className="p-4">{getStatusBadge(sample.status)}</td>
                    <td className="p-4 text-sm">{sample.operator_analyst}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="group-hover:text-primary">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="mb-4 p-4 rounded-full bg-secondary/50 w-fit mx-auto">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-bold text-lg mb-1">{lang === "ar" ? "لا توجد عينات مسجلة بعد" : "NO SAMPLES RECORDED YET"}</p>
                    <p className="text-muted-foreground mb-4">{lang === "ar" ? "ابدأ بإضافة أول عينة للمختبر" : "Start by adding the first sample for this laboratory"}</p>
                    <Button variant="outline" onClick={onAddSample}>
                      {lang === "ar" ? "إضافة أول عينة" : "+ ADD FIRST SAMPLE"}
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SampleManagementScreen;
