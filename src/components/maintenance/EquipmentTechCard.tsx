import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getOperator, getStamp } from "@/lib/session";
import type { AmmoniaEquipment } from "@/lib/ammonia-equipment";
import {
  Gauge, Thermometer, Waves, FlaskConical, CalendarClock, Droplets, Zap,
  Package, Send, Loader2,
} from "lucide-react";

/** Technical parameters panel — بطاقة وصف المعدة */
export function TechSpecPanel({ spec, ar }: { spec: AmmoniaEquipment; ar: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-primary/50 text-primary">{spec.subsystem}</Badge>
        <Badge variant="outline" className="border-white/20 text-white/80">{spec.type}</Badge>
        <span className="text-xs text-white/60">{spec.nameAr}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SpecRow icon={<Gauge className="w-4 h-4" />} label={ar ? "ضغط التصميم / التشغيل" : "Design / Operating Pressure"}
          value={`${spec.designPressureBar} bar (design) • ${spec.operatingPressureBar} bar (operating)`} />
        <SpecRow icon={<Thermometer className="w-4 h-4" />} label={ar ? "درجة حرارة التشغيل" : "Operating Temperature"}
          value={`${spec.operatingTempC} °C`} />
        <SpecRow icon={<Waves className="w-4 h-4" />} label={ar ? "معدل التدفق / السعة" : "Flow Rate / Capacity"}
          value={spec.flowRate} />
        <SpecRow icon={<FlaskConical className="w-4 h-4" />} label={ar ? "نوع الحفاز" : "Catalyst Type"}
          value={spec.catalyst || (ar ? "لا ينطبق" : "Not applicable")} />
        <SpecRow icon={<CalendarClock className="w-4 h-4" />} label={ar ? "دورية الصيانة الموصى بها" : "Recommended Maintenance Interval"}
          value={spec.maintenanceInterval} />
        <SpecRow icon={<Droplets className="w-4 h-4" />} label={ar ? "الزيوت / الشحوم" : "Lubricant Specification"}
          value={spec.lubricant} />
        <SpecRow icon={<Zap className="w-4 h-4" />} label={ar ? "المواصفات الكهربائية" : "Electrical Specification"}
          value={spec.electrical} />
        <SpecRow icon={<Package className="w-4 h-4" />} label={ar ? "الشركة المصنعة" : "Manufacturer"}
          value={spec.manufacturer} />
      </div>

      <div className="glass-card p-3">
        <div className="text-[10px] uppercase tracking-widest text-white/50">
          {ar ? "ملاحظات تشغيلية" : "Operating Notes"}
        </div>
        <p className="text-sm text-white/85 mt-1">{spec.notes}</p>
      </div>
    </div>
  );
}

function SpecRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50">
        <span className="text-primary">{icon}</span>
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <div className="text-sm text-white mt-1 break-words">{value}</div>
    </div>
  );
}

interface StockRow { id: string; part_no: string; name: string; uom: string | null; stock_qty: number; min_qty: number }

/** Electronic spare-parts requisition for a specific ammonia tag. */
export function SparesRequisition({ spec, ar }: { spec: AmmoniaEquipment; ar: boolean }) {
  const { toast } = useToast();
  const [stock, setStock] = useState<Record<string, StockRow>>({});
  const [qty, setQty] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("spare_parts")
        .select("id,part_no,name,uom,stock_qty,min_qty")
        .in("part_no", spec.spares.map((s) => s.partNo));
      if (!active) return;
      const map: Record<string, StockRow> = {};
      (data as StockRow[] | null)?.forEach((r) => { map[r.part_no] = r; });
      setStock(map);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [spec.tag]);

  const request = async (partNo: string, fallbackQty: number) => {
    const row = stock[partNo];
    if (!row) {
      toast({ title: ar ? "القطعة غير مسجلة في المخزن" : "Part not registered in inventory", variant: "destructive" });
      return;
    }
    const amount = Number(qty[partNo] || fallbackQty);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: ar ? "أدخل كمية صحيحة" : "Enter a valid quantity", variant: "destructive" });
      return;
    }
    setBusy(partNo);
    const stamp = getStamp(getOperator());
    const { error } = await supabase.from("material_issues").insert({
      spare_id: row.id,
      qty: amount,
      issued_by: `${stamp.formatted} • ${spec.tag}`,
    });
    setBusy(null);
    if (error) {
      toast({ title: ar ? "فشل إرسال الطلب" : "Requisition failed", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("activity_logs").insert({
      action: "spare_requisition",
      department: "AMMONIA",
      details: `${spec.tag} — ${row.part_no} × ${amount} ${row.uom || ""} — ${stamp.formatted}`,
    });
    toast({
      title: ar ? "تم إرسال طلب الصرف" : "Requisition submitted",
      description: `${row.part_no} × ${amount} — ${spec.tag}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-white/60">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />{ar ? "تحميل المخزون…" : "Loading inventory…"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-white/60">
        {ar
          ? "قطع الغيار الموصى بها لهذه المعدة — أدخل الكمية واضغط طلب لإرسال طلب صرف إلكتروني."
          : "Recommended spares for this tag — enter a quantity and submit an electronic requisition."}
      </p>
      {spec.spares.map((s) => {
        const row = stock[s.partNo];
        const low = row ? Number(row.stock_qty) <= Number(row.min_qty) : false;
        return (
          <div key={s.partNo} className="glass-card p-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">{s.partNo}</span>
                {row && (
                  <Badge variant="outline" className={low
                    ? "text-[10px] border-red-500/40 text-red-300"
                    : "text-[10px] border-emerald-500/40 text-emerald-300"}>
                    {ar ? "المخزون" : "Stock"}: {row.stock_qty} {row.uom || ""}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-white truncate">{s.name}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                aria-label={`${ar ? "الكمية" : "Quantity"} ${s.partNo}`}
                value={qty[s.partNo] ?? String(s.typicalQty)}
                onChange={(e) => setQty((p) => ({ ...p, [s.partNo]: e.target.value }))}
                inputMode="decimal"
                className="w-20 h-9 bg-white/10 border-white/20 text-white"
              />
              <Button size="sm" disabled={busy === s.partNo} onClick={() => request(s.partNo, s.typicalQty)}>
                {busy === s.partNo
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Send className="w-3.5 h-3.5 mr-1" />{ar ? "طلب" : "Request"}</>}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
