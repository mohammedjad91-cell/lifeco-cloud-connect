import { createFileRoute } from "@tanstack/react-router";
import PlantHub from "@/pages/PlantHub";

export const Route = createFileRoute("/ammonia")({
  head: () => ({
    meta: [
      { title: "مركز مصنع الأمونيا — LIFECO PMS" },
      { name: "description", content: "تقارير الورديات والأعمال الروتينية وغير الروتينية لمصنع الأمونيا." },
      { property: "og:title", content: "مركز مصنع الأمونيا — LIFECO PMS" },
      { property: "og:description", content: "تقارير الورديات والأعمال الروتينية وغير الروتينية لمصنع الأمونيا." },
    ],
  }),
  component: () => <PlantHub plantKey="AMMONIA" />,
});
