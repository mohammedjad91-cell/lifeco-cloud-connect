import { createFileRoute } from "@tanstack/react-router";
import BIDashboard from "@/pages/BIDashboard";

export const Route = createFileRoute("/bi")({
  component: BIDashboard,
});
