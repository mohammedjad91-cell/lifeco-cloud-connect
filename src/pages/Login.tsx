import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "framer-motion";
import { DEPARTMENTS } from "@/lib/departments";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Globe, Factory, FlaskConical, Gauge, Droplets, Wind, Settings, Users, Eye, BarChart3, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import UserCaptureModal from "@/components/UserCaptureModal";
import lifecoLogo from "@/assets/lifeco-logo.png";
import heroPlant from "@/assets/lifeco-hero-1.webp";
import heroWorker from "@/assets/lifeco-hero-2.webp";

const DEPT_ICONS: Record<string, React.ReactNode> = {
  AMM1: <Factory className="w-8 h-8" />,
  AMM2: <Factory className="w-8 h-8" />,
  NITROGEN: <Wind className="w-8 h-8" />,
  DEMIN1: <Droplets className="w-8 h-8" />,
  DEMIN2: <Droplets className="w-8 h-8" />,
  LABORATORY: <FlaskConical className="w-8 h-8" />,
  PLANTVIEW: <Eye className="w-8 h-8" />,
  OPERATIONS: <Users className="w-8 h-8" />,
};

const Login = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingDept, setPendingDept] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const pinPanelRef = useRef<HTMLDivElement>(null);

  // Autofocus hidden input + scroll into view when a department is selected
  useEffect(() => {
    if (selectedDept) {
      setTimeout(() => {
        hiddenInputRef.current?.focus();
        pinPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [selectedDept]);

  const verifyPin = async (deptId: string, enteredPin: string): Promise<boolean> => {
    const fallbackDept = DEPARTMENTS.find((dept) => dept.id === deptId);
    try {
      const { data, error } = await supabase
        .from("department_pins").select("pin").eq("id", deptId).maybeSingle();
      if (!error && data?.pin) return data.pin === enteredPin;
      return fallbackDept?.pin === enteredPin;
    } catch {
      return fallbackDept?.pin === enteredPin;
    }
  };

  const navigateToDept = (deptId: string) => {
    sessionStorage.setItem("lifeco_dept", deptId);
    if (deptId === "LABORATORY") navigate("/lab");
    else if (deptId === "PLANTVIEW") navigate("/plant");
    else navigate("/dashboard");
  };

  const submitPin = (pinValue: string) => {
    if (!selectedDept || pinValue.length !== 4) return;
    setIsVerifying(true);
    verifyPin(selectedDept, pinValue).then((ok) => {
      setIsVerifying(false);
      if (ok) {
        setPendingDept(selectedDept);
      } else {
        setShaking(true);
        setError(lang === "ar" ? "رمز غير صحيح" : "Invalid PIN");
        setTimeout(() => { setPin(""); setShaking(false); }, 600);
      }
    });
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError("");
      if (newPin.length === 4) submitPin(newPin);
    }
  };

  const handleHiddenKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitPin(pin);
    }
  };

  const handleHiddenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(v);
    setError("");
    if (v.length === 4) submitPin(v);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Language Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setLang(lang === "en" ? "ar" : "en")}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm"
      >
        <Globe className="w-4 h-4" />
        {t.language}
      </motion.button>

      {/* Admin Link - prominent settings button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        transition={{ type: "spring", stiffness: 200 }}
        onClick={() => navigate("/admin")}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
        title={lang === "ar" ? "إعدادات المنظومة" : "System Settings"}
        aria-label="Admin Settings"
      >
        <Settings className="w-5 h-5" />
        <span className="font-semibold text-sm md:text-base tracking-wide">{lang === "ar" ? "الإعدادات" : "Admin"}</span>
      </motion.button>

      {/* Live BI Link - public access */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200 }}
        onClick={() => navigate("/bi")}
        className="absolute top-4 left-32 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all shadow-lg"
        title="Live BI"
        aria-label="Live BI Dashboard"
      >
        <BarChart3 className="w-5 h-5" />
        <span className="font-semibold text-sm md:text-base tracking-wide">{lang === "ar" ? "لوحة التحكم" : "Live BI"}</span>
      </motion.button>

      {/* Background — LIFECO hero imagery */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroPlant}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/60" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Header with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-6 pb-3 relative z-10"
      >
        <motion.img
          src={lifecoLogo}
          alt="LIFECO PMS 2026"
          className="mx-auto mb-3 drop-shadow-2xl"
          width={100}
          height={100}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        />
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] tracking-wider">
          {t.lifecoDigital}
        </h1>
        <p className="text-white/90 mt-1 text-xs tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
          {t.opsLoggingSystem}
        </p>
        <p className="text-white/85 mt-2 text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]" dir="rtl">
          إعداد م. محمد جادالله
        </p>
      </motion.div>

      {/* Department Grid */}
      <div className="flex-1 flex items-start justify-center px-4 pb-4 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {DEPARTMENTS.map((dept, i) => (
              <motion.button
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedDept(selectedDept === dept.id ? null : dept.id);
                  setPin("");
                  setError("");
                }}
                className={`glass-card p-4 md:p-6 text-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                  selectedDept === dept.id
                    ? "neon-border ring-1 ring-primary/30"
                    : "hover:neon-border"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dept.color || "from-primary/10 to-primary/5"} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${selectedDept === dept.id ? "!opacity-100" : ""}`} />
                <div className="relative z-10">
                  <div className={`mx-auto mb-3 w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                    selectedDept === dept.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  }`}>
                    {DEPT_ICONS[dept.id] || <Gauge className="w-8 h-8" />}
                  </div>
                  <h3 className={`font-semibold text-sm md:text-base tracking-wide transition-colors ${
                    selectedDept === dept.id ? "text-primary" : "text-foreground"
                  }`}>
                    {dept.label}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.pinRequired}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* PIN Panel */}
          <AnimatePresence>
            {selectedDept && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                className="overflow-hidden"
              >
                <div ref={pinPanelRef} className="glass-card p-6 max-w-sm mx-auto neon-border">
                  <input
                    ref={hiddenInputRef}
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={pin}
                    onChange={handleHiddenChange}
                    onKeyDown={handleHiddenKey}
                    className="absolute opacity-0 w-px h-px"
                    aria-label="PIN entry"
                  />
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium text-sm">
                      {DEPARTMENTS.find(d => d.id === selectedDept)?.label} — {t.enterPin}
                    </span>
                  </div>

                  <motion.div
                    animate={shaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex justify-center gap-3 mb-4"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                          pin.length > i
                            ? "border-primary bg-primary/10 neon-border text-primary"
                            : "border-border bg-secondary/30 text-muted-foreground"
                        }`}
                      >
                        {pin.length > i ? "•" : ""}
                      </div>
                    ))}
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-destructive text-center text-sm mb-3"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((key, idx) => (
                      <div key={idx}>
                        {key === null ? (
                          <div />
                        ) : (
                          <Button
                            variant="secondary"
                            className="w-full h-10 text-lg font-semibold hover:bg-primary/10 hover:text-primary transition-all"
                            onClick={() =>
                              key === "⌫" ? setPin(p => p.slice(0, -1)) : handlePinInput(String(key))
                            }
                          >
                            {key}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <UserCaptureModal
        open={!!pendingDept}
        department={pendingDept || ""}
        onComplete={() => {
          const d = pendingDept;
          setPendingDept(null);
          if (d) navigateToDept(d);
        }}
      />
    </div>
  );
};

export default Login;
