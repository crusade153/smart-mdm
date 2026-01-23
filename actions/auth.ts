"use server"
import { supabase } from "@/lib/supabase";

// 1. 로그인 처리
export async function loginAction(id: string, pw: string) {
  try {
    const { data, error } = await supabase
        .from('sm_users')
        .select('*')
        .eq('user_id', id)
        .eq('password', pw)
        .single();

    if (error || !data) return { success: false, message: "아이디 또는 비밀번호가 틀립니다." };
    
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

// 2. 회원가입 신청
export async function registerAction(id: string, pw: string, name: string, email: string) {
  try {
    const { data: existing } = await supabase
        .from('sm_users')
        .select('user_id')
        .eq('user_id', id)
        .single();

    if (existing) {
      return { success: false, message: "이미 존재하는 아이디입니다." };
    }

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

// 3. (관리자용) 대기중인 사용자 목록 가져오기
export async function getPendingUsersAction() {
  try {
    const { data, error } = await supabase
        .from('sm_users')
        .select('*')
        .neq('status', 'active');

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

// 4. (관리자용) 사용자 승인 처리
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

// 5. [신규 추가] (관리자용) 전체 회원 명부 가져오기 (페이지네이션)
// 이 함수가 없어서 에러가 발생했습니다. 꼭 포함시켜 주세요.
export async function getAllUsersAction(page: number = 1, pageSize: number = 15) {
  try {
    // 페이지네이션 범위 계산 (0부터 시작)
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 전체 카운트와 데이터 조회
    const { data, error, count } = await supabase
        .from('sm_users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false }) // 최신 가입순
        .range(from, to);

    if (error) throw error;
    
    return { 
      success: true, 
      users: data.map((row: any) => ({
          id: row.user_id,
          name: row.name,
          email: row.email,
          status: row.status,
          createdAt: row.created_at
      })),
      total: count || 0
    };
  } catch (e: any) {
    console.error("Fetch Users Error:", e);
    return { success: false, users: [], total: 0, message: e.message };
  }
}