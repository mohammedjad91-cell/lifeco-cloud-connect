import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import PageShell from "@/components/shell/PageShell";
import { DEPT_STRUCTURE } from "@/lib/dept-structure";
import { getHomeItem, PLANT_SECTIONS } from "@/lib/lifeco-nav";
import { useI18n } from "@/lib/i18n";
import { getDeptBg } from "@/lib/dept-backgrounds";

export const Route = createFileRoute("/dept/$deptId/plant/$plantId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.plantId} — LIFECO PMS` },
      { name: "description", content: `Sections and modules for ${params.plantId} plant.` },
    ],
  }),
  component: PlantPage,
});

function PlantPage() {
  const { deptId, plantId } = useParams({ from: "/dept/$deptId/plant/$plantId" });
  const { lang } = useI18n();
  const navigate = useNavigate();
  const dept = getHomeItem(deptId);
  const deptLabel = dept ? (lang === "ar" ? dept.labelAr : dept.labelEn) : deptId;
  const plant = (DEPT_STRUCTURE[deptId] || []).find((p) => p.key === plantId);
  const plantLabel = plant?.label ?? plantId;
  const bg = getDeptBg(deptId);

  return (
    <PageShell
      bgImage={bg}
      crumbs={[
        { label: lang === "ar" ? "الرئيسية" : "Home", to: "/" },
        { label: deptLabel, to: `/dept/${deptId}` },
        { label: plantLabel },
      ]}
      title={`🏭 ${plantLabel}`}
      subtitle={lang === "ar" ? "اختر قسماً وظيفياً" : "Select a functional section"}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        {PLANT_SECTIONS.map((s, i) => {
          const onClick = () => {
            if (s.deepLink) {
              const href = s.deepLink({ deptId, plantId });
              // deep-links go to external non-typed routes (dashboard w/ query)
              window.location.assign(href);
            } else {
              navigate({ to: "/dept/$deptId/plant/$plantId/section/$sectionId", params: { deptId, plantId, sectionId: s.id } });
            }
          };
          return (
            <motion.button
              key={s.id}
              onClick={onClick}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="group glass-card neon-border rounded-xl p-4 text-left hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.5)] hover:border-primary/60 transition-all"
            >
              <div className="text-2xl mb-1.5">{s.icon}</div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-medium truncate">{lang === "ar" ? s.labelAr : s.labelEn}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Original plant module list (from official taxonomy) */}
      {plant && (
        <div className="mt-8">
          <h3 className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-3">
            {lang === "ar" ? "الوحدات الأصلية" : "Native Modules"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {plant.modules.map((m) => (
              <div key={m.key} className="rounded-lg bg-secondary/40 border border-border px-3 py-2.5 text-sm">
                {m.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
