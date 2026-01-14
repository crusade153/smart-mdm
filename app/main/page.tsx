"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useMDMStore } from "@/stores/useMDMStore"
import { MDMForm } from "@/components/mdm/MDMForm"
import { RequestTable } from "@/components/mdm/RequestTable"
import { LogOut, User, RefreshCw, Loader2 } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { getRequestsAction } from "@/actions/mdm" 

export default function MainPage() {
  const router = useRouter()
  const { isLoggedIn, currentUser, logout, setRequests } = useMDMStore()
  const [isRefreshing, setIsRefreshing] = useState(false) // 새로고침 상태 관리

  // 1. 데이터 불러오기 함수
  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      // 서버 액션을 호출하여 구글 시트에서 최신 데이터를 가져옵니다.
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

  // 2. 초기 실행 (페이지 접속 시 1회만 실행)
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return; 
    }

    // 접속하자마자 한 번 불러오기
    loadData();

    // ❌ [삭제됨] 5초마다 자동 갱신하던 코드를 제거하여 속도 문제를 해결했습니다.
    
  }, [isLoggedIn, router, loadData])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // 3. 수동 새로고침 핸들러 (버튼 클릭 시 실행)
  const handleManualRefresh = async () => {
    await loadData(true); // 로딩 표시 켜고 데이터 불러오기
    // 데이터 로드가 끝나면(await 완료 후) 알림은 굳이 안 띄워도 버튼 멈춤으로 알 수 있으나,
    // 확실한 피드백을 위해 남겨두셔도 됩니다. 여기서는 깔끔함을 위해 생략합니다.
  }

  if (!isLoggedIn) return null

  return (
    <main className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden">
      
      {/* 글로벌 헤더 */}
      <div className="h-14 bg-slate-900 text-white flex items-center px-6 shadow-md shrink-0 justify-between z-20">
        
        {/* 로고 영역 */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-lg">M</div>
          <span className="font-bold text-lg tracking-tight">Smart MDM <span className="text-xs font-normal opacity-70">| Enterprise Edition</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 새로고침 버튼 (수동 동기화) */}
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-slate-300 hover:text-white hover:bg-slate-800 gap-2 ${isRefreshing ? 'cursor-not-allowed opacity-80' : ''}`}
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16} />}
            <span className="text-xs font-medium">{isRefreshing ? "동기화 중..." : "새로고침"}</span>
          </Button>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <User size={14} className="text-indigo-400"/>
              <span className="font-semibold text-slate-200">{currentUser?.name}</span>
              <span className="text-xs text-slate-500">({currentUser?.id})</span>
            </div>
            {currentUser?.isAdmin && (
                <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white" onClick={() => router.push('/admin')}>
                    관리자
                </Button>
            )}
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 w-8 h-8" onClick={handleLogout} title="로그아웃">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 작업 영역 */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[400px] h-full shadow-xl z-10 bg-white">
          {/* 목록 컴포넌트 */}
          <RequestTable />
        </div>
        <div className="flex-1 h-full bg-slate-50/50 relative overflow-hidden">
          <div className="absolute inset-0">
            {/* 폼 컴포넌트: 
              여기서 '저장'을 누르면 내부적으로 refreshData를 호출하여
              자동으로 목록을 갱신하므로 별도 처리가 필요 없습니다.
            */}
            <MDMForm />
          </div>
        </div>
      </div>
    </main>
  )
}