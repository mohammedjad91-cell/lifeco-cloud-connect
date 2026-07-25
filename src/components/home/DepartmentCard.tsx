import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { HomeItem } from "@/lib/lifeco-nav";
import { DeptStats } from "@/lib/home-stats";
import { getDeptBg } from "@/lib/dept-backgrounds";
import { Factory, Users, Wrench, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Props {
  item: HomeItem;
  stats?: DeptStats;
  index?: number;
}

const STATUS_COLOR: Record<string, string> = {
  green: "bg-emerald-500 shadow-[0_0_10px_hsl(142_71%_45%)]",
  amber: "bg-amber-500 shadow-[0_0_10px_hsl(43_96%_56%)]",
  red:   "bg-red-500 shadow-[0_0_10px_hsl(0_84%_60%)]",
};

export default function DepartmentCard({ item, stats, index = 0 }: Props) {
  const { lang } = useI18n();
  const bg = item.kind === "department" ? getDeptBg(item.id) : null;
  const label = lang === "ar" ? item.labelAr : item.labelEn;
  const s = stats ?? { plants: 0, equipment: 0, activeUsers: 0, openTasks: 0, status: "green" as const };

  const to = item.kind === "center" ? item.href! : `/dept/${item.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link
        to={to}
        className="block glass-card neon-border overflow-hidden hover:shadow-[0_0_32px_-6px_hsl(var(--primary)/0.6)] transition-all rounded-2xl"
      >
        {/* Media */}
        <div className="relative h-32 overflow-hidden">
          {bg ? (
            <img src={bg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[s.status]}`} />
            <span className="text-[10px] text-white uppercase tracking-widest">
              {s.status === "green" ? (lang === "ar" ? "طبيعي" : "Normal") : s.status === "amber" ? (lang === "ar" ? "تنبيه" : "Alert") : (lang === "ar" ? "حرج" : "Critical")}
            </span>
          </div>
          <div className="absolute top-2 left-2 text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">{item.icon}</div>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-semibold text-base tracking-wide truncate">{label}</h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          {item.kind === "department" ? (
            <div className="grid grid-cols-4 gap-2 text-center">
              <Stat icon={<Factory className="w-3.5 h-3.5" />} value={s.plants} label={lang === "ar" ? "مصانع" : "Plants"} />
              <Stat icon={<Wrench className="w-3.5 h-3.5" />} value={s.equipment} label={lang === "ar" ? "معدات" : "Equip."} />
              <Stat icon={<Users className="w-3.5 h-3.5" />} value={s.activeUsers} label={lang === "ar" ? "نشط" : "Active"} />
              <Stat value={s.openTasks} label={lang === "ar" ? "مهام" : "Open"} highlight={s.openTasks > 0} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {lang === "ar" ? "افتح المركز" : "Open center"}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function Stat({ icon, value, label, highlight }: { icon?: React.ReactNode; value: number; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg py-1.5 px-1 ${highlight ? "bg-amber-500/10 border border-amber-500/30" : "bg-secondary/40 border border-border"}`}>
      <div className="flex items-center justify-center gap-1 text-primary">
        {icon}
        <span className={`font-bold text-sm ${highlight ? "text-amber-400" : "text-foreground"}`}>{value}</span>
      </div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
