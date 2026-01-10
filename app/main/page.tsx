"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMDMStore } from "@/stores/useMDMStore"
import { MDMForm } from "@/components/mdm/MDMForm"
import { RequestTable } from "@/components/mdm/RequestTable"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getRequestsAction } from "@/actions/mdm" 

export default function MainPage() {
  const router = useRouter()
  const { isLoggedIn, currentUser, logout, setRequests } = useMDMStore()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    } else {
      // DB에서 목록 불러오기
      const loadData = async () => {
        const data = await getRequestsAction();
        setRequests(data);
      };
      loadData();
    }
  }, [isLoggedIn, router, setRequests])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isLoggedIn) return null

  return (
    <main className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden">
      
      {/* 글로벌 헤더 */}
      <div className="h-14 bg-slate-900 text-white flex items-center px-6 shadow-md shrink-0 justify-between z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-lg">M</div>
          <span className="font-bold text-lg tracking-tight">Smart MDM <span className="text-xs font-normal opacity-70">| Enterprise Edition</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <User size={14} className="text-indigo-400"/>
              <span className="font-semibold text-slate-200">{currentUser?.name}</span>
              <span className="text-xs text-slate-500">({currentUser?.id})</span>
            </div>
            {/* 관리자라면 승인 페이지로 가는 버튼 추가 가능 */}
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
          <RequestTable />
        </div>
        <div className="flex-1 h-full bg-slate-50/50 relative overflow-hidden">
          <div className="absolute inset-0">
            <MDMForm />
          </div>
        </div>
      </div>
    </main>
  )
}