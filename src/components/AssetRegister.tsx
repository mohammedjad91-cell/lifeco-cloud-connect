import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Wrench, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOperator, getStamp } from "@/lib/session";

interface Asset {
  id: string;
  department: string;
  asset_code: string;
  asset_name: string;
  is_custom: boolean;
}

interface Maintenance {
  id: string;
  asset_id: string;
  notes: string;
  recorded_by: string | null;
  recorded_at: string;
}

interface Props {
  department: string;
}

export default function AssetRegister({ department }: Props) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [records, setRecords] = useState<Record<string, Maintenance[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const fetchAssets = async () => {
    const { data } = await supabase
      .from("equipment_assets")
      .select("*")
      .eq("department", department)
      .order("is_custom", { ascending: true })
      .order("asset_code");
    if (data) setAssets(data as Asset[]);
    setLoading(false);
  };

  const fetchRecords = async (assetId: string) => {
    const { data } = await supabase
      .from("maintenance_records")
      .select("*")
      .eq("asset_id", assetId)
      .order("recorded_at", { ascending: false });
    if (data) setRecords((prev) => ({ ...prev, [assetId]: data as Maintenance[] }));
  };

  useEffect(() => {
    fetchAssets();
  }, [department]);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    if (!records[id]) fetchRecords(id);
  };

  const addAsset = async () => {
    if (!newCode.trim() || !newName.trim()) return;
    const { error } = await supabase.from("equipment_assets").insert({
      department,
      asset_code: newCode.trim(),
      asset_name: newName.trim(),
      is_custom: true,
    });
    if (error) {
      toast({ title: "Failed to add", variant: "destructive" });
    } else {
      toast({ title: "Equipment added" });
      setNewCode("");
      setNewName("");
      setAdding(false);
      fetchAssets();
    }
  };

  const addNote = async (assetId: string) => {
    const note = noteDraft[assetId]?.trim();
    if (!note) return;
    const op = getOperator();
    const stamp = getStamp(op);
    const { error } = await supabase.from("maintenance_records").insert({
      asset_id: assetId,
      notes: note,
      recorded_by: stamp.formatted,
    });
    if (!error) {
      toast({ title: "Maintenance record saved" });
      setNoteDraft((p) => ({ ...p, [assetId]: "" }));
      fetchRecords(assetId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading asset register…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold neon-text flex items-center gap-2">
          <Wrench className="w-5 h-5" /> Asset Register — {department}
        </h3>
        <Button size="sm" onClick={() => setAdding((s) => !s)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Equipment
        </Button>
      </div>

      {adding && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Asset Code / Tag</Label>
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. P-201" />
            </div>
            <div>
              <Label>Asset Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Booster Pump" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={addAsset}>Save</Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {assets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No equipment registered yet.</p>
        )}
        {assets.map((a) => (
          <div key={a.id} className="glass-card p-3">
            <button
              onClick={() => toggle(a.id)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary text-sm">{a.asset_code}</span>
                  <span className="text-foreground font-medium">{a.asset_name}</span>
                  {a.is_custom && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                      Custom
                    </span>
                  )}
                </div>
              </div>
              {expanded === a.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded === a.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 space-y-3 overflow-hidden"
              >
                <div className="space-y-2">
                  <Label className="text-xs">Add Maintenance Record</Label>
                  <Textarea
                    value={noteDraft[a.id] || ""}
                    onChange={(e) => setNoteDraft((p) => ({ ...p, [a.id]: e.target.value }))}
                    placeholder="Describe inspection, repair, lubrication, parts replaced…"
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => addNote(a.id)}>Save Record</Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">History</Label>
                  {(records[a.id] || []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No records yet.</p>
                  )}
                  {(records[a.id] || []).map((r) => (
                    <div key={r.id} className="text-xs p-2 rounded bg-secondary/40 border border-border">
                      <div className="text-foreground">{r.notes}</div>
                      <div className="text-muted-foreground mt-1">{r.recorded_by || "-"}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
