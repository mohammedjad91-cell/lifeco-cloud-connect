import { motion } from "framer-motion";
import { Globe, Bell, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { HOME_DEPARTMENTS, HOME_CENTERS } from "@/lib/lifeco-nav";
import { useHomeStats } from "@/lib/home-stats";
import DepartmentCard from "@/components/home/DepartmentCard";
import lifecoLogo from "@/assets/lifeco-logo.png";
import heroPlant from "@/assets/lifeco-hero-1.webp";

export default function Home() {
  const { lang, setLang, t } = useI18n();
  const stats = useHomeStats(HOME_DEPARTMENTS.map((d) => d.id));

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img src={heroPlant} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/90" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 backdrop-blur-md bg-background/40 border-b border-primary/20">
        <div className="max-w-[1600px] mx-auto px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img src={lifecoLogo} alt="LIFECO" width={40} height={40} className="drop-shadow-lg" />
            <div className="min-w-0">
              <div className="font-display font-bold text-lg neon-text tracking-wider truncate">{t.lifecoDigital}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">Digital Transformation Platform</div>
            </div>
          </div>
          <div />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border text-sm"
            >
              <Globe className="w-4 h-4" /> <span className="hidden sm:inline">{t.language}</span>
            </button>
            <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border relative">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero title */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 pt-8 pb-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wider"
        >
          🏢 LIFECO Digital Transformation Platform
        </motion.h1>
        <p className="text-white/80 mt-2 text-sm">Prepared by Eng. Mohamed Gadalla</p>
      </section>

      {/* Departments */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 py-4">
        <SectionHeader
          en="Operational Departments"
          ar="الأقسام التشغيلية"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {HOME_DEPARTMENTS.map((d, i) => (
            <DepartmentCard key={d.id} item={d} stats={stats[d.id]} index={i} />
          ))}
        </div>
      </section>

      {/* Centers */}
      <section className="relative z-10 max-w-[1600px] mx-auto px-4 py-6">
        <SectionHeader
          en="Command Centers"
          ar="مراكز التحكم"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {HOME_CENTERS.map((c, i) => (
            <DepartmentCard key={c.id} item={c} index={i} />
          ))}
        </div>
      </section>

      <footer className="relative z-10 text-center py-6 text-xs text-muted-foreground">
        © LIFECO 2026 — {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
      </footer>
    </div>
  );
}

function SectionHeader({ en, ar }: { en: string; ar: string }) {
  const { lang } = useI18n();
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <h2 className="font-display text-sm md:text-base uppercase tracking-[0.3em] text-primary">
        {lang === "ar" ? ar : en}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}
