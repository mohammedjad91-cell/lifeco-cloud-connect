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

export default function ElectricalWorkPermitForm({ formId, initialData, plantCode }: { formId?: string, initialData?: any, plantCode?: string }) {
  const [data, setData] = useState(initialData?.form_data || {
    general: {
      permitNo: "",
      date: new Date().toISOString().split('T')[0],
      timeFrom: "",
      timeTo: "",
      plant: plantCode || "",
      equipment: "",
      workDescription: "",
      personsAtWork: ""
    },
    safety: {
      standbyRequired: false,
      protectiveEquipment: false,
      testEquipment: false,
      tagsFitted: false,
      otherAffected: false,
      systemGrounded: false
    },
    authorization: {
      areaAuth: "",
      issuedBy: "",
      permitHolder: "",
      craftsman: "",
      supervisor: ""
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
        form_type: 'electrical_permit' as const,
        status: status,
        department_key: "HSE",
        plant_code: plantCode || data.general.plant || "GENERAL",
        equipment_id: equipmentList.find(e => e.asset_code === data.general.equipment)?.id || null,
        form_data: data,
        created_by_name: "LIFECO User"
      };
      
      await saveFormFn({ data: payload });
      toast.success(status === 'submitted' ? "تم تقديم تصريح الكهرباء بنجاح" : "تم حفظ المسودة");
    } catch (err: any) {
      toast.error("خطأ في الحفظ: " + err.message);
    }
  };

  return (
    <BaseFormLayout 
      title="ELECTRICAL WORK PERMIT / تصريح عمل كهربائي" 
      formNumber={initialData?.form_number}
      status={initialData?.status}
      onSave={() => onSave('draft')}
      onSubmit={() => onSave('submitted')}
      isSubmitted={initialData?.status === 'submitted'}
    >
      <div className="space-y-8">
        {/* Document Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-2 border-slate-900 p-4">
           <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-[10px] font-bold">DATE / التاريخ</Label>
                  <Input type="date" className="h-8 text-sm" value={data.general.date} onChange={(e) => handleUpdate('general', 'date', e.target.value)} />
                </div>
                <div className="flex-1">
                   <Label className="text-[10px] font-bold">PERMIT NO.</Label>
                   <Input className="h-8 text-sm font-bold bg-slate-50" value={initialData?.form_number || 'AUTO'} readOnly />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-[10px] font-bold">TIME FROM</Label>
                  <Input type="time" className="h-8 text-sm" value={data.general.timeFrom} onChange={(e) => handleUpdate('general', 'timeFrom', e.target.value)} />
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] font-bold">TIME TO</Label>
                  <Input type="time" className="h-8 text-sm" value={data.general.timeTo} onChange={(e) => handleUpdate('general', 'timeTo', e.target.value)} />
                </div>
              </div>
           </div>
           <div className="space-y-4">
              <div>
                <Label className="text-[10px] font-bold">PLANT / المصنع</Label>
                <Input className="h-8 text-sm" value={data.general.plant} onChange={(e) => handleUpdate('general', 'plant', e.target.value)} />
              </div>
              <div>
                <Label className="text-[10px] font-bold">EQUIPMENT & LOCATION / المعدة والموقع</Label>
                <Select value={data.general.equipment} onValueChange={(v) => handleUpdate('general', 'equipment', v)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="اختر المعدة" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentList.map(e => (
                      <SelectItem key={e.id} value={e.asset_code}>{e.asset_code} - {e.asset_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
           </div>
        </div>

        {/* Work Description */}
        <div className="border-2 border-slate-900">
           <div className="bg-slate-900 text-white p-1 text-[10px] font-bold uppercase">Description of Work / وصف العمل</div>
           <Textarea 
             className="min-h-[100px] border-none resize-none focus-visible:ring-0" 
             value={data.general.workDescription}
             onChange={(e) => handleUpdate('general', 'workDescription', e.target.value)}
           />
        </div>

        {/* Safety Precautions Checklist */}
        <div className="border-2 border-slate-900">
          <div className="bg-slate-900 text-white p-1 text-[10px] font-bold uppercase text-center">Safety Precautions / احتياطات السلامة</div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
             {Object.keys(data.safety).map(key => (
               <div key={key} className="flex items-center justify-between border-b border-slate-100 pb-2">
                 <Label htmlFor={`safety-${key}`} className="text-xs font-bold uppercase">{key.replace(/([A-Z])/g, ' $1')}</Label>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                       <Checkbox 
                        id={`safety-${key}-yes`} 
                        checked={data.safety[key] === true}
                        onCheckedChange={() => handleUpdate('safety', key, true)}
                       />
                       <span className="text-[9px] font-bold">YES</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <Checkbox 
                        id={`safety-${key}-no`} 
                        checked={data.safety[key] === false}
                        onCheckedChange={() => handleUpdate('safety', key, false)}
                       />
                       <span className="text-[9px] font-bold">NO</span>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Authorization Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-slate-900 p-4">
           <div className="space-y-4">
              <div className="border-b border-slate-900 pb-2">
                <Label className="text-[9px] font-bold uppercase">Area Authorization</Label>
                <Input className="border-none h-6 p-0 text-sm italic" value={data.authorization.areaAuth} onChange={(e) => handleUpdate('authorization', 'areaAuth', e.target.value)} />
              </div>
              <div className="border-b border-slate-900 pb-2">
                <Label className="text-[9px] font-bold uppercase">Permit Issued By</Label>
                <Input className="border-none h-6 p-0 text-sm italic" value={data.authorization.issuedBy} onChange={(e) => handleUpdate('authorization', 'issuedBy', e.target.value)} />
              </div>
           </div>
           <div className="space-y-4">
              <div className="border-b border-slate-900 pb-2">
                <Label className="text-[9px] font-bold uppercase">Work Permit Holder</Label>
                <Input className="border-none h-6 p-0 text-sm italic" value={data.authorization.permitHolder} onChange={(e) => handleUpdate('authorization', 'permitHolder', e.target.value)} />
              </div>
              <div className="border-b border-slate-900 pb-2">
                <Label className="text-[9px] font-bold uppercase">Authorized Craftsman</Label>
                <Input className="border-none h-6 p-0 text-sm italic" value={data.authorization.craftsman} onChange={(e) => handleUpdate('authorization', 'craftsman', e.target.value)} />
              </div>
           </div>
           <div className="flex flex-col justify-end">
              <div className="border-b border-slate-900 pb-2">
                <Label className="text-[9px] font-bold uppercase">Operating Supervisor</Label>
                <Input className="border-none h-6 p-0 text-sm italic" value={data.authorization.supervisor} onChange={(e) => handleUpdate('authorization', 'supervisor', e.target.value)} />
              </div>
           </div>
        </div>
      </div>
    </BaseFormLayout>
  );
}
