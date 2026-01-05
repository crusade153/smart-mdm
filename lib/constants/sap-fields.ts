// src/lib/constants/sap-fields.ts
import { SapMasterData } from '@/types/mdm';

export type FieldType = 
  | 'text' | 'number' | 'date' | 'select' 
  | 'ref_select' | 'custom_matkl' | 'custom_prdha';

export interface FieldMeta {
  key: keyof SapMasterData;
  label: string;
  tab: string;
  type: FieldType;
  required?: boolean;
  defaultValue?: string | number;
  fixed?: boolean; // true면 수정 불가(회색)
  options?: Record<string, string>;
  refKey?: string;
  placeholder?: string;
  adminOnly?: boolean;
}

export const FORM_TABS = [
  { id: 'basic', label: '기본정보' },
  { id: 'add', label: '추가정보' },
  { id: 'sales', label: '영업' },
  { id: 'purchase', label: '구매' },
  { id: 'mrp', label: 'MRP' },
  { id: 'schedule', label: '일정' },
  { id: 'storage', label: '저장' },
  { id: 'finance', label: '회계' },
  { id: 'cost', label: '원가' },
  { id: 'class', label: '분류' },
];

export const MDM_FORM_SCHEMA: FieldMeta[] = [
  // [Tab 1] 기본정보 (Basic)
  { key: 'WERKS', label: '플랜트', tab: 'basic', type: 'select', required: true, options: {'1021':'1021 (K1)', '1022':'1022 (K3)', '1023':'1023 (K2)', '1031':'1031 (FBH)'} },
  // ✅ [수정] ROH 제거, HAWA 추가
  { key: 'MTART', label: '자재유형', tab: 'basic', type: 'select', required: true, options: {'FERT':'FERT (완제품)', 'ZSET':'ZSET (세트)', 'HAWA':'HAWA (상품)'} },
  { key: 'MAKTX', label: '자재내역', tab: 'basic', type: 'text', required: true, placeholder: '예: 푸디버디 빨강라면 컵' },
  { key: 'MATNR', label: '자재코드', tab: 'basic', type: 'text', adminOnly: true, placeholder: '자동 채번' },
  { key: 'MEINS', label: '기본단위', tab: 'basic', type: 'text', required: true, defaultValue: 'EA' },
  { key: 'MATKL', label: '자재그룹', tab: 'basic', type: 'custom_matkl', required: true },
  { key: 'PRDHA', label: '제품계층구조', tab: 'basic', type: 'custom_prdha', required: true },
  { key: 'SPART', label: '제품군', tab: 'basic', type: 'text', required: true, defaultValue: '00', fixed: true },
  { key: 'NTGEW', label: '순중량', tab: 'basic', type: 'number', required: true, defaultValue: 0 },
  { key: 'GEWEI', label: '중량단위', tab: 'basic', type: 'text', required: true, defaultValue: 'G' },
  { key: 'MTPOS_MARA', label: '품목범주그룹', tab: 'basic', type: 'text', required: true, defaultValue: 'NORM', fixed: true },

  // [Tab 2] 추가정보
  { key: 'MEINH', label: '환산단위', tab: 'add', type: 'text', required: true, defaultValue: 'BOX' },
  { key: 'UMREZ', label: '환산분자', tab: 'add', type: 'number', required: true },
  { key: 'UMREN', label: '환산분모', tab: 'add', type: 'number', required: true, defaultValue: 1, fixed: true },
  { key: 'EAN11', label: 'EAN/UPC', tab: 'add', type: 'text', required: true },
  { key: 'NUMTP', label: 'EAN 범주', tab: 'add', type: 'text', required: true },

  // [Tab 3] 영업
  { key: 'VRKME', label: '판매단위', tab: 'sales', type: 'text', required: true, defaultValue: 'EA' },
  { key: 'DWERK', label: '납품플랜트', tab: 'sales', type: 'text' },
  { key: 'MSTDV', label: '유통상태시작일', tab: 'sales', type: 'date' },

  // [Tab 4] 구매
  { key: 'EKGRP', label: '구매그룹', tab: 'purchase', type: 'text' },
  { key: 'XCHPF', label: '배치관리', tab: 'purchase', type: 'text', defaultValue: 'X', fixed: true },

  // [Tab 5] MRP
  { key: 'DISPO', label: 'MRP관리자', tab: 'mrp', type: 'ref_select', refKey: 'mrp', required: true },
  { key: 'DISMM', label: 'MRP유형', tab: 'mrp', type: 'text', defaultValue: 'X0', fixed: true },
  { key: 'DISLS', label: '로트크기', tab: 'mrp', type: 'text', defaultValue: 'EX', fixed: true },
  { key: 'LGFSB', label: 'EP저장위치', tab: 'mrp', type: 'ref_select', refKey: 'epLoc', required: true },
  { key: 'BESKZ', label: '조달유형', tab: 'mrp', type: 'text', defaultValue: 'E', fixed: true },
  { key: 'LGPRO', label: '생산저장위치', tab: 'mrp', type: 'text', defaultValue: '2200', fixed: true },
  { key: 'STRGR', label: '전략그룹', tab: 'mrp', type: 'text', defaultValue: '10', fixed: true },
  { key: 'PERKZ', label: '기간지시자', tab: 'mrp', type: 'text', defaultValue: 'M', fixed: true },

  // [Tab 6] 일정
  { key: 'SFCPF', label: '생산일정프로파일', tab: 'schedule', type: 'text', defaultValue: 'HR0001', fixed: true },
  { key: 'FEVOR', label: '감독지시자', tab: 'schedule', type: 'ref_select', refKey: 'supervisor', required: true },
  { key: 'UEETK', label: '무제한초과납품', tab: 'schedule', type: 'text', defaultValue: 'X', fixed: true },

  // [Tab 7] 저장
  { key: 'TEMPB', label: '온도조건', tab: 'storage', type: 'ref_select', refKey: 'temp', required: true },
  { key: 'RAUBE', label: '저장조건', tab: 'storage', type: 'ref_select', refKey: 'storage', required: true },
  { key: 'MHDRZ', label: '최소잔존수명', tab: 'storage', type: 'number', required: true },
  { key: 'MHDHB', label: '총셸프라이프', tab: 'storage', type: 'number', required: true },

  // [Tab 8] 회계 (고정값 반영)
  // ✅ 평가클래스는 Form 컴포넌트에서 로직으로 제어하지만 초기값은 7920
  { key: 'BKLAS', label: '평가클래스', tab: 'finance', type: 'text', defaultValue: '7920', fixed: true },
  { key: 'VPRSV', label: '가격결정', tab: 'finance', type: 'text', defaultValue: '3', fixed: true }, // ✅ 고정값 3
  { key: 'PEINH_1', label: '가격단위', tab: 'finance', type: 'number', defaultValue: 1, fixed: true }, // ✅ 고정값 1

  // [Tab 9] 원가 (고정값 반영)
  { key: 'EKALR', label: '가격구조(QS)', tab: 'cost', type: 'text', defaultValue: 'X', fixed: true }, // ✅ 고정값 X
  { key: 'PRCTR', label: '손익센터', tab: 'cost', type: 'text', defaultValue: '100000', fixed: true }, // ✅ 고정값 100000
  { key: 'LOSGR', label: '원가계산로트', tab: 'cost', type: 'number', defaultValue: 10000, fixed: true }, // ✅ 고정값 10000

  // [Tab 10] 분류 (고정값 반영)
  { key: 'KLART', label: '클래스유형', tab: 'class', type: 'text', defaultValue: '001', fixed: true }, // ✅ 고정값 001
  { key: 'CLASS', label: '클래스', tab: 'class', type: 'text', defaultValue: 'ZMM001', fixed: true }, // ✅ 고정값 ZMM001
  { key: 'MWERT_11', label: 'QM 숙성시간', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_12', label: 'Box 가로', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_13', label: 'Box 세로', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_14', label: 'Box 높이', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_15', label: '로버트 패턴', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_16', label: '팔레트 Box 수', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_17', label: '물류바코드', tab: 'class', type: 'text', required: true },
];