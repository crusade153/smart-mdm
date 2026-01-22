"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Copy, User } from "lucide-react"
import { useMDMStore } from "@/stores/useMDMStore"
import { MaterialRequest } from "@/types/mdm"

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (req: MaterialRequest) => void;
}

export function TemplateSelectDialog({ isOpen, onClose, onSelect }: Props) {
  const { requests } = useMDMStore(); 
  const [searchTerm, setSearchTerm] = useState("");

  const templates = useMemo(() => {
    return requests.filter(req => {
      // 1. 상태 체크: Review(검토)나 Reject(거절)가 아니면 복사 가능
      const isCopyable = req.status !== 'Review' && req.status !== 'Reject';
      
      if (!isCopyable) return false;

      // 2. 검색어 필터
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = (req.data.MAKTX || "").toLowerCase().includes(searchLower) ||
                          (req.id || "").toLowerCase().includes(searchLower) ||
                          (req.data.MATNR || "").toLowerCase().includes(searchLower) ||
                          (req.requesterName || "").toLowerCase().includes(searchLower);

      return matchSearch;
    });
  }, [requests, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[600px] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Copy className="h-5 w-5 text-indigo-600" />
            기존 자재 불러오기 (따라하기)
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="품명, 자재코드, 요청자, 요청번호로 검색..." 
            className="pl-9 bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 border rounded-md mt-2 bg-slate-50/50 p-2">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
              <Search className="h-8 w-8 opacity-20" />
              <p>복사할 수 있는 자재가 없습니다.</p>
              <p className="text-xs opacity-70">(진행 중(Review)이거나 반려된(Reject) 건은 표시되지 않습니다)</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((req) => (
                <div key={req.id} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={req.status === 'Approved' ? 'default' : 'secondary'} 
                        className={`text-[10px] shrink-0 ${req.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                      >
                        {req.status === 'Approved' ? '승인완료' : '작성요청'}
                      </Badge>
                      <span className="font-bold text-sm text-slate-800 truncate">{req.data.MAKTX || '(품명 미입력)'}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1 font-mono text-slate-400">{req.id}</span>
                      <span className="flex items-center gap-1">
                        <User size={10} className="text-slate-400"/> {req.requesterName}
                      </span>
                      {req.data.MATNR && (
                        <span className="flex items-center gap-1 bg-slate-100 px-1.5 rounded text-slate-600 font-mono">
                          {req.data.MATNR}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* ⚡ 수정됨: min-w-fit 및 px-4 추가로 텍스트 잘림 방지 */}
                  <Button 
                    size="sm" 
                    className="gap-2 shrink-0 bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 px-4 min-w-fit" 
                    variant="outline" 
                    onClick={() => onSelect(req)}
                  >
                    <Copy size={14} /> 
                    <span className="whitespace-nowrap font-medium">불러오기</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}