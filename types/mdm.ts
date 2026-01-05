// src/types/mdm.ts

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
  status: RequestStatus;
  requesterName: string;  // ✅ requesterEmail 대신 Name만 사용하도록 통일
  processorName?: string; // 처리자 (완료자)
  createdAt: string;
  completedAt?: string;   // 완료일
  data: SapMasterData;
  comments: {
    writer: string;
    message: string;
    createdAt: string;
  }[];
}