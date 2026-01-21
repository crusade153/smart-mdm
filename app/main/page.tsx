"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useMDMStore } from "@/stores/useMDMStore"
import { MDMForm } from "@/components/mdm/MDMForm"
import { RequestTable } from "@/components/mdm/RequestTable"
import { LogOut, User, RefreshCw, Loader2, BookOpen } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { getRequestsAction } from "@/actions/mdm" 

export default function MainPage() {
  const router = useRouter()
  const { isLoggedIn, currentUser, logout, setRequests, currentRequest } = useMDMStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 데이터 로드
  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const data = await getRequestsAction();
      setRequests(data);
      console.log("✅ 데이터 최신화 완료");
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, [setRequests]);

  // 초기 진입 체크
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return; 
    }
    loadData();
  }, [isLoggedIn, router, loadData])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleManualRefresh = async () => {
    await loadData(true);
  }

  const openManual = () => {
    window.open('/manual', '_blank');
  }

  if (!isLoggedIn) return null

  // 📱 모바일 상태 확인 (선택된 요청이 있으면 폼 화면, 없으면 목록 화면)
  const showMobileForm = !!currentRequest;

  return (
    <main className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden text-slate-900 font-sans">
      
      {/* 🟢 헤더 영역 */}
      <div className="h-14 bg-slate-900 text-white flex items-center px-4 shadow-md shrink-0 justify-between z-20">
        <div className="flex items-center gap-3 select-none">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-lg">M</div>
          <span className="font-bold text-lg tracking-tight">
            Smart MDM <span className="hidden md:inline text-xs font-normal opacity-70">| Enterprise Edition</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-slate-800 gap-2"
            onClick={openManual}
          >
            <BookOpen size={16} />
            <span className="hidden md:inline text-xs font-medium">사용설명서</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-slate-300 hover:text-white hover:bg-slate-800 gap-2 ${isRefreshing ? 'cursor-not-allowed opacity-80' : ''}`}
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16} />}
            <span className="hidden md:inline text-xs font-medium">{isRefreshing ? "동기화 중..." : "새로고침"}</span>
          </Button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden md:block"></div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-sm bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <User size={14} className="text-indigo-400"/>
              <span className="font-semibold text-slate-200">{currentUser?.name}</span>
            </div>
            
            {currentUser?.isAdmin && (
                <Button variant="ghost" size="sm" className="hidden md:flex text-xs text-slate-300 hover:text-white" onClick={() => router.push('/admin')}>
                    관리자
                </Button>
            )}
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 w-8 h-8" onClick={handleLogout} title="로그아웃">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* 🟢 메인 레이아웃 (Standard Flexbox 구조로 겹침 방지) */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* 1. 목록 영역 (Left Pane)
           - 모바일: showMobileForm이 true면 숨김
           - PC(md 이상): 항상 보임 (너비 320~360px 고정)
        */}
        <div className={`
            h-full shadow-xl z-10 bg-white border-r border-slate-200 flex-col shrink-0
            ${showMobileForm ? 'hidden md:flex' : 'flex w-full'} 
            md:w-[320px] lg:w-[360px]
        `}>
          <RequestTable />
        </div>

        {/* 2. 상세 폼 영역 (Center Pane) 
           - 모바일: showMobileForm이 true면 보임
           - PC(md 이상): 항상 보임 (남은 공간 flex-1 채움)
           - min-w-0: 내용이 많아도 레이아웃을 깨지 않도록 방지
        */}
        <div className={`
            h-full bg-slate-50 relative overflow-hidden flex-col min-w-0
            ${showMobileForm ? 'flex w-full' : 'hidden md:flex md:flex-1'}
        `}>
          <div className="w-full h-full flex flex-col">
            <MDMForm />
          </div>
        </div>

      </div>
    </main>
  )
}