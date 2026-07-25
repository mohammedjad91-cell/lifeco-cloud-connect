import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LIFECO Digital Transformation Platform" },
      { name: "description", content: "Hierarchical plant, equipment, and operations management for LIFECO plants." },
      { property: "og:title", content: "LIFECO Digital Transformation Platform" },
      { property: "og:description", content: "Hierarchical plant, equipment, and operations management for LIFECO plants." },
    ],
  }),
  component: Home,
});
