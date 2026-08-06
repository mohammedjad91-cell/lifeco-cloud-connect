import React, { useState } from "react";
import { BaseFormLayout } from "./BaseFormLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { saveForm } from "@/lib/forms.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { HardHat } from "lucide-react";

export default function ScaffoldingPermitForm({ formId, initialData, plantCode }: { formId?: string, initialData?: any, plantCode?: string }) {
  const [data, setData] = useState(initialData?.form_data || {
    general: { permitNo: "", date: new Date().toISOString().split('T')[0], plant: plantCode || "", location: "", inspector: "" },
    requirements: { height: false, base: false, ties: false, guardrails: false, toeBoard: false, access: false },
    notes: ""
  });

  const saveFormFn = useServerFn(saveForm);

  const onSave = async (status: 'draft' | 'submitted') => {
    try {
      const payload = {
        id: formId,
        form_type: 'scaffolding_permit' as const,
        status: status,
        department_key: "MAINTENANCE",
        plant_code: plantCode || data.general.plant || "GENERAL",
        form_data: data,
        created_by_name: "LIFECO User"
      };
      await saveFormFn({ data: payload });
      toast.success(status === 'submitted' ? "تم تقديم تصريح السقالات بنجاح" : "تم حفظ المسودة");
    } catch (err: any) {
      toast.error("خطأ: " + err.message);
    }
  };

  return (
    <BaseFormLayout 
      title="SCAFFOLDING PERMIT / تصريح سقالات" 
      formNumber={initialData?.form_number}
      status={initialData?.status}
      onSave={() => onSave('draft')}
      onSubmit={() => onSave('submitted')}
      isSubmitted={initialData?.status === 'submitted'}
    >
      <div className="bg-white border-2 border-slate-900 p-8 space-y-6">
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-4">
            <HardHat className="w-12 h-12 text-orange-600" />
            <h1 className="text-2xl font-black italic uppercase">Scaffolding Permit</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">LIFECO Safety Dept</div>
            <div className="text-red-600 font-black tracking-widest">{initialData?.form_number}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Location" value={data.general.location} onChange={(e) => setData(d => ({...d, general: {...d.general, location: e.target.value}}))} />
            <Input placeholder="Inspector Name" value={data.general.inspector} onChange={(e) => setData(d => ({...d, general: {...d.general, inspector: e.target.value}}))} />
        </div>
        <div className="grid grid-cols-2 gap-4 border p-4">
          {Object.keys(data.requirements).map(k => (
             <div key={k} className="flex items-center gap-2">
               <Checkbox checked={data.requirements[k]} onCheckedChange={(v) => setData(d => ({...d, requirements: {...d.requirements, [k]: !!v}}))} />
               <Label className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</Label>
             </div>
          ))}
        </div>
        <Textarea placeholder="Remarks / Notes" value={data.notes} onChange={(e) => setData(d => ({...d, notes: e.target.value}))} />
      </div>
    </BaseFormLayout>
  );
}
