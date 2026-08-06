import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Inbox, CheckCircle, Clock, Filter, Search, User, Hammer, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const MaintenanceManagement = ({ plantCode }: { plantCode: string }) => {
  const { lang } = useI18n();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filter, setFilter] = useState("submitted");
  const [assignment, setAssignment] = useState({
    workType: "",
    team: "",
    assignee: ""
  });

  useEffect(() => {
    fetchRequests();
    const channel = supabase.channel("forms_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "lifeco_digital_forms" }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [plantCode, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase.from("lifeco_digital_forms")
      .select("*")
      .eq("plant_code", plantCode)
      .order("created_at", { ascending: false });
    
    if (filter !== "all") {
      query = query.eq("status", filter as any);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("فشل في تحميل الطلبات");
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleReview = async (id: string) => {
    const { error } = await supabase.from("lifeco_digital_forms")
      .update({ 
        status: "under_review" as any,
        form_data: { 
          ...selectedRequest.form_data, 
          maintenance_assignment: assignment 
        }
      })
      .eq("id", id);
    
    if (error) toast.error("فشل في تحديث الحالة");
    else {
      toast.success("تم تحويل الطلب للمراجعة والتعيين");
      setSelectedRequest(null);
      fetchRequests();
    }
  };

  const handleExecute = async (id: string) => {
    const { error } = await supabase.from("lifeco_digital_forms")
      .update({ status: "approved" as any }) // Using approved as "In Execution" placeholder if enum is limited
      .eq("id", id);
    
    if (error) toast.error("فشل في بدء التنفيذ");
    else {
      toast.success("تم البدء في تنفيذ العمل");
      setSelectedRequest(null);
      fetchRequests();
    }
  };

  const handleClose = async (id: string) => {
    const { error } = await supabase.from("lifeco_digital_forms")
      .update({ 
        status: "closed" as any,
        closed_at: new Date().toISOString()
      })
      .eq("id", id);
    
    if (error) toast.error("فشل في إغلاق العمل");
    else {
      toast.success("تم إغلاق العمل بنجاح وإرجاع السجل");
      setSelectedRequest(null);
      fetchRequests();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" />
            {lang === "ar" ? "طلبات العمل الواردة" : "Incoming Work Requests"}
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {lang === "ar" ? "مراجعة وتعيين وتنفيذ أوامر العمل" : "Review, Assign and Execute Work Orders"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="submitted">New / Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Executing</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List View */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center space-y-4">
              <Clock className="w-12 h-12 text-primary animate-pulse" />
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center space-y-4 border-dashed border-2 border-white/10">
              <Inbox className="w-12 h-12 text-muted-foreground opacity-20" />
              <div className="text-center">
                <p className="text-muted-foreground font-bold">
                  {lang === "ar" ? "لا توجد طلبات واردة حالياً لهذا الفلتر" : "No incoming requests for this filter."}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2 max-w-md">
                  {lang === "ar" 
                    ? "عندما يقوم المهندس بإرسال تصريح أو طلب عمل من داخل المصنع، سيظهر هنا مباشرة لمراجعته وتكليف فريق الصيانة." 
                    : "When an engineer sends a permit or work request from the plant, it will appear here for review and assignment."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <motion.div 
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`glass-card p-4 border transition-all cursor-pointer ${selectedRequest?.id === req.id ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'}`}
                  onClick={() => setSelectedRequest(req)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{req.form_type.replace('_', ' ')}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                      req.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-500' :
                      req.status === 'under_review' ? 'bg-blue-500/20 text-blue-500' :
                      req.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      'bg-slate-500/20 text-slate-500'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{req.form_number}</h3>
                      <p className="text-xs text-muted-foreground">Requested by: {req.created_by_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60">{format(new Date(req.created_at), "dd MMM, HH:mm")}</p>
                      <p className="text-[10px] text-muted-foreground">Plant: {req.plant_code}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Detail/Action View */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedRequest ? (
              <motion.div 
                key={selectedRequest.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 border border-white/20 sticky top-6"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <h2 className="text-lg font-bold text-white">Request Details</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(null)}>×</Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Search className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-tighter">1. Review Request</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded text-xs text-white/80 leading-relaxed">
                      {selectedRequest.form_data?.general?.workDescription || selectedRequest.form_data?.job?.description || "No description provided."}
                    </div>
                  </div>

                  {selectedRequest.status === 'submitted' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-tighter">2. Work Type & Team</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">Work Category</Label>
                          <Select value={assignment.workType} onValueChange={(v) => setAssignment(p => ({ ...p, workType: v }))}>
                            <SelectTrigger className="bg-black/20 border-white/10 text-xs h-8">
                              <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mechanical">Mechanical</SelectItem>
                              <SelectItem value="electrical">Electrical</SelectItem>
                              <SelectItem value="instrumentation">Instrumentation</SelectItem>
                              <SelectItem value="civil">Civil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">Specialized Team</Label>
                          <Input 
                            className="bg-black/20 border-white/10 h-8 text-xs" 
                            placeholder="e.g. Rotating Equipment Team"
                            value={assignment.team}
                            onChange={(e) => setAssignment(p => ({ ...p, team: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">Assign To (Eng/Sup/Tech)</Label>
                          <Input 
                            className="bg-black/20 border-white/10 h-8 text-xs" 
                            placeholder="Employee Name / ID"
                            value={assignment.assignee}
                            onChange={(e) => setAssignment(p => ({ ...p, assignee: e.target.value }))}
                          />
                        </div>
                      </div>

                      <Button className="w-full gap-2 mt-4" onClick={() => handleReview(selectedRequest.id)}>
                        <User className="w-4 h-4" /> Assign & Review
                      </Button>
                    </div>
                  )}

                  {selectedRequest.status === 'under_review' && (
                    <div className="space-y-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded">
                        <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Assignment Info</p>
                        <p className="text-xs text-white">Type: <span className="text-blue-200">{selectedRequest.form_data?.maintenance_assignment?.workType}</span></p>
                        <p className="text-xs text-white">Team: <span className="text-blue-200">{selectedRequest.form_data?.maintenance_assignment?.team}</span></p>
                        <p className="text-xs text-white">Assigned: <span className="text-blue-200">{selectedRequest.form_data?.maintenance_assignment?.assignee}</span></p>
                      </div>
                      
                      <Button className="w-full gap-2" onClick={() => handleExecute(selectedRequest.id)}>
                        <Hammer className="w-4 h-4" /> Start Execution
                      </Button>
                    </div>
                  )}

                  {selectedRequest.status === 'approved' && (
                    <div className="space-y-4 text-center">
                      <div className="py-8 flex flex-col items-center space-y-3">
                         <div className="w-12 h-12 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin" />
                         <p className="text-sm font-bold text-green-500 uppercase">Work in Progress</p>
                         <p className="text-xs text-muted-foreground">The assigned team is currently performing the work.</p>
                      </div>
                      <Button variant="default" className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={() => handleClose(selectedRequest.id)}>
                        <ClipboardCheck className="w-4 h-4" /> Close & Complete Work
                      </Button>
                    </div>
                  )}

                  {selectedRequest.status === 'closed' && (
                    <div className="py-12 flex flex-col items-center space-y-4 text-center">
                       <div className="w-16 h-16 rounded-full bg-slate-500/20 flex items-center justify-center">
                         <CheckCircle className="w-10 h-10 text-slate-400" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-white uppercase">Work Completed</p>
                         <p className="text-xs text-muted-foreground mt-1">This request has been closed and archived. The record has been returned to the plant and equipment logs.</p>
                       </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4 opacity-50 border-dashed border-2">
                <Search className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-widest">No Request Selected</p>
                  <p className="text-xs text-muted-foreground mt-1">Select a request from the list to view details and take actions.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceManagement;