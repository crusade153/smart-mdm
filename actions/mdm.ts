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

// 5. 요청 수정 (✅ 버그 수정: 최초 입력은 수정 이력에서 제외)
export async function updateRequestAction(requestId: string, data: SapMasterData, actorName: string) {
  try {
    const sheet = await getSheetByTitle('requests');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === requestId);

    if (!row) return { success: false, message: "요청을 찾을 수 없습니다." };

    // [변경 감지 로직]
    const changes: { field: string, label: string, old: string, new: string }[] = [];
    let hasUpdates = false; // DB 업데이트가 필요한지 여부 체크

    Object.entries(data).forEach(([key, newValue]) => {
        const oldValue = row.get(key);
        
        // 값이 서로 다를 경우 수행
        if (String(oldValue || '').trim() !== String(newValue || '').trim()) {
            hasUpdates = true; // 값이 바뀌었으므로 저장 필요

            // 🐛 [Fix] 이전 값이 비어있다면(null/undefined/''), 이는 '수정'이 아니라 '최초 입력'입니다.
            const isInitialEntry = !oldValue || String(oldValue).trim() === '';

            // 1. 실제 데이터 업데이트 (DB에는 무조건 반영)
            row.set(key, newValue);

            // 2. 변경 이력(Audit Log)에는 '기존에 값이 있었는데 바뀐 경우'만 추가
            if (!isInitialEntry) {
                changes.push({ 
                    field: key,
                    label: getFieldLabel(key), // 한글 명칭
                    old: String(oldValue || '(빔)'), 
                    new: String(newValue || '(빔)') 
                });
            }
        }
    });

    // 변경사항(최초 입력 포함)이 하나라도 있다면 저장
    if (hasUpdates) {
        await row.save(); 
    }

    // 이력(수정된 경우)이 있다면 로그 및 코멘트 작성
    if (changes.length > 0) {
        // 변경 이력 저장
        await Promise.all(changes.map(change => 
            logAudit(requestId, actorName, 'UPDATE', change.label, change.old, change.new)
        ));
        
        // 코멘트 요약 메시지
        const changeDetails = changes.map(c => `${c.label}: ${c.old} → ${c.new}`).join(', ');
        const summary = `✏️ [수정] ${changes.length}개 항목 변경 (${changeDetails})`;
        
        await createCommentAction(requestId, summary, actorName);
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
    console.error("FAQ Fetch Error (탭 'column_defs' 확인 필요):", error);
    return {};
  }
}

// [NEW] 10. 제품계층구조 불러오기 (구글 시트 연동)
export interface HierarchyItem {
  level: number;
  code: string;
  name: string;
  parent: string;
}

export async function getHierarchyAction(): Promise<HierarchyItem[]> {
  try {
    // 구글 시트의 '제품계층구조' 탭을 가져옵니다.
    const sheet = await getSheetByTitle('제품계층구조'); 
    const rows = await sheet.getRows();
    
    // 데이터를 가공하여 반환합니다.
    return rows.map(row => ({
      level: Number(row.get('레벨')),
      code: String(row.get('코드')),
      name: String(row.get('이름')),
      parent: String(row.get('부모코드') || '') // 부모코드가 없는 경우(L1) 빈 문자열 처리
    }));
  } catch (error) {
    console.error("Hierarchy Fetch Error (탭 '제품계층구조' 확인 필요):", error);
    return [];
  }
}