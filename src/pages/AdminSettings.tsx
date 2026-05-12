import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS, LAB_PARAMETERS } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Shield, ArrowLeft, Key, Activity, Unlock, Lock, Save, Globe,
  Tags, Plus, Trash2, Edit2, Eye, EyeOff, GripVertical, Settings2, X, Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface ActivityLog {
  id: string;
  action: string;
  department: string | null;
  details: string | null;
  created_at: string;
}

interface DeptPin {
  id: string;
  label: string;
  pin: string;
}

interface DynamicField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  dropdown_options: string[];
  department: string | null;
  is_active: boolean;
  sort_order: number;
}

const MASTER_PIN = "9999";
const FIELD_TYPES = [
  { value: "number", label: "Number" },
  { value: "text", label: "Text" },
  { value: "dropdown", label: "Dropdown" },
];

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang, setLang } = useI18n();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [lockedDates, setLockedDates] = useState<any[]>([]);
  const [masterUnlock, setMasterUnlock] = useState(false);
  const [deptPins, setDeptPins] = useState<DeptPin[]>([]);
  const [editingPins, setEditingPins] = useState<Record<string, string>>({});

  // Dynamic fields
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("number");
  const [newFieldDept, setNewFieldDept] = useState("");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldSampleType, setNewFieldSampleType] = useState("");
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState("");
  const [editFieldType, setEditFieldType] = useState("");

  // Tag management - full CRUD
  const [selectedDeptForTags, setSelectedDeptForTags] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [editingTagIdx, setEditingTagIdx] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState("");
  // Local editable tags loaded from departments.ts as baseline
  const [deptTagsMap, setDeptTagsMap] = useState<Record<string, string[]>>({});

  // Classic field CRUD management (stored in localStorage)
  const [classicFieldsMap, setClassicFieldsMap] = useState<Record<string, string[]>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("lifeco_classic_fields") || "{}");
      // Merge with defaults from LAB_PARAMETERS
      const merged: Record<string, string[]> = {};
      Object.keys(LAB_PARAMETERS).forEach(deptId => {
        const savedFields = saved[deptId];
        if (savedFields) {
          merged[deptId] = savedFields;
        } else {
          merged[deptId] = [...(LAB_PARAMETERS[deptId]?.daily || []), ...(LAB_PARAMETERS[deptId]?.weekly || [])];
        }
      });
      return merged;
    } catch {
      const merged: Record<string, string[]> = {};
      Object.keys(LAB_PARAMETERS).forEach(deptId => {
        merged[deptId] = [...(LAB_PARAMETERS[deptId]?.daily || []), ...(LAB_PARAMETERS[deptId]?.weekly || [])];
      });
      return merged;
    }
  });
  const [newClassicFieldName, setNewClassicFieldName] = useState("");
  const [editingClassicIdx, setEditingClassicIdx] = useState<number | null>(null);
  const [editClassicName, setEditClassicName] = useState("");

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated]);

  useEffect(() => {
    // Initialize deptTagsMap from DEPARTMENTS
    const map: Record<string, string[]> = {};
    DEPARTMENTS.forEach(d => {
      if (d.tags.length > 0) {
        // Try to load saved tags from localStorage, fallback to defaults
        const saved = localStorage.getItem(`lifeco_tags_${d.id}`);
        map[d.id] = saved ? JSON.parse(saved) : [...d.tags];
      }
    });
    setDeptTagsMap(map);
  }, []);

  const saveTagsForDept = (deptId: string, tags: string[]) => {
    setDeptTagsMap(prev => ({ ...prev, [deptId]: tags }));
    localStorage.setItem(`lifeco_tags_${deptId}`, JSON.stringify(tags));
  };

  const fetchData = async () => {
    const [logsRes, lockedRes, pinsRes, fieldsRes] = await Promise.all([
      supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("locked_dates").select("*").order("locked_date", { ascending: false }),
      supabase.from("department_pins").select("*").order("id"),
      supabase.from("dynamic_fields").select("*").order("sort_order", { ascending: true }),
    ]);
    if (logsRes.data) setActivityLogs(logsRes.data as ActivityLog[]);
    if (lockedRes.data) setLockedDates(lockedRes.data);
    if (pinsRes.data) {
      const pins = pinsRes.data as DeptPin[];
      setDeptPins(pins);
      const editMap: Record<string, string> = {};
      pins.forEach((p) => { editMap[p.id] = p.pin; });
      setEditingPins(editMap);
    }
    if (fieldsRes.data) setDynamicFields(fieldsRes.data as DynamicField[]);
  };

  const handleAuth = () => {
    if (pin === MASTER_PIN) {
      setAuthenticated(true);
      supabase.from("activity_logs").insert({ action: "ADMIN_LOGIN", details: "Admin portal accessed" });
    } else {
      toast({ title: t.invalidPin, variant: "destructive" });
      setPin("");
    }
  };

  const handleMasterUnlock = async (dateId: string) => {
    const { error } = await supabase.from("locked_dates").delete().eq("id", dateId);
    if (!error) {
      toast({ title: t.dateUnlocked });
      await supabase.from("activity_logs").insert({ action: "MASTER_UNLOCK", details: `Unlocked date ID: ${dateId}` });
      fetchData();
    }
  };

  const handlePinUpdate = async (deptId: string) => {
    const newPin = editingPins[deptId];
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({ title: lang === "ar" ? "الرمز يجب أن يكون 4 أرقام" : "PIN must be 4 digits", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("department_pins").update({ pin: newPin, updated_at: new Date().toISOString() }).eq("id", deptId);
    if (!error) {
      toast({ title: t.pinUpdated });
      await supabase.from("activity_logs").insert({ action: "PIN_CHANGED", department: deptId, details: `PIN updated for ${deptId}` });
      fetchData();
    } else {
      toast({ title: t.pinUpdateError, variant: "destructive" });
    }
  };

  // Dynamic field CRUD
  const handleAddField = async () => {
    if (!newFieldName.trim() || !newFieldLabel.trim()) {
      toast({ title: lang === "ar" ? "يرجى ملء اسم الحقل والتسمية" : "Please fill field name and label", variant: "destructive" });
      return;
    }
    const options = newFieldType === "dropdown" && newFieldOptions
      ? newFieldOptions.split(",").map(o => o.trim()).filter(Boolean)
      : [];
    const { error } = await supabase.from("dynamic_fields").insert({
      field_name: newFieldName.trim().toLowerCase().replace(/\s+/g, "_"),
      field_label: newFieldLabel.trim(),
      field_type: newFieldType,
      dropdown_options: options,
      department: newFieldDept || null,
      sort_order: dynamicFields.length,
    });
    if (!error) {
      toast({ title: lang === "ar" ? "تم إضافة الحقل" : "Field added" });
      setNewFieldName(""); setNewFieldLabel(""); setNewFieldType("number"); setNewFieldDept(""); setNewFieldOptions(""); setNewFieldSampleType("");
      await supabase.from("activity_logs").insert({ action: "FIELD_ADDED", details: `Added field: ${newFieldLabel.trim()}` });
      fetchData();
    }
  };

  const handleToggleField = async (id: string, isActive: boolean) => {
    await supabase.from("dynamic_fields").update({ is_active: !isActive }).eq("id", id);
    fetchData();
  };

  const handleDeleteField = async (id: string) => {
    await supabase.from("dynamic_fields").delete().eq("id", id);
    toast({ title: lang === "ar" ? "تم حذف الحقل" : "Field deleted" });
    await supabase.from("activity_logs").insert({ action: "FIELD_DELETED", details: `Deleted field ID: ${id}` });
    fetchData();
  };

  const handleUpdateField = async (id: string) => {
    if (!editFieldLabel.trim()) return;
    await supabase.from("dynamic_fields").update({
      field_label: editFieldLabel.trim(),
      field_type: editFieldType,
    }).eq("id", id);
    setEditingFieldId(null);
    toast({ title: lang === "ar" ? "تم تحديث الحقل" : "Field updated" });
    fetchData();
  };

  // Tag CRUD
  const currentTags = deptTagsMap[selectedDeptForTags] || [];

  const handleAddTag = () => {
    if (!newTagName.trim() || !selectedDeptForTags) return;
    const updated = [...currentTags, newTagName.trim()];
    saveTagsForDept(selectedDeptForTags, updated);
    setNewTagName("");
    toast({ title: t.tagAdded });
    supabase.from("activity_logs").insert({ action: "TAG_ADDED", department: selectedDeptForTags, details: `Added tag: ${newTagName.trim()}` });
  };

  const handleDeleteTag = (idx: number) => {
    const tag = currentTags[idx];
    const updated = currentTags.filter((_, i) => i !== idx);
    saveTagsForDept(selectedDeptForTags, updated);
    toast({ title: t.tagDeleted });
    supabase.from("activity_logs").insert({ action: "TAG_DELETED", department: selectedDeptForTags, details: `Deleted tag: ${tag}` });
  };

  const handleEditTag = (idx: number) => {
    if (!editTagName.trim()) return;
    const updated = [...currentTags];
    updated[idx] = editTagName.trim();
    saveTagsForDept(selectedDeptForTags, updated);
    setEditingTagIdx(null);
    setEditTagName("");
    toast({ title: t.updated });
  };

  // Classic field CRUD helpers
  const saveClassicFields = (deptId: string, fields: string[]) => {
    setClassicFieldsMap(prev => {
      const updated = { ...prev, [deptId]: fields };
      localStorage.setItem("lifeco_classic_fields", JSON.stringify(updated));
      return updated;
    });
  };

  const classicDeptId = selectedDeptForTags;
  const currentClassicFields = classicDeptId ? (classicFieldsMap[classicDeptId] || []) : [];

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-sm mx-4">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">{t.adminAccess}</span>
          </div>
          <Input
            type="password" placeholder={t.masterPin} value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            className="mb-4 text-center text-xl tracking-widest" maxLength={4}
          />
          <Button onClick={handleAuth} className="w-full">{t.authenticate}</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center gap-4 glass-card rounded-none">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold neon-text">{t.adminSettings}</h1>
          <p className="text-xs text-muted-foreground">{t.adminPortal}</p>
        </div>
        <Button variant="default" size="sm" onClick={() => navigate("/bi")} className="gap-1.5">
          <Activity className="w-4 h-4" /> Live BI
        </Button>
        <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="gap-1.5">
          <Globe className="w-4 h-4" /> {t.language}
        </Button>
      </header>

      <main className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        {/* Tag Management - Full CRUD */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 neon-border">
          <div className="flex items-center gap-2 mb-4">
            <Tags className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t.tagManagement}</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Select value={selectedDeptForTags} onValueChange={setSelectedDeptForTags}>
              <SelectTrigger className="w-48 bg-secondary/50">
                <SelectValue placeholder={t.selectDept} />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.filter(d => d.id !== "OPERATIONS" && d.id !== "LABORATORY" && d.id !== "PLANTVIEW").map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDeptForTags && (
            <>
              {/* Add new tag */}
              <div className="flex items-center gap-2 mb-4">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder={t.newTagName}
                  className="bg-secondary/50 flex-1 max-w-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button size="sm" onClick={handleAddTag} className="gap-1.5">
                  <Plus className="w-4 h-4" /> {t.addTag}
                </Button>
              </div>

              {/* Tag list with edit/delete */}
              <div className="space-y-2">
                {currentTags.map((tag, idx) => (
                  <div key={`${tag}-${idx}`} className="flex items-center justify-between bg-secondary/30 rounded-md p-3">
                    {editingTagIdx === idx ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input value={editTagName} onChange={(e) => setEditTagName(e.target.value)}
                          className="bg-secondary/50 h-8 text-sm max-w-xs"
                          onKeyDown={(e) => e.key === "Enter" && handleEditTag(idx)}
                          autoFocus />
                        <Button size="sm" variant="outline" onClick={() => handleEditTag(idx)} className="h-8 gap-1">
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingTagIdx(null)} className="h-8">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-foreground text-sm font-medium">{tag}</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="w-7 h-7"
                            onClick={() => { setEditingTagIdx(idx); setEditTagName(tag); }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTag(idx)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {currentTags.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    {lang === "ar" ? "لا توجد عناصر" : "No tags configured"}
                  </p>
                )}
              </div>

              {/* Classic Field CRUD Management */}
              {currentClassicFields.length > 0 || classicDeptId ? (
                <div className="mt-6 border-t border-border pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    {lang === "ar" ? "إدارة الحقول الكلاسيكية (إضافة / تعديل / حذف)" : "Classic Fields Management (Add / Edit / Delete)"}
                  </h4>
                  {/* Add new classic field */}
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      value={newClassicFieldName}
                      onChange={(e) => setNewClassicFieldName(e.target.value)}
                      placeholder={lang === "ar" ? "اسم الحقل الجديد" : "New field name"}
                      className="bg-secondary/50 flex-1 max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newClassicFieldName.trim() && classicDeptId) {
                          saveClassicFields(classicDeptId, [...currentClassicFields, newClassicFieldName.trim()]);
                          setNewClassicFieldName("");
                          toast({ title: lang === "ar" ? "تم إضافة الحقل" : "Field added" });
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      if (newClassicFieldName.trim() && classicDeptId) {
                        saveClassicFields(classicDeptId, [...currentClassicFields, newClassicFieldName.trim()]);
                        setNewClassicFieldName("");
                        toast({ title: lang === "ar" ? "تم إضافة الحقل" : "Field added" });
                      }
                    }} className="gap-1.5">
                      <Plus className="w-4 h-4" /> {lang === "ar" ? "إضافة" : "Add"}
                    </Button>
                  </div>
                  {/* Classic fields list with edit/delete */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {currentClassicFields.map((param, idx) => (
                      <div key={`${param}-${idx}`} className="flex items-center justify-between bg-secondary/20 rounded-md p-2.5">
                        {editingClassicIdx === idx ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input value={editClassicName} onChange={(e) => setEditClassicName(e.target.value)}
                              className="bg-secondary/50 h-8 text-sm max-w-xs" autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && editClassicName.trim()) {
                                  const updated = [...currentClassicFields];
                                  updated[idx] = editClassicName.trim();
                                  saveClassicFields(classicDeptId, updated);
                                  setEditingClassicIdx(null);
                                  setEditClassicName("");
                                  toast({ title: lang === "ar" ? "تم التحديث" : "Updated" });
                                }
                              }}
                            />
                            <Button size="sm" variant="outline" className="h-8" onClick={() => {
                              if (editClassicName.trim()) {
                                const updated = [...currentClassicFields];
                                updated[idx] = editClassicName.trim();
                                saveClassicFields(classicDeptId, updated);
                                setEditingClassicIdx(null);
                                setEditClassicName("");
                              }
                            }}>
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingClassicIdx(null)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs text-foreground font-medium">{param}</span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="w-7 h-7"
                                onClick={() => { setEditingClassicIdx(idx); setEditClassicName(param); }}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive"
                                onClick={() => {
                                  const updated = currentClassicFields.filter((_, i) => i !== idx);
                                  saveClassicFields(classicDeptId, updated);
                                  toast({ title: lang === "ar" ? "تم حذف الحقل" : "Field deleted" });
                                }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {currentClassicFields.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-3">
                        {lang === "ar" ? "لا توجد حقول كلاسيكية" : "No classic fields"}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </motion.div>

        {/* Dynamic Field Management */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 neon-border">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              {lang === "ar" ? "إدارة الحقول الديناميكية" : "Dynamic Field Management"}
            </h3>
          </div>

          {/* Add New Field Form */}
          <div className="bg-secondary/20 rounded-lg p-4 mb-4 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {lang === "ar" ? "إضافة حقل جديد" : "Add New Field"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input
                placeholder={lang === "ar" ? "اسم الحقل (بالإنجليزية)" : "Field name (e.g., pressure)"}
                value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)}
                className="bg-secondary/50"
              />
              <Input
                placeholder={lang === "ar" ? "تسمية العرض" : "Display label (e.g., Pressure)"}
                value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}
                className="bg-secondary/50"
              />
              <Select value={newFieldType} onValueChange={setNewFieldType}>
                <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(ft => (
                    <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newFieldDept} onValueChange={setNewFieldDept}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder={lang === "ar" ? "المصنع (اختياري)" : "Plant (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "ar" ? "جميع المصانع" : "All Plants"}</SelectItem>
                  {DEPARTMENTS.filter(d => d.id !== "OPERATIONS" && d.id !== "PLANTVIEW").map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                  ))}
                  <SelectItem value="UREA">Urea</SelectItem>
                  <SelectItem value="UTILITIES">Utilities</SelectItem>
                  <SelectItem value="OFFSITE">Offsite</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newFieldSampleType} onValueChange={setNewFieldSampleType}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder={lang === "ar" ? "نوع العينة (اختياري)" : "Sample Type (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "ar" ? "الكل" : "All"}</SelectItem>
                  <SelectItem value="daily">{lang === "ar" ? "يومي" : "Daily"}</SelectItem>
                  <SelectItem value="weekly">{lang === "ar" ? "أسبوعي" : "Weekly"}</SelectItem>
                </SelectContent>
              </Select>
              {newFieldType === "dropdown" && (
                <Input
                  placeholder={lang === "ar" ? "الخيارات (مفصولة بفواصل)" : "Options (comma-separated)"}
                  value={newFieldOptions} onChange={(e) => setNewFieldOptions(e.target.value)}
                  className="bg-secondary/50 md:col-span-2"
                />
              )}
            </div>
            <Button onClick={handleAddField} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> {lang === "ar" ? "إضافة حقل" : "Add Field"}
            </Button>
          </div>

          {/* Existing Fields List */}
          <div className="space-y-2">
            {dynamicFields.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                {lang === "ar" ? "لا توجد حقول ديناميكية بعد" : "No dynamic fields configured yet"}
              </p>
            ) : (
              dynamicFields.map((field) => (
                <motion.div key={field.id} layout
                  className={`flex items-center justify-between rounded-lg p-3 transition-all ${
                    field.is_active ? "bg-secondary/30" : "bg-secondary/10 opacity-60"
                  }`}
                >
                  {editingFieldId === field.id ? (
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <Input value={editFieldLabel} onChange={(e) => setEditFieldLabel(e.target.value)}
                        className="w-40 bg-secondary/50 h-8 text-sm" />
                      <Select value={editFieldType} onValueChange={setEditFieldType}>
                        <SelectTrigger className="w-28 bg-secondary/50 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(ft => (
                            <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => handleUpdateField(field.id)} className="h-8 gap-1">
                        <Save className="w-3 h-3" /> {t.save}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingFieldId(null)} className="h-8">
                        {t.cancel}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-foreground font-medium text-sm">{field.field_label}</span>
                          <span className="text-muted-foreground text-xs ml-2">({field.field_name})</span>
                        </div>
                        <Badge variant={field.field_type === "number" ? "default" : field.field_type === "text" ? "secondary" : "outline"} className="text-[10px]">
                          {field.field_type}
                        </Badge>
                        {field.department && field.department !== "all" && (
                          <Badge variant="outline" className="text-[10px]">{field.department}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-7 h-7"
                          onClick={() => { setEditingFieldId(field.id); setEditFieldLabel(field.field_label); setEditFieldType(field.field_type); }}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7"
                          onClick={() => handleToggleField(field.id, field.is_active)}>
                          {field.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteField(field.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Master Unlock Toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 neon-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Unlock className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">{t.emergencyUnlock}</h3>
                <p className="text-xs text-muted-foreground">{t.overrideAllLocks}</p>
              </div>
            </div>
            <Switch checked={masterUnlock} onCheckedChange={setMasterUnlock} />
          </div>
        </motion.div>

        {/* Locked Dates */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t.lockedDates}</h3>
          </div>
          {lockedDates.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t.noLockedDates}</p>
          ) : (
            <div className="space-y-2">
              {lockedDates.map((ld) => (
                <div key={ld.id} className="flex items-center justify-between bg-secondary/30 rounded-md p-3">
                  <div>
                    <span className="text-foreground font-medium">{ld.locked_date}</span>
                    <span className="text-xs text-muted-foreground ml-3">{lang === "ar" ? "بواسطة" : "by"} {ld.locked_by}</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleMasterUnlock(ld.id)}>{t.unlock}</Button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Department PINs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t.departmentPins}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deptPins.map((d) => (
              <div key={d.id} className="bg-secondary/30 rounded-md p-4 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{d.label}</p>
                  <Input type="text" maxLength={4} value={editingPins[d.id] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setEditingPins((prev) => ({ ...prev, [d.id]: val }));
                    }}
                    className="font-mono font-bold text-lg h-10 text-primary bg-secondary/50 w-28"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => handlePinUpdate(d.id)}
                  disabled={editingPins[d.id] === d.pin} className="gap-1.5">
                  <Save className="w-3.5 h-3.5" /> {t.save}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Logs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t.activityLogs}</h3>
          </div>
          {activityLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t.noActivityLogs}</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between bg-secondary/30 rounded-md p-3 text-sm">
                  <div>
                    <span className="text-primary font-medium">{log.action}</span>
                    {log.department && <span className="text-muted-foreground ml-2">({log.department})</span>}
                    {log.details && <p className="text-muted-foreground text-xs mt-0.5">{log.details}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminSettings;
