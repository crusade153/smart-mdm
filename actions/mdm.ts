"use server"

import { getSheetByTitle } from "@/lib/google-sheets";
import { SapMasterData } from "@/types/mdm";
import { MDM_FORM_SCHEMA } from "@/lib/constants/sap-fields";

// 필드 키(예: NTGEW)를 한글 라벨(예: 순중량)로 변환하는 함수
function getFieldLabel(key: string) {
  const field = MDM_FORM_SCHEMA.find(f => f.key === key);
  return field ? field.label : key;
}

// 0. (내부용) 변경 이력 저장 함수
async function logAudit(
  requestId: string,
  actorName: string,
  actionType: string,
  fieldName: string,
  oldValue: string,
  newValue: string
) {
  try {
    const sheet = await getSheetByTitle('audit_logs');
    await sheet.addRow({
      log_id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      request_id: requestId,
      actor_name: actorName,
      action_type: actionType,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}

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
    
    // 생성 로그 기록
    await logAudit(newId, requesterName, 'CREATE', '-', '-', '신규 생성');

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

// 5. 요청 수정 (✅ 변경 감지 및 한글화 로직 강화)
export async function updateRequestAction(requestId: string, data: SapMasterData, actorName: string) {
  try {
    const sheet = await getSheetByTitle('requests');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === requestId);

    if (!row) return { success: false, message: "요청을 찾을 수 없습니다." };

    // [변경 감지 로직]
    const changes: { field: string, label: string, old: string, new: string }[] = [];
    
    Object.entries(data).forEach(([key, newValue]) => {
        const oldValue = row.get(key);
        // 값이 서로 다를 경우에만 기록
        if (String(oldValue || '').trim() !== String(newValue || '').trim()) {
            changes.push({ 
                field: key,
                label: getFieldLabel(key), // 한글 명칭 가져오기
                old: String(oldValue || '(빔)'), 
                new: String(newValue || '(빔)') 
            });
            // 실제 데이터 업데이트
            row.set(key, newValue);
        }
    });

    if (changes.length > 0) {
        await row.save(); // 데이터 저장

        // 변경 이력 저장 (여기서 한글 라벨을 저장합니다)
        await Promise.all(changes.map(change => 
            logAudit(requestId, actorName, 'UPDATE', change.label, change.old, change.new)
        ));
        
        // [수정] 코멘트 요약 메시지 포맷 개선
        // 예: "✏️ [수정] 2개 항목 변경 (순중량: 4 → 5, 자재내역: A → B)"
        const changeDetails = changes.map(c => `${c.label}: ${c.old} → ${c.new}`).join(', ');
        const summary = `✏️ [수정] ${changes.length}개 항목 변경 (${changeDetails})`;
        
        await createCommentAction(requestId, summary, "System");
    }

    return { success: true, message: "수정되었습니다." };
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, message: "수정 중 오류: " + error.message };
  }
}

// 6. 요청 삭제
export async function deleteRequestAction(requestId: string) {
  try {
    const sheet = await getSheetByTitle('requests');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === requestId);

    if (!row) return { success: false, message: "요청을 찾을 수 없습니다." };

    await row.delete(); 
    return { success: true, message: "삭제되었습니다." };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, message: "삭제 중 오류: " + error.message };
  }
}

// 7. 요청 상태 변경
export async function updateStatusAction(requestId: string, status: string, actorName: string) {
  try {
    const sheet = await getSheetByTitle('requests');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === requestId);

    if (!row) return { success: false, message: "요청을 찾을 수 없습니다." };

    const oldStatus = row.get('status');
    
    if (oldStatus !== status) {
        row.set('status', status);
        if (status === 'Approved') {
            row.set('completed_at', new Date().toISOString());
        }
        await row.save(); 

        await logAudit(requestId, actorName, 'STATUS_CHANGE', '상태', oldStatus, status);
    }

    return { success: true, message: "상태가 변경되었습니다." };

  } catch (error: any) {
    console.error("Status Update Error:", error);
    return { success: false, message: "상태 변경 중 오류: " + error.message };
  }
}

// 8. 변경 이력 목록 불러오기
export async function getAuditLogsAction(requestId: string) {
  try {
    const sheet = await getSheetByTitle('audit_logs');
    const rows = await sheet.getRows();
    
    return rows
      .filter(row => row.get('request_id') === requestId)
      .map(row => ({
        id: row.get('log_id'),
        actor: row.get('actor_name'),
        action: row.get('action_type'),
        field: row.get('field_name'),
        oldVal: row.get('old_value'),
        newVal: row.get('new_value'),
        timestamp: row.get('timestamp')
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Audit Fetch Error:", error);
    return [];
  }
}

// [NEW] 컬럼 설명서 데이터 타입 정의
export interface ColumnDef {
  key: string;
  definition: string;
  usage: string;
  risk: string;
}

// [NEW] 9. 컬럼 설명서(FAQ) 불러오기
export async function getColumnDefinitionsAction(): Promise<Record<string, ColumnDef>> {
  try {
    const sheet = await getSheetByTitle('column_defs'); 
    const rows = await sheet.getRows();
    
    const defs: Record<string, ColumnDef> = {};
    
    rows.forEach(row => {
      const key = row.get('field_key');
      if (key) {
        defs[key] = {
          key,
          definition: row.get('definition') || '',
          usage: row.get('usage') || '',
          risk: row.get('risk_factor') || '',
        };
      }
    });

    return defs;
  } catch (error) {
    // 탭이 없거나 오류 발생 시 빈 객체 반환 (앱이 멈추지 않도록)
    console.error("FAQ Fetch Error (탭 'column_defs' 확인 필요):", error);
    return {};
  }
}