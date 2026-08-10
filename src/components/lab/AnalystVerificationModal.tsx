import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ShieldCheck, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface AnalystVerificationModalProps {
  isOpen: boolean;
  onVerified: (name: string, badge: string) => void;
}

export const AnalystVerificationModal = ({ isOpen, onVerified }: AnalystVerificationModalProps) => {
  const [name, setName] = useState("");
  const [badge, setBadge] = useState("");
  const { toast } = useToast();

  const handleVerify = () => {
    if (!name.trim() || !badge.trim()) {
      toast({
        title: "البيانات ناقصة",
        description: "يرجى إدخال اسم المحلل ورقم البادج للمتابعة.",
        variant: "destructive",
      });
      return;
    }
    
    sessionStorage.setItem("lifeco_analyst_name", name);
    sessionStorage.setItem("lifeco_analyst_badge", badge);
    onVerified(name, badge);
    
    toast({
      title: "تم التحقق",
      description: `مرحباً بك، ${name}. تم تسجيل الدخول للمختبر بنجاح.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[450px] bg-slate-900 border-primary/50 text-white shadow-2xl shadow-primary/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
              <ShieldCheck className="w-7 h-7 text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">
                {""}
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                {""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-6 border-y border-white/10 my-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
              <User className="w-3 h-3 text-primary" /> Analyst Name (اسم المستخدم / المحلل الكيميائي)
            </label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eng. Mohammed Gadallah"
              className="bg-slate-950 border-slate-700 text-white font-bold focus:border-primary focus:ring-1 focus:ring-primary h-12 text-lg"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
              <BadgeCheck className="w-3 h-3 text-primary" /> Employee Badge Number (رقم البادج / الرقم الوظيفي)
            </label>
            <Input 
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. 10455"
              className="bg-slate-950 border-slate-700 text-white font-mono font-bold focus:border-primary focus:ring-1 focus:ring-primary h-12 text-lg tracking-widest"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleVerify}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase py-6 text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              Verify & Grant Access
            </Button>
          </motion.div>
          
          <Button
            variant="ghost"
            onClick={() => {
              const plant = sessionStorage.getItem("lifeco_plant");
              const dept = sessionStorage.getItem("lifeco_dept");
              if (plant) window.location.href = `/modules/${plant}`;
              else if (dept) window.location.href = `/dept/${dept}`;
              else window.location.href = "/";
            }}
            className="w-full text-slate-400 hover:text-white hover:bg-white/5 font-bold uppercase py-4"
          >
            رجوع / Back
          </Button>
        </div>
        
        <p className="text-center text-[9px] text-slate-500 font-mono mt-2 uppercase tracking-tighter">
          All analytical actions are logged under this identity | Protocol V2.1
        </p>
      </DialogContent>
    </Dialog>
  );
};
