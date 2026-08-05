import { createFileRoute } from '@tanstack/react-router';
import WorkPermitForm from '@/components/forms/lifeco/WorkPermitForm';

export const Route = createFileRoute('/module/$plantCode/$moduleKey')({
  component: ModuleWorkspacePage,
});

function ModuleWorkspacePage() {
  const { plantCode, moduleKey } = Route.useParams();
  
  if (moduleKey === 'work-permit') {
    return <WorkPermitForm plantCode={plantCode} />;
  }
  
  // Existing module logic should be here, but I need to see the original file first
  return <div>Module: {moduleKey} for {plantCode}</div>;
}
