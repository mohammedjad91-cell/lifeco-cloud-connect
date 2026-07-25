import { createFileRoute, useParams } from "@tanstack/react-router";
import DepartmentPlants from "@/pages/DepartmentPlants";

export const Route = createFileRoute("/dept/$deptId")({
  component: DeptPlantsRoute,
});

function DeptPlantsRoute() {
  const { deptId } = useParams({ from: "/dept/$deptId" });
  return <DepartmentPlants deptId={deptId} />;
}
