// types/mdm.ts

export interface SapMasterData {
  // [Key Fields] 핵심 키
  WERKS: string;       // 플랜트
  MATNR?: string;      // 자재코드
  MTART: 'FERT' | 'ROH' | 'ZSET'; // 자재유형
  MAKTX: string;       // 자재내역

  // [Basic Data] 기본 정보
  MEINS: string;       // 기본단위
  MATKL: string;       // 자재그룹
  EXTWG?: string;      // 외부자재그룹
  BISMT?: string;      // 기존자재번호
  SPART: string;       // 제품군
  LABOR?: string;      // 실험실
  MSTAE?: string;      // 자재상태
  MSTDE?: string;      // 상태시작일
  MAGRV?: string;      // 포장재그룹
  PRDHA: string;       // 제품계층구조
  MTPOS_MARA: string;  // 품목범주그룹

  // [Dimensions] 중량/크기
  BRGEW?: number;      // 총중량
  NTGEW: number;       // 순중량
  GEWEI: string;       // 중량단위
  GROES?: string;      // 크기/치수

  // [Unit Conversion] 환산 단위
  MEINH: string;       // 환산단위
  UMREZ: number;       // 환산분자
  UMREN: number;       // 환산분모
  NUMTP: string;       // EAN 범주
  EAN11: string;       // EAN/UPC
  EWMCW?: string;      // 병렬단위 Type

  // [Sales] 영업
  VRKME: string;       // 판매단위
  ALAND?: string;      // 세금국가
  TATYP?: string;      // 세금범주
  TAXKM?: string;      // 세금분류
  DWERK?: string;      // 납품플랜트
  MSTAV?: string;      // 유통상태
  MSTDV?: string;      // 유통상태시작일
  VERSG?: string;      // 자재통계그룹
  KONDM?: string;      // 자재가격그룹
  KTGRM?: string;      // 계정지정그룹
  MVGR1?: string;      // 자재그룹1~5
  MVGR2?: string;
  MVGR3?: string;
  MVGR4?: string;
  MVGR5?: string;
  SKTOF?: string;      // 현금할인지시자
  MTVFP?: string;      // 가용성점검
  LADGR?: string;      // 적하그룹
  TRAGR?: string;      // 운송그룹

  // [Purchasing & MRP] 구매/MRP
  BSTME?: string;      // 구매단위
  EKGRP?: string;      // 구매그룹
  VABME?: string;      // 가변단위
  MFRNR?: string;      // 매입처
  MFRPN?: string;      // 부품코드
  MMSTA?: string;      // 플랜트 자재상태
  MMSTD?: string;      // 효력 시작일
  XCHPF: string;       // 배치관리
  DISMM: string;       // MRP유형
  DISLS: string;       // 로트크기
  MAABC?: string;      // ABC지시자
  DISPO: string;       // MRP관리자
  BSTMI?: number;      // 최소로트
  BSTMA?: number;      // 최대로트
  BSTFE?: number;      // 고정로트
  BSTRF?: number;      // 반올림값
  BESKZ: string;       // 조달유형
  SOBSL?: string;      // 특별조달유형
  LGPRO: string;       // 생산저장위치
  LGFSB: string;       // EP저장위치
  KZKUP?: string;      // 연산품
  DZEIT?: number;      // 내부생산시간
  PLIFZ?: number;      // 계획납품시간
  FHORI?: string;      // 일정마진키
  EISBE?: number;      // 안전재고
  PERKZ: string;       // 기간지시자
  STRGR: string;       // 전략그룹

  // [Work Scheduling] 작업 일정
  SFCPF: string;       // 생산일정프로파일
  FEVOR: string;       // 감독지시자
  UEETK: string;       // 무제한초과납품

  // [Plant Data / Storage] 저장 데이터
  TEMPB: string;       // 온도조건
  RAUBE: string;       // 저장조건
  MHDRZ: number;       // 최소잔존수명
  MHDHB: number;       // 총셸프라이프
  IPRKZ?: string;      // SLED지시자

  // [Accounting & Costing] 회계/원가
  BKLAS: string;       // 평가클래스
  BWTTY?: string;      // 평가범주
  MLMAA?: string;      // ML Act.
  VPRSV: string;       // 가격결정
  MLAST?: string;      // 가격관리
  STPRS?: number;      // 표준가격
  VERPR?: number;      // 이동평균가
  PEINH_1: number;     // 가격단위
  EKALR: string;       // 가격구조
  PRCTR: string;       // 손익센터
  SOBSK?: string;      // 원가특별조달
  LOSGR: number;       // 원가계산로트

  // [Classification] 분류 특성
  KLART: string;       // 클래스유형
  CLASS: string;       // 클래스
  MWERT_1?: string;    // 특성1~10
  MWERT_2?: string;
  MWERT_3?: string;
  MWERT_4?: string;
  MWERT_5?: string;
  MWERT_6?: string;
  MWERT_7?: string;
  MWERT_8?: string;
  MWERT_9?: string;
  MWERT_10?: string;
  
  // [Specific Specs] 제품 스펙
  MWERT_11: string;    // QM 숙성시간
  MWERT_12: string;    // Box 가로
  MWERT_13: string;    // Box 세로
  MWERT_14: string;    // Box 높이
  MWERT_15: string;    // 로버트 패턴
  MWERT_16: string;    // 팔레트 Box 수
  MWERT_17: string;    // 물류바코드

  [key: string]: string | number | undefined;
}

export interface MaterialRequest {
  id: string;
  status: 'Draft' | 'Requested' | 'Review' | 'Approved' | 'Done' | 'Reject';
  requesterEmail: string;
  requesterName?: string;
  createdAt: string;
  updatedAt?: string;
  data: SapMasterData;
  comments: {
    writer: string;
    message: string;
    createdAt: string;
  }[];
}

// src/types/mdm.ts

export interface SapMasterData {
  [key: string]: any; // SAP 필드들은 기존과 동일 (생략 없이 사용 가능하도록 인덱스 시그니처 유지)
  WERKS: string; MTART: string; MAKTX: string; // ...필수 필드들
}

export type RequestStatus = 'Requested' | 'Review' | 'Approved' | 'Reject';

export interface SapMasterData {
  [key: string]: any; // 인덱스 시그니처 (유연한 필드 접근 허용)
  WERKS?: string; 
  MTART?: string; 
  MAKTX?: string;
  MATNR?: string;
}

export interface MaterialRequest {
  id: string;
  status: RequestStatus; // 위에서 정의한 타입을 사용
  requesterName: string;
  processorName?: string;
  createdAt: string;
  completedAt?: string;
  data: SapMasterData;
  comments: {
    writer: string;
    message: string;
    createdAt: string;
  }[];
}