"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { getHierarchyAction, HierarchyItem } from "@/actions/mdm"

interface Props {
  value?: string;
  onChange: (value: string) => void;
  onRequestNew?: (reason: string) => void;
}

export function HierarchySelector({ value, onChange, onRequestNew }: Props) {
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 선택된 코드 상태 (L1~L4)
  const [l1, setL1] = useState("");
  const [l2, setL2] = useState("");
  const [l3, setL3] = useState("");
  const [l4, setL4] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequestText, setNewRequestText] = useState("");

  // 1. 컴포넌트 마운트 시 구글 시트 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getHierarchyAction();
      setHierarchyData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // 2. 계층별 필터링 로직 (Cascading)
  // useMemo를 사용하여 성능 최적화 (데이터가 변경될 때만 재계산)
  const l1List = useMemo(() => 
    hierarchyData.filter(item => item.level === 1), 
  [hierarchyData]);

  const l2List = useMemo(() => 
    hierarchyData.filter(item => item.level === 2 && item.parent === l1), 
  [hierarchyData, l1]);

  const l3List = useMemo(() => 
    hierarchyData.filter(item => item.level === 3 && item.parent === l2), 
  [hierarchyData, l2]);

  const l4List = useMemo(() => 
    hierarchyData.filter(item => item.level === 4 && item.parent === l3), 
  [hierarchyData, l3]);

  // 3. 선택 값이 변경될 때마다 부모 컴포넌트에 알림 (Concatenate)
  useEffect(() => {
    // 4단계까지 모두 선택되었을 때만 완성된 코드를 전달 (필요시 조건 완화 가능)
    // 현재 정책: 사용자가 선택한 값들을 이어 붙여서 전달
    if (l1) {
        const fullCode = `${l1}${l2}${l3}${l4}`;
        // 값이 실제로 변경되었을 때만 onChange 호출 (무한 루프 방지)
        if (value !== fullCode) {
            onChange(fullCode);
        }
    }
  }, [l1, l2, l3, l4, onChange, value]);

  // 4. 외부에서 value가 들어왔을 때 (예: 수정 모드) 역으로 상태 세팅하는 로직은
  // 계층구조 특성상 복잡하므로, 여기서는 '초기화' 로직만 간단히 유지하거나
  // 필요하다면 value를 파싱해서 l1~l4를 세팅하는 로직을 추가할 수 있습니다.
  // 현재는 단순 입력/선택 위주로 구현합니다.

  const handleNewRequest = () => {
    if (newRequestText.trim() && onRequestNew) {
      onRequestNew(`📂 [계층구조 신규 요청] ${newRequestText}`);
      setNewRequestText("");
      setIsDialogOpen(false);
    }
  }

  // 로딩 중일 때 표시
  if (loading) {
    return (
        <div className="flex items-center gap-2 p-3 bg-slate-50 border rounded-lg text-xs text-slate-500">
            <Loader2 className="animate-spin h-4 w-4" /> 데이터 불러오는 중...
        </div>
    )
  }

  return (
    <div className="space-y-2 p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
      <div className="flex gap-2">
        {/* 1단계 선택 */}
        <Select value={l1} onValueChange={(v) => { setL1(v); setL2(""); setL3(""); setL4(""); }}>
            <SelectTrigger className="bg-white">
                <SelectValue placeholder="1단계 (대분류)" />
            </SelectTrigger>
            <SelectContent>
                {l1List.map((item) => (
                    <SelectItem key={item.code} value={item.code}>[{item.code}] {item.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>

        {/* 2단계 선택 (1단계 선택 시 활성화) */}
        <Select value={l2} onValueChange={(v) => { setL2(v); setL3(""); setL4(""); }} disabled={!l1 || l2List.length === 0}>
            <SelectTrigger className="bg-white">
                <SelectValue placeholder="2단계 (중분류)" />
            </SelectTrigger>
            <SelectContent>
                {l2List.map((item) => (
                    <SelectItem key={item.code} value={item.code}>[{item.code}] {item.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        {/* 3단계 선택 (2단계 선택 시 활성화) */}
        <Select value={l3} onValueChange={(v) => { setL3(v); setL4(""); }} disabled={!l2 || l3List.length === 0}>
            <SelectTrigger className="bg-white">
                <SelectValue placeholder="3단계 (소분류)" />
            </SelectTrigger>
            <SelectContent>
                {l3List.map((item) => (
                    <SelectItem key={item.code} value={item.code}>[{item.code}] {item.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>

        {/* 4단계 선택 (3단계 선택 시 활성화) */}
        <Select value={l4} onValueChange={setL4} disabled={!l3 || l4List.length === 0}>
            <SelectTrigger className="bg-white">
                <SelectValue placeholder="4단계 (세분류)" />
            </SelectTrigger>
            <SelectContent>
                {l4List.map((item) => (
                    <SelectItem key={item.code} value={item.code}>[{item.code}] {item.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center pt-1">
        <div className="text-xs font-mono text-slate-500">
            {value ? `Code: ${value}` : '선택된 코드 없음'}
        </div>
        
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