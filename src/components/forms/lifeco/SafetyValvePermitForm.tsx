import React, { useState } from "react";
import { BaseFormLayout } from "./BaseFormLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { saveForm } from "@/lib/forms.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Settings } from "lucide-react";

export default function SafetyValvePermitForm({ formId, initialData, plantCode }: { formId?: string, initialData?: any, plantCode?: string }) {
  const [data, setData] = useState<any>(initialData?.form_data || {
    general: { valveTag: "", setPressure: "", lastTestDate: "", plant: plantCode || "" },
    checks: { externalInspection: false, calibration: false, sealsIntact: false },
    remarks: ""
  });

  const saveFormFn = useServerFn(saveForm);

  const onSave = async (status: 'draft' | 'submitted') => {
    try {
      const payload = {
        id: formId,
        form_type: 'safety_valve_permit' as const,
        status: status,
        department_key: "MAINTENANCE",
        plant_code: plantCode || data.general.plant || "GENERAL",
        form_data: data,
        created_by_name: "LIFECO User"
      };
      await saveFormFn({ data: payload });
      toast.success(status === 'submitted' ? "تم تقديم تصريح صمام الأمان بنجاح" : "تم حفظ المسودة");
    } catch (err: any) {
      toast.error("خطأ: " + err.message);
    }
  };

  return (
    <BaseFormLayout 
      title="SAFETY VALVE PERMIT / تصريح صمام أمان" 
      formNumber={initialData?.form_number}
      status={initialData?.status}
      onSave={() => onSave('draft')}
      onSubmit={() => onSave('submitted')}
      isSubmitted={initialData?.status === 'submitted'}
    >
      <div className="bg-[#fffbeb] border-2 border-yellow-600 p-8 space-y-6">
        <div className="flex justify-between items-center border-b-2 border-yellow-600 pb-4">
          <div className="flex items-center gap-4">
            <Settings className="w-12 h-12 text-yellow-700" />
            <h1 className="text-2xl font-black italic uppercase text-yellow-900">Safety Valve Permit</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-yellow-800">LIFECO Technical</div>
            <div className="text-red-600 font-black tracking-widest">{initialData?.form_number}</div>
          </div>
        </div>

        {/* General Information / معلومات عامة */}
        <div className="border-2 border-yellow-600 rounded-md overflow-hidden">
          <div className="bg-yellow-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
            General Information / معلومات عامة
          </div>
          <div className="px-4 py-3 bg-white/80 border-b border-yellow-200">
            <p className="text-[10px] text-yellow-800 font-bold leading-relaxed mb-3">
              Please provide complete and accurate information for the work permit application. Ensure all fields are filled to maintain safety standards and operational compliance.
              <br />
              يرجى تقديم معلومات كاملة ودقيقة لطلب تصريح العمل. تأكد من ملء جميع الحقول للحفاظ على معايير السلامة والامتثال التشغيلي.
            </p>
            <hr className="w-full border-t-2 border-yellow-900/10" aria-hidden="true" />
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <Input placeholder="Valve Tag #" value={data.general.valveTag} onChange={(e) => setData((d: any) => ({...d, general: {...d.general, valveTag: e.target.value}}))} />
            <Input placeholder="Set Pressure (Bar)" value={data.general.setPressure} onChange={(e) => setData((d: any) => ({...d, general: {...d.general, setPressure: e.target.value}}))} />
        </div>
        <div className="grid grid-cols-2 gap-4 border border-yellow-300 p-4 bg-white/50">
          {Object.keys(data.checks).map(k => (
             <div key={k} className="flex items-center gap-2">
               <Checkbox checked={data.checks[k]} onCheckedChange={(v) => setData((d: any) => ({...d, checks: {...d.checks, [k]: !!v}}))} />
               <Label className="capitalize text-yellow-900">{k.replace(/([A-Z])/g, ' $1')}</Label>
             </div>
          ))}
        </div>
        <Textarea className="border-yellow-400" placeholder="Maintenance Findings..." value={data.remarks} onChange={(e) => setData((d: any) => ({...d, remarks: e.target.value}))} />
      </div>
    </BaseFormLayout>
  );
}
