import { createFileRoute } from "@tanstack/react-router";
import LabDashboard from "@/pages/LabDashboard";

export const Route = createFileRoute("/lab")({
  component: LabDashboard,
});
