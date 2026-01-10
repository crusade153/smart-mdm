"use server"

import { getSheetByTitle } from "@/lib/google-sheets";
import { SapMasterData } from "@/types/mdm";

// 1. 요청 생성 (저장)
export async function createRequestAction(data: SapMasterData, requesterName: string) {
  try {
    const sheet = await getSheetByTitle('requests');
    const newId = `REQ-${Date.now()}`; 
    const now = new Date().toISOString();

    const newRow = {
      id: newId,
      status: 'Requested',
      requester_name: requesterName,
      created_at: now,
      completed_at: '',
      ...data
    };

    await sheet.addRow(newRow);
    return { success: true, message: "요청이 성공적으로 저장되었습니다.", id: newId };

  } catch (error: any) {
    console.error("Save Error:", error);
    return { success: false, message: "저장 중 오류가 발생했습니다: " + error.message };
  }
}

// 2. 요청 목록 불러오기
export async function getRequestsAction() {
  try {
    const sheet = await getSheetByTitle('requests');
    const rows = await sheet.getRows();
    const sortedRows = rows.reverse(); 

    const headers = sheet.headerValues; 

    const requests = sortedRows.map(row => {
      const sapData: any = {};
      const metaKeys = ['id', 'status', 'requester_name', 'created_at', 'completed_at'];
      
      headers.forEach((key: string) => {
        if (!metaKeys.includes(key)) {
          sapData[key] = row.get(key);
        }
      });

      return {
        id: row.get('id'),
        status: row.get('status'),
        requesterName: row.get('requester_name'),
        createdAt: row.get('created_at'),
        completedAt: row.get('completed_at'),
        data: sapData,
        comments: [] 
      };
    });

    return requests;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

// 3. 코멘트 저장
export async function createCommentAction(requestId: string, message: string, writer: string) {
  try {
    const sheet = await getSheetByTitle('comments');
    await sheet.addRow({
      comment_id: `CMT-${Date.now()}`,
      request_id: requestId,
      writer_name: writer,
      message: message,
      created_at: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Comment Save Error:", error);
    return { success: false };
  }
}

// 4. 코멘트 불러오기
export async function getCommentsAction(requestId: string) {
  try {
    const sheet = await getSheetByTitle('comments');
    const rows = await sheet.getRows();
    
    const comments = rows
      .filter(row => row.get('request_id') === requestId)
      .map(row => ({
        writer: row.get('writer_name'),
        message: row.get('message'),
        createdAt: row.get('created_at')
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
    return comments;
  } catch (error) {
    console.error("Comment Fetch Error:", error);
    return [];
  }
}

// ✅ [NEW] 5. 요청 수정 (Update)
export async function updateRequestAction(requestId: string, data: SapMasterData) {
  try {
    const sheet = await getSheetByTitle('requests');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === requestId);

    if (!row) return { success: false, message: "요청을 찾을 수 없습니다." };

    // 데이터 업데이트
    Object.entries(data).forEach(([key, value]) => {
        row.set(key, value);
    });
    
    await row.save(); // 변경사항 저장
    return { success: true, message: "수정되었습니다." };
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, message: "수정 중 오류: " + error.message };
  }
}

// ✅ [NEW] 6. 요청 삭제 (Delete)
export async function deleteRequestAction(requestId: string) {
  try {
    const sheet = await getSheetByTitle('requests');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === requestId);

    if (!row) return { success: false, message: "요청을 찾을 수 없습니다." };

    await row.delete(); // 행 삭제
    return { success: true, message: "삭제되었습니다." };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, message: "삭제 중 오류: " + error.message };
  }
}