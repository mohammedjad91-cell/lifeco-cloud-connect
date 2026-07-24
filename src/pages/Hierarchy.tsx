import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Factory, MapPin, Wrench, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DEPARTMENTS } from "@/lib/departments";

interface Plant { id: string; department_key: string; name: string; code: string | null; }
interface Area { id: string; plant_id: string; name: string; code: string | null; }
interface Equipment { id: string; area_id: string; tag: string; name: string; type: string | null; criticality: string | null; }

const Hierarchy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // New plant
  const [pDept, setPDept] = useState("");
  const [pName, setPName] = useState("");
  const [pCode, setPCode] = useState("");

  // New area (per plant)
  const [aInputs, setAInputs] = useState<Record<string, { name: string; code: string }>>({});
  // New equipment (per area)
  const [eInputs, setEInputs] = useState<Record<string, { tag: string; name: string; type: string }>>({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [p, a, e] = await Promise.all([
      supabase.from("plants").select("*").order("created_at"),
      supabase.from("areas").select("*").order("created_at"),
      supabase.from("equipment").select("*").order("created_at"),
    ]);
    if (p.data) setPlants(p.data as Plant[]);
    if (a.data) setAreas(a.data as Area[]);
    if (e.data) setEquipment(e.data as Equipment[]);
  };

  const toggle = (id: string) => setExpanded(s => ({ ...s, [id]: !s[id] }));

  const addPlant = async () => {
    if (!pDept || !pName.trim()) {
      toast({ title: "أدخل الإدارة والاسم", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("plants").insert({ department_key: pDept, name: pName.trim(), code: pCode.trim() || null });
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    setPName(""); setPCode("");
    toast({ title: "تمت إضافة المصنع" });
    fetchAll();
  };

  const delPlant = async (id: string) => {
    if (!confirm("حذف المصنع وكل ما يتبعه؟")) return;
    await supabase.from("plants").delete().eq("id", id);
    fetchAll();
  };

  const addArea = async (plantId: string) => {
    const v = aInputs[plantId];
    if (!v?.name?.trim()) return toast({ title: "أدخل اسم المنطقة", variant: "destructive" });
    const { error } = await supabase.from("areas").insert({ plant_id: plantId, name: v.name.trim(), code: v.code?.trim() || null });
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    setAInputs(s => ({ ...s, [plantId]: { name: "", code: "" } }));
    fetchAll();
  };

  const delArea = async (id: string) => {
    if (!confirm("حذف المنطقة؟")) return;
    await supabase.from("areas").delete().eq("id", id);
    fetchAll();
  };

  const addEquipment = async (areaId: string) => {
    const v = eInputs[areaId];
    if (!v?.tag?.trim() || !v?.name?.trim()) return toast({ title: "أدخل الوسم والاسم", variant: "destructive" });
    const { error } = await supabase.from("equipment").insert({
      area_id: areaId, tag: v.tag.trim(), name: v.name.trim(), type: v.type?.trim() || null,
    });
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    setEInputs(s => ({ ...s, [areaId]: { tag: "", name: "", type: "" } }));
    fetchAll();
  };

  const delEquipment = async (id: string) => {
    if (!confirm("حذف المعدة؟")) return;
    await supabase.from("equipment").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> رجوع
          </Button>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
            التسلسل الهرمي — المصانع والمناطق والمعدات
          </h1>
          <div className="w-20" />
        </div>

        {/* Add Plant */}
        <div className="glass-card p-4 md:p-6 neon-border">
          <div className="flex items-center gap-2 mb-4">
            <Factory className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">إضافة مصنع جديد</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={pDept} onValueChange={setPDept}>
              <SelectTrigger><SelectValue placeholder="الإدارة" /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="اسم المصنع" value={pName} onChange={e => setPName(e.target.value)} />
            <Input placeholder="الرمز (اختياري)" value={pCode} onChange={e => setPCode(e.target.value)} />
            <Button onClick={addPlant} className="gap-2"><Plus className="w-4 h-4" /> إضافة</Button>
          </div>
        </div>

        {/* Tree */}
        <div className="space-y-3">
          {plants.length === 0 && (
            <div className="glass-card p-8 text-center text-muted-foreground">
              لا توجد مصانع بعد. ابدأ بإضافة مصنع أعلاه.
            </div>
          )}

          {plants.map(plant => {
            const plantAreas = areas.filter(a => a.plant_id === plant.id);
            const dept = DEPARTMENTS.find(d => d.id === plant.department_key);
            const isOpen = expanded[plant.id] ?? true;
            return (
              <motion.div key={plant.id} layout className="glass-card p-4 neon-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => toggle(plant.id)} className="p-1 hover:bg-primary/10 rounded">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <Factory className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-base">{plant.name}</span>
                  {plant.code && <span className="text-xs text-muted-foreground">({plant.code})</span>}
                  <span className="ml-auto text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {dept?.label || plant.department_key}
                  </span>
                  <span className="text-xs text-muted-foreground">{plantAreas.length} منطقة</span>
                  <Button size="sm" variant="ghost" onClick={() => delPlant(plant.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pl-6 border-l-2 border-primary/20 space-y-3 overflow-hidden"
                    >
                      {/* Add Area */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input
                          placeholder="اسم المنطقة"
                          value={aInputs[plant.id]?.name || ""}
                          onChange={e => setAInputs(s => ({ ...s, [plant.id]: { ...(s[plant.id] || { code: "" }), name: e.target.value } }))}
                        />
                        <Input
                          placeholder="الرمز"
                          value={aInputs[plant.id]?.code || ""}
                          onChange={e => setAInputs(s => ({ ...s, [plant.id]: { ...(s[plant.id] || { name: "" }), code: e.target.value } }))}
                        />
                        <Button onClick={() => addArea(plant.id)} variant="secondary" className="gap-2 md:col-span-2">
                          <Plus className="w-4 h-4" /> إضافة منطقة
                        </Button>
                      </div>

                      {plantAreas.map(area => {
                        const areaEq = equipment.filter(e => e.area_id === area.id);
                        const areaOpen = expanded[area.id] ?? true;
                        return (
                          <div key={area.id} className="rounded-lg bg-secondary/30 p-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button onClick={() => toggle(area.id)} className="p-1 hover:bg-primary/10 rounded">
                                {areaOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                              <MapPin className="w-4 h-4 text-primary/80" />
                              <span className="font-medium">{area.name}</span>
                              {area.code && <span className="text-xs text-muted-foreground">({area.code})</span>}
                              <span className="ml-auto text-xs text-muted-foreground">{areaEq.length} معدة</span>
                              <Button size="sm" variant="ghost" onClick={() => delArea(area.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>

                            <AnimatePresence>
                              {areaOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 pl-6 border-l-2 border-primary/10 space-y-2 overflow-hidden"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <Input
                                      placeholder="الوسم (Tag)"
                                      value={eInputs[area.id]?.tag || ""}
                                      onChange={ev => setEInputs(s => ({ ...s, [area.id]: { ...(s[area.id] || { name: "", type: "" }), tag: ev.target.value } }))}
                                    />
                                    <Input
                                      placeholder="الاسم"
                                      value={eInputs[area.id]?.name || ""}
                                      onChange={ev => setEInputs(s => ({ ...s, [area.id]: { ...(s[area.id] || { tag: "", type: "" }), name: ev.target.value } }))}
                                    />
                                    <Input
                                      placeholder="النوع"
                                      value={eInputs[area.id]?.type || ""}
                                      onChange={ev => setEInputs(s => ({ ...s, [area.id]: { ...(s[area.id] || { tag: "", name: "" }), type: ev.target.value } }))}
                                    />
                                    <Button onClick={() => addEquipment(area.id)} variant="secondary" className="gap-2">
                                      <Plus className="w-4 h-4" /> إضافة معدة
                                    </Button>
                                  </div>

                                  {areaEq.map(eq => (
                                    <div key={eq.id} className="flex items-center gap-2 p-2 rounded bg-background/40">
                                      <Wrench className="w-4 h-4 text-primary/70" />
                                      <span className="font-mono text-xs text-primary">{eq.tag}</span>
                                      <span className="text-sm">{eq.name}</span>
                                      {eq.type && <span className="text-xs text-muted-foreground">— {eq.type}</span>}
                                      <Button size="sm" variant="ghost" className="ml-auto" onClick={() => delEquipment(eq.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Hierarchy;
