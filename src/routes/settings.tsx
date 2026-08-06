import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, HardDrive, UserCog, CloudDownload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/settings')({
  component: SystemSettings,
});

function SystemSettings() {
  return (
    <div className="p-6 space-y-6 bg-[#020617] min-h-screen text-slate-200">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 uppercase">
          <Settings className="w-8 h-8 text-slate-400" />
          System Configuration
        </h1>
        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Admin Controls & Schema Management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Access Control (RLS)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-tight">Row Level Security</div>
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded uppercase border border-emerald-500/20">Active</div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold italic">
              "RLS ensures only authenticated staff can access critical production metadata."
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <CloudDownload className="w-4 h-4 text-blue-500" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full bg-slate-900 border-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-800">
              Export All Records (CSV)
            </Button>
            <Button variant="outline" className="w-full bg-slate-900 border-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-800">
              Export Audit Logs (JSON)
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-500" />
              Metadata Schema Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-500 font-bold italic uppercase">
              Extended JSONB schema definitions for flexible asset tracking are managed via direct migration files.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
