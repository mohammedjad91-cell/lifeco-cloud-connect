import React from "react";
import WorkPermitForm from '@/components/forms/lifeco/WorkPermitForm';
import WorkRequestForm from '@/components/forms/lifeco/WorkRequestForm';
import ElectricalWorkPermitForm from '@/components/forms/lifeco/ElectricalWorkPermitForm';

const ModuleWorkspace = ({ plantCode, moduleKey }: { plantCode: string, moduleKey: string }) => {
  if (moduleKey === 'work-permit') {
    return <WorkPermitForm plantCode={plantCode} />;
  }
  
  if (moduleKey === 'work-request') {
    return <WorkRequestForm plantCode={plantCode} />;
  }
  
  if (moduleKey === 'electrical-permit') {
    return <ElectricalWorkPermitForm plantCode={plantCode} />;
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Module Workspace</h1>
        <p className="text-slate-400">Module: {moduleKey} | Plant: {plantCode}</p>
        <p className="text-xs text-slate-500 italic">(The original content of this module was replaced during restoration. Please select a valid form.)</p>
      </div>
    </div>
  );
};

export default ModuleWorkspace;
