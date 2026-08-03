import { createFileRoute } from "@tanstack/react-router";
import ChemicalStore from "@/pages/ChemicalStore";

export const Route = createFileRoute("/chemical-store")({
  head: () => ({
    meta: [
      { title: "المخزن الكيميائي — LIFECO PMS" },
      { name: "description", content: "قائمة تخزين المواد الكيميائية للمعمل: الكميات، أماكن التخزين، الصلاحية والخطورة." },
      { property: "og:title", content: "المخزن الكيميائي — LIFECO PMS" },
      { property: "og:description", content: "تخزين ومتابعة المواد الكيميائية داخل المعمل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChemicalStore,
});
