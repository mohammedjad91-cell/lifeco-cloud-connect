import { createFileRoute } from "@tanstack/react-router";
import LabEquipment from "@/pages/LabEquipment";

export const Route = createFileRoute("/lab-equipment")({
  head: () => ({
    meta: [
      { title: "معدات المختبر — LIFECO PMS" },
      { name: "description", content: "سجل أجهزة ومعدات المعمل: الأسماء والأكواد والمواقع وحالة التشغيل والمعايرة." },
      { property: "og:title", content: "معدات المختبر — LIFECO PMS" },
      { property: "og:description", content: "سجل أجهزة ومعدات المعمل وحالة التشغيل والمعايرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LabEquipment,
});
