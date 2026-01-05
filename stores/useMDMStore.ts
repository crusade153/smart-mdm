// src/stores/useMDMStore.ts
import { create } from 'zustand';
import { MaterialRequest, SapMasterData, RequestStatus } from '@/types/mdm';

// SAP 필드 순서 (CSV 다운로드용)
const SAP_EXPORT_ORDER = [
  "WERKS","MTART","MAKTX","MATNR","MEINS","MATKL","PRDHA","SPART","NTGEW","GEWEI",
  "MEINH","UMREZ","UMREN","EAN11","VRKME","DISPO","DISMM","LGFSB","BESKZ","LGPRO"
];

interface MDMState {
  requests: MaterialRequest[];
  currentRequest: MaterialRequest | null;
  selectedIds: string[]; // 체크된 항목 ID들

  addRequest: (data: SapMasterData) => void;
  updateRequest: (id: string, data: Partial<SapMasterData>) => void;
  updateStatus: (id: string, status: RequestStatus) => void;
  addComment: (requestId: string, message: string, writer: string) => void;
  setCurrentRequest: (request: MaterialRequest | null) => void;
  
  // ✅ [핵심] 이 부분이 없어서 에러가 났었습니다! 추가 완료
  createNewRequest: () => void; 

  toggleSelection: (id: string) => void;
  toggleAllSelection: (ids: string[]) => void;
  downloadSelectedCsv: () => void;
}

// 더미 데이터 생성 함수
const generateDummyData = () => {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: `REQ-${20250000 + i}`,
    status: i % 5 === 0 ? 'Approved' : i % 3 === 0 ? 'Review' : 'Requested',
    requesterName: i % 2 === 0 ? '김담당' : '이대리',
    createdAt: new Date(2025, 0, i + 1).toISOString(),
    data: { 
      WERKS: '1021', MTART: 'FERT', 
      MAKTX: `테스트 자재 품명 ${i + 1}`, 
      MATNR: i % 5 === 0 ? `50000${i}` : '-', 
      MEINS: 'EA', MATKL: '1001', PRDHA: '01010101', 
      SPART: '00', NTGEW: 100 + i, GEWEI: 'G' 
    } as SapMasterData,
    comments: []
  } as MaterialRequest));
};

export const useMDMStore = create<MDMState>((set, get) => ({
  requests: generateDummyData(),
  currentRequest: null,
  selectedIds: [],

  addRequest: (data) => set((state) => ({
    requests: [{
      id: `REQ-${Date.now()}`,
      status: 'Requested',
      requesterName: '나(Me)',
      createdAt: new Date().toISOString(),
      data, comments: []
    }, ...state.requests],
    currentRequest: null 
  })),

  updateRequest: (id, data) => set((state) => ({
    requests: state.requests.map(req => req.id === id ? { ...req, data: { ...req.data, ...data } } : req),
    // 현재 보고 있는 요청이라면 그것도 업데이트 (화면 즉시 반영)
    currentRequest: state.currentRequest?.id === id 
      ? { ...state.currentRequest, data: { ...state.currentRequest.data, ...data } } 
      : state.currentRequest
  })),

  updateStatus: (id, status) => set((state) => ({
    requests: state.requests.map(req => req.id === id ? { ...req, status } : req)
  })),

  addComment: (requestId, message, writer) => set((state) => ({
    requests: state.requests.map(req => req.id === requestId ? { ...req, comments: [...req.comments, { writer, message, createdAt: new Date().toISOString() }] } : req),
    currentRequest: state.currentRequest?.id === requestId 
      ? { ...state.currentRequest, comments: [...state.currentRequest.comments, { writer, message, createdAt: new Date().toISOString() }] }
      : state.currentRequest
  })),

  setCurrentRequest: (request) => set({ currentRequest: request }),

  // ✅ [핵심] 신규 작성 기능 구현 (현재 선택을 null로 만들어서 폼을 비움)
  createNewRequest: () => set({ currentRequest: null }),

  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(sid => sid !== id)
      : [...state.selectedIds, id]
  })),

  toggleAllSelection: (ids) => set({ selectedIds: ids }),

  downloadSelectedCsv: () => {
    const { requests, selectedIds } = get();
    // 선택된 항목들만 필터링
    const targets = requests.filter(r => selectedIds.includes(r.id));

    if (targets.length === 0) {
      alert("다운로드할 항목을 선택해주세요.");
      return;
    }

    const header = SAP_EXPORT_ORDER.join(',');
    const rows = targets.map(req => {
      return SAP_EXPORT_ORDER.map(col => {
        const val = req.data[col] || '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SAP_Upload_${new Date().toISOString().slice(0,19).replace(/:/g,'')}.csv`;
    link.click();
  }
}));