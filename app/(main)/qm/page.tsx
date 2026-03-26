"use client"

import { useEffect, useState } from "react"
import { useMDMStore } from "@/stores/useMDMStore"
import { getRequestsAction, updateRequestAction, createCommentAction } from "@/actions/mdm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, RefreshCw, CheckCircle2, Save, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react"

// 한 페이지당 보여줄 항목 수 설정
const ITEMS_PER_PAGE = 15;

export default function QmDashboardPage() {
  const { requests, setRequests, currentUser } = useMDMStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);

  // QM숙성기간 인라인 에디팅을 위한 로컬 상태 관리
  const [qmInputs, setQmInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    setIsLoading(true);
    const data = await getRequestsAction();
    setRequests(data);
    setIsLoading(false);
  };

  useEffect(() => { 
    loadData(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 검색어가 바뀔 때마다 1페이지로 리셋하는 방어 로직
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // '검토완료(ReviewCompleted)' 또는 '승인완료(Approved)' 상태인 항목만 1차 필터링
  const qmTargets = requests.filter(req => 
    (req.status === 'ReviewCompleted' || req.status === 'Approved') &&
    ((req.data.MAKTX || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
     (req.data.MATNR || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
     (req.id || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 💡 페이지네이션 데이터 분할 로직 (Chunking)
  const totalPages = Math.max(1, Math.ceil(qmTargets.length / ITEMS_PER_PAGE));
  const currentData = qmTargets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 로컬 인풋 값 업데이트
  const handleInputChange = (id: string, value: string) => {
    setQmInputs(prev => ({ ...prev, [id]: value }));
  };

  // 데이터 수정 및 검증 완료 처리 로직
  const handleVerify = async (reqId: string, currentMwert: string, isModified: boolean) => {
    const newValue = qmInputs[reqId] ?? currentMwert;

    if (!confirm(isModified ? `숙성기간을 ${newValue}일로 수정하고 검증을 완료하시겠습니까?` : `현재 정보로 검증을 완료하시겠습니까?`)) {
      return;
    }

    setIsSubmitting(prev => ({ ...prev, [reqId]: true }));

    try {
      const targetReq = requests.find(r => r.id === reqId);
      if (!targetReq) throw new Error("요청을 찾을 수 없습니다.");

      // 1. 값 수정이 발생한 경우 DB 업데이트
      if (isModified) {
        const updatedData = { ...targetReq.data, MWERT_11: newValue };
        await updateRequestAction(reqId, updatedData, currentUser?.name || '품질팀');
        
        // 히스토리(채팅)에 수정 기록 남기기
        await createCommentAction(reqId, `🔄 [품질검증] QM숙성기간 수정: ${currentMwert || '없음'}일 ➡️ ${newValue}일`, currentUser?.name || '품질팀');
      } else {
        // 히스토리(채팅)에 확인 기록만 남기기
        await createCommentAction(reqId, `✅ [품질검증] 정보 확인 완료 (수정사항 없음)`, currentUser?.name || '품질팀');
      }

      alert("검증 처리가 완료되었습니다.");
      await loadData(); // 데이터 리로드
      
    } catch (error: any) {
      alert("처리 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [reqId]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 상단 헤더 영역 */}
      <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm shrink-0 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-600" /> 품질팀 검증 대시보드
                </h1>
                <p className="text-sm text-slate-500 mt-1">검토가 완료된 자재의 규격 및 QM숙성기간을 확인하고 수정할 수 있습니다.</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                        placeholder="품명, 자재코드, 요청번호 검색..." 
                        className="pl-9 h-10 bg-slate-50" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading} className="h-10 w-10 text-blue-600 border-blue-200 hover:bg-blue-50">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
                </Button>
            </div>
        </div>
      </div>

      {/* 테이블 및 페이지네이션 영역 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto flex-1 p-2">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[100px] text-center">상태</TableHead>
                <TableHead className="w-[120px]">요청번호</TableHead>
                <TableHead className="w-[140px]">제품코드(MATNR)</TableHead>
                <TableHead className="min-w-[250px]">제품명(MAKTX)</TableHead>
                <TableHead className="w-[180px] text-center">QM숙성기간(MWERT_11)</TableHead>
                <TableHead className="w-[120px] text-center">검증 액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-medium">
                        검증 대기 중인 데이터가 없습니다.
                    </TableCell>
                </TableRow>
              ) : (
                currentData.map((req) => {
                  const originalMwert = req.data.MWERT_11 || "";
                  const localValue = qmInputs[req.id] ?? originalMwert;
                  const isModified = originalMwert !== localValue;
                  const isProcessing = isSubmitting[req.id];

                  return (
                  <TableRow key={req.id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell className="text-center">
                        <Badge className={req.status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                            {req.status === 'Approved' ? '승인완료' : '검토완료'}
                        </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{req.id}</TableCell>
                    <TableCell>
                        {req.data.MATNR ? (
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">{req.data.MATNR}</span>
                        ) : (
                            <span className="text-xs text-slate-400 italic">채번 대기중</span>
                        )}
                    </TableCell>
                    <TableCell>
                        <span className="font-bold text-slate-800 text-sm block truncate max-w-[300px]" title={req.data.MAKTX}>
                            {req.data.MAKTX || '(품명 미입력)'}
                        </span>
                        <span className="text-xs text-slate-400 mt-1 block">단량: {req.data.NTGEW}{req.data.GEWEI} / 기본단위: {req.data.MEINS}</span>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Input 
                                type="number"
                                value={localValue}
                                onChange={(e) => handleInputChange(req.id, e.target.value)}
                                className={`w-20 text-center font-bold h-9 ${isModified ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 bg-slate-50'}`}
                            />
                            <span className="text-sm font-medium text-slate-500">일</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                        {isModified ? (
                            <Button size="sm" disabled={isProcessing} onClick={() => handleVerify(req.id, originalMwert, true)} className="bg-orange-600 hover:bg-orange-700 w-full gap-1">
                                {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3" />} 수정 저장
                            </Button>
                        ) : (
                            <Button size="sm" disabled={isProcessing} onClick={() => handleVerify(req.id, originalMwert, false)} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 w-full gap-1">
                                {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin"/> : <CheckCircle2 className="w-3 h-3" />} 이상 없음
                            </Button>
                        )}
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>

        {/* 💡 페이지네이션 컨트롤 UI */}
        <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div className="text-xs text-slate-500">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of {totalPages}
                <span className="ml-2 text-slate-400">(총 {qmTargets.length}건)</span>
            </div>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft size={16}/>
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage >= totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight size={16}/>
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
}