import { createFileRoute } from "@tanstack/react-router";
import HSECenter from "@/pages/HSECenter";

export const Route = createFileRoute("/hse-center")({
  head: () => ({
    meta: [
      { title: "HSE Command Center — LIFECO PMS" },
      { name: "description", content: "Occupational Safety & Health command center: permits, incidents, PPE, emergency map, and KPIs." },
    ],
  }),
  component: HSECenter,
});
