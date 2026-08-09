import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, FileText, Printer, Share2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface LogSheetProps {
  onClose: () => void;
}

const NitrogenLogSheetsModule = ({ onClose }: LogSheetProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sheet-1");

  const handleExportPDF = () => {
    toast({ title: "Exporting...", description: "Generating professional PDF layout..." });
  };

  const handleSave = () => {
    toast({ title: "Saved", description: "Entries synchronized with DCS database." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-4 md:p-8 overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto bg-slate-950 border border-primary/20 rounded-xl shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header with Toolbar */}
        <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}><ChevronLeft /></Button>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Nitrogen Plant Digital Log Sheets</h2>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="bg-primary/20 hover:bg-primary/30"><Save className="w-4 h-4 mr-2" />Save</Button>
            <Button size="sm" onClick={handleExportPDF} className="bg-primary/20 hover:bg-primary/30"><FileText className="w-4 h-4 mr-2" />PDF</Button>
            <Button size="sm" variant="outline"><Printer className="w-4 h-4" /></Button>
            <Button size="sm" variant="outline"><Share2 className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="sheet-1" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-transparent border-b border-white/5 p-0 justify-start rounded-none">
            <TabsTrigger value="sheet-1" className="data-[state=active]:bg-primary/10 rounded-none px-6">Sheet-1: Compressors</TabsTrigger>
            <TabsTrigger value="sheet-2" className="data-[state=active]:bg-primary/10 rounded-none px-6">Sheet-2: Utilities</TabsTrigger>
            <TabsTrigger value="sheet-3" className="data-[state=active]:bg-primary/10 rounded-none px-6">Sheet-3: Hourly Ops</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="sheet-1" className="mt-0">
               <DataTable title="Commissioning Log Sheet - SHEET-1" hours={["08:00", "10:00", "12:00", "14:00", "16:00"]} />
            </TabsContent>
            <TabsContent value="sheet-2" className="mt-0">
               <DataTable title="Ammonia plants dept. - Nitrogen plant Commissioning log sheet" hours={["08:00", "10:00", "12:00", "14:00", "16:00"]} />
            </TabsContent>
            <TabsContent value="sheet-3" className="mt-0">
               <DataTable title="Ammonia Plants Dept. - Nitrogen Plant Commissioning Log Sheet" hours={["8", "10", "12", "14", "16", "18"]} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
};

const DataTable = ({ title, hours }: { title: string; hours: string[] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-primary font-bold tracking-widest text-sm uppercase">{title}</h3>
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <Table className="bg-slate-900/50">
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="w-[300px]">Parameter</TableHead>
              {hours.map(h => <TableHead key={h} className="text-center">{h}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i} className="border-white/5 hover:bg-white/5">
                <TableCell className="font-mono text-xs">TAG-00{i+1}</TableCell>
                {hours.map(h => (
                  <TableCell key={h} className="p-1">
                    <Input className="h-8 bg-black/40 border-white/10 text-center" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default NitrogenLogSheetsModule;
