"use server"

import { supabase } from "@/lib/supabase"; // ✅ Supabase 클라이언트
import { getSheetByTitle } from "@/lib/google-sheets"; // ✅ 구글 시트 (계층구조용 유지)
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

export interface ColumnDef {
  key: string;
  definition: string;
  usage: string;
  risk: string;
}

// 🚨 [복구] 사용자가 제공한 툴팁 데이터 하드코딩 (Risk 포함)
// ✅ [수정] 환산단위 관련 신규 툴팁 추가
const STATIC_COLUMN_DEFS: Record<string, ColumnDef> = {
  "WERKS": { key: "WERKS", definition: "제품을 생산하거나 보관하고, 유통하는 물리적/논리적 거점 코드", usage: "1021(K1), 1022(K3) 등 공장 지정", risk: "생산/재고가 엉뚱한 공장으로 지정되어 물류 프로세스 마비" },
  "MTART": { key: "MTART", definition: "자재의 성격(원자재, 반제품, 완제품 등)을 구분하는 기준", usage: "FERT(제품), HAWA(상품) 등", risk: "제품 : 하림산업에서 생산, 상품 : 외부에서 구매하여 판매목적" },
  "MAKTX": { key: "MAKTX", definition: "자재를 식별하기 위한 텍스트 설명 (품명)", usage: "예: 푸디버디 빨강라면 컵", risk: "검색 및 식별이 어려워져 오출고/오투입 발생" },
  "MATNR": { key: "MATNR", definition: "시스템 내에서 자재를 식별하는 유일한 ID (Primary Key)", usage: "50000036 (자동 채번)", risk: "중복 생성 시 재고 관리 이원화 및 데이터 정합성 훼손" },
  "MEINS": { key: "MEINS", definition: "재고 관리의 기준이 되는 최소 단위", usage: "EA(개), KG(킬로그램), G(그램)", risk: "모든 수량 계산의 기준이므로 잘못 설정 시 재고 수량 전체 오류" },
  "MATKL": { key: "MATKL", definition: "자재를 리포팅 및 분석 목적으로 묶는 분류 코드", usage: "101010(계육), 804010(라면) 등", risk: "구매/판매 분석 시 데이터가 누락되거나 엉뚱한 그룹으로 집계됨" },
  "PRDHA": { key: "PRDHA", definition: "제품을 마케팅/영업 관점에서 계층적으로 분류한 코드", usage: "대분류>중분류>소분류 (예: 브랜드>카테고리>제품군)", risk: "영업 실적 분석 및 가격 결정(Pricing) 로직 오류 발생" },
  "SPART": { key: "SPART", definition: "영업 조직 내에서 제품을 나누는 단위 (Division)", usage: "00(공통), 10(식품) 등 : 하림산업 00(고정)", risk: "판매 오더(SO) 생성 불가 및 영업 부서별 실적 집계 오류" },
  "NTGEW": { key: "NTGEW", definition: "포장재 무게를 제외한 제품 자체의 순수 무게", usage: "120 (단위: g)", risk: "배부로직에서 배부적수로 사용되어 오류시 원가왜곡" },
  "GEWEI": { key: "GEWEI", definition: "중량 필드(순중량, 총중량)에 적용되는 단위", usage: "G(그램), KG(킬로그램)", risk: "1kg를 1g으로 입력 시 물류비 및 중량 데이터 심각한 왜곡" },
  "MTPOS_MARA": { key: "MTPOS_MARA", definition: "영업 문서(오더) 생성 시 품목 카테고리를 결정하는 기준", usage: "NORM(표준) 고정", risk: "판매 오더 생성 시 품목 처리가 안 되거나 잘못된 유형으로 처리됨" },
  "MEINH": { key: "MEINH", definition: "기본 단위 외에 구매/판매/출고 시 사용하는 대체 단위", usage: "BOX, PAL(팔레트)", risk: "입출고 시 단위 변환 오류로 재고 차이 발생" },
  "UMREZ": { key: "UMREZ", definition: "기본 단위와 환산 단위 간의 변환 비율 (분자)", usage: "1 BOX = 20 EA 일 때 '20'", risk: "단위 변환 비율 오류로 재고 수량 뻥튀기 또는 축소" },
  "UMREN": { key: "UMREN", definition: "기본 단위와 환산 단위 간의 변환 비율 (분모)", usage: "1 BOX = 20 EA 일 때 '1'", risk: "단위 변환 비율 오류로 재고 수량 뻥튀기 또는 축소" },
  "EAN11": { key: "EAN11", definition: "유통 바코드 번호 (국제 표준 상품 번호)", usage: "8801007... (13자리 또는 14자리)", risk: "물류 스캐너 인식 불가 및 POS 판매 불가" },
  "NUMTP": { key: "NUMTP", definition: "입력된 바코드(EAN11)의 유형 정의", usage: "HE(국내 13자리), UC(UPC 코드)", risk: "바코드 유효성 검증 실패로 등록 불가" },
  "VRKME": { key: "VRKME", definition: "고객에게 판매할 때 기준이 되는 단위", usage: "통상 기본단위(EA) 또는 박스(BOX)", risk: "고객 주문 수량과 실제 출고 수량 불일치 발생" },
  "DWERK": { key: "DWERK", definition: "영업 오더 생성 시 기본으로 제안되는 출고 공장", usage: "1021(K1) 등", risk: "오더 생성 시마다 공장을 수동 변경해야 하거나 오출고 위험" },
  "MSTDV": { key: "MSTDV", definition: "특정 유통 채널에서 판매가 허용/금지되는 효력 시작일", usage: "YYYY-MM-DD", risk: "신제품이 출시일 이전에 판매되거나, 단종 제품이 계속 판매됨" },
  "EKGRP": { key: "EKGRP", definition: "자재 구매를 담당하는 구매 담당자 또는 그룹", usage: "A01(원료구매), B01(자재구매)", risk: "구매 요청(PR)이 담당자에게 전달되지 않아 조달 지연" },
  "XCHPF": { key: "XCHPF", definition: "자재를 배치(Batch) 단위로 관리할지 여부 (유통기한/이력관리)", usage: "X (체크 시 배치 관리 대상)", risk: "선입선출(FIFO) 불가, 유통기한 추적 불가, 역추적(Traceability) 불가" },
  "DISPO": { key: "DISPO", definition: "자재의 수급 계획(MRP)을 담당하는 플래너", usage: "M01(담당자 A), M02(담당자 B)", risk: "자재 부족 시 책임 소재 불분명, MRP 결과 확인 누락" },
  "DISMM": { key: "DISMM", definition: "자재의 소요량 계획을 수립하는 방식", usage: "PD(MRP), ND(계획없음), VB(재발주점), 하림산업 : X0 고정", risk: "불필요한 구매/생산 오더가 생성되거나, 필요할 때 오더 미생성" },
  "DISLS": { key: "DISLS", definition: "조달/생산 시 1회 주문하는 수량 결정 로직", usage: "MRP로직 : EX(Lot-for-Lot), FX(고정)", risk: "재고 과다 보유 또는 잦은 발주로 인한 관리 비용 증가" },
  "LGFSB": { key: "LGFSB", definition: "외부 조달(구매) 또는 생산 입고 시 기본 저장 위치", usage: "2101(원료창고), 2200(생산창고)", risk: "MES시스템 연동 데이터로 오류시 실적처리 불가" },
  "BESKZ": { key: "BESKZ", definition: "자재를 얻는 방법 (자체생산 vs 외부구매)", usage: "E(자체생산), F(외부구매), X(둘다)", risk: "생산해야 할 품목이 구매 요청으로 넘어가거나 그 반대 상황 발생" },
  "LGPRO": { key: "LGPRO", definition: "생산 투입 시 자재가 출고되는 기본 저장 위치", usage: "2121(원료창고) 등", risk: "생산 실적 처리 시 재고 부족 오류(COGI) 발생의 주원인" },
  "STRGR": { key: "STRGR", definition: "생산 방식(MTS:재고생산, MTO:주문생산) 결정", usage: "10(MTS), 20(MTO)", risk: "주문 없이 생산되거나, 주문이 들어와도 생산 계획이 안 잡힘" },
  "PERKZ": { key: "PERKZ", definition: "수요 예측 및 계획을 집계하는 기간 단위", usage: "M(월), W(주), D(일)", risk: "생산 계획의 정밀도가 떨어지거나 너무 빈번하게 계획이 변경됨" },
  "SFCPF": { key: "SFCPF", definition: "생산 오더 생성/해제 시 자동 수행할 작업 정의", usage: "HR01 (자동 배치 결정 등)", risk: "생산 오더 발행 시 작업자 수동 업무 증가 및 프로세스 누락" },
  "FEVOR": { key: "FEVOR", definition: "생산 라인이나 공정을 담당하는 관리자/감독자", usage: "P01(라면반), P02(포장반)", risk: "생산 일정 계획(Capacity Planning) 및 작업 지시 혼선" },
  "UEETK": { key: "UEETK", definition: "구매/생산 입고 시 계획 수량보다 많이 입고 가능한지 여부", usage: "X (체크 시 무제한 허용)", risk: "과잉 입고로 인한 재고 부담 및 창고 공간 부족" },
  "TEMPB": { key: "TEMPB", definition: "자재 보관 시 준수해야 할 온도 기준", usage: "01(상온), 02(냉장), 03(냉동)", risk: "제품 변질, 폐기 손실 발생 및 품질 컴플레인" },
  "RAUBE": { key: "RAUBE", definition: "자재 보관 시 필요한 물리적 환경 조건", usage: "01(일반), 02(위험물)", risk: "보관 장소 배정 오류 및 안전 사고 위험" },
  "MHDRZ": { key: "MHDRZ", definition: "출고/판매 시점에 남아있어야 할 최소 유통기한", usage: "30일 (단위: 일)", risk: "유통기한 임박 상품이 출고되어 고객 클레임 및 반품 발생" },
  "MHDHB": { key: "MHDHB", definition: "제품 제조일로부터 만료일까지의 총 유통기한", usage: "365일 (단위: 일)", risk: "유통기한 계산 오류로 인한 폐기 증가 또는 판매 기회 상실" },
  "BKLAS": { key: "BKLAS", definition: "자재의 재고 금액을 회계 계정(G/L)과 연결하는 코드", usage: "3000(원자재), 7920(제품)", risk: "재무제표 상 재고 자산이 엉뚱한 계정으로 잡힘 (분식회계 위험)" },
  "VPRSV": { key: "VPRSV", definition: "재고 자산의 단가 평가 방식 (표준가 vs 이동평균가)", usage: "S(표준가-제품), V(이동평균가-원자재)", risk: "원가 결산 시 자재 원가 왜곡 및 손익 분석 오류" },
  "PEINH_1": { key: "PEINH_1", definition: "자재 단가의 기준 수량", usage: "1, 100, 1000", risk: "단가가 1/100 또는 100배로 뻥튀기되어 심각한 금액 사고 발생" },
  "EKALR": { key: "EKALR", definition: "표준 원가 추정 시 수량 구조(BOM, Routing) 사용 여부", usage: "X (사용함)", risk: "제품 표준 원가 산출이 불가능하여 결산 시 오류 발생" },
  "PRCTR": { key: "PRCTR", definition: "매출 및 비용이 귀속되는 관리 회계 조직 단위", usage: "100000 고정값", risk: "사업부별 손익 계산서(P&L) 산출 불가 및 성과 평가 오류" },
  "LOSGR": { key: "LOSGR", definition: "표준 원가 계산 시 기준이 되는 생산 수량", usage: "통상 1,000 또는 10,000", risk: "고정비 배부 기준이 달라져 제품 표준 원가 왜곡" },
  "KLART": { key: "KLART", definition: "분류(Classification) 시스템의 유형", usage: "001(자재) 고정값", risk: "특성 값을 입력할 수 없어 상세 스펙 관리 불가" },
  "CLASS": { key: "CLASS", definition: "자재에 할당된 구체적인 특성 그룹", usage: "ZMM001(식품특성)", risk: "자재별 상세 속성(크기, 재질 등) 관리 및 검색 불가" },
  "MWERT_11": { key: "MWERT_11", definition: "품질 검사 또는 숙성에 필요한 리드타임", usage: "7 (단위: 일)", risk: "숙성기간 중 가용재고 전환안됨 / 숙성 미완료 제품 출고로 인한 품질 사고" },
  "MWERT_12": { key: "MWERT_12", definition: "물류 박스의 가로 길이", usage: "500 (단위: mm)", risk: "적재 시뮬레이션(Palletizing) 오류 및 창고 공간 효율 저하" },
  "MWERT_13": { key: "MWERT_13", definition: "물류 박스의 세로 길이", usage: "400 (단위: mm)", risk: "적재 시뮬레이션(Palletizing) 오류 및 창고 공간 효율 저하" },
  "MWERT_14": { key: "MWERT_14", definition: "물류 박스의 높이 길이", usage: "300 (단위: mm)", risk: "적재 시뮬레이션(Palletizing) 오류 및 창고 공간 효율 저하" },
  "MWERT_15": { key: "MWERT_15", definition: "팔레트 적재 시 로봇이 수행할 적재 패턴 코드", usage: "P01 (교차적재) 등", risk: "자동화 창고 입고 시 로봇 에러 발생 및 라인 중단" },
  "MWERT_16": { key: "MWERT_16", definition: "한 팔레트에 적재 가능한 최대 박스 수량", usage: "40 (Box/Pallet)", risk: "과적 또는 공간 낭비, 물류비 증가" },
  "MWERT_17": { key: "MWERT_17", definition: "물류 박스 식별용 바코드 (ITF-14 등)", usage: "1880...", risk: "물류 센터 입출고 스캔 불가 및 재고 추적 실패" },
  
  // ✅ 신규 추가된 항목에 대한 툴팁
  "EXTRA_MEINH": { key: "EXTRA_MEINH", definition: "본품의 최소단위를 입력하는 란 (예: 라면 번들 1EA → 4SIK, 만두 350gx2 1EA → 2SIK)", usage: "EA, BOX, SIK, TOT 중 선택", risk: "단위 변환 기준이 잘못되면 재고 수량이 틀어집니다." },
  "EXTRA_UMREZ": { key: "EXTRA_UMREZ", definition: "기본 단위(1 EA)를 구성하는 하위 단위(SIK 등)의 수량", usage: "예: 1번들에 4개가 들어있으면 '4' 입력", risk: "잘못 입력 시 낱개 재고가 뻥튀기되거나 축소됨" },
  "EXTRA_UMREN": { key: "EXTRA_UMREN", definition: "환산 분모 (기준이 되는 단위의 수량)", usage: "항상 '1'로 고정됩니다.", risk: "변경 불가 항목" },
  "EXTRA_EWMCW": { key: "EXTRA_EWMCW", definition: "병렬 단위 타입 (현재 사용 안 함)", usage: "입력 불가", risk: "-" }
};

// 9. 컬럼 설명서(FAQ) 하드코딩된 데이터 반환
export async function getColumnDefinitionsAction(): Promise<Record<string, ColumnDef>> {
  return STATIC_COLUMN_DEFS;
}

// 10. 제품계층구조 불러오기 (Google Sheets 사용 - 그대로 유지)
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