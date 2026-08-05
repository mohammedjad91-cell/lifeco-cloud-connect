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
import { Zap, ShieldCheck } from "lucide-react";

export default function ElectricalWorkPermitForm({ formId, initialData, plantCode }: { formId?: string, initialData?: any, plantCode?: string }) {
  const [data, setData] = useState(initialData?.form_data || {
    general: {
      permitNo: "",
      date: new Date().toISOString().split('T')[0],
      timeFrom: "",
      timeTo: "",
      plant: plantCode || "",
      equipment: "",
      detail: "",
      workDescription: "",
      personsAtWork: ""
    },
    safety: {
      standbyRequired: null,
      protectiveEquipment: null,
      testEquipment: null,
      tagsFitted: null,
      otherAffected: null,
      systemGrounded: null
    },
    authorization: {
      areaAuth: "",
      issuedBy: "",
      permitHolder: "",
      craftsman: "",
      supervisor: "",
      shift: ""
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
        department_key: "TECHNICAL",
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
      <div className="bg-[#eef5ee] text-slate-900 shadow-2xl border-[3px] border-slate-900 min-h-[1100px] flex flex-col">
        {/* Document Header (Matched to file-2) */}
        <div className="flex border-b-[3px] border-slate-900">
           {/* Left Header Box */}
           <div className="w-1/3 p-4 border-r-[3px] border-slate-900 space-y-3">
              <div className="flex items-center gap-3">
                 <div className="bg-slate-900 p-2 rounded-lg">
                    <Zap className="w-8 h-8 text-yellow-400" />
                 </div>
                 <div>
                    <div className="text-xl font-black tracking-tighter leading-none">LIFECO</div>
                    <div className="text-[7px] font-black uppercase text-slate-500">Libyan Fertilizer Company</div>
                 </div>
              </div>
              <div className="space-y-1">
                 <Label className="text-[9px] font-black uppercase flex justify-between">DATE <span>التاريخ</span></Label>
                 <Input type="date" className="h-7 border-b-2 border-slate-900 border-t-0 border-x-0 rounded-none bg-transparent font-bold" value={data.general.date} onChange={(e) => handleUpdate('general', 'date', e.target.value)} />
              </div>
           </div>

           {/* Center Header Box */}
           <div className="w-1/3 p-4 border-r-[3px] border-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 rotate-12">
                 <Zap className="w-32 h-32 text-slate-900" />
              </div>
              <div className="z-10 text-center">
                 <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">ELECTRICAL WORK PERMIT</h1>
                 <div className="mt-4 flex gap-6">
                    <div className="flex flex-col items-center">
                       <span className="text-[9px] font-black">TIME</span>
                       <Input type="time" className="h-6 w-20 border-b border-slate-900 border-t-0 border-x-0 rounded-none text-center bg-transparent text-xs" value={data.general.timeFrom} onChange={(e) => handleUpdate('general', 'timeFrom', e.target.value)} />
                    </div>
                    <div className="flex flex-col items-center">
                       <span className="text-[9px] font-black">TO</span>
                       <Input type="time" className="h-6 w-20 border-b border-slate-900 border-t-0 border-x-0 rounded-none text-center bg-transparent text-xs" value={data.general.timeTo} onChange={(e) => handleUpdate('general', 'timeTo', e.target.value)} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Header Box */}
           <div className="w-1/3 p-4 flex flex-col justify-center space-y-2">
              <div className="flex items-center justify-between border-2 border-slate-900 p-2 rounded-sm bg-white shadow-sm">
                 <span className="text-[10px] font-black">PERMIT #</span>
                 <span className="text-lg font-black text-red-600 tracking-widest">{initialData?.form_number || '00000'}</span>
              </div>
              <div className="flex items-center justify-between border-2 border-slate-900 p-1 rounded-sm bg-white">
                 <span className="text-[8px] font-black px-2">PERSONS AT WORK</span>
                 <Input type="number" className="w-12 h-6 border-none text-center font-bold bg-transparent" value={data.general.personsAtWork} onChange={(e) => handleUpdate('general', 'personsAtWork', e.target.value)} />
              </div>
           </div>
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 flex flex-col">
           {/* Plant and Location */}
           <div className="grid grid-cols-2 border-b-[3px] border-slate-900">
              <div className="p-3 border-r-[3px] border-slate-900 space-y-1">
                 <Label className="text-[10px] font-black uppercase">PLANT :</Label>
                 <Input className="h-8 border-b border-slate-900 border-t-0 border-x-0 rounded-none bg-transparent font-bold text-sm" value={data.general.plant} onChange={(e) => handleUpdate('general', 'plant', e.target.value)} />
              </div>
              <div className="p-3 space-y-1">
                 <Label className="text-[10px] font-black uppercase">EQUIPMENT & LOCATION :</Label>
                 <Select value={data.general.equipment} onValueChange={(v) => handleUpdate('general', 'equipment', v)}>
                    <SelectTrigger className="h-8 border-none bg-transparent shadow-none font-bold">
                       <SelectValue placeholder="Select Equipment..." />
                    </SelectTrigger>
                    <SelectContent>
                       {equipmentList.map(e => (
                          <SelectItem key={e.id} value={e.asset_code}>{e.asset_code} - {e.asset_name}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
              </div>
           </div>

           {/* Work Description (Large Text Area) */}
           <div className="flex-1 flex flex-col border-b-[3px] border-slate-900 relative">
              <div className="absolute top-0 right-0 bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">Description of work to be done</div>
              <Textarea 
                className="flex-1 border-none resize-none p-8 text-lg font-bold italic bg-transparent focus-visible:ring-0 leading-relaxed"
                placeholder="Write work description here..."
                value={data.general.workDescription}
                onChange={(e) => handleUpdate('general', 'workDescription', e.target.value)}
              />
           </div>

           {/* Safety Questions Section */}
           <div className="grid grid-cols-1 md:grid-cols-2 border-b-[3px] border-slate-900">
              <div className="p-6 space-y-4 border-r-[3px] border-slate-900">
                 <div className="text-xs font-black underline mb-4">ANSWER WITH YES OR NO :</div>
                 {[
                    { key: 'standbyRequired', label: 'STAND BY REQUIRED ?' },
                    { key: 'protectiveEquipment', label: 'PROTECTIVE EQUIPMENT ?' },
                    { key: 'testEquipment', label: 'TEST EQUIPMENT NEEDED' },
                    { key: 'tagsFitted', label: 'TAGS FITTED ?' },
                    { key: 'otherAffected', label: 'OTHER EQUIPMENT AFFECTED ?' },
                    { key: 'systemGrounded', label: 'IS SYSTEM GROUNDED ?' }
                 ].map(item => (
                    <div key={item.key} className="flex items-center justify-between group">
                       <span className="text-[11px] font-black tracking-tight">{item.label}</span>
                       <div className="flex gap-4">
                          <label className="flex items-center gap-1 cursor-pointer">
                             <div className={`w-4 h-4 border-2 border-slate-900 flex items-center justify-center ${data.safety[item.key] === true ? 'bg-slate-900' : 'bg-white'}`} 
                                  onClick={() => handleUpdate('safety', item.key, true)}>
                                {data.safety[item.key] === true && <div className="w-2 h-2 bg-white" />}
                             </div>
                             <span className="text-[9px] font-black">YES</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                             <div className={`w-4 h-4 border-2 border-slate-900 flex items-center justify-center ${data.safety[item.key] === false ? 'bg-slate-900' : 'bg-white'}`}
                                  onClick={() => handleUpdate('safety', item.key, false)}>
                                {data.safety[item.key] === false && <div className="w-2 h-2 bg-white" />}
                             </div>
                             <span className="text-[9px] font-black">NO</span>
                          </label>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Signatures & Red Arrow Area */}
              <div className="p-6 flex flex-col justify-between bg-slate-50 relative overflow-hidden">
                 {/* Decorative Red Arrow (Matched to file-2) */}
                 <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center rotate-[150deg]">
                    <div className="w-[120%] h-12 bg-red-600 relative">
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[40px] border-t-transparent border-b-[40px] border-b-transparent border-l-[60px] border-l-red-600" />
                    </div>
                 </div>

                 <div className="space-y-6 z-10">
                    <div className="space-y-1">
                       <Label className="text-[9px] font-black uppercase">Area Authorization Signature:</Label>
                       <div className="border-b-2 border-slate-900 h-8 flex items-end italic font-bold">{data.authorization.areaAuth}</div>
                       <Input className="hidden" value={data.authorization.areaAuth} onChange={(e) => handleUpdate('authorization', 'areaAuth', e.target.value)} />
                    </div>
                    
                    <div className="p-2 border border-slate-300 rounded text-[9px] leading-tight font-bold text-slate-600 italic">
                       NOTE : THE ISSUANCE OF THIS PERMIT DOES NOT EXCUSE THE HOLDER FROM OBTAINING ANY OTHER WORK PERMITS NORMALLY ISSUED FOR WORK IN THAT AREA.
                    </div>

                    <div className="space-y-1 pt-4">
                       <div className="text-[10px] font-black italic border-l-4 border-red-600 pl-2">
                          I UNDERSTAND THE HAZARDS INVOLVED IN THE ABOVE PERMITTED WORK AND THE LIMITATION REQUIRED HAVE BEEN EXPLAINED TO ME:
                       </div>
                       <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex flex-col gap-1">
                             <span className="text-[8px] font-black">SHIFT :</span>
                             <div className="flex gap-2">
                                {['7-3', '3-11', '11-7'].map(s => (
                                   <label key={s} className="flex items-center gap-1 cursor-pointer">
                                      <div className={`w-3 h-3 border border-slate-900 ${data.authorization.shift === s ? 'bg-slate-900' : ''}`} onClick={() => handleUpdate('authorization', 'shift', s)} />
                                      <span className="text-[8px] font-black">{s}</span>
                                   </label>
                                ))}
                             </div>
                          </div>
                          <div className="flex flex-col justify-end">
                             <div className="border-b border-slate-900 h-6 italic text-[10px]">{data.authorization.permitHolder}</div>
                             <span className="text-[8px] font-black uppercase">Signature of authorized craftsman</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Footer Close-out Area */}
           <div className="grid grid-cols-3 p-6 bg-white border-t-[3px] border-slate-900">
              <div className="flex flex-col justify-between h-20 border-r-2 border-slate-200 pr-6">
                 <div className="text-[10px] font-black underline uppercase">Permit closed out</div>
                 <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase">Date:</span>
                       <span className="font-bold text-sm">{data.general.date}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase">Time:</span>
                       <span className="font-bold text-sm">{data.general.timeTo}</span>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col justify-between h-20 border-r-2 border-slate-200 px-6">
                 <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase">Operating Supervisor</span>
                    <Input className="h-7 border-b border-slate-900 border-t-0 border-x-0 rounded-none bg-transparent font-bold italic" value={data.authorization.supervisor} onChange={(e) => handleUpdate('authorization', 'supervisor', e.target.value)} />
                 </div>
                 <div className="text-[8px] font-black text-slate-400">PN: ______________</div>
              </div>
              <div className="flex flex-col justify-between h-20 pl-6">
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase">Work Completed</span>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-1">
                          <Checkbox id="wc-yes" /> <span className="text-[9px] font-black">YES</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Checkbox id="wc-no" /> <span className="text-[9px] font-black">NO</span>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase">Authorized Craftsman</span>
                    <Input className="h-7 border-b border-slate-900 border-t-0 border-x-0 rounded-none bg-transparent font-bold italic" value={data.authorization.craftsman} onChange={(e) => handleUpdate('authorization', 'craftsman', e.target.value)} />
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Document Meta Info */}
      <div className="mt-2 flex justify-between items-center px-4 text-[9px] font-black text-slate-500 tracking-widest uppercase no-print">
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            <span>SFF - 06 - 01 - 03</span>
         </div>
         <div className="flex gap-8">
            <span>SEE REVERSE SIDE</span>
            <span>P 1 of 2</span>
            <span>REV - 0</span>
         </div>
      </div>
    </BaseFormLayout>
  );
}
