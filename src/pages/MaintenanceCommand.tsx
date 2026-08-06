import React from "react";
import { useNavigate } from "@/lib/router-compat";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Inbox, Hammer, ShieldCheck, History as HistoryIcon, LayoutDashboard, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import MaintenanceManagement from "@/components/maintenance/MaintenanceManagement";
import { motion } from "framer-motion";

const MaintenanceCommand = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  
  return (
    <div className="min-h-screen bg-[#050b18] p-4 md:p-8 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate("/dept/MAINTENANCE")} 
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 
            {lang === "ar" ? "رجوع لإدارة الصيانة" : "Back to Maintenance Dept"}
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10" 
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="w-4 h-4" />
              {lang === "ar" ? "لوحة التحكم" : "Live Dashboard"}
            </Button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border border-white/10 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                 <Inbox className="w-8 h-8 text-amber-500" />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                    {lang === "ar" ? "مركز قيادة الصيانة" : "Maintenance Command Center"}
                  </h1>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    {lang === "ar" 
                      ? "استقبال ومراجعة وتكليف جميع طلبات العمل من كافة المصانع" 
                      : "Receive, Review & Assign All Work Requests From All Plants"}
                  </p>
               </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">System Live</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar / Stats / Teams */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-2">
                  {lang === "ar" ? "تخطيط الصيانة" : "Maintenance Planning"}
                </h2>
                <div className="space-y-3">
                  {[
                    { label: lang === "ar" ? "ورشة الميكانيكا" : "Mechanical Workshop", icon: Hammer, status: lang === "ar" ? "فريق نشط" : "Active Team", onClick: () => {} },
                    { label: lang === "ar" ? "ورشة الكهرباء" : "Electrical Workshop", icon: ShieldCheck, status: lang === "ar" ? "فريق نشط" : "Active Team", onClick: () => {} },
                    { label: lang === "ar" ? "صيانة المعدات" : "Equipment Maintenance", icon: Cog, status: lang === "ar" ? "إدارة الأسطول" : "Fleet Management", onClick: () => navigate("/dashboard") },
                  ].map((team, i) => (
                    <button 
                      key={i} 
                      onClick={team.onClick}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 hover:border-primary/30 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <team.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase leading-none">{team.label}</p>
                        <p className="text-[9px] text-muted-foreground uppercase mt-1 tracking-tighter">{team.status}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang === "ar" ? "حالة النظام" : "System Status"}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase">
                  {lang === "ar" ? "جميع الاتصالات تعمل بشكل مستقر" : "All connections operating stable"}
                </p>
              </div>
            </div>

            {/* Main Content Area - Incoming Requests */}
            <div className="lg:col-span-3 space-y-6">
              <div className="relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-[#050b18] border border-white/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest z-10">
                  {lang === "ar" ? "تدفق الطلبات المركزي" : "Central Incoming Flow"}
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <MaintenanceManagement />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceCommand;