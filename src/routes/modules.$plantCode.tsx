import { createFileRoute, useParams } from "@tanstack/react-router";
import PlantModules from "@/pages/PlantModules";

export const Route = createFileRoute("/modules/$plantCode")({
  component: ModulesRoute,
});

function ModulesRoute() {
  const { plantCode } = useParams({ from: "/modules/$plantCode" });
  return <PlantModules plantCode={plantCode} />;
}
