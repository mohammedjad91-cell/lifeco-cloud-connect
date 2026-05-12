import { createFileRoute } from "@tanstack/react-router";
import AdminSettings from "@/pages/AdminSettings";

export const Route = createFileRoute("/admin")({
  component: AdminSettings,
});
