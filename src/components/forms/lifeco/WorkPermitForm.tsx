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

export default function WorkPermitForm({ formId, initialData, plantCode, onBack }: { formId?: string, initialData?: any, plantCode?: string, onBack?: () => void }) {
  const [data, setData] = useState(initialData?.form_data || {
    general: {
      workType: "COLD",
      permitNo: initialData?.form_number || "",
      date: new Date().toISOString().split('T')[0],
      personsAtArea: "",
      plant: plantCode || "",
      location: "",
      workDescription: ""
    },
    hazards: {
      combustible: { yes: false, no: false },
      toxic: { yes: false, no: false },
      corrosive: { yes: false, no: false },
      highPressure: { yes: false, no: false },
      hotSurface: { yes: false, no: false },
      flyingSparks: { yes: false, no: false },
      equipmentOperating: { yes: false, no: false },
      movingMachinery: { yes: false, no: false },
      radiationXRay: { yes: false, no: false },
      trippingHazard: { yes: false, no: false },
      roughWeather: { yes: false, no: false },
      workingAtHeight: { yes: false, no: false },
      sharpObjects: { yes: false, no: false },
      electricalHazard: { yes: false, no: false },
      highNoise: { yes: false, no: false },
      poorLighting: { yes: false, no: false }
    },
    preparation: {
      blinded: false, disconnected: false, lockedTagged: false,
      deEnergized: false, depressurized: false,
      isolated: false, washed: false,
      pluggedNitrogen: false, ventilated: false,
      gasTestCombustible: false, gasTestOxygen: false, gasTestAmmonia: false,
      gasTestContinuous: false,
      electricIsolation: false, fireBrigade: false, fireWatch: false,
      noOtherWork: "", sewerCovered: "", radiationSealed: false, radiationRemoved: false,
      safeJobAnalysis: false, other: "", remarks: ""
    },
    ppe: { helmet: false, safetyShoes: false, coverall: false, safetyGlasses: false, gloves: false, faceShield: false, rubberBoots: false, noSmoking: false, breathingEquipment: false, other: "" },
    tools: { fireExtinguisher: false, weldingMachine: false, light24v: false, batteryOperated: false, heatProtection: false },
    gasTesting: { entries: [{ time: "", operator: "", o2: "", lel: "", ppm: "", other: "" }], repeatEvery: "", statementSigned: false },
    workPlaceChecklist: {
      q1: { y: false, n: false, na: false, remarks: "" },
      q2: { y: false, n: false, na: false, remarks: "" },
      q3: { y: false, n: false, na: false, remarks: "" },
      q4: { y: false, n: false, na: false, remarks: "" },
      q5: { y: false, n: false, na: false, remarks: "" },
      q6: { y: false, n: false, na: false, remarks: "" },
      q7: { y: false, n: false, na: false, remarks: "" },
      q8: { y: false, n: false, na: false, remarks: "" },
      q9: { y: false, n: false, na: false, remarks: "" },
      q10: { y: false, n: false, na: false, remarks: "" }
    },
    closure: { 
      completed: false, 
      incomplete: false, 
      stopped: false, 
      housekeeping: false, 
      remarks: "",
      supervisorName: "",
      supervisorPN: "",
      foremanName: "",
      foremanPN: ""
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

  const handleUpdate = (section: string, field: string, value: any, subField?: string) => {
    setData((prev: any) => {
      const next = { ...prev };
      if (subField) {
        next[section][field][subField] = value;
      } else {
        next[section][field] = value;
      }
      return next;
    });
  };

  const onSave = async (status: 'submitted' | 'draft') => {
    try {
      await saveFormFn({ data: {
        id: formId,
        form_type: 'work_permit',
        status: status,
        department_key: "MAINTENANCE",
        plant_code: plantCode || "GENERAL",
        form_data: data,
        created_by_name: "Eng. Mohamed Gadalla"
      }});
      toast.success("تم الحفظ بنجاح");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <BaseFormLayout 
      title="WORK PERMIT / تصريح عمل"
      formNumber={initialData?.form_number || "WP-2026-0000"}
      onSave={() => onSave('draft')}
      onSubmit={() => onSave('submitted')}
      onBack={onBack}
      isSubmitted={initialData?.status === 'submitted'}
    >
      {/* SECTION 1: General Info */}
      <div className="border-[3px] border-slate-900 rounded-sm mb-6">
        <div className="bg-slate-900 text-white font-black text-sm p-2 uppercase">1 - General Information / معلومات عامة</div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="col-span-2 flex gap-4">
            {['Cold', 'Hot', 'Confined Space Entry'].map(t => (
               <label key={t} className="flex items-center gap-2 font-bold uppercase"><Checkbox checked={data.general.workType === t.toUpperCase()} onCheckedChange={() => handleUpdate('general', 'workType', t.toUpperCase())} /> {t}</label>
            ))}
          </div>
          <Input placeholder="PERMIT No" value={data.general.permitNo} onChange={(e) => handleUpdate('general', 'permitNo', e.target.value)} />
          <Input type="date" value={data.general.date} onChange={(e) => handleUpdate('general', 'date', e.target.value)} />
          <Input placeholder="No. of People in Area" value={data.general.personsAtArea} onChange={(e) => handleUpdate('general', 'personsAtArea', e.target.value)} />
          <Input placeholder="Plant" value={data.general.plant} onChange={(e) => handleUpdate('general', 'plant', e.target.value)} />
          <Input className="col-span-2" placeholder="Equipment / Location" value={data.general.location} onChange={(e) => handleUpdate('general', 'location', e.target.value)} />
          <Textarea className="col-span-2" placeholder="Description of the Work to be done" value={data.general.workDescription} onChange={(e) => handleUpdate('general', 'workDescription', e.target.value)} />
        </div>
      </div>

      {/* SECTION 2: Hazard Identification */}
      <div className="border-[3px] border-slate-900 rounded-sm mb-6">
        <div className="bg-slate-900 text-white font-black text-sm p-2 uppercase">2 - Hazard Identification / تحديد المخاطر</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="font-bold border-b border-slate-900 mb-2 text-xs">Group 1</div>
            {['combustible', 'toxic', 'corrosive', 'highPressure', 'hotSurface'].map(h => (
              <div key={h} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                <span className="text-[10px] font-bold uppercase">{h.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex gap-1">
                  <button type="button" className={`px-2 py-0.5 border text-[9px] font-black ${data.hazards[h].yes ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('hazards', h, true, 'yes')}>YES</button>
                  <button type="button" className={`px-2 py-0.5 border text-[9px] font-black ${data.hazards[h].no ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('hazards', h, true, 'no')}>NO</button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="font-bold border-b border-slate-900 mb-2 text-xs">Hazard Indicators</div>
            {['flyingSparks', 'equipmentOperating', 'movingMachinery', 'radiationXRay'].map(h => (
              <div key={h} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                <span className="text-[10px] font-bold uppercase">{h.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex gap-1">
                  <button type="button" className={`px-2 py-0.5 border text-[9px] font-black ${data.hazards[h].yes ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('hazards', h, true, 'yes')}>YES</button>
                  <button type="button" className={`px-2 py-0.5 border text-[9px] font-black ${data.hazards[h].no ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('hazards', h, true, 'no')}>NO</button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="font-bold border-b border-slate-900 mb-2 text-xs">Group 2 & 3</div>
            {['trippingHazard', 'roughWeather', 'workingAtHeight', 'sharpObjects', 'electricalHazard', 'highNoise', 'poorLighting'].map(h => (
              <div key={h} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                <span className="text-[10px] font-bold uppercase">{h.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex gap-1">
                  <button type="button" className={`px-2 py-0.5 border text-[9px] font-black ${data.hazards[h].yes ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('hazards', h, true, 'yes')}>YES</button>
                  <button type="button" className={`px-2 py-0.5 border text-[9px] font-black ${data.hazards[h].no ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('hazards', h, true, 'no')}>NO</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Safe Work Preparation */}
      <div className="border-[3px] border-slate-900 rounded-sm mb-6">
        <div className="bg-slate-900 text-white font-black text-sm p-2 uppercase">3 - Safe Work Preparation / تجهيز العمل الآمن</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {[
            { id: 'blinded', label: '1. Equipment: Blinded / Disconnected / Locked and tagged' },
            { id: 'deEnergized', label: '2. Equipment: De-energized / Depressurized' },
            { id: 'isolated', label: '3. Equipment: Isolated / Washed' },
            { id: 'pluggedNitrogen', label: '4. Equipment: Plugged (Nitrogen) / Ventilated (air)' },
            { id: 'gasTestCombustible', label: '5. Gas test required for: Combustible / Oxygen / Ammonia' },
            { id: 'gasTestContinuous', label: '6. Gas test required for: Continuous' },
            { id: 'electricIsolation', label: '7. Electric isolation & lock out / tag out (Permit attached if required)' },
            { id: 'fireBrigade', label: '8. Fire brigade support / firefighting equipment / Fire resistant blankets' },
            { id: 'fireWatch', label: '9. Stand by: Fire Watch / Support' },
            { id: 'safeJobAnalysis', label: '13. Safe job analysis required: Yes (JSA attached if required) / No' },
          ].map(item => (
            <div key={item.id} className="flex items-start gap-3">
              <Checkbox id={item.id} checked={data.preparation[item.id]} onCheckedChange={(val) => handleUpdate('preparation', item.id, val)} />
              <Label htmlFor={item.id} className="text-[11px] font-bold uppercase cursor-pointer leading-tight">{item.label}</Label>
            </div>
          ))}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input placeholder="10. No other works / activity allowed within ______ m" value={data.preparation.noOtherWork} onChange={(e) => handleUpdate('preparation', 'noOtherWork', e.target.value)} />
            <Input placeholder="11. Sewer covered within ______ m" value={data.preparation.sewerCovered} onChange={(e) => handleUpdate('preparation', 'sewerCovered', e.target.value)} />
          </div>
          <Textarea className="col-span-1 md:col-span-2 mt-2" placeholder="REMARKS / ملاحظات" value={data.preparation.remarks} onChange={(e) => handleUpdate('preparation', 'remarks', e.target.value)} />
        </div>
      </div>

      {/* SECTION 4: PPE & Tools */}
      <div className="border-[3px] border-slate-900 rounded-sm mb-6">
        <div className="bg-slate-900 text-white font-black text-sm p-2 uppercase">4 - Additional Special Tools / Protection Required / معدات الوقاية والأدوات</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="font-bold border-b border-slate-900 mb-2 text-xs">PPE Required</div>
            {['helmet', 'safetyShoes', 'coverall', 'safetyGlasses', 'gloves'].map(p => (
              <div key={p} className="flex items-center gap-2">
                <Checkbox id={`ppe-${p}`} checked={data.ppe[p]} onCheckedChange={(val) => handleUpdate('ppe', p, val)} />
                <Label htmlFor={`ppe-${p}`} className="text-[10px] font-bold uppercase cursor-pointer">{p}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="font-bold border-b border-slate-900 mb-2 text-xs">Special Protection</div>
            {['faceShield', 'rubberBoots', 'noSmoking', 'breathingEquipment'].map(p => (
              <div key={p} className="flex items-center gap-2">
                <Checkbox id={`spec-${p}`} checked={data.ppe[p]} onCheckedChange={(val) => handleUpdate('ppe', p, val)} />
                <Label htmlFor={`spec-${p}`} className="text-[10px] font-bold uppercase cursor-pointer">{p.replace(/([A-Z])/g, ' $1')}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="font-bold border-b border-slate-900 mb-2 text-xs">Tools Required</div>
            {['fireExtinguisher', 'weldingMachine', 'light24v', 'batteryOperated', 'heatProtection'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <Checkbox id={`tool-${t}`} checked={data.tools[t]} onCheckedChange={(val) => handleUpdate('tools', t, val)} />
                <Label htmlFor={`tool-${t}`} className="text-[10px] font-bold uppercase cursor-pointer">{t.replace(/([A-Z])/g, ' $1')}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: Gas Testing */}
      <div className="border-[3px] border-slate-900 rounded-sm mb-6">
        <div className="bg-slate-900 text-white font-black text-sm p-2 uppercase">5 - GAS TESTING / فحص الغاز</div>
        <div className="p-4">
          <table className="w-full border-collapse border border-slate-300 text-[10px] font-bold uppercase">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-300 p-1">Time</th>
                <th className="border border-slate-300 p-1">Operator</th>
                <th className="border border-slate-300 p-1">Oxygen</th>
                <th className="border border-slate-300 p-1">LEL</th>
                <th className="border border-slate-300 p-1">Toxic</th>
                <th className="border border-slate-300 p-1">Other</th>
              </tr>
            </thead>
            <tbody>
              {data.gasTesting.entries.map((entry: any, i: number) => (
                <tr key={i}>
                  <td className="border border-slate-300 p-0"><input className="w-full p-1 border-0 focus:ring-0" value={entry.time} onChange={(e) => {
                    const next = [...data.gasTesting.entries];
                    next[i].time = e.target.value;
                    handleUpdate('gasTesting', 'entries', next);
                  }} /></td>
                  <td className="border border-slate-300 p-0"><input className="w-full p-1 border-0 focus:ring-0" value={entry.operator} onChange={(e) => {
                    const next = [...data.gasTesting.entries];
                    next[i].operator = e.target.value;
                    handleUpdate('gasTesting', 'entries', next);
                  }} /></td>
                  <td className="border border-slate-300 p-0"><input className="w-full p-1 border-0 focus:ring-0" value={entry.o2} onChange={(e) => {
                    const next = [...data.gasTesting.entries];
                    next[i].o2 = e.target.value;
                    handleUpdate('gasTesting', 'entries', next);
                  }} /></td>
                  <td className="border border-slate-300 p-0"><input className="w-full p-1 border-0 focus:ring-0" value={entry.lel} onChange={(e) => {
                    const next = [...data.gasTesting.entries];
                    next[i].lel = e.target.value;
                    handleUpdate('gasTesting', 'entries', next);
                  }} /></td>
                  <td className="border border-slate-300 p-0"><input className="w-full p-1 border-0 focus:ring-0" value={entry.ppm} onChange={(e) => {
                    const next = [...data.gasTesting.entries];
                    next[i].ppm = e.target.value;
                    handleUpdate('gasTesting', 'entries', next);
                  }} /></td>
                  <td className="border border-slate-300 p-0"><input className="w-full p-1 border-0 focus:ring-0" value={entry.other} onChange={(e) => {
                    const next = [...data.gasTesting.entries];
                    next[i].other = e.target.value;
                    handleUpdate('gasTesting', 'entries', next);
                  }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 p-4 border-2 border-slate-900 bg-slate-50 italic text-[11px] font-bold">
            "The equipment and/or location where the work has to be performed were inspected & safety precautions listed in this Work Permit have been fully implemented."
            <div className="mt-2 flex flex-wrap gap-4 items-center not-italic">
              <span className="flex items-center gap-2">
                Shift Supervisor: 
                <Input className="w-40 h-7 text-[10px]" placeholder="Name" value={data.gasTesting.supervisorName || ""} onChange={(e) => handleUpdate('gasTesting', 'supervisorName', e.target.value)} />
              </span>
              <span className="flex items-center gap-2">
                PN: 
                <Input className="w-20 h-7 text-[10px]" placeholder="PN" value={data.gasTesting.supervisorPN || ""} onChange={(e) => handleUpdate('gasTesting', 'supervisorPN', e.target.value)} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Work Place Checklist */}
      <div className="border-[3px] border-slate-900 rounded-sm mb-6">
        <div className="bg-slate-900 text-white font-black text-sm p-2 uppercase">6 - WORK PLACE CHECK LIST / قائمة التحقق من موقع العمل</div>
        <div className="p-4 space-y-2">
          {[
            'Have you located the nearest safety shower? Is it OK?',
            'Have you located the nearest eye washing equipment? Is it OK?',
            'Have you located the nearest escape route? Is it free from obstacles or debris?',
            'Have you located the nearest emergency communication system? Is it OK?',
            'Working area is clean and free of debris or material?',
            'Tools and equipment are in good condition and suitable for the job?',
            'Are other works going on above / beneath your working area that may interfere?',
            'Lighting is sufficient? Do you need extra lighting?',
            'If you are using scaffolding is it safe and easy to access?',
            'Have you been explained about all the risks involved in this work and the safety precautions that must be taken and are clear to me?'
          ].map((q, i) => {
            const key = `q${i+1}`;
            return (
              <div key={key} className="grid grid-cols-[1fr,150px,200px] items-start gap-4 py-2 border-b border-slate-100 last:border-0">
                <span className="text-[11px] font-bold uppercase leading-tight">{i+1}. {q}</span>
                <div className="flex gap-2">
                  <button type="button" className={`px-2 py-1 border text-[9px] font-black ${data.workPlaceChecklist[key].y ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('workPlaceChecklist', key, { ...data.workPlaceChecklist[key], y: true, n: false, na: false })}>Y</button>
                  <button type="button" className={`px-2 py-1 border text-[9px] font-black ${data.workPlaceChecklist[key].n ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('workPlaceChecklist', key, { ...data.workPlaceChecklist[key], y: false, n: true, na: false })}>N</button>
                  <button type="button" className={`px-2 py-1 border text-[9px] font-black ${data.workPlaceChecklist[key].na ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`} onClick={() => handleUpdate('workPlaceChecklist', key, { ...data.workPlaceChecklist[key], y: false, n: false, na: true })}>N/A</button>
                </div>
                <Input placeholder="Remarks" className="h-7 text-[10px]" value={data.workPlaceChecklist[key].remarks} onChange={(e) => handleUpdate('workPlaceChecklist', key, { ...data.workPlaceChecklist[key], remarks: e.target.value })} />
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 7: Permit Closed Out */}
      <div className="border-[3px] border-slate-900 rounded-sm mb-6">
        <div className="bg-slate-900 text-white font-black text-sm p-2 uppercase">7 - PERMIT CLOSED OUT / إغلاق التصريح</div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <span className="text-[11px] font-black uppercase">Work Completed:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-[10px] font-bold"><Checkbox checked={data.closure.completed} onCheckedChange={(v) => handleUpdate('closure', 'completed', v)} /> YES</label>
                <label className="flex items-center gap-1 text-[10px] font-bold"><Checkbox checked={!data.closure.completed && data.closure.incomplete} onCheckedChange={(v) => handleUpdate('closure', 'incomplete', v)} /> NO</label>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[11px] font-black uppercase">Incomplete / Stopped:</span>
              <Input placeholder="Why?" className="flex-1" value={data.closure.remarks} onChange={(e) => handleUpdate('closure', 'remarks', e.target.value)} />
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[11px] font-black uppercase">Housekeeping Done:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-[10px] font-bold"><Checkbox checked={data.closure.housekeeping} onCheckedChange={(v) => handleUpdate('closure', 'housekeeping', v)} /> YES</label>
                <label className="flex items-center gap-1 text-[10px] font-bold"><Checkbox checked={!data.closure.housekeeping} onCheckedChange={(v) => handleUpdate('closure', 'housekeeping', !v)} /> NO</label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-[2px] border-slate-900 p-2 flex flex-col justify-between">
              <div className="text-[9px] font-black uppercase text-slate-500">Shift Supervisor</div>
              <Input className="border-0 border-b border-slate-200 rounded-none h-6 text-[10px] p-0" placeholder="Name" value={data.closure.supervisorName} onChange={(e) => handleUpdate('closure', 'supervisorName', e.target.value)} />
              <Input className="border-0 border-b border-slate-200 rounded-none h-6 text-[10px] p-0" placeholder="PN" value={data.closure.supervisorPN} onChange={(e) => handleUpdate('closure', 'supervisorPN', e.target.value)} />
            </div>
            <div className="border-[2px] border-slate-900 p-2 flex flex-col justify-between">
              <div className="text-[9px] font-black uppercase text-slate-500">Authorized Foreman</div>
              <Input className="border-0 border-b border-slate-200 rounded-none h-6 text-[10px] p-0" placeholder="Name" value={data.closure.foremanName} onChange={(e) => handleUpdate('closure', 'foremanName', e.target.value)} />
              <Input className="border-0 border-b border-slate-200 rounded-none h-6 text-[10px] p-0" placeholder="PN" value={data.closure.foremanPN} onChange={(e) => handleUpdate('closure', 'foremanPN', e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </BaseFormLayout>
  );
}
