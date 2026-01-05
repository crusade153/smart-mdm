// src/components/mdm/MDMKanban.tsx
"use client"

import { useMemo } from "react"
import { useMDMStore } from "@/stores/useMDMStore"
import { MaterialRequest, RequestStatus } from "@/types/mdm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MDMForm } from "./MDMForm" // 기존 폼 재사용

const COLUMNS: { id: RequestStatus; label: string; color: string }[] = [
  { id: 'Requested', label: '요청 (Requested)', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Review', label: '진행 (Review)', color: 'bg-orange-100 text-orange-700' },
  { id: 'Approved', label: '완료 (Approved)', color: 'bg-green-100 text-green-700' },
  { id: 'Reject', label: '중지 (Reject)', color: 'bg-red-100 text-red-700' },
];

export function MDMKanban() {
  const { requests, downloadSapCsv, setCurrentRequest, updateStatus } = useMDMStore()

  // 상태별로 데이터 분류
  const boardData = useMemo(() => {
    const data: Record<string, MaterialRequest[]> = { Requested: [], Review: [], Approved: [], Reject: [] };
    requests.forEach(req => data[req.status]?.push(req));
    return data;
  }, [requests]);

  // 드래그 앤 드롭 대신 간단하게 버튼으로 상태 이동 구현 (모바일/PC 호환성 위해)
  const moveCard = (e: React.MouseEvent, id: string, nextStatus: RequestStatus) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    updateStatus(id, nextStatus);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-100">
      
      {/* 상단 툴바 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">자재 마스터 현황판</h1>
          <p className="text-sm text-slate-500">전체 {requests.length}건 / 완료 {boardData.Approved.length}건</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-white" onClick={downloadSapCsv}>
            <Download size={16} /> SAP 업로드 양식 다운로드
          </Button>
          
          {/* 신규 등록 버튼 (클릭 시 우측 시트 열림) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => setCurrentRequest(null)}>
                <Plus size={16} /> 신규 요청
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[900px] sm:w-[1000px] overflow-y-auto bg-slate-50 p-0">
               <MDMForm />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 칸반 보드 영역 */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0 overflow-hidden">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 h-full overflow-hidden shadow-sm">
            {/* 컬럼 헤더 */}
            <div className={`p-3 font-bold text-sm flex justify-between items-center border-b ${col.color.replace('text', 'bg').replace('100', '50')} ${col.color}`}>
              {col.label}
              <span className="bg-white/50 px-2 py-0.5 rounded text-xs">
                {boardData[col.id].length}
              </span>
            </div>

            {/* 카드 리스트 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {boardData[col.id].map((item) => (
                <Sheet key={item.id}>
                  <SheetTrigger asChild>
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-all hover:border-indigo-300 group"
                      onClick={() => setCurrentRequest(item)}
                    >
                      <CardHeader className="p-3 pb-2 space-y-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                          {/* 상태 이동 버튼 (간이) */}
                          {col.id === 'Requested' && <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 bg-slate-100 hover:bg-orange-100 text-slate-500 hover:text-orange-600" onClick={(e) => moveCard(e, item.id, 'Review')}>진행 ▶</Button>}
                          {col.id === 'Review' && <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 bg-slate-100 hover:bg-green-100 text-slate-500 hover:text-green-600" onClick={(e) => moveCard(e, item.id, 'Approved')}>완료 ▶</Button>}
                        </div>
                        <CardTitle className="text-sm font-bold leading-tight pt-1">
                          {item.data.MAKTX || '(품명 미입력)'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="flex justify-between items-end mt-2 text-xs text-slate-500">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">{item.requesterName}</span>
                            <span className="text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                          {item.comments.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-1">
                              💬 {item.comments.length}
                            </Badge>
                          )}
                        </div>
                        {item.status === 'Approved' && item.processorName && (
                          <div className="mt-2 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">
                            ✓ 승인자: {item.processorName}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </SheetTrigger>
                  
                  {/* 클릭 시 우측에서 열리는 상세 화면 */}
                  <SheetContent className="w-[900px] sm:w-[1000px] overflow-y-auto bg-slate-50 p-0">
                    <MDMForm />
                  </SheetContent>
                </Sheet>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}