import React, { useState, useEffect } from "react";
import { Save, X, FlaskConical, ClipboardCheck, Info, UserCheck, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { LAB_SOURCES } from "./AnalyticalParameters";

interface SampleEntryFormProps {
  sourceId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const SampleEntryForm: React.FC<SampleEntryFormProps> = ({ sourceId, onCancel, onSuccess }) => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const sourceConfig = (LAB_SOURCES as any)[sourceId] || LAB_SOURCES.NITROGEN;

  const [formData, setFormData] = useState({
    sample_id: `LAB-${sourceId}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    laboratory: "Ammonia Laboratories",
    plant_source: sourceId,
    sampling_point: "",
    sample_type: "",
    status: "Pending Sampling",
    operator_analyst: "",
    employee_id: "",
    remarks: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.operator_analyst || !formData.sample_type) {
      toast({ 
        title: lang === "ar" ? "حقول مطلوبة" : "Required Fields", 
        description: lang === "ar" ? "يرجى تعبئة اسم المحلل ونوع العينة" : "Please fill Analyst name and Sample type",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    const { data: sampleData, error: sampleError } = await supabase.from("lifeco_lab_samples" as any).insert([formData]).select().single();

    if (sampleError) {
      toast({ title: "Error", description: sampleError.message, variant: "destructive" });
    } else if (sampleData) {
      // Auto-insert configured parameters for analysis
      const paramsToInsert = sourceConfig.parameters.map((p: any) => ({
        sample_id: (sampleData as any).id,
        parameter: p.name,
        unit: p.unit,
        spec_limit: p.spec,
        status: "Pending Verification"
      }));

      await supabase.from("lifeco_lab_analysis_results" as any).insert(paramsToInsert);

      toast({ title: lang === "ar" ? "تم الحفظ" : "Saved", description: lang === "ar" ? "تم تسجيل العينة وإدراج المؤشرات بنجاح" : "Sample recorded and parameters added successfully" });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="glass-card overflow-hidden neon-border max-w-4xl mx-auto">
      <div className="bg-primary/10 border-b border-border p-4 flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary" />
          {lang === "ar" ? "نموذج إدخال عينة جديدة" : "New Sample Entry Form"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <ClipboardCheck className="w-3 h-3" /> {lang === "ar" ? "رقم العينة" : "Sample ID"}
            </label>
            <Input value={formData.sample_id} readOnly className="bg-secondary/50 font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              {lang === "ar" ? "التاريخ" : "Date"}
            </label>
            <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-secondary/30" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              {lang === "ar" ? "الوقت" : "Time"}
            </label>
            <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-secondary/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" /> {lang === "ar" ? "المصنع / المصدر" : "Plant / Source"}
            </label>
            <Input value={sourceConfig.plant} readOnly className="bg-secondary/50 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              {lang === "ar" ? "نقطة أخذ العينة" : "Sampling Point"}
            </label>
            <Select value={formData.sampling_point} onValueChange={v => setFormData({...formData, sampling_point: v})}>
              <SelectTrigger className="bg-secondary/30 h-11">
                <SelectValue placeholder="Select Point" />
              </SelectTrigger>
              <SelectContent>
                {sourceConfig.points.map((p: any) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              {lang === "ar" ? "نوع العينة" : "Sample Type"}
            </label>
            <Select value={formData.sample_type} onValueChange={v => setFormData({...formData, sample_type: v})}>
              <SelectTrigger className="bg-secondary/30 h-11">
                <SelectValue placeholder={lang === "ar" ? "اختر نوع العينة" : "Select Sample Type"} />
              </SelectTrigger>
              <SelectContent>
                {sourceConfig.sampleTypes.map((type: any) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              {lang === "ar" ? "حالة العينة" : "Sample Status"}
            </label>
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
              <SelectTrigger className="bg-secondary/30 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending Sampling">Pending Sampling</SelectItem>
                <SelectItem value="Sample Collected">Sample Collected</SelectItem>
                <SelectItem value="In Laboratory">In Laboratory</SelectItem>
                <SelectItem value="Under Analysis">Under Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> {lang === "ar" ? "اسم المحلل / المشغل" : "Operator / Analyst"}
            </label>
            <Input 
              value={formData.operator_analyst} 
              onChange={e => setFormData({...formData, operator_analyst: e.target.value})} 
              className="bg-secondary/30" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              {lang === "ar" ? "الرقم الوظيفي" : "Employee Badge ID"}
            </label>
            <Input 
              value={formData.employee_id} 
              onChange={e => setFormData({...formData, employee_id: e.target.value})} 
              className="bg-secondary/30" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {lang === "ar" ? "ملاحظات" : "Remarks"}
          </label>
          <Textarea 
            value={formData.remarks} 
            onChange={e => setFormData({...formData, remarks: e.target.value})} 
            className="bg-secondary/30 min-h-[100px]" 
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="px-8">{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
          <Button type="submit" disabled={loading} className="px-10 font-bold gap-2">
            {loading ? <Save className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            {lang === "ar" ? "حفظ السجل" : "Save Record"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SampleEntryForm;
