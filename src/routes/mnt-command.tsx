import { createFileRoute } from "@tanstack/react-router";
import MaintenanceCommand from "@/pages/MaintenanceCommand";

export const Route = createFileRoute("/mnt-command")({
  head: () => ({
    meta: [
      { title: "Maintenance Command Center — LIFECO PMS" },
      { name: "description", content: "Central maintenance management for all plant work requests." },
      { property: "og:title", content: "Maintenance Command Center — LIFECO PMS" },
    ],
  }),
  component: MaintenanceCommand,
});