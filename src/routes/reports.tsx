import { createFileRoute } from "@tanstack/react-router";
import ReportsHub from "@/pages/ReportsHub";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "مركز التقارير التشغيلية — LIFECO PMS" },
      { name: "description", content: "تقارير المشرفين اليومية والأسبوعية والشهرية لمصانع الأمونيا واليوريا." },
      { property: "og:title", content: "مركز التقارير التشغيلية — LIFECO PMS" },
      { property: "og:description", content: "تقارير المشرفين اليومية والأسبوعية والشهرية لمصانع الأمونيا واليوريا." },
    ],
  }),
  component: ReportsHub,
});
