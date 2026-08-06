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
      location: "",
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
      
      await saveFormFn({ data: payload });
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
        <div className="border-[3px] border-slate-900 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-slate-900 text-white p-4 font-black uppercase text-sm flex justify-between items-center tracking-widest">
            <span>General Information / معلومات عامة</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">SECTION 01</span>
          </div>
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
              <Label>Location / Detail (المكان بالتفصيل)</Label>
              <Input value={data.general.location} onChange={(e) => handleUpdate('general', 'location', e.target.value)} />
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

        {/* Section 2: Hazard Identification & PPE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-[3px] border-slate-900 rounded-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-3 font-black uppercase text-xs flex justify-between items-center">
              <span>Hazard Identification / تحديد المخاطر</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">SECTION 02</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 bg-[#f8fafc]">
              {[
                { key: 'hotWork', label: 'Hot Work / أعمال ساخنة', color: 'text-red-600' },
                { key: 'electrical', label: 'Electrical / كهرباء', color: 'text-blue-600' },
                { key: 'highPressure', label: 'High Pressure / ضغط عالي', color: 'text-orange-600' },
                { key: 'confinedSpace', label: 'Confined Space / مكان مغلق', color: 'text-yellow-600' },
                { key: 'radiation', label: 'Radiation / إشعاع', color: 'text-purple-600' },
                { key: 'toxicGas', label: 'Toxic Gas / غاز سام', color: 'text-green-600' },
                { key: 'droppedObjects', label: 'Dropped Objects / سقوط أشياء', color: 'text-slate-600' },
                { key: 'flyingSparks', label: 'Flying Sparks / شرر متطاير', color: 'text-red-500' }
              ].map(item => (
                <div key={item.key} className="flex items-center space-x-3 group cursor-pointer border-b border-slate-100 pb-1">
                  <Checkbox 
                    id={`hazard-${item.key}`} 
                    checked={data.hazards[item.key]} 
                    onCheckedChange={(v) => handleUpdate('hazards', item.key, !!v)}
                    className="w-5 h-5 border-2 border-slate-900 data-[state=checked]:bg-slate-900"
                  />
                  <Label htmlFor={`hazard-${item.key}`} className={`text-[10px] font-black uppercase leading-tight cursor-pointer group-hover:opacity-70 transition-colors ${item.color}`}>
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-[3px] border-slate-900 rounded-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-3 font-black uppercase text-xs flex justify-between items-center">
              <span>PPE Requirements / الوقاية الشخصية</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">SECTION 03</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
               {Object.keys(data.ppe).map(key => (
                <div key={key} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox 
                    id={`ppe-${key}`} 
                    checked={data.ppe[key]} 
                    onCheckedChange={(v) => handleUpdate('ppe', key, !!v)}
                    className="w-5 h-5 border-2 border-slate-900 data-[state=checked]:bg-slate-900"
                  />
                  <Label htmlFor={`ppe-${key}`} className="text-[10px] font-black uppercase leading-tight cursor-pointer group-hover:text-blue-600 transition-colors">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Safe Work Preparation */}
        <div className="border-[3px] border-slate-900 rounded-lg overflow-hidden">
          <div className="bg-slate-900 text-white p-3 font-black uppercase text-xs flex justify-between items-center tracking-widest">
            <span>Safe Work Preparation / تحضيرات العمل الآمن</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">SECTION 04</span>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
             {Object.keys(data.preparation).map(key => (
                <div key={key} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox 
                    id={`prep-${key}`} 
                    checked={data.preparation[key]} 
                    onCheckedChange={(v) => handleUpdate('preparation', key, !!v)}
                    className="w-5 h-5 border-2 border-slate-900 data-[state=checked]:bg-slate-900"
                  />
                  <Label htmlFor={`prep-${key}`} className="text-[10px] font-black uppercase leading-tight cursor-pointer group-hover:text-blue-600 transition-colors">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </Label>
                </div>
              ))}
          </div>
        </div>

        {/* Section 4: Gas Testing */}
        <div className="border-[3px] border-slate-900 rounded-lg overflow-hidden bg-slate-50">
          <div className="bg-slate-900 text-white p-3 font-black uppercase text-xs flex justify-between items-center tracking-widest">
            <span>Gas Testing / فحص الغاز</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">SECTION 05</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Oxygen %</Label>
              <Input type="number" step="0.1" className="h-10 border-2 border-slate-300 font-bold focus:border-blue-600 rounded-md" value={data.gasTesting.oxygen} onChange={(e) => handleUpdate('gasTesting', 'oxygen', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">LEL %</Label>
              <Input type="number" step="0.1" className="h-10 border-2 border-slate-300 font-bold focus:border-blue-600 rounded-md" value={data.gasTesting.lel} onChange={(e) => handleUpdate('gasTesting', 'lel', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">H2S ppm</Label>
              <Input type="number" step="1" className="h-10 border-2 border-slate-300 font-bold focus:border-blue-600 rounded-md" value={data.gasTesting.h2s} onChange={(e) => handleUpdate('gasTesting', 'h2s', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Performed By</Label>
              <Input className="h-10 border-2 border-slate-300 font-bold focus:border-blue-600 rounded-md" value={data.gasTesting.performedBy} onChange={(e) => handleUpdate('gasTesting', 'performedBy', e.target.value)} />
            </div>
          </div>
          <div className="px-6 pb-6 italic text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            * Note: Gas testing results must be within safe limits before work commences.
          </div>
        </div>
      </div>
    </BaseFormLayout>
  );
}
