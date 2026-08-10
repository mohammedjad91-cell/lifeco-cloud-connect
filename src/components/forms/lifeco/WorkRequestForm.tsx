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
import { Building2, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "@/lib/router-compat";

export default function WorkRequestForm({ formId, initialData, plantCode, onBack }: { formId?: string, initialData?: any, plantCode?: string, onBack?: () => void }) {
  const navigate = useNavigate();
  const [data, setData] = useState(initialData?.form_data || {
    header: {
      wrNo: "",
      priority: "NORMAL",
      sn: "",
      dateIssued: new Date().toISOString().split('T')[0],
      dateAvail: "",
      dateRequired: ""
    },
    location: {
      unit: plantCode || "",
      department: "MAINTENANCE",
      equipmentNo: "",
      detail: "",
      costCenter: ""
    },
    permits: {
      hot: false,
      cold: false,
      elect: false,
      none: true,
      ledgerCode: ""
    },
    job: {
      originator: "",
      teleNo: "",
      pNo: "",
      description: "",
      workPerformed: "",
      workCompBy: "",
      compDate: ""
    },
    estimates: {
      skill: "",
      est: "",
      metals: "",
      instr: "",
      elect: "",
      nobe: "",
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

  const exportToPDF = async () => {
    const element = document.getElementById("work-request-document");
    if (!element) return;
    
    toast.info("جاري تجهيز نسخة PDF...");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output("blob");
    const fileName = `Work_Request_${initialData?.form_number || 'New'}_${Date.now()}.pdf`;
    
    // Save to browser
    pdf.save(fileName);

    // Also upload to system storage
    const { error: uploadError } = await supabase.storage
      .from("field-ops-photos")
      .upload(`permits/${fileName}`, pdfBlob);
    
    if (uploadError) console.error("Error uploading PDF:", uploadError);
    else toast.success("تم حفظ النسخة في أرشيف النظام.");
  };

  return (
    <BaseFormLayout 
      title="WORK REQUEST / طلب عمل" 
      formNumber={initialData?.form_number}
      status={initialData?.status}
      onSave={() => onSave('draft')}
      onSubmit={async () => {
        await onSave('submitted');
        await exportToPDF();
        toast.info("تم إرسال طلب العمل وحفظ نسخة PDF بنجاح.");
      }}
      onBack={onBack || (() => {
        const plant = sessionStorage.getItem("lifeco_plant");
        if (plant) navigate(`/module/${plant}/maintenance`);
        else navigate("/");
      })}
      isSubmitted={initialData?.status === 'submitted'}
    >
      <div id="work-request-document" className="bg-white text-slate-900 shadow-2xl border-[3px] border-slate-900">
        {/* Document Header (Matched to file-3) */}
        <div className="flex border-b-[3px] border-slate-900">
          <div className="w-1/4 p-4 border-r-[3px] border-slate-900 flex flex-col justify-center items-center space-y-2">
            <div className="text-[10px] font-black border-2 border-slate-900 px-4 py-1 rounded-sm w-full text-center">W.R. NO :</div>
            <div className="text-xl font-black text-red-600 tracking-widest">{initialData?.form_number || '000000'}</div>
          </div>
          
          <div className="w-2/4 p-4 flex flex-col items-center justify-center border-r-[3px] border-slate-900 relative">
             <div className="border-[4px] border-slate-900 rounded-full px-12 py-3 bg-slate-50 shadow-inner">
               <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">WORK REQUEST</h1>
             </div>
             <div className="mt-4 flex gap-8 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black">PRIORITY :</span>
                  <div className="flex gap-4">
                     {['EMERG', 'URGENT', 'NORMAL'].map(p => (
                       <label key={p} className="flex items-center gap-1 cursor-pointer">
                         <div className={`w-3 h-3 border-2 border-slate-900 ${data.header.priority === p ? 'bg-slate-900' : 'bg-transparent'}`} onClick={() => handleUpdate('header', 'priority', p)} />
                         <span className="text-[9px] font-black">{p}</span>
                       </label>
                     ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black">S/N :</span>
                  <span className="text-lg font-black text-red-600">{data.header.sn || '012847'}</span>
                </div>
             </div>
          </div>

          <div className="w-1/4 p-4 flex flex-col items-end justify-center">
             <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-2xl font-black tracking-tighter leading-none">LIFECO</div>
                  <div className="text-[8px] font-black uppercase text-slate-500">Libyan Fertilizer Company</div>
                </div>
                <Building2 className="w-10 h-10 text-slate-900" />
             </div>
          </div>
        </div>

        {/* Location Information Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b-[3px] border-slate-900">
          <div className="p-2 border-r-[3px] border-slate-900 flex flex-col">
            <Label className="text-[10px] font-black uppercase mb-1">UNIT (LOCATION OF WORK) :</Label>
            <Input className="border-none h-8 p-0 text-sm font-bold bg-transparent focus-visible:ring-0" value={data.location.unit} onChange={(e) => handleUpdate('location', 'unit', e.target.value)} />
          </div>
          <div className="p-2 border-r-[3px] border-slate-900 flex flex-col">
            <Label className="text-[10px] font-black uppercase mb-1">EQUIPMENT No :</Label>
            <Select value={data.location.equipmentNo} onValueChange={(v) => handleUpdate('location', 'equipmentNo', v)}>
               <SelectTrigger className="border-none h-8 p-0 text-sm font-bold bg-transparent shadow-none">
                 <SelectValue placeholder="Select Tag" />
               </SelectTrigger>
               <SelectContent>
                 {equipmentList.map(e => (
                   <SelectItem key={e.id} value={e.asset_code}>{e.asset_code}</SelectItem>
                 ))}
               </SelectContent>
            </Select>
          </div>
          <div className="p-2 border-r-[3px] border-slate-900 flex flex-col">
            <Label className="text-[10px] font-black uppercase mb-1">DATE ISSUED :</Label>
            <Input type="date" className="border-none h-8 p-0 text-sm font-bold bg-transparent focus-visible:ring-0" value={data.header.dateIssued} onChange={(e) => handleUpdate('header', 'dateIssued', e.target.value)} />
          </div>
          <div className="p-2 flex flex-col">
            <Label className="text-[10px] font-black uppercase mb-1">DATE REQUIRED :</Label>
            <Input type="date" className="border-none h-8 p-0 text-sm font-bold bg-transparent focus-visible:ring-0" value={data.header.dateRequired} onChange={(e) => handleUpdate('header', 'dateRequired', e.target.value)} />
          </div>
        </div>

        {/* Dept and Cost Center Section */}
        <div className="grid grid-cols-3 border-b-[3px] border-slate-900 bg-slate-50">
           <div className="p-2 border-r-[3px] border-slate-900 flex gap-2 items-center">
             <span className="text-[9px] font-black">D :</span>
             <Input className="border-b border-slate-900 border-t-0 border-x-0 rounded-none h-5 text-[10px] bg-transparent" value={data.location.department} />
           </div>
           <div className="p-2 border-r-[3px] border-slate-900 flex gap-2 items-center">
             <span className="text-[9px] font-black">MAIN :</span>
             <div className="w-3 h-3 border border-slate-900" />
             <span className="text-[9px] font-black ml-2">SUB :</span>
             <div className="w-3 h-3 border border-slate-900" />
           </div>
           <div className="p-2 flex gap-2 items-center">
             <span className="text-[9px] font-black">Lifeco Cost Center :</span>
             <Input className="border-b border-slate-900 border-t-0 border-x-0 rounded-none h-5 text-[10px] bg-transparent" value={data.location.costCenter} onChange={(e) => handleUpdate('location', 'costCenter', e.target.value)} />
           </div>
        </div>

        {/* Job Description (The main paper body) */}
        <div className="flex border-b-[3px] border-slate-900 min-h-[400px]">
          {/* Left Side: Description and Work Performed */}
          <div className="w-3/4 border-r-[3px] border-slate-900 flex flex-col">
            <div className="p-2 bg-slate-100 border-b-[3px] border-slate-900 text-[11px] font-black uppercase tracking-widest text-center">DESCRIPTION OF JOB : / وصف العمل</div>
            <Textarea 
              className="flex-1 border-none resize-none p-6 text-sm font-medium leading-relaxed bg-transparent focus-visible:ring-0" 
              placeholder="Enter work details here..."
              value={data.job.description}
              onChange={(e) => handleUpdate('job', 'description', e.target.value)}
            />
            
            <div className="p-2 bg-slate-100 border-t-[3px] border-b-[3px] border-slate-900 text-[11px] font-black uppercase tracking-widest text-center">Work performed / ما تم إنجازه</div>
            <div className="h-40 p-4 italic text-slate-400 text-sm">Space for maintenance feedback...</div>
            
            <div className="grid grid-cols-2 border-t-[3px] border-slate-900">
               <div className="p-2 border-r-[3px] border-slate-900 space-y-2">
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black">work comp by :</span>
                   <Input className="border-b border-slate-900 border-t-0 border-x-0 rounded-none h-5 text-sm bg-transparent" value={data.job.workCompBy} onChange={(e) => handleUpdate('job', 'workCompBy', e.target.value)} />
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black">date :</span>
                   <Input type="date" className="border-b border-slate-900 border-t-0 border-x-0 rounded-none h-5 text-sm bg-transparent" value={data.job.compDate} onChange={(e) => handleUpdate('job', 'compDate', e.target.value)} />
                 </div>
               </div>
               <div className="p-2 flex flex-col justify-between">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black">planner :</span>
                    <div className="border-b border-slate-900 w-full h-4" />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black">planner :</span>
                    <div className="border-b border-slate-900 w-full h-4" />
                 </div>
               </div>
            </div>
          </div>

          {/* Right Side: Estimates, Permits, and Approval */}
          <div className="w-1/4 flex flex-col">
             {/* Estimates Grid */}
             <div className="border-b-[3px] border-slate-900">
               <div className="grid grid-cols-2 bg-slate-100 border-b-2 border-slate-900">
                 <div className="p-1 text-[9px] font-black border-r-2 border-slate-900 text-center">Prepared by</div>
                 <div className="p-1 text-[9px] font-black text-center">EST</div>
               </div>
               {['SKILL', 'EST', 'METALS', 'INSTR', 'ELECT', 'NO.B.E', 'TOTAL'].map((row, idx) => (
                 <div key={row} className="grid grid-cols-2 border-b border-slate-300">
                   <div className={`p-1 text-[9px] font-black border-r-2 border-slate-900 ${idx === 6 ? 'bg-slate-200' : ''}`}>{row}</div>
                   <Input className="h-6 border-none text-[10px] text-center p-0 bg-transparent" value={data.estimates[row.toLowerCase().replace('.', '')]} onChange={(e) => handleUpdate('estimates', row.toLowerCase().replace('.', ''), e.target.value)} />
                 </div>
               ))}
             </div>

             {/* Permits Checklist */}
             <div className="flex-1 p-2 space-y-3 bg-slate-50 border-b-[3px] border-slate-900">
               <div className="text-[10px] font-black underline mb-2">PERMITS REQUIRED</div>
               {['HOT', 'COLD', 'ELECT', 'NONE'].map(p => (
                 <div key={p} className="flex items-center gap-2">
                   <Checkbox id={`p-${p}`} checked={data.permits[p.toLowerCase()]} onCheckedChange={(v) => handleUpdate('permits', p.toLowerCase(), !!v)} />
                   <Label htmlFor={`p-${p}`} className="text-[10px] font-black">{p}</Label>
                 </div>
               ))}
               <div className="mt-4 pt-2 border-t border-slate-400">
                  <span className="text-[9px] font-black">Ledger Code</span>
                  <Input className="h-6 border-b border-slate-900 border-t-0 border-x-0 rounded-none bg-transparent text-[10px]" value={data.permits.ledgerCode} onChange={(e) => handleUpdate('permits', 'ledgerCode', e.target.value)} />
               </div>
             </div>

             {/* Approved By Box */}
             <div className="p-2 h-32 flex flex-col justify-between items-center">
                <div className="text-[10px] font-black uppercase">Approved by</div>
                <div className="w-full border-b-2 border-slate-900 border-dashed mb-2" />
                <div className="text-[8px] font-black text-slate-400">SIGNATURE / DATE</div>
             </div>
          </div>
        </div>

        {/* Footer Originator Info */}
        <div className="grid grid-cols-3 p-4 bg-slate-100">
           <div className="flex flex-col gap-1 border-r-2 border-slate-300 pr-4">
              <span className="text-[10px] font-black uppercase">ORIGNATOR :</span>
              <Input className="h-7 border-b border-slate-900 border-t-0 border-x-0 rounded-none bg-transparent font-bold" value={data.job.originator} onChange={(e) => handleUpdate('job', 'originator', e.target.value)} />
           </div>
           <div className="flex flex-col gap-1 border-r-2 border-slate-300 px-4">
              <span className="text-[10px] font-black uppercase">TELE NO :</span>
              <Input className="h-7 border-b border-slate-900 border-t-0 border-x-0 rounded-none bg-transparent font-bold" value={data.job.teleNo} onChange={(e) => handleUpdate('job', 'teleNo', e.target.value)} />
           </div>
           <div className="flex flex-col gap-1 pl-4">
              <span className="text-[10px] font-black uppercase">P/no :</span>
              <Input className="h-7 border-b border-slate-900 border-t-0 border-x-0 rounded-none bg-transparent font-bold" value={data.job.pNo} onChange={(e) => handleUpdate('job', 'pNo', e.target.value)} />
           </div>
        </div>
      </div>
      
      {/* Document ID footer */}
      <div className="mt-2 flex justify-between items-center px-2 text-[8px] font-black text-slate-500 uppercase tracking-widest no-print">
         <span>SFF - 06 - 01 - 03</span>
         <span>REV - 0</span>
         <span>P 1 of 1</span>
      </div>
    </BaseFormLayout>
  );
}
