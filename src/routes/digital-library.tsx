import { createFileRoute } from "@tanstack/react-router";
import DigitalLibrary from "@/pages/DigitalLibrary";

export const Route = createFileRoute("/digital-library")({
  head: () => ({
    meta: [
      { title: "Digital Library — LIFECO PMS" },
      { name: "description", content: "Ammonia Department digital library: manuals, datasheets, PFDs, P&IDs, SOPs, photos and videos." },
      { property: "og:title", content: "Digital Library — LIFECO PMS" },
      { property: "og:description", content: "Ammonia Department digital library: manuals, datasheets, PFDs, P&IDs, SOPs, photos and videos." },
    ],
  }),
  component: DigitalLibrary,
});
