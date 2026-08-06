import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getRecords, getAuditLogs } from '@/lib/records.functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LayoutDashboard, 
  Database, 
  BarChart3, 
  Settings, 
  Activity, 
  AlertTriangle,
  FileText,
  User,
  History
} from 'lucide-react';

export const Route = createFileRoute('/dashboard')({
  component: CommandDashboard,
});

function CommandDashboard() {
  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['records'],
    queryFn: () => getRecords(),
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: () => getAuditLogs({}),
  });

  return (
    <div className="p-6 space-y-8 bg-[#020617] min-h-screen text-slate-200">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-blue-600" />
            COMMAND CENTER
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">
            Production & Information Management System v4.0
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-xs font-black text-slate-500 uppercase">System Status</div>
            <div className="text-emerald-500 font-bold flex items-center justify-end gap-2">
              <Activity className="w-3 h-3 animate-pulse" />
              OPERATIONAL
            </div>
          </div>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Records', value: records?.filter(r => r.status === 'active').length || 0, icon: Database, color: 'text-blue-500' },
          { label: 'Pending Review', value: records?.filter(r => r.status === 'pending').length || 0, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Audit Events (24h)', value: auditLogs?.length || 0, icon: History, color: 'text-emerald-500' },
          { label: 'System Users', value: 12, icon: User, color: 'text-purple-500' },
        ].map((kpi, i) => (
          <Card key={i} className="bg-slate-900/40 border-slate-800 backdrop-blur-xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <kpi.icon className="w-16 h-16" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {recordsLoading ? <Skeleton className="h-9 w-16 bg-slate-800" /> : <div className={`text-4xl font-black text-white`}>{kpi.value}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar / Quick Links */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2">Modules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { to: '/records', label: 'Master Data Hub', icon: Database, desc: 'Central record management' },
                { to: '/analytics', label: 'Information Insights', icon: BarChart3, desc: 'Data quality & trends' },
                { to: '/settings', label: 'System Configuration', icon: Settings, desc: 'Schema & access control' },
              ].map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to as any} 
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700 group"
                >
                  <div className="bg-slate-800 p-2 rounded-md group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white uppercase tracking-tight">{link.label}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{link.desc}</div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="text-xs font-black text-amber-500 uppercase tracking-widest">System Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 leading-relaxed font-bold italic">
                "Zero Information Loss Policy is active. All updates are logged in the immutable audit trail."
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Feed: Recent Activity / Audit Log */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 mb-2">
              <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Live Audit Stream
              </CardTitle>
              <Badge variant="outline" className="text-[9px] font-black border-slate-700 text-slate-500 uppercase">Granular Tracking</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-800/50">
                {logsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                      <Skeleton className="h-4 w-1/3 bg-slate-800" />
                      <Skeleton className="h-3 w-2/3 bg-slate-800" />
                    </div>
                  ))
                ) : auditLogs?.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest italic text-xs">
                    No recent audit events detected
                  </div>
                ) : (
                  auditLogs?.map((log: any) => (
                    <div key={log.id} className="p-4 hover:bg-slate-800/20 transition-colors flex gap-4">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-black text-slate-200 uppercase tracking-tight">{log.action}</span>
                          <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          Record ID: <span className="font-mono">{log.record_id}</span>
                        </div>
                        <div className="mt-2 bg-slate-950/50 rounded p-2 border border-slate-800">
                           <pre className="text-[9px] text-emerald-400 font-mono overflow-x-auto">
                             {JSON.stringify(log.changes, null, 2)}
                           </pre>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
