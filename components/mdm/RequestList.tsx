"use client"

import { useMDMStore } from "@/stores/useMDMStore"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ✅ export default 대신 export function 사용
export function RequestList() {
  const { requests, currentRequest, setCurrentRequest, createNewRequest } = useMDMStore()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-blue-500 hover:bg-blue-600';
      case 'Requested': return 'bg-indigo-500 hover:bg-indigo-600';
      case 'Pending': return 'bg-orange-500 hover:bg-orange-600';
      case 'Done': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-slate-500';
    }
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Approved: '검토완료', Requested: '요청', Pending: '보완요청', Done: '채번완료'
    };
    return map[status] || status;
  }

  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white">
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800">자재코드 요청 목록</h2>
          <Button size="sm" onClick={createNewRequest} className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs gap-1">
            <Plus size={14} /> 신규
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="검색..." className="pl-9 h-9 text-sm bg-slate-50" />
        </div>
      </div>

      <ScrollArea className="flex-1 bg-slate-50/50">
        <div className="flex flex-col">
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => setCurrentRequest(req)}
              className={`flex flex-col gap-2 p-4 text-left border-b border-slate-100 transition-all hover:bg-white hover:shadow-sm
                ${currentRequest?.id === req.id ? 'bg-white border-l-4 border-l-indigo-600 shadow-md z-10' : 'border-l-4 border-l-transparent text-slate-600'}
              `}
            >
              <div className="flex justify-between items-start w-full">
                <Badge className={`${getStatusColor(req.status)} text-[10px] px-1.5 py-0.5 border-none shadow-none`}>
                  {getStatusLabel(req.status)}
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">
                  {req.createdAt.split('T')[0]}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-0.5">
                  {req.data.MAKTX || '(자재내역 없음)'}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">
                    {req.data.MATNR || '-'}
                  </span>
                  <span>|</span>
                  <span>{req.requesterName}</span>
                </div>
              </div>

              {req.comments.length > 0 && (
                <div className="self-end mt-1">
                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    💬 {req.comments.length}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}