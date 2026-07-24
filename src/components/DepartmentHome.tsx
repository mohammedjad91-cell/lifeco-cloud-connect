import { motion } from "framer-motion";
import { DEPT_STRUCTURE, DeptPlant, DeptModule } from "@/lib/dept-structure";
import {
  Factory, Wind, Droplets, GitBranch, Container, Truck, FlaskConical, Wrench,
  Beaker, Hammer, Power, Cog, Zap, Gauge, ShieldCheck, Droplet, Package, Cpu, Users,
  ChevronRight, LayoutGrid,
} from "lucide-react";

const ICONS: Record<string, any> = {
  Factory, Wind, Droplets, GitBranch, Container, Truck, FlaskConical, Wrench,
  Beaker, Hammer, Power, Cog, Zap, Gauge, ShieldCheck, Droplet, Package, Cpu, Users,
};

interface Props {
  departmentId: string;
  departmentLabel: string;
  onOpenModule: (plant: DeptPlant, mod: DeptModule) => void;
}

export default function DepartmentHome({ departmentId, departmentLabel, onOpenModule }: Props) {
  const plants = DEPT_STRUCTURE[departmentId] || [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card neon-border p-5 flex items-center gap-3"
      >
        <LayoutGrid className="w-6 h-6 text-primary" />
        <div>
          <h2 className="font-display text-xl font-bold neon-text tracking-wider">{departmentLabel} — Command Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a plant / area, then choose a module.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plants.map((plant, idx) => {
          const Icon = ICONS[plant.icon || "Factory"] || Factory;
          return (
            <motion.div
              key={plant.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-card neon-border p-5 hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.5)] transition-all"
            >
              <div className="flex items-center gap-3 border-b border-primary/20 pb-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base tracking-wide truncate">{plant.label}</h3>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
                    {plant.modules.length} modules
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {plant.modules.map(mod => (
                  <button
                    key={mod.key}
                    onClick={() => onOpenModule(plant, mod)}
                    className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm
                               bg-secondary/40 hover:bg-primary/15 border border-border hover:border-primary/50
                               transition-all text-left"
                  >
                    <span className="truncate">{mod.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}

        {plants.length === 0 && (
          <div className="glass-card p-8 text-center text-muted-foreground">
            No sub-plants configured for this department yet.
          </div>
        )}
      </div>
    </div>
  );
}
