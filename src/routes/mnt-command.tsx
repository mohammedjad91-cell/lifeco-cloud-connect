import { createFileRoute } from "@tanstack/react-router";
import MaintenanceCommand from "@/pages/MaintenanceCommand";

export const Route = createFileRoute("/mnt-command")({
  component: MaintenanceCommand,
  head: () => ({
    meta: [
      { title: "Maintenance Command Center — LIFECO PMS" },
      { name: "description", content: "Real-time LIFECO maintenance command center: fleet status, KPIs (MTBF/MTTR/Availability), digital equipment passports and QR." },
      { property: "og:title", content: "Maintenance Command Center — LIFECO PMS" },
      { property: "og:description", content: "Real-time LIFECO maintenance command center with KPIs and digital equipment passports." },
    ],
  }),
});
