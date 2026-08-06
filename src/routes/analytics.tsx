import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/analytics')({
  component: AnalyticsDashboard,
});

function AnalyticsDashboard() {
  return (
    <div className="p-6 space-y-6 bg-[#020617] min-h-screen text-slate-200">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 uppercase">
          <BarChart3 className="w-8 h-8 text-emerald-500" />
          Information Insights
        </h1>
        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Data Quality & Statistical Analysis</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Data Completeness', value: '98.2%', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Validation Errors', value: '0.04%', icon: AlertCircle, color: 'text-red-500' },
          { label: 'Daily Operations', value: '142', icon: Activity, color: 'text-blue-500' },
          { label: 'Archive Rate', value: '12%', icon: PieChart, color: 'text-purple-500' },
        ].map((metric, i) => (
          <Card key={i} className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-widest">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-2xl font-black text-white">{metric.value}</div>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl h-64 flex items-center justify-center">
          <div className="text-slate-500 font-black uppercase tracking-[0.2em] italic text-xs">
            Category Distribution Chart Placeholder
          </div>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl h-64 flex items-center justify-center">
          <div className="text-slate-500 font-black uppercase tracking-[0.2em] italic text-xs">
            Data Completeness Trends Placeholder
          </div>
        </Card>
      </div>
    </div>
  );
}
