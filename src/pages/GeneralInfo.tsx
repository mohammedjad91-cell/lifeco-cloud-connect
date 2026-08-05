import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useNavigate } from "@/lib/router-compat";
import { 
  ArrowLeft, Search, Info, Shield, Phone, Activity, 
  Loader2, AlertCircle, FileText, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface GeneralInfoItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  icon: string | null;
  created_at: string | null;
}

const ICON_MAP: Record<string, any> = {
  building: Info,
  shield: Shield,
  phone: Phone,
  activity: Activity,
  corporate: Info,
  safety: Shield,
  emergency: Phone,
  operations: Activity,
};

const GeneralInfo = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState<GeneralInfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("general_information")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setItems(data || []);
    } catch (err: any) {
      console.error("Error fetching general info:", err);
      setError(lang === "ar" ? "فشل تحميل المعلومات العامة" : "Failed to load general information");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (iconName: string | null, category: string) => {
    const IconComponent = ICON_MAP[iconName?.toLowerCase() || ""] || 
                         ICON_MAP[category?.toLowerCase() || ""] || 
                         FileText;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Header */}
      <div className="glass-card sticky top-0 z-50 px-4 py-4 border-b border-white/10 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/")}
          className="hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold font-display">
          {lang === "ar" ? "المعلومات العامة" : "General Information"}
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={lang === "ar" ? "بحث في المعلومات..." : "Search information..."}
            className="pl-10 h-12 bg-white/5 border-white/10 focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* State Handling */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">
                {lang === "ar" ? "جاري تحميل المعلومات..." : "Loading information..."}
              </p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-xl font-bold mb-2">{error}</p>
              <Button onClick={fetchInfo} variant="outline">
                {lang === "ar" ? "إعادة المحاولة" : "Retry"}
              </Button>
            </motion.div>
          ) : filteredItems.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Info className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-xl font-bold text-muted-foreground">
                {lang === "ar" ? "لا توجد معلومات للعرض" : "No general information to display"}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="link" className="mt-2">
                  {lang === "ar" ? "مسح البحث" : "Clear search"}
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="glass-card overflow-hidden hover:neon-border transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {getIcon(item.icon, item.category || "General")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-bold truncate pr-2">
                            {item.title}
                          </h3>
                          {item.category && (
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[10px] uppercase tracking-wider">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GeneralInfo;