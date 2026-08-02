import { createFileRoute } from "@tanstack/react-router";
import LabReportsOverview from "@/pages/LabReportsOverview";

export const Route = createFileRoute("/lab-reports/")({
  head: () => ({
    meta: [
      { title: "تقارير المعمل — LIFECO PMS" },
      { name: "description", content: "تقارير مشرفي معمل الأمونيا ومعمل اليوريا: يومي وأسبوعي وشهري." },
      { property: "og:title", content: "تقارير المعمل — LIFECO PMS" },
      { property: "og:description", content: "تقارير مشرفي معمل الأمونيا ومعمل اليوريا: يومي وأسبوعي وشهري." },
    ],
  }),
  component: LabReportsOverview,
});
