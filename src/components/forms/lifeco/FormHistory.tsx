import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Eye, Filter, Calendar, History } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getFormHistory } from "@/lib/forms.functions";
import { format } from "date-fns";

export default function FormHistory({ departmentKey, plantCode, onBack }: { departmentKey?: string, plantCode?: string, onBack?: () => void }) {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  
  const getHistoryFn = useServerFn(getFormHistory);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getHistoryFn({ 
          data: {
            department_key: departmentKey,
            plant_code: plantCode,
            status: filterStatus === 'ALL' ? undefined : filterStatus,
            form_type: filterType === 'ALL' ? undefined : filterType
          }
        });
        setForms(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [departmentKey, plantCode, filterStatus, filterType]);

  const filteredForms = forms.filter(f => 
    f.form_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.equipment?.asset_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.created_by_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-500">Approved</Badge>;
      case 'submitted': return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'under_review': return <Badge className="bg-amber-500">Review</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'work_permit': return 'Work Permit';
      case 'electrical_permit': return 'Electrical Permit';
      case 'work_request': return 'Work Request';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 p-4">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> العودة
        </Button>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="w-5 h-5" /> سجل النماذج والتصاريح
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="البحث برقم التصريح أو المعدة..." 
              className="pl-9 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل الأنواع</SelectItem>
              <SelectItem value="work_permit">تصريح عمل</SelectItem>
              <SelectItem value="electrical_permit">تصريح كهرباء</SelectItem>
              <SelectItem value="work_request">طلب عمل</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل الحالات</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="submitted">مقدم</SelectItem>
              <SelectItem value="approved">معتمد</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>رقم النموذج</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>المعدة</TableHead>
              <TableHead>بواسطة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-slate-400 italic">جاري التحميل...</TableCell>
              </TableRow>
            ) : filteredForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-slate-400 italic">لا توجد سجلات مطابقة</TableCell>
              </TableRow>
            ) : (
              filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-bold font-mono">{form.form_number}</TableCell>
                  <TableCell>{getFormTypeLabel(form.form_type)}</TableCell>
                  <TableCell>{form.equipment?.asset_code || 'N/A'}</TableCell>
                  <TableCell>{form.created_by_name}</TableCell>
                  <TableCell className="text-xs">{format(new Date(form.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>{getStatusBadge(form.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                       <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                       <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
