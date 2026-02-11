"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMDMStore } from "@/stores/useMDMStore"
import { Button } from "@/components/ui/button"
import { 
  LogOut, User, Home, MessageCircle, Menu, Bell, Settings, BookOpen, Users 
} from "lucide-react"
import { useEffect, useState } from "react"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isLoggedIn } = useMDMStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 로그인 체크
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!isLoggedIn && typeof window !== 'undefined') {
            router.replace('/login');
        }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* 🟢 GNB: 상단 고정 네비게이션 */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm px-4 md:px-6 flex items-center justify-between shrink-0">
        
        {/* 좌측: 로고 및 메인 메뉴 */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-md group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-lg">M</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800 hidden md:block">Smart MDM</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className={`text-sm font-medium ${pathname.startsWith('/dashboard') || pathname.startsWith('/request') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900'}`}>
                <Home size={16} className="mr-2"/> 홈
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="ghost" size="sm" className={`text-sm font-medium ${pathname.startsWith('/community') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900'}`}>
                <MessageCircle size={16} className="mr-2"/> 커뮤니티
              </Button>
            </Link>
          </nav>
        </div>

        {/* 우측: 유틸리티 및 사용자 메뉴 */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* 💡 [복구] 사용설명서 버튼 */}
          <Button variant="ghost" size="sm" className="hidden md:flex text-slate-500 hover:text-indigo-600 gap-2" onClick={() => window.open('/manual', '_blank')}>
            <BookOpen size={16} /> <span className="text-xs">사용설명서</span>
          </Button>

          {/* 💡 [복구] 관리자 메뉴 (권한 체크) */}
          {currentUser?.isAdmin && (
             <Link href="/admin">
               <Button variant="ghost" size="sm" className={`hidden md:flex gap-2 ${pathname.startsWith('/admin') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-900'}`}>
                 <Users size={16} /> <span className="text-xs">회원승인</span>
               </Button>
             </Link>
          )}

          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-sm font-bold text-slate-800 leading-none">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-400 leading-none mt-1">{currentUser?.isAdmin ? '관리자' : '사용자'}</span>
            </div>
            
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <User size={16} className="text-slate-500"/>
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => { logout(); router.push('/login'); }} className="text-slate-400 hover:text-red-600 w-8 h-8">
              <LogOut size={16}/>
            </Button>
          </div>
        </div>
      </header>

      {/* 🟢 메인 컨텐츠 영역: 너비 제한 해제 (w-[98%] 적용) */}
      <main className="flex-1 w-[98%] mx-auto py-4 md:py-6 h-[calc(100vh-4rem)] flex flex-col">
        {children}
      </main>
    </div>
  )
}