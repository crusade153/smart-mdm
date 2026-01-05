// src/stores/useMDMStore.ts
import { create } from 'zustand';
import { MaterialRequest, SapMasterData, RequestStatus } from '@/types/mdm';

// SAP 필드 순서 (CSV용)
const SAP_EXPORT_ORDER = [
  "WERKS","MTART","MAKTX","MATNR","MEINS","MATKL","PRDHA","SPART","NTGEW","GEWEI",
  "MEINH","UMREZ","UMREN","EAN11","VRKME","DISPO","DISMM","LGFSB","BESKZ","LGPRO"
];

interface MDMState {
  requests: MaterialRequest[];
  currentRequest: MaterialRequest | null;
  selectedIds: string[]; // ✅ 체크된 항목 ID들

  addRequest: (data: SapMasterData) => void;
  updateRequest: (id: string, data: Partial<SapMasterData>) => void;
  updateStatus: (id: string, status: RequestStatus) => void;
  addComment: (requestId: string, message: string, writer: string) => void;
  setCurrentRequest: (request: MaterialRequest | null) => void;
  
  toggleSelection: (id: string) => void; // ✅ 체크박스 토글
  toggleAllSelection: (ids: string[]) => void; // ✅ 전체 선택
  downloadSelectedCsv: () => void; // ✅ 선택된 것만 다운로드
}

// 더미 데이터 (50건 생성)
const generateDummyData = () => {
  return Array.from({ length: 50 }).map((_, i) => ({
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
    currentRequest: null // 저장 후 닫기
  })),

  updateRequest: (id, data) => set((state) => ({
    requests: state.requests.map(req => req.id === id ? { ...req, data: { ...req.data, ...data } } : req),
    currentRequest: null // 저장 후 닫기
  })),

  updateStatus: (id, status) => set((state) => ({
    requests: state.requests.map(req => req.id === id ? { ...req, status } : req)
  })),

  addComment: (requestId, message, writer) => set((state) => ({
    requests: state.requests.map(req => req.id === requestId ? { ...req, comments: [...req.comments, { writer, message, createdAt: new Date().toISOString() }] } : req),
    // 현재 열려있는 상세창에도 반영
    currentRequest: state.currentRequest?.id === requestId 
      ? { ...state.currentRequest, comments: [...state.currentRequest.comments, { writer, message, createdAt: new Date().toISOString() }] }
      : state.currentRequest
  })),

  setCurrentRequest: (request) => set({ currentRequest: request }),

  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(sid => sid !== id)
      : [...state.selectedIds, id]
  })),

  toggleAllSelection: (ids) => set({ selectedIds: ids }),

  downloadSelectedCsv: () => {
    const { requests, selectedIds } = get();
    // 체크된 것들 중 '완료(Approved)' 상태인 것만 필터링
    const targets = requests.filter(r => selectedIds.includes(r.id) && r.status === 'Approved');

    if (targets.length === 0) {
      alert("다운로드할 항목이 없습니다. (체크박스 선택 및 '완료' 상태 확인)");
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