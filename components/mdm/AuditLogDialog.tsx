"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAuditLogsAction } from "@/actions/mdm"
import { Loader2 } from "lucide-react"

interface Props {
  requestId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// ⚠️ 아래 export 키워드가 반드시 있어야 에러가 사라집니다!
export function AuditLogDialog({ requestId, isOpen, onClose }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && requestId) {
      setLoading(true);
      // 서버 액션 호출하여 이력 가져오기
      getAuditLogsAction(requestId)
        .then((data) => {
          setLogs(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, requestId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>📝 데이터 변경 이력</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 mt-2 h-[400px]">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-slate-400 w-8 h-8"/>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-slate-500 py-10 text-sm">변경 이력이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-bold text-slate-700">👤 {log.actor}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  
                  {log.action === 'UPDATE' && (
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold text-indigo-600">{log.field}</span> 값을 
                      <span className="line-through text-slate-400 mx-2 text-xs">{log.oldVal}</span> 
                      → <span className="font-bold text-green-600 ml-1">{log.newVal}</span>(으)로 변경
                    </div>
                  )}
                  
                  {log.action === 'STATUS_CHANGE' && (
                    <div className="text-sm bg-slate-50 p-2 rounded border border-slate-100">
                      상태 변경: <span className="font-bold text-slate-500">{log.oldVal}</span> → <span className="font-bold text-blue-600">{log.newVal}</span>
                    </div>
                  )}

                  {log.action === 'CREATE' && (
                    <div className="text-sm text-slate-600">✨ 요청 신규 생성</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}