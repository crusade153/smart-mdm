import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MaterialRequest, SapMasterData, RequestStatus } from '@/types/mdm';
import { ColumnDef } from "@/actions/mdm";
import * as XLSX from 'xlsx'; // ⚡ 엑셀 라이브러리 추가

const SAP_EXPORT_ORDER = [
  "WERKS", "MTART", "MBRSH", "MATNR", "MAKTX", "MEINS", "MATKL", "EXTWG", "BISMT", "SPART",
  "LABOR", "MSTAE", "MSTDE", "MAGRV", "PRDHA", "MTPOS_MARA", "BRGEW", "NTGEW", "GEWEI", "GROES",
  "FERTH", "WRKST", "MEINH", "UMREZ", "UMREN", "NUMTP", "EAN11", "EWMCW", "VRKME", "ALAND",
  "TATYP", "TAXKM", "DWERK", "MSTAV", "MSTDV", "VERSG", "KONDM", "KTGRM", "MVGR1", "MVGR2",
  "MVGR3", "MVGR4", "MVGR5", "PRAT1", "PRAT2", "PRAT3", "PRAT4", "PRAT5", "PRAT6", "PRAT7",
  "PRAT8", "PRAT9", "PRATA", "SKTOF", "MTVFP", "LADGR", "TRAGR", "BSTME", "EKGRP", "VABME",
  "MFRNR", "MFRPN", "MMSTA", "MMSTD", "XCHPF", "DISMM", "DISLS", "MAABC", "DISPO", "BSTMI",
  "BSTMA", "BSTFE", "BSTRF", "BESKZ", "SOBSL", "LGPRO", "LGFSB", "KZKUP", "DZEIT", "PLIFZ",
  "FHORI", "EISBE", "PERKZ", "STRGR", "VRMOD", "VINT1", "VINT2", "MISKZ", "ALTSL", "SBDKZ",
  "SFEPR", "AHDIS", "SAUFT", "RGEKZ", "FRTME", "AUSME", "SFCPF", "FEVOR", "UEETK", "UNETO",
  "UEETO", "ZQUAL", "TEMPB", "RAUBE", "MHDRZ", "MHDHB", "IPRKZ", "DISKZ", "XMCNG", "BKLAS",
  "BWTTY", "MLMAA", "MLAST", "VPRSV", "STPRS", "VERPR", "PEINH_1", "HRKFT", "MTORG", "KOSGR",
  "EKALR", "PRCTR", "SOBSK", "LOSGR", "PLNDPRICE1", "PLNDPRDATE1", "KLART", "CLASS", "MNAME_1", "MNAME_2",
  "MNAME_3", "MNAME_4", "MNAME_5", "MNAME_6", "MNAME_7", "MNAME_8", "MNAME_9", "MNAME_10", "MNAME_11", "MNAME_12",
  "MNAME_13", "MNAME_14", "MNAME_15", "MNAME_16", "MNAME_17", "MNAME_18", "MNAME_19", "MNAME_20", "MWERT_1", "MWERT_2",
  "MWERT_3", "MWERT_4", "MWERT_5", "MWERT_6", "MWERT_7", "MWERT_8", "MWERT_9", "MWERT_10", "MWERT_11", "MWERT_12",
  "MWERT_13", "MWERT_14", "MWERT_15", "MWERT_16", "MWERT_17", "MWERT_18", "MWERT_19", "MWERT_20",
];

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
  downloadSelectedExcel: () => void; // ⚡ 이름 변경 (Csv -> Excel)
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

      setRequests: (newRequests) => set((state) => {
        const commentMap = new Map<string, any[]>();
        state.requests.forEach(req => {
          if (req.comments && req.comments.length > 0) {
            commentMap.set(req.id, req.comments);
          }
        });

        const mergedRequests = newRequests.map(req => ({
          ...req,
          comments: commentMap.get(req.id) || [] 
        }));

        return { requests: mergedRequests };
      }),

      setComments: (requestId, comments) => set((state) => ({
        requests: state.requests.map(req => req.id === requestId ? { ...req, comments } : req),
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

      createNewRequest: () => set((state) => ({ 
        currentRequest: {
            id: 'new', 
            status: 'Requested',
            requesterName: state.currentUser?.name || '',
            createdAt: new Date().toISOString(),
            data: {},
            comments: []
        } 
      })),

      toggleSelection: (id) => set((state) => ({
        selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter(sid => sid !== id) : [...state.selectedIds, id]
      })),
      toggleAllSelection: (ids) => set({ selectedIds: ids }),

      // ⚡ 엑셀 다운로드 (탭 분리) 구현
      downloadSelectedExcel: () => {
        const { requests, selectedIds } = get();
        const targets = requests.filter(r => selectedIds.includes(r.id));
        if (targets.length === 0) {
          alert("다운로드할 항목을 선택해주세요.");
          return;
        }

        // 1. 기본 정보 시트 데이터 생성
        const headerRow = SAP_EXPORT_ORDER; // SAP 필드명 헤더
        const mainDataRows = targets.map(req => {
          return SAP_EXPORT_ORDER.map(col => {
            if (col === 'CLASS') return 'ZMM001';
            const mnameMatch = col.match(/^MNAME_(\d+)$/);
            if (mnameMatch) {
                const index = parseInt(mnameMatch[1]);
                const paddedIndex = String(index).padStart(3, '0');
                return `ZMMC${paddedIndex}`;
            }
            return req.data[col] || '';
          });
        });
        const ws1 = XLSX.utils.aoa_to_sheet([headerRow, ...mainDataRows]);

        // 2. 환산단위(추가데이터) 시트 데이터 생성
        const extraHeader = ["자재코드", "환산단위", "환산분자", "환산분모", "병렬단위Type"];
        const extraDataRows = targets.map(req => {
          return [
            req.data.MATNR || '',           // 자재코드 (매핑용)
            req.data.EXTRA_MEINH || '',     // 환산단위
            req.data.EXTRA_UMREZ || '',     // 환산분자
            req.data.EXTRA_UMREN || '1',    // 환산분모
            req.data.EXTRA_EWMCW || ''      // 병렬단위Type
          ];
        });
        const ws2 = XLSX.utils.aoa_to_sheet([extraHeader, ...extraDataRows]);

        // 3. 워크북 생성 및 시트 추가
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws1, "기본정보");
        XLSX.utils.book_append_sheet(wb, ws2, "환산단위");

        // 4. 파일 다운로드
        const dateStr = new Date().toISOString().slice(0,19).replace(/:/g,'');
        XLSX.writeFile(wb, `SAP_Upload_${dateStr}.xlsx`);
      },
    }),
    {
      name: 'mdm-storage', 
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);