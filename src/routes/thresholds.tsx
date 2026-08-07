import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ThresholdsManager } from "@/components/thresholds/ThresholdsManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/thresholds")({
  head: () => ({
    meta: [
      { title: "Alert Thresholds — LIFECO PMS" },
      { name: "description", content: "Manage safety and operational alert thresholds for plant equipment." },
    ],
  }),
  component: ThresholdsPage,
});

function ThresholdsPage() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  
  return (
    <div className="min-h-screen bg-[#050b18] p-4 md:p-8 flex flex-col items-center">
       <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()} 
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 
            {lang === "ar" ? "رجوع" : "Back"}
          </Button>
          
          <div className="flex items-center gap-3">
             <AlertCircle className="w-8 h-8 text-primary" />
             <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                  {lang === "ar" ? "حدود التنبيهات" : "Alert Thresholds"}
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  {lang === "ar" ? "إدارة حدود السلامة للمعدات" : "Manage Equipment Safety Limits"}
                </p>
             </div>
          </div>
        </div>

        <div className="glass-card p-8 border border-white/10 shadow-2xl">
          <ThresholdsManager />
        </div>
      </div>
    </div>
  );
}
