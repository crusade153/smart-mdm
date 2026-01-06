"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Database, LayoutTemplate, Share2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="h-screen w-full bg-white flex flex-col selection:bg-indigo-100 font-sans relative overflow-hidden">
      
      {/* 1. 배경 아트워크 (고급스러운 분위기) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-gradient-to-br from-indigo-50/80 to-purple-50/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-blue-50/80 to-slate-50/50 rounded-full blur-3xl opacity-60" />
      </div>

      {/* 2. 상단 헤더 */}
      <header className="h-20 flex items-center justify-between px-8 lg:px-20 w-full z-50 fixed top-0 bg-white/60 backdrop-blur-md border-b border-slate-100/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-bold text-white text-lg">M</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Smart MDM</span>
        </div>
        <div className="flex gap-3">
           <Link href="/login">
            <Button variant="ghost" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-medium px-5">
              로그인
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all duration-300 px-6">
              시작하기
            </Button>
          </Link>
        </div>
      </header>

      {/* 3. 메인 콘텐츠 (수직 중앙 정렬, 스크롤 없음) */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 z-10 w-full max-w-7xl mx-auto h-full pt-16">
        
        {/* 히어로 섹션 */}
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            기준 정보 관리, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              더 쉽고 완벽하게.
            </span>
          </h1>
          
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            데이터 정합성은 높이고, 업무 프로세스는 단순해집니다.<br/>
            하림산업을 위한 단 하나의 통합 플랫폼을 경험하세요.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 rounded-full bg-slate-900 hover:bg-indigo-600 text-white text-lg font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 gap-3 group">
                지금 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 하단 기능 요약 (카드형, 화면 하단 배치) */}
        <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          
          {/* Card 1 */}
          <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-100 hover:bg-white transition-all duration-300 cursor-default flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <LayoutTemplate size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">데이터 표준화</h3>
            <p className="text-sm text-slate-500 leading-snug">
              필수값 자동 검증과 입력 표준을 통해<br/>휴먼 에러를 원천 차단합니다.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-purple-100 hover:bg-white transition-all duration-300 cursor-default flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Share2 size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">실시간 협업</h3>
            <p className="text-sm text-slate-500 leading-snug">
              요청부터 승인, 채번까지의 과정을<br/>실시간으로 투명하게 공유합니다.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-100 hover:bg-white transition-all duration-300 cursor-default flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Database size={24} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">SAP 연동</h3>
            <p className="text-sm text-slate-500 leading-snug">
              승인 완료된 마스터 데이터를<br/>즉시 SAP 포맷으로 변환합니다.
            </p>
          </div>

        </div>
      </main>

      {/* 4. 푸터 */}
      <footer className="absolute bottom-6 w-full text-center pointer-events-none">
        <p className="text-slate-400 text-xs font-medium tracking-wide">
          © 2025 HARIM INDUSTRY. All rights reserved.
        </p>
      </footer>
    </div>
  )
}