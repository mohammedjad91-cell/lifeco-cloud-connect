import { ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Bell, User, Search, Printer, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import lifecoLogo from "@/assets/lifeco-logo.png";

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  crumbs: Crumb[];
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onSearch?: (q: string) => void;
  showExport?: boolean;
  children: ReactNode;
  bgImage?: string | null;
}

export default function PageShell({
  crumbs, title, subtitle, right, onSearch, showExport, children, bgImage,
}: Props) {
  const router = useRouter();
  const { lang, setLang } = useI18n();

  return (
    <div className="min-h-screen bg-background relative">
      {bgImage && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/80" />
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-primary/20">
        <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-sm shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === "ar" ? "رجوع" : "Back"}</span>
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={lifecoLogo} alt="LIFECO" width={28} height={28} />
            <span className="font-display font-bold text-sm neon-text tracking-wider hidden md:inline">LIFECO PMS</span>
          </Link>

          <nav className="flex-1 min-w-0 overflow-x-auto">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c.to ? (
                    <Link to={c.to} className="hover:text-primary transition-colors">{c.label}</Link>
                  ) : (
                    <span className="text-foreground font-medium">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span className="opacity-50">›</span>}
                </li>
              ))}
            </ol>
          </nav>

          {onSearch && (
            <div className="hidden md:flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2 py-1.5">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                placeholder={lang === "ar" ? "بحث..." : "Search..."}
                onChange={(e) => onSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-40"
              />
            </div>
          )}

          {showExport && (
            <div className="hidden md:flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-secondary" title="Export"><Download className="w-4 h-4" /></button>
              <button onClick={() => window.print()} className="p-1.5 rounded-lg hover:bg-secondary" title="Print"><Printer className="w-4 h-4" /></button>
            </div>
          )}

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border"
            title="Language"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border relative" title="Notifications">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border" title="User">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Page header */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 pt-6 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
        >
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold neon-text tracking-wider truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 pb-10">{children}</div>
    </div>
  );
}
