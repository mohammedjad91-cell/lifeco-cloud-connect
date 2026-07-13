import { createFileRoute } from "@tanstack/react-router";
import OTS from "@/pages/OTS";

export const Route = createFileRoute("/ots")({
  head: () => ({
    meta: [
      { title: "LIFECO OTS — Operator Training Simulator" },
      { name: "description", content: "Yokogawa-style DCS digital twin for AMM1, AMM2, DEMIN1, DEMIN2 operator training." },
    ],
  }),
  component: OTS,
});
