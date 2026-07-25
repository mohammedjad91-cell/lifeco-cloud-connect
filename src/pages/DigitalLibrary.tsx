import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, BookOpen, FileText, FileImage, Video, FileCode,
  Wrench, FlaskConical, ClipboardList, Search, Upload, Star,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LibraryUploadDialog from "@/components/LibraryUploadDialog";

interface Category {
  key: string;
  label: string;
  labelAr: string;
  icon: React.ElementType;
  gradient: string;
  count?: number;
}

const CATEGORIES: Category[] = [
  { key: "manuals",    label: "Manuals",              labelAr: "الأدلة",              icon: BookOpen,      gradient: "from-cyan-500/20 to-blue-500/10" },
  { key: "datasheets", label: "Datasheets",           labelAr: "الجداول الفنية",       icon: FileText,      gradient: "from-emerald-500/20 to-teal-500/10" },
  { key: "pfd",        label: "PFD Library",          labelAr: "مكتبة PFD",           icon: FileCode,      gradient: "from-violet-500/20 to-indigo-500/10" },
  { key: "pid",        label: "P&ID Library",         labelAr: "مكتبة P&ID",          icon: FileCode,      gradient: "from-fuchsia-500/20 to-pink-500/10" },
  { key: "sop",        label: "SOP & Procedures",     labelAr: "إجراءات التشغيل",     icon: ClipboardList, gradient: "from-amber-500/20 to-orange-500/10" },
  { key: "maintenance",label: "Maintenance Guides",   labelAr: "أدلة الصيانة",        icon: Wrench,        gradient: "from-red-500/20 to-rose-500/10" },
  { key: "lab",        label: "Lab References",       labelAr: "مراجع المختبر",       icon: FlaskConical,  gradient: "from-lime-500/20 to-green-500/10" },
  { key: "photos",     label: "Photo Archive",        labelAr: "أرشيف الصور",         icon: FileImage,     gradient: "from-sky-500/20 to-cyan-500/10" },
  { key: "videos",     label: "Video Library",        labelAr: "مكتبة الفيديو",       icon: Video,         gradient: "from-purple-500/20 to-violet-500/10" },
];

const DigitalLibrary = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [search, setSearch] = useState("");

  const filtered = CATEGORIES.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.label.toLowerCase().includes(q) || c.labelAr.includes(search);
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 py-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/")}
          className="bg-white/10 border border-white/30 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {lang === "ar" ? "الرئيسية" : "Home"}
        </Button>
        <Button className="bg-primary/90 hover:bg-primary text-primary-foreground">
          <Upload className="w-4 h-4 mr-2" />
          {lang === "ar" ? "رفع ملف" : "Upload"}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-4 pb-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 justify-center">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wider">
            {lang === "ar" ? "المكتبة الرقمية" : "Digital Library"}
          </h1>
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
        </div>
        <p className="text-white/85 mt-2 text-sm tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          {lang === "ar" ? "قسم الأمونيا — الوثائق والمراجع" : "Ammonia Department — Docs & References"}
        </p>
      </motion.div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={lang === "ar" ? "ابحث في المكتبة..." : "Search library..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div className="flex-1 px-4 pb-10 relative z-10">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-5 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden hover:neon-border"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="mx-auto mb-3 w-14 h-14 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-base tracking-wide text-foreground group-hover:text-primary transition-colors">
                    {lang === "ar" ? c.labelAr : c.label}
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30">
                    <span className="text-[11px] uppercase tracking-widest text-primary font-mono">
                      {c.count ?? 0} {lang === "ar" ? "ملف" : "files"}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DigitalLibrary;
