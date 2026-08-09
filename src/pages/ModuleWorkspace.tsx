import React, { useState, useEffect } from "react";
import WorkPermitForm from '@/components/forms/lifeco/WorkPermitForm';
import WorkRequestForm from '@/components/forms/lifeco/WorkRequestForm';
import ElectricalWorkPermitForm from '@/components/forms/lifeco/ElectricalWorkPermitForm';
import FormHistory from '@/components/forms/lifeco/FormHistory';
import PermitCenter from '@/components/PermitCenter';
import AssetRegister from '@/components/AssetRegister';
import MaintenanceManagement from '@/components/maintenance/MaintenanceManagement';
import { EquipmentFaceplate } from "@/components/maintenance/EquipmentFaceplate";
import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Wrench, ShieldCheck, History as HistoryIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const ModuleWorkspace = ({ plantCode, moduleKey }: { plantCode: string, moduleKey: string }) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  
  useEffect(() => {
    const handleOpenEquipment = (e: any) => {
      console.log("ModuleWorkspace: caught lifeco:open-equipment for", e.detail?.tag);
      setSelectedEquipment(e.detail?.tag);
    };
    window.addEventListener('lifeco:open-equipment', handleOpenEquipment);
    return () => window.removeEventListener('lifeco:open-equipment', handleOpenEquipment);
  }, []);

  const handleBackToPlant = () => {
    navigate(`/modules/${plantCode}`);
  };

  // Dedicated View for Permits Center
  if (moduleKey === 'permits') {
    return (
      <div className="min-h-screen bg-[#050b18] p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" onClick={handleBackToPlant} className="text-white hover:bg-white/10 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {plantCode} Modules
          </Button>
          <div className="glass-card p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
               <ShieldCheck className="w-8 h-8 text-primary" />
               <div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight">Permit Center</h1>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Official Work Permits & Safety Certifications</p>
               </div>
            </div>
            <PermitCenter 
              plantCode={plantCode} 
              departmentKey={sessionStorage.getItem("lifeco_dept") || "MAINTENANCE"} 
              onViewHistory={() => navigate(`/module/${plantCode}/form-history`)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (moduleKey === 'maintenance') {
    return (
      <div className="min-h-screen bg-[#050b18] p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" onClick={handleBackToPlant} className="text-white hover:bg-white/10 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to {plantCode} Modules
          </Button>
          <div className="glass-card p-8 border border-white/10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-4">
               <div className="flex items-center gap-3">
                 <Wrench className="w-8 h-8 text-primary" />
                 <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Maintenance Hub</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Asset Register, Digital Passports & Work Requests</p>
                 </div>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10" onClick={() => navigate(`/module/${plantCode}/form-history`)}>
                    <HistoryIcon className="w-4 h-4" /> {sessionStorage.getItem("lifeco_lang") === "ar" ? "سجل النماذج (التصاريح المرسلة)" : "Form History (Sent Permits)"}
                 </Button>
               </div>
            </div>
            
            <div className="space-y-8">
               {/* 1. Maintenance Management System (Flow Handling) */}
               <MaintenanceManagement plantCode={plantCode} />
               
               {/* 2. Asset Register & Actions */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                  <div className="lg:col-span-2">
                     <AssetRegister department={sessionStorage.getItem("lifeco_dept") || "MAINTENANCE"} />
                  </div>
                  <div className="space-y-6">
                     <div className="glass-card p-6 border border-primary/20 bg-primary/5">
                        <h3 className="text-lg font-bold text-white mb-2">Actions</h3>
                        <p className="text-xs text-muted-foreground mb-4">Official maintenance documentation for this plant.</p>
                        <Button className="w-full justify-start gap-2 mb-2" onClick={() => navigate(`/module/${plantCode}/work-request`)}>
                           <Wrench className="w-4 h-4" /> New Work Request
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2 mb-2" onClick={() => navigate("/thresholds")}>
                           <AlertCircle className="w-4 h-4" /> {lang === "ar" ? "حدود التنبيهات" : "Alert Thresholds"}
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate(`/module/${plantCode}/form-history`)}>
                           <HistoryIcon className="w-4 h-4" /> View History
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form-Specific Views
  if (moduleKey === 'work-permit') {
    return <WorkPermitForm plantCode={plantCode} onBack={() => navigate(`/module/${plantCode}/permits`)} />;
  }
  
  if (moduleKey === 'work-request') {
    return <WorkRequestForm plantCode={plantCode} onBack={() => navigate(`/module/${plantCode}/maintenance`)} />;
  }
  
  if (moduleKey === 'electrical-permit') {
    return <ElectricalWorkPermitForm plantCode={plantCode} onBack={() => navigate(`/module/${plantCode}/permits`)} />;
  }

  if (moduleKey === 'form-history') {
    return <FormHistory plantCode={plantCode} onBack={() => navigate(`/module/${plantCode}/maintenance`)} />;
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Module Workspace</h1>
        <p className="text-slate-400">Module: {moduleKey} | Plant: {plantCode}</p>
        <p className="text-xs text-slate-500 italic">Please select a valid module from the plant screen.</p>
        <Button onClick={handleBackToPlant} variant="outline" className="mt-4">
          Return to Plant
        </Button>
      </div>

      <EquipmentFaceplate
        tag={selectedEquipment || ""}
        plantCode={plantCode}
        lang={lang}
        open={!!selectedEquipment}
        onOpenChange={(open) => !open && setSelectedEquipment(null)}
      />
    </div>
  );
};

export default ModuleWorkspace;