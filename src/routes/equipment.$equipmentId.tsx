import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, FileText, FileSpreadsheet, Mail, MessageCircle, Printer } from "lucide-react";
import PageShell from "@/components/shell/PageShell";
import { EQUIPMENT_TABS } from "@/lib/lifeco-nav";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/equipment/$equipmentId")({
  component: EquipmentProfilePage,
});

interface EquipmentDetail {
  id: string;
  tag: string;
  name: string;
  type: string | null;
  description: string | null;
  criticality: string | null;
  area_id: string;
}

function EquipmentProfilePage() {
  const { equipmentId } = useParams({ from: "/equipment/$equipmentId" });
  const { lang } = useI18n();
  const [eq, setEq] = useState<EquipmentDetail | null>(null);
  const [tab, setTab] = useState<string>("general");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("equipment")
        .select("id, tag, name, type, description, criticality, area_id")
        .eq("id", equipmentId)
        .maybeSingle();
      if (alive && data) setEq(data as EquipmentDetail);
    })();
    return () => { alive = false; };
  }, [equipmentId]);

  const name = eq?.name ?? "Equipment";
  const tag = eq?.tag ?? equipmentId.slice(0, 8);

  const shareText = `${name} (${tag}) — LIFECO PMS`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <PageShell
      crumbs={[
        { label: lang === "ar" ? "الرئيسية" : "Home", to: "/" },
        { label: lang === "ar" ? "المعدات" : "Equipment" },
        { label: tag },
      ]}
      title={`🔩 ${name}`}
      subtitle={`${lang === "ar" ? "الوسم" : "Tag"}: ${tag}`}
      right={
        <div className="flex flex-wrap items-center gap-1.5">
          <ActionBtn icon={<FileText className="w-4 h-4" />} label="PDF" onClick={() => window.print()} />
          <ActionBtn icon={<FileSpreadsheet className="w-4 h-4" />} label="Excel" onClick={() => exportCsv(eq)} />
          <ActionBtn icon={<Download className="w-4 h-4" />} label="Word" onClick={() => exportDoc(eq)} />
          <ActionBtn
            icon={<MessageCircle className="w-4 h-4" />} label="WhatsApp"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank")}
          />
          <ActionBtn
            icon={<Mail className="w-4 h-4" />} label="Email"
            onClick={() => window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`)}
          />
          <ActionBtn icon={<Printer className="w-4 h-4" />} label="Print" onClick={() => window.print()} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-4">
        {/* Tab rail */}
        <div className="glass-card neon-border rounded-xl p-2 h-fit lg:sticky lg:top-24">
          <ul className="space-y-0.5">
            {EQUIPMENT_TABS.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    tab === t.id
                      ? "bg-primary/15 text-primary border border-primary/40"
                      : "hover:bg-secondary/60 border border-transparent"
                  }`}
                >
                  {lang === "ar" ? t.labelAr : t.labelEn}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card neon-border rounded-xl p-6 min-h-[380px]"
        >
          {tab === "general" ? (
            <GeneralInfo eq={eq} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">
                {lang === "ar"
                  ? "هذا القسم قيد الإعداد. سيتم تعبئته بالبيانات قريباً."
                  : "This tab is being populated. Data will appear here soon."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </PageShell>
  );
}

function GeneralInfo({ eq }: { eq: EquipmentDetail | null }) {
  const { lang } = useI18n();
  if (!eq) return <div className="text-center text-muted-foreground py-12">Loading…</div>;
  const rows: [string, string, string][] = [
    [lang === "ar" ? "الاسم" : "Name", eq.name, ""],
    [lang === "ar" ? "الوسم" : "Tag Number", eq.tag, "font-mono text-primary"],
    [lang === "ar" ? "النوع" : "Type", eq.type ?? "—", ""],
    [lang === "ar" ? "الحرجية" : "Criticality", eq.criticality ?? "—", ""],
    [lang === "ar" ? "الوصف" : "Description", eq.description ?? "—", ""],
  ];
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold neon-text tracking-wider">
        {lang === "ar" ? "المعلومات العامة" : "General Information"}
      </h3>
      <div className="divide-y divide-border">
        {rows.map(([k, v, cls]) => (
          <div key={k} className="grid grid-cols-[160px_minmax(0,1fr)] gap-3 py-2.5 text-sm">
            <div className="text-muted-foreground">{k}</div>
            <div className={cls}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border text-xs"
    >
      {icon}<span className="hidden md:inline">{label}</span>
    </button>
  );
}

function exportCsv(eq: EquipmentDetail | null) {
  if (!eq) return;
  const csv = `Field,Value\nName,${eq.name}\nTag,${eq.tag}\nType,${eq.type ?? ""}\nCriticality,${eq.criticality ?? ""}\nDescription,"${(eq.description ?? "").replace(/"/g, '""')}"\n`;
  downloadBlob(csv, `${eq.tag}.csv`, "text/csv");
}

function exportDoc(eq: EquipmentDetail | null) {
  if (!eq) return;
  const html = `<html><body><h1>${eq.name}</h1><p><b>Tag:</b> ${eq.tag}</p><p><b>Type:</b> ${eq.type ?? "—"}</p><p><b>Criticality:</b> ${eq.criticality ?? "—"}</p><p>${eq.description ?? ""}</p></body></html>`;
  downloadBlob(html, `${eq.tag}.doc`, "application/msword");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
