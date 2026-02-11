"use client"

import { useState, useEffect } from "react"
import { getFeedbacksAction, createFeedbackAction, replyFeedbackAction, deleteFeedbackAction, FeedbackItem } from "@/actions/faq"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { MessageCircle, Send, Trash2, MessageSquare } from "lucide-react"
import { useMDMStore } from "@/stores/useMDMStore"

export default function CommunityPage() {
  const { currentUser } = useMDMStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [message, setMessage] = useState("");
  const [replyInput, setReplyInput] = useState<Record<string, string>>({}); // 댓글 입력 상태

  const loadFeedbacks = async () => {
    const data = await getFeedbacksAction();
    setFeedbacks(data);
  };

  useEffect(() => { loadFeedbacks(); }, []);

  const handleSubmit = async () => {
    if(!message.trim()) return;
    await createFeedbackAction(currentUser?.name || '익명', 'General', message);
    setMessage("");
    loadFeedbacks();
    alert("게시글이 등록되었습니다.");
  };

  const handleReply = async (id: string) => {
    const text = replyInput[id];
    if (!text?.trim()) return;
    if (!confirm("댓글을 등록하시겠습니까?")) return;
    
    await replyFeedbackAction(id, text, currentUser?.name || '익명');
    setReplyInput(prev => ({...prev, [id]: ""}));
    loadFeedbacks();
  };

  const handleDelete = async (id: string) => {
      if(!confirm("삭제하시겠습니까?")) return;
      await deleteFeedbackAction(id);
      loadFeedbacks();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center py-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">💬 소통 광장</h1>
        <p className="text-slate-500">자유롭게 의견을 나누고 서로 도와주는 공간입니다.</p>
      </div>

      <Card className="p-6 border-indigo-100 shadow-md">
        <div className="flex gap-4">
          <Textarea placeholder="새로운 글을 작성해주세요..." className="min-h-[80px] border-slate-200" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button size="lg" className="h-auto bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit}><Send className="mr-2 h-5 w-5"/> 등록</Button>
        </div>
      </Card>

      <div className="space-y-6">
        {feedbacks.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-lg">{item.writerName}</span>
                <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              {(currentUser?.isAdmin || currentUser?.name === item.writerName) && (
                  <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
              )}
            </div>
            
            <p className="text-slate-800 whitespace-pre-wrap text-base leading-relaxed mb-6">{item.message}</p>
            
            {/* 댓글 영역 (누구나 볼 수 있음) */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                {item.adminReply ? (
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border-l-4 border-indigo-200 pl-3">
                        {item.adminReply}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 italic">아직 댓글이 없습니다.</p>
                )}

                {/* 누구나 댓글 작성 가능 */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                    <Textarea 
                        placeholder="댓글 달기..." 
                        className="min-h-[40px] text-sm bg-white"
                        value={replyInput[item.id] || ""}
                        onChange={(e) => setReplyInput(prev => ({...prev, [item.id]: e.target.value}))}
                    />
                    <Button size="sm" variant="outline" className="h-auto border-indigo-200 text-indigo-700" onClick={() => handleReply(item.id)}>
                        <MessageSquare size={14} className="mr-1"/> 등록
                    </Button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}