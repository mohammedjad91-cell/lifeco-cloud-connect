import { motion } from "framer-motion";
import { Info, ShieldAlert, ArrowRight, Gauge, Layers, Droplets, Activity, FlaskConical, Thermometer, Wind, AlertCircle } from "lucide-react";

interface Props {
  lang: "ar" | "en";
}

export function NitrogenGenerationProcess({ lang }: Props) {
  const isAr = lang === "ar";

  const documentationFields = [
    { label: isAr ? "وصف العملية" : "Process Description", value: "Pending Verification" },
    { label: isAr ? "مصدر هواء التغذية" : "Feed Air Source", value: "60-2003" },
    { label: isAr ? "منتج النيتروجين" : "Nitrogen Product", value: "Pending Verification" },
    { label: isAr ? "وجهة المنتج" : "Product Destination", value: "Pending Verification" },
    { label: isAr ? "ضغط التشغيل" : "Operating Pressure", value: "Pending Verification" },
    { label: isAr ? "حرارة التشغيل" : "Operating Temperature", value: "Pending Verification" },
    { label: isAr ? "نقاء النيتروجين" : "Nitrogen Purity", value: "Pending Verification" },
    { label: isAr ? "التدفق" : "Flow", value: "Pending Verification" },
    { label: isAr ? "الإنذارات" : "Alarms", value: "Pending Verification" },
    { label: isAr ? "التوقف الاضطراري" : "Trips", value: "Pending Verification" },
    { label: isAr ? "الارتباطات المتبادلة" : "Interlocks", value: "Pending Verification" },
  ];

  const operatorMetrics = [
    { label: isAr ? "حالة توليد النيتروجين" : "Nitrogen Generation Status", value: "Pending Verification", icon: <Activity className="w-4 h-4 text-amber-500" /> },
    { label: isAr ? "توفر هواء التغذية" : "Feed Air Available", value: "Pending Verification", icon: <Wind className="w-4 h-4 text-blue-500" /> },
    { label: isAr ? "حالة منتج النيتروجين" : "Product Nitrogen Status", value: "Pending Verification", icon: <Droplets className="w-4 h-4 text-emerald-500" /> },
    { label: isAr ? "الإنذارات الحرجة" : "Critical Alarms", value: "Pending Verification", icon: <AlertCircle className="w-4 h-4 text-red-500" /> },
    { label: isAr ? "التوقفات" : "Trips", value: "Pending Verification", icon: <ShieldAlert className="w-4 h-4 text-red-600" /> },
    { label: isAr ? "حالة المعدات" : "Equipment Status", value: "Pending Verification", icon: <FlaskConical className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-white/10">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <Activity className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
          {isAr ? "عملية توليد النيتروجين" : "NITROGEN GENERATION PROCESS"}
        </h2>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white/80 border-b border-white/5 pb-2">
          1. PROCESS OVERVIEW
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <p className="text-[10px] text-white/40 uppercase mb-1">{isAr ? "مصدر الهواء" : "Feed Air Source"}</p>
            <p className="text-sm font-bold text-primary">60-2003</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] text-white/40 uppercase mb-1">{isAr ? "الخدمة" : "Service"}</p>
            <p className="text-sm font-bold text-amber-500">Nitrogen Generation</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] text-white/40 uppercase mb-1">{isAr ? "معدات توليد النيتروجين" : "Nitrogen Generation Equipment"}</p>
            <p className="text-sm font-bold text-amber-500">Nitrogen PSA Unit</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white/80 border-b border-white/5 pb-2">
          2. PROCESS FLOW PLACEHOLDER
        </h3>
        <div className="flex flex-col items-center justify-center p-8 glass-card border-dashed border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="px-6 py-3 glass-card border-primary/50 bg-primary/5">
              <span className="font-mono text-primary font-bold">60-2003</span>
            </div>
            <ArrowRight className="w-6 h-6 text-white/20 rotate-90" />
            <div className="px-6 py-3 glass-card border-amber-500/50 bg-amber-500/5">
              <span className="font-bold text-amber-500 uppercase tracking-widest text-xs">NITROGEN GENERATION</span>
            </div>
            <ArrowRight className="w-6 h-6 text-white/20 rotate-90" />
            <div className="px-6 py-3 glass-card border-amber-500/50 bg-amber-500/10">
              <span className="text-amber-500 font-bold text-xs">Nitrogen PSA Unit</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white/80 border-b border-white/5 pb-2">
          3. PROCESS DOCUMENTATION
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {documentationFields.map((field, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 glass-card text-xs">
              <span className="text-white/60">{field.label}</span>
              <span className="font-mono text-amber-500/70 italic">{field.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white/80 border-b border-white/5 pb-2">
          4. EQUIPMENT REGISTER
        </h3>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/40 uppercase">
              <tr>
                <th className="p-3 font-bold">{isAr ? "التاج" : "Tag"}</th>
                <th className="p-3 font-bold">{isAr ? "الاسم" : "Name"}</th>
                <th className="p-3 font-bold">{isAr ? "النوع" : "Type"}</th>
                <th className="p-3 font-bold">{isAr ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-3 font-mono text-amber-500">Nitrogen PSA Unit</td>
                <td className="p-3 text-white/80">PSA Nitrogen Generator</td>
                <td className="p-3 text-white/60">PSA Unit</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px]">
                    Pending Verification
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white/80 border-b border-white/5 pb-2">
          5. OPERATOR VIEW
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {operatorMetrics.map((metric, idx) => (
            <div key={idx} className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{metric.label}</span>
                {metric.icon}
              </div>
              <div className="text-lg font-mono text-white/30 italic">
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <h4 className="text-xs font-bold text-red-500 uppercase">{isAr ? "ملاحظات هامة" : "IMPORTANT CONSTRAINTS"}</h4>
        </div>
        <ul className="text-[10px] text-red-500/70 list-disc list-inside space-y-1">
          <li>{isAr ? "ممنوع استخدام PSA-1 كمعدة تشغيلية." : "Do not use PSA-1 as an operational asset."}</li>
          <li>{isAr ? "لا تعد المعدات المؤرشفة للعمل." : "Do not restore archived legacy equipment."}</li>
          <li>{isAr ? "إذا لم يوجد Tag حقيقي للـPSA، استخدم Nitrogen PSA Unit." : "Use 'Nitrogen PSA Unit' if no official tag is found."}</li>
          <li>{isAr ? "كل البيانات غير الموثقة تبقي Pending Verification." : "All unverified data remains 'Pending Verification'."}</li>
        </ul>
      </section>
    </div>
  );
}