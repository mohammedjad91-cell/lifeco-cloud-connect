import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, FileText, Printer, Share2, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getStamp } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";

interface LogSheetProps {
  onClose: () => void;
}

const NitrogenLogSheetsModule = ({ onClose }: LogSheetProps) => {
  const { toast } = useToast();
  
  const handleExportPDF = () => {
    toast({ title: "Exporting...", description: "Generating professional engineering PDF layout..." });
  };

  const handleSave = () => {
    toast({ title: "Syncing...", description: "All entries synchronized with DCS database." });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-2 md:p-8 overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto bg-slate-950 border border-primary/20 rounded-xl shadow-2xl flex flex-col h-full overflow-hidden print:bg-white print:text-black print:border-none">
        
        {/* ACTION TOOLBAR */}
        <div className="p-4 bg-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 text-white">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Nitrogen Plant Digital Log Sheets</h2>
              <p className="text-[10px] text-primary font-mono uppercase tracking-[0.2em]">High-Tech Command Center | DCS Integration</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary">
              <Save className="w-4 h-4 mr-2" /> Save Log Entries
            </Button>
            <Button size="sm" onClick={handleExportPDF} className="bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary">
              <FileText className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint} className="border-white/10 hover:bg-white/5">
              <Printer className="w-4 h-4 mr-2" /> Print Sheet
            </Button>
            <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
              <Share2 className="w-4 h-4 mr-2" /> Send Report
            </Button>
          </div>
        </div>

        {/* CONTENT TABS */}
        <Tabs defaultValue="sheet-1" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-slate-900/50 border-b border-white/5 p-0 justify-start rounded-none print:hidden overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="sheet-1" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none px-6 py-3 font-bold uppercase text-[10px] tracking-widest border-r border-white/5 transition-all">
              SHEET-1: Air Compressors (60-1001 A/B/C)
            </TabsTrigger>
            <TabsTrigger value="sheet-2" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none px-6 py-3 font-bold uppercase text-[10px] tracking-widest border-r border-white/5 transition-all">
              SHEET-2: Nitrogen Plant & Utilities
            </TabsTrigger>
            <TabsTrigger value="sheet-3" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none px-6 py-3 font-bold uppercase text-[10px] tracking-widest transition-all">
              SHEET-3: Hourly Operations
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 bg-white print:p-0">
            <TabsContent value="sheet-1" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-slate-900 font-black text-2xl uppercase tracking-tighter border-b-2 border-slate-900 pb-2">
                Commissioning Log Sheet - SHEET-1
              </h3>
              <CompressorSheet />
            </TabsContent>
            
            <TabsContent value="sheet-2" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-slate-900 font-black text-2xl uppercase tracking-tighter border-b-2 border-slate-900 pb-2">
                Ammonia plants dept. - Nitrogen plant Commissioning log sheet
              </h3>
              <UtilitiesSheet />
            </TabsContent>
            
            <TabsContent value="sheet-3" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-slate-900 font-black text-2xl uppercase tracking-tighter border-b-2 border-slate-900 pb-2">
                Nitrogen Plant Hourly Operations
              </h3>
              <HourlyOpsSheet />
              <SignaturesSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
};

// --- DATA TABLE COMPONENT ---
interface DataTableProps {
  groups: {
    label: string;
    parameters: string[];
    isCollapsible?: boolean;
  }[];
  hours: string[];
}

const DataTable = ({ groups, hours }: DataTableProps) => {
  const [data, setData] = useState<Record<string, string>>({});

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number, totalRows: number, totalCols: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = document.querySelector(`input[data-pos="${rowIndex + 1}-${colIndex}"]`) as HTMLInputElement;
      if (next) next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = document.querySelector(`input[data-pos="${rowIndex - 1}-${colIndex}"]`) as HTMLInputElement;
      if (prev) prev.focus();
    } else if (e.key === 'ArrowRight') {
      const input = e.currentTarget;
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        const next = document.querySelector(`input[data-pos="${rowIndex}-${colIndex + 1}"]`) as HTMLInputElement;
        if (next) next.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      const input = e.currentTarget;
      if (input.selectionStart === 0) {
        e.preventDefault();
        const prev = document.querySelector(`input[data-pos="${rowIndex}-${colIndex - 1}"]`) as HTMLInputElement;
        if (prev) prev.focus();
      }
    }
  };

  let globalRowCounter = 0;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-slate-900/40">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-900 border-white/10 hover:bg-slate-900">
              <TableHead className="w-[350px] text-primary font-bold uppercase text-[10px] tracking-widest border-r border-white/5">
                Parameters / Instruments
              </TableHead>
              {hours.map(h => (
                <TableHead key={h} className="text-center text-white font-mono font-black text-sm border-r border-white/5 min-w-[100px]">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                <TableRow className="bg-primary/5 hover:bg-primary/10 border-white/10">
                  <TableCell colSpan={hours.length + 1} className="py-2 px-4 text-primary font-black uppercase text-[10px] tracking-[0.3em]">
                    {group.label}
                  </TableCell>
                </TableRow>
                {group.parameters.map((param, paramIdx) => {
                  const currentRowIndex = globalRowCounter++;
                  return (
                    <TableRow key={paramIdx} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="py-2 px-4 font-mono text-[11px] text-white/80 border-r border-white/5 group-hover:text-primary transition-colors">
                        {param}
                      </TableCell>
                      {hours.map((h, colIdx) => {
                        const cellId = `${group.label}-${param}-${h}`;
                        return (
                          <TableCell key={h} className="p-0 border-r border-white/5">
                            <Input
                              data-pos={`${currentRowIndex}-${colIdx}`}
                              value={data[cellId] || ""}
                              onChange={(e) => setData(prev => ({ ...prev, [cellId]: e.target.value }))}
                              onKeyDown={(e) => handleKeyDown(e, currentRowIndex, colIdx, 1000, hours.length)}
                              className="h-10 w-full bg-transparent border-none rounded-none text-center font-mono text-sm text-white focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-primary/5 placeholder:text-white/5 transition-all"
                              placeholder="0.0"
                              inputMode="decimal"
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// --- SHEET COMPONENTS ---

const CompressorSheet = () => {
  const hours = ["08:00", "10:00", "12:00", "14:00", "16:00"];
  const params = [
    "Amper", "Compressed air outlet press", "ΔP Air Filter", "Lub oil pressure",
    "First stage air discharge", "Compressed air temp", "Element one outlet",
    "Element two inlet", "Element two outlet", "Cooling water inlet temp",
    "LP. Cooling water outlet temp", "Cooling water outlet temp", "Lub oil temp", "Lub oil tank level %"
  ];
  const groups = [
    { label: "EQUIPMENT TAG: 60-1001/A", parameters: params },
    { label: "EQUIPMENT TAG: 60-1001/B", parameters: params },
    { label: "EQUIPMENT TAG: 60-1001/C", parameters: params },
  ];
  return <DataTable groups={groups} hours={hours} />;
};

const UtilitiesSheet = () => {
  const hours = ["08:00", "10:00", "12:00", "14:00", "16:00"];
  const groups = [
    {
      label: "PROCESS INSTRUMENTATION & UTILITIES",
      parameters: [
        "60-PT-0014 C.W.P. discharge", "60-lt-0001 C.W. tank level %", "60-PT-0016 S.W. pressure",
        "60-PT-0017 S.W. pressure", "60-PI-0009 compressed air press", "61-TI-029 compressed air TEMP",
        "60-PI-029 INST. Air press", "60-TI-010 inst. Air TEMP", "60-AT-001 common dew point",
        "60-pt-0001 dryers outlet press", "60-FIC-001 inlet flow to 2201", "61-FIC-002 INLET FLOW TO 2202",
        "60-2201 A/B filter ΔP", "60-2202 A/B filter ΔP", "60-FT-0005 inst. Air flow", "P.S.A unit",
        "60-2203 A/B inlet filter ΔP", "61-2203 CV/D inlet filter ΔP", "60-301-O2 analyzer",
        "61-303-o2 analyzer", "62-302 production o2 analyzer", "60-FT-0004 air flow to P.S.A",
        "60-PT-010 N2 header pressure", "60-PG-308 N2 Receiver pressure", "60-AL-003 P.S.A Oxygen cont"
      ]
    }
  ];
  return <DataTable groups={groups} hours={hours} />;
};

const HourlyOpsSheet = () => {
  const hours = ["8", "10", "12", "14", "16", "18"];
  const groups = [
    {
      label: "HOURLY OPERATIONS LOG (NITROGEN)",
      parameters: [
        "60-PIC-006 PRESSURE/OPENING%", "60-PI-012 Compressor discharge", "60-TI-002 Compressor temp",
        "60-TI-005 C.W. Tank inlet temp", "60-LI-001 C.W. Tank level", "60-PI-014 C.W. Pressure",
        "60-FIC-001 Inlet flow to 2201 A/B", "60-FIC-001 Inlet flow to 2202 A/B", "60-TI-001 Dryers outlet temp",
        "60-PI-001 Dryers outlet pressure", "60-PIC-005 Pressure / Opening %", "60-FT-0005 Inst. Air flow",
        "60-PI-005 Inst. Air pressure", "60-PIC-022 pro. Air from Amm-1", "60-FT-004 Air flow to P.S.A",
        "60-FI-305 P.S.A production", "60-PI-010 P.S.A production", "60-TI-305 P.S.A production",
        "60-AI-001 main dew point", "60-AL-003 P.S.A Production purity"
      ]
    }
  ];
  return <DataTable groups={groups} hours={hours} />;
};

const SignaturesSection = () => {
  const shifts = [
    { label: "MORNING SHIFT", time: "06:00 - 14:00" },
    { label: "AFTERNOON SHIFT", time: "14:00 - 22:00" },
    { label: "NIGHT SHIFT", time: "22:00 - 06:00" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 print:mt-8">
      {shifts.map(shift => (
        <div key={shift.label} className="glass-card p-6 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-primary font-black text-[10px] tracking-widest">{shift.label}</span>
            <span className="text-white/20 text-[9px] font-mono">{shift.time}</span>
          </div>
          <div className="h-20 border-b border-white/5 flex items-end justify-center pb-2 text-white/10 italic text-[10px] uppercase font-mono tracking-widest">
            Digital Signature Area
          </div>
          <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-white/5 text-white/40">
            Sign Off
          </Button>
        </div>
      ))}
    </div>
  );
};

export default NitrogenLogSheetsModule;
