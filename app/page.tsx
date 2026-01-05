// src/app/page.tsx
"use client" // Client Component 선언 필수

import { MDMForm } from "@/components/mdm/MDMForm";
import { RequestTable } from "@/components/mdm/RequestTable";

export default function Home() {
  return (
    <main className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden">
      
      {/* 1. 글로벌 헤더 (고정) */}
      <div className="h-14 bg-slate-900 text-white flex items-center px-6 shadow-md shrink-0 justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-lg">M</div>
          <span className="font-bold text-lg tracking-tight">Smart MDM <span className="text-xs font-normal opacity-70">| Enterprise Edition</span></span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
        </div>
      </div>

      {/* 2. 메인 작업 영역 (좌:리스트 / 우:폼) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* [좌측] 요청 목록 리스트 (고정 너비 400px) */}
        <div className="w-[400px] h-full shadow-xl z-10 bg-white">
          <RequestTable />
        </div>

        {/* [우측] 상세 입력 및 채팅 폼 (나머지 전체) */}
        <div className="flex-1 h-full bg-slate-50/50 relative overflow-hidden">
          {/* MDMForm 내부에서 스크롤 처리됨 */}
          <div className="absolute inset-0">
            <MDMForm />
          </div>
        </div>

      </div>
    </main>
  );
}