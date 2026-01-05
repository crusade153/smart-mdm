// src/components/mdm/HierarchySelector.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_HIERARCHY } from "@/lib/mock-data"
import { PlusCircle, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

interface Props {
  value?: string;
  onChange: (value: string) => void;
  onRequestNew?: (reason: string) => void; // ✅ 신규 요청 콜백 추가
}

export function HierarchySelector({ value, onChange, onRequestNew }: Props) {
  const [l1, setL1] = useState("")
  const [l2, setL2] = useState("")
  const [l3, setL3] = useState("")
  const [l4, setL4] = useState("")
  
  // 신규 요청 팝업 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRequestText, setNewRequestText] = useState("")

  // 목록 필터링 로직 (중복 제거)
  const l1List = Array.from(new Set(MOCK_HIERARCHY.map(row => JSON.stringify({ code: row[0], name: row[1] })))).map((str: any) => JSON.parse(str));
  const l2List = l1 ? Array.from(new Set(MOCK_HIERARCHY.filter(row => row[0] === l1).map(row => JSON.stringify({ code: row[2], name: row[3] })))).map((str: any) => JSON.parse(str)) : [];
  const l3List = l2 ? Array.from(new Set(MOCK_HIERARCHY.filter(row => row[2] === l2).map(row => JSON.stringify({ code: row[4], name: row[5] })))).map((str: any) => JSON.parse(str)) : [];
  const l4List = l3 ? Array.from(new Set(MOCK_HIERARCHY.filter(row => row[4] === l3).map(row => JSON.stringify({ code: row[6], name: row[7] })))).map((str: any) => JSON.parse(str)) : [];

  useEffect(() => {
    if (l1 && l2 && l3 && l4) onChange(`${l1}${l2}${l3}${l4}`);
  }, [l1, l2, l3, l4, onChange]);

  const handleNewRequest = () => {
    if (newRequestText.trim() && onRequestNew) {
      onRequestNew(`📂 [계층구조 신규 요청] ${newRequestText}`);
      setNewRequestText("");
      setIsDialogOpen(false);
    }
  }

  return (
    <div className="space-y-2 p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
      <div className="flex gap-2">
        <Select value={l1} onValueChange={(v) => { setL1(v); setL2(""); setL3(""); setL4(""); }}><SelectTrigger className="bg-white"><SelectValue placeholder="1단계" /></SelectTrigger><SelectContent>{l1List.map((item:any)=><SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}</SelectContent></Select>
        <Select value={l2} onValueChange={(v) => { setL2(v); setL3(""); setL4(""); }} disabled={!l1}><SelectTrigger className="bg-white"><SelectValue placeholder="2단계" /></SelectTrigger><SelectContent>{l2List.map((item:any)=><SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="flex gap-2">
        <Select value={l3} onValueChange={(v) => { setL3(v); setL4(""); }} disabled={!l2}><SelectTrigger className="bg-white"><SelectValue placeholder="3단계" /></SelectTrigger><SelectContent>{l3List.map((item:any)=><SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}</SelectContent></Select>
        <Select value={l4} onValueChange={setL4} disabled={!l3}><SelectTrigger className="bg-white"><SelectValue placeholder="4단계" /></SelectTrigger><SelectContent>{l4List.map((item:any)=><SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="flex justify-between items-center pt-1">
        <div className="text-xs font-mono text-slate-500">{value ? `Code: ${value}` : ''}</div>
        
        {/* 신규 요청 다이얼로그 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-100 p-0 px-2">
              <PlusCircle size={12} className="mr-1"/> 찾는 계층구조가 없다면?
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신규 계층구조 생성 요청</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="예: 3단계 '매운맛 라면' 추가해주세요." 
                value={newRequestText}
                onChange={(e) => setNewRequestText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleNewRequest} className="bg-indigo-600">요청하기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}