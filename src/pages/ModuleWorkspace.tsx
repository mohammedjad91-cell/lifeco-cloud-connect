import React from "react";
import WorkPermitForm from '@/components/forms/lifeco/WorkPermitForm';
import WorkRequestForm from '@/components/forms/lifeco/WorkRequestForm';
import ElectricalWorkPermitForm from '@/components/forms/lifeco/ElectricalWorkPermitForm';
import FormHistory from '@/components/forms/lifeco/FormHistory';
import PermitCenter from '@/components/PermitCenter';
import AssetRegister from '@/components/AssetRegister';
import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Wrench, ShieldCheck, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ModuleWorkspace = ({ plantCode, moduleKey }: { plantCode: string, moduleKey: string }) => {
  const navigate = useNavigate();
  
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
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
               <Wrench className="w-8 h-8 text-primary" />
               <div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight">Maintenance Hub</h1>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Asset Register, Digital Passports & Work Requests</p>
               </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                     <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate(`/module/${plantCode}/form-history`)}>
                        <HistoryIcon className="w-4 h-4" /> View History
                     </Button>
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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Module Workspace</h1>
        <p className="text-slate-400">Module: {moduleKey} | Plant: {plantCode}</p>
        <p className="text-xs text-slate-500 italic">Please select a valid module from the plant screen.</p>
        <Button onClick={handleBackToPlant} variant="outline" className="mt-4">
          Return to Plant
        </Button>
      </div>
    </div>
  );
};

export default ModuleWorkspace;