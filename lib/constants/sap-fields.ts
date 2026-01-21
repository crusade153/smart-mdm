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
  fixed?: boolean; // true면 수정 불가(회색/파란색)
  options?: Record<string, string>;
  refKey?: string;
  placeholder?: string;
  adminOnly?: boolean;
}

export const FORM_TABS = [
  { id: 'basic', label: '기본정보' },
  { id: 'add', label: '추가정보' }, // 기존 탭 유지
  { id: 'sales', label: '영업' },
  { id: 'purchase', label: '구매' },
  { id: 'mrp', label: 'MRP' },
  { id: 'schedule', label: '일정' },
  { id: 'quality', label: '품질' },
  { id: 'storage', label: '저장' },
  { id: 'finance', label: '회계' },
  { id: 'cost', label: '원가' },
  { id: 'class', label: '분류' },
  { id: 'extra', label: '추가데이터' }, // ✅ 신규 탭 (완전 분리)
];

export const MDM_FORM_SCHEMA: FieldMeta[] = [
  // [Tab 1] 기본정보
  { key: 'WERKS', label: '플랜트', tab: 'basic', type: 'select', required: true, options: {'1021':'1021 (K1)', '1022':'1022 (K3)', '1023':'1023 (K2)', '1031':'1031 (FBH)'} },
  { key: 'MTART', label: '자재유형', tab: 'basic', type: 'select', required: true, options: {'FERT':'FERT (완제품)', 'ZSET':'ZSET (세트)', 'HAWA':'HAWA (상품)'} },
  { key: 'MBRSH', label: '산업유형', tab: 'basic', type: 'text', fixed: true },
  { key: 'MATNR', label: '자재코드', tab: 'basic', type: 'text', fixed: true, adminOnly: true },
  { key: 'MAKTX', label: '기본 자재내역', tab: 'basic', type: 'text', required: true },
  { key: 'MEINS', label: '기본단위', tab: 'basic', type: 'text', required: true, defaultValue: 'EA' },
  { key: 'MATKL', label: '자재그룹', tab: 'basic', type: 'custom_matkl', required: true },
  { key: 'EXTWG', label: '외부자재그룹', tab: 'basic', type: 'text', fixed: true },
  { key: 'BISMT', label: '기존자재번호', tab: 'basic', type: 'text', fixed: true },
  { key: 'SPART', label: '제품군', tab: 'basic', type: 'text', required: true, defaultValue: '00', fixed: true },
  { key: 'LABOR', label: '실험실', tab: 'basic', type: 'text', fixed: true },
  { key: 'MSTAE', label: '자재상태', tab: 'basic', type: 'text', fixed: true },
  { key: 'MSTDE', label: '상태시작일', tab: 'basic', type: 'date', fixed: true },
  { key: 'MAGRV', label: '포장재그룹', tab: 'basic', type: 'text', fixed: true },
  { key: 'PRDHA', label: '제품계층구조', tab: 'basic', type: 'custom_prdha', required: true },
  { key: 'MTPOS_MARA', label: '품목범주그룹', tab: 'basic', type: 'text', required: true, defaultValue: 'NORM', fixed: true },
  { key: 'BRGEW', label: '총중량', tab: 'basic', type: 'number' },
  { key: 'NTGEW', label: '순중량', tab: 'basic', type: 'number', required: true, defaultValue: 0 },
  { key: 'GEWEI', label: '중량단위', tab: 'basic', type: 'text', required: true, defaultValue: 'G' },
  { key: 'GROES', label: '크기/치수', tab: 'basic', type: 'text', fixed: true },
  { key: 'FERTH', label: '생산/검사메모', tab: 'basic', type: 'text', fixed: true },
  { key: 'WRKST', label: '기본자재', tab: 'basic', type: 'text', fixed: true },

  // [Tab 2] 추가정보 (🚨 기존 필드 복원 - 수정불가/필수 등 기존 로직 유지)
  { key: 'MEINH', label: '환산단위', tab: 'add', type: 'text', required: true, defaultValue: 'BOX' },
  { key: 'UMREZ', label: '환산분자', tab: 'add', type: 'number', required: true },
  { key: 'UMREN', label: '환산분모', tab: 'add', type: 'number', required: true, defaultValue: 1, fixed: true },
  { key: 'NUMTP', label: '국제물품번호(EAN) 범주', tab: 'add', type: 'text', required: true },
  { key: 'EAN11', label: '국제 상품 번호(EAN/UPC)', tab: 'add', type: 'text', required: true },
  { key: 'EWMCW', label: '병렬단위Type', tab: 'add', type: 'text', fixed: true },

  // [Tab 12] 추가데이터 (✅ 신규 탭 - 자유 입력 가능, 흰색 배경)
  // 자재코드는 입력받지 않고(화면에 표시 X), CSV 다운로드 시에만 자동 매핑합니다.
  { key: 'EXTRA_MEINH', label: '환산단위', tab: 'extra', type: 'text', placeholder: '예: BOX, PAL' },
  { key: 'EXTRA_UMREZ', label: '환산분자', tab: 'extra', type: 'number', placeholder: '예: 20' },
  { key: 'EXTRA_UMREN', label: '환산분모', tab: 'extra', type: 'number', placeholder: '예: 1' },
  { key: 'EXTRA_EWMCW', label: '병렬단위Type', tab: 'extra', type: 'text', placeholder: '필요시 입력' },

  // [Tab 3] 영업
  { key: 'VRKME', label: '판매단위', tab: 'sales', type: 'text', required: true, defaultValue: 'EA' },
  { key: 'ALAND', label: '세금국가', tab: 'sales', type: 'text', defaultValue: 'KR', fixed: true },
  { key: 'TATYP', label: '세금범주', tab: 'sales', type: 'text', defaultValue: 'MWST', fixed: true },
  { key: 'TAXKM', label: '세금분류', tab: 'sales', type: 'text', defaultValue: '1', fixed: true },
  { key: 'DWERK', label: '납품플랜트', tab: 'sales', type: 'text', required: true },
  { key: 'MSTAV', label: '유통상태', tab: 'sales', type: 'text', fixed: true },
  { key: 'MSTDV', label: '유통상태시작일', tab: 'sales', type: 'date', fixed: true },
  { key: 'VERSG', label: '자재통계그룹', tab: 'sales', type: 'text', fixed: true },
  { key: 'KONDM', label: '자재가격그룹', tab: 'sales', type: 'number', fixed: true },
  { key: 'KTGRM', label: '계정지정그룹', tab: 'sales', type: 'text', fixed: true }, 
  { key: 'MVGR1', label: '자재그룹1', tab: 'sales', type: 'text', fixed: true },
  { 
    key: 'MVGR2', label: '자재그룹2', tab: 'sales', type: 'select', required: true,
    options: {
      '001': '001 육수', '002': '002 농축액', '003': '003 아셉틱팩', '004': '004 병/PET', '005': '005 액상소포장',
      '006': '006 파우치포장(1kg이상)', '007': '007 파우치포장(1kg이하)', '008': '008 트레이포장', '009': '009 소스벌크포장',
      '010': '010 SD분말', '011': '011 VD분말', '012': '012 일반분말', '013': '013 볶음밥', '014': '014 오니기리',
      '015': '015 냉동만두', '016': '016 냉장만두', '017': '017 튀김', '018': '018 핫도그', '019': '019 건면',
      '020': '020 유탕면', '021': '021 라면공통', '022': '022 즉석밥'
    }
  },
  { 
    key: 'MVGR3', label: '자재그룹3', tab: 'sales', type: 'select', required: true,
    options: { '001': '001 The미식', '002': '002 OEM', '003': '003 기타', '004': '004 멜팅피스', '005': '005 푸디버디', '006': '006 하림(자사판매)' }
  },
  { key: 'MVGR4', label: '자재그룹4', tab: 'sales', type: 'text', fixed: true },
  { key: 'MVGR5', label: '자재그룹5', tab: 'sales', type: 'text', fixed: true },
  { 
    key: 'PRAT1', label: '온라인물류센터 전송여부', tab: 'sales', type: 'select', required: true, 
    options: { '': '미전송 (빈값)', 'X': '전송 (X)' }
  },
  { key: 'PRAT2', label: '제품속성2', tab: 'sales', type: 'text', fixed: true },
  { key: 'PRAT3', label: '제품속성3', tab: 'sales', type: 'text', fixed: true },
  { key: 'PRAT4', label: '제품속성4', tab: 'sales', type: 'text', fixed: true },
  { key: 'PRAT5', label: '제품속성5', tab: 'sales', type: 'text', fixed: true },
  { key: 'PRAT6', label: '제품속성6', tab: 'sales', type: 'text', fixed: true },
  { key: 'PRAT7', label: '제품속성7', tab: 'sales', type: 'text', fixed: true },
  { key: 'PRAT8', label: '제품속성8', tab: 'sales', type: 'text', fixed: true },
  { key: 'PRAT9', label: '제품속성9', tab: 'sales', type: 'text', fixed: true },
  { key: 'PRATA', label: '제품속성10', tab: 'sales', type: 'text', fixed: true },
  { key: 'SKTOF', label: '현금할인지시자', tab: 'sales', type: 'text', fixed: true },
  { key: 'MTVFP', label: '가용성점검', tab: 'sales', type: 'text', defaultValue: '02', fixed: true },
  { key: 'LADGR', label: '적하그룹', tab: 'sales', type: 'text', defaultValue: '0001', fixed: true },
  { key: 'TRAGR', label: '운송그룹', tab: 'sales', type: 'text', defaultValue: '0001', fixed: true },

  // [Tab 4] 구매
  { key: 'BSTME', label: '구매단위', tab: 'purchase', type: 'text', fixed: true },
  { key: 'EKGRP', label: '구매그룹', tab: 'purchase', type: 'text', fixed: true },
  { key: 'VABME', label: '가변단위', tab: 'purchase', type: 'text', fixed: true },
  { key: 'MFRNR', label: '매입처', tab: 'purchase', type: 'text', fixed: true },
  { key: 'MFRPN', label: '부품코드', tab: 'purchase', type: 'text', fixed: true },
  { key: 'MMSTA', label: '플랜트 고유 자재상태', tab: 'purchase', type: 'text', fixed: true },
  { key: 'MMSTD', label: '효력 시작일', tab: 'purchase', type: 'date', fixed: true },
  { key: 'XCHPF', label: '배치관리', tab: 'purchase', type: 'text', defaultValue: 'X', fixed: true },

  // [Tab 5] MRP
  { key: 'DISMM', label: 'MRP 유형', tab: 'mrp', type: 'text', defaultValue: 'X0', fixed: true },
  { key: 'DISLS', label: '로트크기', tab: 'mrp', type: 'text', defaultValue: 'EX', fixed: true },
  { key: 'MAABC', label: 'ABC지시자', tab: 'mrp', type: 'text', fixed: true },
  { key: 'DISPO', label: 'MRP관리자', tab: 'mrp', type: 'ref_select', required: true, refKey: 'mrp' },
  { key: 'BSTMI', label: '최소로트크기', tab: 'mrp', type: 'text', fixed: true },
  { key: 'BSTMA', label: '최대로트크기', tab: 'mrp', type: 'text', fixed: true },
  { key: 'BSTFE', label: '고정로트크기', tab: 'mrp', type: 'text', fixed: true },
  { key: 'BSTRF', label: '반올림값', tab: 'mrp', type: 'text', fixed: true },
  { key: 'BESKZ', label: '조달유형', tab: 'mrp', type: 'text', required: true, defaultValue: 'E', fixed: true },
  { key: 'SOBSL', label: '특별조달유형', tab: 'mrp', type: 'text' },
  { key: 'LGPRO', label: '생산저장위치', tab: 'mrp', type: 'text', required: true },
  { key: 'LGFSB', label: 'EP저장위치', tab: 'mrp', type: 'text', required: true },
  { key: 'KZKUP', label: '연산품', tab: 'mrp', type: 'text', fixed: true },
  { key: 'DZEIT', label: '내부생산시간', tab: 'mrp', type: 'text', fixed: true },
  { key: 'PLIFZ', label: '계획납품소요시간', tab: 'mrp', type: 'text', fixed: true },
  { key: 'FHORI', label: '일정마진키', tab: 'mrp', type: 'text', fixed: true },
  { key: 'EISBE', label: '안전재고', tab: 'mrp', type: 'text', fixed: true },
  { key: 'PERKZ', label: '기간지시자', tab: 'mrp', type: 'text', defaultValue: 'M', fixed: true },
  { key: 'STRGR', label: '전략그룹', tab: 'mrp', type: 'text', defaultValue: '10', fixed: true },
  { key: 'VRMOD', label: '소비모드', tab: 'mrp', type: 'text', fixed: true },
  { key: 'VINT1', label: '역방향소비기간', tab: 'mrp', type: 'number', fixed: true },
  { key: 'VINT2', label: '순방향소비기간', tab: 'mrp', type: 'number', fixed: true },
  { key: 'MISKZ', label: '혼합 MRP', tab: 'mrp', type: 'text', fixed: true },
  { key: 'ALTSL', label: '대체BOM선택방법', tab: 'mrp', type: 'text', fixed: true },
  { key: 'SBDKZ', label: '개별/일괄지시자', tab: 'mrp', type: 'text', fixed: true },
  { key: 'SFEPR', label: 'REM 프로파일', tab: 'mrp', type: 'text', fixed: true },
  { key: 'AHDIS', label: '종속소요량', tab: 'mrp', type: 'text', fixed: true },
  { key: 'SAUFT', label: '반복제조지시자', tab: 'mrp', type: 'text', fixed: true },
  { key: 'RGEKZ', label: '백플러시', tab: 'mrp', type: 'text', fixed: true },

  // [Tab 6] 일정
  { key: 'FRTME', label: '생산단위', tab: 'schedule', type: 'text', fixed: true },
  { key: 'AUSME', label: '출고단위', tab: 'schedule', type: 'text', fixed: true },
  { key: 'SFCPF', label: '생산일정계획프로파일', tab: 'schedule', type: 'text', defaultValue: 'HR0001', fixed: true },
  { key: 'FEVOR', label: '감독지시자', tab: 'schedule', type: 'ref_select', required: true, refKey: 'supervisor' },
  { key: 'UEETK', label: '무제한초과납품 지시자', tab: 'schedule', type: 'text', defaultValue: 'X', fixed: true },
  { key: 'UNETO', label: '미달허용(%)', tab: 'schedule', type: 'number', fixed: true },
  { key: 'UEETO', label: '초과허용(%)', tab: 'schedule', type: 'number', fixed: true },

  // [Tab 7] 품질
  { key: 'ZQUAL', label: '검사대상', tab: 'quality', type: 'text', fixed: true },

  // [Tab 8] 저장
  { key: 'TEMPB', label: '온도조건', tab: 'storage', type: 'ref_select', required: true, refKey: 'temp' },
  { key: 'RAUBE', label: '저장조건', tab: 'storage', type: 'ref_select', required: true, refKey: 'storage' },
  { key: 'MHDRZ', label: '최소 잔존 셸프 라이프', tab: 'storage', type: 'number', required: true },
  { key: 'MHDHB', label: '총 셸프 라이프', tab: 'storage', type: 'number', required: true },
  { key: 'IPRKZ', label: 'SLED 기간 지시자', tab: 'storage', type: 'number', fixed: true },
  { key: 'DISKZ', label: '저장위치MRP지시자', tab: 'storage', type: 'text', fixed: true },
  { key: 'XMCNG', label: '마이너스허용', tab: 'storage', type: 'text', fixed: true },

  // [Tab 9] 회계
  { key: 'BKLAS', label: '평가클래스', tab: 'finance', type: 'text', defaultValue: '7920', fixed: true },
  { key: 'BWTTY', label: '평가범주', tab: 'finance', type: 'text', fixed: true },
  { key: 'MLMAA', label: 'ML Act.', tab: 'finance', type: 'text', fixed: true },
  { key: 'MLAST', label: '가격결정', tab: 'finance', type: 'number', defaultValue: 3, fixed: true },
  { key: 'VPRSV', label: '가격관리', tab: 'finance', type: 'text', fixed: true }, 
  { key: 'STPRS', label: '표준가격', tab: 'finance', type: 'number', fixed: true },
  { key: 'VERPR', label: '이동평균가', tab: 'finance', type: 'text', fixed: true },
  { key: 'PEINH_1', label: '가격단위', tab: 'finance', type: 'number', defaultValue: 1, fixed: true },

  // [Tab 10] 원가
  { key: 'HRKFT', label: '오리진그룹', tab: 'cost', type: 'text', fixed: true },
  { key: 'MTORG', label: '자재오리진', tab: 'cost', type: 'text', fixed: true },
  { key: 'KOSGR', label: '간접비그룹', tab: 'cost', type: 'text', fixed: true },
  { key: 'EKALR', label: '원가구조로 계산된 가격구조', tab: 'cost', type: 'text', defaultValue: 'X', fixed: true },
  { key: 'PRCTR', label: '손익센터', tab: 'cost', type: 'text', defaultValue: '100000', fixed: true },
  { key: 'SOBSK', label: '원가계산특별조달유형', tab: 'cost', type: 'text', fixed: true },
  { key: 'LOSGR', label: '원가계산로트크기', tab: 'cost', type: 'number', defaultValue: 10000, fixed: true },
  { key: 'PLNDPRICE1', label: '계획가격', tab: 'cost', type: 'number', fixed: true },
  { key: 'PLNDPRDATE1', label: '계획가격일', tab: 'cost', type: 'number', fixed: true },

  // [Tab 11] 분류
  { key: 'KLART', label: '클래스유형', tab: 'class', type: 'text', defaultValue: '001', fixed: true },
  { key: 'CLASS', label: '클래스', tab: 'class', type: 'text', defaultValue: 'ZMM001', fixed: true },
  { key: 'MNAME_1', label: '특성1', tab: 'class', type: 'text', defaultValue: 'ZMMC001', fixed: true },
  { key: 'MNAME_2', label: '특성2', tab: 'class', type: 'text', defaultValue: 'ZMMC002', fixed: true },
  { key: 'MNAME_3', label: '특성3', tab: 'class', type: 'text', defaultValue: 'ZMMC003', fixed: true },
  { key: 'MNAME_4', label: '특성4', tab: 'class', type: 'text', defaultValue: 'ZMMC004', fixed: true },
  { key: 'MNAME_5', label: '특성5', tab: 'class', type: 'text', defaultValue: 'ZMMC005', fixed: true },
  { key: 'MNAME_6', label: '특성6', tab: 'class', type: 'text', defaultValue: 'ZMMC006', fixed: true },
  { key: 'MNAME_7', label: '특성7', tab: 'class', type: 'text', defaultValue: 'ZMMC007', fixed: true },
  { key: 'MNAME_8', label: '특성8', tab: 'class', type: 'text', defaultValue: 'ZMMC008', fixed: true },
  { key: 'MNAME_9', label: '특성9', tab: 'class', type: 'text', defaultValue: 'ZMMC009', fixed: true },
  { key: 'MNAME_10', label: '특성10', tab: 'class', type: 'text', defaultValue: 'ZMMC010', fixed: true },
  { key: 'MNAME_11', label: '특성11', tab: 'class', type: 'text', defaultValue: 'ZMMC011', fixed: true },
  { key: 'MNAME_12', label: '특성12', tab: 'class', type: 'text', defaultValue: 'ZMMC012', fixed: true },
  { key: 'MNAME_13', label: '특성13', tab: 'class', type: 'text', defaultValue: 'ZMMC013', fixed: true },
  { key: 'MNAME_14', label: '특성14', tab: 'class', type: 'text', defaultValue: 'ZMMC014', fixed: true },
  { key: 'MNAME_15', label: '특성15', tab: 'class', type: 'text', defaultValue: 'ZMMC015', fixed: true },
  { key: 'MNAME_16', label: '특성16', tab: 'class', type: 'text', defaultValue: 'ZMMC016', fixed: true },
  { key: 'MNAME_17', label: '특성17', tab: 'class', type: 'text', defaultValue: 'ZMMC017', fixed: true },
  { key: 'MNAME_18', label: '특성18', tab: 'class', type: 'text', defaultValue: 'ZMMC018', fixed: true },
  { key: 'MNAME_19', label: '특성19', tab: 'class', type: 'text', defaultValue: 'ZMMC019', fixed: true },
  { key: 'MNAME_20', label: '특성20', tab: 'class', type: 'text', defaultValue: 'ZMMC020', fixed: true },
  { key: 'MWERT_1', label: '특성1값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_2', label: '특성2값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_3', label: '특성3값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_4', label: '특성4값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_5', label: '특성5값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_6', label: '특성6값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_7', label: '특성7값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_8', label: '특성8값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_9', label: '특성9값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_10', label: '특성10값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_11', label: 'QM 숙성시간', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_12', label: 'Box 가로', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_13', label: 'Box 세로', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_14', label: 'Box 높이', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_15', label: '로버트 패턴', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_16', label: '팔레트 Box 수', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_17', label: '물류바코드', tab: 'class', type: 'text', required: true },
  { key: 'MWERT_18', label: '특성18값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_19', label: '특성19값', tab: 'class', type: 'text', fixed: true },
  { key: 'MWERT_20', label: '특성20값', tab: 'class', type: 'text', fixed: true },
];