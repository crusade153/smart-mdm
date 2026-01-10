"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMDMStore } from "@/stores/useMDMStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock, Mail, User, ShieldCheck } from "lucide-react"
import { loginAction, registerAction } from "@/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const { setLoginUser } = useMDMStore() 
  
  const [loginId, setLoginId] = useState("")
  const [loginPw, setLoginPw] = useState("")

  const [regId, setRegId] = useState("")
  const [regPw, setRegPw] = useState("")
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await loginAction(loginId, loginPw);
    
    if (result.success && result.user) {
      setLoginUser(result.user);
      router.push("/main");
    } else {
      alert(result.message);
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await registerAction(regId, regPw, regName, regEmail);
    
    if (result.success) {
        alert(result.message);
        setRegId(""); setRegPw(""); setRegName(""); setRegEmail("");
    } else {
        alert(result.message);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">Smart MDM</CardTitle>
          <CardDescription>하림산업 마스터 데이터 관리 시스템</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="register">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="id">아이디</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="id" placeholder="아이디를 입력하세요" className="pl-9" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="password" type="password" placeholder="비밀번호를 입력하세요" className="pl-9" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">로그인</Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-id">아이디</Label>
                    <Input id="reg-id" placeholder="ID" value={regId} onChange={(e) => setRegId(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">이름</Label>
                    <Input id="reg-name" placeholder="홍길동" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="reg-email" type="email" placeholder="example@harim.com" className="pl-9" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pw">비밀번호</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="reg-pw" type="password" placeholder="비밀번호 설정" className="pl-9" value={regPw} onChange={(e) => setRegPw(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 mt-2">회원가입 신청</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6 pb-2">
          <p className="text-xs text-slate-400 text-center">Enterprise Edition v1.0 <br/> © 2025 Harim Foods. All rights reserved.</p>
        </CardFooter>
      </Card>
    </div>
  )
}