import { createFileRoute } from "@tanstack/react-router";
import OpsOverview from "@/pages/OpsOverview";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "النظرة العامة للمصانع — LIFECO PMS" },
      { name: "description", content: "لوحة موحّدة لحالة مصنعي الأمونيا واليوريا وتقارير المشرفين." },
      { property: "og:title", content: "النظرة العامة للمصانع — LIFECO PMS" },
      { property: "og:description", content: "لوحة موحّدة لحالة مصنعي الأمونيا واليوريا وتقارير المشرفين." },
    ],
  }),
  component: OpsOverview,
});
