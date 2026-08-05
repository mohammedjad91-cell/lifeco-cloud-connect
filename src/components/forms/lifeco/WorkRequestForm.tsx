import React, { useState, useEffect } from "react";
import { BaseFormLayout } from "./BaseFormLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { saveForm } from "@/lib/forms.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

export default function WorkRequestForm({ formId, initialData, plantCode }: { formId?: string, initialData?: any, plantCode?: string }) {
  const [data, setData] = useState(initialData?.form_data || {
    header: {
      wrNo: "",
      originNo: "",
      maintenanceNo: "",
      priority: "NORMAL",
      sn: "",
      dateIssued: new Date().toISOString().split('T')[0],
      dateRequired: ""
    },
    location: {
      unit: plantCode || "",
      department: "MAINTENANCE",
      equipmentNo: "",
      detail: ""
    },
    permits: {
      required: false,
      hot: false,
      cold: false,
      elect: false,
      none: true
    },
    job: {
      originator: "",
      phone: "",
      description: "",
      preparedBy: "",
      approvedBy: ""
    },
    cost: {
      estME: "",
      materials: "",
      misc: "",
      total: ""
    }
  });

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const saveFormFn = useServerFn(saveForm);

  useEffect(() => {
    async function fetchEquipment() {
      const { data } = await supabase.from("equipment_assets").select("*");
      if (data) setEquipmentList(data);
    }
    fetchEquipment();
  }, []);

  const handleUpdate = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const onSave = async (status: 'draft' | 'submitted') => {
    try {
      const payload = {
        id: formId,
        form_type: 'work_request' as const,
        status: status,
        department_key: "MAINTENANCE",
        plant_code: plantCode || data.location.unit || "GENERAL",
        equipment_id: equipmentList.find(e => e.asset_code === data.location.equipmentNo)?.id || null,
        form_data: data,
        created_by_name: "LIFECO User"
      };
      
      await saveFormFn({ data: payload });
      toast.success(status === 'submitted' ? "تم تقديم طلب العمل بنجاح" : "تم حفظ المسودة");
    } catch (err: any) {
      toast.error("خطأ في الحفظ: " + err.message);
    }
  };

  return (
    <BaseFormLayout 
      title="WORK REQUEST / طلب عمل" 
      formNumber={initialData?.form_number}
      status={initialData?.status}
      onSave={() => onSave('draft')}
      onSubmit={() => onSave('submitted')}
      isSubmitted={initialData?.status === 'submitted'}
    >
      <div className="space-y-6">
        {/* W.R. Header Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-[3px] border-slate-900 shadow-sm rounded-sm overflow-hidden">
           <div className="border-r-2 border-b-2 border-slate-900 p-2">
             <Label className="text-[10px] font-bold">W.R. NO.</Label>
             <Input className="border-none h-6 p-0 text-sm font-bold bg-transparent" value={data.header.wrNo} readOnly />
           </div>
           <div className="border-r-2 border-b-2 border-slate-900 p-2">
             <Label className="text-[10px] font-bold">ORIGIN NO.</Label>
             <Input className="border-none h-6 p-0 text-sm bg-transparent" value={data.header.originNo} onChange={(e) => handleUpdate('header', 'originNo', e.target.value)} />
           </div>
           <div className="border-r-2 border-b-2 border-slate-900 p-2">
             <Label className="text-[10px] font-bold">MAINT. NO.</Label>
             <Input className="border-none h-6 p-0 text-sm bg-transparent" value={data.header.maintenanceNo} onChange={(e) => handleUpdate('header', 'maintenanceNo', e.target.value)} />
           </div>
           <div className="border-b-2 border-slate-900 p-2">
             <Label className="text-[10px] font-bold">PRIORITY</Label>
             <Select value={data.header.priority} onValueChange={(v) => handleUpdate('header', 'priority', v)}>
                <SelectTrigger className="border-none h-6 p-0 text-sm bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMERGENCY">EMERGENCY / طارئ</SelectItem>
                  <SelectItem value="URGENT">URGENT / عاجل</SelectItem>
                  <SelectItem value="NORMAL">NORMAL / عادي</SelectItem>
                </SelectContent>
             </Select>
           </div>
           
           <div className="border-r-2 border-slate-900 p-2">
             <Label className="text-[10px] font-bold">DATE ISSUED</Label>
             <Input type="date" className="border-none h-6 p-0 text-sm bg-transparent" value={data.header.dateIssued} onChange={(e) => handleUpdate('header', 'dateIssued', e.target.value)} />
           </div>
           <div className="border-r-2 border-slate-900 p-2">
             <Label className="text-[10px] font-bold">DATE REQUIRED</Label>
             <Input type="date" className="border-none h-6 p-0 text-sm bg-transparent" value={data.header.dateRequired} onChange={(e) => handleUpdate('header', 'dateRequired', e.target.value)} />
           </div>
           <div className="border-r-2 border-slate-900 p-2">
             <Label className="text-[10px] font-bold">PLANT / UNIT</Label>
             <Input className="border-none h-6 p-0 text-sm bg-transparent" value={data.location.unit} onChange={(e) => handleUpdate('location', 'unit', e.target.value)} />
           </div>
           <div className="p-2">
             <Label className="text-[10px] font-bold">EQUIPMENT NO.</Label>
             <Select value={data.location.equipmentNo} onValueChange={(v) => handleUpdate('location', 'equipmentNo', v)}>
                <SelectTrigger className="border-none h-6 p-0 text-sm bg-transparent">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.map(e => (
                    <SelectItem key={e.id} value={e.asset_code}>{e.asset_code}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
           </div>
        </div>

        {/* Description Section */}
        <div className="border-[3px] border-slate-900 min-h-[200px] flex flex-col rounded-sm overflow-hidden shadow-sm">
          <div className="bg-slate-900 text-white p-2 text-[11px] font-black uppercase tracking-wider">Description of Job / وصف العمل المطلوب</div>
          <Textarea 
            className="flex-1 border-none resize-none p-4 text-sm focus-visible:ring-0" 
            placeholder="Describe the maintenance work required..."
            value={data.job.description}
            onChange={(e) => handleUpdate('job', 'description', e.target.value)}
          />
        </div>

        {/* Permits Checklist */}
        <div className="border-[3px] border-slate-900 p-3 flex flex-wrap gap-6 items-center rounded-sm shadow-sm">
          <Label className="text-xs font-black mr-4 uppercase tracking-tight">PERMIT REQUIRED:</Label>
          {['HOT', 'COLD', 'ELECT', 'NONE'].map(type => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox 
                id={`permit-${type}`} 
                checked={data.permits[type.toLowerCase()]}
                onCheckedChange={(v) => handleUpdate('permits', type.toLowerCase(), !!v)}
              />
              <Label htmlFor={`permit-${type}`} className="text-[10px] font-bold">{type}</Label>
            </div>
          ))}
        </div>

        {/* Signatures and Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="border-[3px] border-slate-900 p-6 space-y-6 rounded-sm shadow-sm">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">Originator (الجهة الطالبة)</Label>
                <Input className="border-b border-slate-400 rounded-none border-t-0 border-x-0 h-8" value={data.job.originator} onChange={(e) => handleUpdate('job', 'originator', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase">Prepared By</Label>
                <Input className="border-b border-slate-400 rounded-none border-t-0 border-x-0 h-8" value={data.job.preparedBy} onChange={(e) => handleUpdate('job', 'preparedBy', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase">Approved By</Label>
                <Input className="border-b border-slate-400 rounded-none border-t-0 border-x-0 h-8" value={data.job.approvedBy} onChange={(e) => handleUpdate('job', 'approvedBy', e.target.value)} />
              </div>
           </div>

           <div className="border-[3px] border-slate-900 p-0 rounded-sm shadow-sm overflow-hidden">
             <div className="bg-slate-900 text-white p-2 text-[11px] font-black text-center uppercase tracking-wider">Cost Estimation / تقدير التكلفة</div>
             <div className="grid grid-cols-2 border-b border-slate-900">
                <div className="p-2 border-r border-slate-900 font-bold text-[10px]">EST. M.E.</div>
                <Input className="border-none h-8 text-right pr-2" value={data.cost.estME} onChange={(e) => handleUpdate('cost', 'estME', e.target.value)} />
             </div>
             <div className="grid grid-cols-2 border-b border-slate-900">
                <div className="p-2 border-r border-slate-900 font-bold text-[10px]">MATERIALS</div>
                <Input className="border-none h-8 text-right pr-2" value={data.cost.materials} onChange={(e) => handleUpdate('cost', 'materials', e.target.value)} />
             </div>
             <div className="grid grid-cols-2 border-b border-slate-900">
                <div className="p-2 border-r border-slate-900 font-bold text-[10px]">MISC.</div>
                <Input className="border-none h-8 text-right pr-2" value={data.cost.misc} onChange={(e) => handleUpdate('cost', 'misc', e.target.value)} />
             </div>
             <div className="grid grid-cols-2 bg-slate-100">
                <div className="p-2 border-r border-slate-900 font-bold text-[10px]">TOTAL</div>
                <Input className="border-none h-8 text-right pr-2 font-bold bg-transparent" value={data.cost.total} onChange={(e) => handleUpdate('cost', 'total', e.target.value)} />
             </div>
           </div>
        </div>
      </div>
    </BaseFormLayout>
  );
}
