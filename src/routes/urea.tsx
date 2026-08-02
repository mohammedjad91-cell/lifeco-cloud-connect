import { createFileRoute } from "@tanstack/react-router";
import PlantHub from "@/pages/PlantHub";

export const Route = createFileRoute("/urea")({
  head: () => ({
    meta: [
      { title: "مركز مصنع اليوريا — LIFECO PMS" },
      { name: "description", content: "تقارير الورديات والأعمال الروتينية وغير الروتينية لمصنع اليوريا." },
      { property: "og:title", content: "مركز مصنع اليوريا — LIFECO PMS" },
      { property: "og:description", content: "تقارير الورديات والأعمال الروتينية وغير الروتينية لمصنع اليوريا." },
    ],
  }),
  component: () => <PlantHub plantKey="UREA" />,
});
