"use server"

import { supabase } from "@/lib/supabase"; // ✅ Supabase 클라이언트
import { getSheetByTitle } from "@/lib/google-sheets"; // ✅ 구글 시트 (계층구조/FAQ용 유지)
import { SapMasterData } from "@/types/mdm";
import { MDM_FORM_SCHEMA } from "@/lib/constants/sap-fields";

// 필드 키(예: NTGEW)를 한글 라벨(예: 순중량)로 변환하는 함수
function getFieldLabel(key: string) {
  const field = MDM_FORM_SCHEMA.find(f => f.key === key);
  return field ? field.label : key;
}

// 0. (내부용) 변경 이력 저장 함수 (Supabase)
async function logAudit(
  requestId: string,
  actorName: string,
  actionType: string,
  fieldName: string,
  oldValue: string,
  newValue: string
) {
  try {
    // 💡 sm_audit_logs 테이블에 insert
    const { error } = await supabase.from('sm_audit_logs').insert({
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // ID 생성
        request_id: requestId,
        actor_name: actorName,
        action_type: actionType,
        field_name: fieldName,
        old_value: oldValue,
        new_value: newValue
    });
    if (error) console.error("Audit Log DB Error:", error);
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}

// 1. 요청 생성 (Supabase)
export async function createRequestAction(data: SapMasterData, requesterName: string) {
  try {
    const newId = `REQ-${Date.now()}`;

    // 💡 sm_requests 테이블에 insert (SAP 필드는 sap_data 컬럼에 JSON으로 통째로 저장)
    const { error } = await supabase.from('sm_requests').insert({
        id: newId,
        status: 'Requested',
        requester_name: requesterName,
        sap_data: data // JSONB 컬럼에 객체 바로 저장
    });

    if (error) throw error;
    
    // 생성 로그 기록
    await logAudit(newId, requesterName, 'CREATE', '-', '-', '신규 생성');

    return { success: true, message: "요청이 성공적으로 저장되었습니다.", id: newId };

  } catch (error: any) {
    console.error("Save Error:", error);
    return { success: false, message: "저장 중 오류가 발생했습니다: " + error.message };
  }
}

// 2. 요청 목록 불러오기 (Supabase)
export async function getRequestsAction() {
  try {
    // 💡 sm_requests 테이블 조회 (작성일 역순 정렬)
    const { data, error } = await supabase
        .from('sm_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    // DB 데이터를 프론트엔드 포맷(MaterialRequest)으로 변환
    return data.map((row: any) => ({
        id: row.id,
        status: row.status,
        requesterName: row.requester_name,
        createdAt: row.created_at,
        completedAt: row.completed_at,
        data: row.sap_data, // JSONB -> 객체로 자동 변환됨
        comments: [] // 댓글은 상세 조회 시 가져옴
    }));

  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

// 3. 코멘트 저장 (Supabase)
export async function createCommentAction(requestId: string, message: string, writer: string) {
  try {
    const { error } = await supabase.from('sm_comments').insert({
        id: `CMT-${Date.now()}`,
        request_id: requestId,
        writer_name: writer,
        message: message
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Comment Save Error:", error);
    return { success: false };
  }
}

// 4. 코멘트 불러오기 (Supabase)
export async function getCommentsAction(requestId: string) {
  try {
    const { data, error } = await supabase
        .from('sm_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true }); // 오래된 순 정렬

    if (error) throw error;

    return data.map((row: any) => ({
        writer: row.writer_name,
        message: row.message,
        createdAt: row.created_at
    }));
  } catch (error) {
    console.error("Comment Fetch Error:", error);
    return [];
  }
}

// 5. 요청 수정 (Supabase)
export async function updateRequestAction(requestId: string, data: SapMasterData, actorName: string) {
  try {
    // 1. 기존 데이터 가져오기 (비교용)
    const { data: oldRow, error: fetchError } = await supabase
        .from('sm_requests')
        .select('sap_data')
        .eq('id', requestId)
        .single();

    if (fetchError || !oldRow) return { success: false, message: "요청을 찾을 수 없습니다." };

    const oldData = oldRow.sap_data || {};
    const changes: { label: string, old: string, new: string }[] = [];

    // 2. 변경 감지 로직
    Object.entries(data).forEach(([key, newValue]) => {
        const oldValue = oldData[key];
        
        // 값이 서로 다를 경우
        if (String(oldValue || '').trim() !== String(newValue || '').trim()) {
            const isInitialEntry = !oldValue || String(oldValue).trim() === '';
            // 이력에는 '수정'인 경우만 기록 (최초 입력 제외)
            if (!isInitialEntry) {
                changes.push({ 
                    label: getFieldLabel(key),
                    old: String(oldValue || '(빔)'), 
                    new: String(newValue || '(빔)') 
                });
            }
        }
    });

    // 3. 데이터 업데이트 (JSONB 통째로 업데이트)
    // 주의: Supabase update는 덮어쓰기이므로, 기존 데이터와 병합해서 보내야 안전하지만
    // 현재 폼 로직은 전체 데이터를 보내므로 data를 그대로 저장합니다.
    const { error: updateError } = await supabase
        .from('sm_requests')
        .update({ sap_data: data })
        .eq('id', requestId);

    if (updateError) throw updateError;

    // 4. 이력 및 코멘트 저장
    if (changes.length > 0) {
        await Promise.all(changes.map(change => 
            logAudit(requestId, actorName, 'UPDATE', change.label, change.old, change.new)
        ));
        
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

// 6. 요청 삭제 (Supabase)
export async function deleteRequestAction(requestId: string) {
  try {
    // Cascade 설정 덕분에 requests만 지우면 댓글/로그도 자동 삭제됨
    const { error } = await supabase
        .from('sm_requests')
        .delete()
        .eq('id', requestId);

    if (error) throw error;
    return { success: true, message: "삭제되었습니다." };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, message: "삭제 중 오류: " + error.message };
  }
}

// 7. 요청 상태 변경 (Supabase)
export async function updateStatusAction(requestId: string, status: string, actorName: string) {
  try {
    // 기존 상태 조회
    const { data: row, error: fetchError } = await supabase
        .from('sm_requests')
        .select('status')
        .eq('id', requestId)
        .single();

    if (fetchError) throw fetchError;

    const oldStatus = row.status;
    
    if (oldStatus !== status) {
        const updatePayload: any = { status: status };
        if (status === 'Approved') {
            updatePayload.completed_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
            .from('sm_requests')
            .update(updatePayload)
            .eq('id', requestId);

        if (updateError) throw updateError;

        await logAudit(requestId, actorName, 'STATUS_CHANGE', '상태', oldStatus, status);
    }

    return { success: true, message: "상태가 변경되었습니다." };

  } catch (error: any) {
    console.error("Status Update Error:", error);
    return { success: false, message: "상태 변경 중 오류: " + error.message };
  }
}

// 8. 변경 이력 목록 불러오기 (Supabase)
export async function getAuditLogsAction(requestId: string) {
  try {
    const { data, error } = await supabase
        .from('sm_audit_logs')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map((row: any) => ({
        id: row.id,
        actor: row.actor_name,
        action: row.action_type,
        field: row.field_name,
        oldVal: row.old_value,
        newVal: row.new_value,
        timestamp: row.created_at
    }));
  } catch (error) {
    console.error("Audit Fetch Error:", error);
    return [];
  }
}

// [유지] 컬럼 설명서 데이터 타입 정의
export interface ColumnDef {
  key: string;
  definition: string;
  usage: string;
  risk: string;
}

// [유지] 9. 컬럼 설명서(FAQ) 불러오기 (Google Sheets 사용)
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

// [유지] 10. 제품계층구조 불러오기 (Google Sheets 사용)
export interface HierarchyItem {
  level: number;
  code: string;
  name: string;
  parent: string;
}

export async function getHierarchyAction(): Promise<HierarchyItem[]> {
  try {
    const sheet = await getSheetByTitle('제품계층구조'); 
    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      level: Number(row.get('레벨')),
      code: String(row.get('코드')),
      name: String(row.get('이름')),
      parent: String(row.get('부모코드') || '')
    }));
  } catch (error) {
    console.error("Hierarchy Fetch Error (탭 '제품계층구조' 확인 필요):", error);
    return [];
  }
}