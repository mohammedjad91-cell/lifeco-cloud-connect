import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, BookOpen, FileSpreadsheet, FolderOpen } from "lucide-react";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Document Center — LIFECO PMS" },
      { name: "description", content: "Central library for manuals, drawings, standards, and technical documents." },
      { property: "og:title", content: "Document Center — LIFECO PMS" },
      { property: "og:description", content: "Central library for manuals, drawings, standards, and technical documents." },
    ],
  }),
  component: DocumentCenter,
});

const CATEGORIES = [
  { key: "manuals", label: "Operating Manuals", icon: BookOpen },
  { key: "drawings", label: "Drawings & P&IDs", icon: FileSpreadsheet },
  { key: "standards", label: "Standards & Codes", icon: FileText },
  { key: "reports", label: "Technical Reports", icon: FolderOpen },
];

function DocumentCenter() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-6">
      <button
        onClick={() => navigate({ to: "/" })}
        className="mb-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border hover:bg-secondary transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <motion.h1
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold neon-text tracking-wider mb-2"
      >
        📚 Document Center
      </motion.h1>
      <p className="text-muted-foreground mb-8">Central technical documentation library.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card neon-border p-6 hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.5)] transition-all"
          >
            <c.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">{c.label}</h3>
            <p className="text-xs text-muted-foreground">Coming soon — upload & browse.</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
