import React from "react";
import WorkPermitForm from '@/components/forms/lifeco/WorkPermitForm';
import WorkRequestForm from '@/components/forms/lifeco/WorkRequestForm';
import ElectricalWorkPermitForm from '@/components/forms/lifeco/ElectricalWorkPermitForm';
import FormHistory from '@/components/forms/lifeco/FormHistory';
import PermitCenter from '@/components/PermitCenter';
import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ModuleWorkspace = ({ plantCode, moduleKey }: { plantCode: string, moduleKey: string }) => {
  const navigate = useNavigate();
  
  // Custom back handler to return to plant selection
  const handleBackToPlant = () => {
    navigate(`/modules/${plantCode}`);
  };

  if (moduleKey === 'permits') {
    return (
      <div className="min-h-screen bg-[#050b18] p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button variant="ghost" onClick={handleBackToPlant} className="text-white hover:bg-white/10 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plant Selection
          </Button>
          <div className="glass-card p-6 border border-white/10 shadow-2xl">
            <PermitCenter plantCode={plantCode} departmentKey={sessionStorage.getItem("lifeco_dept") || "MAINTENANCE"} />
          </div>
        </div>
      </div>
    );
  }

  if (moduleKey === 'work-permit') {
    return <WorkPermitForm plantCode={plantCode} />;
  }
  
  if (moduleKey === 'work-request') {
    return <WorkRequestForm plantCode={plantCode} />;
  }
  
  if (moduleKey === 'electrical-permit') {
    return <ElectricalWorkPermitForm plantCode={plantCode} />;
  }

  if (moduleKey === 'form-history') {
    return <FormHistory plantCode={plantCode} />;
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