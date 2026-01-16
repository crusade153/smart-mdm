"use server"
import { supabase } from "@/lib/supabase";

// 로그인 처리 (Supabase sm_users 조회)
export async function loginAction(id: string, pw: string) {
  try {
    // 💡 Supabase에서 ID/PW 일치하는 유저 찾기
    const { data, error } = await supabase
        .from('sm_users')
        .select('*')
        .eq('user_id', id)
        .eq('password', pw)
        .single(); // 하나만 가져옴

    if (error || !data) return { success: false, message: "아이디 또는 비밀번호가 틀립니다." };
    
    // 승인 상태 체크
    if (data.status !== 'active') {
      return { success: false, message: "관리자 승인 대기 중인 계정입니다." };
    }

    return { 
      success: true, 
      user: { 
        id: data.user_id, 
        name: data.name, 
        email: data.email,
        isAdmin: data.role === 'admin' 
      } 
    };
  } catch (e: any) {
    return { success: false, message: "로그인 처리 중 오류: " + e.message };
  }
}

// 회원가입 신청 (Supabase sm_users 저장)
export async function registerAction(id: string, pw: string, name: string, email: string) {
  try {
    // ID 중복 체크 (DB단에서 Unique 제약조건이 있지만, 사용자 친화적 메시지를 위해 체크)
    const { data: existing } = await supabase
        .from('sm_users')
        .select('user_id')
        .eq('user_id', id)
        .single();

    if (existing) {
      return { success: false, message: "이미 존재하는 아이디입니다." };
    }

    // status: 'pending'으로 저장
    const { error } = await supabase.from('sm_users').insert({
      user_id: id, 
      password: pw, 
      name: name, 
      email: email, 
      role: 'user', 
      status: 'pending'
    });

    if (error) throw error;

    return { success: true, message: "가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다." };
  } catch (e: any) {
    return { success: false, message: "가입 처리 중 오류: " + e.message };
  }
}

// (관리자용) 대기중인 사용자 목록 가져오기
export async function getPendingUsersAction() {
  try {
    const { data, error } = await supabase
        .from('sm_users')
        .select('*')
        .neq('status', 'active'); // status가 active가 아닌 것 조회

    if (error) throw error;
    
    return data.map((row: any) => ({
          id: row.user_id,
          name: row.name,
          email: row.email,
          status: row.status
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

// (관리자용) 사용자 승인 처리
export async function approveUserAction(userId: string) {
  try {
    const { error } = await supabase
        .from('sm_users')
        .update({ status: 'active' })
        .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    return { success: false, message: "승인 처리 중 오류: " + e.message };
  }
}