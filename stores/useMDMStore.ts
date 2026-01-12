import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MaterialRequest, SapMasterData, RequestStatus } from '@/types/mdm';
import { ColumnDef } from "@/actions/mdm";

const SAP_EXPORT_ORDER = [
  "WERKS","MTART","MBRSH","MATNR","MAKTX","MEINS","MATKL","EXTWG","BISMT","SPART",
  "LABOR","MSTAE","MSTDE","MAGRV","PRDHA","MTPOS_MARA","BRGEW","NTGEW","GEWEI","GROES",
  "FERTH","WRKST","MEINH","UMREZ","UMREN","NUMTP","EAN11","EWMCW","VRKME","ALAND",
  "TATYP","TAXKM","DWERK","MSTAV","MSTDV","VERSG","KONDM","KTGRM","MVGR1","MVGR2",
  "MVGR3","MVGR4","MVGR5","PRAT1","PRAT2","PRAT3","PRAT4","PRAT5","PRAT6","PRAT7",
  "PRAT8","PRAT9","PRATA","SKTOF","MTVFP","LADGR","TRAGR","BSTME","EKGRP","VABME",
  "MFRNR","MFRPN","MMSTA","MMSTD","XCHPF","DISMM","DISLS","MAABC","DISPO","BSTMI",
  "BSTMA","BSTFE","BSTRF","BESKZ","SOBSL","LGPRO","LGFSB","KZKUP","DZEIT","PLIFZ",
  "FHORI","EISBE","PERKZ","STRGR","VRMOD","VINT1","VINT2","MISKZ","ALTSL","SBDKZ",
  "SFEPR","AHDIS","SAUFT","RGEKZ","FRTME","AUSME","SFCPF","FEVOR","UEETK","UNETO",
  "UEETO","ZQUAL","TEMPB","RAUBE","MHDRZ","MHDHB","IPRKZ","DISKZ","XMCNG","BKLAS",
  "BWTTY","MLMAA","MLAST","VPRSV","STPRS","VERPR","PEINH_1","HRKFT","MTORG","KOSGR",
  "EKALR","PRCTR","SOBSK","LOSGR","PLNDPRICE1","PLNDPRDATE1","KLART","CLASS",
  "MNAME_1","MNAME_2","MNAME_3","MNAME_4","MNAME_5","MNAME_6","MNAME_7","MNAME_8","MNAME_9","MNAME_10",
  "MNAME_11","MNAME_12","MNAME_13","MNAME_14","MNAME_15","MNAME_16","MNAME_17","MNAME_18","MNAME_19","MNAME_20",
  "MWERT_1","MWERT_2","MWERT_3","MWERT_4","MWERT_5","MWERT_6","MWERT_7","MWERT_8","MWERT_9","MWERT_10",
  "MWERT_11","MWERT_12","MWERT_13","MWERT_14","MWERT_15","MWERT_16","MWERT_17","MWERT_18","MWERT_19","MWERT_20"
];

const CSV_HEADER_ROW_1 = `"초기화면(플랜트,자재유형 필수입력)",,,,기본데이터 1,,,,,,,,,,,,,,,,기본데이터 2,,추가데이터,,,,,,영업데이터,,,,,,,,,,,,,,,,,,,,,,,,,,,,,구매데이터,,,,,,,,MRP1,,,,,,,,MRP2,,,,,,,,,MRP3,,,,,,,MRP4,,,,,작업일정계획,,,,,,,품질,일반 플랜트 데이터/저장소 1,,,,,,,회계데이타,,,,,,,,원가데이타,,,,,,,,,분류,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
const CSV_HEADER_ROW_2 = `플랜트,자재유형,산업유형,자재코드,기본 자재내역,기본단위,자재그룹,외부자재그룹,기존자재번호,제품군,실험실,자재상태,상태시작일,포장재그룹,제품계층구조,품목범주그룹,총중량,순중량,중량단위,크기/치수,생산/검사메모,기본자재,환산단위,환산분자,환산분모,국제물품번호(EAN) 범주,국제 상품 번호(EAN/UPC),병렬단위Type,판매단위,세금국가,세금범주,세금분류,납품플랜트,유통상태,유통상태시작일,자재통계그룹,자재가격그룹,계정지정그룹,자재그룹1,자재그룹2,자재그룹3,자재그룹4,자재그룹5,온라인물류센터 전송여부,제품속성2,제품속성3,제품속성4,제품속성5,제품속성6,제품속성7,제품속성8,제품속성9,제품속성10,현금할인지시자,가용성점검,적하그룹,운송그룹,구매단위,구매그룹,가변단위,매입처,부품코드,플랜트 고유 자재상태,효력 시작일,배치관리,MRP 유형,로트크기,ABC지시자,MRP관리자,최소로트크기,최대로트크기,고정로트크기,반올림값,조달유형,특별조달유형,생산저장위치,EP저장위치,연산품,내부생산시간,계획납품소요시간,일정마진키,안전재고,기간지시자,전략그룹,소비모드,역방향소비기간,순방향소비기간,혼합 MRP,대체BOM선택방법,개별/일괄지시자,REM 프로파일,종속소요량,반복제조지시자,백플러시,생산단위,출고단위,생산일정계획프로파일,감독지시자,무제한초과납품 지시자,미달허용(%),초과허용(%),검사대상,온도조건,저장조건,최소 잔존 셸프 라이프,총 셸프 라이프,SLED 기간 지시자,저장위치MRP지시자,마이너스허용,평가클래스,평가범주,ML Act.,가격결정,가격관리,표준가격,이동평균가,가격단위,오리진그룹,자재오리진,간접비그룹,원가구조로 계산된 가격구조,손익센터,원가계산특별조달유형,원가계산로트크기,계획가격,계획가격일,클래스유형,클래스,특성1,특성2,특성3,특성4,특성5,특성6,특성7,특성8,특성9,특성10,특성11,특성12,특성13,특성14,특성15,특성16,특성17,특성18,특성19,특성20,특성1값,특성2값,특성3값,특성4값,특성5값,특성6값,특성7값,특성8값,특성9값,특성10값,QM 숙성시간,Box 가로,Box 세로,Box 높이,로버트 패턴,팔레트 Box 수,물류바코드,특성18값,특성19값,특성20값`;

interface UserInfo {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface MDMState {
  requests: MaterialRequest[];
  currentRequest: MaterialRequest | null;
  selectedIds: string[];
  isLoggedIn: boolean;
  currentUser: UserInfo | null;
  columnDefs: Record<string, ColumnDef>;

  setLoginUser: (user: UserInfo) => void;
  logout: () => void;
  
  // DB 데이터 동기화용 액션
  setRequests: (requests: MaterialRequest[]) => void;
  setComments: (requestId: string, comments: any[]) => void;
  setColumnDefs: (defs: Record<string, ColumnDef>) => void;

  addRequest: (data: SapMasterData) => void;
  updateRequest: (id: string, data: Partial<SapMasterData>) => void;
  updateStatus: (id: string, status: RequestStatus) => void;
  updateSapCode: (id: string, matnr: string) => void;
  addComment: (requestId: string, message: string, writer: string) => void;
  setCurrentRequest: (request: MaterialRequest | null) => void;
  createNewRequest: () => void;
  toggleSelection: (id: string) => void;
  toggleAllSelection: (ids: string[]) => void;
  downloadSelectedCsv: () => void;
}

export const useMDMStore = create<MDMState>()(
  persist(
    (set, get) => ({
      requests: [],
      currentRequest: null,
      selectedIds: [],
      isLoggedIn: false,
      currentUser: null,
      columnDefs: {},

      setLoginUser: (user) => set({ isLoggedIn: true, currentUser: user }),
      logout: () => set({ isLoggedIn: false, currentUser: null, requests: [], currentRequest: null }),

      // 🔴 수정된 부분: 목록을 갱신하더라도 기존 댓글은 유지(Merge)하도록 로직 변경
      setRequests: (newRequests) => set((state) => {
        // 1. 기존 스토어에 있는 요청들의 '댓글(comments)' 정보를 ID별로 백업합니다.
        const commentMap = new Map<string, any[]>();
        state.requests.forEach(req => {
          if (req.comments && req.comments.length > 0) {
            commentMap.set(req.id, req.comments);
          }
        });

        // 2. 새로 받아온 요청 목록에 백업해둔 댓글 정보를 병합합니다.
        const mergedRequests = newRequests.map(req => ({
          ...req,
          // 중요: 새로운 데이터에 댓글이 없으면(보통 빔), 기존 댓글을 넣어줍니다.
          comments: commentMap.get(req.id) || [] 
        }));

        return { requests: mergedRequests };
      }),

      setComments: (requestId, comments) => set((state) => ({
        requests: state.requests.map(req => req.id === requestId ? { ...req, comments } : req),
        // 선택된 요청 정보(currentRequest)도 같이 업데이트해줍니다.
        currentRequest: state.currentRequest?.id === requestId ? { ...state.currentRequest, comments } : state.currentRequest
      })),
      setColumnDefs: (defs) => set({ columnDefs: defs }),

      addRequest: (data) => set((state) => ({
        requests: [{
          id: `REQ-${Date.now()}`,
          status: 'Requested',
          requesterName: state.currentUser?.name || 'Unknown',
          createdAt: new Date().toISOString(),
          data, comments: []
        }, ...state.requests],
        currentRequest: null 
      })),

      updateRequest: (id, data) => set((state) => ({
        requests: state.requests.map(req => req.id === id ? { ...req, data: { ...req.data, ...data } } : req),
        currentRequest: state.currentRequest?.id === id 
          ? { ...state.currentRequest, data: { ...state.currentRequest.data, ...data } } 
          : state.currentRequest
      })),

      updateStatus: (id, status) => set((state) => ({
        requests: state.requests.map(req => req.id === id ? { ...req, status } : req),
        currentRequest: state.currentRequest?.id === id 
          ? { ...state.currentRequest, status } 
          : state.currentRequest
      })),

      updateSapCode: (id, matnr) => set((state) => {
        const updater = (req: MaterialRequest) => 
          req.id === id ? { ...req, status: 'Approved' as RequestStatus, data: { ...req.data, MATNR: matnr } } : req;
        
        return {
          requests: state.requests.map(updater),
          currentRequest: state.currentRequest?.id === id ? updater(state.currentRequest) : state.currentRequest
        };
      }),

      addComment: (requestId, message, writer) => set((state) => ({
        requests: state.requests.map(req => req.id === requestId ? { ...req, comments: [...req.comments, { writer, message, createdAt: new Date().toISOString() }] } : req),
        currentRequest: state.currentRequest?.id === requestId 
          ? { ...state.currentRequest, comments: [...state.currentRequest.comments, { writer, message, createdAt: new Date().toISOString() }] }
          : state.currentRequest
      })),

      setCurrentRequest: (request) => set({ currentRequest: request }),
      createNewRequest: () => set({ currentRequest: null }),
      toggleSelection: (id) => set((state) => ({
        selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter(sid => sid !== id) : [...state.selectedIds, id]
      })),
      toggleAllSelection: (ids) => set({ selectedIds: ids }),

      downloadSelectedCsv: () => {
        const { requests, selectedIds } = get();
        const targets = requests.filter(r => selectedIds.includes(r.id));
        if (targets.length === 0) {
          alert("다운로드할 항목을 선택해주세요.");
          return;
        }
        const headerRow3 = SAP_EXPORT_ORDER.join(',');
        const rows = targets.map(req => {
          return SAP_EXPORT_ORDER.map(col => {
            if (col === 'CLASS') return '"ZMM001"';
            const mnameMatch = col.match(/^MNAME_(\d+)$/);
            if (mnameMatch) {
                const index = parseInt(mnameMatch[1]);
                const paddedIndex = String(index).padStart(3, '0');
                return `"ZMMC${paddedIndex}"`;
            }
            const val = req.data[col] || '';
            return `"${String(val).replace(/"/g, '""')}"`;
          }).join(',');
        });
        const csvContent = [CSV_HEADER_ROW_1, CSV_HEADER_ROW_2, headerRow3, ...rows].join('\n');
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `SAP_Upload_${new Date().toISOString().slice(0,19).replace(/:/g,'')}.csv`;
        link.click();
      },
    }),
    {
      name: 'mdm-storage', 
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);