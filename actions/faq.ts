"use server"

import { supabase } from "@/lib/supabase";

export interface FeedbackItem {
  id: string;
  createdAt: string;
  writerName: string;
  category: string;
  message: string;
  adminReply?: string; // 💡 사실상 '댓글 스레드'로 사용
  replyAt?: string;
  status: 'Pending' | 'Completed';
}

// 1. 피드백 등록 (기존 동일)
export async function createFeedbackAction(writerName: string, category: string, message: string) {
  try {
    const { error } = await supabase.from('sm_faq').insert({
      writer_name: writerName,
      category: category,
      message: message,
      status: 'Pending'
    });
    if (error) throw error;
    return { success: true, message: "소중한 의견이 접수되었습니다." };
  } catch (e: any) {
    return { success: false, message: "접수 중 오류: " + e.message };
  }
}

// 2. 피드백 목록 조회 (기존 동일)
export async function getFeedbacksAction() {
  try {
    const { data, error } = await supabase
      .from('sm_faq')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      writerName: row.writer_name,
      category: row.category,
      message: row.message,
      adminReply: row.admin_reply,
      replyAt: row.reply_at,
      status: row.status
    } as FeedbackItem));
  } catch (e) {
    return [];
  }
}

// 💡 [수정됨] 누구나 댓글 달기 (Append 방식)
export async function replyFeedbackAction(id: string, replyText: string, writerName: string) {
  try {
    // 1. 기존 댓글 가져오기
    const { data: current } = await supabase.from('sm_faq').select('admin_reply').eq('id', id).single();
    
    // 2. 새 댓글 포맷팅 (채팅처럼 보이게)
    const time = new Date().toLocaleString();
    const newEntry = `\n\n[${writerName}] (${time})\n${replyText}`;
    
    // 3. 기존 내용에 덧붙이기
    const updatedReply = (current?.admin_reply || "") + newEntry;

    const { error } = await supabase
      .from('sm_faq')
      .update({
        admin_reply: updatedReply,
        reply_at: new Date().toISOString(),
        status: 'Completed' // 댓글 달리면 완료 처리 (선택사항)
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: "댓글이 등록되었습니다." };
  } catch (e: any) {
    return { success: false, message: "댓글 등록 오류: " + e.message };
  }
}

// 4. 삭제 (기존 동일)
export async function deleteFeedbackAction(id: string) {
    try {
        const { error } = await supabase.from('sm_faq').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch(e: any) {
        return { success: false, message: e.message };
    }
}