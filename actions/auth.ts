"use server"
import { getSheetByTitle } from "@/lib/google-sheets";

// 로그인 처리
export async function loginAction(id: string, pw: string) {
  try {
    const sheet = await getSheetByTitle('users');
    const rows = await sheet.getRows();
    
    const user = rows.find(row => row.get('user_id') === id && row.get('password') === pw);

    if (!user) return { success: false, message: "아이디 또는 비밀번호가 틀립니다." };
    
    // 승인 상태 체크
    if (user.get('status') !== 'active') {
      return { success: false, message: "관리자 승인 대기 중인 계정입니다." };
    }

    return { 
      success: true, 
      user: { 
        id: user.get('user_id'), 
        name: user.get('name'), 
        email: user.get('email'),
        isAdmin: user.get('role') === 'admin' 
      } 
    };
  } catch (e: any) {
    return { success: false, message: "로그인 처리 중 오류: " + e.message };
  }
}

// 회원가입 신청
export async function registerAction(id: string, pw: string, name: string, email: string) {
  try {
    const sheet = await getSheetByTitle('users');
    const rows = await sheet.getRows();

    if (rows.some(row => row.get('user_id') === id)) {
      return { success: false, message: "이미 존재하는 아이디입니다." };
    }

    // status: 'pending'으로 저장
    await sheet.addRow({
      user_id: id, password: pw, name, email, role: 'user', status: 'pending'
    });

    return { success: true, message: "가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다." };
  } catch (e: any) {
    return { success: false, message: "가입 처리 중 오류: " + e.message };
  }
}

// (관리자용) 대기중인 사용자 목록 가져오기
export async function getPendingUsersAction() {
  try {
    const sheet = await getSheetByTitle('users');
    const rows = await sheet.getRows();
    
    return rows
      .filter(row => row.get('status') !== 'active')
      .map(row => ({
          id: row.get('user_id'),
          name: row.get('name'),
          email: row.get('email'),
          status: row.get('status')
      }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

// (관리자용) 사용자 승인 처리
export async function approveUserAction(userId: string) {
  try {
    const sheet = await getSheetByTitle('users');
    const rows = await sheet.getRows();
    const userRow = rows.find(row => row.get('user_id') === userId);

    if (userRow) {
      userRow.set('status', 'active');
      await userRow.save();
      return { success: true };
    }
    return { success: false, message: "사용자를 찾을 수 없습니다." };
  } catch (e: any) {
    return { success: false, message: "승인 처리 중 오류: " + e.message };
  }
}