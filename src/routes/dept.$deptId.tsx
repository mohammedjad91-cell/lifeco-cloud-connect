import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Layers, Wrench } from "lucide-react";
import PageShell from "@/components/shell/PageShell";
import { DEPT_STRUCTURE } from "@/lib/dept-structure";
import { getHomeItem } from "@/lib/lifeco-nav";
import { useI18n } from "@/lib/i18n";
import { getDeptBg } from "@/lib/dept-backgrounds";

export const Route = createFileRoute("/dept/$deptId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.deptId} — LIFECO PMS` },
      { name: "description", content: `Plants and areas under the ${params.deptId} department.` },
    ],
  }),
  component: DepartmentPage,
});

function DepartmentPage() {
  const { deptId } = useParams({ from: "/dept/$deptId" });
  const { lang } = useI18n();
  const item = getHomeItem(deptId);
  const plants = DEPT_STRUCTURE[deptId] || [];
  const bg = getDeptBg(deptId);
  const label = item ? (lang === "ar" ? item.labelAr : item.labelEn) : deptId;

  return (
    <PageShell
      bgImage={bg}
      crumbs={[
        { label: lang === "ar" ? "الرئيسية" : "Home", to: "/" },
        { label },
      ]}
      title={`${item?.icon ?? "🏭"} ${label}`}
      subtitle={lang === "ar" ? "اختر مصنعاً / منطقة" : "Select a plant or area"}
    >
      {plants.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted-foreground">
          {lang === "ar" ? "لا توجد مصانع مضافة بعد لهذا القسم." : "No plants configured for this department yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to="/dept/$deptId/plant/$plantId"
                params={{ deptId, plantId: p.key }}
                className="block group glass-card neon-border rounded-2xl overflow-hidden hover:shadow-[0_0_32px_-6px_hsl(var(--primary)/0.55)] transition-all"
              >
                <div className="relative h-36 bg-gradient-to-br from-primary/20 to-primary/5">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-70 group-hover:scale-110 transition-transform">🏭</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-base truncate">{p.label}</h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{p.modules.length} {lang === "ar" ? "وحدة" : "modules"}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_hsl(142_71%_45%)]" />
                    <span className="uppercase tracking-widest">{lang === "ar" ? "متصل" : "Online"}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
