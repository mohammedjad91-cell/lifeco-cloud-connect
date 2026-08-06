import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getRecords } from '@/lib/records.functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export const Route = createFileRoute('/records')({
  component: MasterDataHub,
});

function MasterDataHub() {
  const { data: records, isLoading, error } = useQuery({
    queryKey: ['records'],
    queryFn: () => getRecords(),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>;
      case 'pending': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'archived': return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">Archived</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive" className="animate-pulse">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500 text-white">High</Badge>;
      case 'medium': return <Badge className="bg-blue-500 text-white">Medium</Badge>;
      case 'low': return <Badge className="bg-slate-500 text-white">Low</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  if (error) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
      <h2 className="text-xl font-bold text-white mb-2">Error Loading Records</h2>
      <p>{(error as any).message}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-[#020617] min-h-screen text-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-500" />
            MASTER DATA HUB
          </h1>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">LIFECO Asset & Information Management</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-300">RLS ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-tighter">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{records?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-tighter">Critical Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-500">
              {records?.filter((r: any) => r.priority === 'critical').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black text-slate-500 uppercase tracking-tighter">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-500">100%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl overflow-hidden">
        <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Production Records Registry</div>
          <Clock className="w-4 h-4 text-slate-500" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Priority</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Title & Category</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Description</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-500">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell><Skeleton className="h-6 w-16 bg-slate-800" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 bg-slate-800" /></TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 mb-2 bg-slate-800" />
                      <Skeleton className="h-3 w-20 bg-slate-800" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-48 bg-slate-800" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-slate-800" /></TableCell>
                  </TableRow>
                ))
              ) : records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-500 italic uppercase font-bold tracking-widest">
                    No Records Found in Master Registry
                  </TableCell>
                </TableRow>
              ) : (
                records?.map((record: any) => (
                  <TableRow key={record.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors group cursor-pointer">
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{getPriorityBadge(record.priority)}</TableCell>
                    <TableCell>
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{record.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-black">{record.category}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-slate-400 text-sm">{record.description}</TableCell>
                    <TableCell className="text-slate-500 text-xs font-mono">
                      {new Date(record.updated_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
