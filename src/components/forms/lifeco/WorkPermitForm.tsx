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

export default function WorkPermitForm({ formId, initialData, plantCode }: { formId?: string, initialData?: any, plantCode?: string }) {
  const [data, setData] = useState(initialData?.form_data || {
    general: {
      permitNo: "",
      department: "HSE",
      plant: plantCode || "",
      equipment: "",
      workDescription: "",
      workToBeDone: "",
      fromDate: "",
      toDate: "",
      fromTime: "",
      toTime: "",
      personsAtWork: ""
    },
    hazards: {
      flyingSparks: false,
      equipmentMoving: false,
      hotWork: false,
      highPressure: false,
      radiation: false,
      droppedObjects: false,
      electrical: false,
      highLifting: false
    },
    preparation: {
      blinded: false,
      depressurized: false,
      drained: false,
      cleaned: false,
      gasTestRequired: false,
      lockout: false,
      extinguisher: false,
      standby: false,
      areaSwept: false,
      illuminated: false,
      safeAccess: false,
      safetyAnalysis: false
    },
    ppe: {
      respiratory: false,
      eye: false,
      hearing: false,
      head: false,
      hand: false,
      foot: false,
      body: false,
      safetyShoes: false,
      safetyGlasses: false,
      gloves: false,
      faceShield: false,
      goggles: false,
      earPlugs: false
    },
    gasTesting: {
      performedBy: "",
      date: "",
      time: "",
      oxygen: "",
      lel: "",
      h2s: "",
      continuous: false,
      frequency: "",
      remarks: ""
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
        form_type: 'work_permit' as const,
        status: status,
        department_key: "HSE",
        plant_code: plantCode || data.general.plant || "GENERAL",
        equipment_id: equipmentList.find(e => e.asset_code === data.general.equipment)?.id || null,
        form_data: data,
        created_by_name: "LIFECO User" // In real app, get from auth
      };
      
      await saveFormFn(payload);
      toast.success(status === 'submitted' ? "تم تقديم التصريح بنجاح" : "تم حفظ المسودة");
    } catch (err: any) {
      toast.error("خطأ في الحفظ: " + err.message);
    }
  };

  return (
    <BaseFormLayout 
      title="WORK PERMIT / تصريح عمل" 
      formNumber={initialData?.form_number}
      status={initialData?.status}
      onSave={() => onSave('draft')}
      onSubmit={() => onSave('submitted')}
      isSubmitted={initialData?.status === 'submitted'}
    >
      <div className="space-y-8">
        {/* Section 1: General Information */}
        <div className="border border-slate-900 rounded-sm">
          <div className="bg-slate-900 text-white p-2 font-bold uppercase text-sm">General Information / معلومات عامة</div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Plant / Area (المصنع)</Label>
              <Input value={data.general.plant} onChange={(e) => handleUpdate('general', 'plant', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Equipment / Location (المعدة)</Label>
              <Select value={data.general.equipment} onValueChange={(v) => handleUpdate('general', 'equipment', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المعدة" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.map(e => (
                    <SelectItem key={e.id} value={e.asset_code}>{e.asset_code} - {e.asset_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label>Work Description (وصف العمل)</Label>
              <Input value={data.general.workDescription} onChange={(e) => handleUpdate('general', 'workDescription', e.target.value)} />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Work To Be Done (العمل المطلوب إنجازه)</Label>
              <Textarea value={data.general.workToBeDone} onChange={(e) => handleUpdate('general', 'workToBeDone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={data.general.fromDate} onChange={(e) => handleUpdate('general', 'fromDate', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={data.general.toDate} onChange={(e) => handleUpdate('general', 'toDate', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Persons At Work</Label>
              <Input type="number" value={data.general.personsAtWork} onChange={(e) => handleUpdate('general', 'personsAtWork', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 2: Hazard Identification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-900 rounded-sm">
            <div className="bg-slate-900 text-white p-2 font-bold uppercase text-sm">Hazard Identification / تحديد المخاطر</div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {Object.keys(data.hazards).map(key => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`hazard-${key}`} 
                    checked={data.hazards[key]} 
                    onCheckedChange={(v) => handleUpdate('hazards', key, !!v)}
                  />
                  <Label htmlFor={`hazard-${key}`} className="text-xs uppercase leading-none">{key.replace(/([A-Z])/g, ' $1')}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-900 rounded-sm">
            <div className="bg-slate-900 text-white p-2 font-bold uppercase text-sm">PPE Requirements / الوقاية الشخصية</div>
            <div className="p-4 grid grid-cols-2 gap-3">
               {Object.keys(data.ppe).map(key => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`ppe-${key}`} 
                    checked={data.ppe[key]} 
                    onCheckedChange={(v) => handleUpdate('ppe', key, !!v)}
                  />
                  <Label htmlFor={`ppe-${key}`} className="text-xs uppercase leading-none">{key.replace(/([A-Z])/g, ' $1')}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Safe Work Preparation */}
        <div className="border border-slate-900 rounded-sm">
          <div className="bg-slate-900 text-white p-2 font-bold uppercase text-sm">Safe Work Preparation / تحضيرات العمل الآمن</div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
             {Object.keys(data.preparation).map(key => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`prep-${key}`} 
                    checked={data.preparation[key]} 
                    onCheckedChange={(v) => handleUpdate('preparation', key, !!v)}
                  />
                  <Label htmlFor={`prep-${key}`} className="text-xs uppercase leading-none">{key.replace(/([A-Z])/g, ' $1')}</Label>
                </div>
              ))}
          </div>
        </div>

        {/* Section 4: Gas Testing */}
        <div className="border border-slate-900 rounded-sm">
          <div className="bg-slate-900 text-white p-2 font-bold uppercase text-sm">Gas Testing / فحص الغاز</div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Oxygen %</Label>
              <Input type="number" step="0.1" value={data.gasTesting.oxygen} onChange={(e) => handleUpdate('gasTesting', 'oxygen', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>LEL %</Label>
              <Input type="number" step="0.1" value={data.gasTesting.lel} onChange={(e) => handleUpdate('gasTesting', 'lel', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>H2S ppm</Label>
              <Input type="number" step="1" value={data.gasTesting.h2s} onChange={(e) => handleUpdate('gasTesting', 'h2s', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Performed By</Label>
              <Input value={data.gasTesting.performedBy} onChange={(e) => handleUpdate('gasTesting', 'performedBy', e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </BaseFormLayout>
  );
}
