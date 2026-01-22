"use server"

import { supabase } from "@/lib/supabase";

export interface FeedbackItem {
  id: string;
  createdAt: string;
  writerName: string;
  category: string;
  message: string;
  adminReply?: string;
  replyAt?: string;
  status: 'Pending' | 'Completed';
}

// 1. 피드백 등록
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
    console.error("Feedback Create Error:", e);
    return { success: false, message: "접수 중 오류가 발생했습니다: " + e.message };
  }
}

// 2. 피드백 목록 조회 (최신순)
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
    console.error("Feedback Fetch Error:", e);
    return [];
  }
}

// 3. 관리자 답변 등록
export async function replyFeedbackAction(id: string, reply: string) {
  try {
    const { error } = await supabase
      .from('sm_faq')
      .update({
        admin_reply: reply,
        reply_at: new Date().toISOString(),
        status: 'Completed'
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: "답변이 등록되었습니다." };
  } catch (e: any) {
    return { success: false, message: "답변 등록 오류: " + e.message };
  }
}

// 4. 삭제 기능 (작성자/관리자용)
export async function deleteFeedbackAction(id: string) {
    try {
        const { error } = await supabase.from('sm_faq').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch(e: any) {
        return { success: false, message: e.message };
    }
}