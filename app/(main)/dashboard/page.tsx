"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMDMStore } from "@/stores/useMDMStore"
import { getRequestsAction } from "@/actions/mdm"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, RefreshCw, MessageSquare, ArrowRight, ChevronLeft, ChevronRight, Download, FileText, ListFilter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const ITEMS_PER_PAGE = 15;

export default function DashboardPage() {
  const router = useRouter();
  const { 
    requests, setRequests, createNewRequest, setCurrentRequest,
    selectedIds, toggleSelection, toggleAllSelection, downloadSelectedExcel, currentUser
  } = useMDMStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All'); // 💡 [추가] 상태 필터
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [templateText, setTemplateText] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    const data = await getRequestsAction();
    setRequests(data);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      (req.data.MAKTX || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (req.requesterName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // 💡 [추가] 상태 필터링 로직
    const matchesStatus = statusFilter === 'All' ? true : req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const currentData = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openBulkTemplate = () => {
    const targets = requests.filter(r => selectedIds.includes(r.id));
    if (targets.length === 0) return alert("선택된 항목이 없습니다.");
    
    const today = new Date().toLocaleDateString();
    
    const itemList = targets.map((r, i) => {
        return `
[${i+1}] ${r.data.MAKTX || '품명 미정'}
    - 유형: ${r.data.MTART || '-'} | 플랜트: ${r.data.WERKS || '-'}
    - 규격: ${r.data.MEINS || '-'} / ${r.data.NTGEW || '0'}g
    - 요청번호: ${r.id}
    - 비고: ${r.comments?.filter((c:any) => c.writer !== 'System').pop()?.message || '-'}
        `.trim();
    }).join('\n\n--------------------------------------------------\n\n');

    const text = `
[업무협조의뢰] 신규 자재 코드 생성 요청 (총 ${targets.length}건)

수신: 기준정보 관리 담당자 귀하
발신: ${currentUser?.name || '요청자'}
일자: ${today}

아래와 같이 ${targets.length}건의 자재에 대해 기준정보 생성을 일괄 요청하오니
검토 후 승인 바랍니다.

--------------------------------------------------

${itemList}

--------------------------------------------------

상세 내용은 시스템(Smart MDM)을 참고해주시기 바랍니다.
감사합니다.
    `.trim();

    setTemplateText(text);
    setIsTemplateOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved': return <Badge className="bg-green-100 text-green-700 border-green-200">승인완료</Badge>;
      case 'Reject': return <Badge className="bg-red-100 text-red-700 border-red-200">반려됨</Badge>;
      case 'Review': return <Badge className="bg-orange-100 text-orange-700 border-orange-200">검토중</Badge>;
      default: return <Badge variant="outline" className="text-slate-500 bg-slate-50">요청중</Badge>;
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="max-w-2xl bg-white"><DialogHeader><DialogTitle>일괄 업무협조의뢰</DialogTitle></DialogHeader><div className="py-2"><Textarea value={templateText} readOnly className="h-[450px] bg-slate-50 border-slate-200 font-mono text-sm resize-none"/></div><DialogFooter><Button onClick={() => setIsTemplateOpen(false)}>닫기</Button></DialogFooter></DialogContent>
      </Dialog>

      {/* 1. 상단 툴바 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">요청 목록</h1>
                <p className="text-sm text-slate-500">기준정보 생성 및 변경 요청 현황 (총 {filteredRequests.length}건)</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                {selectedIds.length > 0 && (
                    <>
                        <Button variant="outline" className="h-10" onClick={downloadSelectedExcel}>
                            <Download size={16} className="mr-2"/> 엑셀
                        </Button>
                        <Button variant="outline" className="h-10" onClick={openBulkTemplate}>
                            <FileText size={16} className="mr-2"/> 협조전 ({selectedIds.length})
                        </Button>
                    </>
                )}
                
                <div className="relative flex-1 md:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                    placeholder="검색..." className="pl-9 h-10" 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => { createNewRequest(); router.push('/request/new'); }} className="bg-indigo-600 hover:bg-indigo-700 h-10">
                    <Plus className="w-4 h-4 mr-2"/> 신규
                </Button>
                <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading} className="h-10 w-10">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
                </Button>
            </div>
        </div>

        {/* 💡 [추가] 상태 필터 버튼 그룹 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Requested', 'Review', 'Approved', 'Reject'].map((status) => {
                const label = status === 'All' ? '전체' : status === 'Requested' ? '요청중' : status === 'Review' ? '검토중' : status === 'Approved' ? '승인완료' : '반려됨';
                const isActive = statusFilter === status;
                return (
                    <button 
                        key={status} 
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            isActive 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
      </div>

      {/* 2. 테이블 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[40px] text-center">
                    <Checkbox 
                        checked={currentData.length > 0 && selectedIds.length >= currentData.length}
                        onCheckedChange={(checked) => toggleAllSelection(checked ? currentData.map(r => r.id) : [])}
                    />
                </TableHead>
                <TableHead className="w-[100px]">상태</TableHead>
                <TableHead className="w-[140px]">요청번호</TableHead>
                <TableHead className="min-w-[300px]">품명 (MAKTX)</TableHead>
                <TableHead className="w-[100px]">유형</TableHead>
                <TableHead className="w-[100px]">플랜트</TableHead>
                <TableHead className="w-[120px]">작성자</TableHead>
                <TableHead className="w-[120px]">작성일</TableHead>
                <TableHead className="w-[80px] text-center">댓글</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-40 text-center text-slate-400">데이터가 없습니다.</TableCell></TableRow>
              ) : (
                currentData.map((req) => (
                  <TableRow key={req.id} className="cursor-pointer hover:bg-indigo-50/50 transition-colors group" onClick={() => { setCurrentRequest(req); router.push(`/request/${req.id}`); }}>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.includes(req.id)} onCheckedChange={() => toggleSelection(req.id)}/>
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{req.id}</TableCell>
                    <TableCell><span className="font-bold text-slate-800 block truncate max-w-[400px]">{req.data.MAKTX || '(미입력)'}</span></TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{req.data.MTART}</Badge></TableCell>
                    <TableCell className="text-slate-600 font-medium">{req.data.WERKS}</TableCell>
                    <TableCell className="text-slate-600">{req.requesterName}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      {(req.comments?.length || 0) > 0 && <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-xs font-medium text-slate-600"><MessageSquare size={10}/> {req.comments.length}</div>}
                    </TableCell>
                    <TableCell><ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors"/></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 페이지네이션 */}
        <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs text-slate-500">Page <span className="font-bold text-slate-900">{currentPage}</span> of {Math.max(1, totalPages)}</div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="h-8 w-8 p-0"><ChevronLeft size={16}/></Button>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="h-8 w-8 p-0"><ChevronRight size={16}/></Button>
            </div>
        </div>
      </div>
    </div>
  );
}