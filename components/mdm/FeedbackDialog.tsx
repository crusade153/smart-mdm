"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageCircle, Send, CheckCircle2, Trash2 } from "lucide-react"
import { createFeedbackAction, getFeedbacksAction, replyFeedbackAction, deleteFeedbackAction, FeedbackItem } from "@/actions/faq"
import { useMDMStore } from "@/stores/useMDMStore"

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackDialog({ isOpen, onClose }: Props) {
  const { currentUser } = useMDMStore();
  const [activeTab, setActiveTab] = useState("write");
  const [list, setList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 작성용 State
  const [category, setCategory] = useState("Error");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 답변용 State (관리자용)
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    const data = await getFeedbacksAction();
    setList(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
        loadData();
        // 팝업 열릴 때 폼 초기화
        setCategory("Error");
        setMessage("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!message.trim()) return alert("내용을 입력해주세요.");
    
    setIsSubmitting(true);
    const result = await createFeedbackAction(currentUser?.name || "익명", category, message);
    setIsSubmitting(false);

    if (result.success) {
      alert(result.message);
      setMessage("");
      setActiveTab("list"); // 리스트 탭으로 이동
      loadData(); // 리스트 갱신
    } else {
      alert(result.message);
    }
  };

  const handleReply = async (id: string) => {
    const text = replyText[id];
    if (!text?.trim()) return;

    if (!confirm("답변을 등록하시겠습니까?")) return;
    
    // 🚨 [수정됨] 3번째 인자로 작성자 이름(currentUser.name) 전달하여 에러 해결
    const result = await replyFeedbackAction(id, text, currentUser?.name || 'Admin');
    
    if (result.success) {
      loadData();
      setReplyText(prev => ({...prev, [id]: ""})); // 입력창 초기화
    } else {
      alert(result.message);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("정말 삭제하시겠습니까?")) return;
      await deleteFeedbackAction(id);
      loadData();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-indigo-700">
            <MessageCircle className="w-5 h-5" /> 고객센터 (Feedback Center)
          </DialogTitle>
          <DialogDescription>
            시스템 이용 중 불편사항이나 개선 아이디어를 남겨주세요.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write">문의하기</TabsTrigger>
            <TabsTrigger value="list">문의 내역 ({list.length})</TabsTrigger>
          </TabsList>

          {/* 1. 문의 작성 탭 */}
          <TabsContent value="write" className="flex-1 flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">유형 선택</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Error">🐞 버그/오류 신고</SelectItem>
                  <SelectItem value="Feature">💡 기능 제안</SelectItem>
                  <SelectItem value="Other">💬 기타 문의</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-sm font-medium text-slate-700">내용</label>
              <Textarea 
                placeholder="내용을 상세히 적어주시면 빠른 해결에 도움이 됩니다." 
                className="flex-1 resize-none bg-slate-50 min-h-[200px]" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4"/> : <Send className="w-4 h-4"/>}
              문의 접수
            </Button>
          </TabsContent>

          {/* 2. 문의 목록 탭 */}
          <TabsContent value="list" className="flex-1 min-h-0 mt-2">
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400"/></div>
              ) : list.length === 0 ? (
                <div className="text-center text-slate-400 py-10">등록된 문의가 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {list.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-slate-50 space-y-3">
                      
                      {/* 헤더 */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.category === 'Error' ? 'destructive' : 'secondary'}>
                            {item.category === 'Error' ? '버그' : item.category === 'Feature' ? '제안' : '기타'}
                          </Badge>
                          <span className="text-sm font-bold text-slate-700">{item.writerName}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.status === 'Completed' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">답변완료</Badge>
                            ) : (
                            <Badge variant="outline" className="text-slate-500">대기중</Badge>
                            )}
                            {(currentUser?.isAdmin || currentUser?.name === item.writerName) && (
                                <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                            )}
                        </div>
                      </div>

                      {/* 본문 */}
                      <div className="text-sm text-slate-800 whitespace-pre-wrap pl-1">
                        {item.message}
                      </div>

                      {/* 관리자 답변 영역 */}
                      {item.adminReply ? (
                        <div className="mt-3 bg-white border border-indigo-100 rounded p-3 flex gap-3">
                          <div className="mt-0.5"><CheckCircle2 className="w-5 h-5 text-indigo-600"/></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-indigo-800">관리자 답변</span>
                                <span className="text-[10px] text-slate-400">{item.replyAt ? new Date(item.replyAt).toLocaleDateString() : ''}</span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.adminReply}</p>
                          </div>
                        </div>
                      ) : (
                        currentUser?.isAdmin && (
                          <div className="mt-2 flex gap-2">
                            <Textarea 
                              placeholder="관리자 답변 입력..." 
                              className="text-xs min-h-[40px] bg-white"
                              value={replyText[item.id] || ""}
                              onChange={(e) => setReplyText(prev => ({...prev, [item.id]: e.target.value}))}
                            />
                            <Button size="sm" variant="outline" className="h-auto" onClick={() => handleReply(item.id)}>등록</Button>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}