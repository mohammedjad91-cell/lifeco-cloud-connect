import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ArrowRight } from "lucide-react";
import { getOperator, setOperator } from "@/lib/session";

interface Props {
  open: boolean;
  department: string;
  onComplete: () => void;
}

export default function UserCaptureModal({ open, department, onComplete }: Props) {
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");

  useEffect(() => {
    if (open) {
      const existing = getOperator();
      if (existing) {
        setName(existing.name);
        setEmpId(existing.employeeId);
      }
    }
  }, [open]);

  const submit = () => {
    if (!name.trim() || !empId.trim()) return;
    setOperator({ name: name.trim(), employeeId: empId.trim(), department });
    onComplete();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="glass-card neon-border p-6 max-w-sm w-full"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold neon-text">Operator Identification</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Confirm your name and employee ID. Every entry will be stamped with this information.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="op-name">Operator Name</Label>
                <Input
                  id="op-name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="e.g. Mohammed Gadallah"
                />
              </div>
              <div>
                <Label htmlFor="op-id">Employee ID</Label>
                <Input
                  id="op-id"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="e.g. 12345"
                />
              </div>
            </div>
            <Button
              className="w-full mt-5 gap-2"
              disabled={!name.trim() || !empId.trim()}
              onClick={submit}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
