import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, FlaskConical, Info, ClipboardCheck, 
  Beaker, CheckCircle2, User, FileText, Plus, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";

interface SampleDetailPageProps {
  sampleId: string;
  onBack: () => void;
}

const SampleDetailPage: React.FC<SampleDetailPageProps> = ({ sampleId, onBack }) => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const [sample, setSample] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newParam, setNewParam] = useState({ parameter: "", result: "", unit: "", spec: "" });

  useEffect(() => {
    fetchData();
  }, [sampleId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: sData } = await supabase.from("lifeco_lab_samples").select("*").eq("id", sampleId).single();
    if (sData) setSample(sData);

    const { data: rData } = await supabase.from("lifeco_lab_analysis_results").select("*").eq("sample_id", sampleId);
    if (rData) setResults(rData);
    
    setLoading(false);
  };

  const handleAddResult = async () => {
    if (!newParam.parameter || !newParam.result) return;
    
    const { error } = await supabase.from("lifeco_lab_analysis_results").insert([{
      sample_id: sampleId,
      parameter: newParam.parameter,
      result: newParam.result,
      unit: newParam.unit,
      spec_limit: newParam.spec,
      status: "Pending Verification"
    }]);

    if (!error) {
      toast({ title: "Result added" });
      setNewParam({ parameter: "", result: "", unit: "", spec: "" });
      fetchData();
    }
  };

  if (loading) return <div className="p-20 text-center"><Beaker className="animate-spin w-12 h-12 mx-auto text-primary" /></div>;
  if (!sample) return <div className="p-20 text-center">Sample not found</div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> {lang === "ar" ? "رجوع للقائمة" : "Back to Records"}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <section className="glass-card overflow-hidden">
            <div className="bg-primary/10 p-4 border-b border-border font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              {lang === "ar" ? "معلومات العينة" : "SAMPLE INFORMATION"}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{lang === "ar" ? "رقم العينة" : "SAMPLE ID"}</label>
                <div className="text-xl font-mono font-bold text-primary">{sample.sample_id}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{lang === "ar" ? "التاريخ" : "DATE"}</label>
                  <div className="font-bold">{format(new Date(sample.date), "dd/MM/yyyy")}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{lang === "ar" ? "الوقت" : "TIME"}</label>
                  <div className="font-bold">{sample.time}</div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{lang === "ar" ? "الحالة" : "STATUS"}</label>
                <div className="mt-1">
                  <Badge className="bg-primary/20 text-primary border-primary/50">{sample.status}</Badge>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card overflow-hidden">
            <div className="bg-primary/10 p-4 border-b border-border font-bold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              {lang === "ar" ? "معلومات المصدر" : "SOURCE INFORMATION"}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{lang === "ar" ? "المصنع" : "PLANT"}</label>
                <div className="font-bold">{sample.plant_source}</div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{lang === "ar" ? "نقطة أخذ العينة" : "SAMPLING POINT"}</label>
                <div className="font-bold">{sample.sampling_point || "—"}</div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{lang === "ar" ? "نوع العينة" : "SAMPLE TYPE"}</label>
                <div className="font-bold italic">{sample.sample_type}</div>
              </div>
            </div>
          </section>

          <section className="glass-card overflow-hidden">
            <div className="bg-primary/10 p-4 border-b border-border font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {lang === "ar" ? "المحلل / المشغل" : "ANALYST / OPERATOR"}
            </div>
            <div className="p-6">
              <div className="font-bold text-lg">{sample.operator_analyst}</div>
              <div className="text-muted-foreground font-mono text-xs">ID: {sample.employee_id || "—"}</div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="glass-card overflow-hidden min-h-[400px]">
            <div className="bg-primary/10 p-4 border-b border-border font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                {lang === "ar" ? "التحليل المخبري والنتائج" : "LABORATORY ANALYSIS & RESULTS"}
              </div>
              <Badge variant="outline">{results.length} Parameters</Badge>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/30 border-b border-border/50">
                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "المؤشر" : "PARAMETER"}</th>
                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "النتيجة" : "RESULT"}</th>
                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "الوحدة" : "UNIT"}</th>
                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "المواصفة" : "SPEC LIMIT"}</th>
                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "الحالة" : "STATUS"}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length > 0 ? (
                    results.map((res) => (
                      <tr key={res.id} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                        <td className="p-3 font-bold">{res.parameter}</td>
                        <td className="p-3 font-mono text-primary font-bold">{res.result}</td>
                        <td className="p-3 text-sm">{res.unit}</td>
                        <td className="p-3 text-xs text-muted-foreground">{res.spec_limit}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px] py-0">{res.status}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-muted-foreground italic">
                        {lang === "ar" ? "لم يتم إدخال نتائج بعد" : "No analytical results recorded yet"}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-primary/5">
                    <td className="p-2"><Input placeholder="Parameter" value={newParam.parameter} onChange={e => setNewParam({...newParam, parameter: e.target.value})} className="h-8 text-xs bg-background" /></td>
                    <td className="p-2"><Input placeholder="Result" value={newParam.result} onChange={e => setNewParam({...newParam, result: e.target.value})} className="h-8 text-xs bg-background" /></td>
                    <td className="p-2"><Input placeholder="Unit" value={newParam.unit} onChange={e => setNewParam({...newParam, unit: e.target.value})} className="h-8 text-xs bg-background" /></td>
                    <td className="p-2"><Input placeholder="Spec" value={newParam.spec} onChange={e => setNewParam({...newParam, spec: e.target.value})} className="h-8 text-xs bg-background" /></td>
                    <td className="p-2"><Button size="sm" onClick={handleAddResult} className="h-8 w-full"><Plus className="w-3 h-3 mr-1" /> Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="glass-card p-6">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary" />
              {lang === "ar" ? "ملاحظات إضافية" : "Remarks & Attachments"}
            </h4>
            <div className="p-4 bg-secondary/30 rounded-lg min-h-[80px] text-sm italic">
              {sample.remarks || (lang === "ar" ? "لا توجد ملاحظات" : "No remarks provided")}
            </div>
          </section>

          <div className="flex justify-end gap-3">
             <Button variant="outline" className="gap-2">
               <FileText className="w-4 h-4" /> {lang === "ar" ? "تقرير PDF" : "Generate Report"}
             </Button>
             <Button className="gap-2">
               <CheckCircle2 className="w-4 h-4" /> {lang === "ar" ? "اعتماد النتائج" : "Approve Results"}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleDetailPage;
