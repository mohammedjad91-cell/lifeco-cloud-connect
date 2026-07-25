import { createFileRoute } from "@tanstack/react-router";
import DeveloperPanel from "@/pages/DeveloperPanel";

export const Route = createFileRoute("/developer")({
  head: () => ({
    meta: [
      { title: "Developer Panel — LIFECO PMS" },
      { name: "description", content: "Master control center for the LIFECO Digital Transformation Platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeveloperPanel,
});
