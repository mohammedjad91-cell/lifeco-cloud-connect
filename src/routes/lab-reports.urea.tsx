import { createFileRoute } from "@tanstack/react-router";
import LabHub from "@/pages/LabHub";

export const Route = createFileRoute("/lab-reports/urea")({
  head: () => ({
    meta: [
      { title: "تقارير معمل اليوريا — LIFECO PMS" },
      { name: "description", content: "تقارير مشرف معمل اليوريا: أعمال روتينية وغير روتينية، يومي وأسبوعي وشهري." },
      { property: "og:title", content: "تقارير معمل اليوريا — LIFECO PMS" },
      { property: "og:description", content: "تقارير مشرف معمل اليوريا: أعمال روتينية وغير روتينية." },
    ],
  }),
  component: () => <LabHub plantKey="UREA" />,
});
