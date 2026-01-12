"use client"

import { useState, useMemo } from "react"
import { useMDMStore } from "@/stores/useMDMStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const STATUS_CONFIG: Record<string, { char: string; label: string; color: string; bg: string }> = {
  Requested: { char: '요', label: '요청 (Requested)', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  Review:    { char: '진', label: '진행 (Review)',    color: 'text-orange-600', bg: 'bg-orange-100' },
  Approved:  { char: '완', label: '완료 (Approved)',  color: 'text-green-600',  bg: 'bg-green-100' },
  Reject:    { char: '거', label: '거절 (Reject)',    color: 'text-red-600',    bg: 'bg-red-100' },
}

export function RequestTable() {
  const { 
    requests, currentRequest, setCurrentRequest, createNewRequest,
    selectedIds, toggleSelection, toggleAllSelection, downloadSelectedCsv 
  } = useMDMStore()
  
  const [searchTerm, setSearchTerm] = useState("")

  // useMemo로 검색 성능 최적화
  const filteredRequests = useMemo(() => {
    return requests.filter(req => 
      (req.data.MAKTX || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (req.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||         
      (req.requesterName || "").toLowerCase().includes(searchTerm.toLowerCase()) 
    );
  }, [requests, searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    toggleAllSelection(checked ? filteredRequests.map(r => r.id) : []);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      
      {/* 1. 상단 툴바 */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50 shrink-0">
        
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
            📋 요청 목록 <span className="text-slate-400 text-xs font-normal">({filteredRequests.length})</span>
          </h2>
          <Button 
            size="sm" 
            className="h-7 bg-indigo-600 hover:bg-indigo-700 text-xs gap-1 shadow-sm"
            onClick={createNewRequest}
          >
            <Plus size={14} /> 신규
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="품명, ID, 요청자..." 
            className="pl-9 h-9 text-sm bg-white border-slate-200 focus-visible:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 justify-start items-center pt-1 overflow-x-auto no-scrollbar">
          {Object.values(STATUS_CONFIG).map((conf) => (
            <div key={conf.char} className="flex items-center gap-1">
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${conf.bg} ${conf.color}`}>
                {conf.char}
              </span>
              <span className="text-[10px] text-slate-500">{conf.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-1">
            <span className="text-xs font-bold text-green-700 ml-1">{selectedIds.length}건 선택됨</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs border-green-300 bg-white text-green-700 hover:bg-green-100 gap-1" 
              onClick={downloadSelectedCsv}
            >
              <Download size={12} /> SAP CSV
            </Button>
          </div>
        )}
      </div>

      {/* 2. 리스트 헤더 */}
      <div className="flex items-center px-4 py-2 border-b bg-slate-100 text-xs font-bold text-slate-500 shrink-0">
        <div className="w-[30px] flex justify-center">
          <Checkbox 
            checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length}
            onCheckedChange={handleSelectAll}
            className="border-slate-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
          />
        </div>
        <div className="flex-1 ml-3">요청 내역</div>
        <div className="w-[30px] text-center">상태</div>
      </div>

      {/* 3. 리스트 목록 (스크롤 영역) */}
      {/* flex-1 min-h-0을 주어 flex 컨테이너 안에서 스크롤이 정상 작동하도록 강제함 */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full bg-white">
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => {
              const isSelected = currentRequest?.id === req.id;
              const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG['Requested'];

              return (
                <div 
                  key={req.id} 
                  className={`flex items-start px-4 py-3.5 transition-all cursor-pointer group relative
                    ${isSelected ? 'bg-indigo-50 hover:bg-indigo-50' : 'hover:bg-slate-50'}
                    ${isSelected ? 'border-l-4 border-l-indigo-600 pl-[12px]' : 'border-l-4 border-l-transparent'}
                  `}
                  onClick={() => setCurrentRequest(req)}
                >
                  <div className="w-[30px] flex justify-center pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.includes(req.id)}
                      onCheckedChange={() => toggleSelection(req.id)}
                      className="border-slate-300 data-[state=checked]:bg-indigo-600"
                    />
                  </div>

                  <div className="flex-1 ml-3 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{req.id}</span>
                      <span className="text-[10px] text-slate-400">| {req.requesterName}</span>
                    </div>
                    
                    <p className={`text-sm font-bold truncate leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {req.data.MAKTX || '(품명 미입력)'}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1 h-4 rounded-sm border-slate-200 bg-slate-50 text-slate-600 font-normal">
                        {req.data.MTART || '-'}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{req.createdAt.split('T')[0]}</span>
                    </div>
                  </div>

                  <div className="w-[30px] flex justify-center items-start pt-0.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border ${statusConf.bg} ${statusConf.color} border-transparent shadow-sm`}>
                            {statusConf.char}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>{statusConf.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}