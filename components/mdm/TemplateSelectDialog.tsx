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
      const searchLower = searchTerm.toLowerCase();
      return (req.data.MAKTX || "").toLowerCase().includes(searchLower) ||
             (req.id || "").toLowerCase().includes(searchLower) ||
             (req.data.MATNR || "").toLowerCase().includes(searchLower) ||
             (req.requesterName || "").toLowerCase().includes(searchLower);
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
              <p className="text-xs opacity-70">(모든 상태의 자재를 불러올 수 있습니다)</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((req) => {
                const statusLabel: Record<string, string> = {
                  Requested: '작성요청', Review: '검토중', ReviewCompleted: '검토완료',
                  Approved: '승인완료', Reject: '반려'
                };
                const statusColor: Record<string, string> = {
                  Requested: 'bg-indigo-100 text-indigo-700',
                  Review: 'bg-orange-100 text-orange-700',
                  ReviewCompleted: 'bg-blue-100 text-blue-700',
                  Approved: 'bg-green-600 text-white',
                  Reject: 'bg-red-100 text-red-700',
                };
                return (
                  <div key={req.id} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex items-start gap-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] shrink-0 mt-0.5 ${statusColor[req.status] ?? 'bg-slate-100 text-slate-600'}`}
                          >
                            {statusLabel[req.status] ?? req.status}
                          </Badge>
                          <span className="font-bold text-sm text-slate-800 break-words leading-snug">{req.data.MAKTX || '(품명 미입력)'}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="font-mono text-slate-400">{req.id}</span>
                          <span className="flex items-center gap-1">
                            <User size={10} className="text-slate-400"/> {req.requesterName}
                          </span>
                          {req.data.MATNR && (
                            <span className="bg-slate-100 px-1.5 rounded text-slate-600 font-mono">
                              {req.data.MATNR}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => onSelect(req)}
                      >
                        <Copy size={13} />
                        불러오기
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}