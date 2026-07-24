import { createFileRoute } from "@tanstack/react-router";
import Hierarchy from "@/pages/Hierarchy";

export const Route = createFileRoute("/hierarchy")({
  head: () => ({
    meta: [
      { title: "التسلسل الهرمي — LIFECO PMS" },
      { name: "description", content: "إدارة المصانع والمناطق والمعدات في نظام LIFECO PMS." },
      { property: "og:title", content: "التسلسل الهرمي — LIFECO PMS" },
      { property: "og:description", content: "إضافة وعرض المصانع والمناطق والمعدات." },
    ],
  }),
  component: Hierarchy,
});
