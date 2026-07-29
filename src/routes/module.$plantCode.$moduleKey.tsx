import { createFileRoute, useParams } from "@tanstack/react-router";
import ModuleWorkspace from "@/pages/ModuleWorkspace";

export const Route = createFileRoute("/module/$plantCode/$moduleKey")({
  head: () => ({
    meta: [
      { title: "Module Workspace — LIFECO PMS" },
      { name: "description", content: "Plant module workspace with live readings, equipment, documents and maintenance records." },
      { property: "og:title", content: "Module Workspace — LIFECO PMS" },
      { property: "og:description", content: "Plant module workspace with live readings, equipment, documents and maintenance records." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ModuleWorkspaceRoute,
});

function ModuleWorkspaceRoute() {
  const { plantCode, moduleKey } = useParams({ from: "/module/$plantCode/$moduleKey" });
  return <ModuleWorkspace plantCode={plantCode} moduleKey={moduleKey} />;
}
