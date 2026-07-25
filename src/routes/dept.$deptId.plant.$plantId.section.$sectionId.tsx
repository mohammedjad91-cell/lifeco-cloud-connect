import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Construction, ChevronRight, Search as SearchIcon, ShieldAlert, Activity } from "lucide-react";
import PageShell from "@/components/shell/PageShell";
import { DEPT_STRUCTURE } from "@/lib/dept-structure";
import { getHomeItem, PLANT_SECTIONS } from "@/lib/lifeco-nav";
import { useI18n } from "@/lib/i18n";
import { getDeptBg } from "@/lib/dept-backgrounds";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dept/$deptId/plant/$plantId/section/$sectionId")({
  component: SectionPage,
});

function SectionPage() {
  const { deptId, plantId, sectionId } = useParams({ from: "/dept/$deptId/plant/$plantId/section/$sectionId" });
  const { lang } = useI18n();
  const dept = getHomeItem(deptId);
  const deptLabel = dept ? (lang === "ar" ? dept.labelAr : dept.labelEn) : deptId;
  const plant = (DEPT_STRUCTURE[deptId] || []).find((p) => p.key === plantId);
  const plantLabel = plant?.label ?? plantId;
  const section = PLANT_SECTIONS.find((s) => s.id === sectionId);
  const sectionLabel = section ? (lang === "ar" ? section.labelAr : section.labelEn) : sectionId;
  const bg = getDeptBg(deptId);

  return (
    <PageShell
      bgImage={bg}
      crumbs={[
        { label: lang === "ar" ? "الرئيسية" : "Home", to: "/" },
        { label: deptLabel, to: `/dept/${deptId}` },
        { label: plantLabel, to: `/dept/${deptId}/plant/${plantId}` },
        { label: sectionLabel },
      ]}
      title={`${section?.icon ?? "📄"} ${sectionLabel}`}
      subtitle={`${deptLabel} · ${plantLabel}`}
      showExport
    >
      {sectionId === "equipment" ? (
        <EquipmentSection plantKey={plantId} />
      ) : (
        <PlaceholderSection sectionLabel={sectionLabel} />
      )}
    </PageShell>
  );
}

function PlaceholderSection({ sectionLabel }: { sectionLabel: string }) {
  const { lang } = useI18n();
  return (
    <div className="glass-card neon-border rounded-2xl p-10 text-center">
      <Construction className="w-12 h-12 text-primary mx-auto mb-4" />
      <h3 className="font-display text-xl font-bold mb-2">{sectionLabel}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {lang === "ar"
          ? "هذا القسم قيد التجهيز. سيتم ربطه بمصادر البيانات الفعلية قريباً."
          : "This section is being wired up. It will connect to live data sources soon."}
      </p>
    </div>
  );
}

interface EquipmentRow {
  id: string;
  tag: string;
  name: string;
  type: string | null;
  criticality: string | null;
}

function EquipmentSection({ plantKey }: { plantKey: string }) {
  const { lang } = useI18n();
  const [rows, setRows] = useState<EquipmentRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("equipment")
        .select("id, tag, name, type, criticality, areas!inner(plant_id, plants!inner(code, name))")
        .or(`code.eq.${plantKey},name.eq.${plantKey}`, { referencedTable: "areas.plants" });
      if (alive) {
        setRows(((data as any[]) || []).map((r) => ({
          id: r.id, tag: r.tag, name: r.name, type: r.type, criticality: r.criticality,
        })));
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [plantKey]);

  const filtered = rows.filter(
    (r) => !q || r.tag.toLowerCase().includes(q.toLowerCase()) || r.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 glass-card p-2 rounded-xl">
        <SearchIcon className="w-4 h-4 text-muted-foreground ml-2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === "ar" ? "بحث بالوسم أو الاسم..." : "Search by tag or name..."}
          className="flex-1 bg-transparent outline-none text-sm py-1.5"
        />
        <span className="text-xs text-muted-foreground pr-2">{filtered.length} {lang === "ar" ? "عنصر" : "items"}</span>
      </div>

      {loading ? (
        <div className="glass-card p-8 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center text-muted-foreground">
          {lang === "ar" ? "لا توجد معدات مسجلة لهذا المصنع." : "No equipment registered for this plant yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link
                to="/equipment/$equipmentId"
                params={{ equipmentId: r.id }}
                className="block glass-card neon-border rounded-xl overflow-hidden hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.5)] transition-all group"
              >
                <div className="h-24 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                  <span className="text-4xl opacity-70 group-hover:scale-110 transition-transform">🔩</span>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-primary truncate">{r.tag}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_hsl(142_71%_45%)]" />
                  </div>
                  <div className="text-sm font-medium mt-1 truncate">{r.name}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                    {r.criticality && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <ShieldAlert className="w-3 h-3" />{r.criticality}
                      </span>
                    )}
                    {r.type && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/60">
                        <Activity className="w-3 h-3" />{r.type}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
