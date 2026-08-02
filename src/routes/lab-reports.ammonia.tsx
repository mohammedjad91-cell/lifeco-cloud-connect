import { createFileRoute } from "@tanstack/react-router";
import LabHub from "@/pages/LabHub";

export const Route = createFileRoute("/lab-reports/ammonia")({
  head: () => ({
    meta: [
      { title: "تقارير معمل الأمونيا — LIFECO PMS" },
      { name: "description", content: "تقارير مشرف معمل الأمونيا: أعمال روتينية وغير روتينية، يومي وأسبوعي وشهري." },
      { property: "og:title", content: "تقارير معمل الأمونيا — LIFECO PMS" },
      { property: "og:description", content: "تقارير مشرف معمل الأمونيا: أعمال روتينية وغير روتينية." },
    ],
  }),
  component: () => <LabHub plantKey="AMMONIA" />,
});
